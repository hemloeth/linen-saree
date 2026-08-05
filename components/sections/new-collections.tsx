"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ProductCard } from "@/components/products/product-card"
import type { Product } from "@/lib/products"

import { useProducts } from "@/context/product-context"

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] md:aspect-[4/5] bg-muted rounded-sm mb-4" />
      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
      <div className="h-3 bg-muted rounded w-1/2 mb-2" />
      <div className="h-4 bg-muted rounded w-1/3 mb-4" />
      <div className="flex gap-2">
        <div className="h-10 bg-muted rounded w-12" />
        <div className="h-10 bg-muted rounded flex-1" />
      </div>
    </div>
  )
}

export function NewCollections() {
  const { mappedProducts, loading } = useProducts()

  // Just grab the first 8 items (or filter by isNew if you implement that attribute)
  const products = mappedProducts.slice(0, 8)

  return (
    <section className="py-20 px-2 bg-background">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-2">
              Latest Arrivals
            </p>
            <h2 className="font-serif text-4xl md:text-5xl">New Collections</h2>
          </div>
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-sm tracking-wide uppercase hover:text-primary transition-colors group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))
            : products.length > 0
              ? products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
              : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <p className="text-lg">No products available yet.</p>
                  <p className="text-sm mt-1">New arrivals coming soon!</p>
                </div>
              )}
        </div>

        {/* Show More Button */}
        {products.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="/collections"
              className="inline-block border-b-2 border-foreground pb-1 text-sm tracking-wide uppercase hover:border-primary hover:text-primary transition-colors"
            >
              Show More
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
