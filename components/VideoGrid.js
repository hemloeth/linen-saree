"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatINR, reels } from "@/lib/data";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "silk", label: "Silk" },
  { key: "banarasi", label: "Banarasi" },
  { key: "handloom", label: "Handloom" },
  { key: "linen", label: "Linen" },
  { key: "cotton", label: "Cotton" },
];

// The Figma source contains reel stills, not video files — each card is tagged by its weave.
const TAGS = ["silk", "banarasi", "handloom", "linen", "cotton"];

export default function VideoGrid() {
  const [filter, setFilter] = useState("all");

  const items = useMemo(() => {
    const tagged = reels.map((reel, index) => ({
      ...reel,
      tag: TAGS[index % TAGS.length],
    }));
    return filter === "all" ? tagged : tagged.filter((reel) => reel.tag === filter);
  }, [filter]);

  return (
    <div className="overflow-hidden lg:overflow-visible">
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
        {FILTERS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setFilter(option.key)}
            aria-pressed={filter === option.key}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 font-inter text-[11px] font-medium transition-colors ${
              filter === option.key
                ? "border-pine-900 bg-pine-900 text-white"
                : "border-pine-950/20 text-pine-900 hover:border-pine-900 hover:bg-linen"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-pine-950/20 px-6 py-12 text-center text-sm text-muted">
          No reels in this weave yet.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {items.map((reel) => (
            <article key={`${reel.id}-${reel.tag}`} className="group">
              <Link
                href={reel.href}
                className="relative block aspect-[3/4] overflow-hidden rounded-lg bg-pine-950"
              >
                <Image
                  src={reel.image}
                  alt={reel.caption}
                  fill
                  sizes="(max-width: 640px) 45vw, 24vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent px-2.5 pb-2.5 pt-8">
                  <span className="line-clamp-2 block text-[10px] leading-tight text-white lg:text-[11px]">
                    {reel.caption}
                  </span>
                  <span className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-inter text-[11px] font-semibold text-white">{formatINR(reel.price)}</span>
                    <span className="text-[9px] text-white/70 line-through">{formatINR(reel.mrp)}</span>
                  </span>
                </span>
                <span className="absolute left-2 top-2 rounded bg-pine-950/70 px-1.5 py-[3px] font-inter text-[9px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                  {reel.tag}
                </span>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}