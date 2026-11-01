"use client"

import Link from "next/link"
import { ArrowUp } from "lucide-react"

export function Footer() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <footer className="bg-black text-neutral-400 border-t border-neutral-800/80">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
        {/* Top Header Row: Brand Identity & Back to Top */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-12 border-b border-neutral-800/80">
          <div>
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl sm:text-3xl text-white font-normal tracking-[0.15em] uppercase hover:text-neutral-300 transition-colors">
                The Handloomer
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2 tracking-wide font-light">
              Authentic Handcrafted Pure Linen Sarees
            </p>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-neutral-400 hover:text-white transition-colors cursor-pointer group self-start sm:self-auto"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Navigation Grid: Simple, Clean 4 Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 py-12">
          {/* Column 1: Shop */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-white font-medium">
              Shop
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-light">
              <li>
                <Link href="/collections" className="hover:text-white transition-colors">
                  All Collections
                </Link>
              </li>
              <li>
                <Link href="/categories/new-arrivals" className="hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/best-sellers" className="hover:text-white transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/video-collection" className="hover:text-white transition-colors">
                  Video Lookbook
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: About */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-white font-medium">
              About
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-light">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/categories/handloom" className="hover:text-white transition-colors">
                  Handloom Weaves
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Journal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Help */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-white font-medium">
              Help
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-light">
              <li>
                <Link href="/track-order" className="hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Follow */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-white font-medium">
              Follow
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-light">
              <li>
                <a
                  href="https://www.instagram.com/_linensaree/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Instagram</span>
                  <span className="text-[10px] text-neutral-600 group-hover:text-neutral-300 transition-colors">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/people/Linensareecom/100063776541814/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Facebook</span>
                  <span className="text-[10px] text-neutral-600 group-hover:text-neutral-300 transition-colors">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/919264151111"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  <span>WhatsApp</span>
                  <span className="text-[10px] text-neutral-600 group-hover:text-neutral-300 transition-colors">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/@linensaree"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  <span>YouTube</span>
                  <span className="text-[10px] text-neutral-600 group-hover:text-neutral-300 transition-colors">↗</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Row */}
        <div className="pt-8 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-light text-neutral-500">
          <p>© {new Date().getFullYear()} The Handloomer. All rights reserved.</p>
          <div className="flex items-center gap-4 text-neutral-500">
            <Link href="/privacy" className="hover:text-neutral-300 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-neutral-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
