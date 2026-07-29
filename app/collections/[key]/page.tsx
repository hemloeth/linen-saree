"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PageHeroSlider } from "@/components/sections/page-hero-slider"
import { apiGet } from "@/lib/api"
import { resolveMediaUrl } from "@/lib/media"
import { ProductCard } from "@/components/products/product-card"
import Image from "next/image"
import { motion } from "framer-motion"
import { Sparkles, ShoppingBag, Star } from "lucide-react"
import { categories } from "@/lib/products"
import { redirect } from "next/navigation"

interface Props {
    params: Promise<{ key: string }>
}

export default function MarketingCollectionDetailPage({ params }: Props) {
    const { key } = use(params)
    
    // SMART REDIRECT: If this is a category slug, send them to /categories/
    if (categories.some(c => c.slug === key)) {
        redirect(`/categories/${key}`);
    }

    const [collection, setCollection] = useState<any>(null)
    const [products, setProducts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch collection details
                const colResponse = await apiGet(`/api/marketing-collections/${key}`)
                if (colResponse.success) {
                    setCollection(colResponse.data)
                    document.title = `${colResponse.data.name} | Linen Sarees`
                }

                // Fetch all products and filter by collection key
                const prodResponse = await apiGet('/api/product/allproducts')
                if (prodResponse.success) {
                    const filtered = prodResponse.products.filter((p: any) =>
                        p.productCollection === key ||
                        (key === 'festive' && p.isFestive) ||
                        (key === 'big-sale' && p.isOnSale)
                    )
                    setProducts(filtered)
                }
            } catch (error) {
                console.error("Error fetching collection data:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [key])

    // Fetch all marketing collections for the sub-nav
    const [allCollections, setAllCollections] = useState<any[]>([])
    useEffect(() => {
        const fetchAll = async () => {
            const res = await apiGet('/api/marketing-collections')
            if (res.success) {
                setAllCollections(res.data.filter((c: any) => c.key !== 'none'))
            }
        }
        fetchAll()
    }, [])

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading collection...</div>
    }

    if (!collection) {
        return <div className="min-h-screen flex items-center justify-center">Collection not found.</div>
    }

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Collections", href: "/collections" },
        { label: collection.name }
    ]

    const slides = [
        {
            id: collection.key,
            image: resolveMediaUrl(collection.image),
            title: collection.title1 && collection.title2 
                ? `${collection.title1} ${collection.title2}`
                : collection.name,
            subtitle: collection.description
        }
    ]

    return (
        <main className="min-h-screen bg-background">
            <Header />

            {/* Premium Collection Hero - Using standard slider for consistency */}
            <div className="mt-[64px] lg:mt-[80px]">
                <PageHeroSlider
                    slides={slides}
                    height="40vh"
                    breadcrumbs={breadcrumbs}
                />
            </div>

            {/* Collections Sub-nav */}
            <section className="bg-secondary border-b border-border py-8">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                    <div className="flex overflow-x-auto hide-scrollbar px-6 lg:px-0 lg:flex-wrap lg:justify-center gap-3 lg:gap-4 pb-2 lg:pb-0">
                        <Link
                            href="/collections"
                            className="whitespace-nowrap px-6 py-2 border border-border hover:bg-foreground hover:text-background text-sm tracking-wide transition-all rounded-full lg:rounded-none flex-shrink-0"
                        >
                            All Collections
                        </Link>
                        {allCollections.map((col: any) => (
                            <Link
                                key={col.key}
                                href={`/collections/${col.key}`}
                                className={`whitespace-nowrap px-6 py-2 text-sm tracking-wide transition-all rounded-full lg:rounded-none flex-shrink-0 ${col.key === key
                                    ? "bg-foreground text-background shadow-md"
                                    : "border border-border hover:bg-foreground hover:text-background"
                                    }`}
                            >
                                {col.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Collection Stats/Offer Section */}
            {(collection.stats?.length > 0 || collection.offer) && (
                <section className="py-12 bg-secondary/30 border-b border-border">
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                        <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24">
                            {collection.key === 'big-sale' && collection.offer && (
                                <div className="text-center">
                                    <span className="block text-xs font-bold tracking-widest text-primary uppercase mb-1">Limited Time</span>
                                    <span className="text-4xl font-serif text-foreground">{collection.offer}</span>
                                </div>
                            )}

                            {collection.stats?.map((stat: any, idx: number) => (
                                <div key={idx} className="text-center">
                                    <span className="block text-3xl font-serif text-foreground">{stat.number}</span>
                                    <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Products Grid */}
            <section className="py-20 px-6 lg:px-10">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex items-center justify-between mb-12">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-serif">Curated Pieces</h2>
                            <p className="text-muted-foreground">Handpicked selection from the {collection.name}</p>
                        </div>
                        <div className="text-sm font-medium bg-muted px-4 py-2 rounded-full">
                            {products.length} Products Found
                        </div>
                    </div>

                    {products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                            {products.map((product, idx) => (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <ProductCard
                                        product={{
                                            id: product._id,
                                            name: product.name,
                                            slug: product.name.toLowerCase().replace(/ /g, '-'),
                                            price: product.price,
                                            originalPrice: product.regularPrice,
                                            image: product.mainImage,
                                            images: [product.mainImage],
                                            isOnSale: product.isOnSale,
                                            isNew: product.isNewArrival,
                                            category: product.category,
                                            categorySlug: product.category.toLowerCase().replace(/ /g, '-')
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-32 border-2 border-dashed rounded-3xl">
                            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-medium">No products found in this collection yet.</h3>
                            <p className="text-muted-foreground mt-2">Check back soon for new additions!</p>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    )
}
