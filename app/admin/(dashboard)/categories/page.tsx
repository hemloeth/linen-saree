"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const staticCategories = [
    {
        name: "Pure Linen",
        description: "Breathable, everyday linen sarees in solid and subtle weaves.",
        image: "/categories/pure-linen.jpg",
    },
    {
        name: "Banarasi Silk",
        description: "Rich banarasi silk sarees with intricate zari work.",
        image: "/categories/banarasi-silk.jpg",
    },
    {
        name: "Handloom",
        description: "Authentic handloom sarees woven by skilled artisans.",
        image: "/categories/handloom.jpg",
    },
    {
        name: "Silk Linen",
        description: "A luxurious blend of silk sheen and linen comfort.",
        image: "/categories/silk-linen.jpg",
    },
    {
        name: "Embroidery",
        description: "Delicate embroidered sarees perfect for special occasions.",
        image: "/categories/embroidery.jpg",
    },
    {
        name: "Kota Linen",
        description: "Feather-light kota linen sarees ideal for summer.",
        image: "/categories/kota-linen.jpg",
    },
    {
        name: "Cotton Linen",
        description: "Soft cotton-linen mix sarees for all-day wear.",
        image: "/categories/cotton-linen.jpg",
    },
    {
        name: "Bridal Collection",
        description: "Statement bridal sarees for your biggest moments.",
        image: "/categories/bridal-collection.jpg",
    },
]

export default function CategoriesPage() {
    const [categories, setCategories] = useState(staticCategories)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [image, setImage] = useState<string | null>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onloadend = () => {
            setImage(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !description || !image) return

        setCategories((prev) => [
            ...prev,
            {
                name,
                description,
                image,
            },
        ])

        setName("")
        setDescription("")
        setImage(null)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-serif text-primary">Categories</h2>
                    <p className="text-muted-foreground">
                        Manage your saree categories – name, description and imagery.
                    </p>
                </div>
                <Button asChild>
                    <a href="/admin/add-product">
                        Back to Add Product
                    </a>
                </Button>
            </div>

            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle className="text-base">Add Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="category-name">Name</Label>
                                <Input
                                    id="category-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Pure Linen"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="category-description">Short Description</Label>
                                <Input
                                    id="category-description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. Everyday breathable linen sarees"
                                    required
                                />
                            </div>
                            <Button type="submit" className="mt-2 w-full md:w-auto">
                                Add Category
                            </Button>
                        </div>
                        <div className="space-y-3">
                            <Label>Image</Label>
                            <div className="flex flex-col gap-3">
                                <Input
                                    id="category-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                <div className="relative h-32 w-full overflow-hidden rounded-md border bg-muted">
                                    {image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={image}
                                            alt="Category preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                                            Image preview will appear here
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {categories.map((category) => (
                    <Card key={category.name} className="overflow-hidden group">
                        <div className="relative h-40 w-full overflow-hidden">
                            <Image
                                src={category.image}
                                alt={category.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-base">
                                <span>{category.name}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {category.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

