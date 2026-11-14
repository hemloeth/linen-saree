"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { apiConfigured } from "@/lib/api/client";
import { fetchPaginatedProducts, normalizeProduct } from "@/lib/api/products";
import { accountApi, wishlistIds } from "@/lib/api/account";
import { cartApi } from "@/lib/api/cart";
import { fetchMerchandising } from "@/lib/api/merchandising";

const CART_KEY = "hoq_bag_v2";
const WISHLIST_KEY = "hoq_wishlist_v2";

const StoreContext = createContext(null);

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside <StoreProvider>");
  return context;
}

/** @deprecated use useStore() — kept for backwards compatibility */
export const useCart = useStore;

export function StoreProvider({ children }) {
  // Real product catalog without mock demo-product fallback in production
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [collectionsData, setCollectionsData] = useState([]);
  const [merchandisingError, setMerchandisingError] = useState(null);

  // Authentication & Profile state
  const [user, setUser] = useState(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Shopping state
  const [items, setItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [restored, setRestored] = useState(false);
  const toastTimer = useRef(null);

  // Concurrency guard refs to prevent duplicate synchronization operations
  const isSyncingCartRef = useRef(false);
  const isSyncingWishlistRef = useRef(false);

  const notify = useCallback((message, item) => {
    setToast({ id: Date.now(), message, item });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // 1. Initial Session Restoration: Check if user has an active session cookie on mount
  useEffect(() => {
    // Purge legacy stored tokens to enforce pure HttpOnly cookie authentication
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("token");
        window.localStorage.removeItem("auth_token");
        window.localStorage.removeItem("hoq_auth_token");
        window.sessionStorage.removeItem("token");
        window.sessionStorage.removeItem("auth_token");
        window.sessionStorage.removeItem("hoq_auth_token");
      }
    } catch {
      /* ignore */
    }

    if (!apiConfigured) {
      setCatalogLoading(false);
      setCatalogError("API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL.");
      setAuthInitialized(true);
      return;
    }

    let active = true;
    accountApi
      .getProfile()
      .then((res) => {
        if (!active) return;
        if (res?.success && res.user) {
          setUser(res.user);
        }
      })
      .catch(() => {
        // Not logged in or expired session — proceed cleanly as guest
      })
      .finally(() => {
        if (active) setAuthInitialized(true);
      });

    return () => {
      active = false;
    };
  }, []);

  // 2. Initial Cart & Wishlist Restoration & Safe Synchronization
  useEffect(() => {
    if (!authInitialized) return;

    let active = true;

    async function initializeUserData() {
      if (user) {
        // -------------------------------------------------------------------
        // AUTHENTICATED FLOW
        // -------------------------------------------------------------------

        // A. Wishlist: Sync any guest items safely; ONLY clear localStorage if server confirms
        if (!isSyncingWishlistRef.current) {
          isSyncingWishlistRef.current = true;
          try {
            const guestWishlist = JSON.parse(window.localStorage.getItem(WISHLIST_KEY) || "[]")
              .filter((id) => /^[a-f\d]{24}$/i.test(String(id)));

            if (guestWishlist.length > 0) {
              const syncRes = await accountApi.wishlistSync(guestWishlist);
              if (syncRes?.success && active) {
                setWishlist(wishlistIds(syncRes));
                // Verified server sync confirmation: safely remove guest data
                window.localStorage.removeItem(WISHLIST_KEY);
              }
            } else {
              const wData = await accountApi.wishlist();
              if (active) setWishlist(wishlistIds(wData));
            }
          } catch (e) {
            console.warn("Wishlist synchronization failed; preserving guest items:", e.message);
            // On failure, do NOT remove guest localStorage
          } finally {
            isSyncingWishlistRef.current = false;
          }
        }

        // B. Cart: Sync any guest lines safely; ONLY clear localStorage if server confirms
        if (!isSyncingCartRef.current) {
          isSyncingCartRef.current = true;
          try {
            const localCart = JSON.parse(window.localStorage.getItem(CART_KEY) || "[]");
            const validLines = (localCart || [])
              .map((line) => ({ productId: String(line.id), quantity: Number(line.qty || 1) }))
              .filter((l) => /^[a-f\d]{24}$/i.test(l.productId) && l.quantity > 0);

            if (validLines.length > 0) {
              const syncRes = await cartApi.sync(validLines);
              if (syncRes?.success) {
                // Verified server sync confirmation: safely remove guest data
                window.localStorage.removeItem(CART_KEY);
              }
            }

            const serverCart = await cartApi.get();
            if (active && serverCart?.cart) {
              const parsedLines = serverCart.cart
                .filter((line) => line.productId)
                .map((line) => ({
                  product: normalizeProduct(line.productId),
                  qty: line.quantity,
                }));
              setItems(parsedLines);
            }
          } catch (e) {
            console.warn("Cart synchronization failed; preserving guest items:", e.message);
            // On failure, do NOT remove guest localStorage
          } finally {
            isSyncingCartRef.current = false;
          }
        }
      } else {
        // -------------------------------------------------------------------
        // GUEST FLOW (load from local storage)
        // -------------------------------------------------------------------
        try {
          const rawCart = window.localStorage.getItem(CART_KEY);
          if (rawCart) {
            const saved = JSON.parse(rawCart);
            const lines = saved
              .map((line) => ({
                product: { id: String(line.id) },
                qty: Number(line.qty || 1),
              }))
              .filter((line) => line.product && line.qty > 0);
            if (lines.length && active) setItems(lines);
          }
          const rawWishlist = window.localStorage.getItem(WISHLIST_KEY);
          if (rawWishlist) {
            const ids = JSON.parse(rawWishlist);
            if (Array.isArray(ids) && ids.length && active) setWishlist(ids.map(String));
          }
        } catch {
          /* corrupted storage — proceed empty */
        }
      }

      if (active) setRestored(true);
    }

    initializeUserData();

    return () => {
      active = false;
    };
  }, [user, authInitialized]);

  // 3. Real Product Catalog Loading: Fetch initial 30 products without demo fallbacks
  useEffect(() => {
    if (!apiConfigured) {
      setCatalogLoading(false);
      setCatalogError("API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL.");
      return;
    }

    let active = true;

    fetchPaginatedProducts({ page: 1, limit: 30, sortBy: "newest" })
      .then((res) => {
        if (!active) return;
        setCatalog(res.products || []);
        setCatalogError(null);
      })
      .catch((error) => {
        if (!active) return;
        setCatalog([]);
        setCatalogError(error.message || "Failed to load product catalog.");
      })
      .finally(() => {
        if (active) setCatalogLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // 4. Merchandising (Categories & Collections)
  useEffect(() => {
    if (!apiConfigured) return;
    let active = true;

    fetchMerchandising()
      .then((result) => {
        if (!active) return;
        setCategories(result.categories);
        setCollectionsData(result.collections);
        setMerchandisingError(result.errors.join(". ") || null);
      })
      .catch((error) => {
        if (!active) return;
        setMerchandisingError(error.message || "Unable to fetch store collections.");
      });

    return () => {
      active = false;
    };
  }, []);

  // Reconcile guest cart item references once catalog loads
  useEffect(() => {
    if (!restored || catalogLoading || user) return;
    setItems((current) =>
      current
        .map((line) => {
          const found = catalog.find((p) => String(p.id) === String(line.product.id));
          return found ? { ...line, product: found } : line;
        })
        .filter((line) => line.product && line.qty > 0)
    );
  }, [catalog, catalogLoading, restored, user]);

  // Persist guest cart & wishlist to localStorage
  useEffect(() => {
    if (!restored || user) return;
    try {
      window.localStorage.setItem(
        CART_KEY,
        JSON.stringify(items.map((line) => ({ id: line.product.id, qty: line.qty })))
      );
    } catch {
      /* storage unavailable */
    }
  }, [items, restored, user]);

  useEffect(() => {
    if (!restored || user) return;
    try {
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {
      /* storage unavailable */
    }
  }, [wishlist, restored, user]);

  // Authenticate (Login / Register) with Safe Data Migration
  const authenticate = useCallback(async (mode, fields) => {
    setAuthBusy(true);
    try {
      const response =
        mode === "register" ? await accountApi.register(fields) : await accountApi.login(fields);

      const profileRes = await accountApi.getProfile().catch(() => null);
      const userDoc = profileRes?.user || response.user || response;
      setUser(userDoc);

      // Wishlist safe sync post-login
      try {
        const guestWishlist = JSON.parse(window.localStorage.getItem(WISHLIST_KEY) || "[]")
          .filter((id) => /^[a-f\d]{24}$/i.test(String(id)));

        if (guestWishlist.length > 0) {
          const wData = await accountApi.wishlistSync(guestWishlist);
          if (wData?.success) {
            setWishlist(wishlistIds(wData));
            window.localStorage.removeItem(WISHLIST_KEY);
          }
        } else {
          const wData = await accountApi.wishlist();
          setWishlist(wishlistIds(wData));
        }
      } catch (e) {
        console.warn("Wishlist sync post-login error; preserving guest data:", e.message);
      }

      // Cart safe sync post-login
      try {
        const localCart = JSON.parse(window.localStorage.getItem(CART_KEY) || "[]");
        const validLines = (localCart || [])
          .map((line) => ({ productId: String(line.id), quantity: Number(line.qty || 1) }))
          .filter((l) => /^[a-f\d]{24}$/i.test(l.productId) && l.quantity > 0);

        if (validLines.length > 0) {
          const syncRes = await cartApi.sync(validLines);
          if (syncRes?.success) {
            window.localStorage.removeItem(CART_KEY);
          }
        }

        const serverCart = await cartApi.get();
        if (serverCart?.cart) {
          setItems(
            serverCart.cart
              .filter((l) => l.productId)
              .map((l) => ({ product: normalizeProduct(l.productId), qty: l.quantity }))
          );
        }
      } catch (e) {
        console.warn("Cart sync post-login error; preserving guest data:", e.message);
      }

      return response;
    } finally {
      setAuthBusy(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await accountApi.logout();
    } catch {
      /* ignore network errors on logout */
    }
    setUser(null);
    setWishlist([]);
    setItems([]);
    window.localStorage.removeItem(WISHLIST_KEY);
    window.localStorage.removeItem(CART_KEY);
  }, []);

  // Refresh user profile
  const refreshProfile = useCallback(async () => {
    try {
      const res = await accountApi.getProfile();
      if (res?.success && res.user) {
        setUser(res.user);
      }
    } catch (e) {
      console.warn("Failed to refresh profile:", e.message);
    }
  }, []);

  // Re-fetch authoritative cart from server
  const refetchServerCart = useCallback(async () => {
    if (!user) return;
    try {
      const res = await cartApi.get();
      if (res?.success && res.cart) {
        setItems(
          res.cart
            .filter((l) => l.productId)
            .map((l) => ({ product: normalizeProduct(l.productId), qty: l.quantity }))
        );
      }
    } catch (e) {
      console.warn("Failed to refetch server cart:", e.message);
    }
  }, [user]);

  // Cart Operation: Add with Optimistic Rollback
  const add = useCallback(
    async (product, quantity = 1, message = "Added to bag") => {
      if (!product) return;
      const pid = String(product.id);
      const previousItems = items;

      // Optimistic update
      setItems((current) => {
        const existing = current.find((line) => String(line.product.id) === pid);
        if (existing) {
          return current.map((line) =>
            String(line.product.id) === pid ? { ...line, qty: line.qty + quantity } : line
          );
        }
        return [...current, { product, qty: quantity }];
      });
      notify(message, product.name);

      // Authenticated backend mutation with rollback
      if (user && /^[a-f\d]{24}$/i.test(pid)) {
        try {
          const res = await cartApi.add(pid, quantity);
          if (res?.cart) {
            // Reconcile with authoritative server state
            setItems(
              res.cart
                .filter((l) => l.productId)
                .map((l) => ({ product: normalizeProduct(l.productId), qty: l.quantity }))
            );
          }
        } catch (err) {
          // Rollback on failure
          setItems(previousItems);
          notify(err.message || "Could not add item to bag. Please try again.");
          await refetchServerCart();
        }
      }
    },
    [user, items, notify, refetchServerCart]
  );

  // Cart Operation: Set Quantity with Optimistic Rollback
  const setQty = useCallback(
    async (id, qty) => {
      const pid = String(id);
      const previousItems = items;

      setItems((current) =>
        qty <= 0
          ? current.filter((line) => String(line.product.id) !== pid)
          : current.map((line) => (String(line.product.id) === pid ? { ...line, qty } : line))
      );

      if (user && /^[a-f\d]{24}$/i.test(pid)) {
        try {
          const res = qty <= 0 ? await cartApi.remove(pid) : await cartApi.update(pid, qty);
          if (res?.cart) {
            setItems(
              res.cart
                .filter((l) => l.productId)
                .map((l) => ({ product: normalizeProduct(l.productId), qty: l.quantity }))
            );
          }
        } catch (err) {
          setItems(previousItems);
          notify(err.message || "Failed to update quantity. Please try again.");
          await refetchServerCart();
        }
      }
    },
    [user, items, notify, refetchServerCart]
  );

  // Cart Operation: Remove with Optimistic Rollback
  const remove = useCallback(
    async (id) => {
      const pid = String(id);
      const previousItems = items;

      setItems((current) => current.filter((line) => String(line.product.id) !== pid));

      if (user && /^[a-f\d]{24}$/i.test(pid)) {
        try {
          const res = await cartApi.remove(pid);
          if (res?.cart) {
            setItems(
              res.cart
                .filter((l) => l.productId)
                .map((l) => ({ product: normalizeProduct(l.productId), qty: l.quantity }))
            );
          }
        } catch (err) {
          setItems(previousItems);
          notify(err.message || "Failed to remove item. Please try again.");
          await refetchServerCart();
        }
      }
    },
    [user, items, notify, refetchServerCart]
  );

  // Cart Operation: Clear
  const clear = useCallback(async () => {
    const previousItems = items;
    setItems([]);

    if (user) {
      try {
        await cartApi.clear();
      } catch (err) {
        setItems(previousItems);
        notify("Failed to clear shopping bag.");
      }
    }
  }, [user, items, notify]);

  // Wishlist Operation: Toggle with Optimistic Rollback
  const toggleWishlist = useCallback(
    async (id) => {
      const productId = String(id);
      const previouslySaved = wishlist.includes(productId);

      setWishlist((current) =>
        previouslySaved ? current.filter((x) => x !== productId) : [...current, productId]
      );

      if (!user) return;

      try {
        const updated = previouslySaved
          ? await accountApi.wishlistRemove(productId)
          : await accountApi.wishlistAdd(productId);
        if (updated?.success) {
          setWishlist(wishlistIds(updated));
        }
      } catch (error) {
        // Rollback state on API failure
        setWishlist((current) =>
          previouslySaved
            ? [...new Set([...current, productId])]
            : current.filter((x) => x !== productId)
        );
        notify(error.message || "Failed to update wishlist.");
      }
    },
    [wishlist, user, notify]
  );

  // Address operations
  const addAddress = useCallback(async (addressData) => {
    const res = await accountApi.addAddress(addressData);
    if (res?.success && res.address) {
      setUser((prev) => (prev ? { ...prev, address: res.address } : prev));
    }
    return res;
  }, []);

  const updateAddress = useCallback(async (id, addressData) => {
    const res = await accountApi.updateAddress(id, addressData);
    if (res?.success && res.address) {
      setUser((prev) => (prev ? { ...prev, address: res.address } : prev));
    }
    return res;
  }, []);

  const deleteAddress = useCallback(async (id) => {
    const res = await accountApi.deleteAddress(id);
    if (res?.success && res.address) {
      setUser((prev) => (prev ? { ...prev, address: res.address } : prev));
    }
    return res;
  }, []);

  // Global shortcuts: Ctrl/Cmd+K search, Escape closes overlays
  useEffect(() => {
    function onKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setCartOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = useMemo(() => {
    const count = items.reduce((sum, line) => sum + line.qty, 0);
    const subtotal = items.reduce(
      (sum, line) => sum + (line.product?.price || 0) * line.qty,
      0
    );

    return {
      items,
      catalog,
      catalogLoading,
      catalogError,
      categories,
      collectionsData,
      merchandisingError,
      user,
      authBusy,
      authInitialized,
      authenticate,
      logout,
      refreshProfile,
      refetchServerCart,
      count,
      subtotal,
      add,
      setQty,
      remove,
      clear,
      wishlist,
      toggleWishlist,
      isWished: (id) => wishlist.includes(String(id)),
      addAddress,
      updateAddress,
      deleteAddress,
      cartOpen,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      searchOpen,
      openSearch: () => setSearchOpen(true),
      closeSearch: () => setSearchOpen(false),
      notify,
    };
  }, [
    items,
    catalog,
    catalogLoading,
    catalogError,
    categories,
    collectionsData,
    merchandisingError,
    user,
    authBusy,
    authInitialized,
    authenticate,
    logout,
    refreshProfile,
    refetchServerCart,
    add,
    setQty,
    remove,
    clear,
    wishlist,
    toggleWishlist,
    addAddress,
    updateAddress,
    deleteAddress,
    cartOpen,
    searchOpen,
    notify,
  ]);

  return (
    <StoreContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex justify-center px-4"
      >
        {toast ? (
          <p className="pointer-events-auto flex items-center gap-2 rounded-full bg-pine-950 px-4 py-2 font-inter text-xs text-white shadow-lg">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m5 13 4 4L19 7" />
            </svg>
            {toast.message}
            {toast.item ? <span className="text-white/70">· {toast.item}</span> : null}
          </p>
        ) : null}
      </div>
    </StoreContext.Provider>
  );
}

export default StoreProvider;
