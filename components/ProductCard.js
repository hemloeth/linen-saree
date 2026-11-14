"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AddToBagButton } from "@/components/ProductActions";
import Stars from "@/components/Stars";
import { useStore } from "@/components/StoreProvider";
import { discountPercent, formatINR } from "@/lib/data";

const HOVER_INTERVAL = 1100;

function HeartIcon({ filled = false, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20s-7.2-4.6-9.6-9.2C1 7.4 3.6 4.5 6.9 4.5c2 0 3.9 1.1 5.1 2.8 1.2-1.7 3.1-2.8 5.1-2.8 3.3 0 5.9 2.9 4.5 6.3C19.2 15.4 12 20 12 20Z" />
    </svg>
  );
}

function BagIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 8h12l1.2 12.2a1.5 1.5 0 0 1-1.5 1.8H6.3a1.5 1.5 0 0 1-1.5-1.8L6 8Z" />
      <path d="M9 11V6.5a3 3 0 0 1 6 0V11" />
    </svg>
  );
}

export default function ProductCard({ product }) {
  const { isWished, toggleWishlist } = useStore();
  const gallery = useMemo(
    () => (product.gallery?.length ? product.gallery : [product.image]),
    [product.gallery, product.image]
  );
  const [frame, setFrame] = useState(0);
  const timerRef = useRef(null);
  const wished = isWished(product.id);
  const off = discountPercent(product);

  // Warm the cache so the hover cross-fade never shows a blank frame.
  useEffect(() => {
    gallery.slice(1).forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
    return () => clearInterval(timerRef.current);
  }, [gallery]);

  function startCycle() {
    if (gallery.length < 2) return;
    clearInterval(timerRef.current);
    let next = 0;
    timerRef.current = setInterval(() => {
      next = (next + 1) % gallery.length;
      setFrame(next);
    }, HOVER_INTERVAL);
  }

  function stopCycle() {
    clearInterval(timerRef.current);
    setFrame(0);
  }

  return (
    <article
      className="group relative flex h-full w-[180px] shrink-0 snap-start flex-col rounded-xl border border-pine-950/[0.08] bg-white shadow-[0_1px_4px_rgba(9,43,43,0.04)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-pine-950/20 hover:shadow-[0_12px_28px_-10px_rgba(9,43,43,0.15)] sm:w-[220px] lg:w-auto lg:shrink"
      onMouseEnter={startCycle}
      onMouseLeave={stopCycle}
    >
      {/* Product Image Stage — Native 500/650 aspect ratio with object-top to never cut the model head */}
      <div
        className="relative aspect-[500/650] w-full overflow-hidden rounded-t-xl bg-chip cursor-pointer"
        onFocus={startCycle}
        onBlur={stopCycle}
      >
        <Link href={`/product/${product.id}`} aria-label={product.name} className="absolute inset-0 block cursor-pointer">
          {/* Base image anchored to top so head/pallu are always 100% visible */}
          {gallery[0] && (
            <span className="absolute inset-0 z-0">
              <Image
                src={gallery[0]}
                unoptimized={/^https?:\/\//.test(gallery[0] || "")}
                alt={product.name}
                fill
                quality={100}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover object-top transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:scale-100! motion-reduce:transition-none!"
              />
            </span>
          )}

          {/* Additional frames layered on top with smooth cross-fade */}
          {gallery.slice(1).map((src, idx) => {
            const frameIndex = idx + 1;
            const isCurrent = frame === frameIndex;
            return (
              <span
                key={src + frameIndex}
                aria-hidden={!isCurrent}
                className={`absolute inset-0 z-10 transition-opacity duration-400 ${
                  isCurrent ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <Image
                  src={src}
                  unoptimized={/^https?:\/\//.test(src || "")}
                  alt=""
                  fill
                  quality={100}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover object-top transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:scale-100! motion-reduce:transition-none!"
                />
              </span>
            );
          })}
        </Link>

        {/* Hover scrim + view affordance */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-20 bg-gradient-to-t from-pine-950/45 to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100 lg:block"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2.5 right-2.5 hidden translate-y-1.5 items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 font-inter text-[9px] font-semibold text-pine-950 opacity-0 shadow-sm transition-all duration-400 ease-out group-hover:translate-y-0 group-hover:opacity-100 lg:flex"
        >
          View
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </span>

        {/* Refined clean badges */}
        <div className="pointer-events-none absolute left-2.5 top-2.5 z-20 flex flex-col items-start gap-1">
          {off > 0 ? (
            <span className="rounded-full bg-white/95 px-2 py-0.5 font-inter text-[8.5px] font-bold tracking-wider uppercase text-[#b42318] shadow-sm backdrop-blur-sm border border-[#b42318]/15">
              {off}% OFF
            </span>
          ) : null}
          {product.isNew ? (
            <span className="rounded-full bg-pine-900/95 px-2 py-0.5 font-inter text-[8.5px] font-semibold tracking-wider uppercase text-white shadow-sm backdrop-blur-sm">
              New
            </span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-pressed={wished}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className={`absolute right-2.5 top-2.5 z-20 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-white ${
            wished ? "text-[#b42318]" : "text-pine-950/70 hover:text-pine-950"
          }`}
        >
          <HeartIcon filled={wished} size={14} />
        </button>

        {!product.inStock ? (
          <span className="absolute inset-x-0 bottom-0 bg-pine-950/85 py-0.5 text-center font-inter text-[9.5px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            Sold out
          </span>
        ) : null}
      </div>

      {/* Product Details Area */}
      <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-3">
        {/* Top: Category, Rating & Title */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-1">
            <span className="font-inter text-[9.5px] font-medium uppercase tracking-[0.1em] text-muted">
              {product.category || product.fabric || "Handwoven Saree"}
            </span>
            <Stars rating={product.rating} reviews={product.reviews} />
          </div>

          {/* Full Product Name without clipping */}
          <h3
            className="mt-1.5 min-h-[2.6rem] font-display text-[13px] font-medium leading-[1.38] text-pine-950 transition-colors duration-200 group-hover:text-pine-800 sm:min-h-[2.85rem] sm:text-[14px]"
            title={product.name}
          >
            <Link href={`/product/${product.id}`} className="hover:underline underline-offset-2 cursor-pointer">
              {product.name}
            </Link>
          </h3>
        </div>

        {/* Bottom Pinned Block: Price & Add to Bag */}
        <div className="mt-auto pt-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="font-inter text-[13.5px] font-semibold text-pine-900 sm:text-sm">
              {formatINR(product.price)}
            </span>
            {product.mrp > product.price && (
              <>
                <span className="text-[10px] text-muted line-through">
                  {formatINR(product.mrp)}
                </span>
                <span className="ml-auto rounded bg-[#ecfdf3] px-1.5 py-0.5 font-inter text-[9px] font-bold text-[#027a48]">
                  {off}% off
                </span>
              </>
            )}
          </div>

          <AddToBagButton
            product={product}
            className="mt-2 flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md bg-pine-900 font-inter text-[11px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-pine-950 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900 sm:h-8.5"
          >
            <BagIcon size={12} />
            Add to bag
          </AddToBagButton>
        </div>
      </div>
    </article>
  );
}
