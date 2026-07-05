"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight, ChevronDown, Loader2 } from "lucide-react"

interface SareeSlide {
  _id?: string
  id?: string
  image: string
  title: string
  subtitle: string
  description: string
  category: string
  link: string
}

const fallbackSlides: SareeSlide[] = [
  {
    id: "original-hero",
    image: "/images/hero-saree.jpg",
    title: "Timeless Elegance",
    subtitle: "in Every Thread",
    description: "Discover our exquisite collection of premium linen sarees, crafted with love by master artisans.",
    category: "Handcrafted Excellence",
    link: "/collections"
  }
]

export function AutoScrollHero() {
  const [slides, setSlides] = useState<SareeSlide[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [direction, setDirection] = useState<"next" | "prev">("next")
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Fetch dynamic slides
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const { apiGet } = await import("@/lib/api")
        const data = await apiGet('/api/hero')
        if (data.success && data.slides && data.slides.length > 0) {
          setSlides(data.slides)
        } else {
          setSlides(fallbackSlides)
        }
      } catch (error) {
        console.error("Failed to fetch hero slides:", error)
        setSlides(fallbackSlides)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSlides()
  }, [])

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return

    const interval = setInterval(() => {
      setDirection("next")
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
        setIsTransitioning(false)
      }, 50)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, slides.length])

  const goToSlide = useCallback((index: number) => {
    if (index === currentSlide || slides.length <= 1) return
    setDirection(index > currentSlide ? "next" : "prev")
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide(index)
      setIsTransitioning(false)
    }, 50)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [currentSlide, slides.length])

  const goToPrevious = useCallback(() => {
    if (slides.length <= 1) return
    const newIndex = currentSlide === 0 ? slides.length - 1 : currentSlide - 1
    goToSlide(newIndex)
  }, [currentSlide, goToSlide, slides.length])

  const goToNext = useCallback(() => {
    if (slides.length <= 1) return
    const newIndex = (currentSlide + 1) % slides.length
    goToSlide(newIndex)
  }, [currentSlide, goToSlide, slides.length])

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
  }

  if (isLoading) {
    return (
      <section className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white/50 animate-spin" />
      </section>
    )
  }

  const currentSaree = slides[currentSlide]

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Images with Ken Burns + Crossfade */}
      <div className="absolute inset-x-0 bottom-0 top-[96px] lg:top-0 z-0">
        {slides.map((slide, index) => (
          <div
            key={slide._id || slide.id || index}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className={`object-cover object-top origin-top transition-transform duration-[8000ms] ease-out ${index === currentSlide ? "scale-110" : "scale-100"
                }`}
              priority={index === 0}
              sizes="100vw"
              quality={90}
            />
          </div>
        ))}
        {/* Premium Multi-Layer Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
        {/* Vignette effect */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)"
        }} />
      </div>

      {/* Decorative Corner Accents */}
      <div className="absolute top-32 left-8 md:left-16 z-10 w-16 h-16 md:w-24 md:h-24 border-t border-l border-white/20" />
      <div className="absolute bottom-20 right-8 md:right-16 z-10 w-16 h-16 md:w-24 md:h-24 border-b border-r border-white/20" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4 pt-[96px] lg:pt-0">
        <div className="max-w-5xl mx-auto">
          {/* Category Badge */}
          <div
            key={`cat-${currentSlide}`}
            className="inline-flex items-center gap-2 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-700"
          >
            <span className="w-8 h-[1px] bg-white/60" />
            <p className="text-xs md:text-sm tracking-[0.4em] uppercase font-sans text-white/90 font-light">
              {currentSaree?.category}
            </p>
            <span className="w-8 h-[1px] bg-white/60" />
          </div>

          {/* Title with Staggered Animation */}
          <h1
            key={`title-${currentSlide}`}
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-light mb-4 md:mb-6 text-balance animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 leading-[0.95]"
          >
            {currentSaree?.title}
          </h1>
          <p
            key={`sub-${currentSlide}`}
            className="font-serif italic text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 text-white/90"
          >
            {currentSaree?.subtitle}
          </p>

          {/* Description */}
          <p
            key={`desc-${currentSlide}`}
            className="text-base md:text-lg lg:text-xl font-light max-w-2xl mx-auto mb-8 md:mb-10 text-white/80 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500"
          >
            {currentSaree?.description}
          </p>

          {/* CTA Buttons */}
          <div
            key={`cta-${currentSlide}`}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700"
          >
            <Link
              href="/collections"
              className="group inline-flex items-center gap-3 bg-white text-black px-8 md:px-10 py-4 md:py-5 font-sans text-sm tracking-wider uppercase hover:bg-white/90 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              Shop Collection
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/collections"
              className="inline-flex items-center gap-3 border border-white/40 text-white px-8 md:px-10 py-4 md:py-5 font-sans text-sm tracking-wider uppercase hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-sm"
            >
              Explore All
            </Link>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          {/* Navigation Arrows - Enhanced */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/20 rounded-full transition-all duration-300 text-white group hover:scale-110"
            aria-label="Previous slide"
            suppressHydrationWarning
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/20 rounded-full transition-all duration-300 text-white group hover:scale-110"
            aria-label="Next slide"
            suppressHydrationWarning
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </>
      )}

      {/* Bottom Section: Slide Indicators + Scroll Down */}
      <div className="absolute bottom-8 md:bottom-10 left-0 right-0 z-20 flex flex-col items-center gap-6">
        {/* Dot Indicators */}
        {slides.length > 1 && (
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-500 rounded-full ${index === currentSlide
                  ? "w-8 h-2 bg-white"
                  : "w-2 h-2 bg-white/40 hover:bg-white/60"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
                suppressHydrationWarning
              />
            ))}
          </div>
        )}

        {/* Scroll Down Indicator */}
        <button
          onClick={scrollToContent}
          className="flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors group"
          aria-label="Scroll to content"
          suppressHydrationWarning
        >
          <span className="text-[10px] tracking-[0.3em] uppercase font-sans">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </button>
      </div>

      {/* Slide Counter */}
      {slides.length > 1 && (
        <div className="absolute bottom-10 right-6 md:right-12 z-20 text-white/50 font-sans text-sm tracking-wider hidden md:block">
          <span className="text-white font-medium">{String(currentSlide + 1).padStart(2, '0')}</span>
          <span className="mx-1">/</span>
          <span>{String(slides.length).padStart(2, '0')}</span>
        </div>
      )}

      {/* Progress Bar - Thinner, more elegant */}
      {isAutoPlaying && slides.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="h-[2px] bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-white/60 to-white transition-all duration-100 ease-linear"
              style={{
                width: `${((currentSlide + 1) / slides.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </section>
  )
}