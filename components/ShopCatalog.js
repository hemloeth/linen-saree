"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { formatINR } from "@/lib/data";
import { useScrollLock } from "@/lib/useScrollLock";
import { fetchPaginatedProducts, fetchFilters } from "@/lib/api/products";

const PRICE_BANDS = [
  { key: "under-2000", label: "Under Rs. 2,000", min: 0, max: 2000 },
  { key: "2000-4000", label: "Rs. 2,000 – 4,000", min: 2000, max: 4000 },
  { key: "4000-7000", label: "Rs. 4,000 – 7,000", min: 4000, max: 7000 },
  { key: "above-7000", label: "Above Rs. 7,000", min: 7000, max: 100000 },
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

const SORTS = [
  { key: "featured", label: "Featured", backendSort: "featured" },
  { key: "new", label: "Newest first", backendSort: "newest" },
  { key: "price-asc", label: "Price: low to high", backendSort: "price-low" },
  { key: "price-desc", label: "Price: high to low", backendSort: "price-high" },
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Active filter states
  const [selectedBand, setSelectedBand] = useState("");
  const [fabrics, setFabrics] = useState([]);
  const [colours, setColours] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);
  const [showAllFabrics, setShowAllFabrics] = useState(false);
  useScrollLock(filtersOpen);

  // Server data state
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterMeta, setFilterMeta] = useState(null);
  const activeRequestId = useRef(0);
  const isFirstRender = useRef(true);

  // 1. Fetch Global Filter Metadata (Color and Fabric aggregations from database)
  useEffect(() => {
    let active = true;
    fetchFilters()
      .then((data) => {
        if (!active) return;
        setFilterMeta(data);
      })
      .catch((err) => {
        console.warn("Filters metadata failed to load:", err.message);
      });
    return () => {
      active = false;
    };
  }, []);

  const toggle = (list, setList, value) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  // Compute accurate global counts for each standard color
  const colorOptions = useMemo(() => {
    const rawCounts = filterMeta?.counts?.colors || {};
    return STANDARD_COLORS.map((c) => {
      let count = 0;
      const matchedRaw = [];
      Object.entries(rawCounts).forEach(([rawColor, cnt]) => {
        if (c.regex.test(rawColor)) {
          count += cnt;
          matchedRaw.push(rawColor);
        }
      });
      return {
        ...c,
        count,
        matchedRaw,
      };
    })
      .filter((c) => c.count > 0 || colours.includes(c.key))
      .sort((a, b) => b.count - a.count);
  }, [filterMeta, colours]);

  // Compute accurate global counts for each standard fabric
  const fabricOptions = useMemo(() => {
    const rawCounts = filterMeta?.counts?.fabrics || {};
    return STANDARD_FABRICS.map((f) => {
      let count = 0;
      const matchedRaw = [];
      Object.entries(rawCounts).forEach(([rawFabric, cnt]) => {
        if (f.regex.test(rawFabric)) {
          count += cnt;
          matchedRaw.push(rawFabric);
        }
      });
      return {
        ...f,
        count,
        matchedRaw,
      };
    })
      .filter((f) => f.count > 0 || fabrics.includes(f.key))
      .sort((a, b) => b.count - a.count);
  }, [filterMeta, fabrics]);

  // Sync initial page and price from URL query parameter
  useEffect(() => {
    const p = parseInt(searchParams.get("page"), 10);
    if (!isNaN(p) && p >= 1) {
      setCurrentPage(p);
    }
    const priceParam = searchParams.get("price");
    if (priceParam && PRICE_BANDS.some((b) => b.key === priceParam)) {
      setSelectedBand(priceParam);
    }
    const inStockParam = searchParams.get("inStock");
    if (inStockParam === "true" || inStockParam === "1") {
      setInStockOnly(true);
    }
  }, [searchParams]);

  // Reset to page 1 whenever any filter changes (after initial mount)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (selectedBand) {
      params.set("price", selectedBand);
    } else {
      params.delete("price");
    }
    if (inStockOnly) {
      params.set("inStock", "true");
    } else {
      params.delete("inStock");
    }
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }, [selectedBand, fabrics, colours, inStockOnly, sort]);

  // 2. Fetch server-paginated and server-filtered products
  useEffect(() => {
    const requestId = ++activeRequestId.current;
    setLoading(true);
    setError(null);

    // Calculate exact price bounds from single selected band
    let priceMin, priceMax;
    if (selectedBand) {
      const b = PRICE_BANDS.find((x) => x.key === selectedBand);
      if (b) {
        priceMin = b.min;
        if (b.max < 100000) {
          priceMax = b.max;
        }
      }
    }

    // Map selected colors to backend raw color tokens
    let rawColors = [];
    colours.forEach((k) => {
      const opt = colorOptions.find((o) => o.key === k);
      if (opt?.matchedRaw?.length) {
        rawColors.push(...opt.matchedRaw);
      } else {
        rawColors.push(k);
      }
    });
    const colorParam = rawColors.length ? [...new Set(rawColors)].slice(0, 30).join(",") : undefined;

    // Map selected fabrics to backend raw material tokens
    let rawFabrics = [];
    fabrics.forEach((k) => {
      const opt = fabricOptions.find((o) => o.key === k);
      if (opt?.matchedRaw?.length) {
        rawFabrics.push(...opt.matchedRaw);
      } else {
        rawFabrics.push(k);
      }
    });
    const materialParam = rawFabrics.length ? [...new Set(rawFabrics)].slice(0, 30).join(",") : undefined;

    const mappedSort = SORTS.find((s) => s.key === sort)?.backendSort || "featured";

    fetchPaginatedProducts({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      sortBy: mappedSort,
      priceMin,
      priceMax,
      inStock: inStockOnly ? "true" : undefined,
      color: colorParam,
      material: materialParam,
    })
      .then((res) => {
        if (requestId !== activeRequestId.current) return;
        setProducts(res.products || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalProducts(res.pagination?.totalProducts ?? (res.products?.length || 0));
        setLoading(false);
      })
      .catch((err) => {
        if (requestId !== activeRequestId.current) return;
        console.error("Shop products load error:", err);
        setError("Unable to load sarees. Please try again.");
        setLoading(false);
      });
  }, [currentPage, selectedBand, colours, fabrics, inStockOnly, sort, colorOptions, fabricOptions]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalProducts);

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

  const activeCount = (selectedBand ? 1 : 0) + fabrics.length + colours.length + (inStockOnly ? 1 : 0);

  function clearAll() {
    setSelectedBand("");
    setFabrics([]);
    setColours([]);
    setInStockOnly(false);
  }

  const displayedColors = showAllColors ? colorOptions : colorOptions.slice(0, 6);
  const displayedFabrics = showAllFabrics ? fabricOptions : fabricOptions.slice(0, 6);

  const filterPanel = (
    <>
      <FilterGroup title="Price">
        {PRICE_BANDS.map((band) => {
          const isSelected = selectedBand === band.key;
          return (
            <label
              key={band.key}
              className="flex cursor-pointer items-center justify-between text-[13px] text-ink hover:text-pine-950"
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="shop-price-band"
                  checked={isSelected}
                  onChange={() => setSelectedBand(isSelected ? "" : band.key)}
                  onClick={() => {
                    if (isSelected) setSelectedBand("");
                  }}
                  className="h-3.5 w-3.5 accent-[#0c3c3c]"
                />
                <span>{band.label}</span>
              </span>
            </label>
          );
        })}
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
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200 text-center">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => p)}
              className="mt-2 inline-block rounded-full bg-pine-900 px-4 py-1 text-xs font-semibold text-white transition hover:bg-pine-950 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs text-muted">
            {loading ? (
              "Loading sarees…"
            ) : (
              <>
                Showing <span className="font-medium text-pine-950">{totalProducts === 0 ? 0 : startIndex + 1}</span>–
                <span className="font-medium text-pine-950">{endIndex}</span> of{" "}
                <span className="font-medium text-pine-950">{totalProducts}</span> sarees
                {activeCount > 0 ? ` · ${activeCount} filter${activeCount === 1 ? "" : "s"}` : ""}
                {totalPages > 1 ? ` · Page ${currentPage} of ${totalPages}` : ""}
              </>
            )}
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
            {selectedBand && (
              <button
                type="button"
                onClick={() => setSelectedBand("")}
                className="inline-flex items-center gap-1 rounded-full border border-pine-950/15 bg-white px-2.5 py-1 text-[11px] font-medium text-pine-950 hover:bg-cream-card cursor-pointer"
              >
                <span>{PRICE_BANDS.find((x) => x.key === selectedBand)?.label || selectedBand}</span>
                <span className="text-muted hover:text-pine-950">&times;</span>
              </button>
            )}
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

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
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
          <div className="rounded-lg border border-dashed border-pine-950/20 px-6 py-14 text-center">
            <p className="text-sm text-muted">
              No sarees match these filters.{" "}
              <button type="button" onClick={clearAll} className="underline underline-offset-2 cursor-pointer font-medium text-pine-900">
                Clear filters
              </button>
            </p>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && totalPages > 1 && (
          <nav aria-label="Catalog pagination" className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-pine-950/10 pt-6 sm:flex-row">
            <p className="font-inter text-xs text-muted">
              Page <span className="font-semibold text-pine-950">{currentPage}</span> of{" "}
              <span className="font-semibold text-pine-950">{totalPages}</span>{" "}
              <span className="text-faint">({totalProducts} sarees total)</span>
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

        {!loading && totalProducts > 0 && (
          <p className="mt-6 text-[11px] text-muted">
            Showing {startIndex + 1}–{endIndex} of {totalProducts} pieces
          </p>
        )}
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
                Show {totalProducts} saree{totalProducts === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
