"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Share2, Truck, RotateCcw, Shield, Minus, Plus, Check } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/products"

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
  const isWishlisted = isInWishlist(product.id)

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
            {/* Thumbnails */}
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-24 flex-shrink-0 border-2 transition-colors ${
                    selectedImage === index ? "border-primary" : "border-transparent"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} view ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="relative flex-1 aspect-[3/4] lg:aspect-auto lg:h-[700px] overflow-hidden bg-muted">
              <Image
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {product.isOnSale && (
                <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm px-3 py-1 font-medium">
                  {discount}% OFF
                </span>
              )}
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

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-border mb-8">
              <div className="flex flex-col items-center text-center">
                <Truck className="w-6 h-6 mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">Free Shipping</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <RotateCcw className="w-6 h-6 mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">7 Day Returns</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Shield className="w-6 h-6 mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">Secure Payment</p>
              </div>
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
