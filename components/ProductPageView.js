"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductDetail from "@/components/ProductDetail";
import ProductReviews from "@/components/ProductReviews";
import ProductCard from "@/components/ProductCard";
import RecentlyViewed from "@/components/RecentlyViewed";
import JsonLd from "@/components/JsonLd";
import Link from "next/link";
import { useStore } from "@/components/StoreProvider";
import { fetchProductById } from "@/lib/api/products";

export default function ProductPageView({ productId }) {
  const { catalog: products, catalogLoading, catalogError } = useStore();
  const [directProduct, setDirectProduct] = useState(null);
  const [directLoading, setDirectLoading] = useState(false);
  const [directError, setDirectError] = useState(null);

  // First check if product is already in catalog
  const catalogMatch = products.find((p) => String(p.id) === String(productId));

  useEffect(() => {
    if (catalogMatch) return;
    if (!productId) return;

    let active = true;
    setDirectLoading(true);
    setDirectError(null);

    fetchProductById(productId)
      .then((prod) => {
        if (!active) return;
        setDirectProduct(prod);
      })
      .catch((err) => {
        if (!active) return;
        setDirectError(err.message || "Product not found");
      })
      .finally(() => {
        if (active) setDirectLoading(false);
      });

    return () => {
      active = false;
    };
  }, [productId, catalogMatch]);

  const product = catalogMatch || directProduct;
  const isLoading = catalogLoading || (!product && directLoading);
  const isError = directError || (!product && !isLoading && catalogError);

  if (!product) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-[1240px] flex-1 px-4 py-20 text-center">
          {isLoading ? (
            <div className="space-y-4">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pine-900 border-r-transparent" />
              <p className="font-inter text-xs text-muted">Loading saree details…</p>
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
              <p role="alert" className="text-sm font-medium text-red-700">
                {isError}
              </p>
              <Link
                href="/shop"
                className="mt-4 inline-block rounded-md bg-pine-900 px-5 py-2 text-xs font-semibold text-white hover:bg-pine-950"
              >
                Browse All Sarees
              </Link>
            </div>
          ) : (
            <div>
              <h1 className="font-display text-2xl font-semibold text-pine-950">
                Product Not Found
              </h1>
              <p className="mt-2 text-xs text-muted">
                The saree you are looking for may be sold out or moved.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-block rounded-md bg-pine-900 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-pine-950"
              >
                Explore Collection
              </Link>
            </div>
          )}
        </main>
        <Footer />
      </>
    );
  }

  const related = products
    .filter(
      (item) =>
        String(item.id) !== String(product.id) &&
        (item.category === product.category || item.fabric === product.fabric)
    )
    .slice(0, 5);

  const more = products
    .filter(
      (item) =>
        String(item.id) !== String(product.id) &&
        !related.some((r) => String(r.id) === String(item.id))
    )
    .slice(0, 10);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image,
    description: product.description || `Pure handwoven ${product.fabric || "linen"} saree`,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `https://linensaree.com/product/${product.id}`,
    },
    aggregateRating: product.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount: product.reviews || 1,
        }
      : undefined,
  };

  return (
    <>
      <JsonLd id={`product-schema-${product.id}`} data={productSchema} />
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">
        <div className="mx-auto max-w-[1240px] px-4 py-4 lg:px-10 lg:py-10">
          <nav aria-label="Breadcrumb" className="mb-4 text-[11px] text-muted lg:mb-6">
            <Link href="/" className="hover:text-pine-900">
              Home
            </Link>
            <span className="px-1.5">/</span>
            <Link href="/shop" className="hover:text-pine-900">
              Sarees
            </Link>
            <span className="px-1.5">/</span>
            <span className="text-pine-900 font-medium">{product.name}</span>
          </nav>

          <ProductDetail product={product} />
          <ProductReviews product={product} />

          {related.length > 0 && (
            <section aria-label="Similar sarees" className="mt-12 lg:mt-16">
              <div className="mb-4 flex items-end justify-between gap-3">
                <h2 className="font-display text-lg font-semibold uppercase tracking-[0.12em] text-pine-950">
                  Similar Sarees
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                {related.slice(0, 4).map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </section>
          )}

          <RecentlyViewed currentId={product.id} />

          <section aria-label="More to explore" className="mt-12 lg:mt-16">
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2 className="font-display text-lg font-semibold uppercase tracking-[0.12em] text-pine-950">
                More to explore
              </h2>
              <Link
                href="/shop"
                className="font-inter text-[11px] text-pine-900 underline underline-offset-2"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {more.slice(0, 8).map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
      {/* Spacer so fixed mobile action bar never covers footer */}
      <div aria-hidden="true" className="h-14 bg-linen lg:hidden" />
    </>
  );
}
