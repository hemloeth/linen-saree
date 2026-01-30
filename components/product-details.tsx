"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Share2, Minus, Plus, Check, Play, ChevronLeft, ChevronRight } from "lucide-react"
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
    setTimeout(() => setIsAdded(false), 2000)
  }

  const handleWishlistClick = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  return (
    <section className="py-8 lg:py-16 px-4 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/collections" className="hover:text-foreground">Collections</Link>
          <span className="mx-2">/</span>
          <Link href={`/collections/${product.categorySlug}`} className="hover:text-foreground">{product.category}</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
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
                  className={`relative w-20 h-24 flex-shrink-0 border-2 transition-colors ${
                    selectedMedia === index ? "border-primary" : "border-transparent"
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
            <div className="relative flex-1">
              <div 
                className="relative aspect-[3/4] lg:aspect-auto lg:h-[700px] overflow-hidden bg-muted select-none"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {mediaItems[selectedMedia]?.type === 'image' ? (
                  <Image
                    src={mediaItems[selectedMedia]?.src || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                    draggable={false}
                  />
                ) : (
                  <video
                    src={mediaItems[selectedMedia]?.src}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    muted
                    loop
                  />
                )}
                
                {product.isOnSale && (
                  <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm px-3 py-1 font-medium z-10">
                    {discount}% OFF
                  </span>
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
                        className={`w-2 h-2 rounded-full transition-colors ${
                          selectedMedia === index ? "bg-white" : "bg-white/50"
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Thumbnails - Below main image */}
              <div className="flex lg:hidden gap-3 mt-4 overflow-x-auto pb-2">
                {mediaItems.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedMedia(index)}
                    className={`relative w-16 h-20 flex-shrink-0 border-2 transition-colors ${
                      selectedMedia === index ? "border-primary" : "border-transparent"
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
                className="text-sm text-muted-foreground hover:text-primary uppercase tracking-wide"
              >
                {product.category}
              </Link>
              {product.isNew && (
                <span className="bg-foreground text-background text-xs px-2 py-1">NEW</span>
              )}
            </div>

            <h1 className="font-serif text-3xl lg:text-4xl mb-4">{product.name}</h1>

            {/* Reviews */}
            {reviewStats.totalReviews > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <StarRating rating={reviewStats.averageRating} size="md" showRating />
                <Link 
                  href="#reviews" 
                  className="text-sm text-muted-foreground hover:text-primary underline"
                >
                  ({reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''})
                </Link>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-semibold">₹{product.price.toLocaleString()}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                  <span className="text-primary font-medium">Save {discount}%</span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Color */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Color: <span className="text-muted-foreground">{product.color}</span></p>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3">Quantity</p>
              <div className="flex items-center border border-border w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-muted transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-muted transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <Button
                size="lg"
                className="flex-1 bg-primary hover:bg-primary/90 py-6 text-base"
                onClick={handleAddToCart}
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Added to Cart
                  </>
                ) : (
                  "Add to Cart"
                )}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className={`p-6 bg-transparent ${isWishlisted ? 'text-primary border-primary' : ''}`}
                onClick={handleWishlistClick}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-primary' : ''}`} />
              </Button>
              <Button size="lg" variant="outline" className="p-6 bg-transparent">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Buy Now */}
            <Link href="/checkout">
              <Button
                size="lg"
                variant="outline"
                className="w-full py-6 text-base mb-8 bg-transparent"
                onClick={() => addToCart(product, quantity)}
              >
                Buy Now
              </Button>
            </Link>

            {/* Trust Badges */}
            <div className="py-6 border-t border-b border-border mb-8">
              <TrustBadges 
                variant="horizontal" 
                showDescription={false}
                iconSize="md"
                className="justify-start"
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
