"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import NewArrivalsSection from "@/components/NewArrivalsSection";
import { CategorySection, CollectionSection } from "@/components/merchandising/DynamicCards";
import ProductCarousel from "@/components/ProductCarousel";
import ProductCard from "@/components/ProductCard";
import VideoCollectionSection from "@/components/video/VideoCollectionSection";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import { services } from "@/lib/data";
import { useStore } from "@/components/StoreProvider";
import { fetchPaginatedProducts } from "@/lib/api/products";

export default function HomePage() {
  const { catalogError } = useStore();

  const [bestsellers, setBestsellers] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);

  // Pure API-driven case-specific fetching: zero mock/demo inventory in production
  useEffect(() => {
    let active = true;
    Promise.all([
      fetchPaginatedProducts({ isBestSeller: true, limit: 8 }).catch(() => ({ products: [] })),
      fetchPaginatedProducts({ sortBy: "featured", limit: 12 }).catch(() => ({ products: [] })),
    ])
      .then(([bestRes, trendRes]) => {
        if (!active) return;
        if (bestRes.products?.length > 0) {
          setBestsellers(bestRes.products.slice(0, 8));
        }
        if (trendRes.products?.length > 0) {
          const bestIds = new Set((bestRes.products || []).map((p) => p.id));
          const filteredTrend = trendRes.products.filter((p) => !bestIds.has(p.id));
          setTrending(filteredTrend.slice(0, 8));
        }
        setLoadingSections(false);
      })
      .catch(() => {
        if (active) setLoadingSections(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-clip">
        {/* 1. Hero Section */}
        <HeroCarousel />
        {catalogError ? (
          <p role="alert" className="mx-auto max-w-[1240px] px-4 py-3 text-sm text-red-700">
            Unable to load products: {catalogError}
          </p>
        ) : null}

        {/* 2. New Arrivals — 30 products initial + View More pagination */}
        <NewArrivalsSection />

        {/* 3. Shop by Category */}
        <CategorySection />

        {/* 4. Trending Products — Limited selection of 8 products + View All */}
        {loadingSections ? (
          <ProductCarousel title="Trending Now" id="trending" viewAllHref="/shop" columns={4}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-chip" />
            ))}
          </ProductCarousel>
        ) : trending.length > 0 ? (
          <ProductCarousel
            title="Trending Now"
            id="trending"
            viewAllHref="/shop"
            viewAllLabel="View All"
            columns={4}
          >
            {trending.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductCarousel>
        ) : null}

        {/* 5. Explore Collections */}
        <CollectionSection />

        {/* 6. Video Collection — Autoplay on visibility */}
        <VideoCollectionSection />

        {/* 7. Bestsellers — Limited selection of 8 products + View All */}
        {loadingSections ? (
          <ProductCarousel title="Bestsellers" id="bestsellers" tone="linen" viewAllHref="/best-sellers" columns={4}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-white/70" />
            ))}
          </ProductCarousel>
        ) : bestsellers.length > 0 ? (
          <ProductCarousel
            title="Bestsellers"
            id="bestsellers"
            tone="linen"
            viewAllHref="/best-sellers"
            viewAllLabel="View All"
            columns={4}
          >
            {bestsellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductCarousel>
        ) : null}

        {/* Service highlights / Trust badges */}
        <section aria-label="Why shop with us" className="py-8 lg:py-12 border-t border-pine-950/10 bg-linen/25">
          <div className="mx-auto max-w-[1240px] px-4 lg:px-10">
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:gap-6">
              {services.map((service) => (
                <li
                  key={service.label}
                  className="flex items-center justify-center gap-2.5 rounded-lg border border-pine-950/[0.07] bg-white px-3 py-3 shadow-[0_1px_3px_rgba(25,71,53,0.04)] sm:px-4 sm:py-3.5"
                >
                  <Image
                    src={service.icon}
                    alt=""
                    width={40}
                    height={40}
                    className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8 lg:h-9 lg:w-9"
                  />
                  <span className="font-inter text-[11px] font-medium leading-tight text-pine-900 sm:text-xs lg:text-[13px]">
                    {service.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 8. Testimonials */}
        <TestimonialCarousel />
      </main>

      {/* 9. Existing Footer */}
      <Footer />
    </>
  );
}
