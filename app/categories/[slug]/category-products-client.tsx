"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProductCard } from "@/components/products/product-card"
import { ProductFilters } from "@/components/products/product-filters"
import { type Product, type FilterOptions, type SortOption } from "@/lib/products"
import Link from "next/link"
import { ChevronDown, ArrowUpDown, Filter, X } from "lucide-react"

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
  const [showFilters, setShowFilters] = useState(false)
  const [showMobileSort, setShowMobileSort] = useState(false)

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
    <section className="pt-8 pb-16 px-2 sm:px-6 lg:px-10">
      <div className="max-w-[1500px] mx-auto flex flex-col lg:flex-row gap-8 items-start pb-20 lg:pb-0">
        {/* Sidebar Filters (Desktop Only) */}
        <div className="hidden lg:block w-full lg:w-[280px] shrink-0 lg:sticky lg:top-24">
          <ProductFilters
            filters={filters}
            sortBy={sortBy}
            onFiltersChange={handleFiltersChange}
            onSortChange={handleSortChange}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            products={initialProducts} 
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6 w-full">
          {/* Results Count & Sort */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-muted-foreground">
              Showing {totalProducts} products
            </p>
            {/* Sort Dropdown (Desktop Only) */}
            <div className="relative hidden lg:block">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
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

          {/* Products Grid */}
          {initialProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 lg:gap-6">
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
      </div>

      {/* Mobile Fixed Bottom Bar (Myntra Style) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border flex lg:hidden shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.1)]">
        <button
          onClick={() => setShowMobileSort(true)}
          className="flex-1 flex items-center justify-center gap-2 py-4 font-medium text-sm border-r border-border"
        >
          <ArrowUpDown className="w-4 h-4" />
          SORT
        </button>
        <button
          onClick={() => setShowFilters(true)}
          className="flex-1 flex items-center justify-center gap-2 py-4 font-medium text-sm"
        >
          <Filter className="w-4 h-4" />
          FILTER
        </button>
      </div>

      {/* Mobile Sort Modal */}
      {showMobileSort && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileSort(false)} />
          <div className="relative bg-background rounded-t-2xl p-6 pb-10 animate-in slide-in-from-bottom-full duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Sort By</h3>
              <button onClick={() => setShowMobileSort(false)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { value: "featured", label: "Featured" },
                { value: "price-low", label: "Price: Low to High" },
                { value: "price-high", label: "Price: High to Low" },
                { value: "newest", label: "Newest First" },
                { value: "name-asc", label: "Name: A to Z" },
                { value: "name-desc", label: "Name: Z to A" },
                { value: "color-asc", label: "Color: Color" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    handleSortChange(opt.value as SortOption);
                    setShowMobileSort(false);
                  }}
                  className={`text-left py-2 text-sm ${sortBy === opt.value ? "font-bold text-primary" : "text-foreground"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="relative bg-background rounded-t-2xl p-6 pb-10 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-full duration-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <ProductFilters
              filters={filters}
              sortBy={sortBy}
              onFiltersChange={handleFiltersChange}
              onSortChange={handleSortChange}
              showFilters={true}
              products={initialProducts}
            />
            <div className="sticky bottom-0 bg-background pt-4 mt-6 border-t border-border flex gap-4">
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 py-3 bg-primary text-primary-foreground font-medium rounded-md"
              >
                APPLY
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
