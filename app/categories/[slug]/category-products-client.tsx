"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/products/product-card"
import { ProductFilters } from "@/components/products/product-filters"
import {
  type Product,
  type FilterOptions,
  type SortOption,
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
  const [showFilters, setShowFilters] = useState(true)
  const [filteredProducts, setFilteredProducts] = useState(initialProducts)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    let result = filterProducts(initialProducts, filters)
    result = sortProducts(result, sortBy)
    setFilteredProducts(result)
    setCurrentPage(1) // Reset to first page on filter/sort
  }, [initialProducts, filters, sortBy])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
          products={initialProducts}
        />

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing {filteredProducts.length} products
          </p>
        </div>

        {/* Products Grid */}
        {paginatedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12 pt-8 border-t border-border">
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.max(prev - 1, 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium border border-border rounded-md disabled:opacity-50 hover:bg-muted hover:text-foreground transition-colors bg-background"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground font-medium">
                  Page <span className="text-foreground">{currentPage}</span> of {totalPages}
                </span>
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.min(prev + 1, totalPages))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium border border-border rounded-md disabled:opacity-50 hover:bg-muted hover:text-foreground transition-colors bg-background"
                >
                  Next
                </button>
              </div>
            )}
          </>
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
