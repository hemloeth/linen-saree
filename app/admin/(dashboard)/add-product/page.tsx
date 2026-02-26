"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Plus } from "lucide-react"
import { ProductPreviewCard } from "@/components/admin/product-preview-card"
import { SuccessModal } from "@/components/admin/success-modal"
import { Badge } from "@/components/ui/badge"
import { AddCategoryModal } from "@/components/admin/add-category-modal"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// No hardcoded categories

export default function AddProductPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [lastAddedName, setLastAddedName] = useState("")
    const [mainImage, setMainImage] = useState<string | null>(null)
    const [galleryImages, setGalleryImages] = useState<string[]>([])
    const [isDraggingMain, setIsDraggingMain] = useState(false)
    const [isDraggingGallery, setIsDraggingGallery] = useState(false)

    // Form State
    const [name, setName] = useState("")
    const [category, setCategory] = useState("")
    const [sku, setSku] = useState("")
    const [regularPrice, setRegularPrice] = useState("")
    const [price, setPrice] = useState("")
    const [stock, setStock] = useState("")
    const [shortDescription, setShortDescription] = useState("")
    const [tags, setTags] = useState("")
    const [videoUrl, setVideoUrl] = useState("")
    const [videoFile, setVideoFile] = useState<string | null>(null)
    const [color, setColor] = useState("")
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
    const [dynamicCategories, setDynamicCategories] = useState<string[]>([])

    const loadCategories = () => {
        if (typeof window !== "undefined") {
            const saved = window.localStorage.getItem("adminCategories")
            if (saved) {
                try {
                    const parsed = JSON.parse(saved)
                    if (Array.isArray(parsed)) {
                        setDynamicCategories(parsed.map((c: any) => c.name))
                    }
                } catch (e) {
                    console.error("Failed to load categories", e)
                }
            }
        }
    }

    // Load categories from localStorage
    useState(() => {
        loadCategories()
    })

    // Specification State
    const [material, setMaterial] = useState("")
    const [sareeSize, setSareeSize] = useState("")
    const [blouseSize, setBlouseSize] = useState("")
    const [washCare, setWashCare] = useState("")
    const [dispatch, setDispatch] = useState("")
    const [disclaimer, setDisclaimer] = useState("")
    const [internationalNote, setInternationalNote] = useState("")

    const handleMainImage = (files: FileList | File[]) => {
        const file = Array.from(files)[0]
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setMainImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleGalleryImages = (files: FileList | File[]) => {
        const filesToProcess = Array.from(files).filter(file => file.type.startsWith('image/'))
        const remainingSlots = 10 - galleryImages.length // Increased limit for gallery
        const limitedFiles = filesToProcess.slice(0, remainingSlots)

        limitedFiles.forEach(file => {
            const reader = new FileReader()
            reader.onloadend = () => {
                setGalleryImages(prev => [...prev, reader.result as string])
            }
            reader.readAsDataURL(file)
        })
    }

    const removeGalleryImage = (index: number) => {
        setGalleryImages(prev => prev.filter((_, i) => i !== index))
    }

    const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onloadend = () => {
            setVideoFile(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const currentName = name
        setLastAddedName(currentName)

        const newProduct = {
            id: Date.now(),
            name,
            sku,
            category,
            price,
            regularPrice,
            stock,
            shortDescription,
            tags,
            videoUrl,
            videoFile,
            image: mainImage,
            images: [mainImage, ...galleryImages].filter((img): img is string => img !== null),
            color,
            material,
            sareeSize,
            blouseSize,
            washCare,
            dispatch,
            disclaimer,
            internationalNote,
        }

        if (typeof window !== "undefined") {
            try {
                const existing = window.localStorage.getItem("adminProducts")
                const parsed = existing ? JSON.parse(existing) : []
                const updated = Array.isArray(parsed) ? [...parsed, newProduct] : [newProduct]
                window.localStorage.setItem("adminProducts", JSON.stringify(updated))
            } catch (err) {
                console.error("Failed to save product to localStorage", err)
            }
        }

        // Simulate API call
        setTimeout(() => {
            setLoading(false)
            // Clear all fields
            setMainImage(null)
            setGalleryImages([])
            setName("")
            setCategory("")
            setSku("")
            setRegularPrice("")
            setPrice("")
            setStock("")
            setShortDescription("")
            setTags("")
            setVideoUrl("")
            setVideoFile(null)
            setMaterial("")
            setSareeSize("")
            setBlouseSize("")
            setWashCare("")
            setDispatch("")
            setDisclaimer("")
            setInternationalNote("")
            setColor("")

            // Show Success Modal instead of alert
            setShowSuccessModal(true)
        }, 1000)
    }

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] overflow-hidden -m-4 md:-m-6">
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                productName={lastAddedName}
            />
            <AddCategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                onSuccess={(newCat) => {
                    loadCategories()
                    setCategory(newCat)
                }}
            />

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-6 border-b bg-background shrink-0">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight font-serif text-primary">Add Product</h2>
                    <p className="text-xs text-muted-foreground">Create a new product in your catalog.</p>
                </div>
            </div>

            {/* Main Content Area - Split Scroll */}
            <div className="flex flex-1 overflow-hidden divide-x">
                {/* Form Section - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-muted/5">
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
                        <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Main Image Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold text-primary">Main Display Image</Label>
                                        <Badge variant="default" className="bg-primary/90 text-[10px] py-0 h-5 px-2">PRIMARY</Badge>
                                    </div>
                                    <div
                                        className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 relative aspect-[4/5] ${isDraggingMain ? "border-primary bg-primary/10 ring-4 ring-primary/10" : "border-primary/20 bg-primary/5 hover:border-primary hover:bg-primary/[0.08]"
                                            }`}
                                        onDragOver={(e) => { e.preventDefault(); setIsDraggingMain(true); }}
                                        onDragLeave={() => setIsDraggingMain(false)}
                                        onDrop={(e) => { e.preventDefault(); setIsDraggingMain(false); if (e.dataTransfer.files) handleMainImage(e.dataTransfer.files); }}
                                        onClick={() => document.getElementById("main-image-upload")?.click()}
                                    >
                                        <Input
                                            id="main-image-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => e.target.files && handleMainImage(e.target.files)}
                                        />
                                        {mainImage ? (
                                            <div className="relative w-full h-full rounded-lg overflow-hidden group">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={mainImage} alt="Main Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Button size="sm" variant="secondary" className="font-bold">Replace</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-center gap-2">
                                                <div className="p-3 bg-background rounded-full shadow-sm">
                                                    <Upload className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="text-xs font-bold text-primary/80">Upload Main Photo</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Gallery Images Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold text-primary">Gallery Photos</Label>
                                        <Badge variant="outline" className="text-[10px] py-0 h-5 px-2">GALLERY</Badge>
                                    </div>
                                    <div
                                        className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 aspect-[4/5] ${isDraggingGallery ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-muted-foreground/20 bg-muted/30 hover:border-primary hover:bg-muted/50"
                                            }`}
                                        onDragOver={(e) => { e.preventDefault(); setIsDraggingGallery(true); }}
                                        onDragLeave={() => setIsDraggingGallery(false)}
                                        onDrop={(e) => { e.preventDefault(); setIsDraggingGallery(false); if (e.dataTransfer.files) handleGalleryImages(e.dataTransfer.files); }}
                                        onClick={() => document.getElementById("gallery-upload")?.click()}
                                    >
                                        <Input
                                            id="gallery-upload"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={(e) => e.target.files && handleGalleryImages(e.target.files)}
                                        />
                                        <div className="flex flex-col items-center text-center gap-2">
                                            <div className="p-3 bg-background rounded-full shadow-sm">
                                                <Plus className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="text-xs font-bold text-primary/80">Add Gallery Photos</div>
                                        </div>
                                    </div>
                                    {galleryImages.length > 0 && (
                                        <div className="grid grid-cols-4 gap-2 mt-4">
                                            {galleryImages.map((img, i) => (
                                                <div key={i} className="relative aspect-[4/5] rounded-lg overflow-hidden border group/item">
                                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); removeGalleryImage(i); }}
                                                        className="absolute top-1 right-1 p-1 bg-destructive/90 text-destructive-foreground rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="name" className="text-xs font-bold">Product Name</Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Linen Saree" required className="h-9" />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="sku" className="text-xs font-bold">SKU Code</Label>
                                    <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. LS-001" className="h-9" />
                                </div>
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="category" className="text-xs font-bold">Category</Label>
                                <Select value={category} onValueChange={(value) => value === "add-category" ? setIsCategoryModalOpen(true) : setCategory(value)}>
                                    <SelectTrigger id="category" className="h-9">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dynamicCategories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                        <SelectItem value="add-category">+ Add Category</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="regular-price" className="text-xs font-bold">Regular Price (₹)</Label>
                                    <Input id="regular-price" type="number" step="0.01" value={regularPrice} onChange={(e) => setRegularPrice(e.target.value)} placeholder="0.00" className="h-9" />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="price" className="text-xs font-bold">Sale Price (₹)</Label>
                                    <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" required className="h-9 border-primary/50" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="stock" className="text-xs font-bold">Available Stock</Label>
                                    <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" required className="h-9" />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="tags" className="text-xs font-bold">Tags</Label>
                                    <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. linen, summer" className="h-9" />
                                </div>
                            </div>

                            <div className="space-y-4 border rounded-xl p-5 bg-muted/10 border-primary/10">
                                <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Product Specifications</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="material" className="text-[10px] uppercase text-muted-foreground font-bold">Material</Label>
                                        <Input id="material" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="Pure Linen" className="h-8 text-xs" />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="wash-care" className="text-[10px] uppercase text-muted-foreground font-bold">Wash Care</Label>
                                        <Input id="wash-care" value={washCare} onChange={(e) => setWashCare(e.target.value)} placeholder="Dry Clean" className="h-8 text-xs" />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="color" className="text-[10px] uppercase text-muted-foreground font-bold">Color</Label>
                                        <Input id="color" value={color} onChange={(e) => setColor(e.target.value)} placeholder="Royal Blue" className="h-8 text-xs" />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="saree-size" className="text-[10px] uppercase text-muted-foreground font-bold">Saree Size</Label>
                                        <Input id="saree-size" value={sareeSize} onChange={(e) => setSareeSize(e.target.value)} placeholder="5.5m" className="h-8 text-xs" />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="blouse-size" className="text-[10px] uppercase text-muted-foreground font-bold">Blouse Size</Label>
                                        <Input id="blouse-size" value={blouseSize} onChange={(e) => setBlouseSize(e.target.value)} placeholder="0.8m" className="h-8 text-xs" />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="dispatch" className="text-[10px] uppercase text-muted-foreground font-bold">Dispatch</Label>
                                        <Input id="dispatch" value={dispatch} onChange={(e) => setDispatch(e.target.value)} placeholder="2-3 days" className="h-8 text-xs" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="disclaimer" className="text-[10px] uppercase text-muted-foreground font-bold">Disclaimer</Label>
                                        <Input id="disclaimer" value={disclaimer} onChange={(e) => setDisclaimer(e.target.value)} placeholder="Color variance note" className="h-8 text-xs" />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="international-note" className="text-[10px] uppercase text-muted-foreground font-bold">Intl Note</Label>
                                        <Input id="international-note" value={internationalNote} onChange={(e) => setInternationalNote(e.target.value)} placeholder="Custom duties" className="h-8 text-xs" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pb-8">
                            <Button type="submit" disabled={loading} size="lg" className="px-10 h-12 text-base font-bold shadow-lg shadow-primary/20">
                                {loading ? "Adding Product..." : "Create Product"}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Preview Section - Fixed/Solid */}
                <div className="w-[400px] shrink-0 bg-background border-l overflow-y-auto p-6 hidden xl:block custom-scrollbar">
                    <div className="sticky top-0 space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h3 className="text-lg font-bold tracking-tight">Live Preview</h3>
                            <Badge variant="outline" className="text-[10px]">REAL-TIME</Badge>
                        </div>
                        <div className="p-2 bg-card rounded-2xl border shadow-sm">
                            <ProductPreviewCard
                                images={[mainImage, ...galleryImages].filter((img): img is string => img !== null)}
                                name={name}
                                sku={sku}
                                category={category}
                                price={price}
                                regularPrice={regularPrice}
                                stock={stock}
                                color={color}
                                tags={tags}
                            />
                        </div>
                        <div className="bg-primary/[0.03] border border-primary/10 rounded-xl p-4">
                            <p className="text-[11px] text-muted-foreground leading-relaxed text-center">
                                This is a pixel-perfect representation of how your product will appear in the shop. Use this to ensure your images and details are optimally presented.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
