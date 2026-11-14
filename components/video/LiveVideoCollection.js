"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/components/StoreProvider";
import { formatINR, discountPercent } from "@/lib/data";
import { useVideoCoordinator } from "@/components/video/useVideoCoordinator";

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

/**
 * Coordinated Video Card for Live Collection Page
 */
function LiveVideoCard({ product, isPlaying, registerCard, unregisterCard, onTogglePlay }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const { isWished, toggleWishlist } = useStore();
  const wished = isWished(product.id);
  const off = discountPercent(product);

  useEffect(() => {
    const el = containerRef.current;
    const vid = videoRef.current;
    if (!el) return;

    registerCard(product.id, el, vid);

    return () => {
      unregisterCard(product.id);
    };
  }, [product.id, registerCard, unregisterCard]);

  return (
    <article
      id={`video-card-${product.id}`}
      ref={containerRef}
      className="group relative aspect-[9/16] w-full overflow-hidden rounded-lg bg-pine-950 shadow-md ring-1 ring-black/10 transition-all duration-300 hover:shadow-2xl"
    >
      <Link
        href={`/product/${product.id}?media=video`}
        onClick={() => {
          try {
            sessionStorage.setItem(`hoq_scroll_pos_${window.location.pathname}`, String(window.scrollY));
            sessionStorage.setItem("hoq_last_clicked_target_id", `video-card-${product.id}`);
            sessionStorage.setItem("hoq_last_clicked_product_id", String(product.id));
          } catch {}
        }}
        className="absolute inset-0 z-0 block"
        aria-label={`View ${product.name} video`}
      >
        {/* Poster image always present */}
        <Image
          src={product.image}
          unoptimized={/^https?:\/\//.test(product.image || "")}
          alt={product.name}
          fill
          quality={100}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover object-top transition-all duration-500 ease-out group-hover:scale-105 ${
            isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        />

        {/* Video always mounted, coordinated playback */}
        {product.video && (
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
            className={`h-full w-full object-cover object-top transition-opacity duration-300 group-hover:scale-105 ${
              isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />
        )}

        {/* Full-card bottom gradient overlay - price only */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent pb-3.5 pt-16 px-3 sm:px-4 text-white">
          <div className="flex items-baseline gap-2">
            <span className="font-inter text-sm sm:text-base font-bold text-white tracking-tight drop-shadow-sm">
              {formatINR(product.price)}
            </span>
            {off > 0 && (
              <span className="text-[11px] text-white/70 line-through sm:text-xs">
                {formatINR(product.mrp)}
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-cream/95 sm:text-[11px]">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-tomato text-white shadow-xs">
              <PlayIcon className="h-2.5 w-2.5 ml-0.5" />
            </span>
            <span>Watch in full video &rarr;</span>
          </div>
        </div>
      </Link>

      {/* Badges */}
      {off > 0 && (
        <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex flex-col items-start gap-1">
          <span className="rounded bg-tomato px-1.5 py-[3px] font-inter text-[9px] font-bold text-white shadow-sm">
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
        className={`absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white shadow-sm backdrop-blur-md transition-all hover:scale-110 hover:bg-black/60 cursor-pointer sm:h-8 sm:w-8 ${
          wished ? "text-tomato" : "text-white"
        }`}
      >
        <HeartIcon filled={wished} size={14} />
      </button>

      {/* Play / Pause Toggle Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onTogglePlay(product.id);
        }}
        aria-label={isPlaying ? "Pause video" : "Play video"}
        className="absolute bottom-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white shadow-md backdrop-blur-md transition-all hover:scale-110 hover:bg-pine-900 focus:outline-none cursor-pointer sm:h-8 sm:w-8"
      >
        {isPlaying ? (
          <PauseIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        ) : (
          <PlayIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 ml-0.5" />
        )}
      </button>
    </article>
  );
}

export default function LiveVideoCollection() {
  const { catalog, catalogLoading, catalogError } = useStore();
  const [active, setActive] = useState("all");

  const { registerCard, unregisterCard, togglePlay, playingIds } = useVideoCoordinator();

  const videos = useMemo(() => catalog.filter((p) => p.video), [catalog]);
  const fabrics = useMemo(
    () => ["all", ...new Set(videos.map((p) => p.fabric).filter(Boolean))],
    [videos]
  );
  const visible = videos.filter((p) => active === "all" || p.fabric === active);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 lg:px-10 lg:py-14">
      <nav aria-label="Breadcrumb" className="mb-4 text-[11px] text-muted lg:mb-6">
        <Link href="/" className="hover:text-pine-900">
          Home
        </Link>
        <span className="px-1.5">/</span>
        <span className="text-pine-900 font-medium">Video Collection</span>
      </nav>

      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-[0.12em] text-pine-950 lg:text-3xl">
            Video Collection
          </h1>
          <p className="mt-1 text-xs text-muted lg:text-sm">
            Experience our handcrafted sarees in authentic motion with real video showcases before you choose.
          </p>
        </div>
        <span className="font-inter text-xs font-semibold text-pine-900">
          {visible.length} {visible.length === 1 ? "Video" : "Videos"}
        </span>
      </div>

      {catalogError && (
        <p className="mt-5 text-sm text-red-700" role="alert">
          {catalogError}
        </p>
      )}

      {catalogLoading && (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[9/16] animate-pulse rounded-lg bg-chip" />
          ))}
        </div>
      )}

      {fabrics.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {fabrics.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActive(f)}
              aria-pressed={active === f}
              className={`rounded-full border px-4 py-1.5 font-inter text-xs font-medium transition-colors cursor-pointer ${
                active === f
                  ? "border-pine-900 bg-pine-900 text-white"
                  : "border-pine-950/20 text-pine-900 hover:border-pine-900 hover:bg-linen"
              }`}
            >
              {f === "all" ? "All Fabrics" : f}
            </button>
          ))}
        </div>
      )}

      {!catalogLoading && !visible.length && (
        <p className="mt-10 text-sm text-muted">No product videos are available yet.</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {visible.map((p) => (
          <LiveVideoCard
            key={p.id}
            product={p}
            isPlaying={playingIds.has(String(p.id))}
            registerCard={registerCard}
            unregisterCard={unregisterCard}
            onTogglePlay={togglePlay}
          />
        ))}
      </div>
    </div>
  );
}
