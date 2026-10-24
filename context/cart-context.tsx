"use client"

import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react"
import { toast } from "sonner"
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
  removePurchasedItems: (purchased: Array<string> | Array<{ productId: string; quantity: number }>) => void
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

const LEGACY_CART_KEY = "cart"

// Server-side line payload of a successful mutation — reconcile, don't trust
// the optimistic guess.
interface ServerCartResponse {
  success: boolean
  cart?: any[]
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [toastProduct, setToastProduct] = useState<Product | null>(null)
  const [showToast, setShowToast] = useState(false)
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { user, isAuthenticated, loginEvent } = useAuth()

  // Persisted carts are SCOPED by account: one shared "cart" key let a logout
  // or account switch leave shopper A's items on shopper B's screen.
  const storageKey = isAuthenticated && user?._id ? `cart:u:${user._id}` : "cart:guest"
  const storageKeyRef = useRef(storageKey)
  storageKeyRef.current = storageKey
  const isAuthRef = useRef(isAuthenticated)
  const itemsRef = useRef(items)
  itemsRef.current = items

  useEffect(() => {
    isAuthRef.current = isAuthenticated
  }, [isAuthenticated])

  // Load the scoped cart on mount (migrating any pre-scoping legacy cart,
  // which by definition belonged to whoever last used this browser profile —
  // it is adopted ONLY into its matching scope then removed).
  useEffect(() => {
    const savedCart = localStorage.getItem(storageKey)
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch {
        setItems([])
      }
    } else {
      const legacy = localStorage.getItem(LEGACY_CART_KEY)
      if (legacy) {
        localStorage.setItem(storageKey, legacy)
        localStorage.removeItem(LEGACY_CART_KEY)
        try {
          setItems(JSON.parse(legacy))
        } catch {
          setItems([])
        }
      }
    }
    setIsHydrated(true)
  }, [])

  // Persist items to the CURRENT scope whenever they change.
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(storageKeyRef.current, JSON.stringify(items))
    }
  }, [items, isHydrated])

  // ---- Server sync queue --------------------------------------------------
  // Per-product operations are DEBOUNCED, MERGED and SERIALIZED so a burst of
  // rapid taps can never drop or reorder writes:
  //   • repeated ADDs ACCUMULATE (two quick +1 must persist +2, not replace)
  //   • SET coalesces to the latest absolute intent
  //   • REMOVE/zero supersedes anything pending for that line
  //   • CLEAR is a global barrier (flushes + awaits prior per-line work)
  // A monotonically-increasing mutation revision lets runServerOp apply the
  // server's authoritative full cart ONLY when no newer local intent exists,
  // so a slow response can never clobber what the user just did.
  const SYNC_DEBOUNCE_MS = 350
  type SyncOp =
    | { kind: "set"; productId: string; quantity: number }
    | { kind: "add"; productId: string; quantity: number }
    | { kind: "remove"; productId: string }
    | { kind: "clear" }
  const pendingByProduct = useRef(new Map<string, { op: SyncOp; timer: NodeJS.Timeout }>())
  const chainsByProduct = useRef(new Map<string, Promise<unknown>>())
  const clearBarrier = useRef<Promise<unknown> | null>(null)
  const mutationRev = useRef(0)
  const lastSyncedQty = useRef(new Map<string, number>())

  // Combine a still-pending op with a newly requested one for the SAME line.
  // A per-product pending op is only ever set/add/remove (never clear).
  const mergePending = (existing: SyncOp | undefined, next: SyncOp): SyncOp => {
    if (next.kind === "clear") return next
    if (!existing || existing.kind === "clear") return next
    if (next.kind === "remove") return next
    if (existing.kind === "remove") return next
    if (next.kind === "set") return next // latest absolute intent wins
    // next is an add
    if (existing.kind === "add") return { kind: "add", productId: next.productId, quantity: existing.quantity + next.quantity }
    // add folded onto a pending absolute set → bump the set target
    return { kind: "set", productId: next.productId, quantity: existing.quantity + next.quantity }
  }

  const bumpRev = () => { mutationRev.current += 1 }

  const runServerOp = useCallback(async (op: SyncOp, revAtRun: number) => {
    try {
      let data: ServerCartResponse | undefined
      if (op.kind === "set") {
        data = await apiPut("/api/cart/update", { productId: op.productId, quantity: op.quantity })
      } else if (op.kind === "add") {
        data = await apiPost("/api/cart/add", { productId: op.productId, quantity: op.quantity })
      } else if (op.kind === "remove") {
        data = await apiDelete(`/api/cart/${op.productId}`)
      } else {
        data = await apiDelete("/api/cart/clear")
      }
      // AUTHORITATIVE reconciliation — but ONLY when the user has not made a
      // newer local change since this op was enqueued. Otherwise the slower
      // server snapshot would clobber fresher optimistic intent.
      if (revAtRun === mutationRev.current && data?.success && Array.isArray(data.cart)) {
        const mapped = data.cart.map(mapServerCartItem).filter((i: CartItem | null): i is CartItem => i !== null)
        setItems(mapped)
        for (const li of mapped) lastSyncedQty.current.set(li.product.id, li.quantity)
      }
      return true
    } catch (err: any) {
      console.error("Cart server sync failed:", err)
      // Roll the optimistic change back to the last value the server confirmed
      // and refetch — the user gets an honest message, not a phantom cart.
      if (op.kind === "set" || op.kind === "add") {
        const prev = lastSyncedQty.current.get(op.productId)
        setItems((current) => {
          if (prev === undefined) return current.filter((i) => i.product.id !== op.productId)
          return current.map((i) => (i.product.id === op.productId ? { ...i, quantity: prev } : i))
        })
      }
      fetchServerCart()
      toast.error("Could not update your cart. Showing the saved version.")
      return false
    }
  }, [])

  // Chain one op for a product AFTER any clear barrier and any prior per-line
  // work, so ordering is: [prior barrier] -> [previous ops for this line] -> this.
  const chainOp = useCallback((op: SyncOp, revAtRun: number) => {
    const barrier = clearBarrier.current || Promise.resolve()
    if (op.kind === "clear") {
      clearBarrier.current = barrier.then(() => runServerOp(op, revAtRun))
      return
    }
    const prevChain = chainsByProduct.current.get(op.productId) || Promise.resolve()
    chainsByProduct.current.set(op.productId, barrier.then(() => prevChain).then(() => runServerOp(op, revAtRun)))
  }, [runServerOp])

  const enqueueSync = useCallback((op: SyncOp) => {
    if (!isAuthRef.current) return
    if (op.kind === "clear") {
      // CLEAR is a barrier: immediately flush every debounced per-line op into
      // its chain (ordered before the clear), then run clear after them.
      const rev = mutationRev.current
      for (const [pid, { op: pending, timer }] of pendingByProduct.current.entries()) {
        clearTimeout(timer)
        pendingByProduct.current.delete(pid)
        chainOp(pending, rev)
      }
      chainOp(op, rev)
      return
    }
    const pid = op.productId
    const existing = pendingByProduct.current.get(pid)
    const merged = mergePending(existing?.op, op)
    if (existing) clearTimeout(existing.timer)
    const revAtEnqueue = mutationRev.current
    const timer = setTimeout(() => {
      pendingByProduct.current.delete(pid)
      chainOp(merged, revAtEnqueue)
    }, SYNC_DEBOUNCE_MS)
    pendingByProduct.current.set(pid, { op: merged, timer })
  }, [chainOp])

  /**
   * Fetch server cart and replace local state. Hoisted so the sync queue's
   * failure path can refetch without caring about declaration order.
   */
  async function fetchServerCart() {
    if (!isAuthRef.current) return

    try {
      const data = await apiGet('/api/cart')
      if (data.success && data.cart) {
        const mapped = data.cart
          .map(mapServerCartItem)
          .filter((item: CartItem | null): item is CartItem => item !== null)
        setItems(mapped)
        for (const li of mapped) lastSyncedQty.current.set(li.product.id, li.quantity)
      }
    } catch (err: any) {
      if (err?.status === 401) return
      console.error("Failed to fetch server cart:", err)
    }
  }

  /**
   * Called when loginEvent increments (user just logged in)
   * Merges localStorage cart → server → fetches merged result. Reads the
   * GUEST-scoped cart (or the pre-scoping legacy key) so a guest's pending
   * items survive login — and only ever merges guest data, never another
   * user's scoped cart.
   */
  const mergeCartOnLogin = async () => {
    setIsSyncing(true)
    try {
      const localCart =
        localStorage.getItem("cart:guest") || localStorage.getItem(LEGACY_CART_KEY)
      const localItems: CartItem[] = localCart ? JSON.parse(localCart) : []

      if (localItems.length > 0) {
        const syncPayload = localItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        }))

        await apiPost('/api/cart/sync', { items: syncPayload })
        localStorage.removeItem("cart:guest")
        localStorage.removeItem(LEGACY_CART_KEY)
      }

      // Fetch the merged cart from server
      await fetchServerCart()
    } catch (err) {
      console.error("Cart merge on login failed:", err)
    } finally {
      setIsSyncing(false)
    }
  }

  // Watch for login events — merge localStorage cart with server
  useEffect(() => {
    if (loginEvent > 0) {
      mergeCartOnLogin()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginEvent])

  // If user is already logged in on page load, fetch server cart
  useEffect(() => {
    if (isAuthenticated && isHydrated) {
      fetchServerCart()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]) // Only on initial hydration

  // Account/scope change (logout, user switch) must RESET isolated queue state:
  // drop every debounced op and barrier for the previous scope and clear the
  // last-synced baseline so a new account never inherits stale pending writes.
  useEffect(() => {
    for (const { timer } of pendingByProduct.current.values()) clearTimeout(timer)
    pendingByProduct.current.clear()
    chainsByProduct.current.clear()
    clearBarrier.current = null
    lastSyncedQty.current.clear()
    mutationRev.current += 1
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  // Flush any debounced syncs when the tab hides — a quick add-then-navigate
  // must not silently drop the queued mutation.
  useEffect(() => {
    const flush = () => {
      for (const [pid, { op, timer }] of pendingByProduct.current.entries()) {
        clearTimeout(timer)
        pendingByProduct.current.delete(pid)
        chainOp(op, mutationRev.current)
      }
    }
    document.addEventListener("visibilitychange", flush)
    return () => document.removeEventListener("visibilitychange", flush)
  }, [chainOp])

  // ======= Cart Operations =======

  const addToCart = useCallback((product: Product, quantity = 1) => {
    bumpRev()
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

    // Sync to server if authenticated (accumulates with any pending add)
    enqueueSync({ kind: "add", productId: product.id, quantity })
  }, [enqueueSync])

  const removeFromCart = useCallback((productId: string) => {
    bumpRev()
    setItems(currentItems => currentItems.filter(item => item.product.id !== productId))
    const existing = pendingByProduct.current.get(productId)
    if (existing) clearTimeout(existing.timer)
    pendingByProduct.current.delete(productId)
    if (isAuthRef.current) {
      chainOp({ kind: "remove", productId }, mutationRev.current)
    }
  }, [chainOp])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    bumpRev()
    setItems(currentItems =>
      currentItems.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    )
    // SET coalesces to the latest absolute intent; pending adds fold onto it.
    enqueueSync({ kind: "set", productId, quantity })
  }, [removeFromCart, enqueueSync])

  const clearCart = useCallback(() => {
    bumpRev()
    setItems([])
    enqueueSync({ kind: "clear" })
  }, [enqueueSync])

  // Post-order local reconciliation. The backend authoritatively removes
  // EXACTLY the purchased QUANTITIES from the server cart (settle
  // -CartAfterPayment for prepaid via verify/webhook, applyCodCartAndAddress
  // for COD). The client must mirror that: decrement purchased units, keep
  // any extra units the shopper added meanwhile, and NEVER fire a destructive
  // clear-all. Idempotent — safe to call twice after a reload recovery.
  const removePurchasedItems = useCallback((purchased: Array<string> | Array<{ productId: string; quantity: number }>) => {
    const need = new Map<string, number>()
    for (const entry of purchased) {
      if (typeof entry === "string") {
        need.set(entry, Infinity) // legacy call shape: whole line
      } else {
        need.set(String(entry.productId), (need.get(String(entry.productId)) || 0) + entry.quantity)
      }
    }
    if (need.size === 0) return
    bumpRev()
    setItems(current => {
      const next: CartItem[] = []
      for (const item of current) {
        const remaining = need.get(item.product.id)
        if (remaining === undefined) { next.push(item); continue }
        if (remaining === Infinity) continue // whole line removed
        const left = item.quantity - remaining
        if (left > 0) next.push({ ...item, quantity: left })
      }
      return next
    })
    // Persist immediately — the purchase is committed server-side.
    localStorage.setItem(storageKeyRef.current, JSON.stringify(
      itemsRef.current
        .map(item => {
          const remaining = need.get(item.product.id)
          if (remaining === undefined) return item
          if (remaining === Infinity) return null
          const left = item.quantity - remaining
          return left > 0 ? { ...item, quantity: left } : null
        })
        .filter(Boolean)
    ))
    // Server-side quantities for bought lines are already settled authoritatively.
    for (const pid of need.keys()) lastSyncedQty.current.delete(pid)
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
        removePurchasedItems,
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
