import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PageHeroSlider } from "@/components/sections/page-hero-slider"
import { categories } from "@/lib/products"
import Link from "next/link"
import { CategoryProductsClient } from "../categories/[slug]/category-products-client"
import { fetchProductsFromDB, apiServerGet } from "@/lib/api"

export const metadata = {
  title: "Our Collections | Linen Sarees",
  description: "Browse our curated themes and special marketing collections."
}

export default async function CollectionsPage() {
  // Fetch all products
  const productsResponse = await apiServerGet('/api/product/allproducts')
  const allProducts = productsResponse.success ? productsResponse.products : []
  
  // Filter products that belong to ANY marketing collection
  const collectionProducts = allProducts.filter((p: any) => 
    p.productCollection && p.productCollection !== 'none' || p.isFestive || p.isOnSale
  )

  // Fetch marketing collection names for the filter bar
  const colRes = await apiServerGet('/api/marketing-collections')
  const marketingCols = colRes.success ? colRes.data.filter((c: any) => c.key !== 'none') : []

  const heroSlides = [
    {
      id: "col-main",
      image: "/images/celebrity-look.jpg",
      title: "Our Collections",
      subtitle: "Discover our curated themes for every special occasion"
    }
  ]

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Banner */}
      <div className="mt-[96px] lg:mt-[104px]">
        <PageHeroSlider slides={heroSlides} height="40vh" />
      </div>

      {/* Collections Sub-nav */}
      <section className="bg-secondary border-b border-border py-8">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/collections"
              className="px-6 py-2 bg-foreground text-background text-sm tracking-wide transition-all"
            >
              All Collections
            </Link>
            {marketingCols.map((col: any) => (
              <Link
                key={col.key}
                href={`/collections/${col.key}`}
                className="px-6 py-2 border border-border hover:bg-foreground hover:text-background text-sm tracking-wide transition-all"
              >
                {col.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <div className="py-12">
        <CategoryProductsClient 
            initialProducts={collectionProducts} 
            pageTitle="Theme Collections" 
        />
      </div>

      <Footer />
    </main>
  )
}
