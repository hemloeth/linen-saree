"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useBlog } from "@/context/blog-context"
import { Trash2 } from "lucide-react"
import { resolveMediaUrl } from "@/lib/media"

import { RichTextEditor } from "@/components/admin/rich-text-editor"

function BlogPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { blogs, addBlog, deleteBlog, loading } = useBlog()

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!image) {
            alert("Please select a featured image from the Media Library first.")
            return
        }

        try {
            await addBlog({
                title,
                description,
                image
            })

            // Clear form on success
            setTitle("")
            setDescription("")
            setImage(null)
            if (typeof window !== "undefined") {
                window.localStorage.removeItem("blogSelectedImage")
            }
            alert("Blog post added successfully!")
        } catch (error) {
            console.error(error)
            alert("Failed to add blog post.")
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this blog post?")) {
            await deleteBlog(id)
        }
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-serif text-primary">Blog</h2>
                    <p className="text-muted-foreground">
                        Create blog entries with a title, rich-text description and featured image.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1fr_300px] items-start">
                <Card className="order-2 xl:order-1">
                    <CardHeader>
                        <CardTitle className="text-base">Blog Content</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-1.5">
                            <Label htmlFor="blog-title" className="text-sm font-bold">Title</Label>
                            <Input
                                id="blog-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Styling Linen Sarees for Summer"
                                className="h-12 text-lg font-serif"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="blog-description" className="text-sm font-bold">Content</Label>
                            <RichTextEditor 
                                value={description} 
                                onChange={setDescription} 
                                placeholder="Write your blog post here..." 
                            />
                        </div>
                        <Button type="submit" size="lg" className="mt-4 w-full md:w-auto font-bold" disabled={loading}>
                            {loading ? "Publishing..." : "Publish Blog Post"}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="order-1 xl:order-2 bg-muted/5">
                    <CardHeader>
                        <CardTitle className="text-base">Featured Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Choose an image from your existing product media to be used as the blog post thumbnail.
                            </p>
                            <div className="relative aspect-video w-full overflow-hidden rounded-xl border-2 border-dashed bg-muted flex items-center justify-center transition-all">
                                {image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={resolveMediaUrl(image)}
                                        alt="Selected blog featured"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xs text-muted-foreground font-medium">
                                        No image selected
                                    </span>
                                )}
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                className="w-full font-bold shadow-sm"
                                onClick={handleOpenMedia}
                            >
                                {image ? "Change Media" : "Open Media Library"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>

            <div className="pt-8">
                <h3 className="text-xl font-bold font-serif mb-4">Published Blogs</h3>
                {blogs.length === 0 && !loading ? (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            No blogs published yet. Add one above!
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {blogs.map(blog => (
                            <Card key={blog._id} className="overflow-hidden flex flex-col">
                                <div className="h-48 w-full bg-muted relative">
                                    {blog.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={resolveMediaUrl(blog.image)} alt={blog.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                                    )}
                                </div>
                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="line-clamp-2 text-lg">{blog.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 flex-1">
                                    <div 
                                        className="text-sm text-muted-foreground line-clamp-3 leading-relaxed prose prose-sm prose-p:my-0"
                                        dangerouslySetInnerHTML={{ __html: blog.description }}
                                    />
                                </CardContent>
                                <CardFooter className="p-4 border-t bg-muted/20 gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                                        onClick={() => handleDelete(blog._id)}
                                        disabled={loading}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function AdminBlogPage() {
    return (
        <Suspense fallback={<div className="p-8 animate-pulse text-center">Loading blogs...</div>}>
            <BlogPageContent />
        </Suspense>
    )
}


