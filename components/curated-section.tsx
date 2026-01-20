"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

const categories = [
  {
    name: "Handloom",
    description: "Traditional weaves",
    image: "/images/handloom-saree.jpg",
    href: "#handloom",
  },
  {
    name: "Designer",
    description: "Contemporary elegance",
    image: "/images/designer-saree.jpg",
    href: "#designer",
  },
  {
    name: "Bridal",
    description: "Wedding collection",
    image: "/images/bridal-saree.jpg",
    href: "#bridal",
  },
  {
    name: "Casual",
    description: "Everyday luxury",
    image: "/images/casual-saree.jpg",
    href: "#casual",
  },
]

export function CuratedSection() {
  return (
    <section id="collections" className="py-20 lg:py-32 bg-background">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <p className="font-sans text-sm tracking-[0.3em] uppercase text-primary mb-4">
            Curated This Season
          </p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light mb-6 text-balance">
            A blend of classic silhouettes
            <br className="hidden md:block" />
            and timeless craftsmanship
          </h2>
          <p className="font-sans text-foreground/70 max-w-2xl mx-auto leading-relaxed">
            Each piece in our collection tells a story of heritage, artistry, and the enduring beauty of handcrafted linen.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative aspect-[3/4] overflow-hidden bg-muted"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="font-sans text-xs tracking-widest uppercase opacity-70 mb-2">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-2xl lg:text-3xl">
                    {category.name}
                  </h3>
                  <div className="w-10 h-10 border border-white/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
