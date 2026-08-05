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
import { CategoryProductsClient } from "../../categories/[slug]/category-products-client"
import { Suspense } from "react"

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
                // Fetch collection details (with fallback for hardcoded default collections if they aren't in the DB yet)
                try {
                    const colResponse = await apiGet(`/api/marketing-collections/${key}`)
                    if (colResponse.success) {
                        setCollection(colResponse.data)
                        document.title = `${colResponse.data.name} | Linen Sarees`
                    }
                } catch (colErr) {
                    const fallbacks: Record<string, any> = {
                        'new-arrivals': { key: 'new-arrivals', name: 'New Arrivals', title1: 'Just', title2: 'Dropped', description: 'Explore our latest additions.', image: 'https://res.cloudinary.com/dsvy1hd8m/image/upload/v1784523145/images/zkn6uhgxtafdcnmwt3ea.webp', stats: [] },
                        'festive': { key: 'festive', name: 'Festive Collection', title1: 'Festive', title2: 'Special', description: 'Perfect sarees for your celebrations.', image: 'https://res.cloudinary.com/dsvy1hd8m/image/upload/v1784523145/images/zkn6uhgxtafdcnmwt3ea.webp', stats: [] },
                        'big-sale': { key: 'big-sale', name: 'Big Sale', title1: 'Clearance', title2: 'Sale', description: 'Incredible discounts on premium sarees.', image: 'https://res.cloudinary.com/dsvy1hd8m/image/upload/v1784523145/images/zkn6uhgxtafdcnmwt3ea.webp', stats: [] },
                        'celebrity': { key: 'celebrity', name: 'Celebrity Looks', title1: 'Celebrity', title2: 'Style', description: 'Sarees inspired by the stars.', image: 'https://res.cloudinary.com/dsvy1hd8m/image/upload/v1784523145/images/zkn6uhgxtafdcnmwt3ea.webp', stats: [] },
                        'sale': { key: 'sale', name: 'Sale', title1: 'On', title2: 'Sale', description: 'Discounted items.', image: 'https://res.cloudinary.com/dsvy1hd8m/image/upload/v1784523145/images/zkn6uhgxtafdcnmwt3ea.webp', stats: [] }
                    }
                    if (fallbacks[key]) {
                        setCollection(fallbacks[key])
                        document.title = `${fallbacks[key].name} | Linen Sarees`
                    } else {
                        throw colErr;
                    }
                }

                // Fetch all products and filter by collection key
                const prodResponse = await apiGet('/api/product/allproducts')
                if (prodResponse.success) {
                    let filtered = prodResponse.products;
                    
                    if (key !== 'new-arrivals') {
                        filtered = filtered.filter((p: any) =>
                            p.productCollection === key ||
                            (key === 'festive' && p.isFestive) ||
                            (key === 'big-sale' && p.isOnSale)
                        )
                    }
                    
                    if (key === 'new-arrivals') {
                        filtered.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                    }
                    
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
            {key !== 'new-arrivals' && (
                <section className="bg-secondary border-b border-border py-8">
                    <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16">
                        <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-3 lg:gap-4">
                            <Link
                                href="/collections"
                                className="px-2 sm:px-6 py-2 border border-border hover:bg-foreground hover:text-background text-xs sm:text-sm tracking-wide transition-all text-center flex items-center justify-center"
                            >
                                All Collections
                            </Link>
                            {allCollections.map((col: any) => (
                                <Link
                                    key={col.key}
                                    href={`/collections/${col.key}`}
                                    className={`px-2 sm:px-6 py-2 text-xs sm:text-sm tracking-wide transition-all text-center flex items-center justify-center ${col.key === key
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
            )}

            {/* Collection Stats/Offer Section */}
            {(collection.stats?.length > 0 || collection.offer) && (
                <section className="py-12 bg-secondary/30 border-b border-border">
                    <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16">
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
            <Suspense fallback={<div className="py-20 text-center">Loading products...</div>}>
                <CategoryProductsClient 
                    initialProducts={products.map(product => ({
                        id: product._id,
                        name: product.name,
                        slug: product.name.toLowerCase().replace(/ /g, '-'),
                        price: product.price,
                        originalPrice: product.regularPrice,
                        image: product.mainImage,
                        images: [product.mainImage],
                        isOnSale: product.isOnSale,
                        isNew: product.isNewArrival,
                        category: product.category || 'Collection',
                        categorySlug: (product.category || 'Collection').toLowerCase().replace(/ /g, '-')
                    }))}
                    pageTitle={collection.name}
                />
            </Suspense>

            <Footer />
        </main>
    )
}
