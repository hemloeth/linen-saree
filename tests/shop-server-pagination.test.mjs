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

  await t.test("2. ShopCatalog uses single selected price band without nonadjacent multi-band merging bug", () => {
    const content = fs.readFileSync(path.join(ROOT, "components", "ShopCatalog.js"), "utf8");
    assert.match(content, /const\s*\[selectedBand,\s*setSelectedBand\]\s*=\s*useState/, "Uses single selectedBand state");
    assert.match(content, /priceMin\s*=/, "Computes priceMin");
    assert.match(content, /priceMax\s*=/, "Computes priceMax");
    // Ensure bands array is replaced by selectedBand
    assert.doesNotMatch(content, /const\s*\[bands,\s*setBands\]\s*=\s*useState/, "Does not use multi-band array state");
  });

  await t.test("3. ShopCatalog maps frontend sort options to backend-supported sort values and removes misleading rating sort", () => {
    const content = fs.readFileSync(path.join(ROOT, "components", "ShopCatalog.js"), "utf8");
    assert.match(content, /backendSort:\s*"price-low"/, "Maps price-asc to price-low");
    assert.match(content, /backendSort:\s*"price-high"/, "Maps price-desc to price-high");
    assert.match(content, /backendSort:\s*"newest"/, "Maps new to newest");
    assert.doesNotMatch(content, /key:\s*"rating"[^}]*backendSort:\s*"featured"/, "Does not map rating to featured");
  });

  await t.test("4. In-Stock filtering is forwarded to backend API and not sliced on client", () => {
    const content = fs.readFileSync(path.join(ROOT, "components", "ShopCatalog.js"), "utf8");
    assert.match(content, /inStock:\s*inStockOnly\s*\?\s*"true"\s*:\s*undefined/, "Forwards inStock filter to server query");
    assert.doesNotMatch(content, /const\s+displayedProducts\s*=\s*inStockOnly\s*\?\s*products\.filter/, "Does not slice or truncate products locally");

    const apiContent = fs.readFileSync(path.join(ROOT, "lib", "api", "products.js"), "utf8");
    assert.match(apiContent, /inStock/, "lib/api/products.js supports inStock parameter in fetchPaginatedProducts");
  });

  await t.test("5. ShopCatalog resets page to 1 when any filter changes", () => {
    const content = fs.readFileSync(path.join(ROOT, "components", "ShopCatalog.js"), "utf8");
    assert.match(content, /setCurrentPage\(1\)/, "Resets currentPage to 1 on filter changes");
  });

  await t.test("6. Wishlist page includes distinct error state and retry handler", () => {
    const content = fs.readFileSync(path.join(ROOT, "app", "wishlist", "page.js"), "utf8");
    assert.match(content, /setError/, "Wishlist sets error state on API failure");
    assert.match(content, /Retry/, "Wishlist displays retry CTA on error");
    assert.match(content, /error\s*&&\s*!loading/, "Wishlist guards empty state against error/loading");
  });

  await t.test("7. CheckoutView awaits cart mutations before order submission", () => {
    const content = fs.readFileSync(path.join(ROOT, "components", "checkout", "CheckoutView.js"), "utf8");
    assert.match(content, /await\s+awaitCartSettled\(\)/, "CheckoutView awaits pending cart mutations");
  });
});
