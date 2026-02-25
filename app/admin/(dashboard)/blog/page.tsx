"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function BlogPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [image, setImage] = useState<string | null>(null)

    // When coming back from media selection, read selected image from localStorage
    useEffect(() => {
        if (typeof window === "undefined") return
        try {
            const stored = window.localStorage.getItem("blogSelectedImage")
            if (stored) {
                setImage(stored)
            }
        } catch (err) {
            console.error("Failed to read blog image from localStorage", err)
        }
    }, [searchParams])

    const handleOpenMedia = () => {
        router.push("/admin/media?select=blog-image")
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // For now just show a confirmation; wiring to backend/CMS can come later.
        alert("Blog post saved (demo).")
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-serif text-primary">Blog</h2>
                    <p className="text-muted-foreground">
                        Create blog entries with a title, long description and featured image from your media library.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Add Blog Post</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="blog-title">Title</Label>
                                <Input
                                    id="blog-title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Styling Linen Sarees for Summer"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="blog-description">Long Description</Label>
                                <textarea
                                    id="blog-description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Write the main content or a detailed summary for this blog post"
                                    className="w-full min-h-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
                                    required
                                />
                            </div>
                            <Button type="submit" className="mt-2 w-full md:w-auto">
                                Save Blog Post
                            </Button>
                        </div>

                        <div className="space-y-3">
                            <Label>Featured Image</Label>
                            <p className="text-xs text-muted-foreground">
                                Choose an image from your existing product media.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full md:w-auto"
                                onClick={handleOpenMedia}
                            >
                                Open Media Library
                            </Button>
                            <div className="mt-3 relative h-40 w-full overflow-hidden rounded-md border bg-muted flex items-center justify-center">
                                {image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={image}
                                        alt="Selected blog featured"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xs text-muted-foreground">
                                        No image selected yet
                                    </span>
                                )}
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default function AdminBlogPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BlogPageContent />
        </Suspense>
    )
}

