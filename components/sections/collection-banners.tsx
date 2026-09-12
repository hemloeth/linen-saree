'use client'

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { API_BASE_URL } from "@/lib/api"
import { useProducts } from "@/context/product-context"
import { ProductCard } from "@/components/products/product-card"
import { ArrowRight } from "lucide-react"

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
    <div className="space-y-12 md:space-y-20 pt-0 pb-16 md:pb-20 bg-background">
      {/* 1. Festival Collection Banner (Floating Minimalist) */}
      <div className="space-y-10">
        <section className="relative overflow-hidden group mx-0 lg:mx-0">
          <Link
            href={festiveData?.link || "/collections/festive"}
            className="block relative h-[450px] md:h-[580px] lg:h-[700px] w-full"
          >
            {/* Base Image with Smooth Cinematic Zoom */}
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={festiveData?.image || "/images/bridal-saree.jpg"}
                alt="Festival Collection"
                fill
                className="object-cover object-top origin-top group-hover:scale-105 transition-transform duration-[6000ms] ease-out"
                priority
              />
            </div>

            {/* Artistic Vignette Overlay (Ensures readability without a box) */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 opacity-60 group-hover:opacity-40 transition-opacity duration-1000" />
            <div className="absolute inset-0 bg-black/10" />

            {/* Floating Content Area */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 md:p-12">
              <div className="max-w-5xl space-y-8 md:space-y-10">
                {/* Signed Accent */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <span className="font-script text-3xl md:text-5xl lg:text-6xl text-white/90 italic drop-shadow-md">
                    {festiveData?.title1 || "Experience"}
                  </span>
                </div>

                {/* Light Couture Serif Title */}
                <div className="overflow-hidden w-full">
                  <h2 className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    <span className="block font-serif font-[300] text-3xl md:text-7xl lg:text-8xl text-white tracking-[0.1em] md:tracking-[0.2em] leading-none uppercase drop-shadow-xl translate-y-0 group-hover:-translate-y-2 transition-transform duration-1000">
                      {festiveData?.title2 || festiveData?.name || "COLLECTION"}
                    </span>
                  </h2>
                </div>

                {/* Minimalist Label */}
                <div className="flex items-center justify-center gap-4 md:gap-6 animate-in fade-in duration-1000 delay-500">
                  <div className="w-8 md:w-16 h-px bg-white/30" />
                  <span className="text-[10px] md:text-lg font-bold tracking-[0.2em] md:tracking-[0.4em] text-white/80 uppercase">
                    {festiveData?.offer || "CELEBRATE IN STYLE"}
                  </span>
                  <div className="w-8 md:w-16 h-px bg-white/30" />
                </div>

                <p className="text-white/80 text-sm md:text-lg lg:text-xl max-w-2xl mx-auto font-light leading-relaxed tracking-widest drop-shadow-md animate-in fade-in duration-1000 delay-700 px-4">
                  {festiveData?.description || "Discover our exquisite collection of premium linen sarees perfect for festivals and celebrations"}
                </p>

                {/* Delicate Outlined Button */}
                <div className="pt-2 animate-in fade-in duration-1000 delay-1000">
                  <div className="inline-flex items-center border border-white/40 text-white px-6 md:px-10 py-3 md:py-4 rounded-full font-bold text-[10px] md:text-sm tracking-[0.1em] md:tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-500 hover:px-8 md:hover:px-14 uppercase">
                    <span>{festiveData?.buttonText || "SHOP FESTIVAL COLLECTION"}</span>
                    <svg className="ml-4 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-3 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* Related Festive Products */}
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

      {/* 2. Sale Offer Banner (Floating Minimalist) */}
      <div className="space-y-10 pt-4">
        <section className="relative overflow-hidden group mx-0 lg:mx-0">
          <Link
            href={saleData?.link || "/collections/big-sale"}
            className="block relative h-[450px] md:h-[580px] lg:h-[700px] w-full"
          >
            {/* Base Image with Smooth Cinematic Zoom */}
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={saleData?.image || "/images/designer-saree.jpg"}
                alt="Special Offers"
                fill
                className="object-cover object-top origin-top group-hover:scale-105 transition-transform duration-[6000ms] ease-out"
              />
            </div>

            {/* Artistic Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-1000" />

            {/* Floating Content Area (Asymmetrical for Modern Feel) */}
            <div className="absolute inset-0 flex items-center justify-start p-6 md:p-24">
              <div className="max-w-4xl text-left space-y-6 md:space-y-10">
                {/* Signed Accent */}
                <div>
                  <span className="font-script text-3xl md:text-5xl lg:text-7xl text-white/90 drop-shadow-md">
                    {saleData?.title1 || "Experience"}
                  </span>
                </div>

                {/* Light Couture Serif Title */}
                <h2 className="overflow-hidden">
                  <span className="block font-serif font-[300] text-4xl md:text-7xl lg:text-8xl text-white tracking-[0.2em] leading-tight uppercase drop-shadow-2xl">
                    {saleData?.title2 || saleData?.name || "BIG SALE"}
                  </span>
                </h2>

                {/* Minimalist Price Accent */}
                <div className="flex items-center gap-4">
                  <div className="h-px w-12 bg-white/40" />
                  <span className="text-sm md:text-2xl font-bold tracking-[0.4em] text-white/90 uppercase">
                    {saleData?.offer || "UP TO 60% OFF"}
                  </span>
                </div>

                <p className="text-white/70 text-sm md:text-lg lg:text-xl max-w-xl font-light leading-relaxed tracking-widest drop-shadow-lg">
                  {saleData?.description || "Limited time offer on premium linen sarees - Don't miss out on these incredible deals!"}
                </p>

                {/* Elegant Button */}
                <div className="inline-flex items-center border border-white/60 text-white px-8 md:px-10 py-3 md:py-4 rounded-full font-bold text-xs md:text-sm tracking-widest hover:bg-white hover:text-black transition-all duration-500 shadow-xl hover:px-12 uppercase">
                  <span>{saleData?.buttonText || "SHOP SALE NOW"}</span>
                  <svg className="ml-4 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-4 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* Related Big Sale Products */}
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
