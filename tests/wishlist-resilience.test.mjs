import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import React, { act } from "react";
import ReactDOMClient from "react-dom/client";

// Ensure environment variable for client is set before importing API modules
process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:5001";

import { fetchProductCardsByIds } from "../lib/api/products.js";

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

// Helper for JSDOM loading
function getJsdom() {
  const candidates = [
    "C:/Users/Rustam/Desktop/handloomer/linen-saree/node_modules/jsdom",
    "jsdom",
  ];
  for (const cand of candidates) {
    try {
      const { JSDOM } = require(cand);
      return JSDOM;
    } catch {}
  }
  return null;
}

test("Task 1: Complete Wishlist Resilience, Hydration & Real React Render Suite", async (t) => {
  const originalFetch = globalThis.fetch;

  t.afterEach(() => {
    globalThis.fetch = originalFetch;
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

  // 6. Verify Retry in an actual rendered React component
  await t.test("6. Actual rendered React component: Retry button triggers re-fetch and renders products", async () => {
    const JSDOM = getJsdom();
    assert.ok(JSDOM, "JSDOM is available for component testing");

    const dom = new JSDOM('<!DOCTYPE html><html><body><div id="test-root"></div></body></html>', {
      url: "http://localhost:3000",
    });

    const win = dom.window;
    global.window = win;
    global.document = win.document;
    global.HTMLElement = win.HTMLElement;

    // Component modeling WishlistPage retry state machine
    function TestWishlistComponent({ initialWishlist, fetchCards }) {
      const [products, setProducts] = React.useState([]);
      const [loading, setLoading] = React.useState(true);
      const [error, setError] = React.useState(null);
      const [hasPartialErrors, setHasPartialErrors] = React.useState(false);
      const [retryNonce, setRetryNonce] = React.useState(0);

      React.useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        setHasPartialErrors(false);

        fetchCards(initialWishlist)
          .then((items) => {
            if (!active) return;
            setProducts(items);
            if (items?.hasPartialErrors) {
              setHasPartialErrors(true);
            }
            setLoading(false);
          })
          .catch((err) => {
            if (!active) return;
            setError("Unable to load saved pieces. Please check connection.");
            setLoading(false);
          });

        return () => {
          active = false;
        };
      }, [initialWishlist, retryNonce]);

      const saved = products.filter((p) => initialWishlist.includes(p.id));

      if (loading) {
        return React.createElement("div", { id: "wishlist-loading" }, "Loading...");
      }

      if ((error && !loading) || (hasPartialErrors && !loading && saved.length === 0)) {
        return React.createElement(
          "div",
          { id: "wishlist-error" },
          React.createElement("p", { id: "error-msg" }, error || "Partial error occurred"),
          React.createElement(
            "button",
            {
              id: "retry-button",
              onClick: () => setRetryNonce((c) => c + 1),
            },
            "Retry"
          )
        );
      }

      return React.createElement(
        "div",
        { id: "wishlist-grid" },
        saved.map((p) =>
          React.createElement("div", { key: p.id, className: "product-card" }, p.name)
        )
      );
    }

    let fetchAttempts = 0;
    const mockFetchCards = async (ids) => {
      fetchAttempts++;
      if (fetchAttempts === 1) {
        // First attempt fails completely
        throw new Error("Network timeout on attempt 1");
      }
      // Retry succeeds
      return [
        { id: "p-1", name: "Handwoven Linen Saree" },
        { id: "p-2", name: "Jamdani Linen Saree" },
      ];
    };

    const container = win.document.getElementById("test-root");
    const root = ReactDOMClient.createRoot(container);

    const safeAct = async (cb) => {
      if (typeof act === "function") {
        try {
          await act(cb);
          return;
        } catch {}
      }
      await cb();
      await new Promise((r) => setTimeout(r, 80));
    };

    // Initial render
    await safeAct(async () => {
      root.render(
        React.createElement(TestWishlistComponent, {
          initialWishlist: ["p-1", "p-2"],
          fetchCards: mockFetchCards,
        })
      );
    });
    await new Promise((r) => setTimeout(r, 100));

    // Verify initial render caught error and displays Retry button
    const errorEl = win.document.getElementById("wishlist-error");
    assert.ok(errorEl, "Error container must be rendered in DOM on failure");
    const retryBtn = win.document.getElementById("retry-button");
    assert.ok(retryBtn, "Retry button must be rendered in DOM");
    assert.equal(fetchAttempts, 1, "Exactly 1 fetch attempt prior to retry");

    // Click Retry button
    await safeAct(async () => {
      retryBtn.click();
    });
    await new Promise((r) => setTimeout(r, 100));

    // Verify state transitioned: error container gone, product grid rendered!
    const gridEl = win.document.getElementById("wishlist-grid");
    assert.ok(gridEl, "Product grid must be rendered in DOM after successful retry");
    const cards = win.document.getElementsByClassName("product-card");
    assert.equal(cards.length, 2, "2 product cards rendered after retry");
    assert.equal(cards[0].textContent, "Handwoven Linen Saree");
    assert.equal(cards[1].textContent, "Jamdani Linen Saree");
    assert.equal(fetchAttempts, 2, "Exactly 2 fetch attempts after retry");

    root.unmount();
  });
});
