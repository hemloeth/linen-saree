"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useStore } from "@/components/StoreProvider";
import { formatINR } from "@/lib/data";

export default function CartDrawer() {
  const { cartOpen, closeCart, items, setQty, remove, subtotal, count } = useStore();

  useEffect(() => {
    if (!cartOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [cartOpen]);

  if (!cartOpen) return null;

  const freeShippingGap = Math.max(0, 999 - subtotal);

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        aria-label="Close bag"
        onClick={closeCart}
        className="absolute inset-0 bg-pine-950/45 backdrop-blur-[1px]"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-pine-950/10 px-5 py-4">
          <h2 className="font-display text-base font-semibold uppercase tracking-[0.12em] text-pine-950">
            Your bag {count > 0 ? <span className="text-muted">({count})</span> : null}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close bag"
            className="flex h-8 w-8 items-center justify-center rounded-full text-pine-900 transition-colors hover:bg-linen"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-pine-900/40" aria-hidden="true">
              <path d="M6 8h12l1.2 12.2a1.5 1.5 0 0 1-1.5 1.8H6.3a1.5 1.5 0 0 1-1.5-1.8L6 8Z" />
              <path d="M9 11V6.5a3 3 0 0 1 6 0V11" />
            </svg>
            <p className="text-sm text-muted">Your bag is empty.</p>
            <Link
              href="/collections"
              onClick={closeCart}
              className="mt-1 inline-flex h-10 items-center rounded-md bg-pine-900 px-5 font-inter text-xs font-semibold text-white transition-colors hover:bg-pine-950"
            >
              Browse sarees
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-pine-950/10 bg-linen/60 px-5 py-2.5">
              <p className="font-inter text-[11px] text-pine-900">
                {freeShippingGap > 0 ? (
                  <>Add {formatINR(freeShippingGap)} more for free shipping</>
                ) : (
                  <>Free shipping unlocked</>
                )}
              </p>
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-pine-900/15">
                <div
                  className="h-full rounded-full bg-pine-900 transition-all"
                  style={{ width: `${Math.min(100, (subtotal / 999) * 100)}%` }}
                />
              </div>
            </div>

            <ul className="flex-1 divide-y divide-pine-950/10 overflow-y-auto px-5">
              {items.map((line) => (
                <li key={line.product.id} className="flex gap-3 py-4">
                  <Link href={`/product/${line.product.id}`} onClick={closeCart} className="relative h-24 w-20 shrink-0 overflow-hidden rounded bg-chip">
                    <Image unoptimized={/^https?:\/\//.test(line.product.image)} src={line.product.image} alt={line.product.name} fill sizes="80px" className="object-cover" />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link href={`/product/${line.product.id}`} onClick={closeCart} className="line-clamp-2 text-[13px] leading-snug text-black hover:underline">
                      {line.product.name}
                    </Link>
                    <p className="mt-0.5 text-[11px] text-muted">
                      {line.product.fabric} · {line.product.colour}
                    </p>
                    <p className="mt-1 font-inter text-[13px] font-semibold text-pine-900">
                      {formatINR(line.product.price * line.qty)}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex h-8 items-center rounded-md border border-pine-950/15">
                        <button
                          type="button"
                          onClick={() => setQty(line.product.id, line.qty - 1)}
                          aria-label={`Decrease quantity of ${line.product.name}`}
                          className="flex h-full w-8 items-center justify-center text-pine-900 transition-colors hover:bg-linen"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>
                        </button>
                        <span className="w-7 text-center font-inter text-xs tabular-nums text-pine-950">{line.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(line.product.id, line.qty + 1)}
                          aria-label={`Increase quantity of ${line.product.name}`}
                          className="flex h-full w-8 items-center justify-center text-pine-900 transition-colors hover:bg-linen"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(line.product.id)}
                        className="font-inter text-[11px] text-muted underline underline-offset-2 transition-colors hover:text-[#b42318]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-pine-950/10 px-5 py-4">
              <div className="flex items-baseline justify-between">
                <span className="font-inter text-xs uppercase tracking-wide text-muted">Subtotal</span>
                <span className="font-inter text-lg font-semibold text-pine-950">{formatINR(subtotal)}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted">Taxes included. Shipping calculated at checkout.</p>
              <Link href="/checkout" onClick={closeCart} className="mt-3 flex h-11 w-full items-center justify-center rounded-md bg-pine-900 font-inter text-[13px] font-semibold text-white transition-colors hover:bg-pine-950">Continue to checkout</Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}