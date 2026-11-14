"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/components/StoreProvider";

function CheckIcon({ size = 13 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function AddToBagButton({ product, className = "", children }) {
  const { add } = useStore();
  const [justAdded, setJustAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product?.inStock || loading) return;
    setLoading(true);
    try {
      const res = await add(product);
      if (res?.success) {
        setJustAdded(true);
        setTimeout(() => {
          setJustAdded(false);
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={!product?.inStock || loading}
      onClick={handleClick}
      aria-label={justAdded ? `Added ${product?.name} to bag` : `Add ${product?.name} to bag`}
      aria-live="polite"
      className={`inline-flex items-center justify-center text-center select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {justAdded ? (
        <span className="flex items-center justify-center gap-1 font-semibold animate-in fade-in zoom-in-75 duration-200">
          <CheckIcon size={14} /> Added
        </span>
      ) : loading ? (
        "Adding…"
      ) : (
        (children ?? "Add to bag")
      )}
    </button>
  );
}

export function BuyNowButton({ product, className = "", children }) {
  const router = useRouter();
  const { add, closeCart } = useStore();
  const [navigating, setNavigating] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product?.inStock || navigating) return;
    setNavigating(true);
    try {
      const res = await add(product, 1);
      if (res && res.success) {
        closeCart();
        router.push("/checkout");
      } else {
        setNavigating(false);
      }
    } catch {
      setNavigating(false);
    }
  };

  return (
    <button
      type="button"
      disabled={!product?.inStock || navigating}
      onClick={handleClick}
      aria-label={`Buy ${product?.name} now`}
      className={`inline-flex items-center justify-center text-center select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {navigating ? "Processing…" : (children ?? "Buy now")}
    </button>
  );
}
