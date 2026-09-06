"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { motion } from "framer-motion"
import { ChevronRight, Sparkles, ArrowRight } from "lucide-react"
import { apiGet } from "@/lib/api"
import { resolveMediaUrl } from "@/lib/media"

export default function AllMarketingCollectionsPage() {
    const [collections, setCollections] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const response = await apiGet("/api/marketing-collections")
                if (response.success) {
                    // Filter out 'none' and ensure we only show the main 3
                    const filtered = response.data.filter((col: any) => col.key !== 'none')
                    setCollections(filtered)
                }
            } catch (error) {
                console.error("Error fetching collections:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchCollections()
    }, [])

    return (
        <main className="min-h-screen bg-background">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-secondary/30 -z-10" />
                <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16">
                    <div className="max-w-3xl">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="flex items-center gap-2 text-primary font-medium tracking-[0.2em] uppercase text-xs mb-4"
                        >
                            <Sparkles className="w-4 h-4" />
                            Curated Selection
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-4xl lg:text-7xl font-serif leading-tight mb-6"
                        >
                            Explore Our <span className="italic">Exclusive</span> Collections
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-muted-foreground text-lg lg:text-xl max-w-xl"
                        >
                            From red-carpet celebrity looks to traditional festive heritage, discover the perfect saree for every special chapter of your life.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Collections Grid */}
            <section className="pb-24 px-2">
                <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="aspect-[4/5] bg-muted animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                            {collections.map((collection, index) => (
                                <motion.div
                                    key={collection.key}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    <Link 
                                        href={`/collections/${collection.key}`}
                                        className="group block relative"
                                    >
                                        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-lg transition-all duration-500 group-hover:shadow-2xl">
                                            <Image
                                                src={resolveMediaUrl(collection.image)}
                                                alt={collection.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                                            
                                            {/* Content */}
                                            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                                                <div className="space-y-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                    <h3 className="text-3xl font-serif">{collection.name}</h3>
                                                    <p className="text-sm text-white/70 line-clamp-2 max-w-[260px]">
                                                        {collection.description || `Discover the exclusive ${collection.name} curated for you.`}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase pt-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                                                        Shop Collection
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Badge if Sale */}
                                            {collection.key === 'big-sale' && collection.offer && (
                                                <div className="absolute top-6 right-6 bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs font-bold tracking-wider shadow-xl">
                                                    {collection.offer}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Newsletter or Call to Action */}
            <section className="py-20 bg-secondary/50">
                <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 text-center">
                    <h2 className="text-3xl font-serif mb-4">Can't find what you're looking for?</h2>
                    <p className="text-muted-foreground mb-8">Browse our entire catalog of premium linen sarees and find your signature style.</p>
                    <Link 
                        href="/collections"
                        className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-full font-medium hover:bg-foreground/90 transition-all"
                    >
                        View All Products
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    )
}
