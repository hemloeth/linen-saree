"use client"

import Link from "next/link"
import { ArrowUp, Sparkles, ShieldCheck } from "lucide-react"

export function Footer() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <footer className="relative bg-[#0C0A09] text-stone-300 border-t border-white/10 overflow-hidden select-none">
      {/* Top Editorial Ticker Bar */}
      <div className="border-b border-white/10 bg-black/40 py-3.5 px-4 sm:px-8">
        <div className="max-w-[1500px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[10px] sm:text-[11px] font-mono tracking-[0.25em] uppercase text-stone-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Master Weaver Ateliers • Bengal & Banaras Looms</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-stone-500">
            <span>100% Certified Pure Organic Linen</span>
            <span>•</span>
            <span>Zero Synthetic Fibers</span>
            <span>•</span>
            <span>Pan-India & Global Express Dispatch</span>
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-stone-300 hover:text-amber-200 transition-colors cursor-pointer group"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Column 1: Brand Manifesto (Spans 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="font-script text-3xl sm:text-4xl text-amber-200/90 block leading-none mb-2">
                Pure Linen Heritage
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-light tracking-wide text-white uppercase">
                The Handloomer
              </h2>
            </div>

            <p className="font-sans text-xs sm:text-sm text-stone-400 leading-relaxed max-w-md font-light">
              Reviving India’s sacred handloom heritage. Each saree is spun from 100-count certified organic linen, 
              delicately interwoven with real zari borders on generational wooden pit looms. Made to breathe, drape, and transcend time.
            </p>

            {/* Atelier Coordinates & Direct Connect */}
            <div className="pt-2 space-y-2 border-t border-white/10 text-xs font-mono text-stone-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span className="text-stone-300 font-sans">Atelier Concierge:</span>
                <a
                  href="https://wa.me/919264151111"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-200 hover:underline font-medium"
                >
                  +91 92641 51111
                </a>
              </div>
              <div className="text-[11px] text-stone-500">
                Inquiries:{" "}
                <a href="mailto:support@handloomer.com" className="hover:text-stone-300 underline underline-offset-2">
                  support@handloomer.com
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Collections & Edits (Spans 3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.25em] text-white font-semibold">
              Collections
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm font-sans font-light">
              <li>
                <Link href="/collections" className="text-stone-400 hover:text-white transition-colors block">
                  All Collections
                </Link>
              </li>
              <li>
                <Link href="/collections/festive" className="text-stone-400 hover:text-white transition-colors block">
                  Festive Royal Series
                </Link>
              </li>
              <li>
                <Link href="/collections/celebrity" className="text-stone-400 hover:text-white transition-colors block">
                  Celebrity Red Carpet Edit
                </Link>
              </li>
              <li>
                <Link href="/collections/big-sale" className="text-stone-400 hover:text-white transition-colors block">
                  Artisanal Handloom Sale
                </Link>
              </li>
              <li>
                <Link href="/video-collection" className="text-stone-400 hover:text-white transition-colors block">
                  Motion Lookbook (Live Video)
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-stone-400 hover:text-white transition-colors block">
                  Browse by Weaver Craft
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Client Care & Policies (Spans 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.25em] text-white font-semibold">
              Client Care
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm font-sans font-light">
              <li>
                <Link href="/track-order" className="text-stone-400 hover:text-white transition-colors block">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-stone-400 hover:text-white transition-colors block">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-stone-400 hover:text-white transition-colors block">
                  Returns & Exchange
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-stone-400 hover:text-white transition-colors block">
                  Saree Draping Guide
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-stone-400 hover:text-white transition-colors block">
                  Customer FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-stone-400 hover:text-white transition-colors block">
                  Contact Atelier
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Social Presence (Spans 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.25em] text-white font-semibold">
              Social Dispatches
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm font-sans font-light">
              <li>
                <a
                  href="https://www.instagram.com/_linensaree/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-400 hover:text-white transition-colors flex items-center justify-between group"
                >
                  <span>Instagram</span>
                  <span className="text-[10px] text-stone-600 group-hover:text-amber-200 font-mono transition-colors">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/people/Linensareecom/100063776541814/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-400 hover:text-white transition-colors flex items-center justify-between group"
                >
                  <span>Facebook</span>
                  <span className="text-[10px] text-stone-600 group-hover:text-amber-200 font-mono transition-colors">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/919264151111"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-400 hover:text-white transition-colors flex items-center justify-between group"
                >
                  <span>WhatsApp</span>
                  <span className="text-[10px] text-stone-600 group-hover:text-emerald-400 font-mono transition-colors">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/@linensaree"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-400 hover:text-white transition-colors flex items-center justify-between group"
                >
                  <span>YouTube</span>
                  <span className="text-[10px] text-stone-600 group-hover:text-red-400 font-mono transition-colors">↗</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Grand Awwwards Typographic Monument */}
        <div className="pt-16 pb-4 border-t border-white/10 mt-16 overflow-hidden">
          <div className="font-serif text-[clamp(2.75rem,9.5vw,9rem)] font-light tracking-[-0.03em] text-white/[0.07] hover:text-white/[0.14] transition-colors duration-700 leading-none select-none uppercase pointer-events-none text-center">
            THE HANDLOOMER
          </div>
        </div>

        {/* Bottom Bar: Legal & Trust Badges */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-stone-500">
          <div>
            © {new Date().getFullYear()} The Handloomer Atelier. All rights reserved.
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/privacy" className="hover:text-stone-300 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-stone-300 transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/shipping" className="hover:text-stone-300 transition-colors">
              Shipping & Returns
            </Link>
          </div>

          <div className="flex items-center gap-2 text-[10px] tracking-wider uppercase text-stone-400 bg-white/5 px-3 py-1.5 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Encrypted Payment</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
