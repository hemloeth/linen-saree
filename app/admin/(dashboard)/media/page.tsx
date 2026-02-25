"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProductPreviewCard } from "@/components/admin/product-preview-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StoredProduct {
    id: number
    name: string
    sku?: string
    category: string
    price: string
    regularPrice?: string
    stock: string
    shortDescription: string
    tags?: string
    image: string | null
}

export default function MediaPage() {
    const [products, setProducts] = useState<StoredProduct[]>([])
    const router = useRouter()
    const searchParams = useSearchParams()
    const selectMode = searchParams.get("select")

    useEffect(() => {
        if (typeof window === "undefined") return
        try {
            const existing = window.localStorage.getItem("adminProducts")
            const parsed = existing ? JSON.parse(existing) : []
            if (Array.isArray(parsed)) {
                setProducts(parsed)
            }
        } catch (err) {
            console.error("Failed to load products from localStorage", err)
        }
    }, [])

    const handleSelectImage = (image: string | null) => {
        if (!selectMode || !image) return

        if (typeof window !== "undefined") {
            try {
                if (selectMode === "blog-image") {
                    window.localStorage.setItem("blogSelectedImage", image)
                    router.push("/admin/blog")
                }
            } catch (err) {
                console.error("Failed to store selected image", err)
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-serif text-primary">Media Library</h2>
                    <p className="text-muted-foreground">
                        All products you&apos;ve added via the Add Product page.
                    </p>
                </div>
                {selectMode && (
                    <p className="text-xs text-muted-foreground">
                        Click a product to use its image.
                    </p>
                )}
            </div>

            {products.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">No products yet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Once you add products from the Add Product page, they will appear here with their images and
                            details.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => {
                        const clickable = !!selectMode && !!product.image
                        return (
                            <div
                                key={product.id}
                                onClick={() => handleSelectImage(product.image)}
                                role={clickable ? "button" : undefined}
                                tabIndex={clickable ? 0 : -1}
                                className={
                                    clickable
                                        ? "text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-md"
                                        : "text-left cursor-default"
                                }
                                onKeyDown={(e) => {
                                    if (!clickable) return
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault()
                                        handleSelectImage(product.image)
                                    }
                                }}
                            >
                                <ProductPreviewCard
                                    images={product.image ? [product.image] : []}
                                    name={product.name}
                                    sku={product.sku}
                                    category={product.category}
                                    price={product.price}
                                regularPrice={product.regularPrice}
                                    stock={product.stock}
                                    tags={product.tags}
                                />
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

