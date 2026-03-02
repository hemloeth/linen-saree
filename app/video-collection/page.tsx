"use client"

import { useRef, useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ShoppingBag, Heart, Play, Pause, ChevronLeft, ChevronRight } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { products } from "@/lib/products"
import { Header } from "@/components/header"
import Link from "next/link"

interface VideoCardProps {
  title: string
  price: number
  originalPrice: number
  videoSrc: string
  productId: string
  category: string
}

function VideoCard({ title, price, originalPrice, videoSrc, productId, category }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  
  const product = products.find(p => p.id === productId) || products[0]
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100)
  const isWishlisted = isInWishlist(product.id)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleWishlistClick = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  return (
    <div className="group relative w-full">
      <div className="relative w-full mb-4">
        <div className="aspect-[3/4] overflow-hidden bg-black rounded-sm relative">
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onLoadedData={() => setIsPlaying(true)}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges */}
          <div className="absolute top-1 left-1 md:top-2 md:left-2 flex flex-col gap-1 z-10 max-w-[calc(100%-2rem)] md:max-w-[calc(100%-3rem)]">
            <span className="bg-primary text-primary-foreground text-[10px] md:text-xs px-1.5 py-0.5 md:px-2 md:py-1 font-medium rounded-sm whitespace-nowrap inline-block">
              {discount}% OFF
            </span>
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              togglePlay()
            }}
            className="absolute top-1 right-8 md:top-2 md:right-12 p-1.5 md:p-2 bg-background/90 hover:bg-background rounded-full transition-colors opacity-0 group-hover:opacity-100 z-10"
          >
            {isPlaying ? (
              <Pause className="w-3 h-3 md:w-4 md:h-4" />
            ) : (
              <Play className="w-3 h-3 md:w-4 md:h-4" />
            )}
          </button>

          {/* Quick Actions */}
          <div className="absolute top-1 right-1 md:top-2 md:right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleWishlistClick()
              }}
              className={`p-1.5 md:p-2 bg-background/90 hover:bg-background rounded-full transition-colors shadow-sm ${
                isWishlisted ? 'text-primary' : ''
              }`}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`w-3 h-3 md:w-4 md:h-4 ${isWishlisted ? 'fill-primary' : ''}`} />
            </button>
          </div>

          {/* Add to Cart Button */}
          <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                addToCart(product)
              }}
              className="w-full bg-background/95 hover:bg-background py-1.5 md:py-2.5 px-2 md:px-4 flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm font-medium transition-colors rounded-sm"
            >
              <ShoppingBag className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Add to Cart</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      <div className="block">
        <h3 className="font-medium text-xs md:text-sm leading-tight mb-1 md:mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
        <div className="flex items-center gap-1 md:gap-2 flex-wrap">
          <span className="font-semibold text-xs md:text-sm">₹{price.toLocaleString()}</span>
          <span className="text-[10px] md:text-sm text-muted-foreground line-through">
            ₹{originalPrice.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}

const baseVideoCards = [
  {
    title: "Premium Silk Linen Collection",
    price: 3499,
    originalPrice: 4999,
    videoSrc: "/Video-266.mp4",
    productId: "8",
    category: "Silk"
  },
  {
    title: "Designer Dupatta Elegance",
    price: 1899,
    originalPrice: 3499,
    videoSrc: "/dupaataa.mp4",
    productId: "2",
    category: "Dupatta"
  },
  {
    title: "Festive Special Collection",
    price: 3999,
    originalPrice: 6999,
    videoSrc: "/gemini_vedio.mp4",
    productId: "3",
    category: "Festive"
  },
  {
    title: "Banarasi Silk Elegance",
    price: 4299,
    originalPrice: 7999,
    videoSrc: "/bluesaree.mp4",
    productId: "4",
    category: "Banarasi"
  },
  {
    title: "Contemporary Elegance",
    price: 2799,
    originalPrice: 4999,
    videoSrc: "/videoplayback.mp4",
    productId: "5",
    category: "Contemporary"
  },
  {
    title: "Handloom Heritage Collection",
    price: 2890,
    originalPrice: 5290,
    videoSrc: "/Video-385.mp4",
    productId: "6",
    category: "Handloom"
  },
  {
    title: "Pure Linen Comfort",
    price: 2499,
    originalPrice: 4799,
    videoSrc: "/Video-28.mp4",
    productId: "1",
    category: "Linen"
  }
]

// Extended video collection with more variety
const extendedVideoCards = [
  // Silk Collection
  {
    title: "Royal Silk Elegance",
    price: 4599,
    originalPrice: 7299,
    videoSrc: "/Video-266.mp4",
    productId: "9",
    category: "Silk"
  },
  {
    title: "Luxurious Silk Drape",
    price: 3899,
    originalPrice: 6499,
    videoSrc: "/bluesaree.mp4",
    productId: "10",
    category: "Silk"
  },
  {
    title: "Premium Silk Weave",
    price: 4199,
    originalPrice: 6999,
    videoSrc: "/gemini_vedio.mp4",
    productId: "11",
    category: "Silk"
  },
  
  // Banarasi Collection
  {
    title: "Traditional Banarasi Gold",
    price: 5299,
    originalPrice: 8999,
    videoSrc: "/Video-385.mp4",
    productId: "12",
    category: "Banarasi"
  },
  {
    title: "Heritage Banarasi Silk",
    price: 4799,
    originalPrice: 7999,
    videoSrc: "/videoplayback.mp4",
    productId: "13",
    category: "Banarasi"
  },
  {
    title: "Classic Banarasi Weave",
    price: 4999,
    originalPrice: 8499,
    videoSrc: "/Video-28.mp4",
    productId: "14",
    category: "Banarasi"
  },
  
  // Handloom Collection
  {
    title: "Artisan Handloom Special",
    price: 3299,
    originalPrice: 5799,
    videoSrc: "/dupaataa.mp4",
    productId: "15",
    category: "Handloom"
  },
  {
    title: "Traditional Handloom Cotton",
    price: 2699,
    originalPrice: 4999,
    videoSrc: "/Video-266.mp4",
    productId: "16",
    category: "Handloom"
  },
  {
    title: "Heritage Handloom Craft",
    price: 3099,
    originalPrice: 5499,
    videoSrc: "/bluesaree.mp4",
    productId: "17",
    category: "Handloom"
  },
  
  // Linen Collection
  {
    title: "Organic Linen Comfort",
    price: 2799,
    originalPrice: 4599,
    videoSrc: "/gemini_vedio.mp4",
    productId: "18",
    category: "Linen"
  },
  {
    title: "Premium Linen Blend",
    price: 2999,
    originalPrice: 4999,
    videoSrc: "/Video-385.mp4",
    productId: "19",
    category: "Linen"
  },
  {
    title: "Summer Linen Collection",
    price: 2599,
    originalPrice: 4299,
    videoSrc: "/videoplayback.mp4",
    productId: "20",
    category: "Linen"
  },
  
  // Dupatta Collection
  {
    title: "Embroidered Dupatta Set",
    price: 2199,
    originalPrice: 3999,
    videoSrc: "/Video-28.mp4",
    productId: "21",
    category: "Dupatta"
  },
  {
    title: "Silk Dupatta Elegance",
    price: 2499,
    originalPrice: 4299,
    videoSrc: "/Video-266.mp4",
    productId: "22",
    category: "Dupatta"
  },
  {
    title: "Designer Dupatta Collection",
    price: 1999,
    originalPrice: 3699,
    videoSrc: "/bluesaree.mp4",
    productId: "23",
    category: "Dupatta"
  },
  
  // Festive Collection
  {
    title: "Wedding Special Saree",
    price: 5999,
    originalPrice: 9999,
    videoSrc: "/Video-385.mp4",
    productId: "24",
    category: "Festive"
  },
  {
    title: "Celebration Wear Elegance",
    price: 4599,
    originalPrice: 7999,
    videoSrc: "/videoplayback.mp4",
    productId: "25",
    category: "Festive"
  },
  {
    title: "Festival Special Collection",
    price: 4299,
    originalPrice: 7299,
    videoSrc: "/dupaataa.mp4",
    productId: "26",
    category: "Festive"
  },
  
  // Contemporary Collection
  {
    title: "Modern Drape Style",
    price: 3199,
    originalPrice: 5499,
    videoSrc: "/Video-28.mp4",
    productId: "27",
    category: "Contemporary"
  },
  {
    title: "Fusion Wear Collection",
    price: 2899,
    originalPrice: 4999,
    videoSrc: "/gemini_vedio.mp4",
    productId: "28",
    category: "Contemporary"
  },
  {
    title: "Urban Chic Saree",
    price: 3399,
    originalPrice: 5799,
    videoSrc: "/Video-266.mp4",
    productId: "29",
    category: "Contemporary"
  }
]

const categories = ["All", "Silk", "Banarasi", "Handloom", "Linen", "Dupatta", "Festive", "Contemporary"]

function VideoCollectionContent() {
  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get('category')
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || "All")
  const [currentHeroVideo, setCurrentHeroVideo] = useState(0)
  
  // Update selected category when URL parameter changes
  useEffect(() => {
    if (categoryFromUrl && categories.includes(categoryFromUrl)) {
      setSelectedCategory(categoryFromUrl)
    }
  }, [categoryFromUrl])
  
  // Create comprehensive video collection by combining base and extended videos
  const videoCards = [...baseVideoCards, ...extendedVideoCards]
  
  const filteredVideos = selectedCategory === "All" 
    ? videoCards 
    : videoCards.filter(card => card.category === selectedCategory)

  const heroVideos = [
    baseVideoCards[0], // Silk
    baseVideoCards[3], // Banarasi
    baseVideoCards[6], // Linen
    baseVideoCards[2], // Festive
    baseVideoCards[5], // Handloom
    baseVideoCards[4], // Contemporary
    baseVideoCards[1]  // Dupatta
  ]

  // Navigation functions
  const goToPrevious = () => {
    setCurrentHeroVideo((prev) => prev === 0 ? heroVideos.length - 1 : prev - 1)
  }

  const goToNext = () => {
    setCurrentHeroVideo((prev) => (prev + 1) % heroVideos.length)
  }

  // Auto-rotate hero videos every 5 seconds using a mixed selection
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroVideo((prev) => (prev + 1) % heroVideos.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black pt-[96px] lg:pt-[104px]">
        {/* Full-Page Video Cover Hero */}
        <section className="relative h-screen w-full overflow-hidden">
          {heroVideos.map((video, index) => (
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
          
          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-8 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-colors text-white group"
            aria-label="Previous video"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-8 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-colors text-white group"
            aria-label="Next video"
          >
            <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>
          
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
            
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
              {filteredVideos.map((card, index) => (
                <VideoCard
                  key={`${card.productId}-${index}`}
                  title={card.title}
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

export default function VideoCollectionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VideoCollectionContent />
    </Suspense>
  )
}