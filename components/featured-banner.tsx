"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function FeaturedBanner() {
  return (
    <section className="py-20 px-4 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Image */}
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src="/images/bridal-saree.jpg"
              alt="Bridal Collection"
              fill
              className="object-cover"
            />
            <div className="absolute top-6 left-6 bg-accent text-accent-foreground px-4 py-2 text-sm tracking-wide">
              Best Seller
            </div>
          </div>

          {/* Content */}
          <div className="lg:pl-12">
            <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
              Bridal Collection
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6">
              Elegance for Your
              <br />
              <span className="italic text-primary">Special Day</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Our bridal collection features exquisite linen sarees adorned with intricate 
              zari work, delicate embroidery, and timeless designs. Each piece is crafted 
              to make your special day truly memorable.
            </p>
            
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div>
                <p className="font-serif text-3xl text-primary mb-1">100+</p>
                <p className="text-sm text-muted-foreground">Designs</p>
              </div>
              <div>
                <p className="font-serif text-3xl text-primary mb-1">50+</p>
                <p className="text-sm text-muted-foreground">Artisans</p>
              </div>
              <div>
                <p className="font-serif text-3xl text-primary mb-1">15+</p>
                <p className="text-sm text-muted-foreground">Years</p>
              </div>
            </div>

            <Link href="/collections/banarasi-silk">
              <Button size="lg" className="bg-primary hover:bg-primary/90 px-8">
                Shop Bridal Collection
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
