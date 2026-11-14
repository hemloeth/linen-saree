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
      <div className="mx-auto max-w-[1240px] px-4 lg:px-10">
        <div className="mb-3.5 sm:mb-6 flex items-end justify-between gap-3">
          {/* Section title + subtitle */}
          <div className="min-w-0">
            <h2 className="font-display text-base font-semibold uppercase tracking-[0.12em] text-pine-950 sm:text-lg lg:text-xl">
              {title}
            </h2>
            <div className="mt-1 flex items-center gap-1.5">
              <span aria-hidden="true" className="h-0.5 w-6 rounded-full bg-pine-900 sm:w-10" />
              <span className="font-inter text-[10px] text-muted sm:text-xs">
                Handcrafted pure linen & silk
              </span>
            </div>
          </div>

          {/* Right side: View All text + desktop arrows */}
          <div className="flex items-center gap-3 shrink-0">
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="font-inter text-xs font-semibold text-pine-900 underline underline-offset-4 hover:text-pine-950 transition-colors"
              >
                {viewAllLabel} &rarr;
              </Link>
            )}
            <div className="hidden sm:flex items-center gap-1.5">
              <Arrow direction="left" onClick={() => scrollByPage(-1)} />
              <Arrow direction="right" onClick={() => scrollByPage(1)} />
            </div>
          </div>
        </div>

        {/* Carousel / Grid Track - Exact left margin alignment with px-4 and -mx-4 */}
        <div
          ref={trackRef}
          className={`no-scrollbar -mx-4 flex items-stretch snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-smooth px-4 pt-1 pb-1 lg:mx-0 lg:grid ${colClass} lg:gap-6 lg:overflow-visible lg:px-0 lg:pt-0`}
        >
          {/* Product cards */}
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

          {/* End-of-carousel View All Card (visible on mobile / swipe) */}
          {viewAllHref && (
            <div className="flex w-[44vw] min-w-[150px] max-w-[200px] shrink-0 snap-start sm:w-[42vw] sm:max-w-[220px] lg:hidden">
              <Link
                href={viewAllHref}
                className="group flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-pine-900/30 bg-white/80 p-4 text-center shadow-xs transition-all duration-300 hover:border-pine-900 hover:bg-pine-900 hover:text-white"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pine-900 text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-pine-900">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
                <span className="mt-3 font-display text-xs font-semibold tracking-wider uppercase text-pine-950 group-hover:text-white transition-colors">
                  {viewAllLabel}
                </span>
                <span className="mt-1 font-inter text-[10px] text-muted group-hover:text-white/80 transition-colors">
                  Explore all &rarr;
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* Bottom View All CTA Link when both sections end */}
        {viewAllHref && (
          <div className="mt-5 flex justify-center sm:mt-8">
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-2 rounded-full border border-pine-900/30 bg-white px-5 py-2 font-inter text-xs font-semibold text-pine-900 shadow-xs transition-all duration-200 hover:bg-pine-900 hover:text-white cursor-pointer"
            >
              <span>{viewAllLabel}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
