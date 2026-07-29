"use client"

import { useRef, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingBag, Check } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { StarRating } from "@/components/common/star-rating"
import type { Product } from "@/lib/products"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-utils"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [api, setApi] = useState<CarouselApi>()
  const [isAdded, setIsAdded] = useState(false)
  const [mounted, setMounted] = useState(false)
 
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!api) return
      // Stop autoplay initially so it only runs on hover
      ; (api.plugins() as any).autoplay.stop()
  }, [api])

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
  const isWishlisted = mounted ? isInWishlist(product.id) : false

  const avgRating = product.averageRating || 0
  const totalReviews = product.totalReviews || 0
  const outOfStock = product.stock !== undefined && product.stock <= 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addToCart(product)
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

  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault()
    startTransition(() => {
      router.push(`/product/${product.slug}`)
    })
  }

  return (
    <div className={cn("group relative w-full max-w-[280px] mx-auto", className)}>
      <div className="relative w-full mb-4">
        <div
          className="relative overflow-hidden rounded-sm"
          onMouseEnter={() => {
            if (!api) return
              ; (api.plugins() as any).autoplay.play()
          }}
          onMouseLeave={() => {
            if (!api) return
              ; (api.plugins() as any).autoplay.stop()
            api.scrollTo(0)
          }}
        >
          {isPending && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <LoadingSpinner size="md" />
            </div>
          )}
          {product.images && product.images.length > 1 ? (
            <Carousel
              className="w-full h-full group/carousel"
              setApi={setApi}
              plugins={[
                Autoplay({ delay: 2000, stopOnInteraction: false, stopOnMouseEnter: false }) as any
              ]}
              opts={{ loop: true }}
            >
              <CarouselContent className="-ml-0 h-full">
                {product.images.map((img, index) => (
                  <CarouselItem key={index} className="pl-0 basis-full">
                    <Link href={`/product/${product.slug}`} className="block w-full" onClick={handleNavigate}>
                      <Image
                        src={img ? optimizeCloudinaryUrl(img) : "/placeholder.svg"}
                        alt={`${product.name} - Image ${index + 1}`}
                        width={500}
                        height={650}
                        className="w-full h-auto block transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 bg-background/80 hover:bg-background border-none"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  api?.scrollPrev();
                }}
              />
              <CarouselNext
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 bg-background/80 hover:bg-background border-none"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  api?.scrollNext();
                }}
              />
            </Carousel>
          ) : (
            <Link href={`/product/${product.slug}`} className="block w-full" onClick={handleNavigate}>
              <Image
                src={product.image ? optimizeCloudinaryUrl(product.image) : "/placeholder.svg"}
                alt={product.name}
                width={500}
                height={650}
                className="w-full h-auto block transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
          )}

          {/* Badges - Removed NEW, percentage is highlighted below */}
          <div className="absolute top-2 left-2 flex flex-col gap-2 z-20 pointer-events-none">
            {outOfStock && (
              <span className="bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider backdrop-blur-sm shadow-sm hidden md:inline-block">
                Out of Stock
              </span>
            )}
            {outOfStock && (
              <span className="bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider backdrop-blur-sm shadow-sm md:hidden text-center leading-none">
                Sold Out
              </span>
            )}
          </div>

          {/* Quick Actions (Wishlist) */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
            <button
              onClick={(e) => { e.preventDefault(); handleWishlistClick(); }}
              className={`p-2 bg-background/95 hover:bg-background rounded-full transition-all shadow-sm active:scale-95 ${isWishlisted ? 'text-primary' : ''
                }`}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              suppressHydrationWarning
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-primary' : ''}`} />
            </button>
          </div>


        </div>
      </div >

      <Link href={`/product/${product.slug}`} className="block" onClick={handleNavigate}>
        <h3 className="font-medium text-xs md:text-sm leading-tight mb-1 md:mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {product.name}
        </h3>

        {/* Reviews - Always visible */}
        <div className="flex items-center gap-1 mb-1.5 md:mb-2">
          <StarRating
            rating={totalReviews > 0 ? avgRating : 0}
            size="sm"
          />
          <span className="text-[9px] md:text-[10px] text-muted-foreground">
            {totalReviews > 0 ? `(${totalReviews})` : "(0)"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap mb-3 md:mb-4">
          <span className="font-bold text-xs md:text-base">₹{product.price.toLocaleString('en-IN')}</span>
          {product.originalPrice > product.price && (
            <>
              <span className="text-[9px] md:text-xs text-muted-foreground line-through decoration-muted-foreground/50">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-red-600 text-[9px] md:text-[10px] font-bold">
                -{discount}%
              </span>
            </>
          )}
        </div>
      </Link>

      <div className="flex gap-1.5 md:gap-2 h-9 md:h-10">
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className={`w-10 md:w-12 h-full flex items-center justify-center transition-all duration-300 rounded-sm active:scale-95 shadow-sm ${outOfStock
            ? "bg-muted text-muted-foreground cursor-not-allowed active:scale-100"
            : isAdded
              ? "bg-green-600 text-white scale-105"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          title={outOfStock ? "Out of Stock" : "Add to Cart"}
          suppressHydrationWarning
        >
          {isAdded ? (
            <Check className="w-4 h-4 animate-[bounceIn_0.4s_ease-out]" />
          ) : (
            <ShoppingBag className="w-4 h-4" />
          )}
        </button>
        {outOfStock ? (
          <div className="flex-1 h-full flex items-center justify-center bg-muted/50 border border-muted text-muted-foreground px-3 text-[10px] md:text-xs font-bold rounded-sm uppercase tracking-wider cursor-not-allowed">
            Out of Stock
          </div>
        ) : (
          <Link
            href={`/checkout?product=${product.id}`}
            className="flex-1 h-full"
            onClick={() => addToCart(product)}
          >
            <button 
              className="w-full h-full flex items-center justify-center bg-background border border-primary text-primary hover:bg-primary/5 px-3 text-[10px] md:text-xs font-bold transition-all rounded-sm active:scale-95 shadow-sm uppercase tracking-wider"
              suppressHydrationWarning
            >
              Buy Now
            </button>
          </Link>
        )}
      </div>
    </div >
  )
}
