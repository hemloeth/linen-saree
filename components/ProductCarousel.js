"use client";

import { useRef } from "react";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";

function Arrow({ direction, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "Previous items" : "Next items"}
      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-pine-900 text-white transition-colors hover:bg-pine-950"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {direction === "left" ? <path d="m14 6-6 6 6 6" /> : <path d="m10 6 6 6-6 6" />}
      </svg>
    </button>
  );
}

export default function ProductCarousel({
  title,
  id,
  tone = "white",
  viewAllHref,
  viewAllLabel = "View all",
  columns = 4,
  children,
}) {
  const trackRef = useRef(null);

  function scrollByPage(direction) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" });
  }

  const colClass = columns === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4";

  return (
    <section
      aria-label={title}
      id={id}
      className={`py-6 sm:py-8 lg:py-14 overflow-hidden ${tone === "linen" ? "bg-linen" : ""}`}
    >
      <div className="mx-auto max-w-[1240px] px-3.5 sm:px-4 lg:px-10">
        <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2">
          {/* Section title + subtitle/view all */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <h2 className="font-display text-base font-semibold uppercase tracking-[0.12em] text-pine-950 sm:text-lg lg:text-xl">
                {title}
              </h2>
              {viewAllHref && (
                <Link
                  href={viewAllHref}
                  className="font-inter text-[11px] font-semibold text-pine-900 underline underline-offset-3 hover:text-pine-950 sm:text-xs"
                >
                  {viewAllLabel} &rarr;
                </Link>
              )}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span aria-hidden="true" className="h-0.5 w-6 rounded-full bg-pine-900 sm:w-10" />
              <span className="font-inter text-[10px] text-muted sm:text-xs">
                Handcrafted pure linen & silk
              </span>
            </div>
          </div>

          {/* Desktop/Tablet Carousel Arrows */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <Arrow direction="left" onClick={() => scrollByPage(-1)} />
            <Arrow direction="right" onClick={() => scrollByPage(1)} />
          </div>
        </div>

        <div
          ref={trackRef}
          className={`no-scrollbar -mx-3.5 flex items-stretch snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-smooth px-3.5 pt-1 pb-1 sm:-mx-4 sm:px-4 lg:mx-0 lg:grid ${colClass} lg:gap-6 lg:overflow-visible lg:px-0 lg:pt-0`}
        >
          {/* Wrap each child in a flex-basis container for proper mobile carousel sizing */}
          {Array.isArray(children)
            ? children.map((child, i) => (
                <div
                  key={child?.key ?? i}
                  className="w-[44vw] min-w-[150px] max-w-[200px] shrink-0 snap-start sm:w-[42vw] sm:max-w-[220px] lg:w-auto lg:min-w-0 lg:max-w-none lg:shrink"
                >
                  {child}
                </div>
              ))
            : children}
        </div>
      </div>
    </section>
  );
}
