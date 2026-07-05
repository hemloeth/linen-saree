"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

interface HeroSlide {
  _id?: string
  image: string
  title: string
  subtitle: string
  description: string
  category: string
  link: string
}

export function Hero() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const { apiGet } = await import("@/lib/api")
        const data = await apiGet('/api/hero')
        if (data.success && data.slides && data.slides.length > 0) {
          setSlides(data.slides)
        }
      } catch (error) {
        console.error("Failed to fetch hero data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchHero()
  }, [])

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, slides.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 8000)
  }

  const goToPrevious = () => {
    const newIndex = currentSlide === 0 ? slides.length - 1 : currentSlide - 1
    goToSlide(newIndex)
  }

  const goToNext = () => {
    const newIndex = (currentSlide + 1) % slides.length
    goToSlide(newIndex)
  }

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

  // Fallback if fetch fails or no slides
  const activeSlides = slides.length > 0 ? slides : [
    {
      _id: "default",
      image: "/images/hero-saree.jpg",
      title: "Timeless Elegance\\nin Every Thread",
      subtitle: "Discover our exquisite collection",
      description: "Handcrafted linen sarees, where traditional craftsmanship meets contemporary design.",
      category: "New Arrivals",
      link: "/collections"
    }
  ]

  const currentSlideData = activeSlides[currentSlide]

  // Handle heading splitting by \n to preserve the design
  const headingParts = currentSlideData.title.split('\\n')
  const mainHeading = headingParts[0] || currentSlideData.title
  const italicHeading = headingParts.length > 1 ? headingParts[1] : null

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0 z-0">
        {activeSlides.map((slide, index) => (
          <div
            key={slide._id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.image.startsWith('http') ? slide.image : `http://localhost:5000/${slide.image.replace(/\\/g, '/')}`}
              alt={slide.title}
              fill
              className="object-cover object-top"
              priority={index === 0}
              unoptimized={slide.image.startsWith('http') || slide.image.includes('\\')}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20">
        <p className="font-sans text-sm tracking-[0.3em] uppercase text-foreground/70 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {currentSlideData.category || "The New Collection"}
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
          {currentSlideData.description || currentSlideData.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <Link
            href={currentSlideData.link || "/collections"}
            className="group inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 font-sans text-sm tracking-wider uppercase hover:bg-primary/90 transition-colors"
          >
            Show Collection
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/collections"
            className="inline-flex items-center gap-3 border border-foreground/30 text-foreground px-8 py-4 font-sans text-sm tracking-wider uppercase hover:bg-foreground hover:text-background transition-colors"
          >
            All Collections
          </Link>
        </div>
      </div>

      {/* Navigation Arrows */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-background/20 hover:bg-background/40 backdrop-blur-sm rounded-full transition-colors text-foreground group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-background/20 hover:bg-background/40 backdrop-blur-sm rounded-full transition-colors text-foreground group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-3">
            {activeSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-foreground scale-125"
                    : "bg-foreground/30 hover:bg-foreground/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-px h-16 bg-gradient-to-b from-transparent to-foreground/50" />
      </div>
    </section>
  )
}
