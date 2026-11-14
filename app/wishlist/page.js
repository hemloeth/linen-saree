"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/components/StoreProvider";


export default function WishlistPage() {
  const { wishlist, catalog: products } = useStore();
  const saved = products.filter((product) => wishlist.includes(String(product.id)));

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[1240px] px-4 py-8 lg:px-10 lg:py-12">
          <div className="mb-6 lg:mb-8">
            <h1 className="font-display text-xl font-medium uppercase tracking-[0.16em] text-pine-950 sm:text-2xl">
              Your wishlist
            </h1>
            <p className="mt-1 text-xs text-muted">
              {saved.length === 0
                ? "Nothing saved yet."
                : `${saved.length} piece${saved.length === 1 ? "" : "s"} saved`}
            </p>
            <span aria-hidden="true" className="mt-3 block h-px w-16 bg-pine-950/40" />
          </div>

          {saved.length === 0 ? (
            <div className="rounded-lg border border-dashed border-pine-950/20 px-6 py-14 text-center">
              <p className="text-sm text-muted">
                Tap the heart on any saree to keep it here.
              </p>
              <Link
                href="/collections"
                className="mt-4 inline-flex h-10 items-center rounded-md bg-pine-900 px-5 font-inter text-xs font-semibold text-white transition-colors hover:bg-pine-950"
              >
                Browse sarees
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {saved.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}