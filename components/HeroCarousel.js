"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { heroSlides } from "@/lib/data";

const AUTOPLAY_MS = 5000;

function Chevron({ direction }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {direction === "left" ? <path d="m14 6-6 6 6 6" /> : <path d="m10 6 6 6-6 6" />}
    </svg>
  );
}

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const count = heroSlides.length;

  function startTimer() {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTOPLAY_MS);
  }

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  function manual(next) {
    setIndex(((next % count) + count) % count);
    startTimer();
  }

  return (
    <section aria-label="Featured saree collection">
      <h1 className="sr-only">House of Qalakari — handwoven Banarasi, Chanderi and cotton sarees</h1>

      <div className="bg-pine-950 lg:grid lg:grid-cols-[1fr_1.05fr] lg:items-stretch">
        {/* Desktop copy panel */}
        <div className="relative z-10 hidden flex-col justify-center px-14 py-16 lg:flex xl:px-20">
          <p className="font-inter text-[11px] font-medium uppercase tracking-[0.45em] text-aqua">
            House of Qalakari
          </p>
          <h2 className="mt-5 max-w-md font-display text-[44px] font-medium uppercase leading-[1.12] tracking-[0.06em] text-white xl:text-[52px]">
            Celebrate the elegance of tradition
          </h2>
          <span aria-hidden="true" className="mt-6 block h-px w-20 bg-aqua/70" />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/70">
            Handwoven Banarasi silks, chanderi cotton and pure muslin — woven on
            traditional pit looms, finished by hand, delivered across India.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/collections"
              className="inline-flex h-11 items-center rounded-md bg-white px-6 font-inter text-[13px] font-semibold text-pine-950 transition-colors hover:bg-aqua"
            >
              Shop sarees
            </Link>
            <Link
              href="/collections/fabric"
              className="inline-flex h-11 items-center rounded-md border border-white/35 px-6 font-inter text-[13px] font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              Explore by fabric
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-3">
            {heroSlides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => manual(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-8 bg-aqua" : "w-3 bg-white/35 hover:bg-white/60"
                }`}
              />
            ))}
            <span className="ml-2 font-inter text-[11px] tabular-nums text-white/50">
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Slides */}
        <div className="relative h-[440px] w-full overflow-hidden sm:h-[520px] lg:h-[600px]">
          {heroSlides.map((slide, i) => (
            <div
              key={slide.id}
              aria-hidden={i !== index}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === index ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 52vw"
                preload={i === 0}
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/25 lg:bg-gradient-to-r lg:from-pine-950/70 lg:via-transparent lg:to-transparent" />
            </div>
          ))}

          {/* Mobile overlay copy */}
          <div className="absolute inset-x-0 bottom-10 px-6 text-center lg:hidden">
            <p className="font-display text-[22px] font-medium uppercase leading-tight tracking-[0.22em] text-white drop-shadow-sm">
              Celebrate the elegance
              <br />
              of tradition
            </p>
            <span className="mx-auto mt-4 block h-px w-16 bg-white/70" />
          </div>

          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-3 lg:px-5">
            <button
              type="button"
              onClick={() => manual(index - 1)}
              aria-label="Previous slide"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-pine-950/70 text-white backdrop-blur-sm transition-colors hover:bg-pine-950"
            >
              <Chevron direction="left" />
            </button>
            <button
              type="button"
              onClick={() => manual(index + 1)}
              aria-label="Next slide"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-pine-950/70 text-white backdrop-blur-sm transition-colors hover:bg-pine-950"
            >
              <Chevron direction="right" />
            </button>
          </div>

          {/* Mobile dots */}
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5 lg:hidden">
            {heroSlides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => manual(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/60 hover:bg-white/90"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}