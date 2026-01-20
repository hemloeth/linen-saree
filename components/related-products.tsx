"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/products"

interface RelatedProductsProps {
  products: Product[]
  category: string
}

export function RelatedProducts({ products, category }: RelatedProductsProps) {
  if (products.length === 0) return null

  return (
    <section className="py-16 px-4 lg:px-8 bg-secondary">
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-2">
              You May Also Like
            </p>
            <h2 className="font-serif text-3xl md:text-4xl">More from {category}</h2>
          </div>
          <Link
            href={`/collections`}
            className="inline-flex items-center gap-2 text-sm tracking-wide uppercase hover:text-primary transition-colors group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
