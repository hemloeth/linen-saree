"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { Heart, ShoppingBag, Play, Pause } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { products } from "@/lib/products"

interface VideoCardProps {
  title: string
  price: number
  originalPrice: number
  videoSrc: string
  productId: string
}

function VideoCard({ title, price, originalPrice, videoSrc, productId }: VideoCardProps) {
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
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 max-w-[calc(100%-3rem)]">
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 font-medium rounded-sm whitespace-nowrap inline-block">
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
            className="absolute top-2 right-12 p-2 bg-background/90 hover:bg-background rounded-full transition-colors opacity-0 group-hover:opacity-100 z-10"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>

          {/* Quick Actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleWishlistClick()
              }}
              className={`p-2 bg-background/90 hover:bg-background rounded-full transition-colors shadow-sm ${
                isWishlisted ? 'text-primary' : ''
              }`}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-primary' : ''}`} />
            </button>
          </div>

          {/* Add to Cart Button */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                addToCart(product)
              }}
              className="w-full bg-background/95 hover:bg-background py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors rounded-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <Link href="/video-collection" className="block">
        <h3 className="font-medium text-sm leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold">₹{price.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground line-through">
            ₹{originalPrice.toLocaleString()}
          </span>
        </div>
      </Link>
    </div>
  )
}

export function VideoSection() {
  const videoCards = [
    {
      title: "Premium Silk Linen Collection",
      price: 3499,
      originalPrice: 5999,
      videoSrc: "/Video-266.mp4",
      productId: "8"
    },
    {
      title: "Banarasi Silk Elegance",
      price: 4299,
      originalPrice: 7999,
      videoSrc: "/bluesaree.mp4",
      productId: "4"
    },
    {
      title: "Handloom Heritage",
      price: 2890,
      originalPrice: 5290,
      videoSrc: "/Video-385.mp4",
      productId: "6"
    },
    {
      title: "Pure Linen Comfort",
      price: 2499,
      originalPrice: 4799,
      videoSrc: "/Video-28.mp4",
      productId: "1"
    }
  ]

  return (
    <section className="py-24 px-4 lg:px-8 bg-gradient-to-br from-background to-secondary/30">
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Featured Collections
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          </div>
          <h2 className="font-serif text-5xl md:text-6xl mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Experience Our Sarees
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch our premium collection come to life with these exclusive video showcases
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {videoCards.map((card, index) => (
            <VideoCard
              key={index}
              title={card.title}
              price={card.price}
              originalPrice={card.originalPrice}
              videoSrc={card.videoSrc}
              productId={card.productId}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-border" />
            <p className="text-sm text-muted-foreground tracking-wide">
              Discover more in our complete collection
            </p>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-border" />
          </div>
          <Link 
            href="/video-collection"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-semibold transition-colors duration-300"
          >
            View All Video Collection
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}