"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { AddToBagButton, BuyNowButton } from "@/components/ProductActions";
import { useStore } from "@/components/StoreProvider";
import { discountPercent, formatINR } from "@/lib/data";

const HOVER_INTERVAL = 1100;

/* ───── Inline SVG icons ───── */

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

function BoltIcon({ size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
    </svg>
  );
}

/* ───── Touch-device detection ───── */
function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch(
      typeof window !== "undefined" &&
        ("ontouchstart" in window || navigator.maxTouchPoints > 0)
    );
  }, []);
  return isTouch;
}

/* ───── Main ProductCard component ───── */

export default function ProductCard({ product, variant = "default" }) {
  const { isWished, toggleWishlist } = useStore();
  const gallery = useMemo(
    () => (product.gallery?.length ? product.gallery : [product.image]),
    [product.gallery, product.image]
  );
  const [frame, setFrame] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const timerRef = useRef(null);
  const wished = isWished(product.id);
  const off = discountPercent(product);
  const isTouch = useIsTouchDevice();
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      prefersReducedMotion.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
    }
  }, []);

  // Pre-warm hover images (desktop only)
  useEffect(() => {
    if (isTouch || prefersReducedMotion.current) return;
    gallery.slice(1).forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
    return () => clearInterval(timerRef.current);
  }, [gallery, isTouch]);

  const startCycle = useCallback(() => {
    if (gallery.length < 2 || isTouch || prefersReducedMotion.current) return;
    clearInterval(timerRef.current);
    let next = 0;
    timerRef.current = setInterval(() => {
      next = (next + 1) % gallery.length;
      setFrame(next);
    }, HOVER_INTERVAL);
  }, [gallery, isTouch]);

  const stopCycle = useCallback(() => {
    clearInterval(timerRef.current);
    setFrame(0);
  }, []);

  const isCompact = variant === "compact";

  return (
    <article
      className={`group relative flex h-full w-full flex-col rounded-lg border border-pine-950/[0.06] bg-white shadow-[0_1px_3px_rgba(9,43,43,0.03)] transition-shadow duration-300 hover:shadow-[0_6px_20px_-8px_rgba(9,43,43,0.12)] hover:border-pine-950/15 ${
        isCompact ? "" : ""
      }`}
      onMouseEnter={startCycle}
      onMouseLeave={stopCycle}
    >
      {/* ── Image Stage ── */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-lg bg-chip">
        <Link
          href={`/product/${product.id}`}
          aria-label={product.name}
          className="absolute inset-0 block"
        >
          {/* Base image — object-contain so full product is always visible */}
          {gallery[0] && (
            <span className="absolute inset-0 z-0">
              <Image
                src={gallery[0]}
                unoptimized={/^https?:\/\//.test(gallery[0] || "")}
                alt={product.name}
                fill
                quality={85}
                sizes="(max-width: 640px) 48vw, (max-width: 1024px) 33vw, 25vw"
                onLoad={() => setImgLoaded(true)}
                className={`object-contain transition-opacity duration-300 ${
                  imgLoaded ? "opacity-100" : "opacity-0"
                } motion-reduce:transition-none`}
              />
            </span>
          )}

          {/* Loading skeleton */}
          {!imgLoaded && (
            <span
              className="absolute inset-0 animate-pulse bg-chip"
              aria-hidden="true"
            />
          )}

          {/* Hover gallery frames (desktop only) */}
          {gallery.slice(1).map((src, idx) => {
            const frameIndex = idx + 1;
            const isCurrent = frame === frameIndex;
            return (
              <span
                key={src + frameIndex}
                aria-hidden={!isCurrent}
                className={`absolute inset-0 z-10 transition-opacity duration-400 ${
                  isCurrent
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                }`}
              >
                <Image
                  src={src}
                  unoptimized={/^https?:\/\//.test(src || "")}
                  alt=""
                  fill
                  quality={85}
                  sizes="(max-width: 640px) 48vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-contain motion-reduce:transition-none"
                />
              </span>
            );
          })}
        </Link>

        {/* Desktop hover scrim */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-16 bg-gradient-to-t from-pine-950/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:block"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2 right-2 hidden translate-y-1 items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-0.5 font-inter text-[8px] font-semibold text-pine-950 opacity-0 shadow-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:flex"
        >
          View
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </span>

        {/* Badges — top-left */}
        <div className="pointer-events-none absolute left-1.5 top-1.5 z-20 flex flex-col items-start gap-0.5 sm:left-2 sm:top-2 sm:gap-1">
          {off > 0 && (
            <span className="rounded-full bg-white/95 px-1.5 py-[1px] font-inter text-[7.5px] font-bold tracking-wider uppercase text-[#b42318] shadow-sm backdrop-blur-sm border border-[#b42318]/15 sm:text-[8.5px] sm:px-2 sm:py-0.5">
              {off}% OFF
            </span>
          )}
          {product.isNew && (
            <span className="rounded-full bg-pine-900/95 px-1.5 py-[1px] font-inter text-[7.5px] font-semibold tracking-wider uppercase text-white shadow-sm backdrop-blur-sm sm:text-[8.5px] sm:px-2 sm:py-0.5">
              New
            </span>
          )}
        </div>

        {/* Wishlist — top-right */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-pressed={wished}
          aria-label={
            wished
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          className={`absolute right-1.5 top-1.5 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-white sm:right-2 sm:top-2 ${
            wished
              ? "text-[#b42318]"
              : "text-pine-950/60 hover:text-pine-950"
          }`}
        >
          <HeartIcon filled={wished} size={13} />
        </button>

        {/* Sold out overlay */}
        {!product.inStock && (
          <span className="absolute inset-x-0 bottom-0 bg-pine-950/85 py-0.5 text-center font-inter text-[8px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm sm:text-[9px]">
            Sold out
          </span>
        )}
      </div>

      {/* ── Product Info ── */}
      <div className="flex flex-1 flex-col justify-between px-2 pt-2 pb-2 sm:px-2.5 sm:pt-2.5 sm:pb-2.5">
        {/* Title — 2 line clamp */}
        <h3
          className="font-display text-[11px] font-medium leading-[1.35] text-pine-950 line-clamp-2 sm:text-[12.5px] lg:text-[13.5px] lg:leading-[1.38]"
          title={product.name}
        >
          <Link
            href={`/product/${product.id}`}
            className="hover:underline underline-offset-2"
          >
            {product.name}
          </Link>
        </h3>

        {/* Price row */}
        <div className="mt-1 flex items-baseline gap-1 flex-wrap sm:mt-1.5">
          <span className="font-inter text-[12px] font-semibold text-pine-900 sm:text-[13px]">
            {formatINR(product.price)}
          </span>
          {product.mrp > product.price && (
            <>
              <span className="text-[9px] text-muted line-through sm:text-[10px]">
                {formatINR(product.mrp)}
              </span>
              <span className="rounded bg-[#ecfdf3] px-1 py-[1px] font-inter text-[7.5px] font-bold text-[#027a48] sm:text-[8.5px] sm:px-1.5">
                {off}% off
              </span>
            </>
          )}
        </div>

        {/* ── Action buttons row ── */}
        <div className="mt-1.5 flex items-stretch gap-1 sm:mt-2 sm:gap-1.5">
          {product.inStock ? (
            <>
              {/* Add to Cart — icon-only button */}
              <AddToBagButton
                product={product}
                className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-md bg-pine-900 text-white shadow-sm transition-all duration-200 hover:bg-pine-950 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900 sm:h-[36px] sm:w-[36px]"
              >
                <BagIcon size={13} />
              </AddToBagButton>

              {/* Buy Now — fills remaining width */}
              <BuyNowButton
                product={product}
                className="flex h-[34px] flex-1 items-center justify-center gap-1 rounded-md border border-pine-900 bg-white font-inter text-[10px] font-semibold uppercase tracking-wider text-pine-900 shadow-sm transition-all duration-200 hover:bg-pine-900 hover:text-white active:scale-[0.98] sm:h-[36px] sm:text-[10.5px]"
              >
                <BoltIcon size={10} />
                Buy Now
              </BuyNowButton>
            </>
          ) : (
            <div className="flex h-[34px] w-full items-center justify-center rounded-md border border-pine-950/15 bg-chip font-inter text-[9px] font-semibold uppercase tracking-wider text-muted sm:h-[36px] sm:text-[10px]">
              Out of Stock
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
