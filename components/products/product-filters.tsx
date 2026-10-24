"use client"

import { useState, useEffect, useMemo } from "react"
import { ChevronDown, X, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  FilterOptions,
  SortOption,
  getUniqueColors,
  getUniqueFabrics,
  getPriceRange,
  getFilterCounts,
  type FilterCounts,
  type Product
} from "@/lib/products"

// Curated baseline palette. These are always offered in the filter, and any
// new color an admin uses is merged in dynamically from the backend — so this
// list is a floor, never a ceiling.
const STANDARD_COLORS = [
  "Black", "Blue", "Brown", "Golden", "Gray", "Green", "Maroon",
  "Multicolor", "Orange", "Pink", "Purple", "Red", "Silver", "Teal",
  "White", "Yellow",
]

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
  showFilters = false, // Reverted back to false
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
  const [showAllColors, setShowAllColors] = useState(false)
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [showAllFabrics, setShowAllFabrics] = useState(false)

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

  // Update local price range when filters change
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

  const handlePriceRangeChange = () => {
    onFiltersChange({
      ...filters,
      priceRange: {
        min: localPriceRange.min,
        max: localPriceRange.max
      }
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({})
    setLocalPriceRange({ min: priceRange.min, max: priceRange.max })
  }

  const hasActiveFilters = !!(
    filters.categories?.length ||
    filters.colors?.length ||
    filters.fabrics?.length ||
    filters.priceRange ||
    filters.isOnSale !== undefined ||
    filters.isFeatured !== undefined ||
    filters.isNew !== undefined
  )

  // Merge dynamic backend colors (authoritative casing → correct filter values)
  // with the standard palette, dedup case-insensitively, then bubble colors that
  // actually have products to the top so none are buried under "Show more".
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
    <div className="space-y-6">
      {/* Sort and Filter Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      <div className={cn("flex-col gap-8", !showFilters ? "hidden lg:flex" : "flex")}>
        {/* Categories */}
        <div>
            <h3 className="font-medium mb-3">Categories</h3>
            <div className="space-y-2">
              {loadingCategories ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              ) : categories.length > 0 ? (
                <>
                  {(showAllCategories ? categories : categories.slice(0, 7)).map((category, idx) => (
                    <label key={`category-${category.slug}-${idx}`} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.categories?.includes(category.slug) || false}
                        onChange={(e) => handleCategoryChange(category.slug, e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-sm flex-1">{category.name}</span>
                      {counts?.categories[category.slug] !== undefined && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                          {counts.categories[category.slug]}
                        </span>
                      )}
                    </label>
                  ))}
                  {categories.length > 7 && (
                    <button
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="text-sm text-primary hover:underline font-medium pt-1 text-left w-full"
                    >
                      {showAllCategories ? "- Show less" : `+ ${categories.length - 7} more`}
                    </button>
                  )}
                </>
              ) : (
                <span className="text-sm text-muted-foreground">No categories</span>
              )}
            </div>
          </div>

          {/* Colors */}
          <div>
            <h3 className="font-medium mb-3">Colors</h3>
            <div className="space-y-2">
              {(showAllColors ? colorOptions : colorOptions.slice(0, 7)).map((option) => (
                <label key={`color-${option.name}`} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.colors?.includes(option.name) || false}
                    onChange={(e) => handleColorChange(option.name, e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className={cn("text-sm flex-1", option.count === 0 && "text-muted-foreground/60")}>{option.name}</span>
                  {option.count > 0 && (
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                      {option.count}
                    </span>
                  )}
                </label>
              ))}
              {colorOptions.length > 7 && (
                <button
                  onClick={() => setShowAllColors(!showAllColors)}
                  className="text-sm text-primary hover:underline font-medium pt-1 text-left w-full"
                >
                  {showAllColors ? "- Show less" : `+ ${colorOptions.length - 7} more`}
                </button>
              )}
            </div>
          </div>

          {/* Fabrics */}
          <div>
            <h3 className="font-medium mb-3">Fabric</h3>
            <div className="space-y-2">
              {(showAllFabrics ? fabrics : fabrics.slice(0, 7)).map((fabric, idx) => (
                <label key={`fabric-${fabric}-${idx}`} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.fabrics?.includes(fabric) || false}
                    onChange={(e) => handleFabricChange(fabric, e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-sm flex-1">{fabric}</span>
                  {counts?.fabrics[fabric] !== undefined && (
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                      {counts.fabrics[fabric]}
                    </span>
                  )}
                </label>
              ))}
              {fabrics.length > 7 && (
                <button
                  onClick={() => setShowAllFabrics(!showAllFabrics)}
                  className="text-sm text-primary hover:underline font-medium pt-1 text-left w-full"
                >
                  {showAllFabrics ? "- Show less" : `+ ${fabrics.length - 7} more`}
                </button>
              )}
            </div>
          </div>

          {/* Price Range & Special Filters */}
          <div className="space-y-4">
            {/* Price Range */}
            <div>
              <h3 className="font-medium mb-3">Price Range</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={localPriceRange.min}
                    onChange={(e) => setLocalPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                    onBlur={handlePriceRangeChange}
                    min={priceRange.min}
                    max={priceRange.max}
                    className="w-20 px-2 py-1 border border-border rounded text-sm"
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <input
                    type="number"
                    value={localPriceRange.max}
                    onChange={(e) => setLocalPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                    onBlur={handlePriceRangeChange}
                    min={priceRange.min}
                    max={priceRange.max}
                    className="w-20 px-2 py-1 border border-border rounded text-sm"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  ₹{priceRange.min.toLocaleString('en-IN')} - ₹{priceRange.max.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Special Filters */}
            <div>
              <h3 className="font-medium mb-3">Special</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.isOnSale || false}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      isOnSale: e.target.checked ? true : undefined
                    })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">On Sale</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.isFeatured || false}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      isFeatured: e.target.checked ? true : undefined
                    })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.isNew || false}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      isNew: e.target.checked ? true : undefined
                    })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">New Arrivals</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
