"use client"

import { useRef, useState, useEffect } from "react"
import { ShoppingBag } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { products } from "@/lib/products"
import { Header } from "@/components/header"
import Link from "next/link"

interface VideoCardProps {
  title: string
  description: string
  price: number
  originalPrice: number
  videoSrc: string
  productId: string
  category: string
}

function VideoCard({ title, description, price, originalPrice, videoSrc, productId, category }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const { addToCart } = useCart()
  
  const product = products.find(p => p.id === productId) || products[0]

  return (
    <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-white">
      <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200">
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          onLoadedData={() => {
            if (videoRef.current) {
              videoRef.current.currentTime = 0
              setIsPlaying(true)
            }
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <button
            onClick={() => addToCart(product)}
            className="bg-white/95 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 bg-white">
        <h3 className="font-serif text-lg font-medium text-gray-900 mb-2 line-clamp-1">
          {title}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">₹{price.toLocaleString()}</span>
            {originalPrice > price && (
              <span className="text-sm text-gray-500 line-through">₹{originalPrice.toLocaleString()}</span>
            )}
          </div>
          <button
            onClick={() => addToCart(product)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-300"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

const baseVideoCards = [
  {
    title: "Premium Silk Linen Collection",
    description: "Luxurious silk linen sarees with intricate handwork and premium finishing. Perfect for special occasions and celebrations.",
    price: 3499,
    originalPrice: 4999,
    videoSrc: "/Video-266.mp4",
    productId: "8",
    category: "Silk"
  },
  {
    title: "Banarasi Silk Elegance",
    description: "Traditional Banarasi silk sarees with rich gold zari work and timeless appeal. Handcrafted by master weavers.",
    price: 4299,
    originalPrice: 7999,
    videoSrc: "/bluesaree.mp4",
    productId: "4",
    category: "Banarasi"
  },
  {
    title: "Handloom Heritage Collection",
    description: "Authentic handloom sarees crafted by skilled artisans using traditional techniques passed down through generations.",
    price: 2890,
    originalPrice: 5290,
    videoSrc: "/Video-385.mp4",
    productId: "6",
    category: "Handloom"
  },
  {
    title: "Pure Linen Comfort",
    description: "Breathable pure linen sarees perfect for everyday elegance and comfort. Ideal for both casual and formal wear.",
    price: 2499,
    originalPrice: 4799,
    videoSrc: "/Video-28.mp4",
    productId: "1",
    category: "Linen"
  },
  {
    title: "Designer Dupatta Collection",
    description: "Exquisite designer dupattas that complement any outfit. Featuring intricate embroidery and premium fabrics.",
    price: 1899,
    originalPrice: 3499,
    videoSrc: "/dupaataa.mp4",
    productId: "2",
    category: "Dupatta"
  },
  {
    title: "Festive Special Collection",
    description: "Specially curated sarees for festivals and celebrations. Rich colors and traditional designs for memorable occasions.",
    price: 3999,
    originalPrice: 6999,
    videoSrc: "/gemini_vedio.mp4",
    productId: "3",
    category: "Festive"
  },
  {
    title: "Contemporary Elegance",
    description: "Modern designs with traditional craftsmanship. Perfect blend of contemporary style and classic Indian heritage.",
    price: 2799,
    originalPrice: 4999,
    videoSrc: "/videoplayback.mp4",
    productId: "5",
    category: "Contemporary"
  }
]

const categories = ["All", "Silk", "Banarasi", "Handloom", "Linen", "Dupatta", "Festive", "Contemporary"]

export default function VideoCollectionPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [currentHeroVideo, setCurrentHeroVideo] = useState(0)
  
  // Create 14 video cards by repeating the 7 base videos twice
  const videoCards = [
    ...baseVideoCards,
    ...baseVideoCards.map((card, index) => ({
      ...card,
      title: card.title,
      description: card.description,
      price: card.price + 500,
      originalPrice: card.originalPrice + 1000,
      productId: (parseInt(card.productId) + 7).toString()
    }))
  ]
  
  const filteredVideos = selectedCategory === "All" 
    ? videoCards 
    : videoCards.filter(card => card.category === selectedCategory)

  // Auto-rotate hero videos every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroVideo((prev) => (prev + 1) % baseVideoCards.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black pt-[96px] lg:pt-[104px]">
        {/* Full-Page Video Cover Hero */}
        <section className="relative h-screen w-full overflow-hidden">
          {baseVideoCards.map((video, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentHeroVideo ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                src={video.videoSrc}
              />
            </div>
          ))}
          
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Hero Content */}
          <div className="absolute inset-0 flex items-center justify-center text-center text-white z-10">
            <div className="max-w-4xl px-4">
              <div className="inline-flex items-center gap-3 text-sm tracking-[0.3em] uppercase text-white/80 mb-6">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                Video Collection
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              </div>
              <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl mb-6 leading-tight">
                Saree Stories
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
                Experience the beauty and elegance of our premium saree collection through immersive video showcases
              </p>
              <button 
                onClick={() => {
                  document.getElementById('video-grid')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105"
              >
                Explore Collection
              </button>
            </div>
          </div>

          {/* Video Navigation Dots */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
            {baseVideoCards.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentHeroVideo(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentHeroVideo 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 right-8 text-white/60 animate-bounce z-10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </section>

        {/* Category Filter */}
        <section className="px-4 lg:px-8 py-12 bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl mb-4 text-gray-900">
                Browse by Category
              </h2>
              <p className="text-lg text-muted-foreground">
                Filter our collection to find your perfect saree
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                      : 'bg-white hover:bg-gray-50 text-gray-700 shadow-md hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Video Grid */}
        <section id="video-grid" className="px-4 lg:px-8 py-24 bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl md:text-5xl mb-4 text-gray-900">
                {selectedCategory === "All" ? "Complete Collection" : `${selectedCategory} Collection`}
              </h2>
              <p className="text-lg text-muted-foreground">
                {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''} available
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredVideos.map((card, index) => (
                <VideoCard
                  key={`${card.productId}-${index}`}
                  title={card.title}
                  description={card.description}
                  price={card.price}
                  originalPrice={card.originalPrice}
                  videoSrc={card.videoSrc}
                  productId={card.productId}
                  category={card.category}
                />
              ))}
            </div>
            
            {filteredVideos.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">No videos found for the selected category.</p>
              </div>
            )}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="px-4 lg:px-8 pb-16 bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <div className="max-w-[1400px] mx-auto text-center">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl p-12">
              <h2 className="font-serif text-4xl mb-4 text-gray-900">
                Discover More Collections
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Explore our complete range of premium sarees, from traditional handlooms to contemporary designs
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="/"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-semibold transition-colors duration-300 inline-block"
                >
                  View All Products
                </Link>
                <Link 
                  href="/contact"
                  className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-3 rounded-full font-semibold border border-gray-200 transition-colors duration-300 inline-block"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}