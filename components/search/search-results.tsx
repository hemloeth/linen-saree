"use client"

import { useState } from "react"
import { Product, FilterOptions, SortOption } from "@/lib/products"
import { ProductCard } from "@/components/products/product-card"
import { ProductFilters } from "@/components/products/product-filters"
import { Search } from "lucide-react"

interface SearchResultsProps {
  products: Product[]
  query: string
  onSuggestionClick?: (suggestion: string) => void
  onFiltersChange?: (filters: FilterOptions, sortBy: SortOption) => void
}

export function SearchResults({ 
  products, 
  query, 
  onSuggestionClick,
  onFiltersChange 
}: SearchResultsProps) {
  const [filters, setFilters] = useState<FilterOptions>({})
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const [showFilters, setShowFilters] = useState(false) // Reverted back to false
  
  const suggestions = ['Pure Linen', 'Banarasi', 'Handloom', 'Blue', 'Pink', 'Embroidery']

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    onFiltersChange?.(newFilters, sortBy)
  }

  const handleSortChange = (newSortBy: SortOption) => {
    setSortBy(newSortBy)
    onFiltersChange?.(filters, newSortBy)
  }

  if (products.length > 0) {
    return (
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Filters (Desktop Only) */}
        <div className="hidden lg:block w-full lg:w-[280px] shrink-0 lg:sticky lg:top-24 h-[calc(100vh-120px)] overflow-y-auto pb-10" style={{ scrollbarWidth: 'none' }}>
          <ProductFilters
            filters={filters}
            sortBy={sortBy}
            onFiltersChange={handleFiltersChange}
            onSortChange={handleSortChange}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            products={products}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6 w-full">
          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {products.length > 0 
                ? `Showing ${products.length} result${products.length === 1 ? '' : 's'}`
                : 'No results found'
              }
              {query && ` for "${query}"`}
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (query) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
          <Search className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground mb-6">
          Try adjusting your search terms or browse our collections
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="text-sm text-muted-foreground">Try searching for:</span>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onSuggestionClick?.(suggestion)}
              className="px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-full transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return null
}
