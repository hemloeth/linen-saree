"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingBag } from "lucide-react"
import { useCart } from "@/context/cart-context"
import type { Product } from "@/lib/products"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart } = useCart()

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  return (
    <div className={cn("group relative w-full", className)}>
      <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-4 rounded-sm w-full">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 max-w-[calc(100%-3rem)]">
          {product.isOnSale && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 font-medium rounded-sm whitespace-nowrap inline-block">
              {discount}% OFF
            </span>
          )}
          {product.isNew && (
            <span className="bg-foreground text-background text-xs px-2 py-1 font-medium rounded-sm whitespace-nowrap inline-block">
              NEW
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            className="p-2 bg-background/90 hover:bg-background rounded-full transition-colors shadow-sm"
            aria-label="Add to wishlist"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
          <button
            onClick={() => addToCart(product)}
            className="w-full bg-background/95 hover:bg-background py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors rounded-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>

      <Link href={`/product/${product.slug}`} className="block">
        <h3 className="font-medium text-sm leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold">₹{product.price.toLocaleString()}</span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </Link>
    </div>
  )
}
