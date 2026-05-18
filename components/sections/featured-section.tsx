"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function FeaturedSection() {
  return (
    <section className="py-20 lg:py-32 bg-secondary">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative aspect-[4/5] lg:aspect-[3/4] overflow-hidden">
            <Image
              src="/images/festive-saree.jpg"
              alt="Festive collection"
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="lg:py-12">
            <p className="font-sans text-sm tracking-[0.3em] uppercase text-primary mb-6">
              Festive Collection
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light mb-8 leading-tight">
              Celebrate in
              <br />
              <span className="italic">Pure Elegance</span>
            </h2>
            <p className="font-sans text-foreground/70 text-lg leading-relaxed mb-8 max-w-lg">
              Our festive collection brings together the richness of traditional motifs with the breathability and comfort of pure linen. Perfect for celebrations that demand both grace and comfort.
            </p>
            <div className="space-y-4 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-px bg-primary" />
                <span className="font-sans text-sm tracking-wider">100% Pure Linen</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-px bg-primary" />
                <span className="font-sans text-sm tracking-wider">Handcrafted Embroidery</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-px bg-primary" />
                <span className="font-sans text-sm tracking-wider">Natural Dyes</span>
              </div>
            </div>
            <Link
              href="#festive"
              className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 font-sans text-sm tracking-wider uppercase hover:bg-foreground/90 transition-colors"
            >
              Shop Festive
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
