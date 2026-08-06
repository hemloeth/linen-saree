"use client"

import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react"
import type { Product } from "@/lib/products"
import { useAuth } from "@/context/auth-context"
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api"

export interface CartItem {
  product: Product
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  isHydrated: boolean
  toastProduct: Product | null
  showToast: boolean
  isSyncing: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

/**
 * Map a server cart item (populated productId) to a frontend CartItem
 */
function mapServerCartItem(serverItem: any): CartItem | null {
  const p = serverItem.productId
  if (!p || !p._id) return null

  return {
    product: {
      id: p._id.toString(),
      sku: p.sku || "",
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
    } as Product,
    quantity: serverItem.quantity || 1,
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [toastProduct, setToastProduct] = useState<Product | null>(null)
  const [showToast, setShowToast] = useState(false)
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { isAuthenticated, loginEvent } = useAuth()
  const isAuthRef = useRef(isAuthenticated)

  // Keep auth ref up to date
  useEffect(() => {
    isAuthRef.current = isAuthenticated
  }, [isAuthenticated])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch {
        setItems([])
      }
    }
    setIsHydrated(true)
  }, [])

  // Save cart to localStorage when items change (always, as fallback)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, isHydrated])

  // Watch for login events — merge localStorage cart with server
  useEffect(() => {
    if (loginEvent > 0) {
      mergeCartOnLogin()
    }
  }, [loginEvent])

  // If user is already logged in on page load, fetch server cart
  useEffect(() => {
    if (isAuthenticated && isHydrated) {
      fetchServerCart()
    }
  }, [isHydrated]) // Only on initial hydration

  /**
   * Fetch server cart and replace local state
   */
  const fetchServerCart = async () => {
    if (!isAuthenticated) return

    try {
      const data = await apiGet('/api/cart')
      if (data.success && data.cart) {
        const mapped = data.cart
          .map(mapServerCartItem)
          .filter((item: CartItem | null): item is CartItem => item !== null)
        setItems(mapped)
      }
    } catch (err: any) {
      if (err?.status === 401) return
      console.error("Failed to fetch server cart:", err)
    }
  }

  /**
   * Called when loginEvent increments (user just logged in)
   * Merges localStorage cart → server → fetches merged result
   */
  const mergeCartOnLogin = async () => {
    setIsSyncing(true)
    try {
      // Read guest cart from localStorage BEFORE it gets overwritten
      const localCart = localStorage.getItem("cart")
      const localItems: CartItem[] = localCart ? JSON.parse(localCart) : []

      if (localItems.length > 0) {
        const syncPayload = localItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        }))

        await apiPost('/api/cart/sync', { items: syncPayload })
      }

      // Fetch the merged cart from server
      await fetchServerCart()
    } catch (err) {
      console.error("Cart merge on login failed:", err)
    } finally {
      setIsSyncing(false)
    }
  }

  // ======= Cart Operations =======

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.product.id === product.id)
      if (existingItem) {
        return currentItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...currentItems, { product, quantity }]
    })

    // Show toast notification
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToastProduct(product)
    setShowToast(true)
    toastTimerRef.current = setTimeout(() => setShowToast(false), 3000)

    // Sync to server if authenticated
    if (isAuthRef.current) {
      apiPost('/api/cart/add', { productId: product.id, quantity }).catch(err =>
        console.error("Failed to sync add to server:", err)
      )
    }
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.product.id !== productId))

    if (isAuthRef.current) {
      apiDelete(`/api/cart/${productId}`).catch(err =>
        console.error("Failed to sync remove to server:", err)
      )
    }
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setItems(currentItems =>
      currentItems.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    )

    if (isAuthRef.current) {
      apiPut('/api/cart/update', { productId, quantity }).catch(err =>
        console.error("Failed to sync update to server:", err)
      )
    }
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setItems([])

    if (isAuthRef.current) {
      apiDelete('/api/cart/clear').catch(err =>
        console.error("Failed to sync clear to server:", err)
      )
    }
  }, [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        isHydrated,
        toastProduct,
        showToast,
        isSyncing,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
