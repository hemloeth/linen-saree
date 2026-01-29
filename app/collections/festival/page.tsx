import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageHeroSlider } from "@/components/page-hero-slider"
import { products } from "@/lib/products"
import { ProductCard } from "@/components/product-card"

export const metadata = {
  title: "Festival Collection | Linen Sarees",
  description: "Celebrate in style with our exquisite festival collection of premium linen sarees."
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

// Filter products for festival collection - include Banarasi, Silk Linen, and Embroidery
const festivalProducts = products.filter(product => 
  product.category === 'Banarasi Silk' || 
  product.category === 'Silk Linen' ||
  product.category === 'Embroidery' ||
  product.isFeatured ||
  ['Royal', 'Golden', 'Emerald', 'Wine', 'Burgundy', 'Royal Purple'].some(color => 
    product.name.includes(color)
  )
)

export default function FestivalCollectionPage() {
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Banner */}
      <div className="mt-[96px] lg:mt-[104px]">
        <PageHeroSlider slides={festivalSlides} height="50vh" />
      </div>

      {/* Collection Description */}
      <section className="py-12 px-4 lg:px-8 bg-secondary">
        <div className="max-w-[1400px] mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-light mb-6">Festival Collection</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Make every celebration memorable with our carefully curated festival collection. 
            From traditional ceremonies to modern festivities, our premium linen sarees 
            combine elegance with comfort, ensuring you look stunning on every special occasion.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {festivalProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {festivalProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                Festival collection coming soon. Stay tuned for our exclusive festive sarees!
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}