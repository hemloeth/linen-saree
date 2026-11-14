import test from "node:test";
import assert from "node:assert/strict";

/**
 * Controller query simulation matching saree-backend getAllProducts implementation
 */
function simulateGetAllProducts(allProductsInDb, query = {}) {
  const {
    inStock,
    page = 1,
    limit = 32,
    priceMin,
    priceMax,
    sortBy = "featured",
  } = query;

  const andConditions = [];

  // Stock availability filter proposed for backend
  if (inStock !== undefined) {
    if (inStock === "true" || inStock === true || inStock === "1") {
      andConditions.push((p) => typeof p.stock === "number" && p.stock > 0);
    } else if (inStock === "false" || inStock === false || inStock === "0") {
      andConditions.push((p) => typeof p.stock === "number" && p.stock <= 0);
    }
  }

  // Price range filter
  if (priceMin !== undefined && priceMin !== null && priceMin !== "") {
    const min = Number(priceMin);
    andConditions.push((p) => p.price >= min);
  }
  if (priceMax !== undefined && priceMax !== null && priceMax !== "") {
    const max = Number(priceMax);
    andConditions.push((p) => p.price <= max);
  }

  // Filter entire collection before pagination and counting (MongoDB $and match)
  const filtered = allProductsInDb.filter((p) =>
    andConditions.every((cond) => cond(p))
  );

  const totalProducts = filtered.length;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 32);
  const totalPages = Math.max(1, Math.ceil(totalProducts / limitNum));
  const skipNum = (pageNum - 1) * limitNum;

  // Pagination slice after global collection filtering
  const pagedProducts = filtered.slice(skipNum, skipNum + limitNum);

  return {
    products: pagedProducts,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalProducts,
      limit: limitNum,
    },
  };
}

test("In-Stock Filter Integration & Database Pagination Suite", async (t) => {
  // Generate mock database with 100 sarees (60 in stock, 40 out of stock)
  const mockDb = Array.from({ length: 100 }, (_, i) => ({
    id: `saree-${i + 1}`,
    name: `Pure Linen Saree ${i + 1}`,
    price: 1500 + (i % 5) * 1500, // 1500, 3000, 4500, 6000, 7500
    stock: i % 5 === 0 || i % 5 === 2 ? 0 : 5, // 40 items have stock 0, 60 have stock 5
  }));

  await t.test("1. When inStock is omitted, returns all 100 products across 4 pages without breaking legacy clients", () => {
    const res = simulateGetAllProducts(mockDb, { page: 1, limit: 32 });

    assert.equal(res.pagination.totalProducts, 100, "Total count is 100");
    assert.equal(res.pagination.totalPages, 4, "Total pages is ceil(100 / 32) = 4");
    assert.equal(res.products.length, 32, "Page 1 has exactly 32 products");
    assert.equal(
      res.products.some((p) => p.stock === 0),
      true,
      "Contains out of stock items when unfiltered"
    );
  });

  await t.test("2. When inStock=true, filters collection BEFORE pagination and countDocuments", () => {
    const resPage1 = simulateGetAllProducts(mockDb, { inStock: "true", page: 1, limit: 32 });

    assert.equal(resPage1.pagination.totalProducts, 60, "Total count is exactly 60 in-stock items");
    assert.equal(resPage1.pagination.totalPages, 2, "Total pages is ceil(60 / 32) = 2");
    assert.equal(resPage1.products.length, 32, "Page 1 is a COMPLETE 32-item page, not truncated");
    assert.equal(
      resPage1.products.every((p) => p.stock > 0),
      true,
      "Every product on page 1 is in stock"
    );

    const resPage2 = simulateGetAllProducts(mockDb, { inStock: "true", page: 2, limit: 32 });
    assert.equal(resPage2.products.length, 28, "Page 2 has remaining 28 in-stock items (32 + 28 = 60)");
    assert.equal(
      resPage2.products.every((p) => p.stock > 0),
      true,
      "Every product on page 2 is in stock"
    );
  });

  await t.test("3. When combined with price band, filters both attributes before pagination", () => {
    // Filter inStock=true and price >= 4000
    const res = simulateGetAllProducts(mockDb, {
      inStock: "true",
      priceMin: 4000,
      page: 1,
      limit: 32,
    });

    assert.equal(
      res.products.every((p) => p.stock > 0 && p.price >= 4000),
      true,
      "All returned items satisfy both inStock and priceMin"
    );
    assert.equal(
      res.pagination.totalProducts,
      mockDb.filter((p) => p.stock > 0 && p.price >= 4000).length
    );
  });
});
