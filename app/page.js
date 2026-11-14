"use client";

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

function getBestsellers(products) {
  const explicit = products.filter((p) => p.isBestSeller);
  if (explicit.length >= 8) return explicit.slice(0, 8);
  const sorted = [...products].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    if (b.reviews !== a.reviews) return b.reviews - a.reviews;
    const aDisc = a.mrp > a.price ? (a.mrp - a.price) / a.mrp : 0;
    const bDisc = b.mrp > b.price ? (b.mrp - b.price) / b.mrp : 0;
    return bDisc - aDisc;
  });
  return sorted.slice(0, 8);
}

function getTrending(products, bestsellers) {
  const bestsellerIds = new Set(bestsellers.map((p) => p.id));
  const pool = products.filter((p) => !bestsellerIds.has(p.id));
  return (pool.length ? pool : products).slice(0, 8);
}

export default function HomePage() {
  const { catalog: products, catalogError } = useStore();

  const bestsellers = getBestsellers(products);
  const trending = getTrending(products, bestsellers);

  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden">
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
        {trending.length > 0 && (
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
        )}

        {/* 5. Explore Collections */}
        <CollectionSection />

        {/* 6. Video Collection — Autoplay on visibility */}
        <VideoCollectionSection />

        {/* 7. Bestsellers — Limited selection of 8 products + View All */}
        {bestsellers.length > 0 && (
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
        )}

        {/* Service highlights / Trust badges */}
        <section aria-label="Why shop with us" className="py-8 lg:py-12 border-t border-pine-950/10">
          <div className="mx-auto max-w-[1240px] px-4 lg:px-10">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4 lg:gap-8">
              {services.map((service) => (
                <li key={service.label} className="flex items-center gap-2.5">
                  <Image
                    src={service.icon}
                    alt=""
                    width={40}
                    height={40}
                    className="h-8 w-8 shrink-0 object-contain lg:h-10 lg:w-10"
                  />
                  <span className="font-inter text-[11px] font-medium leading-tight text-pine-800 lg:text-[13px]">
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
