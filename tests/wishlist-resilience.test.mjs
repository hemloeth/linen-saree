import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Ensure environment variable for client is set before importing API modules
process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:5001";

import { fetchProductCardsByIds } from "../lib/api/products.js";

test("Wishlist API Resilience, Partial Failure Edge Cases & Real Behavioral Suite", async (t) => {
  const originalFetch = globalThis.fetch;

  t.afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  await t.test("1. Actual fetchProductCardsByIds: Propagates error when all chunks fail", async () => {
    globalThis.fetch = async () => {
      throw new Error("Simulated network outage");
    };

    await assert.rejects(
      async () => {
        await fetchProductCardsByIds(["id-1", "id-2"]);
      },
      /Simulated network outage/,
      "Must throw when all chunks encounter network failure"
    );
  });

  await t.test("2. Actual fetchProductCardsByIds: Partial chunk failure when chunk 0 succeeds with 0 products and chunk 1 fails", async () => {
    // Generate 25 IDs to create 2 chunks (20 and 5)
    const testIds = Array.from({ length: 25 }, (_, i) => `prod-id-${i + 1}`);

    let chunkCount = 0;
    globalThis.fetch = async (url, options) => {
      const body = JSON.parse(options.body || "{}");
      chunkCount++;
      if (body.ids.length === 20) {
        // Chunk 0: succeeds but returns 0 products (confirmed not in catalog for these 20)
        return {
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({ success: true, products: [] }),
        };
      }
      // Chunk 1: fails due to network error
      throw new Error("Gateway timeout on chunk 1");
    };

    const result = await fetchProductCardsByIds(testIds);

    // Must return array (not throw completely away)
    assert.ok(Array.isArray(result), "Result is an array");
    assert.equal(result.length, 0, "Length is 0 because chunk 0 had 0 products and chunk 1 failed");
    // CRITICAL: Must flag that partial errors exist so UI knows this is NOT a confirmed clean empty result
    assert.equal(result.hasPartialErrors, true, "hasPartialErrors must be true");
    assert.ok(Array.isArray(result.failedIds), "failedIds must be recorded");
    assert.equal(result.failedIds.length, 5, "5 IDs from chunk 1 are marked as failed");
    assert.equal(result.failedIds[0], "prod-id-21");
  });

  await t.test("3. Actual fetchProductCardsByIds: Partial chunk failure preserves successful chunk products", async () => {
    const testIds = Array.from({ length: 25 }, (_, i) => `prod-id-${i + 1}`);

    globalThis.fetch = async (url, options) => {
      const body = JSON.parse(options.body || "{}");
      if (body.ids.length === 20) {
        // Chunk 0 succeeds with products
        return {
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({
            success: true,
            products: [
              { _id: "prod-id-1", name: "Loaded Saree 1", price: 2500, stock: 5 },
              { _id: "prod-id-2", name: "Loaded Saree 2", price: 3000, stock: 3 },
            ],
          }),
        };
      }
      // Chunk 1 fails
      throw new Error("Network drop on second batch");
    };

    const result = await fetchProductCardsByIds(testIds);

    assert.equal(result.length, 2, "Successfully loaded products from chunk 0 are preserved");
    assert.equal(result[0].id, "prod-id-1");
    assert.equal(result[1].id, "prod-id-2");
    assert.equal(result.hasPartialErrors, true, "hasPartialErrors is flagged");
    assert.equal(result.failedIds.length, 5);
  });

  await t.test("4. Actual fetchProductCardsByIds: All chunks succeed cleanly", async () => {
    globalThis.fetch = async (url, options) => {
      const body = JSON.parse(options.body || "{}");
      return {
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          success: true,
          products: body.ids.map((id) => ({ _id: id, name: `Saree ${id}`, price: 2000, stock: 4 })),
        }),
      };
    };

    const result = await fetchProductCardsByIds(["p1", "p2"]);
    assert.equal(result.length, 2);
    assert.equal(result.hasPartialErrors, undefined, "No partial errors on clean load");
  });

  await t.test("5. Actual fetchProductCardsByIds: Empty input returns empty array without fetch", async () => {
    let called = false;
    globalThis.fetch = async () => {
      called = true;
      throw new Error("Should not be called");
    };

    const result = await fetchProductCardsByIds([]);
    assert.deepEqual(result, []);
    assert.equal(called, false);
  });

  await t.test("6. WishlistPage source contract: Edge case prevents false 'no longer available' message", () => {
    const wishlistPagePath = path.resolve(process.cwd(), "app", "wishlist", "page.js");
    const src = fs.readFileSync(wishlistPagePath, "utf8");

    // Must show retry state if hasPartialErrors is true and saved.length === 0
    assert.match(
      src,
      /hasPartialErrors\s*&&\s*!loading\s*&&\s*saved\.length\s*===\s*0/,
      "Must show retry state when partial errors occurred and no items loaded"
    );

    // Must preserve error && !loading branch for full failures
    assert.match(
      src,
      /error\s*&&\s*!loading/,
      "Must show retry state for full API errors"
    );

    // Must only display 'no longer available' when clean (not during error or partialError)
    assert.match(
      src,
      /saved\.length\s*===\s*0/,
      "Must retain empty catalog guard"
    );
  });
});
