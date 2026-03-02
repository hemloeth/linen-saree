"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { products } from "@/lib/products"

export function NewCollections() {
  const newProducts = products.slice(0, 8)

  return (
    <section className="py-20 px-4 lg:px-8 bg-background">
      <div className="max-w-[1400px] mx-auto">
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
          {newProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Show More Button */}
        <div className="text-center mt-12">
          <Link
            href="/collections"
            className="inline-block border-b-2 border-foreground pb-1 text-sm tracking-wide uppercase hover:border-primary hover:text-primary transition-colors"
          >
            Show More
          </Link>
        </div>
      </div>
    </section>
  )
}
