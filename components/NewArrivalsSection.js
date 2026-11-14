"use client";

import { useEffect, useState, useRef } from "react";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import productsApi, { fetchPaginatedProducts } from "@/lib/api/products";

const PAGE_SIZE = 30;

function getFetchPaginated() {
  if (typeof fetchPaginatedProducts === "function") return fetchPaginatedProducts;
  if (typeof productsApi?.fetchPaginatedProducts === "function") return productsApi.fetchPaginatedProducts;
  return null;
}

function LoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

function ProductSkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex h-full flex-col rounded-lg border border-pine-950/[0.06] bg-white overflow-hidden">
          <div className="aspect-[3/4] w-full animate-pulse bg-chip" />
          <div className="p-2 sm:p-2.5 space-y-1.5">
            <div className="h-3 w-4/5 animate-pulse rounded bg-chip" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-chip" />
            <div className="h-[34px] w-full animate-pulse rounded-md bg-chip" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NewArrivalsSection() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    let active = true;

    const fetchFn = getFetchPaginated();
    if (!fetchFn) {
      Promise.resolve().then(() => {
        if (active) {
          setError("Product service loading… please refresh.");
          setInitialLoading(false);
        }
      });
      return () => {
        active = false;
        isMountedRef.current = false;
      };
    }

    fetchFn({
      page: 1,
      limit: PAGE_SIZE,
      sortBy: "newest",
    })
      .then((data) => {
        if (!active) return;
        setProducts(data.products || []);
        setPage(1);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalProducts(data.pagination?.totalProducts || data.products?.length || 0);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Failed to load new arrivals");
      })
      .finally(() => {
        if (active) {
          setInitialLoading(false);
        }
      });

    return () => {
      active = false;
      isMountedRef.current = false;
    };
  }, []);

  const handleRetry = () => {
    const fetchFn = getFetchPaginated();
    if (!fetchFn) return;
    setInitialLoading(true);
    setError(null);
    fetchFn({
      page: 1,
      limit: PAGE_SIZE,
      sortBy: "newest",
    })
      .then((data) => {
        setProducts(data.products || []);
        setPage(1);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalProducts(data.pagination?.totalProducts || data.products?.length || 0);
      })
      .catch((err) => {
        setError(err.message || "Failed to load new arrivals");
      })
      .finally(() => {
        setInitialLoading(false);
      });
  };

  const handleViewMore = async () => {
    const fetchFn = getFetchPaginated();
    if (!fetchFn || loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const data = await fetchFn({
        page: nextPage,
        limit: PAGE_SIZE,
        sortBy: "newest",
      });

      if (!isMountedRef.current) return;

      setProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const uniqueIncoming = (data.products || []).filter((p) => !existingIds.has(p.id));
        return [...prev, ...uniqueIncoming];
      });
      setPage(nextPage);
      if (data.pagination?.totalPages) {
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Failed to load more products:", err);
    } finally {
      if (isMountedRef.current) {
        setLoadingMore(false);
      }
    }
  };

  const hasMore = page < totalPages;

  return (
    <section aria-label="New Arrivals" id="new-arrivals" className="py-8 lg:py-14">
      <div className="mx-auto max-w-[1240px] px-4 lg:px-10">
        <div className="mb-6 flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
          <div>
            <SectionHeading title="New Arrivals" />
            <p className="mt-1 text-xs text-muted lg:text-sm">
              Discover our latest collection of handcrafted pure linen and silk sarees.
            </p>
          </div>
          {totalProducts > 0 && (
            <span className="font-inter text-xs font-medium text-pine-900">
              Showing {products.length} of {totalProducts} sarees
            </span>
          )}
        </div>

        {initialLoading ? (
          <ProductSkeletonGrid count={10} />
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p role="alert" className="text-sm font-medium text-red-700">
              {error}
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-3 rounded-full bg-pine-900 px-4 py-1.5 font-inter text-xs font-semibold text-white transition-colors hover:bg-pine-950"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-pine-950/15 p-12 text-center">
            <p className="text-sm text-muted">No products available at the moment.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {hasMore ? (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={handleViewMore}
                  disabled={loadingMore}
                  aria-busy={loadingMore}
                  className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-pine-950/20 bg-white px-7 py-3 font-inter text-xs font-semibold uppercase tracking-wider text-pine-950 shadow-sm transition-all hover:border-pine-900 hover:bg-pine-900 hover:text-white disabled:pointer-events-none disabled:opacity-60"
                >
                  {loadingMore ? (
                    <>
                      <LoadingSpinner />
                      <span>Loading more sarees…</span>
                    </>
                  ) : (
                    <>
                      <span>View More Sarees</span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className="transition-transform group-hover:translate-y-0.5"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            ) : products.length > PAGE_SIZE ? (
              <p className="mt-10 text-center font-inter text-xs text-muted">
                You have reached the end of the new arrivals collection.
              </p>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
