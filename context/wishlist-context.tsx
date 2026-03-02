"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product } from "@/lib/products"

interface WishlistContextType {
  items: Product[]
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  totalItems: number
  isHydrated: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

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

  const addToWishlist = (product: Product) => {
    setItems(prev => {
      const exists = prev.find(item => item.id === product.id)
      if (exists) {
        return prev
      }
      return [...prev, product]
    })
  }

  const removeFromWishlist = (productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId))
  }

  const isInWishlist = (productId: string) => {
    return items.some(item => item.id === productId)
  }

  const clearWishlist = () => {
    setItems([])
  }

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