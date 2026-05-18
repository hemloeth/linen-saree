"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Share2, Minus, Plus, Check, Play, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { Button } from "@/components/ui/button"
import { TrustBadges } from "@/components/common/trust-badges"
import { StarRating } from "@/components/common/star-rating"
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
  const avgRating = product.averageRating || 0
  const totalReviews = product.totalReviews || 0

  // Combine images and videos into a single media array
  const mediaItems: MediaItem[] = [
    ...product.images.map(img => ({ type: 'image' as const, src: img, alt: product.name })),
    ...(product.videos || []).map(video => ({ type: 'video' as const, src: video, alt: `${product.name} video` }))
  ]

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
  const isWishlisted = isInWishlist(product.id)
  const availableStock = product.stock ?? 0
  const outOfStock = availableStock <= 0

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
        setSelectedMedia(prev => (prev + 1) % mediaItems.length)
      } else {
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
        {/* Breadcrumb */}
        <nav className="text-[9px] sm:text-xs sm:text-sm text-muted-foreground mb-3 flex flex-wrap items-center gap-y-0.5">
          <Link href="/" className="hover:text-foreground inline-flex items-center min-w-fit">Home</Link>
          <span className="mx-1 sm:mx-2 text-border">/</span>
          <Link href="/collections" className="hover:text-foreground inline-flex items-center min-w-fit">Collections</Link>
          <span className="mx-1 sm:mx-2 text-border">/</span>
          <Link href={`/categories/${product.categorySlug}`} className="hover:text-foreground inline-flex items-center min-w-fit">Sarees</Link>
          <span className="mx-1 sm:mx-2 text-border">/</span>
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <div className="flex flex-col-reverse lg:flex-row gap-4">
            {/* Thumbnails - Vertical on left side (desktop) */}
            <div className="hidden lg:flex lg:flex-col gap-3">
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
                className="relative overflow-hidden select-none w-full aspect-[9/8] rounded-sm"
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
                    className="w-full h-full object-contain"
                    priority
                    draggable={false}
                  />
                ) : (
                  <video
                    src={mediaItems[selectedMedia]?.src}
                    className="w-full h-full object-contain"
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
                href={`/categories/${product.categorySlug}`}
                className="text-[10px] sm:text-xs text-muted-foreground hover:text-primary uppercase tracking-wider"
              >
                {product.category}
              </Link>
            </div>

            <h1 className="font-serif text-lg sm:text-3xl lg:text-4xl mb-1 sm:mb-4 leading-tight">{product.name}</h1>

            {/* Reviews */}
            <div className="flex items-center gap-3 mb-6">
              <StarRating
                rating={totalReviews > 0 ? avgRating : 0}
                size="md"
                showRating={totalReviews > 0}
              />
              <Link
                href="#reviews"
                className="text-sm text-muted-foreground hover:text-primary underline decoration-muted-foreground/30 underline-offset-4"
              >
                {totalReviews > 0
                  ? `(${totalReviews} review${totalReviews !== 1 ? 's' : ''})`
                  : "Be the first to review"
                }
              </Link>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 flex-wrap">
              <span className="text-xl sm:text-3xl font-bold">₹{product.price.toLocaleString('en-IN')}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="bg-red-600 text-white text-[10px] sm:text-xs px-2 py-1 font-bold rounded-full shadow-md animate-pulse">
                    {discount}% OFF
                  </span>
                </>
              )}
              {outOfStock && (
                <span className="bg-black text-white text-[10px] sm:text-xs px-2 py-1 font-bold rounded-sm uppercase tracking-wider backdrop-blur-sm shadow-sm inline-block ml-auto">
                  Out of Stock
                </span>
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
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <p className="text-xs sm:text-sm font-medium">Quantity</p>
                {!outOfStock && availableStock < 10 && availableStock > 0 && (
                  <p className="text-xs text-red-500 font-medium">Only {availableStock} left in stock</p>
                )}
              </div>
              <div className="flex items-center border border-border w-fit opacity-100 disabled:opacity-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={outOfStock}
                  className="p-2 sm:p-3 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <span className="px-4 sm:px-6 text-base sm:text-lg font-medium">{outOfStock ? 0 : quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  disabled={outOfStock || quantity >= availableStock}
                  className="p-2 sm:p-3 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:gap-4 mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                {outOfStock ? (
                  <Button
                    size="lg"
                    disabled
                    className="flex-1 w-full h-auto py-4 px-8 text-sm sm:text-base font-bold btn-premium bg-muted text-muted-foreground cursor-not-allowed"
                  >
                    Out of Stock
                  </Button>
                ) : (
                  <>
                    <Link href="/checkout" className="flex-1 order-1 sm:order-2">
                      <Button
                        size="lg"
                        className="w-full h-auto py-4 px-8 text-sm sm:text-base font-bold btn-premium bg-primary text-white hover:bg-primary/95 group"
                        onClick={() => addToCart(product, quantity)}
                      >
                        <div className="absolute inset-0 animate-shimmer opacity-30 pointer-events-none" />
                        <span className="relative z-10">Buy It Now</span>
                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-500" />
                      </Button>
                    </Link>

                    <Button
                      size="lg"
                      className={`flex-1 order-2 sm:order-1 h-auto py-4 px-8 text-sm sm:text-base font-bold btn-premium border-2 border-primary/20 text-primary bg-transparent hover:bg-primary/5 hover:border-primary/40 ${isAdded ? "text-green-600 border-green-600/30 bg-green-50" : ""
                        }`}
                      onClick={handleAddToCart}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-5 h-5 mr-2 animate-[bounceIn_0.4s_ease-out]" />
                          Added
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="lg"
                  variant="outline"
                  className={`flex-1 h-16 bg-transparent border-border hover:border-primary/50 hover:bg-muted transition-all duration-500 btn-premium lowercase tracking-widest font-light italic ${isWishlisted ? 'text-primary border-primary bg-primary/5' : ''}`}
                  onClick={handleWishlistClick}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isWishlisted ? 'fill-primary' : ''}`} />
                  {isWishlisted ? "wishlisted" : "Add to Wishlist"}
                </Button>
                <Button size="lg" variant="outline" className="w-16 h-16 flex items-center justify-center bg-transparent border-border hover:border-primary/50 hover:bg-muted transition-all duration-500 rounded-sm">
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
