"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useProduct } from "@/context/product-context"
import type { ImageInfo } from "@/context/product-context"
import { Copy, Check, X, Save, Loader2, ImageIcon } from "lucide-react"

interface SelectedImage {
    productId: string
    productName: string
    imageIndex: number // -1 for main image
    url: string
    info: ImageInfo
    isMain: boolean
}

function MediaPageContent() {
    const { products, loading, updateGalleryImageInfo } = useProduct()
    const router = useRouter()
    const searchParams = useSearchParams()
    const selectMode = searchParams.get("select")

    const [selected, setSelected] = useState<SelectedImage | null>(null)
    const [editInfo, setEditInfo] = useState<ImageInfo>({ url: "", title: "", description: "", alt: "", caption: "" })
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [copied, setCopied] = useState(false)

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

    const handleImageClick = (img: SelectedImage) => {
        if (selectMode) {
            handleSelectImage(img.url)
            return
        }
        setSelected(img)
        setEditInfo(img.info)
        setSaved(false)
    }

    const handleCopyUrl = async () => {
        if (!selected) return
        try { await navigator.clipboard.writeText(selected.url) } catch {
            const ta = document.createElement("textarea"); ta.value = selected.url
            document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta)
        }
        setCopied(true); setTimeout(() => setCopied(false), 2000)
    }

    const handleSave = async () => {
        if (!selected) return
        setSaving(true); setSaved(false)
        try {
            await updateGalleryImageInfo(selected.productId, selected.imageIndex, {
                title: editInfo.title, description: editInfo.description, alt: editInfo.alt, caption: editInfo.caption,
            })
            setSaved(true); setTimeout(() => setSaved(false), 2000)
        } catch (err) { console.error("Failed to save", err) } finally { setSaving(false) }
    }

    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading media...</div>

    // Build a flat list of ALL images (main + gallery) across all products
    const allImages: SelectedImage[] = []
    products.forEach((product) => {
        // Main image
        if (product.mainImage) {
            allImages.push({
                productId: product._id,
                productName: product.name,
                imageIndex: -1,
                url: product.mainImage,
                info: product.mainImageInfo || { url: product.mainImage, title: "", description: "", alt: "", caption: "" },
                isMain: true,
            })
        }
        // Gallery images
        ; (product.galleryImages || []).forEach((img: any, idx: number) => {
            const url = typeof img === "string" ? img : img.url
            const info: ImageInfo = typeof img === "string"
                ? { url, title: "", description: "", alt: "", caption: "" }
                : { url: img.url, title: img.title || "", description: img.description || "", alt: img.alt || "", caption: img.caption || "" }
            allImages.push({ productId: product._id, productName: product.name, imageIndex: idx, url, info, isMain: false })
        })
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-serif text-primary">Media Library</h2>
                    <p className="text-muted-foreground">
                        {selectMode ? "Click an image to insert it." : "Click any image to view and edit its details."}
                    </p>
                </div>
            </div>

            {allImages.length === 0 ? (
                <Card>
                    <CardHeader><CardTitle className="text-base">No images found</CardTitle></CardHeader>
                    <CardContent><p className="text-sm text-muted-foreground">Upload products with images to see them here.</p></CardContent>
                </Card>
            ) : (
                <>
                    {/* Full-size Image Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {allImages.map((img, i) => {
                            const isSelected = selected?.productId === img.productId && selected?.imageIndex === img.imageIndex && selected?.isMain === img.isMain
                            return (
                                <div
                                    key={`${img.productId}-${img.isMain ? "main" : `gallery-${img.imageIndex}`}`}
                                    onClick={() => handleImageClick(img)}
                                    role="button"
                                    tabIndex={0}
                                    className={`group relative flex flex-col overflow-hidden rounded-xl border bg-background shadow-sm transition-all hover:shadow-md cursor-pointer ${isSelected ? "ring-2 ring-primary ring-offset-2 border-primary" : "hover:border-primary/50"}`}
                                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleImageClick(img) } }}
                                >
                                    <div className="aspect-square w-full overflow-hidden bg-muted">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={img.url} alt={img.info.alt || img.productName} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                    </div>
                                    <div className="p-3 border-t bg-card text-center">
                                        <p className="line-clamp-2 text-xs font-medium leading-tight text-foreground transition-colors group-hover:text-primary">
                                            {img.info.title || img.productName}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-bold">
                                            {img.isMain ? "Main" : `Gallery ${img.imageIndex + 1}`}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Editor Panel — appears below when an image is clicked */}
                    {selected && (
                        <div className="bg-card border rounded-xl p-5 space-y-4 shadow-sm animate-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-primary/10 rounded-lg"><ImageIcon className="h-4 w-4 text-primary" /></div>
                                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                                        {selected.productName} — {selected.isMain ? "Main Image" : `Gallery ${selected.imageIndex + 1}`}
                                    </h4>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button type="button" size="sm" onClick={handleSave} disabled={saving}
                                        className={`gap-1.5 text-xs ${saved ? "bg-green-600 hover:bg-green-700" : ""}`}>
                                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <>✓ Saved</> : <><Save className="h-3.5 w-3.5" /> Save Info</>}
                                    </Button>
                                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setSelected(null)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Thumbnail + URL */}
                            <div className="flex items-start gap-4">
                                <div className="w-20 h-24 rounded-lg overflow-hidden border shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={selected.url} alt="Selected" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0 space-y-1.5">
                                    <Label className="text-[10px] uppercase text-muted-foreground font-bold">Image URL</Label>
                                    <div className="flex gap-1.5">
                                        <Input value={selected.url} readOnly className="h-8 text-xs bg-muted/50 text-muted-foreground cursor-default font-mono truncate" />
                                        <Button type="button" variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={handleCopyUrl}>
                                            {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Editable fields — all images */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-1.5">
                                    <Label className="text-[10px] uppercase text-muted-foreground font-bold">Alternative Text</Label>
                                    <Input value={editInfo.alt} onChange={(e) => setEditInfo(prev => ({ ...prev, alt: e.target.value }))} placeholder="Alternative text" className="h-8 text-xs" />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label className="text-[10px] uppercase text-muted-foreground font-bold">Title</Label>
                                    <Input value={editInfo.title} onChange={(e) => setEditInfo(prev => ({ ...prev, title: e.target.value }))} placeholder="Title" className="h-8 text-xs" />
                                </div>
                            </div>
                            <div className="grid gap-1.5">
                                <Label className="text-[10px] uppercase text-muted-foreground font-bold">Caption</Label>
                                <Input value={editInfo.caption} onChange={(e) => setEditInfo(prev => ({ ...prev, caption: e.target.value }))} placeholder="Caption" className="h-8 text-xs" />
                            </div>
                            <div className="grid gap-1.5">
                                <Label className="text-[10px] uppercase text-muted-foreground font-bold">Description</Label>
                                <textarea value={editInfo.description} onChange={(e) => setEditInfo(prev => ({ ...prev, description: e.target.value }))} placeholder="Description" rows={3}
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none" />
                            </div>
                        </div>
                    )}
                </>
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
