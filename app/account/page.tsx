"use client"

import { useState } from 'react'
import Link from 'next/link'
import { User, Package, Heart, Gift, Phone, LogIn, UserPlus, X, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function AccountPage() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12 pt-[96px] lg:pt-[104px]">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6">
            <User className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Welcome</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            To access your account and manage orders, please login or create a new account
          </p>
        </div>

        {/* Login/Signup Section */}
        <div className="max-w-md mx-auto mb-16">
          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
            <div className="flex flex-col space-y-4">
              <button 
                onClick={() => setShowLoginModal(true)}
                className="flex items-center justify-center space-x-3 bg-primary text-primary-foreground px-6 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
              >
                <LogIn className="w-5 h-5" />
                <span>Login</span>
              </button>
              <button 
                onClick={() => setShowSignupModal(true)}
                className="flex items-center justify-center space-x-3 bg-card text-foreground px-6 py-4 rounded-xl font-semibold border-2 border-border hover:border-primary hover:bg-secondary transition-all duration-300"
              >
                <UserPlus className="w-5 h-5" />
                <span>Sign Up</span>
              </button>
            </div>
          </div>
        </div>

        {/* Account Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Orders */}
          <Link href="/orders" className="group">
            <div className="bg-card rounded-2xl shadow-lg p-8 border border-border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Orders</h3>
                <p className="text-muted-foreground text-sm">Track and manage your orders</p>
              </div>
            </div>
          </Link>

          {/* Wishlist */}
          <Link href="/wishlist" className="group">
            <div className="bg-card rounded-2xl shadow-lg p-8 border border-border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Wishlist</h3>
                <p className="text-muted-foreground text-sm">Save your favorite items</p>
              </div>
            </div>
          </Link>

          {/* Gift Cards */}
          <Link href="/gift-cards" className="group">
            <div className="bg-card rounded-2xl shadow-lg p-8 border border-border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Gift className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Gift Cards</h3>
                <p className="text-muted-foreground text-sm">Purchase and redeem gift cards</p>
              </div>
            </div>
          </Link>

          {/* Contact Us */}
          <Link href="/contact" className="group">
            <div className="bg-card rounded-2xl shadow-lg p-8 border border-border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Contact Us</h3>
                <p className="text-muted-foreground text-sm">Get help and support</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Additional Info Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Why Create an Account?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Order Tracking</h3>
                <p className="text-muted-foreground text-sm">Track your orders from purchase to delivery</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Save Favorites</h3>
                <p className="text-muted-foreground text-sm">Create wishlists and save items for later</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Personal Profile</h3>
                <p className="text-muted-foreground text-sm">Manage your personal information and preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
                <button 
                  onClick={() => setShowLoginModal(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      type="email"
                      className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-10 pr-12 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-input text-primary focus:ring-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Remember me</span>
                  </label>
                  <button type="button" className="text-sm text-primary hover:text-primary/80">
                    Forgot password?
                  </button>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300"
                >
                  Sign In
                </button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-muted-foreground">
                  Don't have an account?{' '}
                  <button 
                    onClick={() => {
                      setShowLoginModal(false)
                      setShowSignupModal(true)
                    }}
                    className="text-primary hover:text-primary/80 font-semibold"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
                <button 
                  onClick={() => setShowSignupModal(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
                      placeholder="Your full name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      type="email"
                      className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-10 pr-12 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="flex items-start">
                    <input type="checkbox" className="rounded border-input text-primary focus:ring-primary mt-1" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      I agree to the{' '}
                      <Link href="/terms" className="text-primary hover:text-primary/80">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-primary hover:text-primary/80">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300"
                >
                  Create Account
                </button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-muted-foreground">
                  Already have an account?{' '}
                  <button 
                    onClick={() => {
                      setShowSignupModal(false)
                      setShowLoginModal(true)
                    }}
                    className="text-primary hover:text-primary/80 font-semibold"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}