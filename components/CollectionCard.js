"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";

function getCardId(href, name) {
  const raw = href || name || "";
  const clean = String(raw).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `collection-card-${clean || "item"}`;
}

export default function CollectionCard({ name, image, href = "/collections", sizes = "(max-width: 640px) 45vw, 220px", eager = false }) {
  const cardId = getCardId(href, name);

  const handleClick = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("hoq_last_clicked_target_id", cardId);
        sessionStorage.setItem(`hoq_scroll_pos_${window.location.pathname}`, String(window.scrollY));
      } catch {
        /* ignore */
      }
    }
  }, [cardId]);

  return (
    <Link
      id={cardId}
      href={href}
      onClick={handleClick}
      className="group flex flex-col items-center cursor-pointer scroll-mt-24 transition-transform active:scale-[0.98]"
    >
      <div className="relative aspect-[180/208] w-full overflow-hidden rounded-t-full bg-cream-card">
        <Image
          src={image}
          unoptimized={/^https?:\/\//.test(image || "")}
          alt={name}
          fill
          loading={eager ? "eager" : "lazy"}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <p className="mt-2 text-center font-inter text-[13px] font-medium text-pine-900 group-hover:underline">
        {name}
      </p>
    </Link>
  );
}
