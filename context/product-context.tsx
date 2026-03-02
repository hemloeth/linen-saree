"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Product {
    _id: string
    name: string
    sku: string
    category: string
    regularPrice: number
    price: number
    stock: number
    shortDescription: string
    tags: string
    mainImage: string
    galleryImages: string[]
    color: string
    material: string
    sareeSize: string
    blouseSize: string
    washCare: string
    dispatch: string
    disclaimer: string
    internationalNote: string
    videoUrl: string
    videoFile: string
    createdAt: string
}

interface ProductContextType {
    products: Product[]
    addProduct: (formData: FormData) => Promise<Product | null>
    updateProduct: (id: string, formData: FormData) => Promise<Product | null>
    uploadVideo: (productId: string, videoFile: File) => Promise<void>
    deleteProduct: (id: string) => Promise<void>
    loading: boolean
    error: string | null
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: ReactNode }) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch all products on mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${API_URL}/api/product/allproducts`)
                const data = await res.json()
                if (res.ok && data.products) {
                    setProducts(data.products)
                }
            } catch (err) {
                console.error("Failed to fetch products", err)
            }
        }
        fetchProducts()
    }, [API_URL])

    const addProduct = async (formData: FormData): Promise<Product | null> => {
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`${API_URL}/api/product/add-product`, {
                method: "POST",
                body: formData,
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Failed to add product")
            }

            setProducts((prev) => [data.product, ...prev])
            return data.product
        } catch (err: any) {
            setError(err.message || "Something went wrong")
            throw err
        } finally {
            setLoading(false)
        }
    }

    const uploadVideo = async (productId: string, videoFile: File) => {
        try {
            const videoForm = new FormData()
            videoForm.append("videoFile", videoFile)

            const res = await fetch(`${API_URL}/api/product/upload-video/${productId}`, {
                method: "PUT",
                body: videoForm,
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Failed to upload video")
            }

            // Update the product in state with video URL
            setProducts((prev) =>
                prev.map((p) => (p._id === productId ? data.product : p))
            )
        } catch (err: any) {
            console.error("Video upload failed", err)
        }
    }

    const updateProduct = async (id: string, formData: FormData): Promise<Product | null> => {
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`${API_URL}/api/product/update/${id}`, {
                method: "PUT",
                body: formData,
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Failed to update product")
            }

            setProducts((prev) =>
                prev.map((p) => (p._id === id ? data.product : p))
            )
            return data.product
        } catch (err: any) {
            setError(err.message || "Something went wrong")
            throw err
        } finally {
            setLoading(false)
        }
    }

    const deleteProduct = async (id: string) => {
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`${API_URL}/api/product/${id}`, {
                method: "DELETE",
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Failed to delete product")
            }

            setProducts((prev) => prev.filter((p) => p._id !== id))
        } catch (err: any) {
            setError(err.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <ProductContext.Provider
            value={{
                products,
                addProduct,
                updateProduct,
                uploadVideo,
                deleteProduct,
                loading,
                error,
            }}
        >
            {children}
        </ProductContext.Provider>
    )
}

export function useProduct() {
    const context = useContext(ProductContext)
    if (context === undefined) {
        throw new Error("useProduct must be used within a ProductProvider")
    }
    return context
}
