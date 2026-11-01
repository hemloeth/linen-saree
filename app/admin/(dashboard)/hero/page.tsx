"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Images, Loader2, Upload, Trash2, Plus, X, Edit, LayoutTemplate, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminToast, ToastItem } from "@/components/admin/admin-toast"
import Image from "next/image"
import imageCompression from "browser-image-compression"
import { apiGet, apiDelete, apiUpload } from "@/lib/api"
import { resolveMediaUrl } from "@/lib/media"

interface HeroSlide {
    _id: string
    image: string
    title: string
    subtitle: string
    description: string
    category: string
    link: string
    buttonText?: string
    secondaryButtonText?: string
    secondaryLink?: string
    badge?: string
    layoutStyle?: 'editorial-split' | 'cinematic-canvas' | 'asymmetric-showcase' | string
}

const LAYOUT_OPTIONS = [
    { value: "editorial-split", label: "Editorial Split (Sabyasachi-style)" },
    { value: "cinematic-canvas", label: "Cinematic Canvas (Full-Bleed Lookbook)" },
    { value: "asymmetric-showcase", label: "Asymmetric Showcase (Modern Curated)" }
]

export default function HeroAdminPage() {
    const [slides, setSlides] = useState<HeroSlide[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)
    const [toasts, setToasts] = useState<ToastItem[]>([])

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        description: "",
        category: "",
        badge: "",
        link: "/collections",
        buttonText: "Explore Atelier",
        secondaryButtonText: "",
        secondaryLink: "",
        layoutStyle: "editorial-split"
    })
    const [previewImage, setPreviewImage] = useState<string>("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    useEffect(() => {
        fetchSlides()
    }, [])

    const fetchSlides = async () => {
        try {
            const data = await apiGet('/api/hero')
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

    const openAddModal = () => {
        setEditingSlide(null)
        setFormData({
            title: "",
            subtitle: "",
            description: "",
            category: "",
            badge: "",
            link: "/collections",
            buttonText: "Explore Collection",
            secondaryButtonText: "",
            secondaryLink: "",
            layoutStyle: "editorial-split"
        })
        setPreviewImage("")
        setSelectedFile(null)
        setIsModalOpen(true)
    }

    const openEditModal = (slide: HeroSlide) => {
        setEditingSlide(slide)
        setFormData({
            title: slide.title || "",
            subtitle: slide.subtitle || "",
            description: slide.description || "",
            category: slide.category || "",
            badge: slide.badge || slide.category || "",
            link: slide.link || "/collections",
            buttonText: slide.buttonText || "Explore Collection",
            secondaryButtonText: slide.secondaryButtonText || "",
            secondaryLink: slide.secondaryLink || "",
            layoutStyle: slide.layoutStyle || "editorial-split"
        })
        setPreviewImage(resolveMediaUrl(slide.image))
        setSelectedFile(null)
        setIsModalOpen(true)
    }

    const handleDelete = async (slideId: string) => {
        if (!confirm("Are you sure you want to delete this hero slide?")) return;

        try {
            const data = await apiDelete(`/api/hero/${slideId}`)
            if (data.success) {
                setSlides(data.slides)
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!editingSlide && !selectedFile) {
            setToasts(prev => [...prev, { id: Date.now(), title: "Validation Error", message: "An image is required for a new slide." }])
            return;
        }

        setIsSaving(true)

        try {
            const submitData = new FormData()
            submitData.append("title", formData.title)
            submitData.append("subtitle", formData.subtitle)
            submitData.append("description", formData.description)
            submitData.append("category", formData.category)
            submitData.append("badge", formData.badge || formData.category)
            submitData.append("link", formData.link)
            submitData.append("buttonText", formData.buttonText)
            submitData.append("secondaryButtonText", formData.secondaryButtonText)
            submitData.append("secondaryLink", formData.secondaryLink)
            submitData.append("layoutStyle", formData.layoutStyle)

            if (selectedFile) {
                const compressionOptions = {
                    maxSizeMB: 2,
                    maxWidthOrHeight: 1920,
                    useWebWorker: false,
                };
                const compressedImage = await imageCompression(selectedFile, compressionOptions);
                submitData.append("image", compressedImage, compressedImage.name)
            }

            let data
            if (editingSlide) {
                data = await apiUpload(`/api/hero/${editingSlide._id}`, submitData, 'PUT')
            } else {
                data = await apiUpload('/api/hero', submitData, 'POST')
            }

            if (data.success) {
                setToasts(prev => [...prev, {
                    id: Date.now(),
                    title: "Success",
                    message: editingSlide ? "Slide updated successfully" : "New slide added successfully"
                }])
                setSlides(data.slides)
                setIsModalOpen(false)
            } else {
                throw new Error(data.message || "Failed to save slide")
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
        <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
            <AdminToast toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-serif text-primary font-bold">Manage Hero Section</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        Customize slides, choose distinct UI layout styles, and edit copy in real time.
                    </p>
                </div>
                <Button onClick={openAddModal} className="flex items-center gap-2 rounded-none shadow-md">
                    <Plus className="w-4 h-4" /> Add New Slide
                </Button>
            </div>

            {/* Slides Grid */}
            {slides.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-none border border-dashed p-8">
                    <Images className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No hero slides found</h3>
                    <p className="text-sm text-muted-foreground mb-4">You currently have no slides in your hero section.</p>
                    <Button variant="outline" onClick={openAddModal} className="rounded-none">Create your first slide</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {slides.map((slide, index) => {
                            const layoutName = LAYOUT_OPTIONS.find(o => o.value === slide.layoutStyle)?.label || `UI Variant ${index + 1}`

                            return (
                                <motion.div
                                    key={slide._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-card rounded-none overflow-hidden shadow-sm border border-border group flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Image Preview & Actions */}
                                        <div className="aspect-[16/9] relative bg-muted overflow-hidden">
                                            <Image
                                                src={resolveMediaUrl(slide.image)}
                                                alt={slide.title}
                                                fill
                                                className="object-cover object-top"
                                            />
                                            {/* Layout Style Pill */}
                                            <div className="absolute top-2 left-2 z-10 bg-black/75 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono px-2 py-0.5 uppercase tracking-wider">
                                                {slide.layoutStyle || `Style #${index + 1}`}
                                            </div>

                                            {/* Hover Actions */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 p-4 z-20">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => openEditModal(slide)}
                                                    className="rounded-none gap-1.5 cursor-pointer text-xs font-semibold"
                                                >
                                                    <Edit className="w-3.5 h-3.5" /> Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(slide._id)}
                                                    className="rounded-none gap-1.5 cursor-pointer text-xs font-semibold"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="p-4 space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-[10px] uppercase font-bold tracking-widest text-primary">
                                                    {slide.badge || slide.category}
                                                </span>
                                                <span className="text-[10px] font-mono text-muted-foreground">
                                                    Slide #{index + 1}
                                                </span>
                                            </div>
                                            <h3 className="font-serif font-bold text-base line-clamp-1 text-foreground leading-tight">
                                                {slide.title}
                                            </h3>
                                            <p className="text-xs italic text-primary/80 line-clamp-1">
                                                {slide.subtitle}
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                {slide.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Footer with Links */}
                                    <div className="px-4 py-3 bg-muted/40 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                                        <span className="truncate max-w-[150px] font-mono">{slide.link}</span>
                                        <button
                                            onClick={() => openEditModal(slide)}
                                            className="text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                                        >
                                            Edit Slide <ExternalLink className="w-3 h-3" />
                                        </button>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Modal: Add or Edit Slide */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 overflow-hidden backdrop-blur-xs">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-background w-full max-w-2xl rounded-none shadow-2xl border border-border relative flex flex-col max-h-[92vh]"
                    >
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-4 top-4 p-2 text-muted-foreground hover:text-foreground transition-colors z-10 cursor-pointer"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-6 border-b shrink-0">
                            <h2 className="text-xl sm:text-2xl font-serif text-primary font-bold">
                                {editingSlide ? "Edit Hero Slide" : "Add New Hero Slide"}
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Select a distinct UI layout and configure custom typography and links.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]" data-lenis-prevent>
                            {/* Slide Image */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-primary">
                                    Slide Visual {editingSlide ? "(Leave blank to keep existing)" : "(Required)"}
                                </label>
                                <div className="relative aspect-[16/9] w-full bg-muted rounded-none border border-dashed border-border overflow-hidden flex flex-col items-center justify-center group">
                                    {previewImage ? (
                                        <>
                                            <Image src={previewImage} alt="Preview" fill className="object-cover object-top" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <label className="cursor-pointer bg-white text-black px-4 py-2 font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-lg">
                                                    <Upload className="w-4 h-4" /> Change Visual
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                                </label>
                                            </div>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center gap-3 text-muted-foreground hover:text-foreground transition-colors p-8 text-center">
                                            <Images className="w-8 h-8 text-primary/60" />
                                            <p className="text-xs font-bold uppercase tracking-wider">Click to upload high-fashion image</p>
                                            <p className="text-[11px] text-muted-foreground">Optimal: 1920x1080px (16:9) landscape visual</p>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} required={!editingSlide} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* UI Layout Style Selector */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                    <LayoutTemplate className="w-3.5 h-3.5" /> Distinct UI Layout Style
                                </label>
                                <select
                                    name="layoutStyle"
                                    value={formData.layoutStyle}
                                    onChange={handleChange}
                                    className="w-full h-10 px-3 bg-background border border-border text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                                >
                                    {LAYOUT_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[11px] text-muted-foreground">
                                    Choose which layout design this slide renders (Split Editorial, Full Cinematic Canvas, or Asymmetric Showcase).
                                </p>
                            </div>

                            {/* Typography Fields */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-wider">Main Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full h-9 px-3 bg-background border border-border text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                                        placeholder="e.g. The Poetry of Pure Linen & Zari"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-wider">Subtitle / Tagline</label>
                                    <input
                                        type="text"
                                        name="subtitle"
                                        value={formData.subtitle}
                                        onChange={handleChange}
                                        className="w-full h-9 px-3 bg-background border border-border text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                                        placeholder="e.g. Woven by master artisans across Bengal & Banaras looms"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-wider">Editorial Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full min-h-[70px] p-2.5 bg-background border border-border text-xs focus:ring-1 focus:ring-primary focus:outline-none leading-relaxed"
                                        placeholder="Enter storytelling copy about the weave, count, or collection..."
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider">Badge / Eyebrow Text</label>
                                    <input
                                        type="text"
                                        name="badge"
                                        value={formData.badge}
                                        onChange={handleChange}
                                        className="w-full h-9 px-3 bg-background border border-border text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                                        placeholder="e.g. ATELIER HANDLOOM"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider">Category Tag</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full h-9 px-3 bg-background border border-border text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                                        placeholder="e.g. AUTUMN / FESTIVE 2026"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider">Primary Button Text</label>
                                    <input
                                        type="text"
                                        name="buttonText"
                                        value={formData.buttonText}
                                        onChange={handleChange}
                                        className="w-full h-9 px-3 bg-background border border-border text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                                        placeholder="e.g. EXPLORE ATELIER"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider">Primary Link URL</label>
                                    <input
                                        type="text"
                                        name="link"
                                        value={formData.link}
                                        onChange={handleChange}
                                        className="w-full h-9 px-3 bg-background border border-border text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                                        placeholder="e.g. /collections/festive"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider">Secondary Button Text (Optional)</label>
                                    <input
                                        type="text"
                                        name="secondaryButtonText"
                                        value={formData.secondaryButtonText}
                                        onChange={handleChange}
                                        className="w-full h-9 px-3 bg-background border border-border text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                                        placeholder="e.g. DISCOVER HERITAGE"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider">Secondary Link URL (Optional)</label>
                                    <input
                                        type="text"
                                        name="secondaryLink"
                                        value={formData.secondaryLink}
                                        onChange={handleChange}
                                        className="w-full h-9 px-3 bg-background border border-border text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                                        placeholder="e.g. /collections"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-none text-xs uppercase tracking-wider font-semibold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="min-w-[140px] rounded-none text-xs uppercase tracking-wider font-bold shadow-md cursor-pointer"
                                >
                                    {isSaving ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                                    ) : (
                                        editingSlide ? "Update Slide" : "Add Slide"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
