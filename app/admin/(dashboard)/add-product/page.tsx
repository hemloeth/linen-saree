"use client"

import { useState } from "react"
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
    const [loading, setLoading] = useState(false)
    const [images, setImages] = useState<string[]>([])
    const [isDragging, setIsDragging] = useState(false)

    // Form State
    const [name, setName] = useState("")
    const [category, setCategory] = useState("")
    const [price, setPrice] = useState("")
    const [stock, setStock] = useState("")

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        // Simulate API call
        setTimeout(() => {
            setLoading(false)
            setImages([])
            setName("")
            setCategory("")
            setPrice("")
            setStock("")
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
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="e.g. Linen"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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
                                category={category}
                                price={price}
                                stock={stock}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                            This is how your product will appear in the shop.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
