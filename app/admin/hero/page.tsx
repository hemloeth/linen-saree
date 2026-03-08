"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Images, Loader2, Upload, Trash2, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminToast, ToastItem } from "@/components/admin/admin-toast"
import Image from "next/image"

interface HeroSlide {
    _id: string
    image: string
    title: string
    subtitle: string
    description: string
    category: string
    link: string
}

export default function HeroAdminPage() {
    const [slides, setSlides] = useState<HeroSlide[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [toasts, setToasts] = useState<ToastItem[]>([])

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        description: "",
        category: "",
        link: ""
    })
    const [previewImage, setPreviewImage] = useState<string>("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    useEffect(() => {
        fetchSlides()
    }, [])

    const fetchSlides = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/hero`)
            const data = await res.json()
            if (data.success && data.slides) {
                setSlides(data.slides)
            }
        } catch (error) {
            console.error("Error fetching hero slides:", error)
            setToasts(prev => [...prev, { id: Date.now(), title: "Error", message: "Failed to load hero slides" }])
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (slideId: string) => {
        if (!confirm("Are you sure you want to delete this slide?")) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/hero/${slideId}`, {
                method: "DELETE"
            })
            const data = await res.json()

            if (data.success) {
                setSlides(data.slides) // Update local state with the returned new array
                setToasts(prev => [...prev, { id: Date.now(), title: "Success", message: "Slide deleted successfully" }])
            } else {
                throw new Error(data.message)
            }
        } catch (error) {
            console.error("Error deleting slide:", error)
            setToasts(prev => [...prev, { id: Date.now(), title: "Error", message: error instanceof Error ? error.message : "Failed to delete slide" }])
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            setPreviewImage(URL.createObjectURL(file))
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedFile) {
            setToasts(prev => [...prev, { id: Date.now(), title: "Validation Error", message: "An image is required for a new slide." }])
            return;
        }

        setIsSaving(true)

        const submitData = new FormData()
        submitData.append("title", formData.title)
        submitData.append("subtitle", formData.subtitle)
        submitData.append("description", formData.description)
        submitData.append("category", formData.category)
        submitData.append("link", "/collections")
        submitData.append("image", selectedFile)

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/hero`, {
                method: "POST",
                body: submitData
            })

            const data = await res.json()

            if (data.success) {
                setToasts(prev => [...prev, { id: Date.now(), title: "Success", message: "New slide added successfully" }])
                setSlides(data.slides)
                setIsModalOpen(false)

                // Reset form
                setFormData({ title: "", subtitle: "", description: "", category: "", link: "" })
                setPreviewImage("")
                setSelectedFile(null)
            } else {
                throw new Error(data.message || "Failed to add hero slide")
            }
        } catch (error) {
            console.error("Error saving hero slide:", error)
            setToasts(prev => [...prev, { id: Date.now(), title: "Error", message: error instanceof Error ? error.message : "Failed to save changes" }])
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <AdminToast toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-serif mb-2">Manage Hero Slides</h1>
                    <p className="text-muted-foreground">Add, edit, or remove slides from your scrolling hero section.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add New Slide
                </Button>
            </div>

            {/* Existing Slides Grid */}
            {slides.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-dashed">
                    <Images className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No slides found</h3>
                    <p className="text-muted-foreground mb-4">You currently have no slides in your hero section.</p>
                    <Button variant="outline" onClick={() => setIsModalOpen(true)}>Create your first slide</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {slides.map((slide) => (
                            <motion.div
                                key={slide._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-card rounded-xl overflow-hidden shadow-sm border group"
                            >
                                <div className="aspect-video relative bg-muted">
                                    <Image src={slide.image} alt={slide.title} fill className="object-cover object-top" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(slide._id)}>
                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-4 space-y-2">
                                    <div className="flex justify-between items-start gap-4">
                                        <h3 className="font-serif font-medium text-lg truncate leading-tight">{slide.title}</h3>
                                        <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full shrink-0">{slide.category}</span>
                                    </div>
                                    <p className="text-sm text-foreground/80 truncate italic">{slide.subtitle}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{slide.description}</p>
                                    <p className="text-xs text-muted-foreground font-mono truncate pt-2 border-t">Link: {slide.link}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Add Slide Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-background w-full max-w-2xl rounded-xl shadow-lg border relative flex flex-col max-h-full"
                    >
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-6 border-b shrink-0">
                            <h2 className="text-2xl font-serif">Add New Slide</h2>
                        </div>

                        <form onSubmit={handleAddSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]" data-lenis-prevent>
                            <div className="space-y-4">
                                <label className="text-sm font-medium">Slide Image</label>
                                <div className="relative aspect-video w-full bg-muted rounded-lg border-2 border-dashed overflow-hidden flex flex-col items-center justify-center group">
                                    {previewImage ? (
                                        <>
                                            <Image src={previewImage} alt="Preview" fill className="object-cover object-top" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors">
                                                    <Upload className="w-4 h-4" /> Change Image
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                                </label>
                                            </div>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center gap-4 text-muted-foreground hover:text-foreground transition-colors p-8 text-center">
                                            <Images className="w-8 h-8" />
                                            <p className="font-medium">Click to upload image</p>
                                            <p className="text-xs">Required. Optimal size: 1920x1080px (16:9)</p>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} required />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-4">
                                    <label className="text-sm font-medium">Main Title</label>
                                    <input type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Banarasi Elegance" name="title" value={formData.title} onChange={handleChange} required />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-sm font-medium">Subtitle</label>
                                    <input type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Traditional Silk Sarees" name="subtitle" value={formData.subtitle} onChange={handleChange} required />
                                </div>
                                <div className="space-y-4 md:col-span-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <textarea className="w-full min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Enter full description..." name="description" value={formData.description} onChange={handleChange} required />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-sm font-medium">Category Badge Text</label>
                                    <input type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Banarasi Collection" name="category" value={formData.category} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSaving || !selectedFile} className="min-w-[120px]">
                                    {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving</> : "Add Slide"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
