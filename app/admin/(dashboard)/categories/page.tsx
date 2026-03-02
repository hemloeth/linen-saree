"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, AlertTriangle, Check } from "lucide-react"
import { useCategory } from "@/context/category-context"

export default function CategoriesPage() {
    const { categories, addCategory, deleteCategory, loading, error } = useCategory()
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<{ _id: string; name: string } | null>(null)
    const [successToast, setSuccessToast] = useState<string | null>(null)

    useEffect(() => {
        if (successToast) {
            const timer = setTimeout(() => setSuccessToast(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [successToast])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !description || !imageFile) return

        try {
            await addCategory(name, description, imageFile)
            setSuccessToast(name)
            setName("")
            setDescription("")
            setImageFile(null)
            setImagePreview(null)
        } catch {
            // error is already set in context
        }
    }

    const confirmDelete = () => {
        if (deleteTarget) {
            deleteCategory(deleteTarget._id)
            setDeleteTarget(null)
        }
    }

    return (
        <div className="space-y-6">
            {/* Success Toast */}
            <div
                className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out ${successToast
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
                    }`}
            >
                <div className="bg-background border border-border shadow-2xl rounded-xl px-5 py-3 flex items-center gap-3 min-w-[280px] max-w-[90vw] sm:min-w-[340px]">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">Category Added</p>
                        <p className="text-xs text-muted-foreground truncate">&ldquo;{successToast}&rdquo; has been created successfully</p>
                    </div>
                </div>
            </div>

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

            {error && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

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
                            <Button type="submit" className="mt-2 w-full md:w-auto" disabled={loading}>
                                {loading ? "Adding..." : "Add Category"}
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
                                    {imagePreview ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={imagePreview}
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

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {categories.map((category) => (
                    <div
                        key={category._id}
                        className="group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                    >
                        <div className="relative aspect-[3/4] bg-gradient-to-br from-muted to-muted/50">
                            <Image
                                src={category.image}
                                alt={category.name}
                                fill
                                className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                            />

                            {/* Overlay with modern gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                            {/* Delete button */}
                            <button
                                onClick={() => setDeleteTarget({ _id: category._id, name: category.name })}
                                className="absolute top-2 right-2 z-10 p-2 bg-destructive/90 text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-[-10px] group-hover:translate-y-0 shadow-lg hover:bg-destructive"
                                title="Delete Category"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4 md:p-6 text-white">
                                <div className="transition-transform duration-500">
                                    <h3 className="font-serif font-medium text-sm sm:text-base md:text-lg lg:text-xl mb-1 sm:mb-2 leading-tight break-words">
                                        {category.name}
                                    </h3>
                                    <p className="text-white/90 mb-2 sm:mb-3 text-xs sm:text-sm line-clamp-2">
                                        {category.sortDesc}
                                    </p>
                                </div>
                            </div>

                            {/* Modern accent line */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/80 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-2">
                            <AlertTriangle className="h-6 w-6 text-destructive" />
                        </div>
                        <DialogTitle className="text-center">Delete Category</DialogTitle>
                        <DialogDescription className="text-center">
                            Are you sure you want to delete <strong>&ldquo;{deleteTarget?.name}&rdquo;</strong>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2 sm:justify-center pt-2">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

