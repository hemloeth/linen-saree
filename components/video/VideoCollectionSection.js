"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import productsApi, { fetchVideoProducts } from "@/lib/api/products";
import { formatINR, discountPercent } from "@/lib/data";
import { useStore } from "@/components/StoreProvider";

function getFetchVideo() {
  if (typeof fetchVideoProducts === "function") return fetchVideoProducts;
  if (typeof productsApi?.fetchVideoProducts === "function") return productsApi.fetchVideoProducts;
  return null;
}

function PlayIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7L8 5Z" />
    </svg>
  );
}

function PauseIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 19h4V5H6v14Zm8-14v14h4V5h-4Z" />
    </svg>
  );
}

function HeartIcon({ filled = false, size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20s-7.2-4.6-9.6-9.2C1 7.4 3.6 4.5 6.9 4.5c2 0 3.9 1.1 5.1 2.8 1.2-1.7 3.1-2.8 5.1-2.8 3.3 0 5.9 2.9 4.5 6.3C19.2 15.4 12 20 12 20Z" />
    </svg>
  );
}

function VideoProductCard({ product }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [nearScreen, setNearScreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [manualPause, setManualPause] = useState(false);
  const { isWished, toggleWishlist } = useStore();
  const wished = isWished(product.id);
  const off = discountPercent(product);

  // IntersectionObserver for lazy mounting (near viewport) and autoplaying (in viewport)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // 1. Observer to mount video tag before it scrolls into view (pre-loading metadata)
    const mountObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearScreen(true);
          mountObserver.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );
    mountObserver.observe(el);

    // 2. Observer for playing / pausing based on visibility
    const playbackObserver = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting && entry.intersectionRatio >= 0.4);
      },
      {
        threshold: [0, 0.4, 0.8],
      }
    );
    playbackObserver.observe(el);

    return () => {
      mountObserver.disconnect();
      playbackObserver.disconnect();
    };
  }, []);

  // Handle play/pause reacting to inView state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (inView && !manualPause && !prefersReducedMotion) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [inView, manualPause]);

  const togglePlayback = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      setManualPause(false);
      video.play().catch(() => {});
    } else {
      setManualPause(true);
      video.pause();
    }
  }, []);

  return (
    <article ref={containerRef} className="group flex flex-col bg-white">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-pine-950">
        <Link
          href={`/product/${product.id}`}
          className="absolute inset-0 z-0 block"
          aria-label={`View ${product.name}`}
        >
          {/* Always have poster image rendered */}
          <Image
            src={product.image}
            unoptimized={/^https?:\/\//.test(product.image || "")}
            alt={product.name}
            fill
            quality={100}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-opacity duration-500 ${
              isPlaying ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* Video rendered when near screen */}
          {nearScreen && product.video && (
            <video
              ref={videoRef}
              src={product.video}
              poster={product.image}
              loop
              muted
              playsInline
              preload="metadata"
              disablePictureInPicture
              disableRemotePlayback
              className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          )}
        </Link>

        {/* Badges */}
        {off > 0 && (
          <div className="pointer-events-none absolute left-2 top-2 z-10 flex flex-col items-start gap-1">
            <span className="rounded bg-[#b42318] px-1.5 py-[3px] font-inter text-[9px] font-bold text-white shadow-sm">
              {off}% OFF
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
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-white sm:h-8 sm:w-8 ${
            wished ? "text-[#b42318]" : "text-pine-950"
          }`}
        >
          <HeartIcon filled={wished} size={14} />
        </button>

        {/* Play / Pause Toggle Button */}
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={isPlaying ? "Pause video" : "Play video"}
          className="absolute bottom-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-pine-950/80 text-white shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:bg-pine-900 focus:outline-none"
        >
          {isPlaying ? <PauseIcon className="h-3.5 w-3.5" /> : <PlayIcon className="h-3.5 w-3.5 ml-0.5" />}
        </button>

        {/* Bottom subtle gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="pt-2.5">
        <Link
          href={`/product/${product.id}`}
          className="line-clamp-1 font-display text-xs text-pine-950 transition-colors hover:text-pine-900 sm:text-sm"
        >
          {product.name}
        </Link>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="font-inter text-xs font-semibold text-pine-900 sm:text-sm">
            {formatINR(product.price)}
          </span>
          {off > 0 && (
            <span className="text-[10px] text-muted line-through sm:text-xs">
              {formatINR(product.mrp)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function VideoCollectionSection() {
  const [videoProducts, setVideoProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchFn = getFetchVideo();
    if (!fetchFn) {
      Promise.resolve().then(() => {
        if (active) setLoading(false);
      });
      return;
    }
    fetchFn(8)
      .then((data) => {
        if (!active) return;
        setVideoProducts(data.products || []);
      })
      .catch((err) => {
        console.warn("Video collection products unavailable:", err?.message || err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!loading && videoProducts.length === 0) {
    return null;
  }

  return (
    <section aria-label="Video Collection" className="py-8 lg:py-14 bg-sage/30">
      <div className="mx-auto max-w-[1240px] px-4 lg:px-10">
        <div className="mb-6 flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <div>
            <SectionHeading title="Experience in Motion" />
            <p className="mt-1 text-xs text-muted lg:text-sm">
              Watch our handcrafted sarees drape and move with pure grace before you choose.
            </p>
          </div>
          <Link
            href="/video-collection"
            className="inline-flex items-center gap-1.5 rounded-full border border-pine-900/20 bg-white px-4 py-2 font-inter text-xs font-semibold text-pine-900 transition-colors hover:bg-pine-900 hover:text-white"
          >
            <span>View All Videos</span>
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-chip" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:gap-6">
            {videoProducts.map((product) => (
              <VideoProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
