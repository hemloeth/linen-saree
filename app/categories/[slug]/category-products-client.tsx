"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProductCard } from "@/components/products/product-card"
import { ProductFilters } from "@/components/products/product-filters"
import { type Product, type FilterOptions, type SortOption } from "@/lib/products"
import Link from "next/link"

interface CategoryProductsClientProps {
  initialProducts: Product[]
  pageTitle: string
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    limit: number;
  }
}

export function CategoryProductsClient({
  initialProducts,
  pageTitle,
  pagination
}: CategoryProductsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(true)

  const currentPage = pagination?.currentPage || 1
  const totalPages = pagination?.totalPages || 1
  const totalProducts = pagination?.totalProducts || initialProducts.length

  // Construct filters from URL
  const filters: FilterOptions = {
    categories: searchParams.get('category') ? searchParams.get('category')?.split(',') : [],
    colors: searchParams.get('color') ? searchParams.get('color')?.split(',') : [],
    fabrics: searchParams.get('material') ? searchParams.get('material')?.split(',') : [],
    isOnSale: searchParams.get('isOnSale') === 'true' ? true : undefined,
  }
  const sortBy = (searchParams.get('sortBy') as SortOption) || 'featured'

  const updateUrl = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const handleFiltersChange = (newFilters: FilterOptions) => {
    updateUrl({
      category: newFilters.categories?.join(','),
      color: newFilters.colors?.join(','),
      material: newFilters.fabrics?.join(','),
      isOnSale: newFilters.isOnSale ? 'true' : undefined,
      page: '1' // Reset to first page
    })
  }

  const handleSortChange = (newSortBy: SortOption) => {
    updateUrl({ sortBy: newSortBy, page: '1' })
  }

  return (
    <section className="py-16 px-6 lg:px-10">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Filters */}
        <ProductFilters
          filters={filters}
          sortBy={sortBy}
          onFiltersChange={handleFiltersChange}
          onSortChange={handleSortChange}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          products={initialProducts} // We still pass this to derive available options, though ideally it comes from aggregations
        />

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing {totalProducts} products
          </p>
        </div>

        {/* Products Grid */}
        {initialProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {initialProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12 pt-8 border-t border-border">
                <button
                  onClick={() => {
                    updateUrl({ page: String(currentPage - 1) })
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
                    updateUrl({ page: String(currentPage + 1) })
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
                  router.push('?', { scroll: false })
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
