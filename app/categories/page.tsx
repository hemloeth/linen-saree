import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PageHeroSlider } from "@/components/sections/page-hero-slider"
import { categories } from "@/lib/products"
import Link from "next/link"
import { CategoryProductsClient } from "./[slug]/category-products-client"
import { fetchPaginatedProducts } from "@/lib/products"
import { apiServerGet } from "@/lib/api"
import { Suspense } from "react"

export const metadata = {
  title: "All Categories | Linen Sarees",
  description: "Browse our complete range of premium linen sarees by category."
}

const heroSlides = [
  {
    id: "cat-main",
    image: "/images/hero-saree.jpg",
    title: "Our Categories",
    subtitle: "Explore our finest range of handcrafted linen sarees"
  },
  {
    id: "cat-handloom",
    image: "/images/handloom-saree.jpg",
    title: "Handloom Heritage",
    subtitle: "Traditional craftsmanship meets contemporary design"
  }
]

export default async function CategoriesPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const { products: allProducts, pagination } = await fetchPaginatedProducts({
    ...searchParams,
    limit: 20
  })

  // Fetch marketing collections for the sub-nav
  const colRes = await apiServerGet('/api/marketing-collections')
  const marketingCollectionsList = colRes.success ? colRes.data.filter((c: any) => c.key !== 'none') : []

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Banner */}
      <div className="mt-[96px] lg:mt-[104px]">
        <PageHeroSlider slides={heroSlides} height="40vh" />
      </div>

      {/* Categories Sub-nav */}
      <section className="bg-secondary border-b border-border py-8">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/categories"
              className="px-6 py-2 bg-foreground text-background text-sm tracking-wide transition-all"
            >
              All Fabrics
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="px-6 py-2 border border-border hover:bg-foreground hover:text-background text-sm tracking-wide transition-all"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <div className="py-12">
        <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading products...</div>}>
          <CategoryProductsClient 
              initialProducts={allProducts} 
              pagination={pagination}
              pageTitle="All Saree Categories" 
          />
        </Suspense>
      </div>

      <Footer />
    </main>
  )
}
