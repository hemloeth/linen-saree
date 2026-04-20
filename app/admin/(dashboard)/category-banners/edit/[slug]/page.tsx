"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Upload, Save, ArrowLeft, ImageIcon, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { apiGet, apiUpload, API_BASE_URL } from "@/lib/api"
import { categories } from "@/lib/products"

interface Props {
  params: Promise<{ slug: string }>
}

export default function EditCategoryBannerPage({ params }: Props) {
    const { slug } = use(params)
    const router = useRouter()
    
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    
    const collectionInfo = categories.find(c => c.slug === slug) || { 
        name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        slug 
    }

    const [formData, setFormData] = useState({
        title: collectionInfo.name,
        subtitle: "",
        description: "",
        image: "",
        buttonText: "SHOP COLLECTION",
        link: `/collections/${slug}`
    })

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const response = await apiGet(`/api/category-banner/${slug}`)
                if (response.success && response.data) {
                    setFormData({
                        title: response.data.title || "",
                        subtitle: response.data.subtitle || "",
                        description: response.data.description || "",
                        image: response.data.image || "",
                        buttonText: response.data.buttonText || "SHOP COLLECTION",
                        link: response.data.link || `/collections/${slug}`
                    })
                    setPreviewImage(response.data.image ? (response.data.image.startsWith('http') ? response.data.image : `${API_BASE_URL}${response.data.image}`) : null)
                }
            } catch (error) {
                console.error("Error fetching banner:", error)
            } finally {
                setIsFetching(false)
            }
        }
        fetchBanner()
    }, [slug])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target
        setFormData(prev => ({ ...prev, [id]: value }))
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const data = new FormData()
            data.append("slug", slug)
            data.append("title", formData.title)
            data.append("subtitle", formData.subtitle)
            data.append("description", formData.description)
            data.append("buttonText", formData.buttonText)
            data.append("link", formData.link)

            if (imageFile) {
                data.append("image", imageFile)
            } else if (formData.image) {
                data.append("image", formData.image)
            } else {
                toast.error("Please select an image")
                setIsLoading(false)
                return
            }

            // Using the existing product route pattern for image compatibility if needed,
            // but here we use the generic apiUpload to our new endpoint
            const response = await apiUpload('/api/category-banner', data, 'POST')

            if (response.success) {
                toast.success(`${collectionInfo.name} banner updated!`)
                router.push('/admin/category-banners')
            } else {
                toast.error(response.message || "Failed to update banner")
            }
        } catch (error) {
            console.error("Error updating banner:", error)
            toast.error("An error occurred while saving")
        } finally {
            setIsLoading(false)
        }
    }

    if (isFetching) {
        return <div className="flex h-[400px] items-center justify-center text-muted-foreground italic font-serif">Loading {collectionInfo.name} settings...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-serif text-primary">Edit {collectionInfo.name} Banner</h2>
                    <p className="text-muted-foreground">Customize the top-level hero section for this collection.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
                <Card className="border-primary/10 shadow-sm">
                    <CardHeader>
                        <CardTitle className="font-serif">Content Details</CardTitle>
                        <CardDescription>Configure the messaging and call-to-action</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Main Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g. Pure Linen Collection"
                                className="font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subtitle">Sub-title (Optional)</Label>
                            <Input
                                id="subtitle"
                                value={formData.subtitle}
                                onChange={handleInputChange}
                                placeholder="e.g. Breathable Luxury for Every Day"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Short Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe the essence of this collection..."
                                rows={4}
                                className="resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="buttonText">Button CTA</Label>
                                <Input
                                    id="buttonText"
                                    value={formData.buttonText}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="link">Button Link</Label>
                                <Input
                                    id="link"
                                    value={formData.link}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-primary/10 shadow-sm">
                        <CardHeader>
                            <CardTitle className="font-serif text-primary flex items-center gap-2">
                                <ImageIcon className="w-5 h-5" />
                                Hero Image
                            </CardTitle>
                            <CardDescription>The background image for the collection banner</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Label 
                                htmlFor="image" 
                                className="relative aspect-[16/7] w-full overflow-hidden rounded-lg border-2 border-dashed border-primary/20 bg-muted/30 transition-all hover:bg-muted/50 group flex flex-col items-center justify-center cursor-pointer"
                            >
                                {previewImage ? (
                                    <img
                                        src={previewImage}
                                        alt="Banner Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground group-hover:text-primary transition-colors">
                                        <Upload className="h-10 w-10 text-primary/40 group-hover:text-primary/60" />
                                        <span className="text-sm font-medium">Upload Hero Image</span>
                                    </div>
                                )}
                                <Input
                                    type="file"
                                    id="image"
                                    className="sr-only"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </Label>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 p-3 rounded-md">
                                <AlertCircle className="h-4 w-4 text-primary" />
                                <span>High-resolution (1920x800px) recommended for a cinematic look.</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isLoading} 
                            className="bg-primary text-white hover:bg-primary/90 px-8 btn-premium"
                        >
                            {isLoading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Banner</>}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
