import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageHeroSlider } from "@/components/page-hero-slider"
import { products } from "@/lib/products"
import { ProductCard } from "@/components/product-card"

export const metadata = {
  title: "Special Offers | Linen Sarees",
  description: "Discover amazing deals and special offers on premium linen sarees. Limited time only!"
}

const offerSlides = [
  {
    id: "offers-main",
    image: "/images/designer-saree.jpg",
    title: "Special Offers",
    subtitle: "Up to 50% off on selected premium linen sarees"
  },
  {
    id: "offers-handloom",
    image: "/images/handloom-saree.jpg",
    title: "Handloom Sale",
    subtitle: "Traditional craftsmanship at unbeatable prices"
  },
  {
    id: "offers-casual",
    image: "/images/casual-saree.jpg",
    title: "Everyday Elegance",
    subtitle: "Casual sarees for daily wear - now on sale"
  }
]

// Filter products for offers - all products with enhanced discount display
const offerProducts = products.map(product => {
  const discountPercentage = Math.floor(((product.originalPrice - product.price) / product.originalPrice) * 100)
  return {
    ...product,
    discount: discountPercentage,
    isOnSale: true
  }
}).filter(product => product.discount > 0) // Only show products with actual discounts

export default function OffersCollectionPage() {
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Banner */}
      <div className="mt-[96px] lg:mt-[104px]">
        <PageHeroSlider slides={offerSlides} height="50vh" />
      </div>

      {/* Offer Banner */}
      <section className="py-8 px-4 lg:px-8 bg-red-50">
        <div className="max-w-[1400px] mx-auto text-center">
          <div className="inline-flex items-center gap-4 bg-red-600 text-white px-8 py-4 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-lg font-medium">Limited Time Offer - Up to 50% Off!</span>
          </div>
        </div>
      </section>

      {/* Collection Description */}
      <section className="py-12 px-4 lg:px-8 bg-secondary">
        <div className="max-w-[1400px] mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-light mb-6">Special Offers</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Don't miss out on these incredible deals! Our special offers collection features 
            premium linen sarees at unbeatable prices. From everyday elegance to special 
            occasion wear, find your perfect saree while stocks last.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {offerProducts.map((product) => (
              <div key={product.id} className="relative">
                {/* Discount Badge */}
                
                <ProductCard product={product} />
                {/* Price Display with Original Price */}
                <div className="mt-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg font-medium">₹{product.price.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    Save ₹{(product.originalPrice - product.price).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}