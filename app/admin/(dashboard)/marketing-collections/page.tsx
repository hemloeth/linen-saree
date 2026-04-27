"use client"

import { useState, useEffect } from "react"
import { Upload, Save, Eye, ChevronRight, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { apiGet, apiUpload, API_BASE_URL } from "@/lib/api"
import { toast } from "sonner"
import Image from "next/image"
import { resolveMediaUrl } from "@/lib/media"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MarketingCollectionsPage() {
    const [collections, setCollections] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [activeTab, setActiveTab] = useState("")

    useEffect(() => {
        fetchCollections()
    }, [])

    const fetchCollections = async () => {
        try {
            const response = await apiGet("/api/marketing-collections")
            if (response.success) {
                setCollections(response.data)
                if (response.data.length > 0 && !activeTab) {
                    setActiveTab(response.data[0].key)
                }
            }
        } catch (error) {
            console.error("Error fetching collections:", error)
            toast.error("Failed to load collections")
        } finally {
            setIsFetching(false)
        }
    }

    const handleUpdate = async (key: string, data: any) => {
        setIsLoading(true)
        try {
            const formData = new FormData()
            Object.keys(data).forEach(field => {
                if (field === 'stats') {
                    formData.append(field, JSON.stringify(data[field]))
                } else if (field !== 'image' && data[field] !== undefined) {
                    formData.append(field, data[field])
                }
            })

            const imageInput = document.getElementById(`image-${key}`) as HTMLInputElement
            if (imageInput?.files?.[0]) {
                formData.append("image", imageInput.files[0])
            }

            const response = await apiUpload(`/api/marketing-collections/${key}`, formData, "PUT")
            if (response.success) {
                toast.success(`${data.name} updated successfully!`)
                fetchCollections()
            } else {
                toast.error(response.message || "Update failed")
            }
        } catch (error) {
            console.error("Error updating collection:", error)
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    if (isFetching) {
        return <div className="flex h-[400px] items-center justify-center">Loading collections...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Marketing Collections</h2>
                    <p className="text-muted-foreground">
                        Manage names and banners for all special marketing collections.
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-muted/50 p-1">
                    {collections.map(col => (
                        <TabsTrigger key={col.key} value={col.key} className="px-6">
                            {col.name}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {collections.map(col => (
                    <TabsContent key={col.key} value={col.key}>
                        <CollectionEditor 
                            collection={col} 
                            onSave={(data) => handleUpdate(col.key, data)} 
                            isLoading={isLoading} 
                        />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}

function CollectionEditor({ collection, onSave, isLoading }: { collection: any, onSave: (data: any) => void, isLoading: boolean }) {
    const [formData, setFormData] = useState({ ...collection })
    const [previewImage, setPreviewImage] = useState(resolveMediaUrl(collection.image))

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target
        setFormData((prev: any) => ({ ...prev, [id]: value }))
    }

    const handleStatChange = (index: number, field: string, value: string) => {
        const newStats = [...(formData.stats || [])]
        newStats[index] = { ...newStats[index], [field]: value }
        setFormData((prev: any) => ({ ...prev, stats: newStats }))
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => setPreviewImage(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Edit the name and primary labels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Collection Display Name</Label>
                        <Input id="name" value={formData.name} onChange={handleChange} placeholder="e.g. Festive Collection" />
                        <p className="text-[10px] text-muted-foreground">This name appears in the product management dropdown.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title1">Banner Title 1 (Top)</Label>
                            <Input id="title1" value={formData.title1 || ""} onChange={handleChange} placeholder="Experience" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="title2">Banner Title 2 (Main)</Label>
                            <Input id="title2" value={formData.title2 || ""} onChange={handleChange} placeholder="Collection" />
                        </div>
                    </div>

                    {collection.key === 'celebrity' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="titleColorPart">Colored Part</Label>
                                <Input id="titleColorPart" value={formData.titleColorPart || ""} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="titleItalicPart">Italic Part</Label>
                                <Input id="titleItalicPart" value={formData.titleItalicPart || ""} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="description">Banner Description</Label>
                        <Textarea id="description" value={formData.description || ""} onChange={handleChange} rows={3} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="buttonText">Button Text</Label>
                            <Input id="buttonText" value={formData.buttonText || ""} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="link">Button Link</Label>
                            <Input id="link" value={formData.link || ""} onChange={handleChange} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Banner Image</CardTitle>
                        <CardDescription>Visual for this collection's showcase</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-dashed">
                            {previewImage ? (
                                <Image src={previewImage} alt="Preview" fill className="object-cover" />
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
                            )}
                            <Input 
                                type="file" 
                                id={`image-${collection.key}`} 
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                onChange={handleImageChange}
                            />
                        </div>
                    </CardContent>
                </Card>

                {collection.key === 'celebrity' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {(formData.stats || []).map((stat: any, idx: number) => (
                                <div key={idx} className="grid grid-cols-2 gap-2">
                                    <Input value={stat.number} onChange={(e) => handleStatChange(idx, 'number', e.target.value)} placeholder="Number" />
                                    <Input value={stat.label} onChange={(e) => handleStatChange(idx, 'label', e.target.value)} placeholder="Label" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {collection.key === 'big-sale' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Sale Offer</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Input id="offer" value={formData.offer || ""} onChange={handleChange} placeholder="e.g. UP TO 60% OFF" />
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-end">
                    <Button onClick={() => onSave(formData)} disabled={isLoading}>
                        {isLoading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save {formData.name}</>}
                    </Button>
                </div>
            </div>
        </div>
    )
}
