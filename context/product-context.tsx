"use client"

import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react"
import { usePathname } from 'next/navigation'
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
import { apiGet, apiUpload, apiDelete, apiPut, apiPatch } from "@/lib/api"

export interface ImageInfo {
    url: string
    title: string
    description: string
    alt: string
    caption: string
    tags?: string[]
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
    isOnSale: boolean
    isFestive: boolean
    isNewArrival: boolean
    productCollection?: string
    createdAt: string
}

interface ProductContextType {
    products: Product[]
    addProduct: (formData: FormData) => Promise<Product | null>
    updateProduct: (id: string, formData: FormData) => Promise<Product | null>
    quickUpdateProduct: (id: string, updates: Partial<Product>) => Promise<void>
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
    const [products, setProducts] = useState<Product[]>([])
    const [ssrProducts] = useState<FrontendProduct[]>(initialProducts)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const pathname = usePathname()

    // Fetch all products on mount only for admin panel
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // If on admin panel or video-collection page, fetch all products. Otherwise, fetch limited set for preview.
                const needsAllProducts = pathname?.startsWith('/admin') || pathname?.startsWith('/video-collection')
                const endpoint = needsAllProducts ? '/api/product/allproducts?limit=0&fullData=true' : '/api/product/allproducts?limit=20'
                
                const data = await apiGet(endpoint)
                if (data.products) {
                    setProducts(data.products)
                }
            } catch (err) {
                console.error("Failed to fetch products", err)
                setError(err instanceof Error ? err.message : "Failed to fetch products")
            }
        }
        fetchProducts()
    }, [pathname])

    const addProduct = async (formData: FormData): Promise<Product | null> => {
        setLoading(true)
        setError(null)

        try {
            const data = await apiUpload('/api/product/add-product', formData, 'POST')
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

            const data = await apiUpload(`/api/product/upload-video/${productId}`, videoForm, 'PUT')

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
            const data = await apiUpload(`/api/product/update/${id}`, formData, 'PUT')

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

    const quickUpdateProduct = async (id: string, updates: Partial<Product>) => {
        try {
            const data = await apiPatch(`/api/product/quick-update/${id}`, updates)
            setProducts((prev) =>
                prev.map((p) => (p._id === id ? data.product : p))
            )
        } catch (err: any) {
            console.error("Quick update failed", err)
            throw err
        }
    }

    const deleteProduct = async (id: string) => {
        setLoading(true)
        setError(null)

        try {
            await apiDelete(`/api/product/${id}`)
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
            const data = await apiDelete('/api/product/bulk-delete', { ids })

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
            const data = await apiPut(`/api/product/${productId}/gallery-image-info`, { imageIndex, ...info })

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
                sku: dbProduct.sku,
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
                isOnSale: dbProduct.isOnSale,
                isFestive: dbProduct.isFestive,
                isFeatured: true, // Mocked for now
                isNew: dbProduct.isNewArrival,
                material: dbProduct.material,
                sareeSize: dbProduct.sareeSize,
                blouseSize: dbProduct.blouseSize,
                washCare: dbProduct.washCare,
                dispatch: dbProduct.dispatch,
                disclaimer: dbProduct.disclaimer,
                internationalNote: dbProduct.internationalNote,
                productCollection: dbProduct.productCollection || 
                                 (dbProduct.isFestive ? "festive" : 
                                  dbProduct.isOnSale ? "big-sale" : "none")
            } as FrontendProduct;
        })
    }, [products, ssrProducts]);

    return (
        <ProductContext.Provider
            value={{
                products,
                addProduct,
                updateProduct,
                quickUpdateProduct,
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
