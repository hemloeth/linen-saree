"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface HeroData {
  image: string
  heading: string
  subheading: string
  ctaText: string
  ctaLink: string
}

export function Hero() {
  const [heroData, setHeroData] = useState<HeroData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const { apiGet } = await import("@/lib/api")
        const data = await apiGet('/api/hero')
        if (data.success && data.hero) {
          setHeroData(data.hero)
        }
      } catch (error) {
        console.error("Failed to fetch hero data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchHero()
  }, [])

  if (isLoading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-muted animate-pulse">
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20 flex flex-col items-center">
          <div className="h-4 w-32 bg-background/20 rounded mb-6"></div>
          <div className="h-16 md:h-24 w-full max-w-2xl bg-background/20 rounded mb-6"></div>
          <div className="h-6 w-full max-w-lg bg-background/20 rounded mb-10"></div>
          <div className="flex gap-4">
            <div className="h-14 w-48 bg-background/20 rounded"></div>
            <div className="h-14 w-40 bg-background/20 rounded"></div>
          </div>
        </div>
      </section>
    )
  }

  // Fallback if fetch fails
  const data = heroData || {
    image: "/images/hero-saree.jpg",
    heading: "Timeless Elegance\\nin Every Thread",
    subheading: "Discover our exquisite collection of handcrafted linen sarees, where traditional craftsmanship meets contemporary design.",
    ctaText: "Explore Collection",
    ctaLink: "#collections"
  }

  // Handle heading splitting by \n to preserve the design
  const headingParts = data.heading.split('\\n')
  const mainHeading = headingParts[0] || data.heading
  const italicHeading = headingParts.length > 1 ? headingParts[1] : null

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={data.image || "/placeholder.svg"}
          alt="Elegant linen saree"
          fill
          className="object-cover object-top"
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
          {mainHeading}
          {italicHeading && (
            <>
              <br />
              <span className="italic">{italicHeading}</span>
            </>
          )}
        </h1>
        <p className="font-sans text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          {data.subheading}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <Link
            href={data.ctaLink || "#collections"}
            className="group inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 font-sans text-sm tracking-wider uppercase hover:bg-primary/90 transition-colors"
          >
            {data.ctaText}
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
