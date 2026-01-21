"use client"

import { useRef, useState } from "react"
import { Heart, ShoppingBag, Play, Pause } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { products } from "@/lib/products"

interface VideoCardProps {
  title: string
  description: string
  price: number
  originalPrice: number
  videoSrc: string
  productId: string
}

function VideoCard({ title, description, price, originalPrice, videoSrc, productId }: VideoCardProps) {
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
    <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
      <div className="relative aspect-[3/4] bg-black">
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          onLoadedData={() => setIsPlaying(true)}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges 
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 font-medium rounded-sm">
            {discount}% OFF
          </span>
          <span className="bg-red-500 text-white text-xs px-2 py-1 font-medium rounded-sm">
            TRENDING
          </span>
        </div>*/}

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors opacity-0 group-hover:opacity-100 z-10"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-white" />
          )}
        </button>

        {/* Quick Actions */}
        <div className="absolute top-12 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 z-10">
          <button
            onClick={handleWishlistClick}
            className={`p-2 bg-white/90 hover:bg-white rounded-full transition-colors shadow-sm ${
              isWishlisted ? 'text-primary' : 'text-gray-700'
            }`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-primary' : ''}`} />
          </button>
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-serif text-lg font-medium mb-4 line-clamp-2">
            {title}
          </h3>
        </div>

        {/* Add to Cart Button */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
          <button
            onClick={() => addToCart(product)}
            className="w-full bg-white/95 hover:bg-white text-gray-900 py-1 px-2 flex items-center justify-center gap-1 text-xs font-medium transition-colors"
          >
            <ShoppingBag className="w-3 h-3" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export function VideoSection() {
  const videoCards = [
    {
      title: "Premium Silk Linen Collection",
      description: "Luxurious silk linen sarees with intricate handwork and premium finishing",
      price: 3499,
      originalPrice: 5999,
      videoSrc: "/Video-266.mp4",
      productId: "8"
    },
    {
      title: "Banarasi Silk Elegance",
      description: "Traditional Banarasi silk sarees with rich gold zari work and timeless appeal",
      price: 4299,
      originalPrice: 7999,
      videoSrc: "/bluesaree.mp4",
      productId: "4"
    },
    {
      title: "Handloom Heritage",
      description: "Authentic handloom sarees crafted by skilled artisans using traditional techniques",
      price: 2890,
      originalPrice: 5290,
      videoSrc: "/Video-385.mp4",
      productId: "6"
    },
    {
      title: "Pure Linen Comfort",
      description: "Breathable pure linen sarees perfect for everyday elegance and comfort",
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
              description={card.description}
              price={card.price}
              originalPrice={card.originalPrice}
              videoSrc={card.videoSrc}
              productId={card.productId}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-border" />
            <p className="text-sm text-muted-foreground tracking-wide">
              Discover more in our complete collection
            </p>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-border" />
          </div>
        </div>
      </div>
    </section>
  )
}