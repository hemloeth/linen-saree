"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { apiGet, apiPost, apiDelete, apiPut } from "@/lib/api"

export interface Blog {
    _id: string
    title: string
    description: string
    image: string
    createdAt?: string
    updatedAt?: string
}

interface BlogContextType {
    blogs: Blog[]
    loading: boolean
    addBlog: (blogData: { title: string; description: string; image: string }) => Promise<void>
    deleteBlog: (id: string) => Promise<void>
    updateBlog: (id: string, blogData: { title?: string; description?: string; image?: string }) => Promise<void>
    refreshBlogs: () => Promise<void>
}

const BlogContext = createContext<BlogContextType | undefined>(undefined)

export function BlogProvider({ children }: { children: ReactNode }) {
    const [blogs, setBlogs] = useState<Blog[]>([])
    const [loading, setLoading] = useState(false)

    const fetchBlogs = async () => {
        try {
            setLoading(true)
            const data = await apiGet('/api/blog/allblogs')
            if (data.success) {
                setBlogs(data.blogs)
            }
        } catch (error) {
            console.error("Failed to fetch blogs:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBlogs()
    }, [])

    const addBlog = async (blogData: { title: string; description: string; image: string }) => {
        try {
            setLoading(true)
            const data = await apiPost('/api/blog/add-blog', blogData)

            if (data.success && data.blog) {
                setBlogs((prev) => [...prev, data.blog])
            } else {
                console.error("Failed to add blog:", data.message)
            }
        } catch (error) {
            console.error("Error adding blog:", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const deleteBlog = async (id: string) => {
        try {
            setLoading(true)
            const data = await apiDelete(`/api/blog/${id}`)

            if (data.success) {
                setBlogs((prev) => prev.filter((blog) => blog._id !== id))
            } else {
                console.error("Failed to delete blog:", data.message)
            }
        } catch (error) {
            console.error("Error deleting blog:", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const updateBlog = async (id: string, blogData: { title?: string; description?: string; image?: string }) => {
        try {
            setLoading(true)
            const data = await apiPut(`/api/blog/update/${id}`, blogData)

            if (data.success && data.blog) {
                setBlogs((prev) =>
                    prev.map((blog) => (blog._id === id ? data.blog : blog))
                )
            } else {
                console.error("Failed to update blog:", data.message)
            }
        } catch (error) {
            console.error("Error updating blog:", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    return (
        <BlogContext.Provider value={{ blogs, loading, addBlog, deleteBlog, updateBlog, refreshBlogs: fetchBlogs }}>
            {children}
        </BlogContext.Provider>
    )
}

export function useBlog() {
    const context = useContext(BlogContext)
    if (context === undefined) {
        throw new Error("useBlog must be used within a BlogProvider")
    }
    return context
}
