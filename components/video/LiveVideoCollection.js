"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/components/StoreProvider";
import { formatINR } from "@/lib/data";

export default function LiveVideoCollection() {
  const { catalog, catalogLoading, catalogError } = useStore();
  const [active, setActive] = useState("all");
  const [playing, setPlaying] = useState(null);

  const videos = useMemo(() => catalog.filter((p) => p.video), [catalog]);
  const fabrics = useMemo(
    () => ["all", ...new Set(videos.map((p) => p.fabric).filter(Boolean))],
    [videos]
  );
  const visible = videos.filter((p) => active === "all" || p.fabric === active);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-9 lg:px-10 lg:py-14">
      <nav aria-label="Breadcrumb" className="mb-4 text-[11px] text-muted lg:mb-6">
        <Link href="/" className="hover:text-pine-900">
          Home
        </Link>
        <span className="px-1.5">/</span>
        <span className="text-pine-900 font-medium">Video Collection</span>
      </nav>

      <h1 className="font-display text-2xl uppercase tracking-[0.12em] text-pine-950 lg:text-3xl">
        Video Collection
      </h1>
      <p className="mt-2 text-xs text-muted lg:text-sm">
        See our handcrafted sarees in motion with real video showcases before you choose.
      </p>

      {catalogError && (
        <p className="mt-5 text-sm text-red-700" role="alert">
          {catalogError}
        </p>
      )}

      {catalogLoading && <p className="mt-5 text-xs text-muted">Loading video collection…</p>}

      {fabrics.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {fabrics.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setActive(f);
                setPlaying(null);
              }}
              aria-pressed={active === f}
              className={`rounded-full border px-4 py-1.5 font-inter text-xs font-medium transition-colors ${
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

      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {visible.map((p) => (
          <article
            key={p.id}
            className="group overflow-hidden rounded-lg border border-pine-950/10 bg-white transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-chip">
              {playing === p.id ? (
                <video
                  key={p.id}
                  src={p.video}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  poster={p.image}
                  className="h-full w-full object-cover"
                />
              ) : (
                <button
                  type="button"
                  className="relative block h-full w-full"
                  aria-label={`Play ${p.name} video`}
                  onClick={() => setPlaying(p.id)}
                >
                  <Image
                    src={p.image}
                    unoptimized={/^https?:\/\//.test(p.image || "")}
                    alt={p.name}
                    fill
                    quality={100}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pine-950/75 p-3.5 text-white shadow-lg backdrop-blur-sm transition-transform group-hover:scale-110">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7L8 5Z" />
                    </svg>
                  </span>
                </button>
              )}
            </div>
            <div className="p-3">
              <Link
                href={`/product/${p.id}`}
                className="line-clamp-2 font-display text-xs text-pine-950 transition-colors hover:text-pine-900 sm:text-sm"
              >
                {p.name}
              </Link>
              <p className="mt-1 font-inter text-xs font-semibold text-pine-900 sm:text-sm">
                {formatINR(p.price)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
