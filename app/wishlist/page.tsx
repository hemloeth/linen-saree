"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductCard } from "@/components/products/product-card"
import { useWishlist } from "@/context/wishlist-context"
import { useCart } from "@/context/cart-context"
import { Heart, ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function WishlistPage() {
  const { items, clearWishlist, totalItems } = useWishlist()
  const { addToCart } = useCart()

  const handleAddAllToCart = () => {
    items.forEach(product => {
      addToCart(product)
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Adjusted padding top dynamically to avoid header overlap on any screen size */}
      <main 
        className="flex-1 px-4 md:px-8 pb-16"
        style={{ paddingTop: 'calc(var(--header-offset, 120px) + 2rem)' }}
      >
        <div className="max-w-[1500px] mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 pb-6 border-b border-border/40 gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/5 rounded-full hidden sm:block">
                <Heart className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-serif tracking-wide text-foreground">My Wishlist</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} saved
                </p>
              </div>
            </div>
            
            {totalItems > 0 && (
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Button
                  variant="outline"
                  onClick={clearWishlist}
                  className="flex-1 md:flex-none"
                >
                  Clear All
                </Button>
                <Button
                  onClick={handleAddAllToCart}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden sm:inline">Add All to Cart</span>
                  <span className="sm:hidden">Add All</span>
                </Button>
              </div>
            )}
          </div>

          {/* Wishlist Content */}
          {totalItems === 0 ? (
            <div className="text-center py-24 px-4 bg-muted/10 rounded-2xl border border-border/50 max-w-2xl mx-auto mt-12">
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-primary/40" />
              </div>
              <h2 className="text-2xl font-serif mb-3">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Discover our latest collections and save your favorite pieces to review them later.
              </p>
              <Button asChild size="lg" className="px-8">
                <Link href="/collections">
                  Explore Collections <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-8">
                {items.map((product) => (
                  <div key={product.id} className="relative group">
                    <ProductCard product={product} />
                    {/* The double remove button has been removed, as ProductCard already handles wishlist toggle */}
                  </div>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="flex justify-center mt-16 pt-8 border-t border-border/40">
                <Button asChild variant="outline" size="lg" className="px-10">
                  <Link href="/collections">
                    Continue Shopping
                  </Link>
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
