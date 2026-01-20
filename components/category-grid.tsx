"use client"

import Image from "next/image"
import Link from "next/link"
import { categories } from "@/lib/products"
import { ArrowRight } from "lucide-react"

export function CategoryGrid() {
  return (
    <section className="py-20 px-4 lg:px-8 bg-secondary">
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-2">
            Explore
          </p>
          <h2 className="font-serif text-4xl md:text-5xl">Shop by Category</h2>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.slug}
              href={`/collections/${category.slug}`}
              className={`group relative overflow-hidden ${
                index === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <div className={`relative ${index === 0 ? "aspect-square" : "aspect-[3/4]"}`}>
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-end p-6 text-white">
                  <h3 className={`font-serif ${index === 0 ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"} mb-2 text-center`}>
                    {category.name}
                  </h3>
                  <p className="text-sm text-white/80 text-center mb-4 line-clamp-2 hidden md:block">
                    {category.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-xs tracking-wider uppercase opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    Shop Now <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
