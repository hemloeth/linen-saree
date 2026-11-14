"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useStore } from "@/components/StoreProvider";
import ProductCard from "@/components/ProductCard";
import { fetchPaginatedProducts } from "@/lib/api/products";

function normalizeSlug(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function FilteredProducts({ kind, value }) {
  const { categories, collectionsData } = useStore();
  const decode = decodeURIComponent(value || "");
  const slug = normalizeSlug(decode);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const activeRequestId = useRef(0);

  const matchedCategory = useMemo(() => {
    return categories.find(
      (c) => normalizeSlug(c.name) === slug || c.id === decode || c.name?.toLowerCase() === decode.toLowerCase()
    );
  }, [categories, slug, decode]);

  const matchedCollection = useMemo(() => {
    return collectionsData.find(
      (c) =>
        normalizeSlug(c.key || c.id) === slug ||
        normalizeSlug(c.name) === slug ||
        c.key === decode ||
        c.id === decode ||
        c.name?.toLowerCase() === decode.toLowerCase()
    );
  }, [collectionsData, slug, decode]);

  const displayName = useMemo(() => {
    if (kind === "category") {
      if (slug === "new-arrivals") return "New Arrivals";
      if (slug === "sale") return "Sale Sarees";
      if (slug === "handloom") return "Handloom Sarees";
      return matchedCategory?.name || decode;
    }
    if (kind === "collection") {
      if (slug === "new-arrivals") return "New Arrivals";
      if (slug === "big-sale" || slug === "sale") return "Sale Collection";
      return matchedCollection?.name || decode;
    }
    if (kind === "bestseller") {
      return "Best Sellers";
    }
    return decode;
  }, [kind, slug, matchedCategory, matchedCollection, decode]);

  useEffect(() => {
    const requestId = ++activeRequestId.current;
    setLoading(true);
    setError(null);

    const queryParams = {
      page,
      limit: 32,
    };

    if (kind === "bestseller") {
      queryParams.isBestSeller = true;
      queryParams.sortBy = "featured";
    } else if (kind === "category") {
      if (slug === "new-arrivals") {
        queryParams.sortBy = "newest";
      } else if (slug === "sale") {
        queryParams.isOnSale = true;
      } else if (slug === "handloom") {
        queryParams.search = "handloom";
      } else {
        queryParams.category = matchedCategory?.name || decode;
      }
    } else if (kind === "collection") {
      if (slug === "new-arrivals") {
        queryParams.sortBy = "newest";
      } else if (slug === "big-sale" || slug === "sale") {
        queryParams.isOnSale = true;
      } else {
        queryParams.collection = matchedCollection?.key || matchedCollection?.name || decode;
      }
    }

    fetchPaginatedProducts(queryParams)
      .then((res) => {
        if (requestId !== activeRequestId.current) return;
        setProducts(res.products || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalCount(res.pagination?.totalProducts ?? (res.products?.length || 0));
        setLoading(false);
      })
      .catch((err) => {
        if (requestId !== activeRequestId.current) return;
        console.error("FilteredProducts load failed:", err);
        setError("Failed to load products. Please try again.");
        setLoading(false);
      });
  }, [kind, slug, decode, matchedCategory, matchedCollection, page]);

  return (
    <main className="mx-auto max-w-[1240px] flex-1 px-4 py-6 sm:py-8 lg:px-10 lg:py-12">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 lg:mb-6">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-y-1 text-[11px] text-muted">
          <Link href="/" className="hover:text-pine-900 transition-colors">
            Home
          </Link>
          <span className="px-1.5">/</span>
          <Link
            href={kind === "category" ? "/categories" : "/collections"}
            className="hover:text-pine-900 transition-colors"
          >
            {kind === "category" ? "Categories" : "Collections"}
          </Link>
          <span className="px-1.5">/</span>
          <span className="text-pine-900 font-medium truncate max-w-[200px] sm:max-w-none">{displayName}</span>
        </nav>

        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = kind === "category" ? "/categories" : "/collections";
              }
            }
          }}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-pine-950/15 bg-white px-3 py-1 font-inter text-[11px] font-semibold text-pine-900 shadow-xs transition hover:bg-cream-surface active:scale-95"
          aria-label="Go back to previous page"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>Back</span>
        </button>
      </div>

      <div className="flex flex-col gap-2 border-b border-pine-950/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-[0.12em] text-pine-950 lg:text-3xl">
            {displayName}
          </h1>
          <p className="mt-1.5 text-xs text-muted lg:text-sm">
            {matchedCollection?.description ||
              matchedCategory?.description ||
              (loading ? "Loading handcrafted sarees..." : `Showing ${totalCount} handcrafted sarees`)}
          </p>
        </div>
        {!loading && <span className="text-xs text-pine-900 font-medium">{totalCount} products</span>}
      </div>

      {loading ? (
        <div className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/3.7] animate-pulse rounded-xl bg-chip" />
          ))}
        </div>
      ) : error ? (
        <p role="alert" className="mt-8 text-sm text-red-700">
          {error}
        </p>
      ) : products.length === 0 ? (
        <div className="mt-12 rounded-lg border border-dashed border-pine-950/15 p-12 text-center">
          <p className="text-sm text-muted">No sarees found in this collection yet.</p>
          <Link
            href="/shop"
            className="mt-4 inline-block rounded-full bg-pine-900 px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-pine-950"
          >
            Explore all sarees
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-md border border-pine-950/20 bg-white px-3.5 py-1.5 text-xs font-medium text-pine-950 transition hover:bg-linen disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="font-inter text-xs text-muted">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-md border border-pine-950/20 bg-white px-3.5 py-1.5 text-xs font-medium text-pine-950 transition hover:bg-linen disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
