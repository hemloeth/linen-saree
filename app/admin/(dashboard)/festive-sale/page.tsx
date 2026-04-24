"use client"

import { useState, useEffect } from "react"
import { Upload, Save, Eye, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { apiGet, apiUpload, API_BASE_URL } from "@/lib/api"
import { toast } from "sonner"
import Image from "next/image"
import { resolveMediaUrl } from "@/lib/media"

export default function FestiveSalePage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        title1: "",
        title2: "",
        offer: "",
        description: "",
        buttonText: "",
        link: "/collections/sale",
        image: ""
    })

    useEffect(() => {
        fetchFestiveSale()
    }, [])

    const fetchFestiveSale = async () => {
        try {
            const response = await apiGet("/api/festive-sale")
            if (response.success && response.data) {
                setFormData({
                    title1: response.data.title1 || "",
                    title2: response.data.title2 || "",
                    offer: response.data.offer || "",
                    description: response.data.description || "",
                    buttonText: response.data.buttonText || "",
                    link: response.data.link || "",
                    image: response.data.image || ""
                })
                setPreviewImage(resolveMediaUrl(response.data.image))
            }
        } catch (error) {
            console.error("Error fetching festive sale:", error)
        } finally {
            setIsFetching(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target
        setFormData(prev => ({ ...prev, [id]: value }))
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
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
            const form = new FormData()
            form.append("title1", formData.title1)
            form.append("title2", formData.title2)
            form.append("offer", formData.offer)
            form.append("description", formData.description)
            form.append("buttonText", formData.buttonText)
            form.append("link", formData.link)

            const imageInput = document.getElementById("image") as HTMLInputElement
            if (imageInput.files?.[0]) {
                form.append("image", imageInput.files[0])
            }

            const response = await apiUpload("/api/festive-sale", form, "PUT")

            if (response.success) {
                toast.success("Festive sale banner updated successfully!")
                fetchFestiveSale() // Refresh data
            } else {
                toast.error(response.message || "Failed to update banner")
            }
        } catch (error) {
            console.error("Error updating festive sale:", error)
            toast.error("An error occurred while saving")
        } finally {
            setIsLoading(false)
        }
    }

    if (isFetching) {
        return <div className="flex h-[400px] items-center justify-center">Loading settings...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Sale Offer Banner</h2>
                    <p className="text-muted-foreground">
                        Manage the promotion banner shown at the bottom of the home page.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Content Details</CardTitle>
                        <CardDescription>Update the text and CTA for the banner</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title1">Top Title (Script)</Label>
                                <Input
                                    id="title1"
                                    placeholder="e.g. festive"
                                    value={formData.title1}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title2">Bottom Title (Bold)</Label>
                                <Input
                                    id="title2"
                                    placeholder="e.g. BIG SALE"
                                    value={formData.title2}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="offer">Offer Badge Text</Label>
                            <Input
                                id="offer"
                                placeholder="e.g. UP TO 60% OFF"
                                value={formData.offer}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Short Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Limited time offer on premium linen sarees..."
                                rows={3}
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="buttonText">Button Text</Label>
                                <Input
                                    id="buttonText"
                                    placeholder="SHOP SALE NOW"
                                    value={formData.buttonText}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="link">Button Link (URL)</Label>
                                <Input
                                    id="link"
                                    placeholder="/collections/offers"
                                    value={formData.link}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Banner Image</CardTitle>
                            <CardDescription>Upload the background image for the promotion</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50">
                                {previewImage ? (
                                    <Image
                                        src={previewImage}
                                        alt="Banner Preview"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full flex-col items-center justify-center space-y-2 text-muted-foreground">
                                        <Upload className="h-10 w-10" />
                                        <span>No image selected</span>
                                    </div>
                                )}
                                <Input
                                    type="file"
                                    id="image"
                                    className="absolute inset-0 z-10 opacity-0 cursor-pointer"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <AlertCircle className="h-3 w-3" />
                                <span>Recommended size: 1920x600px. High-quality JPEG or PNG.</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-4">
                        <Button type="button" variant="outline" onClick={fetchFestiveSale}>
                            Discard Changes
                        </Button>
                        <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                            {isLoading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Update Banner</>}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
