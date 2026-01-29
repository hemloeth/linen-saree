"use client"

import { useState, useEffect } from "react"
import { ChevronDown, X, Filter } from "lucide-react"
import { 
  FilterOptions, 
  SortOption, 
  getUniqueColors, 
  getUniqueFabrics, 
  getPriceRange,
  categories 
} from "@/lib/products"

interface ProductFiltersProps {
  filters: FilterOptions
  sortBy: SortOption
  onFiltersChange: (filters: FilterOptions) => void
  onSortChange: (sortBy: SortOption) => void
  showFilters?: boolean
  onToggleFilters?: () => void
}

export function ProductFilters({
  filters,
  sortBy,
  onFiltersChange,
  onSortChange,
  showFilters = false, // Reverted back to false
  onToggleFilters
}: ProductFiltersProps) {
  const [colors] = useState(getUniqueColors())
  const [fabrics] = useState(getUniqueFabrics())
  const [priceRange] = useState(getPriceRange())
  const [localPriceRange, setLocalPriceRange] = useState({
    min: filters.priceRange?.min ?? priceRange.min,
    max: filters.priceRange?.max ?? priceRange.max
  })

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
          {onToggleFilters && (
            <button
              onClick={onToggleFilters}
              className="flex items-center gap-2 px-4 py-2 border border-border hover:bg-muted transition-colors lg:hidden"
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-primary rounded-full"></span>
              )}
            </button>
          )}
          
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

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="appearance-none border border-border px-4 py-2 pr-10 bg-background text-sm cursor-pointer hover:bg-muted transition-colors"
          >
            <option value="featured">Sort by: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest First</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
            <option value="color-asc">Color: Color</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-muted/30 rounded-lg">
          {/* Categories */}
          <div>
            <h3 className="font-medium mb-3">Categories</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.map((category) => (
                <label key={category.slug} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.categories?.includes(category.slug) || false}
                    onChange={(e) => handleCategoryChange(category.slug, e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <h3 className="font-medium mb-3">Colors</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {colors.map((color) => (
                <label key={color} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.colors?.includes(color) || false}
                    onChange={(e) => handleColorChange(color, e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm">{color}</span>
                </label>
              ))}
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
                    className="rounded border-border"
                  />
                  <span className="text-sm">{fabric}</span>
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
                  ₹{priceRange.min.toLocaleString()} - ₹{priceRange.max.toLocaleString()}
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
      )}
    </div>
  )
}