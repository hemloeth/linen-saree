import { Metadata } from "next"
import Link from "next/link"
import { getBestSellers } from "@/lib/products"
import { ProductCard } from "@/components/product-card"

export const metadata: Metadata = {
  title: "Best Sellers - Linen Sarees",
  description: "Discover our most popular and best-selling linen sarees. Handpicked favorites loved by our customers.",
}

export default function BestSellersPage() {
  const bestSellers = getBestSellers()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-muted/50 to-background py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-serif font-bold text-foreground mb-6">
              Best Sellers
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover our most loved sarees - handpicked favorites that have won the hearts of our customers. 
              From elegant pure linen to luxurious Banarasi silk, these are the pieces everyone is talking about.
            </p>
          </div>
        </div>
      </section>

      {/* Best Sellers Grid */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Why These Are Best Sellers */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-foreground mb-6">
              Why Our Customers Love These
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Premium Quality</h3>
              <p className="text-muted-foreground">
                Handpicked for their exceptional fabric quality and craftsmanship that stands the test of time.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Customer Favorites</h3>
              <p className="text-muted-foreground">
                These sarees have received the most love from our customers with outstanding reviews and repeat purchases.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Great Value</h3>
              <p className="text-muted-foreground">
                Perfect balance of luxury and affordability, offering exceptional value that keeps customers coming back.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore More Collections */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-foreground mb-6">
            Explore More Collections
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover our complete range of handcrafted sarees, from traditional handloom to luxurious silk blends.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/collections/pure-linen"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-sm font-medium transition-colors"
            >
              Pure Linen Collection
            </Link>
            <Link 
              href="/collections/banarasi-silk"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-3 rounded-sm font-medium transition-colors"
            >
              Banarasi Silk Collection
            </Link>
            <Link 
              href="/collections"
              className="border border-border hover:bg-muted px-6 py-3 rounded-sm font-medium transition-colors"
            >
              View All Collections
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}