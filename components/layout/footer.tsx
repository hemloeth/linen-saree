"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Mail, ArrowRight, ShieldCheck, CheckCircle2, Sparkles } from "lucide-react"
import { apiGet } from "@/lib/api"

// Custom SVG Icons for Social Media
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
  </svg>
)

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

export function Footer() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [marketingCollections, setMarketingCollections] = useState<any[]>([])

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await apiGet('/api/marketing-collections')
        if (response.success && response.data) {
          const filtered = response.data.filter((col: any) => col.key !== 'none')
          setMarketingCollections(filtered)
        }
      } catch (error) {
        // Fallback gracefully
      }
    }
    fetchCollections()
  }, [])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && email.includes("@")) {
      setIsSubscribed(true)
      setEmail("")
    }
  }

  return (
    <footer className="bg-[#111111] text-stone-200 border-t border-stone-800">
      {/* Main Footer Grid */}
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Column 1: Brand, Mission & Social Links */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <Link href="/" className="inline-block group">
                <span className="font-serif text-2xl md:text-3xl font-semibold tracking-wide text-white group-hover:text-primary transition-colors">
                  The Handloomer
                </span>
              </Link>
              <p className="font-sans text-sm text-stone-400 leading-relaxed mt-3 max-w-sm">
                Authentic handcrafted pure linen sarees directly from master artisans. 
                Crafted for timeless grace, breathable comfort, and enduring Indian heritage.
              </p>
            </div>

            {/* Support Contact */}
            <div className="space-y-2.5 pt-1">
              <a 
                href="https://wa.me/919264151111" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-stone-300 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <WhatsAppIcon className="w-4 h-4" />
                </div>
                <span>WhatsApp: <strong className="text-white font-medium">+91 92641 51111</strong></span>
              </a>

              <a 
                href="mailto:support@handloomer.com" 
                className="flex items-center gap-3 text-sm text-stone-300 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-stone-800/80 border border-stone-700/80 flex items-center justify-center text-stone-300 group-hover:bg-stone-700 group-hover:text-white transition-all">
                  <Mail className="w-4 h-4" />
                </div>
                <span>support@handloomer.com</span>
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/_linensaree/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-white hover:border-stone-600 hover:bg-stone-800 transition-all"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/people/Linensareecom/100063776541814/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-white hover:border-stone-600 hover:bg-stone-800 transition-all"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/919264151111"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-stone-800 transition-all"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@linensaree"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-red-400 hover:border-red-500/40 hover:bg-stone-800 transition-all"
                aria-label="YouTube"
              >
                <YouTubeIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Real Collections & Catalog */}
          <div className="lg:col-span-2 md:pl-2">
            <h3 className="font-serif text-sm tracking-widest uppercase text-white font-semibold mb-5">
              Collections
            </h3>
            <ul className="space-y-3 font-sans text-sm">
              <li>
                <Link href="/collections" className="text-stone-400 hover:text-white transition-colors">
                  All Collections
                </Link>
              </li>
              <li>
                <Link href="/collections/new-arrivals" className="text-stone-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <span>New Arrivals</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold uppercase tracking-wider">New</span>
                </Link>
              </li>
              <li>
                <Link href="/best-sellers" className="text-stone-400 hover:text-white transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-stone-400 hover:text-white transition-colors">
                  Shop by Category
                </Link>
              </li>
              {marketingCollections.map((col) => (
                <li key={col.key}>
                  <Link href={`/collections/${col.key}`} className="text-stone-400 hover:text-white transition-colors">
                    {col.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/video-collection" className="text-stone-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Live Video Shopping</span>
                  <span className="text-xs">🎥</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Services */}
          <div className="lg:col-span-2">
            <h3 className="font-serif text-sm tracking-widest uppercase text-white font-semibold mb-5">
              Customer Care
            </h3>
            <ul className="space-y-3 font-sans text-sm">
              <li>
                <Link href="/track-order" className="text-stone-400 hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-stone-400 hover:text-white transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-stone-400 hover:text-white transition-colors">
                  Returns & Exchange
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-stone-400 hover:text-white transition-colors">
                  Saree Draping & Size Guide
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-stone-400 hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-stone-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: The Linen Club Newsletter */}
          <div className="lg:col-span-4 bg-stone-900/60 border border-stone-800/80 rounded-2xl p-6 space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-primary font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Exclusive Privileges</span>
              </div>
              <h3 className="font-serif text-xl text-white font-semibold mt-1">
                Join The Linen Club
              </h3>
              <p className="font-sans text-xs text-stone-400 leading-relaxed mt-1.5">
                Subscribe for early access to limited artisan drops, drape styling guides, and private VIP promotional offers.
              </p>
            </div>

            {isSubscribed ? (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-600/40 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>You're in! Welcome to our VIP circle.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2.5">
                <div className="relative flex items-center">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full bg-stone-950/90 border border-stone-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-primary transition-colors pr-10"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 p-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors cursor-pointer"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-stone-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  100% Handcrafted Linen • Direct from Weavers
                </p>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar with Copyright, Legal & Payment Trust Badges */}
        <div className="mt-12 pt-8 border-t border-stone-800/80 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center sm:text-left">
            <p className="font-sans text-xs text-stone-400">
              © {new Date().getFullYear()} The Handloomer. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-stone-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <span>•</span>
              <Link href="/shipping" className="hover:text-white transition-colors">
                Shipping & Returns
              </Link>
            </div>
          </div>

          {/* Secure Payment Options */}
          <div className="flex items-center gap-3 text-stone-400 text-xs font-medium bg-stone-900/80 border border-stone-800 px-4 py-2 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-stone-300">100% Secure Checkout</span>
            <span className="text-stone-600">|</span>
            <span className="text-stone-400 text-[11px] font-semibold tracking-wider">UPI • CARDS • NETBANKING</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
