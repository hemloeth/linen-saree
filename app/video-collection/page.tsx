"use client"

import { useRef, useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ShoppingBag, Heart, Play, Pause, ChevronLeft, ChevronRight } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { useProducts } from "@/context/product-context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
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
  image?: string
  product?: any
}

function VideoCard({ title, price, originalPrice, videoSrc, productId, category, slug, image, product }: VideoCardProps) {
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

  const targetProduct = product || mappedProducts.find(p => p.id === productId) || {
    id: productId,
    name: title,
    price,
    originalPrice,
    slug,
    category,
    image: image || "",
    images: image ? [image] : [],
    videos: [videoSrc]
  }

  const discount = originalPrice > price && originalPrice > 0 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0
  const isWishlisted = isInWishlist(targetProduct.id)

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
      removeFromWishlist(targetProduct.id)
    } else {
      addToWishlist(targetProduct)
    }
  }

  const posterImage = image 
    ? resolveMediaUrl(image) 
    : targetProduct?.image 
      ? resolveMediaUrl(targetProduct.image) 
      : targetProduct?.images?.[0] 
        ? resolveMediaUrl(targetProduct.images[0]) 
        : undefined

  return (
    <Link href={`/product/${slug}`} className="group relative w-full block cursor-pointer">
      <div className="relative w-full mb-4" ref={setRefs}>
        <div className="aspect-[3/4] overflow-hidden bg-black relative">
          {isNearScreen && (
            <video
              ref={videoRef}
              src={resolveMediaUrl(videoSrc)}
              poster={posterImage}
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
            {discount > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] md:text-xs px-1.5 py-0.5 md:px-2 md:py-1 font-medium rounded-sm whitespace-nowrap inline-block">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              togglePlay()
            }}
            className="absolute top-1 right-8 md:top-2 md:right-12 p-1.5 md:p-2 bg-background/90 hover:bg-background rounded-full transition-colors opacity-0 group-hover:opacity-100 z-10"
            aria-label={isPlaying ? "Pause video" : "Play video"}
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
                addToCart(targetProduct)
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
          {originalPrice > price && (
            <span className="text-[10px] md:text-sm text-muted-foreground line-through">
              ₹{originalPrice.toLocaleString('en-IN')}
            </span>
          )}
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
      originalPrice: p.originalPrice || p.price,
      videoSrc: p.videos![0],
      productId: p.id,
      category: p.category || "Other",
      slug: p.slug,
      image: p.image || (p.images && p.images[0]) || "",
      product: p
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
    if (heroVideos.length === 0) return
    setCurrentHeroVideo((prev) => prev === 0 ? heroVideos.length - 1 : prev - 1)
  }

  const goToNext = () => {
    if (heroVideos.length === 0) return
    setCurrentHeroVideo((prev) => (prev + 1) % heroVideos.length)
  }

  // Auto-rotate disabled to prevent site lag; manual navigation remains active

  const [visibleCount, setVisibleCount] = useState(12)

  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(12)
  }, [selectedCategory])

  return (
    <>
      <Header />
      <div
        className="min-h-screen bg-black"
        style={{ paddingTop: 'var(--header-offset, 80px)' }}
      >
        {/* Full-Page Video Cover Hero */}
        <section className="relative h-[calc(100vh-var(--header-offset,80px))] min-h-[540px] max-h-[960px] w-full overflow-hidden bg-black flex items-center justify-center">
          {heroVideos.map((video, index) => {
            const isActive = index === currentHeroVideo
            if (!isActive) return null

            return (
              <div
                key={video.productId || index}
                className="absolute inset-0 flex items-center justify-center animate-in fade-in duration-700"
              >
                {/* Ambient Blurred Background Video to fill wide screens */}
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                  tabIndex={-1}
                  poster={video.image ? resolveMediaUrl(video.image) : undefined}
                  className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-35 scale-110 pointer-events-none select-none"
                  src={resolveMediaUrl(video.videoSrc)}
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/60 pointer-events-none" />

                {/* Main Foreground Video - constrained to container height so whole body is 100% visible */}
                <div className="relative z-10 h-full w-full flex items-center justify-center px-4 py-2">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    poster={video.image ? resolveMediaUrl(video.image) : undefined}
                    className="h-full w-auto max-w-full max-h-full object-contain object-center shadow-2xl drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)]"
                    src={resolveMediaUrl(video.videoSrc)}
                  />
                </div>
              </div>
            )
          })}

          {/* Top Header Badge */}
          <div className="absolute top-4 inset-x-0 z-20 flex justify-center pointer-events-none px-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/15 text-[10px] md:text-xs tracking-[0.25em] uppercase text-white/90">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
              <span>Saree Stories • Motion Lookbook</span>
            </div>
          </div>

          {/* Navigation Arrows */}
          {heroVideos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 bg-black/60 hover:bg-black/90 border border-white/20 backdrop-blur-md transition-colors text-white group rounded-none cursor-pointer"
                aria-label="Previous video"
              >
                <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 bg-black/60 hover:bg-black/90 border border-white/20 backdrop-blur-md transition-colors text-white group rounded-none cursor-pointer"
                aria-label="Next video"
              >
                <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          )}

          {/* Featured Saree Floating Card */}
          {heroVideos[currentHeroVideo] && (
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-8 z-20 max-w-[280px] sm:max-w-xs">
              <div className="bg-black/80 backdrop-blur-md border border-white/15 p-3 sm:p-4 text-white shadow-2xl rounded-none">
                <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/60 mb-1">
                  Featured Saree
                </div>
                <h3 className="font-serif text-xs sm:text-sm font-semibold line-clamp-1 text-white">
                  {heroVideos[currentHeroVideo].title}
                </h3>
                <div className="flex items-center gap-2 mt-1 mb-2.5">
                  <span className="text-xs sm:text-sm font-bold text-white">
                    ₹{heroVideos[currentHeroVideo].price.toLocaleString('en-IN')}
                  </span>
                  {heroVideos[currentHeroVideo].originalPrice > heroVideos[currentHeroVideo].price && (
                    <span className="text-[10px] sm:text-xs text-white/50 line-through">
                      ₹{heroVideos[currentHeroVideo].originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <Link
                  href={`/product/${heroVideos[currentHeroVideo].slug}`}
                  className="inline-flex items-center justify-center w-full px-3 py-1.5 bg-white text-black text-[11px] font-semibold uppercase tracking-wider hover:bg-white/90 transition-colors rounded-none"
                >
                  View Saree
                </Link>
              </div>
            </div>
          )}

          {/* Slide Indicator */}
          {heroVideos.length > 1 && (
            <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-8 z-20 flex items-center gap-2 text-white/80 text-xs font-mono tracking-widest bg-black/60 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-none">
              <span>{String(currentHeroVideo + 1).padStart(2, '0')}</span>
              <span className="text-white/30">/</span>
              <span>{String(heroVideos.length).padStart(2, '0')}</span>
            </div>
          )}
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
              {filteredVideos.slice(0, visibleCount).map((card, index) => (
                <VideoCard
                  key={`${card.productId}-${index}`}
                  title={card.title}
                  price={card.price}
                  originalPrice={card.originalPrice}
                  videoSrc={card.videoSrc}
                  productId={card.productId}
                  category={card.category}
                  slug={card.slug}
                  image={card.image}
                  product={card.product}
                />
              ))}
            </div>

            {filteredVideos.length > visibleCount && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setVisibleCount(prev => prev + 12)}
                  className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-none hover:bg-primary/90 transition-colors cursor-pointer shadow-md"
                >
                  Load More Videos ({filteredVideos.length - visibleCount} remaining)
                </button>
              </div>
            )}

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
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-none border border-primary/20 p-12">
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
      <Footer />
    </>
  )
}

export default function VideoCollectionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <VideoCollectionContent />
    </Suspense>
  )
}
