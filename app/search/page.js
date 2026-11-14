"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { fetchPaginatedProducts } from "@/lib/api/products";

const POPULAR_TAGS = ["Pure Linen", "Silk", "Banarasi", "Festive", "Red", "Purple", "Georgette", "Handloom"];

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const activeRequestId = useRef(0);

  // Sync input when URL param changes
  useEffect(() => {
    setSearchTerm(queryParam);
    setPage(1);
  }, [queryParam]);

  useEffect(() => {
    const requestId = ++activeRequestId.current;
    setLoading(true);
    setError(null);

    fetchPaginatedProducts({
      search: queryParam.trim(),
      page,
      limit: 32,
      sortBy: "newest",
    })
      .then((res) => {
        if (requestId !== activeRequestId.current) return;
        setProducts(res.products || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalCount(res.pagination?.totalProducts ?? (res.products?.length || 0));
        setLoading(false);
      })
      .catch((err) => {
        if (requestId !== activeRequestId.current) return;
        console.error("Search failed:", err);
        setError("Failed to load search results. Please try again.");
        setLoading(false);
      });
  }, [queryParam, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (trimmed !== queryParam) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:px-10 lg:py-14">
      {/* Search Bar */}
      <div className="mx-auto max-w-xl">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search pure linen sarees by weave, color, fabric..."
            className="h-12 flex-1 rounded-md border border-pine-950/20 bg-white px-4 font-inter text-sm text-ink shadow-sm outline-none transition-colors focus:border-pine-900"
          />
          <button
            type="submit"
            className="h-12 rounded-md bg-pine-900 px-6 font-inter text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-pine-950 cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Popular Tags */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="font-inter text-xs text-muted">Popular:</span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setSearchTerm(tag);
                router.push(`/search?q=${encodeURIComponent(tag)}`);
              }}
              className="cursor-pointer rounded-full bg-linen px-3 py-1 font-inter text-[11px] text-pine-950 transition-colors hover:bg-pine-950/10"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="mt-10 flex items-baseline justify-between border-b border-pine-950/10 pb-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-semibold uppercase tracking-wide text-pine-950">
            {queryParam ? `Results for “${queryParam}”` : "All Sarees"}
          </h1>
          <p className="mt-1 text-xs text-muted">
            {loading ? "Searching sarees..." : `${totalCount} ${totalCount === 1 ? "saree" : "sarees"} found`}
          </p>
        </div>
      </div>

      {/* Error state */}
      {error && !loading && (
        <div className="py-12 text-center">
          <p className="text-sm font-medium text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => setPage((p) => p)}
            className="mt-3 inline-block rounded-full bg-pine-900 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-pine-950"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col gap-2">
              <div className="aspect-[3/4] w-full rounded-md bg-pine-950/5" />
              <div className="h-4 w-3/4 rounded bg-pine-950/10" />
              <div className="h-4 w-1/3 rounded bg-pine-950/10" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="py-20 text-center">
          <p className="font-display text-lg text-pine-950">No sarees matched your search</p>
          <p className="mt-2 text-xs text-muted">
            Try checking for spelling or searching for a broader term like &quot;Linen&quot; or &quot;Silk&quot;.
          </p>
        </div>
      )}

      {/* Product Grid (4 columns) */}
      {!loading && !error && products.length > 0 && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination Controls */}
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
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream-bg">
        <Suspense
          fallback={
            <div className="mx-auto max-w-[1240px] px-6 py-20 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-pine-900 border-r-transparent" />
            </div>
          }
        >
          <SearchResults />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
