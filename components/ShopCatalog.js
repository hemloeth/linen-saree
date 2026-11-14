"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { formatINR } from "@/lib/data";
import { useStore } from "@/components/StoreProvider";

const PRICE_BANDS = [
  { key: "under-2000", label: "Under Rs. 2,000", test: (p) => p < 2000 },
  { key: "2000-4000", label: "Rs. 2,000 – 4,000", test: (p) => p >= 2000 && p < 4000 },
  { key: "4000-7000", label: "Rs. 4,000 – 7,000", test: (p) => p >= 4000 && p < 7000 },
  { key: "above-7000", label: "Above Rs. 7,000", test: (p) => p >= 7000 },
];


const SORTS = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "rating", label: "Customer rating" },
  { key: "new", label: "Newest first" },
];

function FilterGroup({ title, children }) {
  return (
    <div className="border-b border-pine-950/10 py-4">
      <h3 className="font-inter text-[11px] font-semibold uppercase tracking-wider text-pine-950">
        {title}
      </h3>
      <div className="mt-2.5 space-y-1.5">{children}</div>
    </div>
  );
}

function Check({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 accent-[#0c3c3c]"
      />
      {label}
    </label>
  );
}

export default function ShopCatalog() {
  const { catalog: products, catalogLoading, catalogError } = useStore();
  const FABRICS = [...new Set(products.map((p) => p.fabric).filter(Boolean))].sort();
  const COLOURS = [...new Set(products.map((p) => p.colour).filter(Boolean))].sort();
  const [bands, setBands] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [colours, setColours] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggle = (list, setList, value) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const results = useMemo(() => {
    const activeBands = PRICE_BANDS.filter((band) => bands.includes(band.key));
    const filtered = products.filter((product) => {
      if (activeBands.length && !activeBands.some((band) => band.test(product.price))) return false;
      if (fabrics.length && !fabrics.includes(product.fabric)) return false;
      if (colours.length && !colours.includes(product.colour)) return false;
      if (inStockOnly && !product.inStock) return false;
      return true;
    });

    const sorted = [...filtered];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "new":
        sorted.sort((a, b) => Number(b.isNew) - Number(a.isNew));
        break;
      default:
        break;
    }
    return sorted;
  }, [products, bands, fabrics, colours, inStockOnly, sort]);

  const activeCount = bands.length + fabrics.length + colours.length + (inStockOnly ? 1 : 0);

  function clearAll() {
    setBands([]);
    setFabrics([]);
    setColours([]);
    setInStockOnly(false);
  }

  const filterPanel = (
    <>
      <FilterGroup title="Price">
        {PRICE_BANDS.map((band) => (
          <Check
            key={band.key}
            label={band.label}
            checked={bands.includes(band.key)}
            onChange={() => toggle(bands, setBands, band.key)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Fabric">
        {FABRICS.map((fabric) => (
          <Check
            key={fabric}
            label={fabric}
            checked={fabrics.includes(fabric)}
            onChange={() => toggle(fabrics, setFabrics, fabric)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Colour">
        {COLOURS.map((colour) => (
          <Check
            key={colour}
            label={colour}
            checked={colours.includes(colour)}
            onChange={() => toggle(colours, setColours, colour)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Availability">
        <Check
          label="In stock only"
          checked={inStockOnly}
          onChange={() => setInStockOnly((value) => !value)}
        />
      </FilterGroup>

      {activeCount > 0 ? (
        <button
          type="button"
          onClick={clearAll}
          className="mt-3 font-inter text-[11px] text-muted underline underline-offset-2 hover:text-pine-900"
        >
          Clear all filters
        </button>
      ) : null}
    </>
  );

  return (
    <div className="lg:flex lg:gap-10">
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-[calc(var(--header-offset)+16px)]">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-pine-950">
              Filters
            </h2>
            {activeCount > 0 ? (
              <span className="rounded-full bg-pine-900 px-1.5 py-0.5 font-inter text-[10px] text-white">
                {activeCount}
              </span>
            ) : null}
          </div>
          {filterPanel}
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {catalogError && <p role="alert" className="mb-4 text-sm text-red-700">Unable to load products: {catalogError}</p>}
        {catalogLoading && <p className="mb-4 text-sm text-muted">Loading products…</p>}
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs text-muted">
            {results.length} of {products.length} sarees
            {activeCount > 0 ? ` · ${activeCount} filter${activeCount === 1 ? "" : "s"}` : ""}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-md border border-pine-950/15 px-3 font-inter text-[11px] font-medium text-pine-900 lg:hidden"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
              Filters{activeCount > 0 ? ` (${activeCount})` : ""}
            </button>

            <label className="flex items-center gap-1.5 text-[11px] text-muted">
              <span className="hidden sm:inline">Sort</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label="Sort products"
                className="h-9 rounded-md border border-pine-950/15 bg-white px-2 font-inter text-[11px] text-pine-950 outline-none"
              >
                {SORTS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {results.length === 0 ? (
          <p className="rounded-lg border border-dashed border-pine-950/20 px-6 py-14 text-center text-sm text-muted">
            No sarees match these filters.{" "}
            <button type="button" onClick={clearAll} className="underline underline-offset-2">
              Clear filters
            </button>
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <p className="mt-8 text-[11px] text-muted">
          Showing {results.length} piece{results.length === 1 ? "" : "s"}
          {results.length ? ` · from ${formatINR(Math.min(...results.map((p) => p.price)))}` : ""}
        </p>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
            className="absolute inset-0 bg-pine-950/45"
          />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-xs flex-col bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-pine-950/10 px-4 py-3">
              <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-pine-950">
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
                className="flex h-8 w-8 items-center justify-center rounded-full text-pine-900 hover:bg-linen"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-4 pb-4">{filterPanel}</div>
            <div className="border-t border-pine-950/10 p-3">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="h-10 w-full rounded-md bg-pine-900 font-inter text-xs font-semibold text-white"
              >
                Show {results.length} saree{results.length === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}