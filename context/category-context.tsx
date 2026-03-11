"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiGet, apiUpload, apiDelete } from "@/lib/api"

interface Category {
    _id: string
    name: string
    sortDesc: string
    image: string
}

interface CategoryContextType {
    categories: Category[]
    addCategory: (name: string, sortDesc: string, imageFile: File) => Promise<void>
    updateCategory: (id: string, name: string, sortDesc: string, imageFile?: File) => Promise<void>
    deleteCategory: (id: string) => void
    loading: boolean
    error: string | null
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

export function CategoryProvider({ children }: { children: ReactNode }) {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await apiGet('/api/category/allcategory')
                if (data.categories) {
                    setCategories(data.categories)
                }
            } catch (err) {
                console.error("Failed to fetch categories", err)
            }
        }
        fetchCategories()
    }, [])

    const addCategory = async (name: string, sortDesc: string, imageFile: File) => {
        setLoading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append("name", name)
            formData.append("sortDesc", sortDesc)
            formData.append("image", imageFile)

            const data = await apiUpload('/api/category/add-category', formData, 'POST')
            setCategories((prev) => [...prev, data.category])
        } catch (err: any) {
            setError(err.message || "Something went wrong")
            throw err
        } finally {
            setLoading(false)
        }
    }

    const deleteCategory = async (id: string) => {
        setLoading(true)
        setError(null)

        try {
            await apiDelete(`/api/category/${id}`)
            setCategories((prev) => prev.filter((cat) => cat._id !== id))
        } catch (err: any) {
            setError(err.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const updateCategory = async (id: string, name: string, sortDesc: string, imageFile?: File) => {
        setLoading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append("name", name)
            formData.append("sortDesc", sortDesc)
            if (imageFile) {
                formData.append("image", imageFile)
            }

            const data = await apiUpload(`/api/category/${id}`, formData, 'PUT')
            setCategories((prev) =>
                prev.map((cat) => (cat._id === id ? data.category : cat))
            )
        } catch (err: any) {
            setError(err.message || "Something went wrong")
            throw err
        } finally {
            setLoading(false)
        }
    }

    return (
        <CategoryContext.Provider
            value={{
                categories,
                addCategory,
                updateCategory,
                deleteCategory,
                loading,
                error,
            }}
        >
            {children}
        </CategoryContext.Provider>
    )
}

export function useCategory() {
    const context = useContext(CategoryContext)
    if (context === undefined) {
        throw new Error("useCategory must be used within a CategoryProvider")
    }
    return context
}
