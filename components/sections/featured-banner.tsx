"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { apiGet } from "@/lib/api"
import { resolveMediaUrl } from "@/lib/media"
import { Star, Sparkles, ArrowRight } from "lucide-react"

export function FeaturedBanner() {
  const [data, setData] = useState({
    badge: "Celebrity Choice",
    tagline: "ICONIC RED CARPET EDIT",
    titleColorPart: "Dress Like a",
    titleItalicPart: "Star",
    description: "Loved by style icons and draped on grand stages. Our celebrity-curated linen saree series balances cinematic drama with unmatched pure handloom comfort—turning every corridor into your red carpet.",
    stat1Number: "500+",
    stat1Label: "Iconic Styles",
    stat2Number: "50+",
    stat2Label: "Celebrities",
    stat3Number: "4.9★",
    stat3Label: "Connoisseur Rating",
    buttonText: "DISCOVER CELEBRITY LOOKS",
    link: "/collections/celebrity",
    image: "/images/celebrity-star-banner.jpg"
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiGet("/api/marketing-collections/celebrity")
        if (response.success && response.data) {
          setData({
            ...response.data,
            badge: response.data.badge || "Celebrity Choice",
            tagline: response.data.tagline || "ICONIC RED CARPET EDIT",
            titleColorPart: response.data.titleColorPart || "Dress Like a",
            titleItalicPart: response.data.titleItalicPart || "Star",
            description: response.data.description || "Loved by style icons and draped on grand stages. Our celebrity-curated linen saree series balances cinematic drama with unmatched pure handloom comfort—turning every corridor into your red carpet.",
            stat1Number: response.data.stats?.[0]?.number || "500+",
            stat1Label: response.data.stats?.[0]?.label || "Iconic Styles",
            stat2Number: response.data.stats?.[1]?.number || "50+",
            stat2Label: response.data.stats?.[1]?.label || "Celebrities",
            stat3Number: response.data.stats?.[2]?.number || "4.9★",
            stat3Label: response.data.stats?.[2]?.label || "Connoisseur Rating",
            buttonText: response.data.buttonText || "DISCOVER CELEBRITY LOOKS",
            link: response.data.link || "/collections/celebrity",
            image: response.data.image || "/images/celebrity-star-banner.jpg"
          })
        }
      } catch (error: any) {
        console.warn("Failed to fetch celebrity banner from backend, using default fallback data. Message:", error.message || error)
      }
    }
    fetchData()
  }, [])

  return (
    <section className="py-16 md:py-24 bg-background border-t border-border/40">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column: Actress Showcase Image (5 cols) - explicit height ensures 100% visibility */}
          <div className="lg:col-span-5 relative w-full">
            <div className="relative w-full h-[460px] sm:h-[540px] lg:h-[620px] overflow-hidden rounded-none border border-border shadow-xl group bg-muted">
              <Image
                src={resolveMediaUrl(data.image || "/images/celebrity-star-banner.jpg")}
                alt={data.tagline || "Celebrity Look"}
                fill
                priority
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />

              {/* Gradient edge for modern depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/15 opacity-60 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none" />

              {/* Floating Haute Couture Badge (rounded-none matching existing theme) */}
              <div className="absolute top-4 left-4 z-10">
                <div className="inline-flex items-center gap-1.5 backdrop-blur-md bg-black/80 border border-white/20 text-white text-[11px] font-semibold px-3.5 py-1.5 rounded-none uppercase tracking-[0.2em] shadow-lg">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{data.badge || "Celebrity Choice"}</span>
                </div>
              </div>

              {/* Bottom Subtle Caption (rounded-none) */}
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="backdrop-blur-md bg-black/70 border border-white/15 text-white/90 px-4 py-2 rounded-none text-xs font-light tracking-wider flex items-center justify-between">
                  <span>Atelier Pure Linen</span>
                  <span className="text-[10px] uppercase tracking-widest text-amber-300 font-medium">Handcrafted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Text & Metrics (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tagline / Subtitle (rounded-none) */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none text-xs font-semibold tracking-[0.25em] uppercase bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{data.tagline || "ICONIC RED CARPET EDIT"}</span>
              </div>
            </div>

            {/* Main Headline */}
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] tracking-tight text-foreground">
              {data.titleColorPart || "Dress Like a"}
              <br />
              <span className="italic font-serif text-primary">
                {data.titleItalicPart || "Star"}
              </span>
            </h2>

            {/* Description */}
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl font-light">
              {data.description}
            </p>

            {/* 3 Metric Cards (rounded-none matching --radius: 0rem theme) */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 pt-2">
              <div className="p-4 rounded-none border border-border bg-card shadow-sm hover:border-primary/50 transition-colors">
                <p className="font-serif text-2xl sm:text-3xl text-primary font-bold mb-1">{data.stat1Number}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">{data.stat1Label}</p>
              </div>

              <div className="p-4 rounded-none border border-border bg-card shadow-sm hover:border-primary/50 transition-colors">
                <p className="font-serif text-2xl sm:text-3xl text-primary font-bold mb-1">{data.stat2Number}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">{data.stat2Label}</p>
              </div>

              <div className="p-4 rounded-none border border-border bg-card shadow-sm hover:border-primary/50 transition-colors">
                <p className="font-serif text-2xl sm:text-3xl text-primary font-bold mb-1">{data.stat3Number}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">{data.stat3Label}</p>
              </div>
            </div>

            {/* CTA Button (rounded-none) */}
            <div className="pt-2">
              <Link href={data.link || "/collections/celebrity"}>
                <Button
                  size="lg"
                  className="rounded-none px-10 h-13 text-xs sm:text-sm tracking-[0.2em] uppercase font-bold shadow-md hover:shadow-lg transition-all duration-300 gap-3"
                  suppressHydrationWarning
                >
                  <span>{data.buttonText || "DISCOVER CELEBRITY LOOKS"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
