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
    image: "/images/festive-linen-palace-banner.jpg",
    category: "AUTUMN / FESTIVE 2026",
    badge: "ATELIER ROYAL LINEN",
    title: "Pure Linen Sarees",
    subtitle: "DESIGNED TO FLOW • CRAFTED TO IMPRESS",
    description: "Woven from 100-count certified organic linen with antique gold zari borders. Experience royal heritage drape made for unforgettable celebrations.",
    buttonText: "EXPLORE COLLECTION",
    link: "/collections/festive",
    secondaryButtonText: "DISCOVER CRAFT",
    secondaryLink: "/collections",
    layoutStyle: "editorial-split"
  },
  {
    id: "fallback-2",
    image: "/images/celebrity-linen-couture-banner.jpg",
    category: "THE COUTURE EDIT",
    badge: "SILK MARK CERTIFIED",
    title: "Celebrity Linen Edit",
    subtitle: "COLLECTION : PADMINI",
    description: "Handwoven earthy silhouettes, metallic silver accents, and statement pallus draped for red carpets and grand evenings.",
    buttonText: "SHOP NOW",
    link: "/collections/celebrity",
    secondaryButtonText: "VIEW LOOKBOOK",
    secondaryLink: "/video-collection",
    layoutStyle: "cinematic-canvas"
  },
  {
    id: "fallback-3",
    image: "/images/festive-sale-heritage-banner.jpg",
    category: "LIMITED FESTIVE SERIES",
    badge: "FESTIVE SPLENDOR • UP TO 40% OFF",
    title: "Artisanal Weaves",
    subtitle: "TIMELESS HANDLOOM TRADITION",
    description: "Pure ruby-red and golden mustard drapes spun on traditional shuttle looms. Exceptional festive savings on pure linen heirlooms.",
    buttonText: "SHOP THE SALE",
    link: "/collections/big-sale",
    secondaryButtonText: "VIEW ALL SAREES",
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
    <section className="relative w-full h-[600px] sm:h-[660px] md:h-[720px] lg:h-[calc(100vh-var(--header-offset,80px))] min-h-[580px] max-h-[920px] bg-neutral-950 text-white overflow-hidden group border-b border-foreground/10 select-none">
      <div className="overflow-hidden h-full w-full" ref={emblaRef}>
        <div className="flex h-full touch-pan-y">
          {slides.map((slide, index) => {
            const isActive = index === selectedIndex
            // Determine layout: explicitly configured layoutStyle or cycle through the 3 distinct UIs
            const layout = slide.layoutStyle || (index % 3 === 0 ? 'editorial-split' : index % 3 === 1 ? 'cinematic-canvas' : 'asymmetric-showcase')

            // =========================================================================
            // UI VARIANT 2: THE COUTURE EDIT ("COLLECTION : PADMINI" / Left-Framed Models)
            // Models on the left, warm studio negative space & luxury seal on the right
            // =========================================================================
            if (layout === 'cinematic-canvas') {
              return (
                <div
                  key={slide._id || slide.id || index}
                  className="relative flex-[0_0_100%] min-w-0 h-full w-full overflow-hidden flex items-center"
                >
                  {/* Full-bleed Real Photographic Canvas */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={resolveMediaUrl(slide.image)}
                      alt={slide.title || "Celebrity Linen Couture"}
                      fill
                      className={`object-cover object-left md:object-center transition-transform duration-[14000ms] ease-out ${
                        isActive ? "scale-105" : "scale-100"
                      }`}
                      priority={index === 0}
                      sizes="100vw"
                      quality={95}
                    />
                    {/* Feathered vignette on right for pristine typography readability without hiding models on left */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 md:hidden" />
                    <div className="hidden md:block absolute inset-y-0 right-0 w-[55%] bg-gradient-to-l from-black/85 via-black/50 to-transparent" />
                  </div>

                  {/* Right-aligned Luxury Studio Typography & Pill CTA */}
                  <div className="relative z-10 w-full h-full flex items-center justify-end px-6 sm:px-12 md:px-16 lg:px-24">
                    <div className="max-w-xl text-center md:text-right flex flex-col items-center md:items-end">
                      {/* Luxury Seal & Heritage Mark */}
                      <div className={`transition-all duration-700 delay-100 flex items-center gap-2 ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}>
                        <div className="px-3.5 py-1 bg-amber-500/15 border border-amber-300/40 text-amber-200 text-[10px] sm:text-xs font-mono tracking-[0.3em] uppercase backdrop-blur-md">
                          {slide.badge || slide.category || "SILK MARK CERTIFIED"}
                        </div>
                      </div>

                      {/* Script Accent */}
                      <span className={`font-script text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-amber-100 drop-shadow-lg mt-3 block transition-all duration-700 delay-200 ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                      }`}>
                        {slide.title || "Celebrity Linen Edit"}
                      </span>

                      {/* Subtitle / Collection Header */}
                      <h2 className={`font-serif tracking-[0.25em] text-lg sm:text-2xl md:text-3xl text-white font-light uppercase mt-1 drop-shadow-md transition-all duration-700 delay-300 ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                      }`}>
                        {slide.subtitle || "COLLECTION : PADMINI"}
                      </h2>

                      {/* Narrative Description */}
                      {slide.description && (
                        <p className={`text-xs sm:text-sm text-white/80 leading-relaxed max-w-md mt-3 drop-shadow transition-all duration-700 delay-400 ${
                          isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                        }`}>
                          {slide.description}
                        </p>
                      )}

                      {/* Rounded Luxury Pill Button & Lookbook Link */}
                      <div className={`flex flex-wrap items-center justify-center md:justify-end gap-3.5 mt-7 transition-all duration-700 delay-500 ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                      }`}>
                        <Link
                          href={slide.link || "/collections"}
                          className="inline-flex items-center justify-center px-9 py-3 rounded-full border-2 border-white bg-white/10 hover:bg-white hover:text-black backdrop-blur-md text-white text-xs font-semibold uppercase tracking-[0.25em] transition-all shadow-xl cursor-pointer"
                        >
                          {slide.buttonText || "SHOP NOW"}
                        </Link>
                        {slide.secondaryButtonText && (
                          <Link
                            href={slide.secondaryLink || "/video-collection"}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/40 hover:border-white text-white/90 hover:text-white backdrop-blur-md text-xs font-medium uppercase tracking-[0.2em] transition-all cursor-pointer"
                          >
                            {slide.secondaryButtonText}
                          </Link>
                        )}
                      </div>

                      {/* Delicate Vintage Flourish Accent */}
                      <div className="mt-5 hidden sm:flex items-center justify-end gap-2 text-amber-200/50">
                        <span className="w-12 h-px bg-gradient-to-r from-transparent to-amber-200/50" />
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span className="w-12 h-px bg-gradient-to-l from-transparent to-amber-200/50" />
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

            // =========================================================================
            // UI VARIANT 3: ARTISANAL FESTIVE SALE (Golden Sandstone Courtyard)
            // Models on the right/center, left has festival banner & purity tags
            // =========================================================================
            if (layout === 'asymmetric-showcase') {
              return (
                <div
                  key={slide._id || slide.id || index}
                  className="relative flex-[0_0_100%] min-w-0 h-full w-full overflow-hidden flex items-center"
                >
                  {/* Full-bleed Real Heritage Photographic Canvas */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={resolveMediaUrl(slide.image)}
                      alt={slide.title || "Artisanal Handloom Sale"}
                      fill
                      className={`object-cover object-right md:object-center transition-transform duration-[14000ms] ease-out ${
                        isActive ? "scale-105" : "scale-100"
                      }`}
                      priority={index === 0}
                      sizes="100vw"
                      quality={95}
                    />
                    {/* Directional gradient on left for crystal-clear readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35 md:hidden" />
                    <div className="hidden md:block absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
                  </div>

                  {/* Left-aligned Festive Curation Typography */}
                  <div className="relative z-10 w-full h-full flex items-center justify-start px-6 sm:px-12 md:px-16 lg:px-24">
                    <div className="max-w-xl text-left">
                      {/* Promotional Badge */}
                      <div className={`transition-all duration-700 delay-100 ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[10px] sm:text-xs font-mono tracking-[0.25em] uppercase font-bold backdrop-blur-md">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          {slide.badge || "FESTIVE SPLENDOR • UP TO 40% OFF"}
                        </div>
                      </div>

                      {/* Script Accent */}
                      <span className={`font-script text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-amber-100 drop-shadow-lg mt-3 block transition-all duration-700 delay-200 ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                      }`}>
                        {slide.title || "Artisanal Weaves"}
                      </span>

                      {/* Headline */}
                      <h2 className={`font-serif tracking-[0.2em] text-lg sm:text-2xl md:text-3xl text-white font-light uppercase mt-1 drop-shadow-md transition-all duration-700 delay-300 ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                      }`}>
                        {slide.subtitle || "TIMELESS HANDLOOM TRADITION"}
                      </h2>

                      {/* Narrative Description */}
                      {slide.description && (
                        <p className={`text-xs sm:text-sm text-white/85 leading-relaxed max-w-md mt-3 drop-shadow transition-all duration-700 delay-400 ${
                          isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                        }`}>
                          {slide.description}
                        </p>
                      )}

                      {/* Fabric Purity Badges */}
                      <div className={`flex flex-wrap gap-2 mt-5 transition-all duration-700 delay-500 ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                      }`}>
                        <span className="text-[10px] tracking-wider uppercase font-semibold px-2.5 py-1 bg-black/40 border border-white/20 text-white backdrop-blur-sm">
                          ✓ 100% Pure Linen
                        </span>
                        <span className="text-[10px] tracking-wider uppercase font-semibold px-2.5 py-1 bg-black/40 border border-white/20 text-white backdrop-blur-sm">
                          ✓ Zari Border
                        </span>
                        <span className="text-[10px] tracking-wider uppercase font-semibold px-2.5 py-1 bg-black/40 border border-white/20 text-white backdrop-blur-sm">
                          ✓ Hand-Spun Weft
                        </span>
                      </div>

                      {/* CTAs */}
                      <div className={`flex flex-wrap items-center gap-3.5 mt-7 transition-all duration-700 delay-600 ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                      }`}>
                        <Link
                          href={slide.link || "/collections/big-sale"}
                          className="inline-flex items-center gap-3 px-8 py-3.5 bg-amber-100 hover:bg-white text-neutral-900 text-xs font-bold uppercase tracking-[0.2em] shadow-2xl transition-all rounded-none group cursor-pointer"
                        >
                          {slide.buttonText || "SHOP THE SALE"}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        {slide.secondaryButtonText && (
                          <Link
                            href={slide.secondaryLink || "/categories/all"}
                            className="inline-flex items-center gap-2 px-6 py-3.5 bg-black/40 hover:bg-black/70 text-white border border-white/30 backdrop-blur-md text-xs font-bold uppercase tracking-[0.2em] transition-colors rounded-none cursor-pointer"
                          >
                            {slide.secondaryButtonText}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

            // =========================================================================
            // UI VARIANT 1: ROYAL PALACE HAVELI EDITORIAL (Reference 1 Match)
            // Models on the right in ivory-gold, coral & lilac linen sarees; Left has
            // flowing cursive script & "DESIGNED TO FLOW / CRAFTED TO IMPRESS"
            // =========================================================================
            return (
              <div
                key={slide._id || slide.id || index}
                className="relative flex-[0_0_100%] min-w-0 h-full w-full overflow-hidden flex items-center"
              >
                {/* Full-bleed Real Royal Palace Photographic Canvas */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={resolveMediaUrl(slide.image)}
                    alt={slide.title || "Festive Royal Linen Saree"}
                    fill
                    className={`object-cover object-right md:object-center transition-transform duration-[14000ms] ease-out ${
                      isActive ? "scale-105" : "scale-100"
                    }`}
                    priority={index === 0}
                    sizes="100vw"
                    quality={95}
                  />
                  {/* Subtle directional gradient on left for impeccable typography clarity */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35 md:hidden" />
                  <div className="hidden md:block absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
                </div>

                {/* Left-aligned Royal Atelier Typography */}
                <div className="relative z-10 w-full h-full flex items-center justify-start px-6 sm:px-12 md:px-16 lg:px-24">
                  <div className="max-w-xl text-left">
                    {/* Eyebrow Atelier Badge */}
                    <div className={`transition-all duration-700 delay-100 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}>
                      <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-500/20 border border-amber-300/40 text-amber-200 text-[10px] sm:text-xs font-mono tracking-[0.3em] uppercase backdrop-blur-md">
                        <Award className="w-3.5 h-3.5 text-amber-300" />
                        {slide.badge || slide.category || "ATELIER ROYAL LINEN"}
                      </div>
                    </div>

                    {/* Grand Cursive Script (Matches "Organza sarees" in Reference) */}
                    <span className={`font-script text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white drop-shadow-xl mt-3 block transition-all duration-700 delay-200 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                    }`}>
                      {slide.title || "Pure Linen Sarees"}
                    </span>

                    {/* Headline Tagline (Matches "DESIGNED TO FLOW / CRAFTED TO IMPRESS") */}
                    <h2 className={`font-serif tracking-[0.25em] text-sm sm:text-xl md:text-2xl lg:text-3xl text-white/95 uppercase font-light leading-snug mt-1 drop-shadow-md transition-all duration-700 delay-300 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                    }`}>
                      {slide.subtitle || "DESIGNED TO FLOW • CRAFTED TO IMPRESS"}
                    </h2>

                    {/* Narrative Description */}
                    {slide.description && (
                      <p className={`text-xs sm:text-sm md:text-base text-white/80 leading-relaxed max-w-lg mt-3 drop-shadow transition-all duration-700 delay-400 ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                      }`}>
                        {slide.description}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className={`flex flex-wrap items-center gap-3.5 mt-8 transition-all duration-700 delay-500 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                    }`}>
                      <Link
                        href={slide.link || "/collections"}
                        className="inline-flex items-center gap-3 px-8 py-3.5 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-amber-100 transition-colors shadow-2xl rounded-none group cursor-pointer"
                      >
                        {slide.buttonText || "EXPLORE COLLECTION"}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      {slide.secondaryButtonText && (
                        <Link
                          href={slide.secondaryLink || "/collections"}
                          className="inline-flex items-center gap-2 px-7 py-3.5 bg-black/40 hover:bg-black/70 text-white border border-white/30 backdrop-blur-md text-xs font-bold uppercase tracking-[0.2em] transition-colors rounded-none cursor-pointer"
                        >
                          {slide.secondaryButtonText}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Slide Navigation Controls */}
      <div className="absolute bottom-6 right-6 sm:right-12 z-20 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 border border-white/20">
        <button
          onClick={scrollPrev}
          aria-label="Previous slide"
          className="p-1.5 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono tracking-widest text-white/90">
          0{selectedIndex + 1} <span className="text-white/40">/</span> 0{slides.length}
        </span>
        <button
          onClick={scrollNext}
          aria-label="Next slide"
          className="p-1.5 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi && emblaApi.scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 transition-all duration-300 rounded-none cursor-pointer ${
              selectedIndex === i ? "w-8 bg-amber-300" : "w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  )
}
