"use client";

import Link from "next/link";
import { useStore } from "@/components/StoreProvider";

export default function WishlistButton() {
  const { wishlist } = useStore();

  return (
    <Link
      href="/wishlist"
      aria-label={wishlist.length ? `Wishlist, ${wishlist.length} item${wishlist.length === 1 ? "" : "s"}` : "Wishlist, empty"}
      className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-pine-800 shadow-sm transition-colors hover:bg-linen"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20s-7.2-4.6-9.6-9.2C1 7.4 3.6 4.5 6.9 4.5c2 0 3.9 1.1 5.1 2.8 1.2-1.7 3.1-2.8 5.1-2.8 3.3 0 5.9 2.9 4.5 6.3C19.2 15.4 12 20 12 20Z" />
      </svg>
      {wishlist.length > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-pine-900 px-1 font-inter text-[9px] font-semibold text-white">
          {wishlist.length}
        </span>
      ) : null}
    </Link>
  );
}