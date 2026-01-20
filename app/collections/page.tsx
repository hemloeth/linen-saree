import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartSidebar } from "@/components/cart-sidebar"
import { ProductCard } from "@/components/product-card"
import { products, categories } from "@/lib/products"
import Image from "next/image"
import Link from "next/link"

export const metadata = {
  title: "All Collections | Linen Sarees",
  description: "Browse our complete collection of premium linen sarees."
}

export default function CollectionsPage() {
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Banner */}
      <section className="relative h-[40vh] min-h-[300px] mt-[104px]">
        <Image
          src="/images/hero-saree.jpg"
          alt="All Collections"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="font-serif text-4xl md:text-6xl mb-4">All Collections</h1>
          <p className="text-lg text-white/90 max-w-xl">
            Discover our complete range of handcrafted linen sarees
          </p>
        </div>
      </section>

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

      {/* Products Grid */}
      <section className="py-16 px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <p className="text-muted-foreground">
              Showing {products.length} products
            </p>
            <select className="border border-border px-4 py-2 bg-background text-sm">
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest First</option>
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <CartSidebar />
    </main>
  )
}
