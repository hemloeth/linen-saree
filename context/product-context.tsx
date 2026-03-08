"use client"

import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react"
import {
    type Product as FrontendProduct,
    type FilterOptions,
    type SortOption,
    getProductBySlug,
    getProductsByCategory,
    getFeaturedProducts,
    getNewProducts,
    getBestSellers,
    getUniqueColors,
    getUniqueFabrics,
    getPriceRange,
    filterProducts,
    sortProducts,
    searchProducts
} from "@/lib/products"

export interface ImageInfo {
    url: string
    title: string
    description: string
    alt: string
    caption: string
}

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
    mainImageInfo?: ImageInfo
    galleryImages: ImageInfo[]
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
    deleteMultipleProducts: (ids: string[]) => Promise<number>
    updateGalleryImageInfo: (productId: string, imageIndex: number, info: Partial<ImageInfo>) => Promise<void>
    loading: boolean
    error: string | null

    // Frontend Mapped Products & Helpers
    mappedProducts: FrontendProduct[]
    getProductBySlug: (slug: string) => FrontendProduct | undefined
    getProductsByCategory: (categorySlug: string) => FrontendProduct[]
    getFeaturedProducts: () => FrontendProduct[]
    getNewProducts: () => FrontendProduct[]
    getBestSellers: () => FrontendProduct[]
    getUniqueColors: () => string[]
    getUniqueFabrics: () => string[]
    getPriceRange: () => { min: number; max: number }
    filterProducts: (filters: FilterOptions) => FrontendProduct[]
    sortProducts: (list: FrontendProduct[], sortBy: SortOption) => FrontendProduct[]
    searchProducts: (query: string, filters?: FilterOptions, sort?: SortOption) => FrontendProduct[]
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children, initialProducts = [] }: { children: ReactNode, initialProducts?: FrontendProduct[] }) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const [products, setProducts] = useState<Product[]>([])
    const [ssrProducts] = useState<FrontendProduct[]>(initialProducts)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch all products on mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${API_URL}/api/product/allproducts`)
                if (!res.ok) {
                    throw new Error(`Failed to fetch products: ${res.status}`)
                }
                const data = await res.json()
                if (data.products) {
                    setProducts(data.products)
                }
            } catch (err) {
                console.error("Failed to fetch products", err)
                setError(err instanceof Error ? err.message : "Failed to fetch products")
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

    const deleteMultipleProducts = async (ids: string[]): Promise<number> => {
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`${API_URL}/api/product/bulk-delete`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Failed to delete products")
            }

            const idSet = new Set(ids)
            setProducts((prev) => prev.filter((p) => !idSet.has(p._id)))
            return data.deletedCount
        } catch (err: any) {
            setError(err.message || "Something went wrong")
            throw err
        } finally {
            setLoading(false)
        }
    }

    const updateGalleryImageInfo = async (productId: string, imageIndex: number, info: Partial<ImageInfo>) => {
        try {
            const res = await fetch(`${API_URL}/api/product/${productId}/gallery-image-info`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageIndex, ...info }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Failed to update image info")
            }

            setProducts((prev) =>
                prev.map((p) => (p._id === productId ? data.product : p))
            )
        } catch (err: any) {
            console.error("Image info update failed", err)
        }
    }

    // Map the raw DB products to the frontend expected format
    const mappedProducts = useMemo(() => {
        if (products.length === 0 && ssrProducts.length > 0) {
            return ssrProducts;
        }

        return products.map(dbProduct => {
            const isVideoStr = typeof dbProduct.videoFile === "string" || typeof dbProduct.videoUrl === "string";
            return {
                id: dbProduct._id.toString(),
                name: dbProduct.name,
                slug: dbProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                category: dbProduct.category,
                categorySlug: dbProduct.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                price: dbProduct.price,
                originalPrice: dbProduct.regularPrice || dbProduct.price,
                image: dbProduct.mainImage,
                images: [
                    dbProduct.mainImage,
                    ...(dbProduct.galleryImages ? dbProduct.galleryImages.map((img: any) => img.url) : [])
                ].filter(Boolean),
                videos: isVideoStr ? [dbProduct.videoFile || dbProduct.videoUrl].filter(Boolean) : [],
                description: dbProduct.shortDescription || "",
                details: [
                    dbProduct.material ? `Material: ${dbProduct.material}` : "",
                    dbProduct.sareeSize ? `Saree Size: ${dbProduct.sareeSize}` : "",
                    dbProduct.blouseSize ? `Blouse Size: ${dbProduct.blouseSize}` : "",
                    dbProduct.washCare ? `Care: ${dbProduct.washCare}` : ""
                ].filter(Boolean),
                fabric: dbProduct.material || "Linen",
                color: dbProduct.color || "Multicolor",
                isOnSale: !!dbProduct.regularPrice && dbProduct.regularPrice > dbProduct.price,
                isFeatured: true, // Mocked for now
                isNew: true,      // Mocked for now
                material: dbProduct.material,
                sareeSize: dbProduct.sareeSize,
                blouseSize: dbProduct.blouseSize,
                washCare: dbProduct.washCare,
                dispatch: dbProduct.dispatch,
                disclaimer: dbProduct.disclaimer,
                internationalNote: dbProduct.internationalNote
            } as FrontendProduct;
        })
    }, [products, ssrProducts]);

    return (
        <ProductContext.Provider
            value={{
                products,
                addProduct,
                updateProduct,
                uploadVideo,
                deleteProduct,
                deleteMultipleProducts,
                updateGalleryImageInfo,
                loading,
                error,

                // Frontend Helpers
                mappedProducts,
                getProductBySlug: (slug) => getProductBySlug(mappedProducts, slug),
                getProductsByCategory: (cat) => getProductsByCategory(mappedProducts, cat),
                getFeaturedProducts: () => getFeaturedProducts(mappedProducts),
                getNewProducts: () => getNewProducts(mappedProducts),
                getBestSellers: () => getBestSellers(mappedProducts),
                getUniqueColors: () => getUniqueColors(mappedProducts),
                getUniqueFabrics: () => getUniqueFabrics(mappedProducts),
                getPriceRange: () => getPriceRange(mappedProducts),
                filterProducts: (filters) => filterProducts(mappedProducts, filters),
                sortProducts: (list, sortBy) => sortProducts(list, sortBy),
                searchProducts: (query, filters, sort) => searchProducts(mappedProducts, query, filters, sort)
            }}
        >
            {children}
        </ProductContext.Provider>
    )
}

export function useProducts() {
    const context = useContext(ProductContext)
    if (context === undefined) {
        throw new Error("useProducts must be used within a ProductProvider")
    }
    return context
}
