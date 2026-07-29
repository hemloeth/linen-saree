"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

interface BackendCategory {
  _id: string
  name: string
  sortDesc: string
  image: string
}

interface Category {
  slug: string
  name: string
  description: string
  image: string
}

export function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { apiGet } = await import("@/lib/api")
        const data = await apiGet('/api/category/allcategory')
        if (data.categories) {
          const mapped = data.categories.map((c: BackendCategory) => ({
            slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
            name: c.name,
            description: c.sortDesc,
            image: c.image,
          }))
          setCategories(mapped)
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <section className="py-24 px-2 sm:px-6 lg:px-10 bg-gradient-to-br from-secondary via-secondary to-secondary/80">
      <div className="max-w-[1500px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            Explore Collections
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent px-4">
            Shop by Category
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Discover our curated collection of premium linen sarees, each crafted with tradition and modern elegance
          </p>
        </div>

        {/* Category Grid - 8 items in 2 rows */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] sm:aspect-[3/4] bg-muted animate-pulse rounded-xl sm:rounded-2xl" />
            ))
          ) : categories.length > 0 ? (
            categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="relative aspect-[4/5] sm:aspect-[3/4] bg-gradient-to-br from-muted to-muted/50 min-h-[200px] sm:min-h-[250px] md:min-h-[280px]">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    className="object-cover object-top transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                  />

                  {/* Overlay with modern gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                  {/* Decorative elements */}
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-sm bg-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                    <ArrowRight className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4 md:p-6 text-white">
                    <div className="transition-transform duration-500">
                      <h3 className="font-serif font-medium text-sm sm:text-base md:text-lg lg:text-xl mb-1 sm:mb-2 leading-tight break-words">
                        {category.name}
                      </h3>
                      <p className="text-white/90 mb-2 sm:mb-3 text-xs sm:text-sm line-clamp-2">
                        {category.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs font-medium tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 hidden sm:flex">
                        <span className="border-b border-white/50 pb-1">Explore</span>
                      </div>
                    </div>
                  </div>

                  {/* Modern accent line */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/80 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              <p>No categories found.</p>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 sm:mt-16">
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-foreground text-background hover:bg-foreground/90 transition-colors duration-300 rounded-full font-medium tracking-wide text-sm sm:text-base"
          >
            View All Collections
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
