"use client";

import { useStore } from "@/components/StoreProvider";

export default function BagButton() {
  const { count, openCart } = useStore();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={count ? `Bag, ${count} item${count === 1 ? "" : "s"}` : "Bag, empty"}
      className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-pine-800 shadow-sm transition-colors hover:bg-linen"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 8h12l1.2 12.2a1.5 1.5 0 0 1-1.5 1.8H6.3a1.5 1.5 0 0 1-1.5-1.8L6 8Z" />
        <path d="M9 11V6.5a3 3 0 0 1 6 0V11" />
      </svg>
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-pine-900 px-1 font-inter text-[9px] font-semibold text-white">
          {count}
        </span>
      ) : null}
    </button>
  );
}