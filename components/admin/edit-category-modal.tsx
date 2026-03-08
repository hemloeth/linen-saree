"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Pencil } from "lucide-react"
import { useCategory } from "@/context/category-context"
import { AdminToast, ToastItem } from "@/components/admin/admin-toast"
import { AnimatedModal } from "@/components/admin/animated-modal"

interface EditCategoryModalProps {
    isOpen: boolean
    onClose: () => void
    category: { _id: string; name: string; sortDesc: string; image: string } | null
}

let toastId = 0

export function EditCategoryModal({ isOpen, onClose, category }: EditCategoryModalProps) {
    const { updateCategory, loading } = useCategory()
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [toasts, setToasts] = useState<ToastItem[]>([])

    // Populate form when category changes
    useEffect(() => {
        if (category) {
            setName(category.name)
            setDescription(category.sortDesc)
            setImageFile(null)
            setImagePreview(category.image)
        }
    }, [category])

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
        if (!category || !name || !description) return

        try {
            await updateCategory(category._id, name, description, imageFile || undefined)
            onClose()
            showToast("Category Updated", `"${name}" has been updated successfully`)
        } catch {
            // error is handled in context
        }
    }

    return (
        <>
            <AdminToast toasts={toasts} onDismiss={dismissToast} />

            <AnimatedModal isOpen={isOpen} onClose={onClose} disableClose={loading}>
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
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                            <Pencil className="h-7 w-7 text-primary" />
                        </div>
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.4, opacity: 0 }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeOut",
                            }}
                            className="absolute inset-0 rounded-full border-2 border-primary/30"
                        />
                    </motion.div>
                </div>

                {/* Text */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                    className="text-center mb-5"
                >
                    <h3 className="text-lg font-semibold mb-1">Edit Category</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Update the category details below.
                    </p>
                </motion.div>

                {/* Form */}
                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="space-y-4"
                >
                    <div className="grid gap-1.5">
                        <Label htmlFor="edit-cat-name" className="text-xs font-bold">Name</Label>
                        <Input
                            id="edit-cat-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Pure Linen"
                            required
                            className="h-9"
                        />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="edit-cat-desc" className="text-xs font-bold">Description</Label>
                        <Input
                            id="edit-cat-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Short description..."
                            required
                            className="h-9"
                        />
                    </div>
                    <div className="grid gap-1.5">
                        <Label className="text-xs font-bold">Category Image</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="h-9 text-xs"
                        />
                        {imagePreview && (
                            <div className="relative h-28 w-full overflow-hidden rounded-lg border bg-muted">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 h-10 rounded-xl"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 h-10 rounded-xl relative overflow-hidden"
                            disabled={loading}
                        >
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
                                        Saving...
                                    </motion.span>
                                ) : (
                                    <motion.span
                                        key="idle"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        Save Changes
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Button>
                    </div>
                </motion.form>
            </AnimatedModal>
        </>
    )
}
