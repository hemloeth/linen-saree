"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface HeroSlide {
  id: string
  image: string
  title: string
  subtitle?: string
}

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeroSliderProps {
  slides: HeroSlide[]
  height?: string
  autoPlayInterval?: number
  breadcrumbs?: BreadcrumbItem[]
}

export function PageHeroSlider({ 
  slides, 
  height = "40vh", 
  autoPlayInterval = 4000,
  breadcrumbs
}: PageHeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [isAutoPlaying, slides.length, autoPlayInterval])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    // Resume auto-play after 8 seconds of manual interaction
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

  if (slides.length === 0) return null

  const currentSlideData = slides[currentSlide]

  return (
    <section className="relative overflow-hidden" style={{ height, minHeight: "300px" }}>
      {/* Background Images with Smooth Transition */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover object-center"
              priority={index === 0}
            />
          </div>
        ))}
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="text-sm text-white/80 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {breadcrumbs.map((crumb, index) => (
                <span key={index}>
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-white transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                  {index < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
                </span>
              ))}
            </nav>
          )}
          
          <h1 className="font-serif text-4xl md:text-6xl mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {currentSlideData.title}
          </h1>
          {currentSlideData.subtitle && (
            <p className="text-lg text-white/90 max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              {currentSlideData.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Navigation Arrows - Only show if more than 1 slide */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-colors text-white group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-colors text-white group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-white scale-125"
                    : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}