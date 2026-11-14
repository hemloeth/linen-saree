import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

test("Catalog Regression & Video Coordinator Test Suite", async (t) => {
  await t.test("1. Search page uses backend fetchPaginatedProducts and does not rely on global catalog", () => {
    const content = fs.readFileSync(path.join(ROOT, "app", "search", "page.js"), "utf8");
    assert.match(content, /fetchPaginatedProducts/, "Search page calls fetchPaginatedProducts");
    assert.doesNotMatch(content, /catalog:\s*products/, "Search page does not rely on global catalog");
  });

  await t.test("2. SearchModal uses debounced backend search with fetchPaginatedProducts", () => {
    const content = fs.readFileSync(path.join(ROOT, "components", "SearchModal.js"), "utf8");
    assert.match(content, /fetchPaginatedProducts/, "SearchModal queries backend");
    assert.doesNotMatch(content, /catalog:\s*products/, "SearchModal does not consume catalog state");
  });

  await t.test("3. Wishlist page resolves cards via fetchProductCardsByIds API", () => {
    const content = fs.readFileSync(path.join(ROOT, "app", "wishlist", "page.js"), "utf8");
    assert.match(content, /fetchProductCardsByIds/, "Wishlist hydrates cards by IDs");
    assert.doesNotMatch(content, /catalog:\s*products/, "Wishlist does not filter in-memory catalog");
  });

  await t.test("4. FilteredProducts uses server-paginated API", () => {
    const content = fs.readFileSync(path.join(ROOT, "components", "merchandising", "FilteredProducts.js"), "utf8");
    assert.match(content, /fetchPaginatedProducts/, "FilteredProducts calls fetchPaginatedProducts");
    assert.doesNotMatch(content, /if\s*\(!catalog\.length\)\s*return\s*\[\]/, "FilteredProducts does not short-circuit on catalog");
  });

  await t.test("5. VideoCoordinator has dual observers with strict 0px rootMargin for playback and 300px for preload", () => {
    const content = fs.readFileSync(path.join(ROOT, "components", "video", "useVideoCoordinator.js"), "utf8");
    assert.match(content, /rootMargin:\s*"0px"/, "Playback observer uses strict 0px rootMargin");
    assert.match(content, /rootMargin:\s*"300px 0px 300px 0px"/, "Preload observer uses 300px rootMargin");
    assert.match(content, /nextNear\.delete\(id\)/, "Preload observer removes entries that exit preload range");
  });

  await t.test("6. Production HomePage does not render mock products from lib/data.js", () => {
    const content = fs.readFileSync(path.join(ROOT, "app", "page.js"), "utf8");
    assert.doesNotMatch(content, /products\s+as\s+fallbackProducts/, "HomePage does not import fallback mock products");
    assert.match(content, /fetchPaginatedProducts/, "HomePage fetches live inventory from backend");
  });

  await t.test("7. StoreProvider implements pending mutation tracking and awaitCartSettled", () => {
    const content = fs.readFileSync(path.join(ROOT, "components", "StoreProvider.js"), "utf8");
    assert.match(content, /pendingCartMutationsRef/, "StoreProvider tracks in-flight cart mutations count");
    assert.match(content, /awaitCartSettled/, "StoreProvider provides awaitCartSettled for checkout coordination");
  });

  await t.test("8. ProductCarousel and ReelCarousel have removed green desktop arrow buttons", () => {
    const carouselContent = fs.readFileSync(path.join(ROOT, "components", "ProductCarousel.js"), "utf8");
    const reelContent = fs.readFileSync(path.join(ROOT, "components", "ReelCarousel.js"), "utf8");
    assert.doesNotMatch(carouselContent, /scrollByPage/, "ProductCarousel has no desktop scrollByPage buttons");
    assert.doesNotMatch(reelContent, /function Arrow/, "ReelCarousel has no desktop Arrow buttons");
  });
});
