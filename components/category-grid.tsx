"use client"

import Image from "next/image"
import Link from "next/link"
import { categories } from "@/lib/products"
import { ArrowRight, Sparkles } from "lucide-react"

export function CategoryGrid() {
  return (
    <section className="py-24 px-4 lg:px-8 bg-gradient-to-br from-secondary via-secondary to-secondary/80">
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
            <Sparkles className="w-4 h-4" />
            Explore Collections
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Shop by Category
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our curated collection of premium linen sarees, each crafted with tradition and modern elegance
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <Link
              key={category.slug}
              href={`/collections/${category.slug}`}
              className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                index === 0 ? "lg:col-span-2 lg:row-span-2" : ""
              } ${
                index === 1 ? "md:col-span-1" : ""
              }`}
            >
              <div className={`relative ${
                index === 0 ? "aspect-[4/3] lg:aspect-square" : "aspect-[3/4]"
              } bg-gradient-to-br from-muted to-muted/50 min-h-[300px]`}>
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                />
                
                {/* Overlay with modern gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-12 h-12 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-sm bg-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8 pb-8 lg:pb-12 text-white">
                  <div className="transition-transform duration-500">
                    <h3 className={`font-serif font-medium ${
                      index === 0 ? "text-2xl lg:text-3xl xl:text-4xl" : "text-xl lg:text-2xl"
                    } mb-3 leading-relaxed break-words`}>
                      {category.name}
                    </h3>
                    <p className={`text-white/90 mb-6 ${
                      index === 0 ? "text-sm lg:text-base line-clamp-2" : "text-xs lg:text-sm line-clamp-2"
                    }`}>
                      {category.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-medium tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                      <span className="border-b border-white/50 pb-1">Explore Collection</span>
                    </div>
                  </div>
                </div>

                {/* Modern accent line */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/80 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Link 
            href="/collections" 
            className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background hover:bg-foreground/90 transition-colors duration-300 rounded-full font-medium tracking-wide"
          >
            View All Collections
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
