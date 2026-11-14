"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/components/StoreProvider";
import { apiRequest } from "@/lib/api/client";
import { normalizeProduct } from "@/lib/api/products";

const STORAGE_KEY = "linen_recently_viewed_v1";
const LEGACY_KEY = "handloomer_recently_viewed_v1";
const MAX_STORED = 12;

export default function RecentlyViewed({ currentId }) {
  const [items, setItems] = useState([]);
  const { catalog } = useStore();

  // 1. Record current product into localStorage
  useEffect(() => {
    if (!currentId) return;
    try {
      const raw =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem(LEGACY_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      const updated = [
        String(currentId),
        ...existing.filter((id) => String(id) !== String(currentId)),
      ].slice(0, MAX_STORED);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      /* localStorage unavailable or quota exceeded */
    }
  }, [currentId]);

  // 2. Fetch lightweight cards for recently viewed items (excluding the active product)
  useEffect(() => {
    let active = true;

    async function loadRecent() {
      let ids = [];
      try {
        const raw =
          localStorage.getItem(STORAGE_KEY) ||
          localStorage.getItem(LEGACY_KEY);
        ids = raw ? JSON.parse(raw) : [];
      } catch {
        return;
      }

      const others = ids
        .map(String)
        .filter((id) => id !== String(currentId))
        .slice(0, 8);

      if (others.length === 0) {
        if (active) setItems([]);
        return;
      }

      // Check in-memory store catalog first
      const catalogMap = new Map((catalog || []).map((p) => [String(p.id), p]));
      const resolvedFromCatalog = others
        .map((id) => catalogMap.get(id))
        .filter(Boolean);

      if (resolvedFromCatalog.length === others.length) {
        if (active) setItems(resolvedFromCatalog);
        return;
      }

      // If any IDs are not in local catalog, fetch them from /api/product/cards-by-ids
      try {
        const response = await apiRequest("/api/product/cards-by-ids", {
          method: "POST",
          body: JSON.stringify({ ids: others }),
        });

        if (!active) return;

        if (response?.success && Array.isArray(response.products)) {
          const apiMap = new Map(
            response.products.map((p) => [
              String(p._id || p.id),
              normalizeProduct(p),
            ])
          );
          const combined = others
            .map((id) => apiMap.get(id) || catalogMap.get(id))
            .filter(Boolean);
          setItems(combined);
        } else if (resolvedFromCatalog.length > 0) {
          setItems(resolvedFromCatalog);
        }
      } catch (err) {
        if (active && resolvedFromCatalog.length > 0) {
          setItems(resolvedFromCatalog);
        }
      }
    }

    loadRecent();

    return () => {
      active = false;
    };
  }, [currentId, catalog]);

  if (items.length === 0) return null;

  return (
    <section aria-label="Recently viewed sarees" className="mt-12 lg:mt-16">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="font-display text-lg font-semibold uppercase tracking-[0.12em] text-pine-950">
          Recently Viewed
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {items.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

