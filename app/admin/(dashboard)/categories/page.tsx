"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

const staticCategories = []

export default function CategoriesPage() {
    const [categories, setCategories] = useState<{ name: string; description: string; image: string }[]>([])
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [image, setImage] = useState<string | null>(null)

    // Load from localStorage
    useState(() => {
        if (typeof window !== "undefined") {
            const saved = window.localStorage.getItem("adminCategories")
            if (saved) {
                try {
                    const parsed = JSON.parse(saved)
                    if (Array.isArray(parsed)) setCategories(parsed)
                } catch (e) {
                    console.error("Failed to parse categories", e)
                }
            }
        }
    })

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

        const newCategories = [
            ...categories,
            {
                name,
                description,
                image,
            },
        ]
        setCategories(newCategories)

        if (typeof window !== "undefined") {
            window.localStorage.setItem("adminCategories", JSON.stringify(newCategories))
        }

        setName("")
        setDescription("")
        setImage(null)
    }

    const deleteCategory = (categoryName: string) => {
        const newCategories = categories.filter(c => c.name !== categoryName)
        setCategories(newCategories)
        if (typeof window !== "undefined") {
            window.localStorage.setItem("adminCategories", JSON.stringify(newCategories))
        }
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
                    <CardTitle className="text-base">Add New Category</CardTitle>
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
                                <div className="grid w-full items-center gap-1.5">
                                    <Input
                                        id="category-image"
                                        type="file"
                                        accept="image/*"
                                        className="cursor-pointer"
                                        onChange={handleImageChange}
                                    />
                                </div>
                                <div className="relative h-32 w-full overflow-hidden rounded-md border bg-muted">
                                    {image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={image}
                                            alt="Category preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground italic">
                                            (Category image will appear here)
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
                    <Card key={category.name} className="overflow-hidden group relative">
                        <button
                            onClick={() => deleteCategory(category.name)}
                            className="absolute top-2 right-2 z-10 p-2 bg-destructive/90 text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity translate-y-[-10px] group-hover:translate-y-0 duration-200 shadow-lg"
                            title="Delete Category"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className="relative h-48 w-full overflow-hidden">
                            <Image
                                src={category.image}
                                alt={category.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-serif">{category.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2 italic">
                                &ldquo;{category.description}&rdquo;
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

