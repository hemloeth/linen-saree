"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { formatINR } from "@/lib/data";
import { useStore } from "@/components/StoreProvider";
import { useScrollLock } from "@/lib/useScrollLock";

const PRICE_BANDS = [
  { key: "under-2000", label: "Under Rs. 2,000", test: (p) => p < 2000 },
  { key: "2000-4000", label: "Rs. 2,000 – 4,000", test: (p) => p >= 2000 && p < 4000 },
  { key: "4000-7000", label: "Rs. 4,000 – 7,000", test: (p) => p >= 4000 && p < 7000 },
  { key: "above-7000", label: "Above Rs. 7,000", test: (p) => p >= 7000 },
];

const STANDARD_COLORS = [
  { key: "beige", label: "Beige & Cream", swatch: "#D8C7B5", regex: /beige|cream|off[\s-]?white|ivory/i },
  { key: "black", label: "Black", swatch: "#1F2421", regex: /black/i },
  { key: "blue", label: "Blue", swatch: "#2563EB", regex: /blue|sky|powder/i },
  { key: "brown", label: "Brown", swatch: "#78350F", regex: /brown/i },
  { key: "green", label: "Green", swatch: "#059669", regex: /green|olive|sage|mint/i },
  { key: "maroon", label: "Maroon & Wine", swatch: "#881337", regex: /maroon|marron|wine/i },
  { key: "multicolor", label: "Multicolor", swatch: "linear-gradient(135deg, #EF4444 0%, #F59E0B 33%, #10B981 66%, #3B82F6 100%)", regex: /multicolor|rainbow|printed|half and half|ikkat/i },
  { key: "pink", label: "Pink", swatch: "#EC4899", regex: /pink|rani/i },
  { key: "purple", label: "Purple & Lavender", swatch: "#9333EA", regex: /purple|lavender/i },
  { key: "red", label: "Red", swatch: "#DC2626", regex: /\bred\b/i },
  { key: "teal", label: "Teal", swatch: "#0D9488", regex: /teal/i },
  { key: "white", label: "White", swatch: "#FFFFFF", regex: /\bwhite\b/i },
  { key: "yellow", label: "Yellow & Mustard", swatch: "#EAB308", regex: /yellow|mustard|gold/i },
];

const STANDARD_FABRICS = [
  { key: "pure-linen", label: "Pure Linen", regex: /pure linen|handloomer|linen/i },
  { key: "tissue-linen", label: "Tissue Linen", regex: /tissue/i },
  { key: "banana-silk", label: "Banana Silk", regex: /banana/i },
  { key: "silk", label: "Silk", regex: /\bsilk\b/i },
  { key: "cotton", label: "Cotton", regex: /cotton/i },
  { key: "organza", label: "Organza", regex: /organza/i },
  { key: "georgette", label: "Georgette", regex: /georgette/i },
  { key: "muslin", label: "Muslin", regex: /muslin/i },
];

function getProductColors(product) {
  const text = `${product.colour || product.color || ""} ${product.title || product.name || ""}`.toLowerCase();
  const matched = [];
  for (const c of STANDARD_COLORS) {
    if (c.regex.test(text)) {
      matched.push(c.key);
    }
  }
  return matched.length ? matched : ["multicolor"];
}

function getProductFabrics(product) {
  const text = `${product.fabric || product.material || ""} ${product.title || product.name || ""}`.toLowerCase();
  const matched = [];
  for (const f of STANDARD_FABRICS) {
    if (f.regex.test(text)) {
      matched.push(f.key);
    }
  }
  return matched;
}

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

function Check({ label, checked, onChange, count }) {
  return (
    <label className="flex cursor-pointer items-center justify-between text-[13px] text-ink hover:text-pine-950">
      <span className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-3.5 w-3.5 rounded-sm accent-[#0c3c3c]"
        />
        <span>{label}</span>
      </span>
      {typeof count === "number" && (
        <span className="text-[11px] font-mono text-muted/70">{count}</span>
      )}
    </label>
  );
}

const ITEMS_PER_PAGE = 32;

export default function ShopCatalog() {
  const { catalog: products, catalogLoading, catalogError } = useStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [bands, setBands] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [colours, setColours] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);
  const [showAllFabrics, setShowAllFabrics] = useState(false);
  useScrollLock(filtersOpen);

  const toggle = (list, setList, value) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  // Compute product counts for each standard color
  const colorOptions = useMemo(() => {
    const counts = {};
    STANDARD_COLORS.forEach((c) => (counts[c.key] = 0));
    products.forEach((p) => {
      const keys = getProductColors(p);
      keys.forEach((k) => {
        if (counts[k] !== undefined) counts[k]++;
      });
    });

    return STANDARD_COLORS.map((c) => ({
      ...c,
      count: counts[c.key] || 0,
    }))
      .filter((c) => c.count > 0 || colours.includes(c.key))
      .sort((a, b) => b.count - a.count);
  }, [products, colours]);

  // Compute product counts for each standard fabric
  const fabricOptions = useMemo(() => {
    const counts = {};
    STANDARD_FABRICS.forEach((f) => (counts[f.key] = 0));
    products.forEach((p) => {
      const keys = getProductFabrics(p);
      keys.forEach((k) => {
        if (counts[k] !== undefined) counts[k]++;
      });
    });

    return STANDARD_FABRICS.map((f) => ({
      ...f,
      count: counts[f.key] || 0,
    }))
      .filter((f) => f.count > 0 || fabrics.includes(f.key))
      .sort((a, b) => b.count - a.count);
  }, [products, fabrics]);

  const results = useMemo(() => {
    const activeBands = PRICE_BANDS.filter((band) => bands.includes(band.key));
    const filtered = products.filter((product) => {
      if (activeBands.length && !activeBands.some((band) => band.test(product.price))) return false;
      if (fabrics.length) {
        const prodFabrics = getProductFabrics(product);
        if (!fabrics.some((f) => prodFabrics.includes(f))) return false;
      }
      if (colours.length) {
        const prodColors = getProductColors(product);
        if (!colours.some((c) => prodColors.includes(c))) return false;
      }
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

  // Total pages and pagination bounds
  const totalPages = Math.max(1, Math.ceil(results.length / ITEMS_PER_PAGE));

  // Sync page from URL query parameter on initial load or popstate
  useEffect(() => {
    const p = parseInt(searchParams.get("page"), 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    }
  }, [searchParams, totalPages]);

  // Reset to page 1 whenever any filter or sort option changes
  useEffect(() => {
    setCurrentPage(1);
  }, [bands, fabrics, colours, inStockOnly, sort]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, results.length);
  const paginatedResults = useMemo(() => {
    return results.slice(startIndex, endIndex);
  }, [results, startIndex, endIndex]);

  const goToPage = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage) return;
    setCurrentPage(pageNumber);

    const params = new URLSearchParams(searchParams.toString());
    if (pageNumber === 1) {
      params.delete("page");
    } else {
      params.set("page", String(pageNumber));
    }
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });

    // Smooth scroll to top of catalog section
    const anchor = document.getElementById("catalog-content-top");
    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const activeCount = bands.length + fabrics.length + colours.length + (inStockOnly ? 1 : 0);

  function clearAll() {
    setBands([]);
    setFabrics([]);
    setColours([]);
    setInStockOnly(false);
  }

  const displayedColors = showAllColors ? colorOptions : colorOptions.slice(0, 6);
  const displayedFabrics = showAllFabrics ? fabricOptions : fabricOptions.slice(0, 6);

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

      {/* Modern Standard Color Palette */}
      <FilterGroup title="Color Palette">
        {/* Quick Visual Swatch Bar */}
        <div className="flex flex-wrap gap-2 pt-0.5 pb-2">
          {colorOptions.map((opt) => {
            const isChecked = colours.includes(opt.key);
            const isLight = ["white", "beige", "yellow"].includes(opt.key);
            return (
              <button
                key={`swatch-${opt.key}`}
                type="button"
                onClick={() => toggle(colours, setColours, opt.key)}
                className={`relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border transition-all hover:scale-110 ${
                  isChecked
                    ? "ring-2 ring-pine-900 ring-offset-2 border-pine-900"
                    : "border-pine-950/20"
                }`}
                style={{ background: opt.swatch }}
                title={`${opt.label} (${opt.count})`}
                aria-label={`${opt.label} (${opt.count} items)`}
              >
                {isChecked && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isLight ? "#111827" : "#FFFFFF"}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Color List with Dot and Counts */}
        <div className="space-y-1.5 pt-1">
          {displayedColors.map((opt) => {
            const isChecked = colours.includes(opt.key);
            return (
              <label
                key={`col-${opt.key}`}
                className="flex cursor-pointer items-center justify-between text-[13px] text-ink hover:text-pine-950"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(colours, setColours, opt.key)}
                    className="h-3.5 w-3.5 rounded-sm accent-[#0c3c3c]"
                  />
                  <span
                    className="inline-block h-3 w-3 rounded-full border border-pine-950/20 shrink-0"
                    style={{ background: opt.swatch }}
                  />
                  <span>{opt.label}</span>
                </span>
                <span className="text-[11px] font-mono text-muted/70">{opt.count}</span>
              </label>
            );
          })}

          {colorOptions.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAllColors(!showAllColors)}
              className="pt-1 font-inter text-[11px] font-medium text-pine-900 hover:underline cursor-pointer"
            >
              {showAllColors ? "- Show less" : `+ ${colorOptions.length - 6} more`}
            </button>
          )}
        </div>
      </FilterGroup>

      {/* Fabric Weave */}
      {fabricOptions.length > 0 && (
        <FilterGroup title="Fabric Weave">
          <div className="space-y-1.5">
            {displayedFabrics.map((fabric) => (
              <Check
                key={fabric.key}
                label={fabric.label}
                checked={fabrics.includes(fabric.key)}
                onChange={() => toggle(fabrics, setFabrics, fabric.key)}
                count={fabric.count}
              />
            ))}

            {fabricOptions.length > 6 && (
              <button
                type="button"
                onClick={() => setShowAllFabrics(!showAllFabrics)}
                className="pt-1 font-inter text-[11px] font-medium text-pine-900 hover:underline cursor-pointer"
              >
                {showAllFabrics ? "- Show less" : `+ ${fabricOptions.length - 6} more`}
              </button>
            )}
          </div>
        </FilterGroup>
      )}

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
          className="mt-3 font-inter text-[11px] text-muted underline underline-offset-2 hover:text-pine-900 cursor-pointer"
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

      <div id="catalog-content-top" className="min-w-0 flex-1 scroll-mt-24">
        {catalogError && <p role="alert" className="mb-4 text-sm text-red-700">Unable to load products: {catalogError}</p>}
        {catalogLoading && <p className="mb-4 text-sm text-muted">Loading products…</p>}
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs text-muted">
            Showing <span className="font-medium text-pine-950">{results.length === 0 ? 0 : startIndex + 1}</span>–<span className="font-medium text-pine-950">{endIndex}</span> of <span className="font-medium text-pine-950">{results.length}</span> sarees
            {activeCount > 0 ? ` · ${activeCount} filter${activeCount === 1 ? "" : "s"}` : ""}
            {totalPages > 1 ? ` · Page ${currentPage} of ${totalPages}` : ""}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-md border border-pine-950/15 px-3 font-inter text-[11px] font-medium text-pine-900 lg:hidden cursor-pointer"
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

        {/* Active Filter Chips */}
        {activeCount > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            {bands.map((k) => {
              const b = PRICE_BANDS.find((x) => x.key === k);
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => toggle(bands, setBands, k)}
                  className="inline-flex items-center gap-1 rounded-full border border-pine-950/15 bg-white px-2.5 py-1 text-[11px] font-medium text-pine-950 hover:bg-cream-card cursor-pointer"
                >
                  <span>{b?.label || k}</span>
                  <span className="text-muted hover:text-pine-950">&times;</span>
                </button>
              );
            })}
            {colours.map((k) => {
              const c = STANDARD_COLORS.find((x) => x.key === k);
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => toggle(colours, setColours, k)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-pine-950/15 bg-white px-2.5 py-1 text-[11px] font-medium text-pine-950 hover:bg-cream-card cursor-pointer"
                >
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full border border-pine-950/20"
                    style={{ background: c?.swatch || "#ccc" }}
                  />
                  <span>{c?.label || k}</span>
                  <span className="text-muted hover:text-pine-950">&times;</span>
                </button>
              );
            })}
            {fabrics.map((k) => {
              const f = STANDARD_FABRICS.find((x) => x.key === k);
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => toggle(fabrics, setFabrics, k)}
                  className="inline-flex items-center gap-1 rounded-full border border-pine-950/15 bg-white px-2.5 py-1 text-[11px] font-medium text-pine-950 hover:bg-cream-card cursor-pointer"
                >
                  <span>{f?.label || k}</span>
                  <span className="text-muted hover:text-pine-950">&times;</span>
                </button>
              );
            })}
            {inStockOnly && (
              <button
                type="button"
                onClick={() => setInStockOnly(false)}
                className="inline-flex items-center gap-1 rounded-full border border-pine-950/15 bg-white px-2.5 py-1 text-[11px] font-medium text-pine-950 hover:bg-cream-card cursor-pointer"
              >
                <span>In stock</span>
                <span className="text-muted hover:text-pine-950">&times;</span>
              </button>
            )}
            <button
              type="button"
              onClick={clearAll}
              className="text-[11px] font-medium text-pine-900 underline underline-offset-2 hover:text-pine-950 cursor-pointer ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {results.length === 0 ? (
          <p className="rounded-lg border border-dashed border-pine-950/20 px-6 py-14 text-center text-sm text-muted">
            No sarees match these filters.{" "}
            <button type="button" onClick={clearAll} className="underline underline-offset-2">
              Clear filters
            </button>
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-6">
            {paginatedResults.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <nav aria-label="Catalog pagination" className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-pine-950/10 pt-6 sm:flex-row">
            <p className="font-inter text-xs text-muted">
              Page <span className="font-semibold text-pine-950">{currentPage}</span> of{" "}
              <span className="font-semibold text-pine-950">{totalPages}</span>{" "}
              <span className="text-faint">({results.length} sarees total)</span>
            </p>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="Previous page"
                className={`flex h-9 items-center gap-1 rounded-md border px-3 font-inter text-xs font-medium transition-colors ${
                  currentPage <= 1
                    ? "cursor-not-allowed border-pine-950/10 bg-cream-card/30 text-muted/40"
                    : "cursor-pointer border-pine-950/20 bg-white text-pine-900 shadow-2xs hover:bg-cream-card hover:border-pine-900"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                <span className="hidden sm:inline">Prev</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => goToPage(pageNum)}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={`Page ${pageNum}`}
                    className={`flex h-9 min-w-9 items-center justify-center rounded-md px-3 font-inter text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-pine-900 text-white shadow-xs pointer-events-none"
                        : "cursor-pointer border border-pine-950/20 bg-white text-pine-900 hover:bg-cream-card hover:border-pine-900 shadow-2xs"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                aria-label="Next page"
                className={`flex h-9 items-center gap-1 rounded-md border px-3 font-inter text-xs font-medium transition-colors ${
                  currentPage >= totalPages
                    ? "cursor-not-allowed border-pine-950/10 bg-cream-card/30 text-muted/40"
                    : "cursor-pointer border-pine-950/20 bg-white text-pine-900 shadow-2xs hover:bg-cream-card hover:border-pine-900"
                }`}
              >
                <span className="hidden sm:inline">Next</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </nav>
        )}

        <p className="mt-6 text-[11px] text-muted">
          Showing {results.length === 0 ? 0 : startIndex + 1}–{endIndex} of {results.length} piece{results.length === 1 ? "" : "s"}
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
            onTouchMove={(e) => e.preventDefault()}
            className="absolute inset-0 bg-pine-950/45 backdrop-blur-[1px] touch-none"
          />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-xs flex-col bg-white shadow-2xl overscroll-contain">
            <header className="flex items-center justify-between border-b border-pine-950/10 px-4 py-3">
              <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-pine-950">
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
                className="flex h-8 w-8 items-center justify-center rounded-full text-pine-900 hover:bg-linen cursor-pointer"
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
                className="h-10 w-full rounded-md bg-pine-900 font-inter text-xs font-semibold text-white cursor-pointer"
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
