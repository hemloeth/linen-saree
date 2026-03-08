"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Upload } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function AddProductModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [image, setImage] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [category, setCategory] = useState("")
    const router = useRouter()

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImage(reader.result as string)
            }
            reader.readAsDataURL(file)
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
        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        // Simulate API call
        setTimeout(() => {
            setLoading(false)
            setOpen(false)
            setImage(null) // Reset image after submit
        }, 1000)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                        <DialogDescription>
                            Enter the details of the new product here.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-4">
                            <Label className="text-left">Product Image</Label>
                            <div
                                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary"
                                    }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById("image-upload")?.click()}
                            >
                                <Input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                                {image ? (
                                    <div className="relative w-full aspect-video rounded-md overflow-hidden group">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-sm font-medium">Change Image</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-center">
                                        <div className="p-4 bg-muted rounded-full">
                                            <Upload className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <div className="text-sm font-medium">
                                            Click to upload or drag and drop
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            SVG, PNG, JPG or GIF (max. 800x400px)
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                defaultValue="Linen Saree"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="sku" className="text-right">
                                SKU Code
                            </Label>
                            <Input
                                id="sku"
                                placeholder="e.g. LS-001"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="short-description" className="text-right">
                                Short Description
                            </Label>
                            <Input
                                id="short-description"
                                placeholder="Short description of the product"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">
                                Category
                            </Label>
                            <Select
                                value={category}
                                onValueChange={(value) => {
                                    if (value === "add-category") {
                                        setOpen(false)
                                        router.push("/admin/categories")
                                        return
                                    }
                                    setCategory(value)
                                }}
                            >
                                <SelectTrigger id="category" className="col-span-3">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pure Linen">Pure Linen</SelectItem>
                                    <SelectItem value="Banarasi Silk">Banarasi Silk</SelectItem>
                                    <SelectItem value="Handloom">Handloom</SelectItem>
                                    <SelectItem value="Silk Linen">Silk Linen</SelectItem>
                                    <SelectItem value="Embroidery">Embroidery</SelectItem>
                                    <SelectItem value="Kota Linen">Kota Linen</SelectItem>
                                    <SelectItem value="Cotton Linen">Cotton Linen</SelectItem>
                                    <SelectItem value="Bridal Collection">Bridal Collection</SelectItem>
                                    <SelectItem value="add-category">
                                        + Add Category
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tags" className="text-right">
                                Tags
                            </Label>
                            <Input
                                id="tags"
                                placeholder="e.g. linen, festive, handloom"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="regular-price" className="text-right">
                                Regular Price
                            </Label>
                            <Input
                                id="regular-price"
                                placeholder="0.00"
                                className="col-span-3"
                                type="number"
                                step="0.01"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                Price
                            </Label>
                            <Input
                                id="price"
                                defaultValue="99.99"
                                className="col-span-3"
                                required
                                type="number"
                                step="0.01"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="stock" className="text-right">
                                Stock
                            </Label>
                            <Input
                                id="stock"
                                defaultValue="10"
                                className="col-span-3"
                                required
                                type="number"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Adding..." : "Add Product"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
