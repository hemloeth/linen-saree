"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import imageCompression from "browser-image-compression"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Plus, ArrowLeft } from "lucide-react"
import { ProductPreviewCard } from "@/components/admin/product-preview-card"
import { SuccessModal } from "@/components/admin/success-modal"
import { Badge } from "@/components/ui/badge"
import { AddCategoryModal } from "@/components/admin/add-category-modal"
import { useCategory } from "@/context/category-context"
import { useProducts } from "@/context/product-context"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { resolveMediaUrl } from "@/lib/media"

export default function EditProductPage() {
    const router = useRouter()
    const params = useParams()
    const productId = params.id as string
    const { products, updateProduct, uploadVideo, loading } = useProducts()
    const { categories: dbCategories } = useCategory()

    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [lastAddedName, setLastAddedName] = useState("")
    const [mainImage, setMainImage] = useState<string | null>(null)
    const [mainImageFile, setMainImageFile] = useState<File | null>(null)
    const [galleryImages, setGalleryImages] = useState<string[]>([])
    const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([])
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
    const [videoFileRaw, setVideoFileRaw] = useState<File | null>(null)
    const [color, setColor] = useState("")
    const [isOnSale, setIsOnSale] = useState(false)
    const [productCollection, setProductCollection] = useState("")
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
    const [dbCollections, setDbCollections] = useState<any[]>([])

    // Fetch marketing collections
    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'}/api/marketing-collections`)
                const data = await res.json().catch(() => null)
                if (data && data.success) {
                    setDbCollections(data.data)
                }
            } catch (e) {
                console.warn("Failed to fetch collections inside edit-product dashboard:", e)
            }
        }
        fetchCollections()
    }, [])

    // Specification State
    const [material, setMaterial] = useState("")
    const [sareeSize, setSareeSize] = useState("")
    const [blouseSize, setBlouseSize] = useState("")
    const [washCare, setWashCare] = useState("")
    const [dispatch, setDispatch] = useState("2-3 days")
    const [disclaimer, setDisclaimer] = useState("Actual product color may differ slightly from the images due to lighting and display differences.")
    const [internationalNote, setInternationalNote] = useState("Custom duties")

    // Fetch full product data from API to ensure we get excluded fields like galleryImages
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'}/api/products/${productId}`);
                const data = await res.json();
                if (data && data.success && data.product) {
                    const product = data.product;
                    setName(product.name || "")
                    setSku(product.sku || "")
                    setCategory(product.category || "")
                    setRegularPrice(product.regularPrice?.toString() || "")
                    setPrice(product.price?.toString() || "")
                    setStock(product.stock?.toString() || "")
                    setShortDescription(product.shortDescription || "")
                    setTags(product.tags || "")
                    setVideoUrl(product.videoUrl || "")
                    setColor(product.color || "")
                    setMaterial(product.material || "")
                    setSareeSize("5.5 mtr")
                    setBlouseSize("95 cm")
                    setWashCare("Dry clean recommended")
                    setDispatch(product.dispatch || "2-3 days")
                    setDisclaimer(product.disclaimer || "Actual product color may differ slightly from the images due to lighting and display differences.")
                    setInternationalNote(product.internationalNote || "Custom duties")
                    setIsOnSale(product.isOnSale || false)
                    setProductCollection(product.productCollection || 
                                        (product.isFestive ? "festive" : 
                                         product.isOnSale ? "big-sale" : "none"))
                    // Set existing images as previews
                    if (product.mainImage) setMainImage(product.mainImage)
                    if (product.galleryImages?.length) {
                        // Handle both old string[] format and new object[] format
                        const urls = product.galleryImages.map((img: any) =>
                            typeof img === "string" ? img : img.url
                        )
                        setGalleryImages(urls)
                    }
                    if (product.videoFile) setVideoFile(product.videoFile)
                }
            } catch (err) {
                console.error("Failed to fetch product details:", err);
            }
        };
        fetchProduct();
    }, [productId])

    const handleMainImage = (files: FileList | File[]) => {
        const file = Array.from(files)[0]
        if (file && file.type.startsWith('image/')) {
            setMainImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setMainImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleGalleryImages = (files: FileList | File[]) => {
        const filesToProcess = Array.from(files).filter(file => file.type.startsWith('image/'))
        const remainingSlots = 10 - galleryImages.length
        const limitedFiles = filesToProcess.slice(0, remainingSlots)

        limitedFiles.forEach(file => {
            setGalleryImageFiles(prev => [...prev, file])
            const reader = new FileReader()
            reader.onloadend = () => {
                setGalleryImages(prev => [...prev, reader.result as string])
            }
            reader.readAsDataURL(file)
        })
    }

    const removeGalleryImage = (index: number) => {
        setGalleryImages(prev => prev.filter((_, i) => i !== index))
        setGalleryImageFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setVideoFileRaw(file)
        const reader = new FileReader()
        reader.onloadend = () => {
            setVideoFile(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLastAddedName(name)

        try {
            const compressionOptions = {
                maxSizeMB: 2,
                maxWidthOrHeight: 1920,
                useWebWorker: false, // Disabled to prevent potential browser hangs
            };

            const formData = new FormData()
            formData.append("name", name)
            formData.append("sku", sku)
            formData.append("category", category)
            formData.append("regularPrice", regularPrice)
            formData.append("price", price)
            formData.append("stock", stock)
            formData.append("shortDescription", shortDescription)
            formData.append("tags", tags)
            formData.append("videoUrl", videoUrl)
            formData.append("color", color)
            formData.append("material", material)
            formData.append("sareeSize", sareeSize)
            formData.append("blouseSize", blouseSize)
            formData.append("washCare", washCare)
            formData.append("dispatch", dispatch)
            formData.append("disclaimer", disclaimer)
            formData.append("internationalNote", internationalNote)
            formData.append("isOnSale", String(isOnSale))
            formData.append("productCollection", productCollection)

            // Only append image files if new ones were selected
            if (mainImageFile) {
                const compressedMainImage = await imageCompression(mainImageFile, compressionOptions);
                formData.append("mainImage", compressedMainImage, compressedMainImage.name)
            }
            if (galleryImageFiles.length > 0) {
                const compressedGalleryImages = await Promise.all(
                    galleryImageFiles.map(file => imageCompression(file, compressionOptions))
                );
                compressedGalleryImages.forEach((file) => formData.append("galleryImages", file, file.name))
            }

            if (videoFileRaw) {
                formData.append("videoFile", videoFileRaw)
            }

            const product = await updateProduct(productId, formData)

            // Show Success Modal
            setShowSuccessModal(true)
        } catch (err) {
            console.error("Failed to update product", err)
        }
    }

    return (
        <div className="-m-4 md:-m-6">
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false)
                    router.push("/admin/products")
                }}
                productName={lastAddedName}
                title="Product Updated!"
                description="has been successfully updated in your catalog."
            />
            <AddCategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                onSuccess={(newCat) => {
                    setCategory(newCat)
                }}
            />

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-6 border-b bg-background shrink-0">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/admin/products")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight font-serif text-primary">Edit Product</h2>
                        <p className="text-xs text-muted-foreground">Update product details.</p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col xl:flex-row">
                {/* Form Section */}
                <div className="flex-1 p-4 md:p-6 bg-muted/5">
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
                                        onClick={() => document.getElementById("edit-main-image-upload")?.click()}
                                    >
                                        <Input
                                            id="edit-main-image-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => e.target.files && handleMainImage(e.target.files)}
                                        />
                                        {mainImage ? (
                                            <div className="relative w-full h-full rounded-lg overflow-hidden group">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={resolveMediaUrl(mainImage)} alt="Main Preview" className="w-full h-full object-cover" />
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
                                        onClick={() => document.getElementById("edit-gallery-upload")?.click()}
                                    >
                                        <Input
                                            id="edit-gallery-upload"
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
                                                    <img src={resolveMediaUrl(img)} alt="" className="w-full h-full object-cover" />
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
                                    <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. LS-001" required className="h-9" />
                                </div>
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="category" className="text-xs font-bold">Category</Label>
                                <Select value={category} onValueChange={(value) => value === "add-category" ? setIsCategoryModalOpen(true) : setCategory(value)}>
                                    <SelectTrigger id="category" className="h-9">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dbCategories.map((cat) => <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>)}
                                        <SelectItem value="add-category">+ Add Category</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="regular-price" className="text-xs font-bold">Regular Price (₹)</Label>
                                    <Input id="regular-price" type="number" step="0.01" value={regularPrice} onChange={(e) => setRegularPrice(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="0.00" required className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="price" className="text-xs font-bold">Sale Price (₹)</Label>
                                    <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="0.00" required className="h-9 border-primary/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="stock" className="text-xs font-bold">Available Stock</Label>
                                    <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="0" required className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="tags" className="text-xs font-bold">Tags</Label>
                                    <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. linen, summer" required className="h-9" />
                                </div>
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="short-description" className="text-xs font-bold">Short Description</Label>
                                <textarea id="short-description" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="Brief description of the product" required rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none" />
                            </div>

                            <div className="space-y-4 border rounded-xl p-5 bg-muted/10 border-primary/10">
                                <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Product Specifications</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="material" className="text-[10px] uppercase text-muted-foreground font-bold">Material</Label>
                                        <Input id="material" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="Pure Linen" required className="h-8 text-xs" />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="wash-care" className="text-[10px] uppercase text-muted-foreground font-bold">Wash Care</Label>
                                        <Input id="wash-care" value={washCare} disabled className="h-8 text-xs bg-muted/50 cursor-not-allowed opacity-80" />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="color" className="text-[10px] uppercase text-muted-foreground font-bold">Color</Label>
                                        <Input id="color" value={color} onChange={(e) => setColor(e.target.value)} placeholder="Royal Blue" required className="h-8 text-xs" />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="saree-size" className="text-[10px] uppercase text-muted-foreground font-bold">Saree Size</Label>
                                        <Input id="saree-size" value={sareeSize} disabled className="h-8 text-xs bg-muted/50 cursor-not-allowed opacity-80" />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="blouse-size" className="text-[10px] uppercase text-muted-foreground font-bold">Blouse Size</Label>
                                        <Input id="blouse-size" value={blouseSize} disabled className="h-8 text-xs bg-muted/50 cursor-not-allowed opacity-80" />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="dispatch" className="text-[10px] uppercase text-muted-foreground font-bold">Dispatch</Label>
                                        <Input id="dispatch" value={dispatch} readOnly className="h-8 text-xs bg-muted/50 cursor-not-allowed" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="disclaimer" className="text-[10px] uppercase text-muted-foreground font-bold">Disclaimer</Label>
                                        <Input id="disclaimer" value={disclaimer} readOnly className="h-8 text-xs bg-muted/50 cursor-not-allowed" />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="international-note" className="text-[10px] uppercase text-muted-foreground font-bold">Intl Note</Label>
                                        <Input id="international-note" value={internationalNote} readOnly className="h-8 text-xs bg-muted/50 cursor-not-allowed" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="collection" className="text-xs font-bold text-primary uppercase tracking-wider">Product Collection</Label>
                                    <Select value={productCollection} onValueChange={setProductCollection}>
                                        <SelectTrigger id="collection" className="h-12 border-primary/20 bg-primary/5">
                                            <SelectValue placeholder="Normal Collection" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Normal Collection</SelectItem>
                                            {dbCollections.map((col) => (
                                                <SelectItem key={col.key} value={col.key}>
                                                    {col.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-muted-foreground px-1">Select a special collection to feature this product.</p>
                                </div>
                            </div>
                        </div>

                        {/* Video Section */}
                        <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Product Video</h4>
                                <Badge variant="outline" className="text-[10px] py-0 h-5 px-2">OPTIONAL</Badge>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold">Upload Video File</Label>
                                <div
                                    className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border-muted-foreground/20 bg-muted/30 hover:border-primary hover:bg-muted/50"
                                    onClick={() => document.getElementById("edit-video-upload")?.click()}
                                >
                                    <Input
                                        id="edit-video-upload"
                                        type="file"
                                        accept="video/*"
                                        className="hidden"
                                        onChange={handleVideoFileChange}
                                    />
                                    {videoFile ? (
                                        <div className="flex flex-col items-center gap-2 w-full">
                                            <video
                                                src={resolveMediaUrl(videoFile)}
                                                className="w-full max-h-60 rounded-lg object-cover"
                                                muted
                                            />
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-green-600 font-semibold">Video uploaded</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setVideoFile(null); setVideoFileRaw(null); }}
                                                    className="text-xs text-destructive hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center text-center gap-2">
                                            <div className="p-3 bg-background rounded-full shadow-sm">
                                                <Upload className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="text-xs font-bold text-primary/80">Upload Video</div>
                                            <p className="text-[10px] text-muted-foreground">MP4, WebM, MOV</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pb-8">
                            <Button type="button" variant="outline" onClick={() => router.push("/admin/products")} size="lg" className="px-8 h-12 text-base font-bold">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} size="lg" className="px-10 h-12 text-base font-bold shadow-lg shadow-primary/20">
                                {loading ? "Updating Product..." : "Update Product"}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Preview Section */}
                <div className="w-full xl:w-[400px] shrink-0 bg-background xl:border-l p-6 hidden xl:block">
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
