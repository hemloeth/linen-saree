"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/components/StoreProvider";

const POPULAR_TAGS = ["Pure Linen", "Silk", "Banarasi", "Festive", "Red", "Purple", "Georgette", "Handloom"];

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const { catalog: products } = useStore();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  const filteredProducts = useMemo(() => {
    const q = queryParam.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const haystack = [p.name, p.sku, p.fabric, p.colour, p.category, p.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [queryParam, products]);

  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10 lg:px-10 lg:py-14">
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
      <div className="mt-12 flex items-baseline justify-between border-b border-pine-950/10 pb-4">
        <div>
          <h1 className="font-display text-2xl font-semibold uppercase tracking-wide text-pine-950">
            {queryParam ? `Results for “${queryParam}”` : "All Sarees"}
          </h1>
          <p className="mt-1 text-xs text-muted">
            {filteredProducts.length} {filteredProducts.length === 1 ? "saree" : "sarees"} found
          </p>
        </div>
      </div>

      {/* Product Grid (4 columns) */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-display text-lg text-pine-950">No sarees matched your search</p>
          <p className="mt-2 text-xs text-muted">Try checking for spelling or searching for a broader term like &quot;Linen&quot; or &quot;Silk&quot;.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <Suspense fallback={<div className="py-20 text-center font-inter text-sm text-muted">Loading search results...</div>}>
          <SearchResults />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

