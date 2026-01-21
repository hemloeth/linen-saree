"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { useWishlist } from "@/context/wishlist-context"
import { useCart } from "@/context/cart-context"
import { Heart, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist, totalItems } = useWishlist()
  const { addToCart } = useCart()

  const handleAddAllToCart = () => {
    items.forEach(product => {
      addToCart(product)
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 lg:py-16 px-4 lg:px-8 pt-[120px] lg:pt-[140px]">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-primary" />
              <h1 className="text-2xl lg:text-3xl font-light">My Wishlist</h1>
              <span className="text-muted-foreground">({totalItems} items)</span>
            </div>
            
            {totalItems > 0 && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={clearWishlist}
                  className="hidden sm:flex"
                >
                 Allaaaaaaaadd
                </Button>
                <Button
                  onClick={handleAddAllToCart}
                  className="flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add All to Cart
                </Button>
              </div>
            )}
          </div>

          {/* Wishlist Content */}
          {totalItems === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h2 className="text-xl font-medium mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">
                Save your favorite items to your wishlist and shop them later.
              </p>
              <Button asChild>
                <a href="/collections">Continue Shopping</a>
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile Actions */}
              <div className="flex gap-3 mb-6 sm:hidden">
                <Button
                  variant="outline"
                  onClick={clearWishlist}
                  className="flex-1"
                >
                  Clear All
                </Button>
                <Button
                  onClick={handleAddAllToCart}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add All to Cart
                </Button>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                {items.map((product) => (
                  <div key={product.id} className="relative">
                    <ProductCard product={product} />
                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-2 right-2 p-1.5 bg-background/90 hover:bg-background rounded-full transition-colors shadow-sm z-20"
                      aria-label="Remove from wishlist"
                    >
                      <Heart className="w-4 h-4 fill-primary text-primary" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="flex justify-center mt-12">
                <Button asChild variant="outline">
                  <a href="/collections">Continue Shopping</a>
                </Button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}