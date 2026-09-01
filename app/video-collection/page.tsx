"use client"

import { useRef, useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ShoppingBag, Heart, Play, Pause, ChevronLeft, ChevronRight } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { useProducts } from "@/context/product-context"
import { Header } from "@/components/layout/header"
import Link from "next/link"
import { resolveMediaUrl } from "@/lib/media"
import { useInView } from "react-intersection-observer"

interface VideoCardProps {
  title: string
  price: number
  originalPrice: number
  videoSrc: string
  productId: string
  category: string
  slug: string
}

function VideoCard({ title, price, originalPrice, videoSrc, productId, category, slug }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { mappedProducts } = useProducts()

  // 1. Observer for playing/pausing when visible
  const { ref: inViewRef, inView } = useInView({
    rootMargin: "100px 0px", 
    threshold: 0,
  })

  // 2. Observer for lazy mounting (DOM virtualization)
  const { ref: mountRef, inView: isNearScreen } = useInView({
    rootMargin: "1200px 0px", 
    triggerOnce: true,
  })

  const setRefs = (node: HTMLDivElement | null) => {
    inViewRef(node)
    mountRef(node)
  }

  useEffect(() => {
    if (videoRef.current) {
      if (inView) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            setIsPlaying(false)
          });
        }
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }, [inView])

  const product = mappedProducts.find(p => p.id === productId) || mappedProducts[0] || ({} as any)
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
    <Link href={`/product/${slug}`} className="group relative w-full block cursor-pointer">
      <div className="relative w-full mb-4" ref={setRefs}>
        <div className="aspect-[3/4] overflow-hidden bg-black relative">
          {isNearScreen && (
            <video
              ref={videoRef}
              src={resolveMediaUrl(videoSrc)}
              poster={product.image ? resolveMediaUrl(product.image) : (product.images?.[0] ? resolveMediaUrl(product.images[0]) : undefined)}
              loop
              muted
              playsInline
              preload="metadata"
              disablePictureInPicture
              disableRemotePlayback
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onLoadedData={() => { if (inView) setIsPlaying(true) }}
            />
          )}

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
              className={`p-1.5 md:p-2 bg-background/90 hover:bg-background rounded-full transition-colors shadow-sm ${isWishlisted ? 'text-primary' : ''
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
          <span className="font-semibold text-xs md:text-sm">₹{price.toLocaleString('en-IN')}</span>
          <span className="text-[10px] md:text-sm text-muted-foreground line-through">
            ₹{originalPrice.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </Link>
  )
}

function VideoCollectionContent() {
  const { mappedProducts } = useProducts()
  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get('category')
  
  // Extract products with videos and map them to video cards
  const videoCards = mappedProducts
    .filter(p => p.videos && p.videos.length > 0)
    .map(p => ({
      title: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      videoSrc: p.videos![0],
      productId: p.id,
      category: p.category || "Other",
      slug: p.slug
    }))
    
  // Extract unique categories dynamically
  const dynamicCategories = ["All", ...Array.from(new Set(videoCards.map(v => v.category)))]

  const [selectedCategory, setSelectedCategory] = useState(
    categoryFromUrl && dynamicCategories.includes(categoryFromUrl) ? categoryFromUrl : "All"
  )
  const [currentHeroVideo, setCurrentHeroVideo] = useState(0)

  // Update selected category when URL parameter changes
  useEffect(() => {
    if (categoryFromUrl && dynamicCategories.includes(categoryFromUrl)) {
      setSelectedCategory(categoryFromUrl)
    }
  }, [categoryFromUrl, mappedProducts.length])

  const filteredVideos = selectedCategory === "All"
    ? videoCards
    : videoCards.filter(card => card.category === selectedCategory)

  // Use top videos for the hero slider
  const heroVideos = videoCards.slice(0, 7)

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
      setCurrentHeroVideo((prev) => (prev + 1) % (heroVideos.length || 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [heroVideos.length])

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black pt-[96px] lg:pt-[104px]">
        {/* Full-Page Video Cover Hero */}
        <section className="relative h-[calc(100vh-100px)] w-full overflow-hidden">
          {heroVideos.map((video, index) => (
            index === currentHeroVideo && (
              <div
                key={index}
                className="absolute inset-0 animate-in fade-in duration-1000"
              >
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  poster={video.image ? resolveMediaUrl(video.image) : undefined}
                  className="w-full h-full object-cover object-top"
                  src={resolveMediaUrl(video.videoSrc)}
                />
              </div>
            )
          ))}

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Navigation Arrows */}
          {heroVideos.length > 0 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-1.5 md:p-3 bg-white/10 md:bg-white/20 hover:bg-white/20 md:hover:bg-white/30 backdrop-blur-sm transition-colors text-white/70 md:text-white group rounded-full md:rounded-none"
                aria-label="Previous video"
              >
                <ChevronLeft className="w-4 h-4 md:w-6 md:h-6 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-1.5 md:p-3 bg-white/10 md:bg-white/20 hover:bg-white/20 md:hover:bg-white/30 backdrop-blur-sm transition-colors text-white/70 md:text-white group rounded-full md:rounded-none"
                aria-label="Next video"
              >
                <ChevronRight className="w-4 h-4 md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          )}

          {/* Hero Content */}
          <div className="absolute inset-0 flex items-center justify-center text-center text-white z-10 pointer-events-none">
            <div className="max-w-4xl px-4">
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-tight drop-shadow-xl">
                Saree Stories
              </h1>
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
        <section className="px-2 py-12 bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl mb-4 text-gray-900">
                Browse by Category
              </h2>
              <p className="text-lg text-muted-foreground">
                Filter our collection to find your perfect saree
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {dynamicCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 md:px-6 py-1.5 md:py-2.5 text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-300 cursor-pointer ${selectedCategory === category
                    ? "bg-primary text-primary-foreground shadow-md transform scale-105"
                    : "bg-white text-muted-foreground border border-border hover:border-primary/30 hover:text-primary hover:bg-secondary/50"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Video Grid */}
        <section id="video-grid" className="px-2 py-24 bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16">
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
                  slug={card.slug}
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
        <section className="px-2 pb-16 bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 text-center">
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
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-none font-bold btn-premium transition-colors duration-300 inline-block"
                >
                  View All Products
                </Link>
                <Link
                  href="/contact"
                  className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-none font-bold border border-gray-200 transition-colors duration-300 inline-block"
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
