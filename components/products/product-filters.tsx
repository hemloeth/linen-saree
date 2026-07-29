"use client"

import { useState, useEffect } from "react"
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
    if (products.length > 0) {
      setColors(getUniqueColors(products))
      setFabrics(getUniqueFabrics(products))
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
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {loadingCategories ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <label key={category.slug} className="flex items-center gap-2 cursor-pointer">
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
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No categories</span>
              )}
            </div>
          </div>

          {/* Colors */}
          <div>
            <h3 className="font-medium mb-3">Colors</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {(showAllColors ? colors : colors.slice(0, 7)).map((color) => (
                <label key={color} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.colors?.includes(color) || false}
                    onChange={(e) => handleColorChange(color, e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-sm flex-1">{color}</span>
                  {counts?.colors[color] !== undefined && (
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                      {counts.colors[color]}
                    </span>
                  )}
                </label>
              ))}
              {colors.length > 7 && (
                <button
                  onClick={() => setShowAllColors(!showAllColors)}
                  className="text-sm text-primary hover:underline font-medium pt-1 text-left w-full"
                >
                  {showAllColors ? "- Show less" : `+ ${colors.length - 7} more`}
                </button>
              )}
            </div>
          </div>

          {/* Fabrics */}
          <div>
            <h3 className="font-medium mb-3">Fabric</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {fabrics.map((fabric) => (
                <label key={fabric} className="flex items-center gap-2 cursor-pointer">
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