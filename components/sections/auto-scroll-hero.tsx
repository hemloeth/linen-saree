"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Star, Award, ShieldCheck } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import { resolveMediaUrl } from "@/lib/media"

export interface SareeSlide {
  _id?: string
  id?: string
  image: string
  title: string
  subtitle: string
  description: string
  category: string
  link: string
  buttonText?: string
  secondaryButtonText?: string
  secondaryLink?: string
  badge?: string
  layoutStyle?: 'editorial-split' | 'cinematic-canvas' | 'asymmetric-showcase' | string
}

interface AutoScrollHeroProps {
  initialSlides?: SareeSlide[]
}

const fallbackSlides: SareeSlide[] = [
  {
    id: "fallback-1",
    image: "/images/festive-collection-hero.jpg",
    category: "AUTUMN / FESTIVE 2026",
    badge: "ATELIER HANDLOOM",
    title: "The Poetry of Pure Linen & Zari",
    subtitle: "Woven by master artisans across Bengal & Banaras looms",
    description: "Experience the effortless luxury of 100-count organic linen interwoven with delicate antique gold zari. Breathable drape meets royal heritage.",
    buttonText: "EXPLORE ATELIER",
    link: "/collections/festive",
    secondaryButtonText: "DISCOVER HERITAGE",
    secondaryLink: "/collections",
    layoutStyle: "editorial-split"
  },
  {
    id: "fallback-2",
    image: "/images/celebrity-star-banner.jpg",
    category: "THE COUTURE EDIT",
    badge: "CELEBRITY RED CARPET",
    title: "Drama in Every Drape",
    subtitle: "Cinematic sarees tailored for life's grandest stages",
    description: "Adorned by cultural icons and draped under spotlight glow. A modern interpretation of ancient textile art, crafted with immaculate precision.",
    buttonText: "VIEW RED CARPET EDIT",
    link: "/collections/celebrity",
    secondaryButtonText: "WATCH LOOKBOOK",
    secondaryLink: "/video-collection",
    layoutStyle: "cinematic-canvas"
  },
  {
    id: "fallback-3",
    image: "/images/big-sale-banner.jpg",
    category: "LIMITED SERIES",
    badge: "EXCLUSIVE CURATION",
    title: "Artisanal Silence & Gold",
    subtitle: "Where timeless handloom tradition meets modern silhouette",
    description: "Natural dyes, hand-spun weft, and subtle tissue borders. Discover our exclusive festive curation and rare archival drapes.",
    buttonText: "SHOP THE COLLECTION",
    link: "/collections/big-sale",
    secondaryButtonText: "EXPLORE ALL SAREES",
    secondaryLink: "/categories/all",
    layoutStyle: "asymmetric-showcase"
  }
]

export function AutoScrollHero({ initialSlides = [] }: AutoScrollHeroProps) {
  const slides = initialSlides.length > 0 ? initialSlides : fallbackSlides

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
  }, [emblaApi, onSelect])

  if (!slides || slides.length === 0) {
    return null
  }

  return (
    <section className="relative w-full h-[calc(100vh-var(--header-offset,80px))] min-h-[640px] max-h-[960px] bg-background text-foreground overflow-hidden group border-b border-foreground/10">
      <div className="overflow-hidden h-full w-full" ref={emblaRef}>
        <div className="flex h-full touch-pan-y">
          {slides.map((slide, index) => {
            const isActive = index === selectedIndex
            // Determine layout: explicitly configured layoutStyle or cycle through the 3 distinct UIs
            const layout = slide.layoutStyle || (index % 3 === 0 ? 'editorial-split' : index % 3 === 1 ? 'cinematic-canvas' : 'asymmetric-showcase')

            // ==========================================
            // UI VARIANT 2: CINEMATIC CANVAS (Full-Bleed Lookbook)
            // ==========================================
            if (layout === 'cinematic-canvas') {
              return (
                <div
                  key={slide._id || slide.id || index}
                  className="relative flex-[0_0_100%] min-w-0 h-full w-full overflow-hidden flex items-center justify-center select-none"
                >
                  {/* Full-bleed Background Visual */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={resolveMediaUrl(slide.image)}
                      alt={slide.title || "Hero banner"}
                      fill
                      className={`object-cover object-center transition-transform duration-[12000ms] ease-out ${
                        isActive ? "scale-105" : "scale-100"
                      }`}
                      priority={index === 0}
                      sizes="100vw"
                      quality={95}
                    />
                    {/* Atmospheric Luxury Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/70" />
                    <div className="absolute inset-0 bg-radial-[circle_at_center,_transparent_30%,_black_90%] opacity-80" />
                  </div>

                  {/* Centered Haute Couture Content */}
                  <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white flex flex-col items-center">
                    {/* Badge */}
                    <div className={`transition-all duration-700 delay-100 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-mono tracking-[0.3em] uppercase text-amber-200/90 shadow-xl">
                        <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                        {slide.badge || slide.category || "Couture Edit"}
                      </span>
                    </div>

                    {/* Headline */}
                    <h1 className={`font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[1.05] mt-5 drop-shadow-2xl transition-all duration-700 delay-200 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}>
                      {slide.title}
                    </h1>

                    {/* Subtitle */}
                    {slide.subtitle && (
                      <p className={`font-serif italic text-xl sm:text-2xl md:text-3xl text-amber-100/90 font-light mt-3 drop-shadow transition-all duration-700 delay-300 ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                      }`}>
                        {slide.subtitle}
                      </p>
                    )}

                    {/* Narrative Description */}
                    {slide.description && (
                      <p className={`text-xs sm:text-sm md:text-base text-white/80 leading-relaxed max-w-xl mx-auto mt-4 drop-shadow transition-all duration-700 delay-400 ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                      }`}>
                        {slide.description}
                      </p>
                    )}

                    {/* Dual Action CTAs */}
                    <div className={`flex flex-wrap items-center justify-center gap-3.5 mt-8 transition-all duration-700 delay-500 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}>
                      <Link
                        href={slide.link || "/collections"}
                        className="inline-flex items-center gap-3 px-8 py-3.5 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-amber-100 transition-colors shadow-2xl rounded-none group cursor-pointer"
                      >
                        {slide.buttonText || "Discover Collection"}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      {slide.secondaryButtonText && (
                        <Link
                          href={slide.secondaryLink || "/collections"}
                          className="inline-flex items-center gap-2 px-7 py-3.5 bg-black/50 hover:bg-black/80 text-white border border-white/30 backdrop-blur-md text-xs font-bold uppercase tracking-[0.2em] transition-colors rounded-none cursor-pointer"
                        >
                          {slide.secondaryButtonText}
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Corner Accent Badges */}
                  <div className="absolute bottom-6 left-6 sm:left-12 hidden sm:flex items-center gap-2 text-[10px] tracking-widest uppercase font-mono text-white/60 bg-black/40 backdrop-blur-sm px-3 py-1.5 border border-white/10">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                    <span>Certified Pure Silk-Linen</span>
                  </div>
                </div>
              )
            }

            // ==========================================
            // UI VARIANT 3: ASYMMETRIC SHOWCASE (Contemporary Modernist)
            // ==========================================
            if (layout === 'asymmetric-showcase') {
              return (
                <div
                  key={slide._id || slide.id || index}
                  className="relative flex-[0_0_100%] min-w-0 h-full w-full overflow-hidden flex flex-col lg:flex-row bg-[#FAF8F5] dark:bg-[#121110] select-none"
                >
                  {/* Left Column: Architectural Typography & Details */}
                  <div className="w-full lg:w-[48%] h-full flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20 py-8 lg:py-0 z-10 order-2 lg:order-1 border-r border-border/40">
                    <div className="max-w-lg">
                      {/* Eyebrow */}
                      <div className={`transition-all duration-700 delay-100 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-600/20 text-amber-800 dark:text-amber-300 text-[10px] sm:text-xs font-mono tracking-[0.25em] uppercase font-bold">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          {slide.badge || slide.category || "Limited Curation"}
                        </div>
                      </div>

                      {/* Main Title */}
                      <h1 className={`font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-foreground leading-[1.1] mt-4 transition-all duration-700 delay-200 ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                      }`}>
                        {slide.title}
                      </h1>

                      {/* Tagline */}
                      {slide.subtitle && (
                        <p className={`font-serif italic text-lg sm:text-2xl text-primary mt-2.5 transition-all duration-700 delay-300 ${
                          isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                        }`}>
                          {slide.subtitle}
                        </p>
                      )}

                      {/* Description */}
                      {slide.description && (
                        <p className={`text-xs sm:text-sm text-muted-foreground leading-relaxed mt-4 transition-all duration-700 delay-400 ${
                          isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                        }`}>
                          {slide.description}
                        </p>
                      )}

                      {/* Craft Highlights */}
                      <div className={`flex flex-wrap gap-2 mt-5 transition-all duration-700 delay-500 ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                      }`}>
                        <span className="text-[10px] tracking-wider uppercase font-semibold px-2.5 py-1 bg-background border border-border text-foreground/80">
                          ✓ Natural Dyes
                        </span>
                        <span className="text-[10px] tracking-wider uppercase font-semibold px-2.5 py-1 bg-background border border-border text-foreground/80">
                          ✓ Hand-Spun Weft
                        </span>
                        <span className="text-[10px] tracking-wider uppercase font-semibold px-2.5 py-1 bg-background border border-border text-foreground/80">
                          ✓ Zero Synthetic
                        </span>
                      </div>

                      {/* Actions */}
                      <div className={`flex flex-wrap items-center gap-3.5 mt-7 transition-all duration-700 delay-600 ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                      }`}>
                        <Link
                          href={slide.link || "/collections"}
                          className="inline-flex items-center gap-3 px-8 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-[0.2em] shadow-md transition-all rounded-none group cursor-pointer"
                        >
                          {slide.buttonText || "Shop Collection"}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        {slide.secondaryButtonText && (
                          <Link
                            href={slide.secondaryLink || "/categories/all"}
                            className="inline-flex items-center gap-2 px-6 py-3.5 bg-transparent hover:bg-muted text-foreground border border-border text-xs font-bold uppercase tracking-[0.2em] transition-colors rounded-none cursor-pointer"
                          >
                            {slide.secondaryButtonText}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Framed Editorial Portrait Showcase */}
                  <div className="w-full lg:w-[52%] h-[380px] lg:h-full relative overflow-hidden order-1 lg:order-2 p-3 sm:p-6 lg:p-8 flex items-center justify-center">
                    <div className="relative w-full h-full overflow-hidden border border-border/80 shadow-2xl bg-muted">
                      <Image
                        src={resolveMediaUrl(slide.image)}
                        alt={slide.title || "Handloom saree showcase"}
                        fill
                        className={`object-cover object-top transition-transform duration-[12000ms] ease-out ${
                          isActive ? "scale-105" : "scale-100"
                        }`}
                        priority={index === 0}
                        sizes="(max-width: 1024px) 100vw, 55vw"
                        quality={95}
                      />
                      {/* Floating Inset Fabric Card */}
                      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-black/80 backdrop-blur-md border border-white/20 p-3 sm:p-4 text-white max-w-[220px] shadow-2xl hidden sm:block">
                        <div className="text-[9px] uppercase tracking-widest text-amber-300 font-mono font-semibold">
                          Authentic Handcraft
                        </div>
                        <div className="font-serif text-xs font-medium mt-1">
                          Pure Zari Tissue & Linen Silhouette
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

            // ==========================================
            // UI VARIANT 1 (DEFAULT): EDITORIAL SPLIT (Grand Sabyasachi Aesthetic)
            // ==========================================
            return (
              <div
                key={slide._id || slide.id || index}
                className="relative flex-[0_0_100%] min-w-0 h-full w-full overflow-hidden flex flex-col lg:flex-row select-none"
              >
                {/* Left Column: Full-Height Content Panel */}
                <div className="relative z-10 w-full lg:w-[48%] xl:w-[45%] h-full flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-8 lg:py-0 bg-background border-r border-border/50 order-2 lg:order-1">
                  <div className="max-w-xl">
                    {/* Atelier Eyebrow */}
                    <div className={`transition-all duration-700 delay-100 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      <div className="inline-flex items-center gap-2.5 px-3.5 py-1 bg-primary/5 border border-primary/25 text-primary text-[10px] sm:text-xs font-mono tracking-[0.25em] uppercase font-bold">
                        <Award className="w-3.5 h-3.5 text-primary" />
                        {slide.badge || slide.category || "Handloom Atelier"}
                      </div>
                    </div>

                    {/* Grand Title */}
                    <h1 className={`font-serif text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight text-foreground leading-[1.08] mt-4 transition-all duration-700 delay-200 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}>
                      {slide.title}
                    </h1>

                    {/* Subtitle */}
                    {slide.subtitle && (
                      <p className={`font-serif italic text-lg sm:text-2xl text-primary/90 font-light mt-2.5 transition-all duration-700 delay-300 ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                      }`}>
                        {slide.subtitle}
                      </p>
                    )}

                    {/* Description */}
                    {slide.description && (
                      <p className={`text-xs sm:text-sm text-muted-foreground leading-relaxed mt-4 max-w-md transition-all duration-700 delay-400 ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                      }`}>
                        {slide.description}
                      </p>
                    )}

                    {/* CTAs */}
                    <div className={`flex flex-wrap items-center gap-3.5 mt-8 transition-all duration-700 delay-500 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}>
                      <Link
                        href={slide.link || "/collections"}
                        className="inline-flex items-center gap-3 px-8 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-[0.2em] shadow-md transition-all rounded-none group cursor-pointer"
                      >
                        {slide.buttonText || "Explore Atelier"}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      {slide.secondaryButtonText && (
                        <Link
                          href={slide.secondaryLink || "/collections"}
                          className="inline-flex items-center gap-2 px-6 py-3.5 bg-background hover:bg-muted text-foreground border border-border text-xs font-bold uppercase tracking-[0.2em] transition-colors rounded-none cursor-pointer"
                        >
                          {slide.secondaryButtonText}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Full-Height Expansive Model Visual Showcase */}
                <div className="relative w-full lg:w-[52%] xl:w-[55%] h-[380px] lg:h-full overflow-hidden bg-muted order-1 lg:order-2">
                  <Image
                    src={resolveMediaUrl(slide.image)}
                    alt={slide.title || "Royal saree collection"}
                    fill
                    className={`object-cover object-top transition-transform duration-[12000ms] ease-out ${
                      isActive ? "scale-105" : "scale-100"
                    }`}
                    priority={index === 0}
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    quality={95}
                  />
                  {/* Subtle edge shade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 lg:hidden pointer-events-none" />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Slide Navigation Controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 bg-background/80 hover:bg-background border border-foreground/15 text-foreground backdrop-blur-md transition-all rounded-none cursor-pointer shadow-md"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 bg-background/80 hover:bg-background border border-foreground/15 text-foreground backdrop-blur-md transition-all rounded-none cursor-pointer shadow-md"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Slide Indicator Counter at bottom center */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-background/80 backdrop-blur-md border border-foreground/15 px-3 py-1 text-xs font-mono font-bold tracking-widest text-foreground shadow-md rounded-none">
            <span className="text-primary">{String(selectedIndex + 1).padStart(2, '0')}</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-muted-foreground">{String(slides.length).padStart(2, '0')}</span>
          </div>
        </>
      )}
    </section>
  )
}
