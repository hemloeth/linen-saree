"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Trash2, Pencil, AlertTriangle } from "lucide-react"
import { useCategory } from "@/context/category-context"
import { AdminToast, ToastItem } from "@/components/admin/admin-toast"
import { ConfirmModal } from "@/components/admin/confirm-modal"
import { EditCategoryModal } from "@/components/admin/edit-category-modal"

let toastId = 0

export default function CategoriesPage() {
    const { categories, addCategory, deleteCategory, loading, error } = useCategory()
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<{ _id: string; name: string } | null>(null)
    const [editTarget, setEditTarget] = useState<{ _id: string; name: string; sortDesc: string; image: string } | null>(null)
    const [toasts, setToasts] = useState<ToastItem[]>([])
    const [isDeleting, setIsDeleting] = useState(false)

    const showToast = (title: string, message: string) => {
        const id = ++toastId
        setToasts((prev) => [...prev, { id, title, message }])
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 3000)
    }

    const dismissToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }

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
            showToast("Category Added", `"${name}" has been created successfully`)
            setName("")
            setDescription("")
            setImageFile(null)
            setImagePreview(null)
        } catch {
            // error is already set in context
        }
    }

    const confirmDelete = async () => {
        if (!deleteTarget) return
        const deletedName = deleteTarget.name
        setIsDeleting(true)

        try {
            await deleteCategory(deleteTarget._id)
            setDeleteTarget(null)
            showToast("Category Deleted", `"${deletedName}" has been deleted successfully`)
        } catch {
            // error is handled in context
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-6">
            <AdminToast toasts={toasts} onDismiss={dismissToast} />

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
                            <Button type="submit" className="mt-2 w-full md:w-auto relative overflow-hidden" disabled={loading}>
                                <AnimatePresence mode="wait">
                                    {loading ? (
                                        <motion.span
                                            key="loading"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex items-center gap-2"
                                        >
                                            <LoadingSpinner size="sm" />
                                            Adding...
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            key="idle"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            Add Category
                                        </motion.span>
                                    )}
                                </AnimatePresence>
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

                            {/* Edit & Delete buttons */}
                            <div className="absolute top-2 right-2 z-10 flex gap-1.5">
                                <button
                                    onClick={() => setEditTarget(category)}
                                    className="p-2 bg-primary/90 text-primary-foreground rounded-full transition-all duration-200 shadow-lg hover:bg-primary"
                                    title="Edit Category"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setDeleteTarget({ _id: category._id, name: category.name })}
                                    className="p-2 bg-destructive/90 text-destructive-foreground rounded-full transition-all duration-200 shadow-lg hover:bg-destructive"
                                    title="Delete Category"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

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
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                icon={<AlertTriangle className="h-7 w-7 text-destructive" />}
                title="Delete Category"
                description={
                    <p>
                        Are you sure you want to delete <strong className="text-foreground">&ldquo;{deleteTarget?.name}&rdquo;</strong>?
                        <br />
                        <span className="text-xs">This action cannot be undone.</span>
                    </p>
                }
                confirmLabel="Delete"
                loadingLabel="Deleting..."
            />

            {/* Edit Category Modal */}
            <EditCategoryModal
                isOpen={!!editTarget}
                onClose={() => setEditTarget(null)}
                category={editTarget}
            />
        </div>
    )
}

