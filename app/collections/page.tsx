import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageHeroSlider } from "@/components/page-hero-slider"
import { products, categories } from "@/lib/products"
import Link from "next/link"
import { CollectionsClient } from "./collections-client"

export const metadata = {
  title: "All Collections | Linen Sarees",
  description: "Browse our complete collection of premium linen sarees."
}

const collectionSlides = [
  {
    id: "all-collections-main",
    image: "/images/hero-saree.jpg",
    title: "All Collections",
    subtitle: "Discover our complete range of handcrafted linen sarees"
  },
  {
    id: "handloom-collection",
    image: "/images/handloom-saree.jpg",
    title: "Handloom Heritage",
    subtitle: "Traditional craftsmanship meets contemporary design"
  },
  {
    id: "festive-collection",
    image: "/images/celebrity-look.jpg",
    title: "Festive Elegance",
    subtitle: "Perfect for celebrations and special occasions"
  },
  {
    id: "bridal-collection",
    image: "/images/bridal-saree.jpg",
    title: "Bridal Splendor",
    subtitle: "Exquisite sarees for your most precious moments"
  }
]

export default function CollectionsPage() {
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Banner with Auto-Scroll */}
      <div className="mt-[96px] lg:mt-[104px]">
        <PageHeroSlider slides={collectionSlides} height="40vh" />
      </div>

      {/* Categories */}
      <section className="py-12 px-4 lg:px-8 bg-secondary">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/collections"
              className="px-6 py-2 bg-foreground text-background text-sm tracking-wide"
            >
              All
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/collections/${category.slug}`}
                className="px-6 py-2 border border-border hover:bg-foreground hover:text-background text-sm tracking-wide transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section - Client Component */}
      <CollectionsClient initialProducts={products} />

      <Footer />
    </main>
  )
}
