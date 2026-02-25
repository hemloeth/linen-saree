"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Plus } from "lucide-react"
import { ProductPreviewCard } from "@/components/admin/product-preview-card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const categories = [
    "Pure Linen",
    "Banarasi Silk",
    "Handloom",
    "Silk Linen",
    "Embroidery",
    "Kota Linen",
    "Cotton Linen",
    "Bridal Collection"
]

export default function AddProductPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [images, setImages] = useState<string[]>([])
    const [isDragging, setIsDragging] = useState(false)

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

    // Specification State
    const [material, setMaterial] = useState("")
    const [sareeSize, setSareeSize] = useState("")
    const [blouseSize, setBlouseSize] = useState("")
    const [washCare, setWashCare] = useState("")
    const [dispatch, setDispatch] = useState("")
    const [disclaimer, setDisclaimer] = useState("")
    const [internationalNote, setInternationalNote] = useState("")

    const handleFiles = (files: FileList | File[]) => {
        if (images.length >= 4) return

        const remainingSlots = 4 - images.length
        const filesToProcess = Array.from(files).slice(0, remainingSlots)

        filesToProcess.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onloadend = () => {
                    setImages(prev => [...prev, reader.result as string])
                }
                reader.readAsDataURL(file)
            }
        })
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files)
        }
    }

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index))
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
            image: images[0] || null,
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
            setImages([])
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
            alert("Product added successfully!")
        }, 1000)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-serif text-primary">Add Product</h2>
                <p className="text-muted-foreground">Create a new product in your catalog.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-8 bg-card p-6 rounded-lg border">
                        <div className="flex flex-col gap-4">
                            <Label>Product Image</Label>
                            <div
                                className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary"
                                    }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById("image-upload-page")?.click()}
                            >
                                <Input
                                    id="image-upload-page"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                                {images.length > 0 ? (
                                    <div className="relative w-full aspect-video rounded-md overflow-hidden group max-w-md">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={images[0]} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-sm font-medium">Change Image</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-center">
                                        <div className="p-4 bg-muted rounded-full">
                                            <Upload className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <div className="text-base font-medium">
                                            Click to upload or drag and drop
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            SVG, PNG, JPG or GIF (max. 800x400px)
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Linen Saree"
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="sku">SKU Code</Label>
                                <Input
                                    id="sku"
                                    value={sku}
                                    onChange={(e) => setSku(e.target.value)}
                                    placeholder="e.g. LS-001"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="short-description">Short Description</Label>
                                <Input
                                    id="short-description"
                                    value={shortDescription}
                                    onChange={(e) => setShortDescription(e.target.value)}
                                    placeholder="e.g. Soft pure linen saree with zari border"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={category}
                                    onValueChange={(value) => {
                                        if (value === "add-category") {
                                            router.push("/admin/categories")
                                            return
                                        }
                                        setCategory(value)
                                    }}
                                >
                                    <SelectTrigger id="category" className="w-full">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="add-category">
                                            + Add Category
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tags">Tags</Label>
                                <Input
                                    id="tags"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="e.g. linen, summer, handloom"
                                />
                            </div>

                            <div className="grid gap-3 border rounded-lg p-4 bg-muted/10">
                                <Label>Product Video (optional)</Label>
                                <div className="grid gap-2">
                                    <Label htmlFor="video-file" className="text-xs text-muted-foreground">
                                        Upload video file
                                    </Label>
                                    <Input
                                        id="video-file"
                                        type="file"
                                        accept="video/*"
                                        onChange={handleVideoFileChange}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="video-url" className="text-xs text-muted-foreground">
                                        Or paste video URL (YouTube, Vimeo, etc.)
                                    </Label>
                                    <Input
                                        id="video-url"
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="regular-price">Regular Price</Label>
                                    <Input
                                        id="regular-price"
                                        type="number"
                                        step="0.01"
                                        value={regularPrice}
                                        onChange={(e) => setRegularPrice(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Price</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="stock">Stock</Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 border rounded-lg p-4 bg-muted/5">
                                <h4 className="font-semibold text-primary/80">Product Specification</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="material">Material</Label>
                                        <Input
                                            id="material"
                                            value={material}
                                            onChange={(e) => setMaterial(e.target.value)}
                                            placeholder="e.g. 100% Pure Linen"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="wash-care">Wash Care</Label>
                                        <Input
                                            id="wash-care"
                                            value={washCare}
                                            onChange={(e) => setWashCare(e.target.value)}
                                            placeholder="e.g. Dry Clean Only"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="saree-size">Saree Size</Label>
                                        <Input
                                            id="saree-size"
                                            value={sareeSize}
                                            onChange={(e) => setSareeSize(e.target.value)}
                                            placeholder="e.g. 5.5 Meters"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="blouse-size">Blouse Size</Label>
                                        <Input
                                            id="blouse-size"
                                            value={blouseSize}
                                            onChange={(e) => setBlouseSize(e.target.value)}
                                            placeholder="e.g. 0.8 Meters"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="dispatch">Dispatch</Label>
                                        <Input
                                            id="dispatch"
                                            value={dispatch}
                                            onChange={(e) => setDispatch(e.target.value)}
                                            placeholder="e.g. Within 2-3 business days"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="disclaimer">Disclaimer</Label>
                                    <Input
                                        id="disclaimer"
                                        value={disclaimer}
                                        onChange={(e) => setDisclaimer(e.target.value)}
                                        placeholder="Color may slightly vary due to lighting"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="international-note">Note for International Orders</Label>
                                    <Input
                                        id="international-note"
                                        value={internationalNote}
                                        onChange={(e) => setInternationalNote(e.target.value)}
                                        placeholder="Custom duties extra as per your country"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={loading} size="lg">
                                {loading ? "Adding Product..." : "Create Product"}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Live Preview Section */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6 space-y-4">
                        <h3 className="text-lg font-semibold">Live Preview</h3>
                        <div className="border rounded-lg p-4 bg-background/50 backdrop-blur-sm">
                            <ProductPreviewCard
                                images={images}
                                name={name}
                                sku={sku}
                                category={category}
                                price={price}
                                regularPrice={regularPrice}
                                stock={stock}
                                tags={tags}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                            This is how your product will appear in the shop.
                        </p>
                    </div>
                </div>
            </div >
        </div >
    )
}
