"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { apiGet } from "@/lib/api"
import { resolveMediaUrl } from "@/lib/media"

export function FeaturedBanner() {
  const [data, setData] = useState({
    badge: "Best Seller",
    tagline: "Bridal Collection",
    titleColorPart: "Elegance for Your",
    titleItalicPart: "Special Day",
    description: "Our bridal collection features exquisite linen sarees adorned with intricate zari work, delicate embroidery, and timeless designs. Each piece is crafted to make your special day truly memorable.",
    stat1Number: "100+",
    stat1Label: "Designs",
    stat2Number: "50+",
    stat2Label: "Artisans",
    stat3Number: "15+",
    stat3Label: "Years",
    buttonText: "Shop Bridal Collection",
    link: "/collections/banarasi-silk",
    image: "/images/bridal-saree.jpg"
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiGet("/api/bridal-banner")
        if (response.success && response.data) {
          setData(response.data)
        }
      } catch (error) {
        console.error("Error fetching bridal banner:", error)
      }
    }
    fetchData()
  }, [])

  return (
    <section className="py-20 px-4 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Image */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
            <Image
              src={resolveMediaUrl(data.image)}
              alt={data.tagline}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute top-6 left-6 bg-accent text-accent-foreground px-4 py-2 text-sm tracking-wide shadow-sm">
              {data.badge}
            </div>
          </div>

          {/* Content */}
          <div className="lg:pl-12">
            <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
              {data.tagline}
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
              {data.titleColorPart}
              <br />
              <span className="italic text-primary">{data.titleItalicPart}</span>
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

