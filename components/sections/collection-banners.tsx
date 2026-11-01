'use client'

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { API_BASE_URL } from "@/lib/api"
import { resolveMediaUrl } from "@/lib/media"
import { useProducts } from "@/context/product-context"
import { ProductCard } from "@/components/products/product-card"
import { ArrowRight, Sparkles, Tag } from "lucide-react"

export function CollectionBanners() {
  const [saleData, setSaleData] = useState<any>(null)
  const [festiveData, setFestiveData] = useState<any>(null)
  const { mappedProducts, loading } = useProducts()

  const festiveProducts = mappedProducts.filter(
    (p: any) => p.isFestive || p.productCollection === "festive"
  )
  const displayFestiveProducts = festiveProducts.slice(0, 4)

  const saleProducts = mappedProducts.filter(
    (p: any) => p.isOnSale || p.productCollection === "big-sale" || p.productCollection === "sale" || (p.originalPrice && p.originalPrice > p.price)
  )
  const displaySaleProducts = saleProducts.slice(0, 4)

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        // Fetch Sale Offer Banner
        const saleRes = await fetch(`${API_BASE_URL}/api/marketing-collections/big-sale`)
        const saleResponse = await saleRes.json().catch(() => null)
        if (saleResponse && saleResponse.success) {
          setSaleData(saleResponse.data)
        }

        // Fetch Festive Collection Banner
        const festiveRes = await fetch(`${API_BASE_URL}/api/marketing-collections/festive`)
        const festiveResponse = await festiveRes.json().catch(() => null)
        if (festiveResponse && festiveResponse.success) {
          setFestiveData(festiveResponse.data)
        }
      } catch (error) {
        console.warn("Failed to fetch custom collection banners, using default visual fallbacks:", error)
      }
    }
    fetchBanners()
  }, [])

  return (
    <div className="space-y-14 md:space-y-20 py-16 md:py-20 bg-background">
      {/* =========================================================================
          1. FESTIVE COLLECTION BANNER (Theme-matched rounded-none)
         ========================================================================= */}
      <div className="space-y-10">
        <section className="relative overflow-hidden group mx-0 w-full rounded-none">
          <Link
            href={festiveData?.link || "/collections/festive"}
            className="block relative h-[480px] md:h-[600px] lg:h-[700px] w-full"
          >
            {/* Base Image with Smooth Cinematic Zoom */}
            <div className="absolute inset-0 overflow-hidden bg-black">
              <Image
                src={resolveMediaUrl(festiveData?.image || "/images/festive-collection-hero.jpg")}
                alt="Festive Collection"
                fill
                priority
                className="object-cover object-top origin-top group-hover:scale-105 transition-transform duration-[6000ms] ease-out"
              />
            </div>

            {/* Artistic Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/30 opacity-90 group-hover:opacity-80 transition-opacity duration-1000" />
            <div className="absolute inset-0 bg-radial-at-c from-amber-500/10 via-transparent to-transparent opacity-60" />

            {/* Floating Content Area */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 md:p-12 z-20">
              <div className="max-w-5xl space-y-6 md:space-y-8">
                {/* Accent Tag (matching existing themed roundness: rounded-none) */}
                <div>
                  <div className="inline-flex items-center gap-2 backdrop-blur-md bg-black/60 border border-white/20 px-4 py-1.5 rounded-none shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span className="text-[10px] md:text-xs font-semibold tracking-[0.25em] text-amber-200 uppercase">
                      {festiveData?.offer || "HANDCRAFTED PURE ZARI & LINEN"}
                    </span>
                  </div>
                </div>

                {/* Signed Accent */}
                <div>
                  <span className="font-script text-3xl md:text-5xl lg:text-6xl text-amber-100/90 italic drop-shadow-md">
                    {festiveData?.title1 || "The Royale Festive Edit"}
                  </span>
                </div>

                {/* Light Couture Serif Title */}
                <div className="overflow-hidden w-full">
                  <h2>
                    <span className="block font-serif font-[300] text-3xl md:text-7xl lg:text-8xl text-white tracking-[0.15em] md:tracking-[0.2em] leading-none uppercase drop-shadow-2xl group-hover:-translate-y-1 transition-transform duration-700">
                      {festiveData?.title2 || festiveData?.name || "FESTIVE HEIRLOOM"}
                    </span>
                  </h2>
                </div>

                <p className="text-white/85 text-sm md:text-lg max-w-2xl mx-auto font-light leading-relaxed tracking-wider drop-shadow-md px-4">
                  {festiveData?.description || "Adorn yourself in weightless grandeur. Handwoven from the finest artisanal linen threads and kissed with antique zari, each drape is curated for joyous gatherings, wedding festivities, and treasured moments."}
                </p>

                {/* Delicate Button (matching existing themed roundness: rounded-none) */}
                <div className="pt-2">
                  <div className="inline-flex items-center gap-3 border border-white/70 backdrop-blur-sm bg-white/10 text-white hover:bg-white hover:text-black px-8 md:px-12 py-3.5 md:py-4 rounded-none font-bold text-xs md:text-sm tracking-[0.2em] transition-all duration-300 shadow-xl uppercase">
                    <span>{festiveData?.buttonText || "EXPLORE FESTIVE COLLECTION"}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* Related Festive Highlights */}
        {displayFestiveProducts.length > 0 && (
          <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs sm:text-sm tracking-[0.2em] uppercase text-primary font-semibold mb-1">
                  Handcrafted For Celebrations
                </p>
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground">
                  Festive Collection Highlights
                </h3>
              </div>
              <Link
                href={festiveData?.link || "/collections/festive"}
                className="inline-flex items-center gap-2 text-xs sm:text-sm tracking-widest uppercase hover:text-primary transition-colors font-medium group"
              >
                View Full Festive Collection ({festiveProducts.length})
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {displayFestiveProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          2. BIG SALE BANNER (Theme-matched rounded-none)
         ========================================================================= */}
      <div className="space-y-10 pt-4">
        <section className="relative overflow-hidden group mx-0 w-full rounded-none">
          <Link
            href={saleData?.link || "/collections/big-sale"}
            className="block relative h-[480px] md:h-[600px] lg:h-[700px] w-full"
          >
            {/* Base Image with Smooth Cinematic Zoom */}
            <div className="absolute inset-0 overflow-hidden bg-black">
              <Image
                src={resolveMediaUrl(saleData?.image || "/images/big-sale-banner.jpg")}
                alt="Special Offers"
                fill
                priority
                className="object-cover object-top origin-top group-hover:scale-105 transition-transform duration-[6000ms] ease-out"
              />
            </div>

            {/* Artistic Asymmetrical Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent opacity-95 group-hover:opacity-85 transition-opacity duration-1000" />

            {/* Floating Content Area */}
            <div className="absolute inset-0 flex items-center justify-start p-6 md:p-20 z-20">
              <div className="max-w-2xl text-left space-y-6 md:space-y-8">
                {/* Discount Tag (rounded-none) */}
                <div>
                  <div className="inline-flex items-center gap-2 backdrop-blur-md bg-black/60 border border-rose-400/40 px-4 py-1.5 rounded-none shadow-lg">
                    <Tag className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-[10px] md:text-xs font-semibold tracking-[0.25em] text-rose-300 uppercase">
                      {saleData?.offer || "UP TO 50% OFF CURATED DRAPES"}
                    </span>
                  </div>
                </div>

                {/* Signed Accent */}
                <div>
                  <span className="font-script text-3xl md:text-5xl lg:text-6xl text-white/95 drop-shadow-md">
                    {saleData?.title1 || "Exclusive Seasonal Privileges"}
                  </span>
                </div>

                {/* Light Couture Serif Title */}
                <h2 className="overflow-hidden">
                  <span className="block font-serif font-[300] text-4xl md:text-7xl lg:text-8xl text-white tracking-[0.15em] leading-tight uppercase drop-shadow-2xl">
                    {saleData?.title2 || saleData?.name || "THE GRAND SALE"}
                  </span>
                </h2>

                <p className="text-white/80 text-sm md:text-lg max-w-xl font-light leading-relaxed tracking-wider drop-shadow-lg">
                  {saleData?.description || "An exclusive celebration of master craftsmanship at extraordinary prices. Discover limited-edition handloom linen sarees crafted for modern connoisseurs, available for a fleeting moment."}
                </p>

                {/* Elegant Button (matching existing themed roundness: rounded-none) */}
                <div className="pt-2">
                  <div className="inline-flex items-center gap-3 border border-white/70 backdrop-blur-sm bg-white/10 text-white hover:bg-white hover:text-black px-8 md:px-12 py-3.5 md:py-4 rounded-none font-bold text-xs md:text-sm tracking-[0.2em] transition-all duration-300 shadow-xl uppercase">
                    <span>{saleData?.buttonText || "SHOP THE PRIVATE SALE"}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* Related Big Sale Highlights */}
        {displaySaleProducts.length > 0 && (
          <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs sm:text-sm tracking-[0.2em] uppercase text-primary font-semibold mb-1">
                  Limited Time Offers
                </p>
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground">
                  Big Sale Picks
                </h3>
              </div>
              <Link
                href={saleData?.link || "/collections/big-sale"}
                className="inline-flex items-center gap-2 text-xs sm:text-sm tracking-widest uppercase hover:text-primary transition-colors font-medium group"
              >
                View All Sale Offers ({saleProducts.length})
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {displaySaleProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
