"use client";
import CollectionCard from "@/components/CollectionCard";
import { collections as demoCollections } from "@/lib/data";
import { useStore } from "@/components/StoreProvider";
import { apiConfigured } from "@/lib/api/client";


export default function CollectionPageView({ title, subtitle }) {
  const { collectionsData } = useStore();
  const collections = apiConfigured ? collectionsData : demoCollections;
  return (
    <main className="flex-1 py-8 lg:py-14">
      <div className="mb-8 px-4 text-center lg:mb-12">
        <h1 className="font-display text-xl font-medium uppercase tracking-[0.18em] text-pine-950 sm:text-2xl lg:text-4xl">
          {title}
        </h1>
        {subtitle ? <p className="mt-2 text-xs text-muted lg:text-sm">{subtitle}</p> : null}
        <span aria-hidden="true" className="mx-auto mt-4 block h-px w-16 bg-pine-950/40 lg:w-24" />
      </div>

      <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-x-4 gap-y-6 px-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-6 lg:gap-y-10 lg:px-10">
        {collections.map((collection, index) => (
          <CollectionCard
            key={collection.id || collection.name}
            name={collection.name}
            image={collection.image}
            href={`/collections/${encodeURIComponent(collection.id || collection.key)}`}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 190px"
            eager={index === 0}
          />
        ))}
      </div>
    </main>
  );
}