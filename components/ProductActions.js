"use client";
import { useRouter } from "next/navigation";
import { useStore } from "@/components/StoreProvider";

export function AddToBagButton({ product, className = "", children }) {
  const { add } = useStore();
  return (
    <button
      type="button"
      disabled={!product.inStock}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        add(product);
      }}
      aria-label={`Add ${product.name} to bag`}
      className={`cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children ?? "Add to bag"}
    </button>
  );
}

export function BuyNowButton({ product, className = "", children }) {
  const router = useRouter();
  const { add, closeCart } = useStore();
  return (
    <button
      type="button"
      disabled={!product.inStock}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        add(product, 1);
        closeCart();
        router.push("/checkout");
      }}
      aria-label={`Buy ${product.name} now`}
      className={`cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children ?? "Buy now"}
    </button>
  );
}
