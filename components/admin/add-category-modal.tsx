"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { FolderPlus } from "lucide-react"
import { useCategory } from "@/context/category-context"
import { AdminToast, ToastItem } from "@/components/admin/admin-toast"
import { AnimatedModal } from "@/components/admin/animated-modal"

interface AddCategoryModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (categoryName: string) => void
}

let toastId = 0

export function AddCategoryModal({ isOpen, onClose, onSuccess }: AddCategoryModalProps) {
    const { addCategory, loading } = useCategory()
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [toasts, setToasts] = useState<ToastItem[]>([])

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
            const savedName = name
            await addCategory(name, description, imageFile)
            onSuccess(savedName)

            // Reset
            setName("")
            setDescription("")
            setImageFile(null)
            setImagePreview(null)
            onClose()

            // Show a success toast
            showToast("Category Added", `"${savedName}" has been created successfully`)
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
                            <FolderPlus className="h-7 w-7 text-primary" />
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
                    <h3 className="text-lg font-semibold mb-1">Add Category</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Create a new category for your products.
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
                        <Label htmlFor="cat-name" className="text-xs font-bold">Name</Label>
                        <Input
                            id="cat-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Pure Linen"
                            required
                            className="h-9"
                        />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="cat-desc" className="text-xs font-bold">Description</Label>
                        <Input
                            id="cat-desc"
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
                            required={!imageFile}
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
                </motion.form>
            </AnimatedModal>
        </>
    )
}
