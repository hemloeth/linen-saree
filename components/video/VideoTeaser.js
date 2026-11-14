"use client";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/components/StoreProvider";
export default function VideoTeaser() {
  const {catalog} = useStore(); const videos = catalog.filter(p=>p.video).slice(0,4);
  if (!videos.length) return null;
  return <section className="mx-auto max-w-[1240px] px-4 py-8 lg:px-10 lg:py-14">
    <div className="mb-6 flex items-center justify-between"><h2 className="font-display text-xl uppercase tracking-[0.12em] text-pine-950">Video Collection</h2><Link href="/video-collection" className="text-xs text-pine-900 underline">Watch all</Link></div>
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{videos.map(p => <Link key={p.id} href="/video-collection" className="group"><div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-chip"><Image src={p.image} unoptimized={/^https?:\/\//.test(p.image)} alt={p.name} fill sizes="25vw" className="object-cover transition-transform group-hover:scale-105"/><span className="absolute bottom-3 left-3 rounded-full bg-pine-900 px-3 py-1 text-xs text-white">▶ Watch video</span></div><p className="mt-2 line-clamp-2 text-sm text-pine-950">{p.name}</p></Link>)}</div>
  </section>;
}
