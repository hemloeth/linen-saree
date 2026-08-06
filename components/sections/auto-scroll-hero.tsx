"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight, MoveDown } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"

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

interface AutoScrollHeroProps {
  initialSlides?: SareeSlide[]
}

const fallbackSlides: SareeSlide[] = [
  {
    id: "fallback-1",
    image: "/images/s/s1.jpg",
    title: "Pure Linen Collection",
    subtitle: "Elegance in every thread",
    description: "Discover our handcrafted pure linen sarees for everyday comfort and unmatched grace. Experience luxury woven into every fiber.",
    category: "New Arrivals",
    link: "/collections"
  },
  {
    id: "fallback-2",
    image: "/images/sb/sb1.jpg",
    title: "Banarasi Silk",
    subtitle: "Timeless Tradition",
    description: "Experience the luxury of authentic Banarasi silk blended with the comfort of premium linen. A masterpiece for your wardrobe.",
    category: "Featured",
    link: "/collections"
  }
];

export function AutoScrollHero({ initialSlides = [] }: AutoScrollHeroProps) {
  const slides = initialSlides.length > 0 ? initialSlides : fallbackSlides;

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 }, [
    Autoplay({ delay: 6000, stopOnInteraction: false, stopOnMouseEnter: true }) as any
  ])

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

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
  }

  if (!slides || slides.length === 0) {
    return null
  }

  return (
    <section className="relative w-full h-[100svh] bg-background text-foreground overflow-hidden group border-b border-foreground/10">
      <div className="overflow-hidden h-full w-full" ref={emblaRef}>
        <div className="flex h-full touch-pan-y">
          {slides.map((slide, index) => {
            const isActive = index === selectedIndex
            return (
              <div 
                key={slide._id || slide.id || index} 
                className="relative flex-[0_0_100%] min-w-0 h-full flex flex-col lg:flex-row lg:pt-[var(--header-offset,80px)]"
              >
                {/* Image Showcase - Mobile Full Background / Desktop Right Split */}
                <div className="absolute inset-x-0 bottom-0 top-[var(--header-offset,80px)] z-0 lg:static lg:relative lg:z-10 lg:w-1/2 lg:h-full lg:order-2 flex items-center justify-center cursor-grab active:cursor-grabbing">
                  <div className="relative w-full h-full overflow-hidden bg-black lg:bg-muted">
                    <Image
                      src={slide.image}
                      alt={slide.title || "Hero image"}
                      fill
                      className={`object-cover object-top origin-top transition-transform duration-[20000ms] ease-out ${
                        isActive ? "scale-105" : "scale-100"
                      }`}
                      priority={index === 0}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      quality={100}
                    />
                    {/* Dark gradient for mobile readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 lg:hidden pointer-events-none" />
                  </div>
                </div>

                {/* Text Content - Mobile Overlay / Desktop Left Split */}
                <div className="relative z-20 w-full h-full lg:w-1/2 lg:h-full flex flex-col justify-end lg:justify-center px-6 md:px-16 lg:px-24 xl:px-32 pb-[100px] lg:pb-0 order-2 lg:order-1 lg:bg-background lg:border-r border-foreground/5 pointer-events-none lg:pointer-events-auto overflow-hidden">
                  
                  {/* --- Colorful Fluid Vector Background (Desktop Only) --- */}
                  <div className="hidden lg:block absolute inset-0 pointer-events-none z-0 overflow-hidden mix-blend-multiply dark:mix-blend-screen opacity-80">
                    {/* Fluid Vector 1 - Warm Coral/Amber */}
                    <div className="absolute top-[5%] left-[5%] w-[50vh] h-[50vh] bg-gradient-to-tr from-rose-400 to-amber-300 opacity-40 blur-2xl animate-spin rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%]" style={{ animationDuration: '25s' }} />
                    
                    {/* Fluid Vector 2 - Cool Mint/Cyan */}
                    <div className="absolute bottom-[-10%] right-[10%] w-[60vh] h-[60vh] bg-gradient-to-tr from-emerald-400 to-cyan-300 opacity-30 blur-3xl animate-spin rounded-[60%_40%_30%_70%_/_60%_30%_70%_40%]" style={{ animationDuration: '30s', animationDirection: 'reverse' }} />
                    
                    {/* Fluid Vector 3 - Deep Purple/Indigo */}
                    <div className="absolute top-[40%] left-[30%] w-[35vh] h-[35vh] bg-gradient-to-tr from-purple-400 to-indigo-400 opacity-30 blur-2xl animate-spin rounded-[50%_50%_20%_80%_/_25%_80%_20%_75%]" style={{ animationDuration: '20s' }} />
                    
                    {/* Luxury Architectural Linework */}
                    <div className="absolute left-[12%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
                    
                    {/* Vertical Accent Text */}
                    <div className="absolute left-[12%] top-1/2 -translate-y-1/2 -translate-x-1/2 -rotate-90 origin-center text-[10px] tracking-[1em] uppercase text-primary/60 font-medium whitespace-nowrap bg-background px-8">
                      {slide.category || "Collection"}
                    </div>
                  </div>

                  <div className="w-full max-w-lg mx-auto lg:mx-0 relative z-10 pointer-events-auto text-center lg:text-left">
                    <div className="overflow-hidden mb-3 lg:mb-6">
                      <div className={`flex items-center gap-4 justify-center lg:justify-start transition-transform duration-1000 delay-100 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                        <span className="hidden lg:block w-8 h-[1px] bg-primary/40" />
                        <p className="text-xs tracking-[0.4em] uppercase font-sans text-white/90 lg:text-primary font-bold">
                          {slide.category}
                        </p>
                      </div>
                    </div>

                    <div className="overflow-hidden mb-3 lg:mb-4">
                      <h1 className={`font-serif text-5xl sm:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight transition-transform duration-1000 delay-200 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'} text-white lg:text-foreground`}>
                        {slide.title}
                      </h1>
                    </div>
                    
                    <div className="overflow-hidden mb-6 lg:mb-8">
                      <p className={`font-serif italic text-2xl lg:text-3xl text-white/90 lg:text-foreground/70 font-light transition-transform duration-1000 delay-300 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                        {slide.subtitle}
                      </p>
                    </div>

                    <div className="overflow-hidden mb-8 lg:mb-12">
                      <p className={`text-sm md:text-base text-white/80 lg:text-foreground/60 leading-relaxed max-w-sm mx-auto lg:mx-0 transition-transform duration-1000 delay-500 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                        {slide.description}
                      </p>
                    </div>

                    <div className={`transition-all duration-1000 delay-700 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      <Link
                        href={slide.link || "/collections"}
                        className="inline-flex items-center justify-center gap-4 bg-white text-black lg:bg-primary lg:text-primary-foreground px-10 py-4 text-xs tracking-[0.2em] uppercase font-bold lg:hover:bg-primary/90 transition-all duration-300 cursor-pointer lg:shadow-[0_10px_40px_-10px_rgba(139,115,85,0.4)] lg:hover:shadow-[0_15px_50px_-10px_rgba(139,115,85,0.6)] lg:hover:-translate-y-1 rounded-none group"
                      >
                        Discover <ArrowRight className="w-4 h-4 lg:group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Progress Line */}
      {slides.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 lg:bg-primary/10 z-30">
          <div 
            className="h-full bg-white lg:bg-primary transition-all duration-500 ease-out"
            style={{ width: `${((selectedIndex + 1) / slides.length) * 100}%` }}
          />
        </div>
      )}
    </section>
  )
}
