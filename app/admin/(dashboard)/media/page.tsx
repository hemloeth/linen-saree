"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProduct } from "@/context/product-context"

function MediaPageContent() {
    const { products, loading } = useProduct()
    const router = useRouter()
    const searchParams = useSearchParams()
    const selectMode = searchParams.get("select")

    const handleSelectImage = (image: string | undefined) => {
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

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading media...</div>
    }

    // Only show products that have at least one image
    const productsWithImages = products.filter(p => p.mainImage || (p.galleryImages && p.galleryImages.length > 0))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-serif text-primary">Media Library</h2>
                    <p className="text-muted-foreground">
                        Browse all product images to select one for your blog.
                    </p>
                </div>
                {selectMode && (
                    <p className="text-sm font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                        Click an image to insert it.
                    </p>
                )}
            </div>

            {productsWithImages.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">No images found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Upload products with images to see them here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {productsWithImages.map((product) => {
                        const image = product.mainImage || (product.galleryImages && product.galleryImages[0])
                        const clickable = !!selectMode && !!image

                        return (
                            <div
                                key={product._id}
                                onClick={() => handleSelectImage(image)}
                                role={clickable ? "button" : undefined}
                                tabIndex={clickable ? 0 : -1}
                                className={`group relative flex flex-col overflow-hidden rounded-xl border bg-background shadow-sm transition-all hover:shadow-md ${clickable ? "cursor-pointer hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/40" : ""
                                    }`}
                                onKeyDown={(e) => {
                                    if (!clickable) return
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault()
                                        handleSelectImage(image)
                                    }
                                }}
                            >
                                <div className="aspect-square w-full overflow-hidden bg-muted">
                                    {image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={image}
                                            alt={product.name}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 border-t bg-card text-center">
                                    <p className="line-clamp-2 text-xs font-medium leading-tight text-foreground transition-colors group-hover:text-primary">
                                        {product.name}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default function MediaPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">Loading...</div>}>
            <MediaPageContent />
        </Suspense>
    )
}

