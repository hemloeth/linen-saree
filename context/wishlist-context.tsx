"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import type { Product } from "@/lib/products"
import { useAuth } from "@/context/auth-context"
import { apiGet, apiPost, apiDelete } from "@/lib/api"

interface WishlistContextType {
  items: Product[]
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  totalItems: number
  isHydrated: boolean
  isSyncing: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

/**
 * Map a server wishlist item (populated productId) to a frontend Product
 */
function mapServerWishlistItem(serverItem: any): Product | null {
  const p = serverItem.productId
  if (!p || !p._id) return null

  return {
    id: p._id.toString(),
    name: p.name || "",
    slug: (p.name || "").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    category: p.category || "",
    categorySlug: (p.category || "").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    price: p.price || 0,
    originalPrice: p.regularPrice || p.price || 0,
    image: p.mainImage || "",
    images: [p.mainImage, ...(p.galleryImages || []).map((g: any) => g.url)].filter(Boolean),
    videos: [p.videoFile, p.videoUrl].filter(Boolean),
    description: p.shortDescription || "",
    details: [
      p.material ? `Material: ${p.material}` : "",
      p.sareeSize ? `Saree Size: ${p.sareeSize}` : "",
      p.blouseSize ? `Blouse Size: ${p.blouseSize}` : "",
      p.washCare ? `Care: ${p.washCare}` : "",
    ].filter(Boolean),
    fabric: p.material || "Linen",
    color: p.color || "Multicolor",
    isOnSale: !!p.regularPrice && p.regularPrice > p.price,
    isFeatured: true,
    isNew: true,
    material: p.material,
    sareeSize: p.sareeSize,
    blouseSize: p.blouseSize,
    washCare: p.washCare,
    dispatch: p.dispatch,
    disclaimer: p.disclaimer,
    internationalNote: p.internationalNote,
  } as Product
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const { isAuthenticated, loginEvent } = useAuth()
  const isAuthRef = useRef(isAuthenticated)

  // Keep auth ref up to date
  useEffect(() => {
    isAuthRef.current = isAuthenticated
  }, [isAuthenticated])

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist")
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist))
      } catch {
        setItems([])
      }
    }
    setIsHydrated(true)
  }, [])

  // Save wishlist to localStorage when items change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("wishlist", JSON.stringify(items))
    }
  }, [items, isHydrated])

  // Watch for login events — merge localStorage wishlist with server
  useEffect(() => {
    if (loginEvent > 0) {
      mergeWishlistOnLogin()
    }
  }, [loginEvent])

  // If user is already logged in on page load, fetch server wishlist
  useEffect(() => {
    if (isAuthenticated && isHydrated && localStorage.getItem('auth_token')) {
      fetchServerWishlist()
    }
  }, [isHydrated]) // Only on initial hydration

  /**
   * Fetch server wishlist and replace local state
   */
  const fetchServerWishlist = async () => {
    if (!localStorage.getItem('auth_token')) return

    try {
      const data = await apiGet('/api/wishlist')
      if (data.success && data.wishlist) {
        const mapped = data.wishlist
          .map(mapServerWishlistItem)
          .filter((item: Product | null): item is Product => item !== null)
        setItems(mapped)
      }
    } catch (err: any) {
      if (err?.status === 401) return
      console.error("Failed to fetch server wishlist:", err)
    }
  }

  /**
   * Called when loginEvent increments (user just logged in)
   * Merges localStorage wishlist → server → fetches merged result
   */
  const mergeWishlistOnLogin = async () => {
    setIsSyncing(true)
    try {
      // Read guest wishlist from localStorage BEFORE it gets overwritten
      const localWishlist = localStorage.getItem("wishlist")
      const localItems: Product[] = localWishlist ? JSON.parse(localWishlist) : []

      if (localItems.length > 0) {
        const productIds = localItems.map(item => item.id)
        await apiPost('/api/wishlist/sync', { productIds })
      }

      // Fetch the merged wishlist from server
      await fetchServerWishlist()
    } catch (err) {
      console.error("Wishlist merge on login failed:", err)
    } finally {
      setIsSyncing(false)
    }
  }

  // ======= Wishlist Operations =======

  const addToWishlist = useCallback((product: Product) => {
    setItems(prev => {
      const exists = prev.find(item => item.id === product.id)
      if (exists) return prev
      return [...prev, product]
    })

    if (isAuthRef.current) {
      apiPost('/api/wishlist/add', { productId: product.id }).catch(err =>
        console.error("Failed to sync wishlist add:", err)
      )
    }
  }, [])

  const removeFromWishlist = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId))

    if (isAuthRef.current) {
      apiDelete(`/api/wishlist/${productId}`).catch(err =>
        console.error("Failed to sync wishlist remove:", err)
      )
    }
  }, [])

  const isInWishlist = useCallback((productId: string) => {
    return items.some(item => item.id === productId)
  }, [items])

  const clearWishlist = useCallback(() => {
    setItems([])

    if (isAuthRef.current) {
      apiDelete('/api/wishlist/clear').catch(err =>
        console.error("Failed to sync wishlist clear:", err)
      )
    }
  }, [])

  const totalItems = items.length

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        totalItems,
        isHydrated,
        isSyncing,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}