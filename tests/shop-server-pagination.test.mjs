import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

test("Shop Server-Side Pagination & Global Filters Suite", async (t) => {
  await t.test("1. ShopCatalog uses fetchPaginatedProducts and fetchFilters without loadCatalog", () => {
    const content = fs.readFileSync(path.join(ROOT, "components", "ShopCatalog.js"), "utf8");
    assert.match(content, /fetchPaginatedProducts/, "ShopCatalog calls fetchPaginatedProducts for page slices");
    assert.match(content, /fetchFilters/, "ShopCatalog calls fetchFilters for global metadata");
    assert.doesNotMatch(content, /loadCatalog/, "ShopCatalog does not execute full catalog download");
    assert.doesNotMatch(content, /const\s*\{\s*catalog:\s*products/, "ShopCatalog does not consume global catalog");
  });

  await t.test("2. ShopCatalog maps price bands to numeric priceMin and priceMax", () => {
    const content = fs.readFileSync(path.join(ROOT, "components", "ShopCatalog.js"), "utf8");
    assert.match(content, /priceMin\s*=/, "Computes priceMin");
    assert.match(content, /priceMax\s*=/, "Computes priceMax");
  });

  await t.test("3. ShopCatalog maps frontend sort options to backend-supported sort values", () => {
    const content = fs.readFileSync(path.join(ROOT, "components", "ShopCatalog.js"), "utf8");
    assert.match(content, /backendSort:\s*"price-low"/, "Maps price-asc to price-low");
    assert.match(content, /backendSort:\s*"price-high"/, "Maps price-desc to price-high");
    assert.match(content, /backendSort:\s*"newest"/, "Maps new to newest");
  });

  await t.test("4. ShopCatalog resets page to 1 when any filter changes", () => {
    const content = fs.readFileSync(path.join(ROOT, "components", "ShopCatalog.js"), "utf8");
    assert.match(content, /setCurrentPage\(1\)/, "Resets currentPage to 1 on filter changes");
  });

  await t.test("5. Wishlist page includes distinct error state and retry handler", () => {
    const content = fs.readFileSync(path.join(ROOT, "app", "wishlist", "page.js"), "utf8");
    assert.match(content, /setError/, "Wishlist sets error state on API failure");
    assert.match(content, /Retry/, "Wishlist displays retry CTA on error");
    assert.match(content, /error\s*&&\s*!loading/, "Wishlist guards empty state against error/loading");
  });

  await t.test("6. CheckoutView awaits cart mutations before order submission", () => {
    const content = fs.readFileSync(path.join(ROOT, "components", "checkout", "CheckoutView.js"), "utf8");
    assert.match(content, /await\s+awaitCartSettled\(\)/, "CheckoutView awaits pending cart mutations");
  });
});
