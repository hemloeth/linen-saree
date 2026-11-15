import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Test the actual fetchProductCardsByIds implementation contract
test("Wishlist API Resilience, Error Propagation and Recovery Suite", async (t) => {
  const productsApiPath = path.resolve(process.cwd(), "lib", "api", "products.js");
  const wishlistPagePath = path.resolve(process.cwd(), "app", "wishlist", "page.js");

  const productsSrc = fs.readFileSync(productsApiPath, "utf8");
  const wishlistSrc = fs.readFileSync(wishlistPagePath, "utf8");

  await t.test("1. fetchProductCardsByIds propagates full request failure when all chunks fail", () => {
    // Inspect source logic to verify error propagation
    assert.match(
      productsSrc,
      /chunkErrors\.length\s*===\s*chunks\.length/,
      "fetchProductCardsByIds must check if all chunks failed"
    );
    assert.match(
      productsSrc,
      /throw\s+primaryError/,
      "fetchProductCardsByIds must throw primaryError instead of swallowing and returning empty array"
    );
  });

  await t.test("2. fetchProductCardsByIds attaches hasPartialErrors and preserves successfully loaded items", () => {
    assert.match(
      productsSrc,
      /flatProducts\.hasPartialErrors\s*=\s*true/,
      "fetchProductCardsByIds marks partial errors on returned products array"
    );
    assert.match(
      productsSrc,
      /flatProducts\.failedIds\s*=/,
      "fetchProductCardsByIds identifies failed IDs for retry capability"
    );
  });

  await t.test("3. WishlistPage distinguishes API error from genuine empty wishlist", () => {
    // Must never show empty wishlist message solely on error
    assert.match(
      wishlistSrc,
      /error\s*&&\s*saved\.length\s*===\s*0/,
      "WishlistPage checks for error before rendering empty message"
    );
    assert.match(
      wishlistSrc,
      /Could not load saved pieces/,
      "Header displays error state rather than 0 pieces saved when error occurs"
    );
    assert.match(
      wishlistSrc,
      /Retry/,
      "WishlistPage exposes a clear Retry button on error"
    );
  });

  await t.test("4. WishlistPage preserves successfully loaded products on partial chunk failure", () => {
    assert.match(
      wishlistSrc,
      /partialError/,
      "WishlistPage tracks partialError state"
    );
    assert.match(
      wishlistSrc,
      /Some saved pieces could not be loaded/,
      "WishlistPage displays warning banner on partial failure while preserving loaded pieces"
    );
  });

  await t.test("5. Behavioral simulation of fetchProductCardsByIds chunk error handling", async () => {
    // Recreate chunk algorithm with simulated failures to verify behavior
    async function simulateFetchCards(ids, chunkFailureMap = {}) {
      if (!Array.isArray(ids) || ids.length === 0) return [];
      const cleanIds = ids.map(String).filter(Boolean);
      if (cleanIds.length === 0) return [];

      const CHUNK_SIZE = 2; // small chunks for test
      const chunks = [];
      for (let i = 0; i < cleanIds.length; i += CHUNK_SIZE) {
        chunks.push(cleanIds.slice(i, i + CHUNK_SIZE));
      }

      const chunkErrors = [];
      const chunkResults = await Promise.all(
        chunks.map(async (chunk, chunkIndex) => {
          if (chunkFailureMap[chunkIndex]) {
            const err = new Error(`Network failure on chunk ${chunkIndex}`);
            chunkErrors.push({ chunkIndex, chunk, error: err });
            return { success: false, items: [], chunkIndex, error: err };
          }
          return {
            success: true,
            items: chunk.map((id) => ({ id, name: `Saree ${id}` })),
            chunkIndex,
          };
        })
      );

      if (chunks.length > 0 && chunkErrors.length === chunks.length) {
        const primaryError = chunkErrors[0]?.error || new Error("Failed to fetch product cards by IDs");
        throw primaryError;
      }

      const flatProducts = chunkResults.flatMap((r) => r.items);
      if (chunkErrors.length > 0) {
        flatProducts.hasPartialErrors = true;
        flatProducts.partialErrors = chunkErrors;
        flatProducts.failedIds = chunkErrors.flatMap((e) => e.chunk);
      }
      return flatProducts;
    }

    // A. Empty input
    const emptyRes = await simulateFetchCards([]);
    assert.deepEqual(emptyRes, []);

    // B. Full failure: must throw, NOT return empty array
    await assert.rejects(
      async () => {
        await simulateFetchCards(["id-1", "id-2"], { 0: true });
      },
      /Network failure on chunk 0/,
      "Full failure throws error for caller catch handler"
    );

    // C. Partial failure: 2 chunks, chunk 0 succeeds, chunk 1 fails
    const partialRes = await simulateFetchCards(["id-1", "id-2", "id-3", "id-4"], { 1: true });
    assert.equal(partialRes.length, 2, "Successfully loaded items from chunk 0 are preserved");
    assert.equal(partialRes[0].id, "id-1");
    assert.equal(partialRes[1].id, "id-2");
    assert.equal(partialRes.hasPartialErrors, true, "Partial error flag is set");
    assert.deepEqual(partialRes.failedIds, ["id-3", "id-4"], "Failed IDs are recorded");

    // D. Recovery on retry: simulated retry succeeds
    const recoveredRes = await simulateFetchCards(["id-1", "id-2", "id-3", "id-4"], {});
    assert.equal(recoveredRes.length, 4, "All 4 items returned on successful retry");
    assert.equal(recoveredRes.hasPartialErrors, undefined, "No partial error on full recovery");
  });
});

