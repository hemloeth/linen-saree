"use client";

import { useMemo, useState } from "react";
import ProductGallery from "@/components/ProductGallery";
import ColorSwatches from "@/components/ColorSwatches";
import CountdownTimer from "@/components/CountdownTimer";
import Accordion from "@/components/Accordion";
import Stars from "@/components/Stars";
import { AddToBagButton, BuyNowButton } from "@/components/ProductActions";
import { formatINR, trustPoints } from "@/lib/data";

const STOCK_LABEL = {
  true: "In stock",
  false: "Sold out",
};

// Map common saree color names to background and text styling for dynamic color pill
function getColorStyles(colorName) {
  const c = String(colorName || "").toLowerCase().trim();

  if (c.includes("black")) {
    return { bg: "#18181b", text: "#ffffff", border: "#27272a" };
  }
  if (c.includes("off white") || c.includes("offwhite") || c.includes("ivory") || c.includes("pearl")) {
    return { bg: "#fbf8f2", text: "#422006", border: "#e7e0d3" };
  }
  if (c.includes("beige")) {
    return { bg: "#f5ece1", text: "#451a03", border: "#e5d5c5" };
  }
  if (c.includes("red") || c.includes("maroon") || c.includes("crimson")) {
    return { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" };
  }
  if (c.includes("pink") || c.includes("rose")) {
    return { bg: "#fce7f3", text: "#9d174d", border: "#fbcfe8" };
  }
  if (c.includes("blue") || c.includes("navy") || c.includes("indigo")) {
    return { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" };
  }
  if (c.includes("green") || c.includes("olive") || c.includes("mint") || c.includes("emerald")) {
    return { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" };
  }
  if (c.includes("yellow") || c.includes("mustard")) {
    return { bg: "#fef9c3", text: "#854d0e", border: "#fef08a" };
  }
  if (c.includes("purple") || c.includes("lavender") || c.includes("violet")) {
    return { bg: "#f3e8ff", text: "#6b21a8", border: "#e9d5ff" };
  }
  if (c.includes("gold") || c.includes("golden")) {
    return { bg: "#fef3c7", text: "#78350f", border: "#fde68a" };
  }
  if (c.includes("orange") || c.includes("rust") || c.includes("peach")) {
    return { bg: "#ffedd5", text: "#9a3412", border: "#fed7aa" };
  }
  if (c.includes("grey") || c.includes("gray") || c.includes("silver")) {
    return { bg: "#f3f4f6", text: "#1f2937", border: "#e5e7eb" };
  }

  // Fallback brand linen tint
  return { bg: "#eef5f1", text: "#0c3c3c", border: "#c7dcce" };
}

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

          {/* Product Title */}
          <h1 className="mt-1.5 text-[17px] font-medium leading-snug text-black sm:text-xl lg:text-3xl">
            {product.name}
          </h1>

          {/* Color & Material badge directly under Product Name */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {product.colour && (() => {
              const style = getColorStyles(product.colour);
              return (
                <span
                  style={{
                    backgroundColor: style.bg,
                    color: style.text,
                    borderColor: style.border,
                  }}
                  className="inline-flex items-center rounded-full border px-3 py-1 font-inter text-xs font-semibold shadow-xs"
                >
                  Color: <span className="ml-1 font-bold">{product.colour}</span>
                </span>
              );
            })()}
            {product.fabric && (
              <span className="inline-flex items-center rounded-full border border-pine-950/15 bg-white px-3 py-1 font-inter text-xs font-medium text-muted">
                Material: <span className="ml-1 font-semibold text-pine-950 capitalize">{product.fabric}</span>
              </span>
            )}
            {product.sareeSize && (
              <span className="inline-flex items-center rounded-full border border-pine-950/15 bg-white px-2.5 py-1 font-inter text-xs text-muted">
                Size: <span className="ml-1 font-semibold text-pine-950">{product.sareeSize}</span>
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-baseline gap-2">
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

          {/* Quick specs line: Color, Saree Size, Blouse, Fabric */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-pine-950/10 py-3">
            {product.colour && (
              <p className="font-inter text-xs text-pine-950">
                <span className="font-semibold text-pine-900">Color:</span> {product.colour}
              </p>
            )}
            {product.sareeSize && (
              <p className="font-inter text-xs text-pine-950">
                <span className="font-semibold text-pine-900">Saree Size:</span> {product.sareeSize}
              </p>
            )}
            {product.blouseSize && (
              <p className="font-inter text-xs text-pine-950">
                <span className="font-semibold text-pine-900">Blouse:</span> {product.blouseSize}
              </p>
            )}
            {product.fabric && (
              <p className="font-inter text-xs text-pine-950">
                <span className="font-semibold text-pine-900">Fabric:</span> <span className="capitalize">{product.fabric}</span>
              </p>
            )}
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

          {/* Product Specifications & Details Card */}
          <div id="product-details" className="mt-8 space-y-6">
            {/* Description Section — strictly from backend shortDescription */}
            {product.description && (
              <div className="rounded-xl border border-pine-950/10 bg-white p-4 sm:p-5 shadow-xs">
                <h2 className="mb-2 font-display text-base font-semibold uppercase tracking-[0.12em] text-pine-950">
                  Product Description
                </h2>
                <p className="font-sans text-[13.5px] leading-relaxed text-ink/85 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Structured Specifications Grid — strictly from backend fields */}
            <div className="rounded-xl border border-pine-950/10 bg-white p-4 sm:p-5 shadow-xs">
              <h2 className="mb-3.5 font-display text-base font-semibold uppercase tracking-[0.12em] text-pine-950">
                Product Details & Specifications
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {product.colour && (
                  <div className="flex items-center justify-between border-b border-pine-950/5 pb-2">
                    <dt className="font-inter text-xs font-semibold text-pine-950">Color</dt>
                    <dd className="font-inter text-xs text-muted font-medium">{product.colour}</dd>
                  </div>
                )}
                {product.fabric && (
                  <div className="flex items-center justify-between border-b border-pine-950/5 pb-2">
                    <dt className="font-inter text-xs font-semibold text-pine-950">Material / Fabric</dt>
                    <dd className="font-inter text-xs text-muted capitalize">{product.fabric}</dd>
                  </div>
                )}
                {product.sareeSize && (
                  <div className="flex items-center justify-between border-b border-pine-950/5 pb-2">
                    <dt className="font-inter text-xs font-semibold text-pine-950">Saree Size / Length</dt>
                    <dd className="font-inter text-xs text-muted">{product.sareeSize}</dd>
                  </div>
                )}
                {product.blouseSize && (
                  <div className="flex items-center justify-between border-b border-pine-950/5 pb-2">
                    <dt className="font-inter text-xs font-semibold text-pine-950">Blouse Size</dt>
                    <dd className="font-inter text-xs text-muted">{product.blouseSize}</dd>
                  </div>
                )}
                {product.washCare && (
                  <div className="flex items-center justify-between border-b border-pine-950/5 pb-2">
                    <dt className="font-inter text-xs font-semibold text-pine-950">Wash & Care</dt>
                    <dd className="font-inter text-xs text-muted">{product.washCare}</dd>
                  </div>
                )}
                {product.dispatch && (
                  <div className="flex items-center justify-between border-b border-pine-950/5 pb-2">
                    <dt className="font-inter text-xs font-semibold text-pine-950">Dispatch Time</dt>
                    <dd className="font-inter text-xs text-muted">{product.dispatch}</dd>
                  </div>
                )}
                {product.sku && (
                  <div className="flex items-center justify-between border-b border-pine-950/5 pb-2">
                    <dt className="font-inter text-xs font-semibold text-pine-950">SKU</dt>
                    <dd className="font-inter text-xs font-mono text-muted">{product.sku}</dd>
                  </div>
                )}
                {product.tags && (
                  <div className="flex items-center justify-between border-b border-pine-950/5 pb-2">
                    <dt className="font-inter text-xs font-semibold text-pine-950">Tags</dt>
                    <dd className="font-inter text-xs text-muted capitalize">{product.tags}</dd>
                  </div>
                )}
              </dl>

              {product.disclaimer && (
                <div className="mt-4 rounded-lg bg-linen/50 p-3 text-[11px] leading-relaxed text-muted">
                  <span className="font-semibold text-pine-950">Disclaimer: </span>
                  {product.disclaimer}
                </div>
              )}
            </div>

            {/* Accordion for Delivery, Care & Saree details */}
            {product.details?.length > 0 && (
              <div className="rounded-xl border border-pine-950/10 bg-white p-4 sm:p-5 shadow-xs">
                <h2 className="mb-2 font-display text-base font-semibold uppercase tracking-[0.12em] text-pine-950">
                  Shipping, Care & FAQs
                </h2>
                <Accordion items={product.details} />
              </div>
            )}
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