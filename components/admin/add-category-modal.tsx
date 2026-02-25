"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Upload } from "lucide-react"

interface AddCategoryModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (categoryName: string) => void
}

export function AddCategoryModal({ isOpen, onClose, onSuccess }: AddCategoryModalProps) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [image, setImage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

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

        setLoading(true)

        // Simulate a small delay for better UX
        setTimeout(() => {
            const saved = window.localStorage.getItem("adminCategories")
            const categories = saved ? JSON.parse(saved) : []

            const newCategory = { name, description, image }
            const updatedCategories = [...categories, newCategory]

            window.localStorage.setItem("adminCategories", JSON.stringify(updatedCategories))

            setLoading(false)
            onSuccess(name)

            // Reset
            setName("")
            setDescription("")
            setImage(null)
            onClose()
        }, 800)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Category</DialogTitle>
                        <DialogDescription>
                            Create a new category for your products.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="cat-name">Name</Label>
                            <Input
                                id="cat-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Pure Linen"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cat-desc">Description</Label>
                            <Input
                                id="cat-desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Short description..."
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Category Image</Label>
                            <div className="flex flex-col gap-3">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    required={!image}
                                />
                                {image && (
                                    <div className="relative h-32 w-full overflow-hidden rounded-md border bg-muted">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={image}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Adding..." : "Add Category"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
