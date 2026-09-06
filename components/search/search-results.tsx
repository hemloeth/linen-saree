"use client"

import { useState } from "react"
import Link from "next/link"
import { Product, FilterOptions, SortOption } from "@/lib/products"
import { ProductCard } from "@/components/products/product-card"
import { ProductFilters } from "@/components/products/product-filters"
import { Search, SlidersHorizontal, Sparkles, ShoppingBag } from "lucide-react"

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
  const [showFilters, setShowFilters] = useState(false)
  
  const suggestions = ['Pure Linen', 'Banarasi Silk', 'Handloom', 'Golden Zari', 'Festive', 'Pink', 'Red']

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
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden w-full flex items-center justify-between pb-2 border-b border-border">
          <p className="text-xs sm:text-sm text-muted-foreground">
            <strong>{products.length}</strong> items available
          </p>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground text-xs font-semibold rounded-lg border border-border"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
            <span>{showFilters ? "Hide Filters" : "Filter & Sort"}</span>
          </button>
        </div>

        {/* Mobile Filter Panel Dropdown */}
        {showFilters && (
          <div className="lg:hidden w-full bg-card p-4 rounded-xl border border-border mb-4">
            <ProductFilters
              filters={filters}
              sortBy={sortBy}
              onFiltersChange={handleFiltersChange}
              onSortChange={handleSortChange}
              showFilters={true}
              onToggleFilters={() => setShowFilters(false)}
              products={products}
            />
          </div>
        )}

        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block w-full lg:w-[280px] shrink-0 lg:sticky lg:top-24 h-[calc(100vh-120px)] overflow-y-auto pb-10" style={{ scrollbarWidth: 'none' }}>
          <ProductFilters
            filters={filters}
            sortBy={sortBy}
            onFiltersChange={handleFiltersChange}
            onSortChange={handleSortChange}
            showFilters={true}
            onToggleFilters={() => {}}
            products={products}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6 w-full">
          {/* Results Count Bar on Desktop */}
          <div className="hidden lg:flex items-center justify-between pb-2 border-b border-border/60">
            <p className="text-sm text-muted-foreground">
              Showing <strong className="text-foreground">{products.length}</strong> {products.length === 1 ? 'saree' : 'sarees'}
              {query && <span> for “<span className="text-primary font-medium">{query}</span>”</span>}
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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
      <div className="text-center py-16 px-4 max-w-lg mx-auto">
        <div className="w-18 h-18 mx-auto mb-6 bg-secondary/80 rounded-full flex items-center justify-center text-muted-foreground border border-border">
          <Search className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-serif text-2xl font-semibold mb-2 text-foreground">No Sarees Found</h3>
        <p className="text-sm text-muted-foreground mb-6">
          We couldn't find any products matching “<strong>{query}</strong>”. Try checking your spelling or explore popular categories.
        </p>

        <div className="space-y-4">
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="px-3.5 py-1.5 text-xs bg-secondary/80 hover:bg-secondary text-foreground rounded-full border border-border transition-colors cursor-pointer"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <Link
              href="/collections"
              className="px-6 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse All Collections
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return null
}
