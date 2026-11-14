"use client";

import { useStore } from "@/components/StoreProvider";
import CollectionCard from "@/components/CollectionCard";
import SectionHeading from "@/components/SectionHeading";

function toSlug(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function CategorySection() {
  const { categories, catalog } = useStore();
  const items = categories.length
    ? categories
    : [...new Set(catalog.map((p) => p.category).filter(Boolean))].map((name) => ({
        name,
        slug: toSlug(name),
        image: catalog.find((p) => p.category === name)?.image,
      }));

  if (!items.length) return null;

  return (
    <section aria-label="Shop by category" className="mx-auto max-w-[1240px] px-4 py-8 lg:px-10 lg:py-14">
      <SectionHeading title="Shop by Category" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-7">
        {items.map((item) => (
          <CollectionCard
            key={item.id || item.name}
            name={item.name}
            image={item.image || "/images/banner-shop-by-fabric.jpg"}
            href={`/categories/${item.slug || toSlug(item.name)}`}
          />
        ))}
      </div>
    </section>
  );
}

export function CollectionSection() {
  const { collectionsData, catalog } = useStore();
  const groups = collectionsData.length
    ? collectionsData
    : [...new Set(catalog.map((p) => p.collection).filter(Boolean))].map((name) => ({
        id: name,
        key: name,
        name,
        image: catalog.find((p) => p.collection === name)?.image,
      }));

  if (!groups.length) return null;

  return (
    <section aria-label="Curated collections" className="mx-auto max-w-[1240px] px-4 py-8 lg:px-10 lg:py-14">
      <SectionHeading title="Explore Collections" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-7">
        {groups.map((item) => (
          <CollectionCard
            key={item.id}
            name={item.name}
            image={item.image || "/images/banner-shop-by-fabric.jpg"}
            href={`/collections/${encodeURIComponent(item.key || item.id)}`}
          />
        ))}
      </div>
    </section>
  );
}
