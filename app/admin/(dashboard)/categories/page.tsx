"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Trash2, AlertTriangle, Check, X } from "lucide-react"
import { useCategory } from "@/context/category-context"

interface Toast {
    id: number
    type: "added" | "deleted"
    name: string
}

let toastId = 0

export default function CategoriesPage() {
    const { categories, addCategory, deleteCategory, loading, error } = useCategory()
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<{ _id: string; name: string } | null>(null)
    const [toasts, setToasts] = useState<Toast[]>([])
    const [isDeleting, setIsDeleting] = useState(false)

    const showToast = (type: "added" | "deleted", toastName: string) => {
        const id = ++toastId
        setToasts((prev) => [...prev, { id, type, name: toastName }])
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
            showToast("added", name)
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
            showToast("deleted", deletedName)
        } catch {
            // error is handled in context
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Animated Toasts */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            layout
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 25,
                            }}
                            className="bg-background border border-border shadow-2xl rounded-xl px-5 py-3 flex items-center gap-3 min-w-[280px] max-w-[90vw] sm:min-w-[340px]"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.1 }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${toast.type === "added" ? "bg-green-500" : "bg-red-500"
                                    }`}
                            >
                                {toast.type === "added" ? (
                                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                ) : (
                                    <Trash2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                                )}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold ${toast.type === "added"
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                    }`}>
                                    {toast.type === "added" ? "Category Added" : "Category Deleted"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    &ldquo;{toast.name}&rdquo; has been {toast.type === "added" ? "created" : "deleted"} successfully
                                </p>
                            </div>
                            <button
                                onClick={() => dismissToast(toast.id)}
                                className="p-1 rounded-full hover:bg-muted transition-colors flex-shrink-0"
                            >
                                <X className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
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
            <AnimatePresence>
                {deleteTarget && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                            onClick={() => !isDeleting && setDeleteTarget(null)}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 28,
                            }}
                            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm"
                        >
                            <div className="bg-background rounded-2xl border shadow-2xl p-6 mx-4">
                                {/* Animated icon */}
                                <div className="flex justify-center mb-5">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 20,
                                            delay: 0.1,
                                        }}
                                        className="relative"
                                    >
                                        <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                                            <AlertTriangle className="h-7 w-7 text-destructive" />
                                        </div>
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1.4, opacity: 0 }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: "easeOut",
                                            }}
                                            className="absolute inset-0 rounded-full border-2 border-destructive/30"
                                        />
                                    </motion.div>
                                </div>

                                {/* Text */}
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15, duration: 0.3 }}
                                    className="text-center mb-6"
                                >
                                    <h3 className="text-lg font-semibold mb-1.5">Delete Category</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Are you sure you want to delete <strong className="text-foreground">&ldquo;{deleteTarget.name}&rdquo;</strong>?
                                        <br />
                                        <span className="text-xs">This action cannot be undone.</span>
                                    </p>
                                </motion.div>

                                {/* Buttons */}
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.3 }}
                                    className="flex gap-3"
                                >
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-10 rounded-xl"
                                        onClick={() => setDeleteTarget(null)}
                                        disabled={isDeleting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1 h-10 rounded-xl relative overflow-hidden"
                                        onClick={confirmDelete}
                                        disabled={isDeleting}
                                    >
                                        <AnimatePresence mode="wait">
                                            {isDeleting ? (
                                                <motion.span
                                                    key="deleting"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <LoadingSpinner size="sm" />
                                                    Deleting...
                                                </motion.span>
                                            ) : (
                                                <motion.span
                                                    key="idle"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    Delete
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

