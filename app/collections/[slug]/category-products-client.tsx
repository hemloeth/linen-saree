"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import { 
  Product,
  FilterOptions,
  SortOption,
  filterProducts,
  sortProducts
} from "@/lib/products"
import Link from "next/link"

interface CategoryProductsClientProps {
  initialProducts: Product[]
  pageTitle: string
}

export function CategoryProductsClient({ 
  initialProducts, 
  pageTitle 
}: CategoryProductsClientProps) {
  const [filters, setFilters] = useState<FilterOptions>({})
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const [showFilters, setShowFilters] = useState(false) // Reverted back to false
  const [filteredProducts, setFilteredProducts] = useState(initialProducts)

  useEffect(() => {
    let result = filterProducts(initialProducts, filters)
    result = sortProducts(result, sortBy)
    setFilteredProducts(result)
  }, [initialProducts, filters, sortBy])

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  const handleSortChange = (newSortBy: SortOption) => {
    setSortBy(newSortBy)
  }

  return (
    <section className="py-16 px-4 lg:px-8">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Filters */}
        <ProductFilters
          filters={filters}
          sortBy={sortBy}
          onFiltersChange={handleFiltersChange}
          onSortChange={handleSortChange}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing {filteredProducts.length} products
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-4">
              {Object.keys(filters).length > 0 
                ? "No products match your current filters"
                : "No products found in this collection"
              }
            </p>
            {Object.keys(filters).length > 0 ? (
              <button
                onClick={() => {
                  setFilters({})
                  setSortBy('featured')
                }}
                className="px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Clear All Filters
              </button>
            ) : (
              <Link href="/collections" className="text-primary hover:underline">
                Browse all collections
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  )
}