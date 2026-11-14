"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { announcementPoints, announcementText } from "@/lib/data";

const STORAGE_KEY = "hoq_announcement_dismissed";

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        setDismissed(window.localStorage.getItem(STORAGE_KEY) === "1");
      } catch {
        /* storage unavailable — keep the bar visible */
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  if (dismissed) return null;

  return (
    <div className="relative bg-pine-950 text-white">
      <div className="mx-auto flex max-w-[1240px] items-center justify-center gap-3 px-8 py-1.5 lg:px-10">
        <p className="text-center font-inter text-[11px] leading-4 tracking-wide">
          <span className="hidden sm:inline">
            {announcementPoints[0]}
            <span aria-hidden="true" className="px-2 text-white/40">|</span>
          </span>
          {announcementPoints[1]}
          <span aria-hidden="true" className="px-2 text-white/40">|</span>
          <Link href="/collections" className="underline underline-offset-2 hover:text-aqua">
            {announcementText.split("More information here.")[0].trim()}
            More information here.
          </Link>
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-2 top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
}