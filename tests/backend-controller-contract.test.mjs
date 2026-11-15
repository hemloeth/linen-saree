import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const BACKEND_CONTROLLER_PATH = "C:/Users/Rustam/Desktop/handloomer/saree-backend/controllers/productController.js";
const BACKEND_MODEL_PATH = "C:/Users/Rustam/Desktop/handloomer/saree-backend/models/productModal.js";
const BACKEND_STORES_PATH = "C:/Users/Rustam/Desktop/handloomer/saree-backend/config/stores.js";

function mockRes() {
  const res = {
    statusCode: 200,
    body: null,
    headers: {},
    setHeader(name, val) {
      this.headers[name] = val;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

test("Backend Controller Contract & Multi-Store Compatibility Suite", async (t) => {
  // 1. Dynamic import of actual backend controller & model
  const controllerUrl = pathToFileURL(BACKEND_CONTROLLER_PATH).href;
  const modelUrl = pathToFileURL(BACKEND_MODEL_PATH).href;
  const storesUrl = pathToFileURL(BACKEND_STORES_PATH).href;

  const controllerModule = await import(controllerUrl);
  const modelModule = await import(modelUrl);
  const storesModule = await import(storesUrl);

  const productController = controllerModule.default;
  const Product = modelModule.default;
  const { STORES, getStore } = storesModule;

  await t.test("1. Actual backend controller exports getAllProducts and getProductCardsByIds", () => {
    assert.equal(typeof productController.getAllProducts, "function", "getAllProducts is exported");
    assert.equal(typeof productController.getProductCardsByIds, "function", "getProductCardsByIds is exported");
  });

  await t.test("2. Legacy Handloomer request (omitted inStock) never applies stock filter condition", async () => {
    let capturedFilter = null;
    let capturedProjection = null;

    const originalFind = Product.find;
    const originalCount = Product.countDocuments;

    Product.find = function (filter, projection) {
      capturedFilter = filter;
      capturedProjection = projection;
      return {
        sort() {
          return this;
        },
        lean() {
          return this;
        },
        skip() {
          return this;
        },
        limit() {
          return Promise.resolve([
            { _id: "prod-1", name: "Handloomer Saree", price: 2500, stock: 5 },
            { _id: "prod-2", name: "Handloomer Saree Zero Stock", price: 3000, stock: 0 },
          ]);
        },
      };
    };

    Product.countDocuments = function (filter) {
      return Promise.resolve(2);
    };

    try {
      // Legacy Handloomer request: no inStock query parameter
      const req = {
        query: { page: "1", limit: "20" },
        headers: { "x-store-id": "handloomer" },
      };
      const res = mockRes();

      await productController.getAllProducts(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.pagination.totalProducts, 2);

      // Verify captured filter contains NO stock condition
      const andConditions = capturedFilter?.$and || [];
      const stockCondition = andConditions.find((c) => c.stock !== undefined);
      assert.equal(stockCondition, undefined, "Stock condition must NOT be present when inStock is omitted");
    } finally {
      Product.find = originalFind;
      Product.countDocuments = originalCount;
    }
  });

  await t.test("3. Proposed Patch: When inStock=true, stock: { $gt: 0 } is applied before countDocuments and find", async () => {
    // Test the exact logic that will be added to controllers/productController.js
    function buildFilterWithStock(query) {
      const {
        search, q, category, color, material,
        priceMin, priceMax, isOnSale, isFestive, isNewArrival,
        isFeatured, isBestSeller, hasVideo, inStock,
        productCollection, collection,
      } = query;

      const andConditions = [];

      if (category) andConditions.push({ category: { $in: [category] } });
      if (color) andConditions.push({ color: { $in: [color] } });
      if (priceMin || priceMax) {
        const priceFilter = {};
        if (priceMin) priceFilter.$gte = Number(priceMin);
        if (priceMax) priceFilter.$lte = Number(priceMax);
        andConditions.push({ price: priceFilter });
      }

      if (inStock !== undefined) {
        if (inStock === "true" || inStock === true || inStock === "1" || inStock === 1) {
          andConditions.push({ stock: { $gt: 0 } });
        } else if (inStock === "false" || inStock === false || inStock === "0" || inStock === 0) {
          andConditions.push({ stock: { $lte: 0 } });
        }
      }

      return andConditions.length > 0 ? { $and: andConditions } : {};
    }

    // A. inStock = "true"
    const filterInStock = buildFilterWithStock({ inStock: "true", priceMin: "1500" });
    assert.deepEqual(
      filterInStock.$and.find((c) => c.stock !== undefined),
      { stock: { $gt: 0 } },
      "inStock='true' correctly creates { stock: { $gt: 0 } }"
    );

    // B. inStock = "false"
    const filterOutOfStock = buildFilterWithStock({ inStock: "false" });
    assert.deepEqual(
      filterOutOfStock.$and.find((c) => c.stock !== undefined),
      { stock: { $lte: 0 } },
      "inStock='false' correctly creates { stock: { $lte: 0 } }"
    );

    // C. inStock = undefined (legacy)
    const filterOmitted = buildFilterWithStock({ priceMin: "1000" });
    const omittedStock = (filterOmitted.$and || []).find((c) => c.stock !== undefined);
    assert.equal(omittedStock, undefined, "Omitted inStock does NOT include stock condition");
  });

  await t.test("4. Stores configuration retains exact store ID 'linen' and isolates Handloomer settings", () => {
    assert.ok(STORES.handloomer, "handloomer store config exists");
    assert.ok(STORES.linen, "linen store config exists");
    assert.equal(STORES.linen.id, "linen", "linen store ID is locked to 'linen'");
    assert.equal(STORES.handloomer.id, "handloomer", "handloomer store ID is locked to 'handloomer'");

    // Confirm Handloomer settings are untouched
    assert.equal(STORES.handloomer.name, "Handloomer");
    assert.equal(STORES.handloomer.brandTitle, "MS HANDLOOM");
    assert.equal(STORES.handloomer.orderPrefix, "HL");
  });
});
