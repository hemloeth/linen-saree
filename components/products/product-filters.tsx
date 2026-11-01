"use client"

import { useState, useEffect, useMemo } from "react"
import { ChevronDown, X, RotateCcw, Check, SlidersHorizontal, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  FilterOptions,
  SortOption,
  getPriceRange,
  getFilterCounts,
  type FilterCounts,
  type Product
} from "@/lib/products"

const STANDARD_COLORS = [
  "Black", "Blue", "Brown", "Golden", "Gray", "Green", "Maroon",
  "Multicolor", "Orange", "Pink", "Purple", "Red", "Silver", "Teal",
  "White", "Yellow",
]

const COLOR_SWATCH_MAP: Record<string, string> = {
  black: "#111111",
  blue: "#2563EB",
  brown: "#78350F",
  golden: "#D97706",
  gray: "#6B7280",
  green: "#059669",
  maroon: "#881337",
  multicolor: "linear-gradient(135deg, #EF4444 0%, #F59E0B 33%, #10B981 66%, #3B82F6 100%)",
  orange: "#EA580C",
  pink: "#EC4899",
  purple: "#9333EA",
  red: "#DC2626",
  silver: "#94A3B8",
  teal: "#0D9488",
  white: "#FFFFFF",
  yellow: "#EAB308",
}

interface BackendCategory {
  _id: string
  name: string
  sortDesc: string
  image: string
}

interface FilterCategory {
  slug: string
  name: string
}

interface ProductFiltersProps {
  filters: FilterOptions
  sortBy: SortOption
  onFiltersChange: (filters: FilterOptions) => void
  onSortChange: (sortBy: SortOption) => void
  showFilters?: boolean
  onToggleFilters?: () => void
  products: Product[]
}

export function ProductFilters({
  filters,
  sortBy,
  onFiltersChange,
  onSortChange,
  showFilters = false,
  onToggleFilters,
  products
}: ProductFiltersProps) {
  const [colors, setColors] = useState<string[]>([])
  const [fabrics, setFabrics] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 })
  const [localPriceRange, setLocalPriceRange] = useState({
    min: filters.priceRange?.min ?? 0,
    max: filters.priceRange?.max ?? 10000
  })
  const [categories, setCategories] = useState<FilterCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [counts, setCounts] = useState<FilterCounts | null>(null)

  // Collapsible section states with intuitive defaults
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
    colors: true,
    fabrics: true,
    special: true
  })

  const [showAllColors, setShowAllColors] = useState(false)
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [showAllFabrics, setShowAllFabrics] = useState(false)

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { apiGet } = await import("@/lib/api")
        const data = await apiGet('/api/category/allcategory')
        if (data.categories) {
          const mapped = data.categories.map((c: BackendCategory) => ({
            slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
            name: c.name,
          }))
          setCategories(mapped)
        }
      } catch (err) {
        console.error("Failed to fetch product filter categories:", err)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchGlobalFilters = async () => {
      try {
        const { apiGet } = await import("@/lib/api")
        const data = await apiGet('/api/product/filters')
        if (data.success) {
          setColors(data.colors || [])
          setFabrics(data.materials || [])
        }
      } catch (err) {
        console.error("Failed to fetch product filters:", err)
      }
    }
    fetchGlobalFilters()
  }, [])

  useEffect(() => {
    if (products?.length > 0) {
      setCounts(getFilterCounts(products))

      const newRange = getPriceRange(products)
      setPriceRange(newRange)
      setLocalPriceRange({
        min: filters.priceRange?.min ?? newRange.min,
        max: filters.priceRange?.max ?? newRange.max
      })
    }
  }, [products])

  useEffect(() => {
    setLocalPriceRange({
      min: filters.priceRange?.min ?? priceRange.min,
      max: filters.priceRange?.max ?? priceRange.max
    })
  }, [filters.priceRange, priceRange])

  const handleCategoryChange = (categorySlug: string, checked: boolean) => {
    const currentCategories = filters.categories || []
    const newCategories = checked
      ? [...currentCategories, categorySlug]
      : currentCategories.filter(c => c !== categorySlug)

    onFiltersChange({
      ...filters,
      categories: newCategories.length > 0 ? newCategories : undefined
    })
  }

  const handleColorChange = (color: string, checked: boolean) => {
    const currentColors = filters.colors || []
    const newColors = checked
      ? [...currentColors, color]
      : currentColors.filter(c => c !== color)

    onFiltersChange({
      ...filters,
      colors: newColors.length > 0 ? newColors : undefined
    })
  }

  const handleFabricChange = (fabric: string, checked: boolean) => {
    const currentFabrics = filters.fabrics || []
    const newFabrics = checked
      ? [...currentFabrics, fabric]
      : currentFabrics.filter(f => f !== fabric)

    onFiltersChange({
      ...filters,
      fabrics: newFabrics.length > 0 ? newFabrics : undefined
    })
  }

  const handlePriceCommit = (min: number, max: number) => {
    onFiltersChange({
      ...filters,
      priceRange: { min, max }
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({})
    setLocalPriceRange({ min: priceRange.min, max: priceRange.max })
  }

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.categories?.length) count += filters.categories.length
    if (filters.colors?.length) count += filters.colors.length
    if (filters.fabrics?.length) count += filters.fabrics.length
    if (filters.priceRange) count += 1
    if (filters.isOnSale) count += 1
    if (filters.isFeatured) count += 1
    if (filters.isNew) count += 1
    return count
  }, [filters])

  const colorOptions = useMemo(() => {
    const lowerToDisplay = new Map<string, string>()
    const push = (c?: string) => {
      const t = (c || "").trim()
      if (!t) return
      const k = t.toLowerCase()
      if (!lowerToDisplay.has(k)) lowerToDisplay.set(k, t)
    }
    colors.forEach(push)
    STANDARD_COLORS.forEach(push)

    const countByLower: Record<string, number> = {}
    if (counts?.colors) {
      for (const [k, v] of Object.entries(counts.colors)) countByLower[k.toLowerCase()] = v
    }

    const arr = [...lowerToDisplay.values()].map((name) => ({
      name,
      count: countByLower[name.toLowerCase()] || 0,
    }))

    arr.sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name))
    return arr
  }, [colors, counts])

  return (
    <aside className="w-full bg-card border border-border shadow-xs select-none">
      {/* Refined Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <h3 className="font-serif text-lg tracking-wide text-foreground font-medium">
            Filters
          </h3>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 text-[11px] font-mono font-bold bg-primary text-primary-foreground rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors cursor-pointer group"
          >
            <RotateCcw className="w-3 h-3 group-hover:-rotate-45 transition-transform" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Active Filter Chips Bar */}
      {activeFilterCount > 0 && (
        <div className="p-3.5 border-b border-border/80 bg-muted/10 flex flex-wrap gap-1.5 animate-in fade-in duration-200">
          {filters.categories?.map(slug => {
            const cat = categories.find(c => c.slug === slug)
            return (
              <button
                key={`chip-cat-${slug}`}
                onClick={() => handleCategoryChange(slug, false)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-background border border-border text-foreground hover:border-destructive/40 hover:text-destructive transition-colors group cursor-pointer"
                title={`Remove ${cat?.name || slug}`}
              >
                <span>{cat?.name || slug}</span>
                <X className="w-3 h-3 text-muted-foreground group-hover:text-destructive" />
              </button>
            )
          })}

          {filters.colors?.map(color => (
            <button
              key={`chip-col-${color}`}
              onClick={() => handleColorChange(color, false)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-background border border-border text-foreground hover:border-destructive/40 hover:text-destructive transition-colors group cursor-pointer"
              title={`Remove ${color}`}
            >
              <span>{color}</span>
              <X className="w-3 h-3 text-muted-foreground group-hover:text-destructive" />
            </button>
          ))}

          {filters.fabrics?.map(fabric => (
            <button
              key={`chip-fab-${fabric}`}
              onClick={() => handleFabricChange(fabric, false)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-background border border-border text-foreground hover:border-destructive/40 hover:text-destructive transition-colors group cursor-pointer"
              title={`Remove ${fabric}`}
            >
              <span>{fabric}</span>
              <X className="w-3 h-3 text-muted-foreground group-hover:text-destructive" />
            </button>
          ))}

          {filters.isOnSale && (
            <button
              onClick={() => onFiltersChange({ ...filters, isOnSale: undefined })}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-orange-500/10 border border-orange-500/30 text-orange-700 dark:text-orange-400 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-colors group cursor-pointer"
            >
              <span>On Sale</span>
              <X className="w-3 h-3" />
            </button>
          )}

          {filters.isNew && (
            <button
              onClick={() => onFiltersChange({ ...filters, isNew: undefined })}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-primary/10 border border-primary/30 text-primary hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-colors group cursor-pointer"
            >
              <span>New Arrivals</span>
              <X className="w-3 h-3" />
            </button>
          )}

          {filters.priceRange && (
            <button
              onClick={() => onFiltersChange({ ...filters, priceRange: undefined })}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-background border border-border text-foreground hover:border-destructive/40 hover:text-destructive transition-colors group cursor-pointer"
            >
              <span>₹{filters.priceRange.min} - ₹{filters.priceRange.max}</span>
              <X className="w-3 h-3 text-muted-foreground group-hover:text-destructive" />
            </button>
          )}
        </div>
      )}

      {/* Accordion Filter Sections */}
      <div className="divide-y divide-border/60">
        
        {/* SECTION 1: CATEGORIES */}
        <div className="p-5">
          <button
            onClick={() => toggleSection('categories')}
            className="flex items-center justify-between w-full text-left font-serif text-sm tracking-wide text-foreground hover:text-primary transition-colors cursor-pointer group"
          >
            <span className="font-medium uppercase tracking-[0.12em] text-xs font-sans">
              Categories
            </span>
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-200 group-hover:text-foreground",
              openSections.categories && "rotate-180"
            )} />
          </button>

          {openSections.categories && (
            <div className="mt-3.5 space-y-1.5 animate-in fade-in duration-150">
              {loadingCategories ? (
                <div className="animate-pulse space-y-2 pt-1">
                  <div className="h-4 bg-muted w-3/4" />
                  <div className="h-4 bg-muted w-1/2" />
                  <div className="h-4 bg-muted w-5/6" />
                </div>
              ) : categories.length > 0 ? (
                <>
                  {(showAllCategories ? categories : categories.slice(0, 6)).map((category, idx) => {
                    const isChecked = filters.categories?.includes(category.slug) || false
                    const count = counts?.categories[category.slug]
                    return (
                      <label
                        key={`cat-${category.slug}-${idx}`}
                        className={cn(
                          "flex items-center justify-between px-2.5 py-1.5 rounded-none text-xs sm:text-sm cursor-pointer transition-colors group",
                          isChecked ? "bg-primary/10 text-primary font-medium" : "text-foreground/80 hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={cn(
                            "w-4 h-4 border flex items-center justify-center transition-colors rounded-none shrink-0",
                            isChecked ? "bg-primary border-primary text-primary-foreground" : "border-border bg-background group-hover:border-foreground/50"
                          )}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="truncate">{category.name}</span>
                        </div>
                        {count !== undefined && (
                          <span className="text-[11px] font-mono text-muted-foreground/70 shrink-0 ml-2">
                            {count}
                          </span>
                        )}
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleCategoryChange(category.slug, e.target.checked)}
                          className="sr-only"
                        />
                      </label>
                    )
                  })}

                  {categories.length > 6 && (
                    <button
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="text-xs font-mono text-primary hover:underline pt-1.5 px-2.5 block cursor-pointer"
                    >
                      {showAllCategories ? "- Show less" : `+ ${categories.length - 6} more`}
                    </button>
                  )}
                </>
              ) : (
                <span className="text-xs text-muted-foreground px-2.5">No categories found</span>
              )}
            </div>
          )}
        </div>

        {/* SECTION 2: PRICE RANGE */}
        <div className="p-5">
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full text-left font-serif text-sm tracking-wide text-foreground hover:text-primary transition-colors cursor-pointer group"
          >
            <span className="font-medium uppercase tracking-[0.12em] text-xs font-sans">
              Price Range
            </span>
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-200 group-hover:text-foreground",
              openSections.price && "rotate-180"
            )} />
          </button>

          {openSections.price && (
            <div className="mt-4 space-y-4 animate-in fade-in duration-150">
              {/* Dual Range Slider Controls */}
              <div className="space-y-2">
                <div className="relative pt-1">
                  <input
                    type="range"
                    min={priceRange.min}
                    max={priceRange.max}
                    step={100}
                    value={localPriceRange.max}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setLocalPriceRange(prev => ({ ...prev, max: val }))
                    }}
                    onMouseUp={() => handlePriceCommit(localPriceRange.min, localPriceRange.max)}
                    onTouchEnd={() => handlePriceCommit(localPriceRange.min, localPriceRange.max)}
                    className="w-full accent-primary cursor-pointer h-1.5 bg-muted rounded-none"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex-1">
                    <span className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Min (₹)</span>
                    <input
                      type="number"
                      value={localPriceRange.min}
                      onChange={(e) => setLocalPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                      onBlur={() => handlePriceCommit(localPriceRange.min, localPriceRange.max)}
                      min={priceRange.min}
                      max={localPriceRange.max}
                      className="w-full px-2 py-1 text-xs border border-border bg-background focus:outline-none focus:border-foreground"
                    />
                  </div>
                  <span className="text-muted-foreground mt-4 text-xs">—</span>
                  <div className="flex-1">
                    <span className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Max (₹)</span>
                    <input
                      type="number"
                      value={localPriceRange.max}
                      onChange={(e) => setLocalPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                      onBlur={() => handlePriceCommit(localPriceRange.min, localPriceRange.max)}
                      min={localPriceRange.min}
                      max={priceRange.max}
                      className="w-full px-2 py-1 text-xs border border-border bg-background focus:outline-none focus:border-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { label: "Under ₹3k", min: priceRange.min, max: 3000 },
                  { label: "₹3k – ₹5k", min: 3000, max: 5000 },
                  { label: "Above ₹5k", min: 5000, max: priceRange.max }
                ].map(preset => {
                  const isPresetActive = filters.priceRange?.min === preset.min && filters.priceRange?.max === preset.max
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setLocalPriceRange({ min: preset.min, max: preset.max })
                        handlePriceCommit(preset.min, preset.max)
                      }}
                      className={cn(
                        "px-2.5 py-1 text-[11px] font-mono tracking-tight border transition-colors cursor-pointer",
                        isPresetActive
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border text-foreground hover:bg-muted"
                      )}
                    >
                      {preset.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: COLORS (Visual Swatch Grid + List) */}
        <div className="p-5">
          <button
            onClick={() => toggleSection('colors')}
            className="flex items-center justify-between w-full text-left font-serif text-sm tracking-wide text-foreground hover:text-primary transition-colors cursor-pointer group"
          >
            <span className="font-medium uppercase tracking-[0.12em] text-xs font-sans">
              Color Palette
            </span>
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-200 group-hover:text-foreground",
              openSections.colors && "rotate-180"
            )} />
          </button>

          {openSections.colors && (
            <div className="mt-3.5 space-y-3 animate-in fade-in duration-150">
              {/* Visual Color Dots Bar */}
              <div className="flex flex-wrap gap-2 pt-1 pb-1">
                {colorOptions.slice(0, 10).map((opt) => {
                  const isChecked = filters.colors?.includes(opt.name) || false
                  const swatch = COLOR_SWATCH_MAP[opt.name.toLowerCase()] || "#9CA3AF"
                  return (
                    <button
                      key={`swatch-${opt.name}`}
                      type="button"
                      onClick={() => handleColorChange(opt.name, !isChecked)}
                      className={cn(
                        "relative w-6 h-6 rounded-full transition-transform hover:scale-110 flex items-center justify-center cursor-pointer border shadow-2xs",
                        isChecked ? "ring-2 ring-primary ring-offset-2 border-primary" : "border-black/20 dark:border-white/20"
                      )}
                      style={{ background: swatch }}
                      title={`${opt.name} (${opt.count})`}
                    >
                      {isChecked && (
                        <Check className={cn(
                          "w-3.5 h-3.5 stroke-[3]",
                          ["white", "silver", "yellow"].includes(opt.name.toLowerCase()) ? "text-black" : "text-white"
                        )} />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Color List with Product Counts */}
              <div className="space-y-1.5 pt-1">
                {(showAllColors ? colorOptions : colorOptions.slice(0, 6)).map((opt) => {
                  const isChecked = filters.colors?.includes(opt.name) || false
                  const swatch = COLOR_SWATCH_MAP[opt.name.toLowerCase()] || "#9CA3AF"
                  return (
                    <label
                      key={`col-${opt.name}`}
                      className={cn(
                        "flex items-center justify-between px-2.5 py-1.5 rounded-none text-xs sm:text-sm cursor-pointer transition-colors group",
                        isChecked ? "bg-primary/10 text-primary font-medium" : "text-foreground/80 hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-black/20 dark:border-white/20 shrink-0"
                          style={{ background: swatch }}
                        />
                        <span className="truncate">{opt.name}</span>
                      </div>
                      {opt.count > 0 && (
                        <span className="text-[11px] font-mono text-muted-foreground/70 shrink-0 ml-2">
                          {opt.count}
                        </span>
                      )}
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleColorChange(opt.name, e.target.checked)}
                        className="sr-only"
                      />
                    </label>
                  )
                })}

                {colorOptions.length > 6 && (
                  <button
                    onClick={() => setShowAllColors(!showAllColors)}
                    className="text-xs font-mono text-primary hover:underline pt-1.5 px-2.5 block cursor-pointer"
                  >
                    {showAllColors ? "- Show less" : `+ ${colorOptions.length - 6} more`}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: FABRIC */}
        <div className="p-5">
          <button
            onClick={() => toggleSection('fabrics')}
            className="flex items-center justify-between w-full text-left font-serif text-sm tracking-wide text-foreground hover:text-primary transition-colors cursor-pointer group"
          >
            <span className="font-medium uppercase tracking-[0.12em] text-xs font-sans">
              Fabric Weave
            </span>
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-200 group-hover:text-foreground",
              openSections.fabrics && "rotate-180"
            )} />
          </button>

          {openSections.fabrics && (
            <div className="mt-3.5 space-y-1.5 animate-in fade-in duration-150">
              {(showAllFabrics ? fabrics : fabrics.slice(0, 6)).map((fabric, idx) => {
                const isChecked = filters.fabrics?.includes(fabric) || false
                const count = counts?.fabrics[fabric]
                return (
                  <label
                    key={`fab-${fabric}-${idx}`}
                    className={cn(
                      "flex items-center justify-between px-2.5 py-1.5 rounded-none text-xs sm:text-sm cursor-pointer transition-colors group",
                      isChecked ? "bg-primary/10 text-primary font-medium" : "text-foreground/80 hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={cn(
                        "w-4 h-4 border flex items-center justify-center transition-colors rounded-none shrink-0",
                        isChecked ? "bg-primary border-primary text-primary-foreground" : "border-border bg-background group-hover:border-foreground/50"
                      )}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{fabric}</span>
                    </div>
                    {count !== undefined && (
                      <span className="text-[11px] font-mono text-muted-foreground/70 shrink-0 ml-2">
                        {count}
                      </span>
                    )}
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleFabricChange(fabric, e.target.checked)}
                      className="sr-only"
                    />
                  </label>
                )
              })}

              {fabrics.length > 6 && (
                <button
                  onClick={() => setShowAllFabrics(!showAllFabrics)}
                  className="text-xs font-mono text-primary hover:underline pt-1.5 px-2.5 block cursor-pointer"
                >
                  {showAllFabrics ? "- Show less" : `+ ${fabrics.length - 6} more`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* SECTION 5: CURATED EDITS */}
        <div className="p-5">
          <button
            onClick={() => toggleSection('special')}
            className="flex items-center justify-between w-full text-left font-serif text-sm tracking-wide text-foreground hover:text-primary transition-colors cursor-pointer group"
          >
            <span className="font-medium uppercase tracking-[0.12em] text-xs font-sans">
              Curated Edits
            </span>
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-200 group-hover:text-foreground",
              openSections.special && "rotate-180"
            )} />
          </button>

          {openSections.special && (
            <div className="mt-3.5 space-y-1.5 animate-in fade-in duration-150">
              <label
                className={cn(
                  "flex items-center justify-between px-2.5 py-1.5 rounded-none text-xs sm:text-sm cursor-pointer transition-colors group",
                  filters.isOnSale ? "bg-orange-500/10 text-orange-600 font-medium" : "text-foreground/80 hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-4 h-4 border flex items-center justify-center transition-colors rounded-none shrink-0",
                    filters.isOnSale ? "bg-orange-600 border-orange-600 text-white" : "border-border bg-background group-hover:border-foreground/50"
                  )}>
                    {filters.isOnSale && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>On Sale</span>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-600 bg-orange-100 dark:bg-orange-950/60 px-1.5 py-0.5">
                  Sale
                </span>
                <input
                  type="checkbox"
                  checked={filters.isOnSale || false}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    isOnSale: e.target.checked ? true : undefined
                  })}
                  className="sr-only"
                />
              </label>

              <label
                className={cn(
                  "flex items-center justify-between px-2.5 py-1.5 rounded-none text-xs sm:text-sm cursor-pointer transition-colors group",
                  filters.isNew ? "bg-primary/10 text-primary font-medium" : "text-foreground/80 hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-4 h-4 border flex items-center justify-center transition-colors rounded-none shrink-0",
                    filters.isNew ? "bg-primary border-primary text-primary-foreground" : "border-border bg-background group-hover:border-foreground/50"
                  )}>
                    {filters.isNew && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>New Arrivals</span>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5">
                  New
                </span>
                <input
                  type="checkbox"
                  checked={filters.isNew || false}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    isNew: e.target.checked ? true : undefined
                  })}
                  className="sr-only"
                />
              </label>

              <label
                className={cn(
                  "flex items-center justify-between px-2.5 py-1.5 rounded-none text-xs sm:text-sm cursor-pointer transition-colors group",
                  filters.isFeatured ? "bg-primary/10 text-primary font-medium" : "text-foreground/80 hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-4 h-4 border flex items-center justify-center transition-colors rounded-none shrink-0",
                    filters.isFeatured ? "bg-primary border-primary text-primary-foreground" : "border-border bg-background group-hover:border-foreground/50"
                  )}>
                    {filters.isFeatured && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>Featured Collection</span>
                </div>
                <Sparkles className="w-3 h-3 text-amber-500" />
                <input
                  type="checkbox"
                  checked={filters.isFeatured || false}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    isFeatured: e.target.checked ? true : undefined
                  })}
                  className="sr-only"
                />
              </label>
            </div>
          )}
        </div>

      </div>
    </aside>
  )
}
