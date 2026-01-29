"use client"

import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { TrustBadgesCompact } from "@/components/trust-badges"
import { cn } from "@/lib/utils"

export function CartSidebar() {
  const { items, removeFromCart, updateQuantity, totalPrice, isCartOpen, setIsCartOpen, isHydrated } = useCart()

  // Don't render anything until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return null
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-50 transition-opacity duration-300",
          isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full max-w-md bg-background z-50 shadow-2xl transition-transform duration-300 flex flex-col",
          isCartOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-serif text-2xl">Shopping Bag</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-4">Your bag is empty</p>
              <Button onClick={() => setIsCartOpen(false)} className="bg-primary hover:bg-primary/90">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4">
                  <div className="relative w-24 h-32 flex-shrink-0">
                    <Image
                      src={item.product.image || "/placeholder.svg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-medium text-sm leading-tight">{item.product.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{item.product.category}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-semibold">₹{item.product.price.toLocaleString()}</span>
                      {item.product.originalPrice > item.product.price && (
                        <span className="text-xs text-muted-foreground line-through">
                          ₹{item.product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-2 hover:bg-muted transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-2 hover:bg-muted transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold text-lg">₹{totalPrice.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout</p>
            
            {/* Trust Badges */}
            <div className="py-3 border-t border-border">
              <TrustBadgesCompact className="justify-center text-xs" />
            </div>
            
            <div className="space-y-2">
              <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Checkout
                </Button>
              </Link>
              <Link href="/cart" onClick={() => setIsCartOpen(false)}>
                <Button variant="outline" className="w-full mt-2 bg-transparent">
                  View Cart
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
