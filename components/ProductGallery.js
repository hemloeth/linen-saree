"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

function Chevron({ direction }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {direction === "left" ? <path d="m14 6-6 6 6 6" /> : <path d="m10 6 6 6-6 6" />}
    </svg>
  );
}

function PlayIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7L8 5Z" />
    </svg>
  );
}

/**
 * Product gallery with Image & Video media support.
 * Desktop: vertical thumbnail rail + large stage with video playback.
 * Mobile: swipeable stage with full thumbnail strip underneath for instant switching.
 */
export default function ProductGallery({ images = [], index = 0, onSelect, sizes = "(max-width: 1024px) 100vw, 45vw" }) {
  const trackRef = useRef(null);
  const thumbTrackRef = useRef(null);
  const lockRef = useRef(0);
  const settleRef = useRef(null);
  const count = images.length;
  const active = images[Math.min(index, count - 1)] || images[0];

  // Keep the mobile track aligned when the index changes
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const target = index * track.clientWidth;
    if (Math.abs(track.scrollLeft - target) > 4) {
      lockRef.current = Date.now() + 700;
      track.scrollTo({ left: target, behavior: "smooth" });
    }
  }, [index]);

  // Keep active mobile thumbnail centered in viewport
  useEffect(() => {
    const thumbTrack = thumbTrackRef.current;
    if (!thumbTrack) return;
    const activeThumb = thumbTrack.children[index];
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [index]);

  useEffect(() => () => clearTimeout(settleRef.current), []);

  function handleScroll() {
    if (Date.now() < lockRef.current) return;
    clearTimeout(settleRef.current);
    settleRef.current = setTimeout(() => {
      const track = trackRef.current;
      if (!track) return;
      const next = Math.round(track.scrollLeft / track.clientWidth);
      if (next !== index && next >= 0 && next < count) onSelect(next);
    }, 120);
  }

  function goTo(next) {
    lockRef.current = Date.now() + 700;
    onSelect(next);
    const track = trackRef.current;
    if (track) {
      const target = next * track.clientWidth;
      track.scrollTo({ left: target, behavior: "smooth" });
    }
  }

  function step(direction) {
    goTo((index + direction + count) % count);
  }

  if (!count || !active) return null;

  return (
    <div className="lg:flex lg:items-start lg:gap-4">
      {/* Desktop vertical thumbnail rail */}
      <div
        className="no-scrollbar hidden lg:flex lg:max-h-[calc(100vh-3rem)] lg:w-20 lg:shrink-0 lg:flex-col lg:gap-2 lg:overflow-y-auto"
        role="tablist"
        aria-label="Product media"
      >
        {images.map((item, i) => {
          const isVideo = item.type === "video";
          const thumbSrc = item.poster || (!isVideo && item.src && !/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(item.src) ? item.src : "");

          return (
            <button
              key={(item.src || "") + i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`View ${isVideo ? "video" : `photo ${i + 1}`}: ${item.label || ""}`}
              onClick={() => onSelect(i)}
              className={`relative aspect-[3/4] w-full overflow-hidden rounded ring-2 transition cursor-pointer ${
                i === index ? "ring-pine-900" : "ring-transparent hover:ring-pine-900/30"
              }`}
            >
              {thumbSrc ? (
                <Image
                  unoptimized={/^https?:\/\//.test(thumbSrc)}
                  src={thumbSrc}
                  alt=""
                  fill
                  quality={90}
                  sizes="80px"
                  className="object-cover object-top"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-pine-950/5 text-pine-900">
                  <PlayIcon className="h-4 w-4" />
                  <span className="mt-1 font-inter text-[9px] font-bold tracking-wider">VIDEO</span>
                </div>
              )}

              {isVideo && thumbSrc && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/35 text-white">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pine-900/90 text-white shadow-sm">
                    <PlayIcon className="h-3 w-3 ml-0.5" />
                  </span>
                  <span className="mt-1 font-inter text-[8px] font-bold uppercase tracking-wider">
                    Video
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="min-w-0 flex-1">
        {/* Desktop stage */}
        <div className="relative hidden aspect-[3/4] w-full overflow-hidden rounded-lg bg-[#fbfaf8] lg:block">
          {active.type === "video" ? (
            <div className="h-full w-full bg-black">
              <video
                key={active.src}
                src={active.src}
                poster={active.poster}
                controls
                autoPlay
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <Image
              key={active.src}
              src={active.src}
              unoptimized={/^https?:\/\//.test(active.src)}
              alt={active.alt || "Product image"}
              fill
              quality={90}
              preload
              sizes={sizes}
              className="object-cover object-top"
            />
          )}

          {count > 1 && (
            <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-3 pointer-events-none">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous media"
                className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-pine-950 shadow transition-colors hover:bg-white cursor-pointer"
              >
                <Chevron direction="left" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next media"
                className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-pine-950 shadow transition-colors hover:bg-white cursor-pointer"
              >
                <Chevron direction="right" />
              </button>
            </div>
          )}

          <p className="absolute bottom-3 right-3 rounded-full bg-pine-950/70 px-2.5 py-1 font-inter text-[11px] tabular-nums text-white backdrop-blur-sm">
            {index + 1} / {count}
          </p>
        </div>

        {/* Mobile swipe stage */}
        <div className="lg:hidden">
          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-lg bg-[#fbfaf8]"
            aria-label="Product media — swipe to browse"
          >
            {images.map((item, i) => {
              const isVideo = item.type === "video";
              return (
                <div key={(item.src || "") + i} className="relative aspect-[3/4] w-full shrink-0 snap-center snap-always bg-[#fbfaf8]">
                  {isVideo ? (
                    <div className="h-full w-full bg-black">
                      <video
                        src={item.src}
                        poster={item.poster}
                        controls
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <Image
                      src={item.src}
                      unoptimized={/^https?:\/\//.test(item.src)}
                      alt={item.alt || ""}
                      fill
                      quality={90}
                      preload={i === 0}
                      sizes="100vw"
                      className="h-full w-full object-cover object-top"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Thumbnail Carousel / Rail below the big image */}
          {count > 1 && (
            <div className="mt-3">
              <div
                ref={thumbTrackRef}
                className="no-scrollbar flex items-center gap-2 overflow-x-auto scroll-smooth py-1 px-1"
                role="tablist"
                aria-label="Product media thumbnails"
              >
                {images.map((item, i) => {
                  const isVideo = item.type === "video";
                  const thumbSrc =
                    item.poster ||
                    (!isVideo && item.src && !/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(item.src) ? item.src : "");
                  const isSelected = i === index;

                  return (
                    <button
                      key={"mobile-thumb-" + (item.src || "") + i}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      aria-label={`View ${isVideo ? "video" : `photo ${i + 1}`}`}
                      onClick={() => goTo(i)}
                      className={`relative aspect-[3/4] w-[62px] shrink-0 overflow-hidden rounded-md border-2 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-pine-900 ring-2 ring-pine-900/30 scale-[1.04] shadow-md z-10"
                          : "border-pine-950/15 opacity-70 hover:opacity-100 hover:border-pine-950/40"
                      }`}
                    >
                      {thumbSrc ? (
                        <Image
                          unoptimized={/^https?:\/\//.test(thumbSrc)}
                          src={thumbSrc}
                          alt=""
                          fill
                          sizes="65px"
                          className="object-cover object-top"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-pine-950/10 text-pine-900">
                          <PlayIcon className="h-4 w-4" />
                          <span className="mt-0.5 font-inter text-[8px] font-bold">VIDEO</span>
                        </div>
                      )}

                      {isVideo && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pine-900/90 text-white shadow">
                            <PlayIcon className="h-2.5 w-2.5 ml-0.5" />
                          </span>
                          <span className="mt-0.5 font-inter text-[7.5px] font-bold uppercase tracking-wider">
                            Video
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Progress counter + swipe hint */}
              <div className="mt-2 flex items-center justify-between px-1">
                <span className="font-inter text-[11px] text-muted">
                  Tap thumbnail or swipe image
                </span>
                <span className="font-inter text-[11px] font-semibold tabular-nums text-pine-900">
                  {index + 1} / {count}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
