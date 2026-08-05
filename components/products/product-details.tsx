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
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-utils"
import { toast } from "sonner"

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
    ...product.images.map(img => ({ type: 'image' as const, src: optimizeCloudinaryUrl(img, 'image'), alt: product.name })),
    ...(product.videos || []).map(video => ({ type: 'video' as const, src: optimizeCloudinaryUrl(video, 'video'), alt: `${product.name} video` }))
  ]

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
  const isWishlisted = isInWishlist(product.id)
  const availableStock = product.stock ?? 0
  const outOfStock = availableStock <= 0

  const handleShare = async () => {
    const shareData = {
      title: `${product.name} | Linen Sarees`,
      text: `Check out ${product.name} on Linen Sarees!`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.url)
        toast.success("Link copied to clipboard!")
      }
    } catch (err) {
      console.log('Error sharing:', err)
    }
  }

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
    touchEndX.current = e.targetTouches[0].clientX
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
    <section className="py-4 sm:py-16 px-4 sm:px-2">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16">
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

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
          {/* Image Gallery */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
            {/* Desktop Image Grid (Myntra style) */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {mediaItems.map((media, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden select-none w-full aspect-[4/5] rounded-sm bg-muted/10"
                >
                  {media.type === 'image' ? (
                    <Image
                      src={media.src || "/placeholder.svg"}
                      alt={media.alt || `${product.name} view ${index + 1}`}
                      width={1000}
                      height={1250}
                      className="w-full h-full object-cover"
                      priority={index < 2}
                      draggable={false}
                    />
                  ) : (
                    <div className="relative w-full h-full bg-black">
                      <video
                        src={media.src}
                        className="w-full h-full object-cover"
                        controls
                        autoPlay
                        muted
                        loop
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Main Media with Swipe Support */}
            <div className="relative flex-1 w-full lg:hidden">
              <div
                className="relative overflow-hidden select-none w-full aspect-[4/5] rounded-sm bg-muted/10"
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
                    className="w-full h-full object-cover"
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
          <div className="lg:col-span-5 xl:col-span-4 lg:py-4 flex flex-col justify-start lg:sticky lg:top-[calc(var(--header-offset,120px)+2rem)] lg:h-fit lg:pb-12">

            {/* Header: Category & Reviews */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
              <Link
                href={`/categories/${product.categorySlug}`}
                className="text-[10px] sm:text-xs font-bold text-muted-foreground hover:text-primary uppercase tracking-wider"
              >
                {product.category}
              </Link>
              <div className="flex items-center gap-2">
                <StarRating rating={totalReviews > 0 ? avgRating : 0} size="sm" showRating={totalReviews > 0} />
                <Link href="#reviews" className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline">
                  {totalReviews > 0 ? `(${totalReviews})` : "No reviews yet"}
                </Link>
              </div>
            </div>

            {/* Title & SKU & Share */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="font-serif text-xl sm:text-3xl lg:text-4xl leading-tight">{product.name}</h1>
              <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-muted transition-colors shrink-0"
                aria-label="Share product"
                title="Share product"
              >
                <Share2 className="w-5 h-5 text-foreground/80 hover:text-primary" />
              </button>
            </div>
            {product.sku && (
              <div className="text-xs sm:text-sm text-muted-foreground mb-4">
                SKU: <span className="font-mono text-foreground/80">{product.sku}</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl sm:text-3xl font-bold">₹{product.price.toLocaleString('en-IN')}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-sm sm:text-base text-muted-foreground line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="bg-red-600 text-white text-[10px] sm:text-xs px-2 py-0.5 font-bold rounded-sm shadow-sm animate-pulse">
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

            {/* Description (Clamped to save space) */}
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">
              {product.description}
            </p>

            {/* Color & Quantity Row */}
            <div className="flex flex-wrap items-end gap-6 mb-6">
              <div>
                <p className="text-xs sm:text-sm font-medium mb-2 text-muted-foreground">Color</p>
                <div className="text-sm font-medium px-4 py-2 border border-border rounded-md bg-muted/30">
                  {product.color}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Quantity</p>
                  {!outOfStock && availableStock < 10 && availableStock > 0 && (
                    <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Only {availableStock} left</span>
                  )}
                </div>
                <div className="flex items-center border border-border rounded-md overflow-hidden bg-background">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={outOfStock} className="p-2.5 hover:bg-muted transition-colors disabled:opacity-50">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-medium">{outOfStock ? 0 : quantity}</span>
                  <button onClick={() => setQuantity(Math.min(availableStock, quantity + 1))} disabled={outOfStock || quantity >= availableStock} className="p-2.5 hover:bg-muted transition-colors disabled:opacity-50">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                {outOfStock ? (
                  <Button
                    size="lg"
                    disabled
                    className="w-full sm:flex-1 h-14 sm:h-12 px-4 text-xs sm:text-sm font-bold btn-premium bg-muted text-muted-foreground cursor-not-allowed"
                  >
                    Out of Stock
                  </Button>
                ) : (
                  <>
                    <Link href="/checkout" className="w-full sm:flex-1 block">
                      <Button
                        size="lg"
                        className="w-full h-14 sm:h-12 px-2 sm:px-4 text-xs sm:text-sm font-bold btn-premium bg-primary text-white hover:bg-primary/95 group"
                        onClick={() => addToCart(product, quantity)}
                      >
                        <div className="absolute inset-0 animate-shimmer opacity-30 pointer-events-none" />
                        <span className="relative z-10 whitespace-nowrap">Buy It Now</span>
                        <ChevronRight className="w-4 h-4 ml-1 shrink-0 group-hover:translate-x-1 transition-transform duration-500" />
                      </Button>
                    </Link>

                    <Button
                      size="lg"
                      className={`w-full sm:flex-1 h-14 sm:h-12 px-2 sm:px-4 text-xs sm:text-sm font-bold btn-premium border-2 border-primary/20 text-primary bg-transparent hover:bg-primary/5 hover:border-primary/40 ${isAdded ? "text-green-600 border-green-600/30 bg-green-50" : ""
                        }`}
                      onClick={handleAddToCart}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4 mr-1 sm:mr-2 shrink-0 animate-[bounceIn_0.4s_ease-out]" />
                          <span className="whitespace-nowrap">Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 mr-1 sm:mr-2 shrink-0" />
                          <span className="whitespace-nowrap">Add to Cart</span>
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
              <div className="flex flex-row gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  className={`flex-1 h-12 px-2 bg-transparent border-border hover:border-primary/50 hover:bg-muted transition-all duration-500 btn-premium lowercase tracking-widest font-light italic text-[10px] sm:text-sm ${isWishlisted ? 'text-primary border-primary bg-primary/5' : ''}`}
                  onClick={handleWishlistClick}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 shrink-0 ${isWishlisted ? 'fill-primary' : ''}`} />
                  <span className="truncate">{isWishlisted ? "wishlisted" : "Add to Wishlist"}</span>
                </Button>
                <Button size="lg" variant="outline" className="w-12 h-12 shrink-0 flex items-center justify-center bg-transparent border-border hover:border-primary/50 hover:bg-muted transition-all duration-500 rounded-sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="py-4 border-t border-b border-border mb-6">
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
