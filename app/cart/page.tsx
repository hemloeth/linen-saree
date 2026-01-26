"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart, isHydrated } = useCart()

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="pt-[96px] lg:pt-[104px] min-h-[80vh]">
        <section className="py-12 lg:py-16 px-4 lg:px-8">
          <div className="max-w-[1200px] mx-auto">
            <h1 className="font-serif text-4xl md:text-5xl mb-8">Shopping Cart</h1>

            {!isHydrated ? (
              <div className="text-center py-20">
                <div className="animate-pulse text-muted-foreground">Loading cart...</div>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
                <h2 className="font-serif text-2xl mb-4">Your cart is empty</h2>
                <p className="text-muted-foreground mb-8">
                  Looks like you haven{"'"}t added anything to your cart yet
                </p>
                <Link href="/collections">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                  <div className="border-b border-border pb-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {items.length} {items.length === 1 ? "item" : "items"}
                      </span>
                      <button
                        onClick={clearCart}
                        className="text-sm text-destructive hover:underline"
                      >
                        Clear Cart
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {items.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex gap-6 pb-6 border-b border-border"
                      >
                        <Link href={`/product/${item.product.slug}`} className="relative w-28 h-36 flex-shrink-0">
                          <Image
                            src={item.product.image || "/placeholder.svg"}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </Link>
                        
                        <div className="flex-1 flex flex-col">
                          <div className="flex justify-between gap-4">
                            <div>
                              <Link 
                                href={`/product/${item.product.slug}`}
                                className="font-medium hover:text-primary transition-colors"
                              >
                                {item.product.name}
                              </Link>
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.product.category}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Color: {item.product.color}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="p-2 text-muted-foreground hover:text-destructive transition-colors h-fit"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="flex items-end justify-between mt-auto pt-4">
                            <div className="flex items-center border border-border">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="p-2 hover:bg-muted transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 text-sm font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="p-2 hover:bg-muted transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="text-right">
                              <p className="font-semibold text-lg">
                                ₹{(item.product.price * item.quantity).toLocaleString()}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-sm text-muted-foreground">
                                  ₹{item.product.price.toLocaleString()} each
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/collections"
                    className="inline-flex items-center gap-2 mt-8 text-sm hover:text-primary transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Continue Shopping
                  </Link>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-secondary p-6 lg:p-8 sticky top-[120px]">
                    <h2 className="font-serif text-2xl mb-6">Order Summary</h2>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-primary">
                          {totalPrice >= 999 ? "Free" : "₹199"}
                        </span>
                      </div>
                      {totalPrice < 999 && (
                        <p className="text-xs text-muted-foreground">
                          Add ₹{(999 - totalPrice).toLocaleString()} more for free shipping
                        </p>
                      )}
                    </div>

                    <div className="border-t border-border pt-4 mb-6">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>
                          ₹{(totalPrice + (totalPrice >= 999 ? 0 : 199)).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Including all taxes
                      </p>
                    </div>

                    <Link href="/checkout">
                      <Button className="w-full bg-primary hover:bg-primary/90 py-6 text-base">
                        Proceed to Checkout
                      </Button>
                    </Link>

                    {/* Promo Code */}
                    <div className="mt-6 pt-6 border-t border-border">
                      <p className="text-sm font-medium mb-3">Have a promo code?</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter code"
                          className="flex-1 px-4 py-2 border border-border bg-background text-sm"
                        />
                        <Button variant="outline" className="px-6 bg-transparent">
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}
