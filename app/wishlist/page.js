"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/components/StoreProvider";
import { fetchProductCardsByIds } from "@/lib/api/products";

export default function WishlistPage() {
  const { wishlist } = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(wishlist.length > 0);
  const [error, setError] = useState(null);
  const [hasPartialErrors, setHasPartialErrors] = useState(false);
  const [partialError, setPartialError] = useState(null);
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    if (!wishlist || wishlist.length === 0) {
      setProducts([]);
      setError(null);
      setHasPartialErrors(false);
      setPartialError(null);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    setHasPartialErrors(false);
    setPartialError(null);

    fetchProductCardsByIds(wishlist)
      .then((items) => {
        if (!active) return;
        setProducts(items);
        if (items?.hasPartialErrors) {
          setHasPartialErrors(true);
          setPartialError("Some saved pieces could not be loaded due to a network interruption.");
        } else {
          setHasPartialErrors(false);
          setPartialError(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Failed to load wishlist items:", err);
        setError("Unable to load wishlist pieces. Please check your network connection and try again.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [wishlist, retryNonce]);

  // Keep locally filtered if an item was removed
  const saved = products.filter((p) => {
    const pid = String(p.id || p._id);
    return wishlist.some((wId) => String(wId) === pid);
  });

  return (
    <>
      <Header />
      <main className="flex-1 min-h-[60vh]">
        <div className="mx-auto max-w-[1240px] px-4 py-8 lg:px-10 lg:py-12">
          <div className="mb-6 lg:mb-8">
            <h1 className="font-display text-xl font-medium uppercase tracking-[0.16em] text-pine-950 sm:text-2xl">
              Your wishlist
            </h1>
            <p className="mt-1 text-xs text-muted">
              {loading
                ? "Loading saved pieces…"
                : error || (hasPartialErrors && saved.length === 0)
                ? "Could not load saved pieces."
                : wishlist.length === 0
                ? "Nothing saved yet."
                : saved.length === 0
                ? "No pieces currently available."
                : `${saved.length} piece${saved.length === 1 ? "" : "s"} saved`}
            </p>
            <span aria-hidden="true" className="mt-3 block h-px w-16 bg-pine-950/40" />
          </div>

          {(error && !loading) || (hasPartialErrors && !loading && saved.length === 0) ? (
            <div className="rounded-lg border border-red-200 bg-red-50/50 px-6 py-10 text-center">
              <p className="text-sm font-medium text-red-700">
                {error || partialError || "Unable to load saved pieces. Please check your network connection and try again."}
              </p>
              <button
                type="button"
                onClick={() => setRetryNonce((c) => c + 1)}
                className="mt-3 inline-flex h-9 items-center rounded-md bg-pine-900 px-4 font-inter text-xs font-semibold text-white transition hover:bg-pine-950 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {Array.from({ length: Math.min(wishlist.length, 4) }).map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col gap-2">
                  <div className="aspect-[3/4] w-full rounded-md bg-pine-950/5" />
                  <div className="h-4 w-3/4 rounded bg-pine-950/10" />
                  <div className="h-4 w-1/3 rounded bg-pine-950/10" />
                </div>
              ))}
            </div>
          ) : wishlist.length === 0 ? (
            <div className="rounded-lg border border-dashed border-pine-950/20 px-6 py-14 text-center">
              <p className="text-sm text-muted">
                Tap the heart on any saree to keep it here.
              </p>
              <Link
                href="/shop"
                className="mt-4 inline-flex h-10 items-center rounded-md bg-pine-900 px-5 font-inter text-xs font-semibold text-white transition-colors hover:bg-pine-950"
              >
                Browse sarees
              </Link>
            </div>
          ) : saved.length === 0 ? (
            <div className="rounded-lg border border-dashed border-pine-950/20 px-6 py-14 text-center">
              <p className="text-sm text-muted">
                The saved pieces are no longer available in the catalog.
              </p>
              <Link
                href="/shop"
                className="mt-4 inline-flex h-10 items-center rounded-md bg-pine-900 px-5 font-inter text-xs font-semibold text-white transition-colors hover:bg-pine-950"
              >
                Browse sarees
              </Link>
            </div>
          ) : (
            <>
              {partialError && (
                <div className="mb-6 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-800">
                  <span>{partialError}</span>
                  <button
                    type="button"
                    onClick={() => setRetryNonce((c) => c + 1)}
                    className="font-medium underline hover:text-amber-950 cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}
              {error && (
                <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50/70 px-4 py-3 text-xs text-red-800">
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={() => setRetryNonce((c) => c + 1)}
                    className="font-medium underline hover:text-red-950 cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                {saved.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
