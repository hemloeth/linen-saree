import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";

// ---------------------------------------------------------------------------
// 1. Portable Backend Root Resolution
// ---------------------------------------------------------------------------
function resolveBackendRoot() {
  if (process.env.SAREE_BACKEND_DIR && fs.existsSync(process.env.SAREE_BACKEND_DIR)) {
    return path.resolve(process.env.SAREE_BACKEND_DIR);
  }

  const candidateRelatives = [
    path.resolve(process.cwd(), "..", "..", "..", "Desktop", "handloomer", "saree-backend"),
    path.resolve(process.cwd(), "..", "..", "Desktop", "handloomer", "saree-backend"),
    path.resolve(process.cwd(), "..", "saree-backend"),
    path.resolve(process.cwd(), "..", "..", "saree-backend"),
    path.resolve(process.cwd(), "saree-backend"),
    path.resolve(process.env.USERPROFILE || "", "Desktop", "handloomer", "saree-backend"),
  ];

  for (const candidate of candidateRelatives) {
    if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, "controllers", "productController.js"))) {
      return candidate;
    }
  }

  // Walk upward from current directory
  let current = process.cwd();
  for (let i = 0; i < 5; i++) {
    const check1 = path.join(current, "saree-backend");
    const check2 = path.join(current, "handloomer", "saree-backend");
    if (fs.existsSync(path.join(check1, "controllers", "productController.js"))) return check1;
    if (fs.existsSync(path.join(check2, "controllers", "productController.js"))) return check2;
    current = path.dirname(current);
  }

  throw new Error("Unable to locate saree-backend directory via portable relative paths or SAREE_BACKEND_DIR");
}

const BACKEND_DIR = resolveBackendRoot();
const BACKEND_CONTROLLER_PATH = path.join(BACKEND_DIR, "controllers", "productController.js");
const BACKEND_MODEL_PATH = path.join(BACKEND_DIR, "models", "productModal.js");
const BACKEND_STORES_PATH = path.join(BACKEND_DIR, "config", "stores.js");

// ---------------------------------------------------------------------------
// 2. Mock Response Helper
// ---------------------------------------------------------------------------
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

test("Backend Controller Contract & Multi-Store Live Database Suite", async (t) => {
  // Dynamically load dependencies from the backend environment
  const dotenvModulePath = path.join(BACKEND_DIR, "node_modules", "dotenv", "lib", "main.js");
  const mongooseModulePath = path.join(BACKEND_DIR, "node_modules", "mongoose", "index.js");

  if (fs.existsSync(dotenvModulePath)) {
    const dotenv = (await import(pathToFileURL(dotenvModulePath).href)).default;
    dotenv.config({ path: path.join(BACKEND_DIR, ".env") });
  }

  const mongoose = (await import(pathToFileURL(mongooseModulePath).href)).default;
  const controllerModule = await import(pathToFileURL(BACKEND_CONTROLLER_PATH).href);
  const modelModule = await import(pathToFileURL(BACKEND_MODEL_PATH).href);
  const storesModule = await import(pathToFileURL(BACKEND_STORES_PATH).href);

  const productController = controllerModule.default;
  const Product = modelModule.default;
  const { STORES } = storesModule;

  // DEDICATED ISOLATED TEST DATABASE: strictly prevents modifying production MongoDB
  const TEST_MONGO_URI = process.env.TEST_MONGO_URI || (
    process.env.MONGO_URI ? process.env.MONGO_URI.replace(/\/([^\/?]+)(\?|$)/, '/$1_test$2') : null
  );

  assert.ok(TEST_MONGO_URI, "TEST_MONGO_URI or fallback test database URI must be available");
  assert.match(TEST_MONGO_URI, /_test|test/i, "Target URI must point to dedicated test database");

  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(TEST_MONGO_URI);
  }

  const suffix = Date.now().toString().slice(-6);
  const testCategory = `contract-test-${suffix}`;
  const createdIds = [];

  let pInStock;
  let pOutOfStock;

  try {
    pInStock = await Product.create({
      name: `Contract Linen Saree Available ${suffix}`,
      sku: `CNT-${suffix}-AVL`,
      category: testCategory,
      material: "Pure Linen",
      color: "Emerald Green",
      price: 2500,
      regularPrice: 3500,
      stock: 7,
      mainImage: "https://example.com/cnt-avail.jpg",
      galleryImages: [],
      isNewArrival: false,
      isOnSale: false,
      isFeatured: false,
      isBestSeller: false,
      shortDescription: "In stock contract test",
      tags: "linen, test",
      sareeSize: "5.5m",
      blouseSize: "0.8m",
      washCare: "Dry clean",
    });
    createdIds.push(pInStock._id);

    pOutOfStock = await Product.create({
      name: `Contract Linen Saree Sold Out ${suffix}`,
      sku: `CNT-${suffix}-SLD`,
      category: testCategory,
      material: "Pure Linen",
      color: "Indigo Blue",
      price: 4500,
      regularPrice: 5500,
      stock: 0,
      mainImage: "https://example.com/cnt-sold.jpg",
      galleryImages: [],
      isNewArrival: false,
      isOnSale: false,
      isFeatured: false,
      isBestSeller: false,
      shortDescription: "Sold out contract test",
      tags: "linen, test",
      sareeSize: "5.5m",
      blouseSize: "0.8m",
      washCare: "Dry clean",
    });
    createdIds.push(pOutOfStock._id);

    await t.test("1. Actual backend controller exports getAllProducts and getProductCardsByIds", () => {
      assert.equal(typeof productController.getAllProducts, "function", "getAllProducts is exported");
      assert.equal(typeof productController.getProductCardsByIds, "function", "getProductCardsByIds is exported");
    });

    await t.test("2. Legacy Handloomer request (omitted inStock) returns all products without filtering", async () => {
      const req = {
        query: { category: testCategory },
        headers: { "x-store-id": "handloomer" },
      };
      const res = mockRes();

      await productController.getAllProducts(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.pagination.totalProducts, 2, "Legacy query returns both in-stock and out-of-stock items");
      assert.ok(res.body.products.some((p) => p.sku === pInStock.sku), "In-stock product is returned");
      assert.ok(res.body.products.some((p) => p.sku === pOutOfStock.sku), "Out-of-stock product is returned");
    });

    await t.test("3. Actual controller applies inStock=true before pagination and countDocuments", async () => {
      const req = {
        query: { category: testCategory, inStock: "true" },
        headers: { "x-store-id": "linen" },
      };
      const res = mockRes();

      await productController.getAllProducts(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.pagination.totalProducts, 1, "inStock=true returns totalProducts=1");
      assert.equal(res.body.pagination.totalPages, 1);
      assert.equal(res.body.products.length, 1);
      assert.equal(res.body.products[0].sku, pInStock.sku);
      assert.ok(res.body.products.every((p) => p.stock > 0), "All returned products have stock > 0");
    });

    await t.test("4. Actual controller applies inStock=false for backordered/sold-out inventory", async () => {
      const req = {
        query: { category: testCategory, inStock: "false" },
      };
      const res = mockRes();

      await productController.getAllProducts(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.pagination.totalProducts, 1, "inStock=false returns totalProducts=1");
      assert.equal(res.body.products.length, 1);
      assert.equal(res.body.products[0].sku, pOutOfStock.sku);
      assert.ok(res.body.products.every((p) => p.stock <= 0), "All returned products have stock <= 0");
    });

    await t.test("5. Category and price range combinations execute accurately on actual controller", async () => {
      // Price range matching in-stock saree (2500 is between 2000 and 3000)
      const reqMatch = {
        query: { category: testCategory, inStock: "true", priceMin: "2000", priceMax: "3000" },
      };
      const resMatch = mockRes();
      await productController.getAllProducts(reqMatch, resMatch);

      assert.equal(resMatch.statusCode, 200);
      assert.equal(resMatch.body.pagination.totalProducts, 1);
      assert.equal(resMatch.body.products[0].sku, pInStock.sku);

      // Price range matching out-of-stock saree (4500 is between 4000 and 5000), but inStock=true requested
      const reqMismatch = {
        query: { category: testCategory, inStock: "true", priceMin: "4000", priceMax: "5000" },
      };
      const resMismatch = mockRes();
      await productController.getAllProducts(reqMismatch, resMismatch);

      assert.equal(resMismatch.statusCode, 200);
      assert.equal(resMismatch.body.pagination.totalProducts, 0, "No in-stock products in 4000-5000 range");
      assert.equal(resMismatch.body.products.length, 0);
    });

    await t.test("6. Server pagination and total page calculations reflect stock filtering", async () => {
      const reqPage1 = {
        query: { category: testCategory, inStock: "true", page: "1", limit: "1" },
      };
      const resPage1 = mockRes();
      await productController.getAllProducts(reqPage1, resPage1);

      assert.equal(resPage1.body.pagination.totalProducts, 1);
      assert.equal(resPage1.body.pagination.totalPages, 1);
      assert.equal(resPage1.body.products.length, 1);

      // Requesting page 2 when only 1 matching product exists returns 0 products but keeps totalProducts = 1
      const reqPage2 = {
        query: { category: testCategory, inStock: "true", page: "2", limit: "1" },
      };
      const resPage2 = mockRes();
      await productController.getAllProducts(reqPage2, resPage2);

      assert.equal(resPage2.body.pagination.totalProducts, 1);
      assert.equal(resPage2.body.pagination.totalPages, 1);
      assert.equal(resPage2.body.products.length, 0, "Page 2 is out of range");
    });

    await t.test("7. Stores configuration retains exact store IDs and isolates Handloomer settings", () => {
      assert.ok(STORES.handloomer, "handloomer store config exists");
      assert.ok(STORES.linen, "linen store config exists");
      assert.equal(STORES.linen.id, "linen", "linen store ID is locked to 'linen'");
      assert.equal(STORES.handloomer.id, "handloomer", "handloomer store ID is locked to 'handloomer'");

      // Confirm Handloomer settings are untouched
      assert.equal(STORES.handloomer.name, "Handloomer");
      assert.equal(STORES.handloomer.brandTitle, "MS HANDLOOM");
      assert.equal(STORES.handloomer.orderPrefix, "HL");
    });
  } finally {
    if (createdIds.length > 0) {
      await Product.deleteMany({ _id: { $in: createdIds } });
    }
    await mongoose.disconnect();
  }
});
