import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PageHeroSlider } from "@/components/sections/page-hero-slider"
import { CategoryProductsClient } from "../../categories/[slug]/category-products-client"
import { fetchPaginatedProducts, fetchProductsFromDB } from "@/lib/products"
import { apiServerGet } from "@/lib/api"
import Link from "next/link"
import { Suspense } from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Festival Collection - Linen Sarees | Festive Celebration Wear",
  description: "Celebrate in style with our exquisite festival collection of premium linen and silk sarees.",
}

interface FestivalPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const festivalSlides = [
  {
    id: "festival-main",
    image: "/images/festive-saree.jpg",
    title: "Festival Collection",
    subtitle: "Celebrate every moment with our exquisite festive sarees"
  },
  {
    id: "festival-bridal",
    image: "/images/bridal-saree.jpg",
    title: "Bridal Elegance",
    subtitle: "Perfect for weddings and special ceremonies"
  },
  {
    id: "festival-designer",
    image: "/images/designer-saree.jpg",
    title: "Designer Festive",
    subtitle: "Contemporary designs for modern celebrations"
  }
]

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/collections" },
  { label: "Festival Collection" }
]

export default async function FestivalCollectionPage({ searchParams }: FestivalPageProps) {
  const resolvedSearchParams = await searchParams

  const { products: paginatedProducts, pagination } = await fetchPaginatedProducts({
    ...resolvedSearchParams,
    isFestive: true,
    limit: 20
  })

  let displayProducts = paginatedProducts
  if (!displayProducts || displayProducts.length === 0) {
    const allProducts = await fetchProductsFromDB()
    displayProducts = allProducts.filter(product =>
      product.category === 'Banarasi Silk' ||
      product.category === 'Silk Linen' ||
      product.category === 'Embroidery' ||
      product.isFestive ||
      product.isFeatured
    )
  }

  const colRes = await apiServerGet('/api/marketing-collections', { cache: 'no-store' }).catch(() => ({ success: false, data: [] }))
  const marketingCols = colRes.success && colRes.data ? colRes.data.filter((c: any) => c.key !== 'none') : []

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Banner */}
      <div className="mt-[96px] lg:mt-[104px]">
        <PageHeroSlider slides={festivalSlides} height="40vh" breadcrumbs={breadcrumbs} />
      </div>

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
              href="/collections/festival"
              className="px-2 sm:px-6 py-2 bg-foreground text-background shadow-md text-xs sm:text-sm tracking-wide transition-all text-center flex items-center justify-center font-medium"
            >
              Festival Collection
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
      <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading festival collection...</div>}>
        <CategoryProductsClient 
          initialProducts={displayProducts} 
          pagination={pagination}
          pageTitle="Festival Collection" 
        />
      </Suspense>

      <Footer />
    </main>
  )
}
