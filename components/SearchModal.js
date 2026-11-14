"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/components/StoreProvider";
import { formatINR } from "@/lib/data";

const QUICK_TAGS = ["Silk", "Cotton", "Banarasi", "Festive", "Under Rs. 3,000"];

export default function SearchModal() {
  const router = useRouter();
  const { searchOpen, closeSearch, catalog: products } = useStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    closeSearch();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  useEffect(() => {
    if (searchOpen) {
      const id = setTimeout(() => {
        setQuery("");
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(id);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [searchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 4);
    return products
      .filter((product) =>
        [product.name, product.sku, product.fabric, product.colour]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 6);
  }, [query, products]);

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-[65] flex flex-col bg-white">
      <div className="border-b border-pine-950/10">
        <form onSubmit={handleSearchSubmit} className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4 lg:px-6">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-pine-900" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, SKU, fabric or colour… (Press Enter to view all)"
            aria-label="Search products"
            className="h-10 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-faint"
          />
          <button
            type="button"
            onClick={closeSearch}
            className="hidden shrink-0 rounded border border-pine-950/15 px-2 py-1 font-inter text-[10px] text-muted sm:block cursor-pointer"
          >
            ESC
          </button>
          <button
            type="button"
            onClick={closeSearch}
            aria-label="Close search"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-pine-900 hover:bg-linen sm:hidden cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </form>
      </div>

      <div className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 py-5 lg:px-6">
        <div className="flex flex-wrap gap-2">
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setQuery(tag.replace("Under Rs. 3,000", ""))}
              className="rounded-full border border-pine-950/15 px-3 py-1 font-inter text-[11px] text-pine-900 transition-colors hover:border-pine-900 hover:bg-linen"
            >
              {tag}
            </button>
          ))}
        </div>

        <p className="mt-6 font-inter text-[11px] font-semibold uppercase tracking-wider text-muted">
          {query.trim() ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Popular right now"}
        </p>

        {results.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            No matches for &ldquo;{query}&rdquo;. Try a fabric like silk, or a colour like red.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-pine-950/10">
            {results.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/product/${product.id}`}
                  onClick={closeSearch}
                  className="flex items-center gap-3 py-3 transition-colors hover:bg-linen/50"
                >
                  <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded bg-chip">
                    <Image unoptimized={/^https?:\/\//.test(product.image)} src={product.image} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-black">{product.name}</span>
                    <span className="mt-0.5 block text-[11px] text-muted">
                      {product.sku} · {product.fabric} · {product.colour}
                    </span>
                  </span>
                  <span className="shrink-0 font-inter text-[13px] font-semibold text-pine-900">
                    {formatINR(product.price)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {query.trim() && results.length > 0 && (
          <div className="mt-5 border-t border-pine-950/10 pt-4 text-center">
            <Link
              href={`/search?q=${encodeURIComponent(query.trim())}`}
              onClick={closeSearch}
              className="inline-flex items-center gap-1.5 font-inter text-xs font-semibold uppercase tracking-wider text-pine-900 transition-colors hover:text-pine-700 cursor-pointer"
            >
              View all results for &ldquo;{query}&rdquo; →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}