"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

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
    const API_URL = process.env.NEXT_PUBLIC_API_URL
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_URL}/api/category/allcategory`)
                if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`)
                const data = await res.json()
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

            const res = await fetch(`${API_URL}/api/category/add-category`, {
                method: "POST",
                body: formData,
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Failed to add category")
            }

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
            const res = await fetch(`${API_URL}/api/category/${id}`, {
                method: "DELETE",
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Failed to delete category")
            }

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

            const res = await fetch(`${API_URL}/api/category/${id}`, {
                method: "PUT",
                body: formData,
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Failed to update category")
            }

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
