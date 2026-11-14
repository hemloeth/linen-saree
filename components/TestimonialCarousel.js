"use client";

import Image from "next/image";
import { useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { testimonials } from "@/lib/data";

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill={i < rating ? "#f9a000" : "none"}
          stroke="#f9a000"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9 2.9-6Z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial: t, className = "" }) {
  return (
    <figure className={`flex h-full flex-col rounded-lg bg-white p-4 shadow-[0_1px_10px_rgba(9,43,43,0.08)] ring-1 ring-pine-950/5 lg:p-6 ${className}`}>
      <Stars rating={t.rating} />
      <blockquote className="mt-2 text-[13px] leading-relaxed text-black lg:text-sm">
        &ldquo;{t.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-2.5 pt-4">
        <Image
          src={t.avatar}
          alt={t.name}
          width={42}
          height={42}
          className="h-[42px] w-[42px] rounded-full object-cover"
        />
        <div>
          <p className="font-inter text-[13px] font-semibold leading-5 text-pine-950">{t.name}</p>
          <p className="text-[11px] leading-4 text-muted">{t.meta}</p>
        </div>
      </figcaption>
    </figure>
  );
}

export default function TestimonialCarousel() {
  const [index, setIndex] = useState(0);
  const count = testimonials.length;

  function goTo(next) {
    setIndex(((next % count) + count) % count);
  }

  return (
    <section aria-label="Customer testimonials" className="py-6 lg:py-10">
      <div className="mx-auto max-w-[1240px] px-4 lg:px-10">
        <SectionHeading title="Love from our community" />

        {/* Mobile / tablet slider */}
        <div className="lg:hidden">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {testimonials.map((t) => (
                <div key={t.id} className="w-full shrink-0 px-1">
                  <TestimonialCard testimonial={t} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous testimonial"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-pine-950 text-white transition-colors hover:bg-pine-900"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m14 6-6 6 6 6" />
              </svg>
            </button>
            <div className="flex items-center gap-1.5">
              {testimonials.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  aria-current={i === index}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-6 bg-pine-900" : "w-1.5 bg-pine-900/35 hover:bg-pine-900/60"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next testimonial"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-pine-950 text-white transition-colors hover:bg-pine-900"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m10 6 6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Desktop grid */}
        <div className="hidden gap-6 lg:grid lg:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  );
}