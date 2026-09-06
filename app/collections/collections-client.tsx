"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/products/product-card"
import { ProductFilters } from "@/components/products/product-filters"
import {
  type Product,
  type FilterOptions,
  type SortOption
} from "@/lib/products"
import { useProducts } from "@/context/product-context"

export function CollectionsClient() {
  const { mappedProducts, filterProducts, sortProducts } = useProducts()
  const [filters, setFilters] = useState<FilterOptions>({})
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const [showFilters, setShowFilters] = useState(true)
  const [filteredProducts, setFilteredProducts] = useState(mappedProducts)

  useEffect(() => {
    let result = filterProducts(filters)
    result = sortProducts(result, sortBy)
    setFilteredProducts(result)
  }, [mappedProducts, filters, sortBy])

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  const handleSortChange = (newSortBy: SortOption) => {
    setSortBy(newSortBy)
  }

  return (
    <section className="py-16 px-2">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Filters (Desktop Only) */}
        <div className="hidden lg:block w-full lg:w-[280px] shrink-0 lg:sticky lg:top-24 h-[calc(100vh-120px)] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <ProductFilters
            filters={filters}
            sortBy={sortBy}
            onFiltersChange={handleFiltersChange}
            onSortChange={handleSortChange}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            products={mappedProducts}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6 w-full">
          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Showing {filteredProducts.length} of {mappedProducts.length} products
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters to see more results
            </p>
            <button
              onClick={() => {
                setFilters({})
                setSortBy('featured')
              }}
              className="px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
        </div>
      </div>
    </section>
  )
}
