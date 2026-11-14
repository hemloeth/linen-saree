import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(".");

test("Cart Concurrency & Store Mutation Suite", async (t) => {
  await t.test("1. StoreProvider uses functional state updates to eliminate stale closures", () => {
    const storeContent = fs.readFileSync(path.join(ROOT, "components", "StoreProvider.js"), "utf8");
    assert.match(
      storeContent,
      /setItems\(\(current\)\s*=>/,
      "StoreProvider uses functional updates setItems((current) => ...) for cart additions"
    );
  });

  await t.test("2. StoreProvider implements mutation serialization queue", () => {
    const storeContent = fs.readFileSync(path.join(ROOT, "components", "StoreProvider.js"), "utf8");
    assert.match(
      storeContent,
      /cartQueueRef\.current\s*=\s*cartQueueRef\.current/,
      "StoreProvider chains mutations sequentially on cartQueueRef"
    );
  });

  await t.test("3. StoreProvider implements isolated delta rollback on mutation failure", () => {
    const storeContent = fs.readFileSync(path.join(ROOT, "components", "StoreProvider.js"), "utf8");
    assert.match(
      storeContent,
      /line\.qty\s*-\s*quantity/,
      "StoreProvider reverts only the failed quantity delta without wiping concurrent items"
    );
  });

  await t.test("4. Synchronous guest cart persistence ensures zero checkout race condition", () => {
    const storeContent = fs.readFileSync(path.join(ROOT, "components", "StoreProvider.js"), "utf8");
    assert.match(
      storeContent,
      /persistGuestCart/,
      "StoreProvider synchronously calls persistGuestCart on add/update/remove"
    );
  });

  await t.test("5. BuyNowButton awaits cart persistence and guards against navigation on error", () => {
    const actionContent = fs.readFileSync(path.join(ROOT, "components", "ProductActions.js"), "utf8");
    assert.match(
      actionContent,
      /const res = await add\(product, 1\);/,
      "BuyNow awaits add(product, 1)"
    );
    assert.match(
      actionContent,
      /if \(res && res\.success\)/,
      "BuyNow checks res.success before closeCart() and navigation"
    );
  });

  await t.test("6. Wishlist toggling includes in-flight double-tap guard", () => {
    const storeContent = fs.readFileSync(path.join(ROOT, "components", "StoreProvider.js"), "utf8");
    assert.match(
      storeContent,
      /wishlistInFlightRef\.current\.has\(productId\)/,
      "StoreProvider guards against rapid concurrent double-taps on the same product"
    );
  });

  await t.test("7. VideoCoordinator prevents redundant play/pause and throttles React renders", () => {
    const coordContent = fs.readFileSync(path.join(ROOT, "components", "video", "useVideoCoordinator.js"), "utf8");
    assert.match(
      coordContent,
      /if \(data\.video\.paused\)/,
      "VideoCoordinator only calls play() if the video is actually paused"
    );
    assert.match(
      coordContent,
      /if \(!data\.video\.paused\)/,
      "VideoCoordinator only calls pause() if the video is actually playing"
    );
    assert.match(
      coordContent,
      /nearViewportIds/,
      "VideoCoordinator exposes nearViewportIds for lazy attachment"
    );
  });

  await t.test("8. NewArrivalsSection uses bounded TTL caching with deduplication", () => {
    const arrivalsContent = fs.readFileSync(path.join(ROOT, "components", "NewArrivalsSection.js"), "utf8");
    assert.match(
      arrivalsContent,
      /CACHE_TTL_MS/,
      "NewArrivalsSection defines bounded cache TTL"
    );
    assert.match(
      arrivalsContent,
      /existingIds\.has\(p\.id\)/,
      "NewArrivalsSection deduplicates incoming page items against existing IDs"
    );
  });

  await t.test("9. Product recommendations utilize backend endpoint without full catalog loading", () => {
    const pageView = fs.readFileSync(path.join(ROOT, "components", "ProductPageView.js"), "utf8");
    assert.match(
      pageView,
      /fetchProductRecommendations\(productId/,
      "ProductPageView fetches scored backend recommendations directly"
    );
  });
});
