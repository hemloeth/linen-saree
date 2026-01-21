"use client"

import React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { Check, CreditCard, Truck, ShieldCheck, ArrowLeft } from "lucide-react"

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, isHydrated } = useCart()
  const [step, setStep] = useState(1)
  const [orderPlaced, setOrderPlaced] = useState(false)
  
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    paymentMethod: "card"
  })

  const shipping = totalPrice >= 2999 ? 0 : 199
  const total = totalPrice + shipping

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault()
    setOrderPlaced(true)
    clearCart()
  }

  if (!isHydrated) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="pt-[96px] lg:pt-[104px] min-h-[80vh] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading checkout...</div>
        </div>
        <Footer />
      </main>
    )
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="pt-[96px] lg:pt-[104px] min-h-[80vh] flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="font-serif text-3xl mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">Add some products to checkout</p>
            <Link href="/collections">
              <Button className="bg-primary hover:bg-primary/90">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (orderPlaced) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="pt-[96px] lg:pt-[104px] min-h-[80vh] flex items-center justify-center">
          <div className="text-center px-4 max-w-md">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-serif text-3xl mb-4">Order Placed Successfully!</h1>
            <p className="text-muted-foreground mb-2">
              Thank you for your order. We{"'"}ve sent a confirmation email to {formData.email || "your email"}.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Order ID: #LS{Date.now().toString().slice(-8)}
            </p>
            <Link href="/collections">
              <Button className="bg-primary hover:bg-primary/90">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-[96px] lg:pt-[104px]">
        <section className="py-8 lg:py-12 px-4 lg:px-8">
          <div className="max-w-[1200px] mx-auto">
            {/* Back Link */}
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cart
            </Link>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Checkout Form */}
              <div>
                <h1 className="font-serif text-3xl mb-8">Checkout</h1>

                {/* Progress Steps */}
                <div className="flex items-center gap-4 mb-8">
                  <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}>1</span>
                    <span className="text-sm font-medium">Information</span>
                  </div>
                  <div className="flex-1 h-px bg-border" />
                  <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}>2</span>
                    <span className="text-sm font-medium">Payment</span>
                  </div>
                </div>

                <form onSubmit={handlePlaceOrder}>
                  {step === 1 && (
                    <div className="space-y-6">
                      {/* Contact */}
                      <div>
                        <h2 className="font-medium text-lg mb-4">Contact Information</h2>
                        <input
                          type="email"
                          name="email"
                          placeholder="Email address"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-border bg-background text-sm"
                        />
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h2 className="font-medium text-lg mb-4">Shipping Address</h2>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="text"
                              name="firstName"
                              placeholder="First name"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-border bg-background text-sm"
                            />
                            <input
                              type="text"
                              name="lastName"
                              placeholder="Last name"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-border bg-background text-sm"
                            />
                          </div>
                          <input
                            type="text"
                            name="address"
                            placeholder="Address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-border bg-background text-sm"
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="text"
                              name="city"
                              placeholder="City"
                              value={formData.city}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-border bg-background text-sm"
                            />
                            <select
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-border bg-background text-sm"
                            >
                              <option value="">Select State</option>
                              <option value="AN">Andhra Pradesh</option>
                              <option value="BR">Bihar</option>
                              <option value="DL">Delhi</option>
                              <option value="GA">Gujarat</option>
                              <option value="KA">Karnataka</option>
                              <option value="KL">Kerala</option>
                              <option value="MH">Maharashtra</option>
                              <option value="RJ">Rajasthan</option>
                              <option value="TN">Tamil Nadu</option>
                              <option value="UP">Uttar Pradesh</option>
                              <option value="WB">West Bengal</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="text"
                              name="pincode"
                              placeholder="PIN Code"
                              value={formData.pincode}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-border bg-background text-sm"
                            />
                            <input
                              type="tel"
                              name="phone"
                              placeholder="Phone number"
                              value={formData.phone}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-border bg-background text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        type="button"
                        className="w-full bg-primary hover:bg-primary/90 py-6"
                        onClick={() => setStep(2)}
                      >
                        Continue to Payment
                      </Button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      {/* Payment Method */}
                      <div>
                        <h2 className="font-medium text-lg mb-4">Payment Method</h2>
                        <div className="space-y-3">
                          <label className="flex items-center gap-4 p-4 border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="card"
                              checked={formData.paymentMethod === "card"}
                              onChange={handleInputChange}
                              className="w-4 h-4 accent-primary"
                            />
                            <CreditCard className="w-5 h-5" />
                            <span>Credit / Debit Card</span>
                          </label>
                          <label className="flex items-center gap-4 p-4 border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="upi"
                              checked={formData.paymentMethod === "upi"}
                              onChange={handleInputChange}
                              className="w-4 h-4 accent-primary"
                            />
                            <span className="font-bold text-lg">UPI</span>
                            <span>Pay with UPI</span>
                          </label>
                          <label className="flex items-center gap-4 p-4 border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="cod"
                              checked={formData.paymentMethod === "cod"}
                              onChange={handleInputChange}
                              className="w-4 h-4 accent-primary"
                            />
                            <Truck className="w-5 h-5" />
                            <span>Cash on Delivery</span>
                          </label>
                        </div>
                      </div>

                      {formData.paymentMethod === "card" && (
                        <div className="space-y-4 p-4 bg-muted/50 border border-border">
                          <input
                            type="text"
                            placeholder="Card number"
                            className="w-full px-4 py-3 border border-border bg-background text-sm"
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="text"
                              placeholder="MM/YY"
                              className="w-full px-4 py-3 border border-border bg-background text-sm"
                            />
                            <input
                              type="text"
                              placeholder="CVV"
                              className="w-full px-4 py-3 border border-border bg-background text-sm"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Name on card"
                            className="w-full px-4 py-3 border border-border bg-background text-sm"
                          />
                        </div>
                      )}

                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 py-6 bg-transparent"
                          onClick={() => setStep(1)}
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-primary hover:bg-primary/90 py-6"
                        >
                          Place Order
                        </Button>
                      </div>
                    </div>
                  )}
                </form>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-6 mt-8 pt-8 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="w-5 h-5" />
                    Secure Checkout
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="w-5 h-5" />
                    Free Shipping
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:pl-12 lg:border-l border-border">
                <h2 className="font-serif text-2xl mb-6">Order Summary</h2>
                
                {/* Items */}
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4">
                      <div className="relative w-16 h-20 flex-shrink-0 bg-muted">
                        <Image
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-foreground text-background text-xs rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">{item.product.color}</p>
                      </div>
                      <p className="font-medium">
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 pt-6 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping === 0 ? "text-primary" : ""}>
                      {shipping === 0 ? "Free" : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-3 border-t border-border">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}
