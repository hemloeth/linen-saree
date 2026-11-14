"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/components/StoreProvider";
import ProductCard from "@/components/ProductCard";

function normalizeSlug(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function FilteredProducts({ kind, value }) {
  const { catalog, catalogLoading, catalogError, categories, collectionsData } = useStore();
  const decode = decodeURIComponent(value || "");
  const slug = normalizeSlug(decode);

  const matchedCategory = useMemo(() => {
    return categories.find(
      (c) => normalizeSlug(c.name) === slug || c.id === decode || c.name?.toLowerCase() === decode.toLowerCase()
    );
  }, [categories, slug, decode]);

  const matchedCollection = useMemo(() => {
    return collectionsData.find(
      (c) =>
        normalizeSlug(c.key || c.id) === slug ||
        normalizeSlug(c.name) === slug ||
        c.key === decode ||
        c.id === decode ||
        c.name?.toLowerCase() === decode.toLowerCase()
    );
  }, [collectionsData, slug, decode]);

  const displayName = useMemo(() => {
    if (kind === "category") {
      if (slug === "new-arrivals") return "New Arrivals";
      if (slug === "sale") return "Sale Sarees";
      if (slug === "handloom") return "Handloom Sarees";
      return matchedCategory?.name || decode;
    }
    if (kind === "collection") {
      if (slug === "new-arrivals") return "New Arrivals";
      if (slug === "big-sale" || slug === "sale") return "Sale Collection";
      return matchedCollection?.name || decode;
    }
    if (kind === "bestseller") {
      return "Best Sellers";
    }
    return decode;
  }, [kind, slug, matchedCategory, matchedCollection, decode]);

  const matching = useMemo(() => {
    if (!catalog.length) return [];

    if (kind === "category") {
      if (slug === "new-arrivals") {
        return catalog.filter((p) => p.isNew || p.collection === "new-arrivals");
      }
      if (slug === "sale") {
        return catalog.filter((p) => p.isOnSale || p.mrp > p.price);
      }
      if (slug === "handloom") {
        return catalog.filter(
          (p) =>
            p.fabric?.toLowerCase().includes("handloom") ||
            p.category?.toLowerCase().includes("handloom") ||
            p.name?.toLowerCase().includes("handloom")
        );
      }
      return catalog.filter(
        (p) =>
          normalizeSlug(p.category) === slug ||
          (matchedCategory && normalizeSlug(p.category) === normalizeSlug(matchedCategory.name))
      );
    }

    if (kind === "collection") {
      if (slug === "new-arrivals") {
        return catalog.filter((p) => p.isNew || p.collection === "new-arrivals");
      }
      if (slug === "big-sale" || slug === "sale") {
        return catalog.filter((p) => p.isOnSale || p.mrp > p.price);
      }
      const targetKeys = [decode, matchedCollection?.key, matchedCollection?.name].filter(Boolean);
      return catalog.filter((p) => {
        return (
          targetKeys.some(
            (k) =>
              normalizeSlug(p.collection) === normalizeSlug(k) ||
              normalizeSlug(p.category) === normalizeSlug(k) ||
              normalizeSlug(p.fabric) === normalizeSlug(k)
          ) ||
          (p.collection && targetKeys.includes(p.collection))
        );
      });
    }

    if (kind === "bestseller") {
      const explicit = catalog.filter((p) => p.isBestSeller);
      if (explicit.length > 0) return explicit;
      return [...catalog]
        .sort((a, b) => {
          if (b.rating !== a.rating) return b.rating - a.rating;
          if (b.reviews !== a.reviews) return b.reviews - a.reviews;
          const aDisc = a.mrp > a.price ? (a.mrp - a.price) / a.mrp : 0;
          const bDisc = b.mrp > b.price ? (b.mrp - b.price) / b.mrp : 0;
          return bDisc - aDisc;
        });
    }

    return catalog;
  }, [catalog, kind, slug, decode, matchedCategory, matchedCollection]);

  return (
    <main className="mx-auto max-w-[1240px] flex-1 px-4 py-8 lg:px-10 lg:py-12">
      <nav aria-label="Breadcrumb" className="mb-4 text-[11px] text-muted lg:mb-6">
        <Link href="/" className="hover:text-pine-900">
          Home
        </Link>
        <span className="px-1.5">/</span>
        <Link
          href={kind === "category" ? "/categories" : "/collections"}
          className="hover:text-pine-900"
        >
          {kind === "category" ? "Categories" : "Collections"}
        </Link>
        <span className="px-1.5">/</span>
        <span className="text-pine-900 font-medium">{displayName}</span>
      </nav>

      <div className="flex flex-col gap-2 border-b border-pine-950/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-[0.12em] text-pine-950 lg:text-3xl">
            {displayName}
          </h1>
          <p className="mt-1.5 text-xs text-muted lg:text-sm">
            {matchedCollection?.description ||
              matchedCategory?.description ||
              `Showing ${matching.length} handcrafted sarees`}
          </p>
        </div>
        <span className="text-xs text-pine-900 font-medium">{matching.length} products</span>
      </div>

      {catalogLoading ? (
        <div className="mt-8 grid grid-cols-2 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/3.7] animate-pulse rounded-xl bg-chip" />
          ))}
        </div>
      ) : catalogError ? (
        <p role="alert" className="mt-8 text-sm text-red-700">
          {catalogError}
        </p>
      ) : matching.length === 0 ? (
        <div className="mt-12 rounded-lg border border-dashed border-pine-950/15 p-12 text-center">
          <p className="text-sm text-muted">No sarees found in this collection yet.</p>
          <Link
            href="/shop"
            className="mt-4 inline-block rounded-full bg-pine-900 px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-pine-950"
          >
            Explore all sarees
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {matching.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
