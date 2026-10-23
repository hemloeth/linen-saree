import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CategoryProductsClient } from "../../categories/[slug]/category-products-client"
import { fetchPaginatedProducts, fetchProductsFromDB } from "@/lib/products"
import { apiServerGet } from "@/lib/api"
import Link from "next/link"
import { Suspense } from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Special Offers & Sale - Handloomer | Exclusive Deals",
  description: "Discover amazing deals and special offers on premium linen and silk sarees. Limited time only!",
}

interface OffersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function OffersCollectionPage({ searchParams }: OffersPageProps) {
  const resolvedSearchParams = await searchParams

  const { products: paginatedProducts, pagination } = await fetchPaginatedProducts({
    ...resolvedSearchParams,
    isOnSale: true,
    limit: 20
  })

  let displayProducts = paginatedProducts
  if (!displayProducts || displayProducts.length === 0) {
    const allProducts = await fetchProductsFromDB()
    displayProducts = allProducts.filter(p => p.isOnSale || (p.originalPrice && p.originalPrice > p.price))
  }

  const colRes = await apiServerGet('/api/marketing-collections', { cache: 'no-store' }).catch(() => ({ success: false, data: [] }))
  const marketingCols = colRes.success && colRes.data ? colRes.data.filter((c: any) => c.key !== 'none') : []

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Spacer to clear the fixed header using its live measured height */}
      <div style={{ height: "var(--header-offset, 120px)" }} />

      {/* Collections Sub-nav */}
      <section className="bg-secondary border-b border-border py-8">
        <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-3 lg:gap-4">
            <Link
              href="/collections"
              className="px-2 sm:px-6 py-2 border border-border hover:bg-foreground hover:text-background text-xs sm:text-sm tracking-wide transition-all text-center flex items-center justify-center"
            >
              All Collections
            </Link>
            <Link
              href="/collections/offers"
              className="px-2 sm:px-6 py-2 bg-foreground text-background shadow-md text-xs sm:text-sm tracking-wide transition-all text-center flex items-center justify-center font-medium"
            >
              Offers & Sale
            </Link>
            <Link
              href="/collections/new-arrivals"
              className="px-2 sm:px-6 py-2 border border-border hover:bg-foreground hover:text-background text-xs sm:text-sm tracking-wide transition-all text-center flex items-center justify-center"
            >
              New Arrivals
            </Link>
            {marketingCols.map((col: any) => (
              <Link
                key={col.key}
                href={`/collections/${col.key}`}
                className="px-2 sm:px-6 py-2 border border-border hover:bg-foreground hover:text-background text-xs sm:text-sm tracking-wide transition-all text-center flex items-center justify-center"
              >
                {col.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section with Sidebar Filters & Sorting */}
      <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading special offers...</div>}>
        <CategoryProductsClient 
          initialProducts={displayProducts} 
          pagination={pagination}
          pageTitle="Special Offers & Sale" 
        />
      </Suspense>

      <Footer />
    </main>
  )
}
