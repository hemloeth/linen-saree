"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import SectionHeading from "@/components/SectionHeading";
import { formatINR, reels } from "@/lib/data";

function Arrow({ direction, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-full bg-pine-900 text-white transition-colors hover:bg-pine-950"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {direction === "left" ? <path d="m14 6-6 6 6 6" /> : <path d="m10 6 6 6-6 6" />}
      </svg>
    </button>
  );
}

function ReelCard({ reel, sizes }) {
  return (
    <article className="w-[168px] shrink-0 snap-start sm:w-[190px] lg:w-auto lg:shrink">
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-md bg-pine-950">
        <Image src={reel.image} alt={reel.caption} fill sizes={sizes} className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-2 pt-6">
          <p className="line-clamp-2 text-[10px] leading-tight text-white lg:text-[11px]">{reel.caption}</p>
          <p className="mt-1 flex items-baseline gap-1">
            <span className="font-inter text-[11px] font-semibold text-white">{formatINR(reel.price)}</span>
            <span className="text-[9px] text-white/70 line-through">{formatINR(reel.mrp)}</span>
          </p>
        </div>
        <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-white" aria-hidden="true">
            <path d="M8 5v14l11-7L8 5Z" />
          </svg>
        </span>
      </div>
      <Link
        href="/product"
        className="mt-2 flex h-9 items-center justify-center rounded-md bg-aqua font-inter text-[11px] font-semibold text-pine-950 transition-colors hover:bg-[#9adada] lg:h-10 lg:text-xs"
      >
        Shop the Look
      </Link>
    </article>
  );
}

export default function ReelCarousel() {
  const trackRef = useRef(null);

  function scrollByPage(direction) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <section aria-label="Trending looks to watch" className="py-6 lg:py-10 overflow-hidden">
      <div className="mx-auto max-w-[1240px] px-4 lg:px-10">
        <div className="relative mb-4">
          <SectionHeading title="Trending Looks To Watch" />
          <div className="absolute right-0 top-1/2 flex -translate-y-1/2 gap-2 lg:hidden">
            <Arrow direction="left" label="Previous looks" onClick={() => scrollByPage(-1)} />
            <Arrow direction="right" label="Next looks" onClick={() => scrollByPage(1)} />
          </div>
        </div>

        <div
          ref={trackRef}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-5 lg:overflow-visible lg:px-0"
        >
          {reels.map((reel) => (
            <ReelCard key={reel.id} reel={reel} sizes="(max-width: 1024px) 190px, 12vw" />
          ))}
        </div>
      </div>
    </section>
  );
}