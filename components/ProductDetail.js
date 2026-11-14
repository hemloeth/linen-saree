"use client";

import { useMemo, useState } from "react";
import ProductGallery from "@/components/ProductGallery";
import ColorSwatches from "@/components/ColorSwatches";
import CountdownTimer from "@/components/CountdownTimer";
import Accordion from "@/components/Accordion";
import Stars from "@/components/Stars";
import { AddToBagButton, BuyNowButton } from "@/components/ProductActions";
import { formatINR, trustPoints } from "@/lib/data";

const STOCK_LABEL = { true: "In stock", false: "Sold out" };

export default function ProductDetail({ product }) {
  const [index, setIndex] = useState(0);
  const [color, setColor] = useState(product.swatches?.[0]?.id ?? null);

  // Combine product gallery images and product video into unified media items
  const mediaItems = useMemo(() => {
    let rawImages = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      rawImages = product.images;
    } else if (Array.isArray(product.gallery) && product.gallery.length > 0) {
      rawImages = product.gallery;
    } else if (product.image) {
      rawImages = [product.image];
    }

    const list = rawImages.map((img, i) => ({
      type: "image",
      src: typeof img === "string" ? img : img.src,
      alt: (typeof img === "object" && img.alt) || `${product.name} — photo ${i + 1}`,
      label: (typeof img === "object" && img.label) || `Photo ${i + 1}`,
      swatch: typeof img === "object" ? img.swatch : undefined,
    }));

    const videoSrc = product.video || product.videoUrl || product.videoFile;
    if (videoSrc) {
      list.push({
        type: "video",
        src: videoSrc,
        poster: product.image || (product.gallery && product.gallery[0]) || "",
        alt: `${product.name} in motion`,
        label: "Video",
      });
    }

    return list;
  }, [product]);

  const videoIndex = mediaItems.findIndex((m) => m.type === "video");
  const hasVideo = videoIndex >= 0;

  function selectColor(id) {
    setColor(id);
    const photoIndex = mediaItems.findIndex((item) => item.swatch === id);
    if (photoIndex >= 0) setIndex(photoIndex);
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-10 lg:gap-16">
        <div className="min-w-0 md:sticky md:top-6 md:self-start">
          <ProductGallery images={mediaItems} index={index} onSelect={setIndex} />
        </div>

        <div className="min-w-0 pb-20 lg:pb-0">
          <div className="flex items-center gap-2">
            <p className="font-inter text-[10px] uppercase tracking-wider text-muted">
              SKU {product.sku}
            </p>
            <span className="h-1 w-1 rounded-full bg-pine-950/25" aria-hidden="true" />
            <Stars rating={product.rating} reviews={product.reviews} />
          </div>

          <h1 className="mt-1.5 text-[17px] font-medium leading-snug text-black sm:text-xl lg:text-3xl">
            {product.name}
          </h1>

          {hasVideo && (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => {
                  setIndex(videoIndex);
                  if (typeof window !== "undefined") {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-pine-900/30 bg-linen/70 px-3 py-1 font-inter text-[11px] font-semibold text-pine-950 transition hover:bg-pine-900 hover:text-white"
              >
                <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7L8 5Z" />
                </svg>
                Watch Saree in Motion
              </button>
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="font-inter text-xl font-semibold text-pine-900 lg:text-2xl">
              {formatINR(product.price)}
            </span>
            <span className="text-sm text-muted line-through">{formatINR(product.mrp)}</span>
            <span className="rounded-sm bg-[#fef3f2] px-1.5 py-0.5 font-inter text-[10px] font-semibold text-[#b42318]">
              {product.mrp > 0 ? Math.max(0, Math.round(((product.mrp - product.price) / product.mrp) * 100)) : 0}% OFF
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-muted">Inclusive of all taxes</p>



          {product.swatches?.length ? (
            <div className="mt-5">
              <ColorSwatches swatches={product.swatches} value={color} onChange={selectColor} />
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1">
            <p className="font-inter text-[12px] font-semibold text-pine-950">
              Fabric: <span className="font-normal text-muted">{product.fabric}</span>
            </p>
            <p className="font-inter text-[12px] font-semibold text-pine-950">
              Size: <span className="font-normal text-muted">{product.size ?? "Free size"}</span>
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-inter text-[10px] font-semibold ${
                product.inStock
                  ? "bg-[#ecfdf3] text-[#027a48]"
                  : "bg-[#fef3f2] text-[#b42318]"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${product.inStock ? "bg-[#039855]" : "bg-[#b42318]"}`} />
              {STOCK_LABEL[String(product.inStock)]}
            </span>
            <span className="text-[11px] text-muted">
              {product.inStock ? "Available for dispatch" : "Currently unavailable"}
            </span>
          </div>

          {/* Main Action Buttons: Add to Bag & Buy Now */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <AddToBagButton
              product={product}
              className="flex-1 h-12 rounded-lg border-2 border-pine-900 bg-white font-inter text-xs font-bold uppercase tracking-wider text-pine-900 shadow-xs transition hover:bg-sand-50 active:scale-[0.99] disabled:opacity-50"
            >
              Add to bag
            </AddToBagButton>
            <BuyNowButton
              product={product}
              className="flex-1 h-12 rounded-lg bg-pine-900 font-inter text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-pine-950 active:scale-[0.99] disabled:opacity-50"
            />
          </div>

          {/* Trust badges */}
          <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-pine-950/10 pt-4">
            {trustPoints.map((point) => (
              <li key={point.title} className="flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-pine-800" aria-hidden="true">
                  <path d="m5 13 4 4L19 7" />
                </svg>
                <span>
                  <span className="block font-inter text-[11px] font-semibold text-pine-950">{point.title}</span>
                  <span className="block text-[10px] leading-tight text-muted">{point.detail}</span>
                </span>
              </li>
            ))}
          </ul>

          {/* Details accordion */}
          <div id="product-details" className="mt-6">
            <h2 className="mb-2 font-display text-base font-semibold uppercase tracking-[0.12em] text-pine-950">
              Description
            </h2>
            <p className="mb-4 text-[13px] leading-relaxed text-muted">{product.description}</p>
            <Accordion items={product.details} />
          </div>
        </div>
      </div>

      {/* Sticky mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-pine-950/10 bg-white/95 px-3 py-2.5 backdrop-blur lg:hidden shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="shrink-0 pr-1">
            <p className="font-inter text-sm font-semibold leading-tight text-pine-900">
              {formatINR(product.price)}
            </p>
            <p className="text-[10px] leading-tight text-muted line-through">{formatINR(product.mrp)}</p>
          </div>
          <AddToBagButton
            product={product}
            className="h-11 flex-1 rounded-lg border-2 border-pine-900 bg-white font-inter text-xs font-bold uppercase tracking-wider text-pine-900 transition hover:bg-sand-50"
          >
            Add to bag
          </AddToBagButton>
          <BuyNowButton
            product={product}
            className="h-11 flex-1 rounded-lg bg-pine-900 font-inter text-xs font-bold uppercase tracking-wider text-white shadow-xs transition hover:bg-pine-950"
          />
        </div>
      </div>
    </>
  );
}