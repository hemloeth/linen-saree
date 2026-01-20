"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

interface SareeSlide {
  id: string
  image: string
  title: string
  subtitle: string
  description: string
  category: string
  link: string
}

const sareeSlides: SareeSlide[] = [
  // Original hero slide - keeping the same content and style
  {
    id: "original-hero",
    image: "/images/hero-saree.jpg",
    title: "Timeless Elegance",
    subtitle: "in Every Thread",
    description: "Discover our exquisite collection of premium linen sarees, crafted with love by master artisans.",
    category: "Handcrafted Excellence",
    link: "/collections"
  },
  {
    id: "banarasi",
    image: "/images/products/banarasi-red.jpg",
    title: "Banarasi Elegance",
    subtitle: "Traditional Silk Sarees",
    description: "Exquisite handwoven Banarasi sarees with intricate gold zari work, perfect for weddings and special occasions.",
    category: "Banarasi Collection",
    link: "/collections/banarasi-silk"
  },
  {
    id: "handloom",
    image: "/images/handloom-saree.jpg",
    title: "Handloom Heritage",
    subtitle: "Pure Cotton Sarees",
    description: "Authentic handloom sarees crafted by skilled artisans, celebrating India's rich textile tradition.",
    category: "Handloom Collection",
    link: "/collections/handloom"
  },
  {
    id: "linen",
    image: "/images/designer-saree.jpg",
    title: "Linen Luxury",
    subtitle: "Contemporary Comfort",
    description: "Premium linen sarees that blend comfort with style, perfect for modern women who value elegance.",
    category: "Linen Collection",
    link: "/collections/pure-linen"
  },
  {
    id: "silk",
    image: "/images/products/silk-cream.jpg",
    title: "Silk Sophistication",
    subtitle: "Pure Silk Sarees",
    description: "Lustrous silk sarees with rich textures and vibrant colors, embodying timeless Indian elegance.",
    category: "Silk Collection",
    link: "/collections/silk-linen"
  },
  {
    id: "festive",
    image: "/images/celebrity-look.jpg",
    title: "Festive Glamour",
    subtitle: "Celebration Wear",
    description: "Stunning festive sarees with intricate embroidery and embellishments for your special celebrations.",
    category: "Festive Collection",
    link: "/collections/new-arrivals"
  },
  {
    id: "bridal",
    image: "/images/bridal-saree.jpg",
    title: "Bridal Splendor",
    subtitle: "Wedding Collection",
    description: "Magnificent bridal sarees with heavy work and rich fabrics for your most precious moments.",
    category: "Bridal Collection",
    link: "/collections/banarasi-silk"
  }
]

export function AutoScrollHero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sareeSlides.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    // Resume auto-play after 10 seconds of manual interaction
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToPrevious = () => {
    const newIndex = currentSlide === 0 ? sareeSlides.length - 1 : currentSlide - 1
    goToSlide(newIndex)
  }

  const goToNext = () => {
    const newIndex = (currentSlide + 1) % sareeSlides.length
    goToSlide(newIndex)
  }

  const currentSaree = sareeSlides[currentSlide]

  return (
    <section className="relative h-[calc(100vh-104px)] w-full overflow-hidden">
      {/* Background Images with Smooth Transition */}
      <div className="absolute inset-0">
        {sareeSlides.map((slide, index) => (
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm tracking-[0.3em] uppercase mb-4 font-sans opacity-90 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {currentSaree.category}
          </p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light mb-6 text-balance animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            {currentSaree.title}
            <br />
            <span className="italic text-4xl md:text-5xl lg:text-6xl">
              {currentSaree.subtitle}
            </span>
          </h1>
          <p className="text-lg md:text-xl font-light max-w-2xl mx-auto mb-8 text-white/90 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            {currentSaree.description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            {currentSaree.id === "original-hero" ? (
              // Original hero buttons
              <>
                <Link
                  href="/collections"
                  className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 font-sans text-sm tracking-wider uppercase hover:bg-white/90 transition-colors"
                >
                  Shop Collection
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/collections"
                  className="inline-flex items-center gap-3 border border-white/30 text-white px-8 py-4 font-sans text-sm tracking-wider uppercase hover:bg-white hover:text-black transition-colors"
                >
                  Explore All
                </Link>
              </>
            ) : (
              // Collection-specific buttons
              <>
                <Link
                  href={currentSaree.link}
                  className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 font-sans text-sm tracking-wider uppercase hover:bg-white/90 transition-colors"
                >
                  Shop {currentSaree.category.split(' ')[0]}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/collections"
                  className="inline-flex items-center gap-3 border border-white/30 text-white px-8 py-4 font-sans text-sm tracking-wider uppercase hover:bg-white hover:text-black transition-colors"
                >
                  View All Collections
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-8 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-colors text-white group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-colors text-white group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {sareeSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white scale-110"
                : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      

      {/* Progress Bar */}
      {isAutoPlaying && (
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="h-1 bg-white/20">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{
                width: `${((currentSlide + 1) / sareeSlides.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </section>
  )
}