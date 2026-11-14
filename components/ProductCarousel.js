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
      className={`py-8 lg:py-14 overflow-hidden ${tone === "linen" ? "bg-linen" : ""}`}
    >
      <div className="mx-auto max-w-[1240px] px-4 lg:px-10">
        <div className="relative mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-4">
            <SectionHeading title={title} />
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="font-inter text-xs font-semibold text-pine-900 underline underline-offset-4 hover:text-pine-950"
              >
                {viewAllLabel} &rarr;
              </Link>
            )}
          </div>
          <div className="flex gap-2">
            <Arrow direction="left" onClick={() => scrollByPage(-1)} />
            <Arrow direction="right" onClick={() => scrollByPage(1)} />
          </div>
        </div>

        <div
          ref={trackRef}
          className={`no-scrollbar -mx-4 flex items-stretch snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-smooth px-4 pt-1 pb-1 lg:mx-0 lg:grid ${colClass} lg:gap-6 lg:overflow-visible lg:px-0 lg:pt-0`}
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
