"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { apiGet } from "@/lib/api"
import { resolveMediaUrl } from "@/lib/media"

export function FeaturedBanner() {
  const [data, setData] = useState({
    badge: "Celebrity Choice",
    tagline: "Celebrity Collection",
    titleColorPart: "Dress Like a",
    titleItalicPart: "Star",
    description: "Discover the exclusive collection favored by icons. Our Celebrity Collection brings red-carpet elegance to your wardrobe with premium linen sarees and sophisticated designs.",
    stat1Number: "500+",
    stat1Label: "Styles",
    stat2Number: "20+",
    stat2Label: "Celebrities",
    stat3Number: "5★",
    stat3Label: "Rating",
    buttonText: "Explore Collection",
    link: "/collections/celebrity",
    image: "/images/celebrity-collection.png"
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiGet("/api/marketing-collections/celebrity")
        if (response.success && response.data) {
          setData({
            ...response.data,
            // Fallbacks for any missing fields if needed
            badge: response.data.badge || "Celebrity Choice",
            tagline: response.data.tagline || "Celebrity Collection",
            titleColorPart: response.data.titleColorPart || "Dress Like a",
            titleItalicPart: response.data.titleItalicPart || "Star",
            description: response.data.description || "",
            stat1Number: response.data.stats?.[0]?.number || "500+",
            stat1Label: response.data.stats?.[0]?.label || "Styles",
            stat2Number: response.data.stats?.[1]?.number || "20+",
            stat2Label: response.data.stats?.[1]?.label || "Celebrities",
            stat3Number: response.data.stats?.[2]?.number || "5★",
            stat3Label: response.data.stats?.[2]?.label || "Rating",
            buttonText: response.data.buttonText || "Explore Collection",
            link: response.data.link || "/collections/celebrity",
            image: response.data.image || "/images/celebrity-collection.png"
          })
        }
      } catch (error: any) {
        console.warn("Failed to fetch celebrity banner from backend, using default fallback data. Message:", error.message || error)
      }
    }
    fetchData()
  }, [])

  return (
    <section className="py-20 px-2">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Image */}
          <div className="relative aspect-square lg:aspect-[4/5] max-h-[600px] overflow-hidden rounded-lg shadow-2xl">
            <Image
              src={resolveMediaUrl(data.image)}
              alt={data.tagline}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>

          {/* Content */}
          <div className="lg:pl-12">
            <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
              {data.tagline || (data as any).name}
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
              {data.titleColorPart}
              <br />
              <span className="italic text-primary">{data.titleItalicPart || (data as any).name}</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-xl">
              {data.description}
            </p>
            
            <div className="grid grid-cols-3 gap-6 mb-10">
              <div>
                <p className="font-serif text-3xl md:text-4xl text-primary mb-1">{data.stat1Number}</p>
                <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">{data.stat1Label}</p>
              </div>
              <div>
                <p className="font-serif text-3xl md:text-4xl text-primary mb-1">{data.stat2Number}</p>
                <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">{data.stat2Label}</p>
              </div>
              <div>
                <p className="font-serif text-3xl md:text-4xl text-primary mb-1">{data.stat3Number}</p>
                <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">{data.stat3Label}</p>
              </div>
            </div>

            <Link href={data.link}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 px-10 h-14 text-base" suppressHydrationWarning>
                {data.buttonText}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

