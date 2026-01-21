"use client"

import { useState } from 'react'
import { Gift, CreditCard, Heart } from 'lucide-react'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function GiftCardsPage() {
  const giftCardAmounts = [50, 100, 200, 500, 1000]
  const [selectedAmount, setSelectedAmount] = useState(500)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12 pt-[120px] lg:pt-[140px]">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6">
            <Gift className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Gift Cards</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Give the perfect gift with our digital gift cards. Perfect for any occasion!
          </p>
        </div>

        {/* Gift Card Options */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Choose Amount</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {giftCardAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                className={`bg-card rounded-xl shadow-lg p-6 border-2 transition-all duration-300 transform hover:scale-105 ${
                  selectedAmount === amount 
                    ? 'border-primary shadow-xl bg-secondary' 
                    : 'border-border hover:border-primary hover:shadow-xl'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">₹{amount}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Gift Card Preview */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-primary rounded-2xl p-8 text-primary-foreground shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Linen Saree Gift Card</h3>
                <p className="text-primary-foreground/80">Perfect for any occasion</p>
              </div>
              <Gift className="w-8 h-8" />
            </div>
            <div className="mb-6">
              <div className="text-3xl font-bold">₹{selectedAmount}</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-primary-foreground/80">
                Valid for 12 months
              </div>
              <div className="text-sm text-primary-foreground/80">
                #GC123456789
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Form */}
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
            <h3 className="text-xl font-bold text-foreground mb-6 text-center">Purchase Gift Card</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Recipient Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
                  placeholder="recipient@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Message (Optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
                  placeholder="Add a personal message..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground px-6 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Purchase Gift Card</span>
                </div>
              </button>
            </form>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Instant Delivery</h3>
              <p className="text-muted-foreground text-sm">Digital gift cards delivered instantly via email</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">No Expiry Worries</h3>
              <p className="text-muted-foreground text-sm">Valid for 12 months from purchase date</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Easy to Use</h3>
              <p className="text-muted-foreground text-sm">Simple redemption process at checkout</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}