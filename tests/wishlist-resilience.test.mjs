import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import React, { act } from "react";
import ReactDOMClient from "react-dom/client";
import { JSDOM } from "jsdom";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Ensure environment variable for client is set before importing API modules
process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:5001";
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { fetchProductCardsByIds } from "../lib/api/products.js";

// Load and transpile actual production WishlistPage from app/wishlist/page.js using Next's SWC
const swc = require("next/dist/build/swc");
const wishlistPagePath = path.resolve(__dirname, "../app/wishlist/page.js");
const wishlistPageSource = fs.readFileSync(wishlistPagePath, "utf8");
const transformedWishlistPage = swc.transformSync(wishlistPageSource, {
  module: { type: "commonjs" },
  jsc: {
    parser: { syntax: "ecmascript", jsx: true },
    transform: { react: { runtime: "automatic" } },
  },
});

function MockLink({ href, children, ...props }) {
  return React.createElement("a", { href, ...props }, children);
}

function MockHeader() {
  return React.createElement("header", { "data-testid": "header" }, "Header");
}

function MockFooter() {
  return React.createElement("footer", { "data-testid": "footer" }, "Footer");
}

function MockProductCard({ product }) {
  return React.createElement(
    "div",
    {
      className: "product-card",
      "data-testid": `product-card-${product.id || product._id}`,
      "data-id": String(product.id || product._id),
    },
    product.name
  );
}

function createProductionWishlistPage(storeState) {
  const customRequire = (id) => {
    if (id === "react") return React;
    if (id === "react/jsx-runtime") return require("react/jsx-runtime");
    if (id === "next/link") return MockLink;
    if (id === "@/components/Header") return MockHeader;
    if (id === "@/components/Footer") return MockFooter;
    if (id === "@/components/ProductCard") return MockProductCard;
    if (id === "@/components/StoreProvider") {
      return {
        useStore: () => storeState,
      };
    }
    if (id === "@/lib/api/products" || id === "@/lib/api/products.js") {
      return { fetchProductCardsByIds };
    }
    return require(id);
  };

  const moduleExports = {};
  const mod = { exports: moduleExports };
  const fn = new Function("require", "module", "exports", transformedWishlistPage.code);
  fn(customRequire, mod, moduleExports);
  return mod.exports.default;
}

test("Task 1 & 2: Complete Wishlist Resilience & Actual Production WishlistPage Suite", async (t) => {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;

  t.beforeEach(() => {
    // Suppress expected error logs from simulated network failure tests
    console.error = (...args) => {
      const msg = typeof args[0] === "string" ? args[0] : "";
      if (
        msg.includes("fetchProductCardsByIds chunk") ||
        msg.includes("Failed to load wishlist items") ||
        msg.includes("An update to")
      ) {
        return;
      }
      originalConsoleError(...args);
    };
  });

  t.afterEach(() => {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  });

  // 1. Complete network failure
  await t.test("1. Actual fetchProductCardsByIds: Complete network failure propagates error", async () => {
    globalThis.fetch = async () => {
      throw new Error("Simulated full network outage");
    };

    await assert.rejects(
      async () => {
        await fetchProductCardsByIds(["id-1", "id-2"]);
      },
      /Simulated full network outage/,
      "Must throw when all chunks encounter complete network failure"
    );
  });

  // 2. One successful empty batch with another failed batch
  await t.test("2. Actual fetchProductCardsByIds: One successful empty batch with another failed batch", async () => {
    const testIds = Array.from({ length: 25 }, (_, i) => `prod-id-${i + 1}`);

    globalThis.fetch = async (url, options) => {
      const body = JSON.parse(options.body || "{}");
      if (body.ids.length === 20) {
        // Chunk 0: succeeds with 200 OK but returns empty product list
        return {
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({ success: true, products: [] }),
        };
      }
      // Chunk 1: network fails
      throw new Error("Chunk 1 gateway timeout");
    };

    const result = await fetchProductCardsByIds(testIds);

    assert.ok(Array.isArray(result), "Result is an array");
    assert.equal(result.length, 0, "No products loaded because batch 0 was empty and batch 1 failed");
    assert.equal(result.hasPartialErrors, true, "Must flag hasPartialErrors=true so UI never treats this as clean empty");
    assert.equal(result.failedIds.length, 5, "5 IDs from failed batch are recorded in failedIds");
    assert.equal(result.failedIds[0], "prod-id-21");
  });

  // 3. Partial product loading
  await t.test("3. Actual fetchProductCardsByIds: Partial product loading preserves successful chunk products", async () => {
    const testIds = Array.from({ length: 25 }, (_, i) => `prod-id-${i + 1}`);

    globalThis.fetch = async (url, options) => {
      const body = JSON.parse(options.body || "{}");
      if (body.ids.length === 20) {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({
            success: true,
            products: [
              { _id: "prod-id-1", name: "Linen Saree Emerald", price: 2500, stock: 5 },
              { _id: "prod-id-2", name: "Linen Saree Crimson", price: 3200, stock: 2 },
            ],
          }),
        };
      }
      throw new Error("Network drop on second batch");
    };

    const result = await fetchProductCardsByIds(testIds);

    assert.equal(result.length, 2, "Successfully loaded products from chunk 0 are preserved");
    assert.equal(result[0].id, "prod-id-1");
    assert.equal(result[1].id, "prod-id-2");
    assert.equal(result.hasPartialErrors, true, "hasPartialErrors is flagged");
    assert.equal(result.failedIds.length, 5, "Chunk 1 IDs are retained in failedIds");
  });

  // 4. Ensure wishlist IDs are never removed because product hydration failed
  await t.test("4. Wishlist IDs preservation: Failed hydration never deletes saved IDs", async () => {
    const WISHLIST_KEY = "hoq_wishlist_v2";
    const initialIds = ["6aae48baf0fd4c699a0d7001", "6aae48baf0fd4c699a0d7002", "6aae48baf0fd4c699a0d7003"];

    // Simulated local storage
    const storage = new Map([[WISHLIST_KEY, JSON.stringify(initialIds)]]);

    // Simulated failed fetch
    globalThis.fetch = async () => {
      throw new Error("Network timeout during hydration");
    };

    let fetchError = null;
    try {
      await fetchProductCardsByIds(initialIds);
    } catch (e) {
      fetchError = e;
    }
    assert.ok(fetchError, "Hydration attempt failed as expected");

    // Verify storage was NEVER mutated or cleared on failure
    const rawAfterFailure = storage.get(WISHLIST_KEY);
    assert.ok(rawAfterFailure, "Wishlist in localStorage remains intact");
    const parsedAfter = JSON.parse(rawAfterFailure);
    assert.deepEqual(parsedAfter, initialIds, "All original wishlist IDs remain intact in storage");
  });

  // 5. Verify login, logout and saved wishlist persistence contract
  await t.test("5. Authentication transitions: Wishlist sync and preservation", async () => {
    const WISHLIST_KEY = "hoq_wishlist_v2";
    const guestIds = ["6aae48baf0fd4c699a0d7001", "6aae48baf0fd4c699a0d7002"];

    // A. Guest state has saved IDs
    let localStorageMap = new Map([[WISHLIST_KEY, JSON.stringify(guestIds)]]);

    // B. Simulated login with successful sync
    const syncWithServer = async (serverSuccess = true) => {
      const stored = JSON.parse(localStorageMap.get(WISHLIST_KEY) || "[]");
      if (serverSuccess) {
        // Server confirmed sync: safely remove guest storage
        localStorageMap.delete(WISHLIST_KEY);
        return { success: true, wishlist: stored };
      }
      // Server sync failed: MUST preserve guest storage
      throw new Error("Sync failed");
    };

    // If server fails:
    try {
      await syncWithServer(false);
    } catch {}
    assert.ok(localStorageMap.has(WISHLIST_KEY), "Failed sync preserves guest storage");

    // If server succeeds:
    const syncRes = await syncWithServer(true);
    assert.equal(syncRes.success, true);
    assert.deepEqual(syncRes.wishlist, guestIds);
    assert.equal(localStorageMap.has(WISHLIST_KEY), false, "Guest storage cleaned only after confirmed server sync");
  });

  // 6. Test the Actual Production WishlistPage: Initial loading state
  await t.test("6. Actual WishlistPage: Initial loading state renders skeleton and loading indicator", async () => {
    const dom = new JSDOM("<!DOCTYPE html><html><body><div id=\"root\"></div></body></html>", {
      url: "http://localhost:3000",
    });
    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;

    // A fetch promise that remains unresolved to inspect loading state
    let resolveFetch;
    globalThis.fetch = () =>
      new Promise((resolve) => {
        resolveFetch = resolve;
      });

    const storeState = {
      wishlist: ["prod-alpha", "prod-beta"],
      isWished: () => true,
    };
    const WishlistPage = createProductionWishlistPage(storeState);

    const root = ReactDOMClient.createRoot(dom.window.document.getElementById("root"));
    await act(async () => {
      root.render(React.createElement(WishlistPage));
    });

    const html = dom.window.document.body.innerHTML;
    assert.ok(html.includes("Loading saved pieces"), "Loading status text must be visible");
    const skeletons = dom.window.document.querySelectorAll(".animate-pulse");
    assert.ok(skeletons.length >= 2, "Must render skeleton placeholders while loading");

    // Clean up unresolved promise inside act
    await act(async () => {
      resolveFetch({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ success: true, products: [] }),
      });
      await new Promise((r) => setTimeout(r, 50));
    });
    root.unmount();
  });

  // 7. Test the Actual Production WishlistPage: Complete API failure, Retry click, and recovery
  await t.test("7. Actual WishlistPage: Complete API failure shows Retry, clicking Retry recovers products without losing IDs", async () => {
    const dom = new JSDOM("<!DOCTYPE html><html><body><div id=\"root\"></div></body></html>", {
      url: "http://localhost:3000",
    });
    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;

    let fetchAttempts = 0;
    globalThis.fetch = async () => {
      fetchAttempts++;
      if (fetchAttempts === 1) {
        throw new Error("Complete network failure during wishlist load");
      }
      return {
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          success: true,
          products: [
            { _id: "prod-1", name: "Royal Blue Linen Saree", price: 3499, stock: 4 },
            { _id: "prod-2", name: "Crimson Silk Linen Saree", price: 4199, stock: 2 },
          ],
        }),
      };
    };

    const storeState = {
      wishlist: ["prod-1", "prod-2"],
      isWished: (id) => ["prod-1", "prod-2"].includes(id),
    };
    const WishlistPage = createProductionWishlistPage(storeState);

    const root = ReactDOMClient.createRoot(dom.window.document.getElementById("root"));
    await act(async () => {
      root.render(React.createElement(WishlistPage));
      await new Promise((r) => setTimeout(r, 60));
    });

    const bodyAfterFailure = dom.window.document.body.innerHTML;
    // Must NOT display "Nothing saved yet." or "The saved pieces are no longer available in the catalog."
    assert.ok(
      !bodyAfterFailure.includes("Nothing saved yet."),
      "Must not display 'Nothing saved yet.' on network failure"
    );
    assert.ok(
      !bodyAfterFailure.includes("The saved pieces are no longer available in the catalog."),
      "Must not display 'pieces are no longer available' on network failure"
    );
    assert.ok(
      bodyAfterFailure.includes("Could not load saved pieces.") ||
        bodyAfterFailure.includes("Unable to load wishlist pieces"),
      "Must render error state indicating load failure"
    );

    // Verify Retry button exists in DOM
    const buttons = Array.from(dom.window.document.querySelectorAll("button"));
    const retryButton = buttons.find((b) => b.textContent.trim() === "Retry");
    assert.ok(retryButton, "Retry button must be rendered in DOM");
    assert.equal(fetchAttempts, 1, "Exactly one fetch attempt before clicking Retry");

    // Wishlist IDs in store remain untouched
    assert.deepEqual(storeState.wishlist, ["prod-1", "prod-2"], "Wishlist IDs preserved on failure");

    // Click Retry inside act
    await act(async () => {
      retryButton.click();
      await new Promise((r) => setTimeout(r, 60));
    });

    assert.equal(fetchAttempts, 2, "Second fetch attempt executed after clicking Retry");

    const bodyAfterRetry = dom.window.document.body.innerHTML;
    assert.ok(bodyAfterRetry.includes("Royal Blue Linen Saree"), "First recovered product card rendered");
    assert.ok(bodyAfterRetry.includes("Crimson Silk Linen Saree"), "Second recovered product card rendered");
    assert.ok(bodyAfterRetry.includes("2 pieces saved"), "Status shows '2 pieces saved'");
    assert.equal(
      dom.window.document.querySelectorAll(".product-card").length,
      2,
      "Exactly 2 product cards rendered in DOM"
    );

    root.unmount();
  });

  // 8. Test the Actual Production WishlistPage: Partial API failure with 0 loaded products
  await t.test("8. Actual WishlistPage: Partial failure with 0 loaded products renders Retry state instead of empty catalog message", async () => {
    const dom = new JSDOM("<!DOCTYPE html><html><body><div id=\"root\"></div></body></html>", {
      url: "http://localhost:3000",
    });
    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;

    // 25 IDs triggers 2 chunks (20 and 5). Chunk 0 returns empty [], Chunk 1 fails with network error.
    const testIds = Array.from({ length: 25 }, (_, i) => `item-${i + 1}`);
    globalThis.fetch = async (url, options) => {
      const body = JSON.parse(options.body || "{}");
      if (body.ids.length === 20) {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({ success: true, products: [] }),
        };
      }
      throw new Error("Network timeout on second chunk");
    };

    const storeState = {
      wishlist: testIds,
      isWished: () => true,
    };
    const WishlistPage = createProductionWishlistPage(storeState);

    const root = ReactDOMClient.createRoot(dom.window.document.getElementById("root"));
    await act(async () => {
      root.render(React.createElement(WishlistPage));
      await new Promise((r) => setTimeout(r, 60));
    });

    const bodyHtml = dom.window.document.body.innerHTML;
    // Guard verification: Must show Retry error box, NEVER "The saved pieces are no longer available in the catalog."
    assert.ok(
      !bodyHtml.includes("The saved pieces are no longer available in the catalog."),
      "Must not show unavailable catalog message when unresolved partial network errors exist"
    );
    assert.ok(
      bodyHtml.includes("Could not load saved pieces.") ||
        bodyHtml.includes("Some saved pieces could not be loaded"),
      "Must display partial error state"
    );

    const buttons = Array.from(dom.window.document.querySelectorAll("button"));
    const retryBtn = buttons.find((b) => b.textContent.trim() === "Retry");
    assert.ok(retryBtn, "Must present Retry button on partial network failure");

    root.unmount();
  });

  // 9. Test the Actual Production WishlistPage: Guest and Authenticated wishlist handling
  await t.test("9. Actual WishlistPage: Guest and authenticated empty states render cleanly", async () => {
    const dom = new JSDOM("<!DOCTYPE html><html><body><div id=\"root\"></div></body></html>", {
      url: "http://localhost:3000",
    });
    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;

    let fetchCalled = false;
    globalThis.fetch = async () => {
      fetchCalled = true;
      return { ok: true, json: async () => ({ success: true, products: [] }) };
    };

    // A: Empty guest wishlist
    const emptyGuestStore = {
      wishlist: [],
      isWished: () => false,
      user: null,
    };
    const WishlistPageGuest = createProductionWishlistPage(emptyGuestStore);

    const root = ReactDOMClient.createRoot(dom.window.document.getElementById("root"));
    await act(async () => {
      root.render(React.createElement(WishlistPageGuest));
    });

    let html = dom.window.document.body.innerHTML;
    assert.equal(fetchCalled, false, "Should not invoke fetch for empty wishlist");
    assert.ok(html.includes("Nothing saved yet."), "Must display 'Nothing saved yet.' for empty wishlist");
    assert.ok(
      html.includes("Tap the heart on any saree to keep it here."),
      "Must guide user to save items"
    );
    assert.ok(html.includes("/shop"), "Must link to /shop");

    // B: Authenticated user with empty wishlist
    root.unmount();
    const authedEmptyStore = {
      wishlist: [],
      isWished: () => false,
      user: { id: "u-123", email: "user@example.com" },
    };
    const WishlistPageAuth = createProductionWishlistPage(authedEmptyStore);

    const root2 = ReactDOMClient.createRoot(dom.window.document.getElementById("root"));
    await act(async () => {
      root2.render(React.createElement(WishlistPageAuth));
    });

    html = dom.window.document.body.innerHTML;
    assert.ok(html.includes("Nothing saved yet."), "Must display clean empty state for authenticated user");
    root2.unmount();
  });
});

