"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-saree.jpg"
          alt="Elegant linen saree"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20">
        <p className="font-sans text-sm tracking-[0.3em] uppercase text-foreground/70 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          The New Collection
        </p>
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light leading-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 text-balance">
          Timeless Elegance
          <br />
          <span className="italic">in Every Thread</span>
        </h1>
        <p className="font-sans text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          Discover our exquisite collection of handcrafted linen sarees, where traditional craftsmanship meets contemporary design.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <Link
            href="#collections"
            className="group inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 font-sans text-sm tracking-wider uppercase hover:bg-primary/90 transition-colors"
          >
            Explore Collection
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#new-arrivals"
            className="inline-flex items-center gap-3 border border-foreground/30 text-foreground px-8 py-4 font-sans text-sm tracking-wider uppercase hover:bg-foreground hover:text-background transition-colors"
          >
            New Arrivals
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-px h-16 bg-gradient-to-b from-transparent to-foreground/50" />
      </div>
    </section>
  )
}
