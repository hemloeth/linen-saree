"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Upload, Save, Sparkles, Tag, Star, Layout, Image as ImageIcon, ExternalLink, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { apiGet, apiUpload } from "@/lib/api"
import { toast } from "sonner"
import Image from "next/image"
import { resolveMediaUrl } from "@/lib/media"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CollectionItem {
    key: string
    name: string
    title1?: string
    title2?: string
    titleColorPart?: string
    titleItalicPart?: string
    tagline?: string
    badge?: string
    offer?: string
    description?: string
    buttonText?: string
    link?: string
    image?: string
    stats?: Array<{ number: string; label: string }>
    isActive?: boolean
}

const SECTION_METADATA: Record<string, { label: string; sublabel: string; badge: string; icon: any }> = {
    festive: {
        label: "Festive Collection",
        sublabel: "Section 1 on Homepage",
        badge: "Home Section 1",
        icon: Sparkles,
    },
    "big-sale": {
        label: "Big Sale",
        sublabel: "Section 2 on Homepage",
        badge: "Home Section 2",
        icon: Tag,
    },
    celebrity: {
        label: "Dress Like a Star",
        sublabel: "Section 3 on Homepage",
        badge: "Home Section 3",
        icon: Star,
    },
    "new-arrivals": {
        label: "New Arrivals",
        sublabel: "Special Collection Banner",
        badge: "Special",
        icon: Layout,
    },
}

function MarketingCollectionsContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const tabParam = searchParams.get("tab")

    const [collections, setCollections] = useState<CollectionItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [activeTab, setActiveTab] = useState<string>("")

    const fetchCollections = async () => {
        try {
            const response = await apiGet("/api/marketing-collections")
            if (response.success && Array.isArray(response.data)) {
                // Sort collections so Homepage sections 1, 2, 3 come first
                const priorityOrder = ["festive", "big-sale", "celebrity", "new-arrivals"]
                const sorted = [...response.data].sort((a, b) => {
                    const idxA = priorityOrder.indexOf(a.key)
                    const idxB = priorityOrder.indexOf(b.key)
                    return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99)
                })

                setCollections(sorted)

                // Pick active tab: from URL if present, or activeTab if already set and valid, or first collection
                if (tabParam && sorted.some(c => c.key === tabParam)) {
                    setActiveTab(tabParam)
                } else if (!activeTab && sorted.length > 0) {
                    setActiveTab(sorted[0].key)
                }
            }
        } catch (error) {
            console.error("Error fetching collections:", error)
            toast.error("Failed to load marketing collections")
        } finally {
            setIsFetching(false)
        }
    }

    useEffect(() => {
        fetchCollections()
    }, [])

    useEffect(() => {
        if (tabParam && collections.some(c => c.key === tabParam)) {
            setActiveTab(tabParam)
        }
    }, [tabParam, collections])

    const handleTabChange = (key: string) => {
        setActiveTab(key)
        router.push(`/admin/marketing-collections?tab=${key}`, { scroll: false })
    }

    const handleUpdate = async (key: string, data: any) => {
        setIsLoading(true)
        try {
            const formData = new FormData()
            Object.keys(data).forEach(field => {
                if (field === "stats") {
                    formData.append(field, JSON.stringify(data[field]))
                } else if (field !== "image" && data[field] !== undefined) {
                    formData.append(field, data[field])
                }
            })

            const imageInput = document.getElementById(`image-${key}`) as HTMLInputElement
            if (imageInput?.files?.[0]) {
                formData.append("image", imageInput.files[0])
            } else if (data.image) {
                // Pass existing or manually entered image URL if no new file uploaded
                formData.append("image", data.image)
            }

            const response = await apiUpload(`/api/marketing-collections/${key}`, formData, "PUT")
            if (response.success) {
                toast.success(`${SECTION_METADATA[key]?.label || data.name} updated successfully!`)
                await fetchCollections()
            } else {
                toast.error(response.message || "Update failed")
            }
        } catch (error: any) {
            console.error("Error updating collection:", error)
            toast.error(error.message || "An error occurred while saving")
        } finally {
            setIsLoading(false)
        }
    }

    if (isFetching) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Loading homepage banner collections...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Homepage Banners & Collections</h2>
                    <p className="text-muted-foreground">
                        Customize images and text for the 3 homepage banner sections: Festive Collection, Big Sale, and Dress Like a Star.
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                <TabsList className="bg-muted/60 p-1 flex-wrap h-auto gap-1">
                    {collections.map(col => {
                        const meta = SECTION_METADATA[col.key] || {
                            label: col.name,
                            sublabel: "Collection",
                            badge: col.key,
                            icon: Layout,
                        }
                        const IconComponent = meta.icon

                        return (
                            <TabsTrigger
                                key={col.key}
                                value={col.key}
                                className="px-4 py-2.5 flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                <IconComponent className="w-4 h-4 text-primary" />
                                <div className="text-left">
                                    <div className="font-semibold text-xs leading-none whitespace-nowrap">{meta.label}</div>
                                    <div className="text-[10px] text-muted-foreground font-normal whitespace-nowrap">{meta.sublabel}</div>
                                </div>
                            </TabsTrigger>
                        )
                    })}
                </TabsList>

                {collections.map(col => (
                    <TabsContent key={col.key} value={col.key} className="focus-visible:outline-none focus-visible:ring-0">
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

function CollectionEditor({
    collection,
    onSave,
    isLoading,
}: {
    collection: CollectionItem
    onSave: (data: any) => void
    isLoading: boolean
}) {
    const meta = SECTION_METADATA[collection.key] || {
        label: collection.name,
        sublabel: "Collection",
        badge: collection.key,
        icon: Layout,
    }

    const defaultStats = [
        { number: collection.stats?.[0]?.number || "500+", label: collection.stats?.[0]?.label || "Styles" },
        { number: collection.stats?.[1]?.number || "20+", label: collection.stats?.[1]?.label || "Celebrities" },
        { number: collection.stats?.[2]?.number || "5★", label: collection.stats?.[2]?.label || "Rating" },
    ]

    const [formData, setFormData] = useState({
        ...collection,
        stats: collection.stats && collection.stats.length === 3 ? collection.stats : defaultStats,
    })
    const [previewImage, setPreviewImage] = useState(resolveMediaUrl(collection.image))
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

    // Sync state when collection prop changes
    useEffect(() => {
        setFormData({
            ...collection,
            stats: collection.stats && collection.stats.length === 3 ? collection.stats : defaultStats,
        })
        setPreviewImage(resolveMediaUrl(collection.image))
        setSelectedFileName(null)
    }, [collection])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target
        setFormData(prev => ({ ...prev, [id]: value }))
    }

    const handleStatChange = (index: number, field: "number" | "label", value: string) => {
        const newStats = [...(formData.stats || defaultStats)]
        newStats[index] = { ...newStats[index], [field]: value }
        setFormData(prev => ({ ...prev, stats: newStats }))
    }

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFileName(file.name)
            const reader = new FileReader()
            reader.onloadend = () => setPreviewImage(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const isCelebrity = collection.key === "celebrity"
    const isFestive = collection.key === "festive"
    const isBigSale = collection.key === "big-sale"

    return (
        <div className="grid gap-6 lg:grid-cols-12">
            {/* Left 7 Columns: Text Content & Links */}
            <div className="lg:col-span-7 space-y-6">
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <span>{meta.label}</span>
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                    {meta.badge}
                                </span>
                            </CardTitle>
                        </div>
                        <CardDescription>
                            Edit all text labels, headings, description, and button action for this section.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        {/* Internal name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Section / Collection Name
                            </Label>
                            <Input
                                id="name"
                                value={formData.name || ""}
                                onChange={handleChange}
                                placeholder="e.g. Festive Collection"
                            />
                        </div>

                        {/* Heading & Titles */}
                        {isCelebrity ? (
                            <div className="space-y-4 rounded-lg border border-border/60 bg-muted/20 p-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="tagline" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Subtitle / Top Tagline
                                    </Label>
                                    <Input
                                        id="tagline"
                                        value={formData.tagline || ""}
                                        onChange={handleChange}
                                        placeholder="Celebrity Collection"
                                    />
                                    <p className="text-[11px] text-muted-foreground">Small uppercase label shown above the main title.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="titleColorPart" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Title Line 1 (Regular)
                                        </Label>
                                        <Input
                                            id="titleColorPart"
                                            value={formData.titleColorPart || ""}
                                            onChange={handleChange}
                                            placeholder="Dress Like a"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="titleItalicPart" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Title Line 2 (Italic Accent)
                                        </Label>
                                        <Input
                                            id="titleItalicPart"
                                            value={formData.titleItalicPart || ""}
                                            onChange={handleChange}
                                            placeholder="Star"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 rounded-lg border border-border/60 bg-muted/20 p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="title1" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Script Accent Title (Top)
                                        </Label>
                                        <Input
                                            id="title1"
                                            value={formData.title1 || ""}
                                            onChange={handleChange}
                                            placeholder={isFestive ? "Experience" : "festive"}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="title2" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Main Heading Title
                                        </Label>
                                        <Input
                                            id="title2"
                                            value={formData.title2 || ""}
                                            onChange={handleChange}
                                            placeholder={isFestive ? "Festive Collection" : "BIG SALE"}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="offer" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Offer / Highlight Tagline
                                    </Label>
                                    <Input
                                        id="offer"
                                        value={formData.offer || ""}
                                        onChange={handleChange}
                                        placeholder={isFestive ? "CELEBRATE IN STYLE" : "UP TO 60% OFF"}
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        {isFestive
                                            ? "Sub-accent label centered between horizontal divider lines."
                                            : "Discount highlight badge displayed above the description."}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Description Text
                            </Label>
                            <Textarea
                                id="description"
                                value={formData.description || ""}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Describe this banner collection for your homepage visitors..."
                            />
                        </div>

                        {/* Button Action */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="buttonText" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Button Text
                                </Label>
                                <Input
                                    id="buttonText"
                                    value={formData.buttonText || ""}
                                    onChange={handleChange}
                                    placeholder={
                                        isCelebrity
                                            ? "Explore Collection"
                                            : isFestive
                                            ? "SHOP FESTIVAL COLLECTION"
                                            : "SHOP SALE NOW"
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="link" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Button Link (Target URL)
                                </Label>
                                <Input
                                    id="link"
                                    value={formData.link || ""}
                                    onChange={handleChange}
                                    placeholder={
                                        isCelebrity
                                            ? "/collections/celebrity"
                                            : isFestive
                                            ? "/collections/festive"
                                            : "/collections/big-sale"
                                    }
                                />
                            </div>
                        </div>

                        {/* Celebrity Stats */}
                        {isCelebrity && (
                            <div className="space-y-3 pt-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Statistics Counters (3 Highlights)
                                </Label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {(formData.stats || defaultStats).map((stat: any, idx: number) => (
                                        <div key={idx} className="p-3 rounded-lg border border-border/80 bg-background space-y-2">
                                            <div className="text-[11px] font-medium text-muted-foreground">Stat {idx + 1}</div>
                                            <Input
                                                value={stat.number}
                                                onChange={(e) => handleStatChange(idx, "number", e.target.value)}
                                                placeholder={idx === 0 ? "500+" : idx === 1 ? "20+" : "5★"}
                                                className="font-bold text-center"
                                            />
                                            <Input
                                                value={stat.label}
                                                onChange={(e) => handleStatChange(idx, "label", e.target.value)}
                                                placeholder={idx === 0 ? "Styles" : idx === 1 ? "Celebrities" : "Rating"}
                                                className="text-xs text-center"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right 5 Columns: Image Upload, Preview & Save */}
            <div className="lg:col-span-5 space-y-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-primary" />
                            <span>Banner Image</span>
                        </CardTitle>
                        <CardDescription>
                            Upload or change the showcase image for {meta.label}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border-2 border-dashed border-border/80 bg-muted/30 group">
                            {previewImage ? (
                                <Image
                                    src={previewImage}
                                    alt={formData.name || "Banner preview"}
                                    fill
                                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center text-muted-foreground gap-2">
                                    <ImageIcon className="w-8 h-8 opacity-40" />
                                    <span className="text-xs">No image selected</span>
                                </div>
                            )}

                            <label
                                htmlFor={`image-${collection.key}`}
                                className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                            >
                                <Upload className="w-8 h-8 mb-2 drop-shadow" />
                                <span className="text-xs font-semibold drop-shadow">Click to Change Image</span>
                            </label>

                            <input
                                type="file"
                                id={`image-${collection.key}`}
                                accept="image/*"
                                className="sr-only"
                                onChange={handleImageFileChange}
                            />
                        </div>

                        {selectedFileName && (
                            <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-md border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle className="w-4 h-4 shrink-0" />
                                <span className="truncate">New file selected: <strong>{selectedFileName}</strong></span>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full text-xs"
                                onClick={() => document.getElementById(`image-${collection.key}`)?.click()}
                            >
                                <Upload className="mr-2 h-3.5 w-3.5" />
                                {selectedFileName ? "Choose Different Image" : "Upload New Image"}
                            </Button>
                        </div>

                        {/* Optional direct URL edit */}
                        <div className="space-y-1.5 pt-2 border-t border-border/60">
                            <Label htmlFor="image" className="text-[11px] text-muted-foreground">
                                Image Path or URL (optional fallback)
                            </Label>
                            <Input
                                id="image"
                                value={formData.image || ""}
                                onChange={(e) => {
                                    handleChange(e)
                                    setPreviewImage(resolveMediaUrl(e.target.value))
                                }}
                                placeholder="/images/bridal-saree.jpg"
                                className="text-xs font-mono"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Save Card */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6 space-y-3">
                        <div className="text-xs text-muted-foreground">
                            Saving updates will instantly update the <strong>{meta.label}</strong> on the Home page.
                        </div>
                        <Button
                            onClick={() => onSave(formData)}
                            disabled={isLoading}
                            className="w-full h-11 text-sm font-semibold"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Saving changes...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Save className="h-4 w-4" />
                                    Save {meta.label}
                                </span>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function MarketingCollectionsPage() {
    return (
        <Suspense fallback={<div className="flex h-[400px] items-center justify-center">Loading banners...</div>}>
            <MarketingCollectionsContent />
        </Suspense>
    )
}
