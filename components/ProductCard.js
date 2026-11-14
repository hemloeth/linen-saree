"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { AddToBagButton, BuyNowButton } from "@/components/ProductActions";
import { useStore } from "@/components/StoreProvider";
import { discountPercent, formatINR } from "@/lib/data";

const HOVER_INTERVAL = 1100;

function HeartIcon({ filled = false, size = 13 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20s-7.2-4.6-9.6-9.2C1 7.4 3.6 4.5 6.9 4.5c2 0 3.9 1.1 5.1 2.8 1.2-1.7 3.1-2.8 5.1-2.8 3.3 0 5.9 2.9 4.5 6.3C19.2 15.4 12 20 12 20Z" />
    </svg>
  );
}

function BagIcon({ size = 13 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 8h12l1.2 12.2a1.5 1.5 0 0 1-1.5 1.8H6.3a1.5 1.5 0 0 1-1.5-1.8L6 8Z" />
      <path d="M9 11V6.5a3 3 0 0 1 6 0V11" />
    </svg>
  );
}

function BoltIcon({ size = 10 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      aria-hidden="true"
    >
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
    </svg>
  );
}

export default function ProductCard({ product, variant = "default" }) {
  const router = useRouter();
  const { isWished, toggleWishlist } = useStore();
  const gallery = useMemo(
    () => (product.gallery?.length ? product.gallery : [product.image]),
    [product.gallery, product.image]
  );
  const [frame, setFrame] = useState(0);
  const [isOpening, setIsOpening] = useState(false);
  const timerRef = useRef(null);
  const wished = isWished(product.id);
  const off = discountPercent(product);
  const isCompact = variant === "compact";

  // Pre-warm route bundle on hover or touch so navigation is instant
  const prefetchProduct = useCallback(() => {
    try {
      router.prefetch(`/product/${product.id}`);
    } catch {
      // safe fallback
    }
  }, [router, product.id]);

  const handleOpenProduct = useCallback(() => {
    setIsOpening(true);
  }, []);

  // Start image cycling only on desktop hover (intent-based pre-warming)
  const startCycle = useCallback(() => {
    prefetchProduct();
    if (gallery.length < 2) return;
    if (typeof window !== "undefined") {
      // Touch-only screens do not support hover intent cycling
      if (window.matchMedia && !window.matchMedia("(hover: hover)").matches) return;
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    }

    // Pre-warm next frames only when hovered
    gallery.slice(1).forEach((src) => {
      if (typeof window !== "undefined" && src) {
        const img = new window.Image();
        img.src = src;
      }
    });

    clearInterval(timerRef.current);
    let next = 0;
    timerRef.current = setInterval(() => {
      next = (next + 1) % gallery.length;
      setFrame(next);
    }, HOVER_INTERVAL);
  }, [gallery, prefetchProduct]);

  const stopCycle = useCallback(() => {
    clearInterval(timerRef.current);
    setFrame(0);
  }, []);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <article
      className={`group relative flex h-full w-full flex-col justify-between rounded-lg border border-pine-950/[0.07] bg-white shadow-[0_1px_3px_rgba(9,43,43,0.03)] transition-all duration-200 active:scale-[0.985] hover:border-pine-950/20 hover:shadow-[0_8px_22px_-8px_rgba(9,43,43,0.12)] ${
        isCompact ? "text-[11px]" : ""
      }`}
      onMouseEnter={startCycle}
      onTouchStart={prefetchProduct}
      onMouseLeave={stopCycle}
    >
      {/* ── Image Stage ── */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-lg bg-[#fbfaf8]">
        <Link
          href={`/product/${product.id}`}
          prefetch={true}
          onClick={handleOpenProduct}
          aria-label={product.name}
          className="absolute inset-0 block cursor-pointer"
        >
          {/* Base image — edge-to-edge full width with object-top */}
          {gallery[0] && (
            <span className="absolute inset-0 z-0">
              <Image
                src={gallery[0]}
                unoptimized={/^https?:\/\//.test(gallery[0] || "")}
                alt={product.name}
                fill
                quality={85}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transform-none"
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
                className={`absolute inset-0 z-10 transition-opacity duration-300 ${
                  isCurrent ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <Image
                  src={src}
                  unoptimized={/^https?:\/\//.test(src || "")}
                  alt=""
                  fill
                  quality={85}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="h-full w-full object-cover object-top motion-reduce:transform-none"
                />
              </span>
            );
          })}
        </Link>

        {/* Instant click navigation feedback */}
        {isOpening && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/50 backdrop-blur-[1.5px] transition-all animate-in fade-in duration-150 pointer-events-none">
            <span className="flex items-center gap-1.5 rounded-full bg-pine-900 px-3 py-1 font-inter text-[10px] font-semibold tracking-wide text-white shadow-md">
              <svg className="h-3 w-3 animate-spin text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Opening…
            </span>
          </div>
        )}

        {/* Desktop hover scrim + affordance */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-16 bg-gradient-to-t from-pine-950/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:block"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2 right-2 hidden translate-y-1 items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-0.5 font-inter text-[8px] font-semibold text-pine-950 opacity-0 shadow-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:flex"
        >
          View
          <svg
            width="8"
            height="8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </span>

        {/* Badge — New only (No duplicate discount badge here) */}
        {product.isNew && (
          <div className="pointer-events-none absolute left-2 top-2 z-20">
            <span className="rounded-full bg-pine-900/90 px-1.5 py-0.5 font-inter text-[8px] font-semibold tracking-wider uppercase text-white shadow-sm backdrop-blur-sm sm:text-[8.5px] sm:px-2">
              New
            </span>
          </div>
        )}

        {/* Wishlist Button */}
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
          className={`absolute right-1.5 top-1.5 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-white sm:right-2 sm:top-2 sm:h-7.5 sm:w-7.5 cursor-pointer ${
            wished ? "text-[#b42318]" : "text-pine-950/60 hover:text-pine-950"
          }`}
        >
          <HeartIcon filled={wished} size={13} />
        </button>

        {/* Sold out overlay banner */}
        {!product.inStock && (
          <span className="absolute inset-x-0 bottom-0 bg-pine-950/85 py-0.5 text-center font-inter text-[8.5px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm sm:text-[9.5px]">
            Sold out
          </span>
        )}
      </div>

      {/* ── Product Info & Actions ── */}
      <div className="flex flex-1 flex-col justify-between p-2 sm:p-2.5">
        <div>
          {/* Title: 2 lines maximum with line-clamp-2 */}
          <h3
            className="font-display text-[11.5px] font-medium leading-[1.35] text-pine-950 line-clamp-2 sm:text-[13px] lg:text-[13.5px] lg:leading-[1.38]"
            title={product.name}
          >
            <Link
              href={`/product/${product.id}`}
              prefetch={true}
              onClick={handleOpenProduct}
              className="hover:underline underline-offset-2 cursor-pointer"
            >
              {product.name}
            </Link>
          </h3>

          {/* Pricing Row */}
          <div className="mt-1 flex items-baseline gap-1.5 flex-wrap sm:mt-1.5">
            <span className="font-inter text-[12px] font-semibold text-pine-900 sm:text-[13.5px]">
              {formatINR(product.price)}
            </span>
            {product.mrp > product.price && (
              <>
                <span className="text-[9.5px] text-muted line-through sm:text-[10px]">
                  {formatINR(product.mrp)}
                </span>
                <span className="rounded bg-[#ecfdf3] px-1.5 py-[1px] font-inter text-[8px] font-bold text-[#027a48] sm:text-[8.5px]">
                  {off}% off
                </span>
              </>
            )}
          </div>
        </div>

        {/* ── Compact Action Buttons Row (One horizontal row) ── */}
        <div className="mt-2 flex items-stretch gap-1 sm:mt-2.5 sm:gap-1.5">
          {product.inStock ? (
            <>
              {/* Add to Cart — Compact icon button with loading/added feedback */}
              <AddToBagButton
                product={product}
                className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-md bg-pine-900 text-white shadow-sm transition-all duration-200 hover:bg-pine-950 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900 sm:h-[36px] sm:w-[36px]"
              >
                <BagIcon size={13} />
              </AddToBagButton>

              {/* Buy Now — Fills remaining row width */}
              <BuyNowButton
                product={product}
                className="flex h-[34px] flex-1 items-center justify-center gap-1 rounded-md border border-pine-900 bg-white font-inter text-[10px] font-semibold uppercase tracking-wider text-pine-900 shadow-sm transition-all duration-200 hover:bg-pine-900 hover:text-white active:scale-[0.98] sm:h-[36px] sm:text-[10.5px]"
              >
                <BoltIcon size={10} />
                Buy Now
              </BuyNowButton>
            </>
          ) : (
            <div className="flex h-[34px] w-full items-center justify-center rounded-md border border-pine-950/10 bg-chip font-inter text-[9.5px] font-semibold uppercase tracking-wider text-muted sm:h-[36px] sm:text-[10px]">
              Out of Stock
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
