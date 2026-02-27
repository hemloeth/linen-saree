"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Share2, Minus, Plus, Check, Play, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { Button } from "@/components/ui/button"
import { TrustBadges } from "@/components/trust-badges"
import { StarRating } from "@/components/star-rating"
import { getReviewStats } from "@/lib/reviews"
import type { Product } from "@/lib/products"

interface ProductDetailsProps {
  product: Product
}

type MediaItem = {
  type: 'image' | 'video'
  src: string
  alt?: string
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedMedia, setSelectedMedia] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  // Touch/swipe handling
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const [isDragging, setIsDragging] = useState(false)

  // Get review stats
  const reviewStats = getReviewStats(product.id)

  // Combine images and videos into a single media array
  const mediaItems: MediaItem[] = [
    ...product.images.map(img => ({ type: 'image' as const, src: img, alt: product.name })),
    ...(product.videos || []).map(video => ({ type: 'video' as const, src: video, alt: `${product.name} video` }))
  ]

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
  const isWishlisted = isInWishlist(product.id)

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const swipeDistance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swipe left - next image
        setSelectedMedia(prev => (prev + 1) % mediaItems.length)
      } else {
        // Swipe right - previous image
        setSelectedMedia(prev => (prev - 1 + mediaItems.length) % mediaItems.length)
      }
    }
  }

  const goToPrevious = () => {
    setSelectedMedia(prev => (prev - 1 + mediaItems.length) % mediaItems.length)
  }

  const goToNext = () => {
    setSelectedMedia(prev => (prev + 1) % mediaItems.length)
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2500)
  }

  const handleWishlistClick = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  return (
    <section className="py-2 sm:py-16 px-2 sm:px-4 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Breadcrumb - Further reduced size and spacing */}
        <nav className="text-[9px] sm:text-xs sm:text-sm text-muted-foreground mb-3 flex flex-wrap items-center gap-y-0.5">
          <Link href="/" className="hover:text-foreground inline-flex items-center min-w-fit">Home</Link>
          <span className="mx-1 sm:mx-2 text-border">/</span>
          <Link href="/collections" className="hover:text-foreground inline-flex items-center min-w-fit">Collections</Link>
          <span className="mx-1 sm:mx-2 text-border">/</span>
          <Link href={`/collections/${product.categorySlug}`} className="hover:text-foreground inline-flex items-center min-w-fit">Sarees</Link>
          <span className="mx-1 sm:mx-2 text-border">/</span>
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <div className="flex flex-col-reverse lg:flex-row gap-4">
            {/* Thumbnails - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible">
              {mediaItems.map((media, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedMedia(index)}
                  className={`relative w-20 h-24 flex-shrink-0 border-2 transition-colors ${selectedMedia === index ? "border-primary" : "border-transparent"
                    }`}
                >
                  {media.type === 'image' ? (
                    <Image
                      src={media.src || "/placeholder.svg"}
                      alt={media.alt || `${product.name} view ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="relative w-full h-full bg-black">
                      <video
                        src={media.src}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Main Media with Swipe Support */}
            <div className="relative flex-1 w-full">
              <div
                className="relative overflow-hidden bg-muted select-none w-full aspect-[4/5] rounded-sm border border-border/50"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {mediaItems[selectedMedia]?.type === 'image' ? (
                  <Image
                    src={mediaItems[selectedMedia]?.src || "/placeholder.svg"}
                    alt={product.name}
                    width={1000}
                    height={1250}
                    className="w-full h-full object-cover"
                    priority
                    draggable={false}
                  />
                ) : (
                  <video
                    src={mediaItems[selectedMedia]?.src}
                    className="w-full h-full object-cover bg-black"
                    controls
                    autoPlay
                    muted
                    loop
                  />
                )}



                {/* Navigation Arrows - Only show if more than 1 media item */}
                {mediaItems.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10 lg:hidden"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10 lg:hidden"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Dots Indicator - Mobile only */}
                {mediaItems.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 lg:hidden">
                    {mediaItems.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedMedia(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${selectedMedia === index ? "bg-white" : "bg-white/50"
                          }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Thumbnails - Below main image */}
              <div className="grid lg:hidden grid-cols-5 gap-2 mt-4">
                {mediaItems.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedMedia(index)}
                    className={`relative aspect-[4/5] border-2 transition-colors ${selectedMedia === index ? "border-primary" : "border-transparent"
                      }`}
                  >
                    {media.type === 'image' ? (
                      <Image
                        src={media.src || "/placeholder.svg"}
                        alt={media.alt || `${product.name} view ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="relative w-full h-full bg-black">
                        <video
                          src={media.src}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:py-8">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href={`/collections/${product.categorySlug}`}
                className="text-[10px] sm:text-xs text-muted-foreground hover:text-primary uppercase tracking-wider"
              >
                {product.category}
              </Link>
            </div>

            <h1 className="font-serif text-lg sm:text-3xl lg:text-4xl mb-1 sm:mb-4 leading-tight">{product.name}</h1>

            {/* Reviews */}
            <div className="flex items-center gap-3 mb-6">
              <StarRating
                rating={reviewStats.totalReviews > 0 ? reviewStats.averageRating : 0}
                size="md"
                showRating={reviewStats.totalReviews > 0}
              />
              <Link
                href="#reviews"
                className="text-sm text-muted-foreground hover:text-primary underline decoration-muted-foreground/30 underline-offset-4"
              >
                {reviewStats.totalReviews > 0
                  ? `(${reviewStats.totalReviews} review${reviewStats.totalReviews !== 1 ? 's' : ''})`
                  : "Be the first to review"
                }
              </Link>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 flex-wrap">
              <span className="text-xl sm:text-3xl font-bold">₹{product.price.toLocaleString()}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                  <span className="bg-red-600 text-white text-[10px] sm:text-xs px-2 py-1 font-bold rounded-full shadow-md animate-pulse">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6 sm:mb-8">
              {product.description}
            </p>

            {/* Color */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Color: <span className="text-muted-foreground">{product.color}</span></p>
            </div>

            {/* Quantity */}
            <div className="mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">Quantity</p>
              <div className="flex items-center border border-border w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 sm:p-3 hover:bg-muted transition-colors"
                >
                  <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <span className="px-4 sm:px-6 text-base sm:text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 sm:p-3 hover:bg-muted transition-colors"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:gap-4 mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className={`flex-1 h-auto py-3 sm:py-5 px-6 text-sm sm:text-base font-bold tracking-wide transition-all duration-300 active:scale-95 ${isAdded
                    ? "bg-green-600 hover:bg-green-600 text-white scale-[1.02]"
                    : "bg-primary hover:bg-primary/90"
                    }`}
                  onClick={handleAddToCart}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-5 h-5 mr-2 animate-[bounceIn_0.4s_ease-out]" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Link href="/checkout" className="flex-1">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full h-auto py-3 sm:py-5 px-6 text-sm sm:text-base font-bold tracking-wide border-primary text-primary hover:bg-primary/5 transition-all active:scale-95 focus-visible:ring-primary"
                    onClick={() => addToCart(product, quantity)}
                  >
                    Buy It Now
                  </Button>
                </Link>
              </div>
              <div className="flex gap-2">
                <Button
                  size="lg"
                  variant="outline"
                  className={`flex-1 p-5 bg-transparent border-border hover:bg-muted transition-all ${isWishlisted ? 'text-primary border-primary bg-primary/5' : ''}`}
                  onClick={handleWishlistClick}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isWishlisted ? 'fill-primary' : ''}`} />
                  {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                </Button>
                <Button size="lg" variant="outline" className="p-5 bg-transparent border-border hover:bg-muted transition-all">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="py-4 sm:py-6 border-t border-b border-border mb-6 sm:mb-8">
              <TrustBadges
                variant="horizontal"
                showDescription={false}
                iconSize="sm"
                className="justify-start gap-4"
              />
            </div>

            {/* Product Details */}
            <div>
              <h3 className="font-medium mb-4">Product Details</h3>
              <ul className="space-y-2">
                {product.details.map((detail, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
