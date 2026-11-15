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
import { fetchAllProducts, fetchPaginatedProducts, fetchProductCardsByIds, normalizeProduct } from "@/lib/api/products";
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

// Pure, deterministic cart transition functions
function pureAdd(current, product, qty) {
  const pid = String(product.id);
  const exists = current.find((l) => String(l.product.id) === pid);
  if (exists) {
    return current.map((l) =>
      String(l.product.id) === pid ? { ...l, qty: l.qty + qty } : l
    );
  }
  return [...current, { product, qty }];
}

function pureSetQty(current, pid, qty) {
  if (qty <= 0) {
    return current.filter((l) => String(l.product.id) !== String(pid));
  }
  return current.map((l) =>
    String(l.product.id) === String(pid) ? { ...l, qty } : l
  );
}

function pureRemove(current, pid) {
  return current.filter((l) => String(l.product.id) !== String(pid));
}

function pureDeltaRollback(current, pid, quantity) {
  return current
    .map((line) => {
      if (String(line.product.id) === String(pid)) {
        const remaining = line.qty - quantity;
        return remaining > 0 ? { ...line, qty: remaining } : null;
      }
      return line;
    })
    .filter(Boolean);
}

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

  // Authoritative refs to eliminate stale closures across concurrent operations
  const itemsRef = useRef([]);
  const catalogRef = useRef([]);
  const isFetchingCatalogRef = useRef(false);

  // Concurrency guard refs to prevent duplicate synchronization operations
  const isSyncingCartRef = useRef(false);
  const isSyncingWishlistRef = useRef(false);
  const cartQueueRef = useRef(Promise.resolve());
  const wishlistInFlightRef = useRef(new Set());

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
        // GUEST FLOW (load from local storage with independent card hydration)
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
            if (lines.length && active) {
              setItems(lines);
              const lineIds = lines.map((l) => l.product.id);
              fetchProductCardsByIds(lineIds)
                .then((hydrated) => {
                  if (!active || !hydrated?.length) return;
                  const byId = new Map(hydrated.map((p) => [String(p.id), p]));
                  setItems((current) =>
                    current.map((line) => {
                      const p = byId.get(String(line.product.id));
                      return p ? { ...line, product: p } : line;
                    })
                  );
                })
                .catch(() => {});
            }
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

  // 3. On-Demand Product Catalog Loading: Fetches all catalog products without 100-item cutoff
  const loadCatalog = useCallback(async () => {
    if (catalogRef.current.length > 0) {
      return catalogRef.current;
    }
    if (isFetchingCatalogRef.current) return [];
    isFetchingCatalogRef.current = true;
    setCatalogLoading(true);
    try {
      const prods = await fetchAllProducts();
      catalogRef.current = prods;
      setCatalog(prods);
      setCatalogError(null);
      return prods;
    } catch (err) {
      setCatalogError(err.message || "Failed to load product catalog.");
      return [];
    } finally {
      setCatalogLoading(false);
      isFetchingCatalogRef.current = false;
    }
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

  const pendingCartMutationsRef = useRef(0);
  const cartRef = useRef(items);
  const productOpVersionRef = useRef(new Map());

  // Synchronous guest cart persistence helper
  const persistGuestCart = useCallback((newLines) => {
    if (!user && typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          CART_KEY,
          JSON.stringify(newLines.map((l) => ({ id: l.product.id, qty: l.qty })))
        );
      } catch {
        /* storage unavailable */
      }
    }
  }, [user]);

  // Centralized synchronous cart state commit
  const updateCartState = useCallback(
    (nextCart) => {
      cartRef.current = nextCart;
      itemsRef.current = nextCart;
      persistGuestCart(nextCart);
      setItems((current) => nextCart);
      return nextCart;
    },
    [persistGuestCart]
  );

  // Synchronize itemsRef without mutating state in render/updaters
  useEffect(() => {
    itemsRef.current = items;
    cartRef.current = items;
  }, [items]);

  // Await in-flight cart mutations to complete (essential for checkout navigation)
  const awaitCartSettled = useCallback(async () => {
    try {
      await cartQueueRef.current;
    } catch {
      /* ignore */
    }
  }, []);

  // Authenticate (Login / Register) with Safe Data Migration
  const authenticate = useCallback(async (mode, fields) => {
    if (typeof awaitCartSettled === "function") {
      await awaitCartSettled();
    }
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
          updateCartState(
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
  }, [awaitCartSettled, updateCartState]);

  // Logout
  const logout = useCallback(async () => {
    if (typeof awaitCartSettled === "function") {
      await awaitCartSettled();
    }
    try {
      await accountApi.logout();
    } catch {
      /* ignore network errors on logout */
    }
    productOpVersionRef.current.clear();
    setUser(null);
    setWishlist([]);
    updateCartState([]);
    window.localStorage.removeItem(WISHLIST_KEY);
    window.localStorage.removeItem(CART_KEY);
  }, [awaitCartSettled, updateCartState]);

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
        updateCartState(
          res.cart
            .filter((l) => l.productId)
            .map((l) => ({ product: normalizeProduct(l.productId), qty: l.quantity }))
        );
      }
    } catch (e) {
      console.warn("Failed to refetch server cart:", e.message);
    }
  }, [user, updateCartState]);

  // Cart Operation: Add with Pure Deterministic Transitions & Delta Rollback
  const add = useCallback(
    async (product, quantity = 1, message = "Added to bag") => {
      if (!product) {
        return { success: false, error: "Invalid product" };
      }
      if (!product.inStock && Number(product.stock) <= 0) {
        notify("This saree is currently out of stock.");
        return { success: false, error: "Out of stock" };
      }

      const pid = String(product.id);
      const opVersion = (productOpVersionRef.current.get(pid) || 0) + 1;
      productOpVersionRef.current.set(pid, opVersion);

      // Synchronously compute next state and commit
      const nextCart = pureAdd(cartRef.current, product, quantity);
      updateCartState(nextCart);
      const calculatedCount = nextCart.length;

      // Authenticated backend mutation serialized via queue with isolated delta rollback
      if (user && /^[a-f\d]{24}$/i.test(pid)) {
        pendingCartMutationsRef.current++;
        return new Promise((resolve) => {
          cartQueueRef.current = cartQueueRef.current
            .then(async () => {
              try {
                const res = await cartApi.add(pid, quantity);
                pendingCartMutationsRef.current = Math.max(0, pendingCartMutationsRef.current - 1);
                // Only overwrite if no subsequent mutations are currently in flight
                if (pendingCartMutationsRef.current === 0 && res?.cart) {
                  const serverItems = res.cart
                    .filter((l) => l.productId)
                    .map((l) => ({ product: normalizeProduct(l.productId), qty: l.quantity }));
                  updateCartState(serverItems);
                }
                if (message) notify(message, product.name);
                resolve({ success: true, count: calculatedCount });
              } catch (err) {
                pendingCartMutationsRef.current = Math.max(0, pendingCartMutationsRef.current - 1);
                // DELTA ROLLBACK: only subtract this mutation's quantity if no newer mutation on this product superseded it
                if (productOpVersionRef.current.get(pid) === opVersion) {
                  const rolledBack = pureDeltaRollback(cartRef.current, pid, quantity);
                  updateCartState(rolledBack);
                }
                notify(err.message || "Could not add item to bag. Please try again.");
                if (pendingCartMutationsRef.current === 0) {
                  await refetchServerCart();
                }
                resolve({ success: false, error: err.message || "Failed to add to bag" });
              }
            })
            .catch(() => {
              pendingCartMutationsRef.current = Math.max(0, pendingCartMutationsRef.current - 1);
              resolve({ success: false, error: "Network error" });
            });
        });
      }

      // Guest flow: operation is immediately committed and confirmed
      if (message) notify(message, product.name);
      return { success: true, count: calculatedCount };
    },
    [user, notify, updateCartState, refetchServerCart]
  );

  // Cart Operation: Set Quantity with Pure Deterministic Transitions & Delta Rollback
  const setQty = useCallback(
    async (id, qty) => {
      const pid = String(id);
      const target = cartRef.current.find((l) => String(l.product.id) === pid);
      const previousQty = target?.qty || 0;
      const opVersion = (productOpVersionRef.current.get(pid) || 0) + 1;
      productOpVersionRef.current.set(pid, opVersion);

      const nextCart = pureSetQty(cartRef.current, pid, qty);
      updateCartState(nextCart);

      if (user && /^[a-f\d]{24}$/i.test(pid)) {
        pendingCartMutationsRef.current++;
        return new Promise((resolve) => {
          cartQueueRef.current = cartQueueRef.current
            .then(async () => {
              try {
                const res = qty <= 0 ? await cartApi.remove(pid) : await cartApi.update(pid, qty);
                pendingCartMutationsRef.current = Math.max(0, pendingCartMutationsRef.current - 1);
                if (pendingCartMutationsRef.current === 0 && res?.cart) {
                  const serverItems = res.cart
                    .filter((l) => l.productId)
                    .map((l) => ({ product: normalizeProduct(l.productId), qty: l.quantity }));
                  updateCartState(serverItems);
                }
                resolve({ success: true });
              } catch (err) {
                pendingCartMutationsRef.current = Math.max(0, pendingCartMutationsRef.current - 1);
                // Revert to previous quantity only if no newer operation on this product has superseded this request!
                if (productOpVersionRef.current.get(pid) === opVersion) {
                  const reverted = pureSetQty(cartRef.current, pid, previousQty);
                  updateCartState(reverted);
                }
                notify(err.message || "Failed to update quantity. Please try again.");
                if (pendingCartMutationsRef.current === 0) {
                  await refetchServerCart();
                }
                resolve({ success: false, error: err.message });
              }
            })
            .catch(() => {
              pendingCartMutationsRef.current = Math.max(0, pendingCartMutationsRef.current - 1);
              resolve({ success: false, error: "Network error" });
            });
        });
      }

      return { success: true };
    },
    [user, notify, updateCartState, refetchServerCart]
  );

  // Cart Operation: Remove with Pure Deterministic Transitions & Delta Rollback
  const remove = useCallback(
    async (id) => {
      const pid = String(id);
      const removedLine = cartRef.current.find((line) => String(line.product.id) === pid) || null;
      const opVersion = (productOpVersionRef.current.get(pid) || 0) + 1;
      productOpVersionRef.current.set(pid, opVersion);

      const nextCart = pureRemove(cartRef.current, pid);
      updateCartState(nextCart);

      if (user && /^[a-f\d]{24}$/i.test(pid)) {
        pendingCartMutationsRef.current++;
        return new Promise((resolve) => {
          cartQueueRef.current = cartQueueRef.current
            .then(async () => {
              try {
                const res = await cartApi.remove(pid);
                pendingCartMutationsRef.current = Math.max(0, pendingCartMutationsRef.current - 1);
                if (pendingCartMutationsRef.current === 0 && res?.cart) {
                  const serverItems = res.cart
                    .filter((l) => l.productId)
                    .map((l) => ({ product: normalizeProduct(l.productId), qty: l.quantity }));
                  updateCartState(serverItems);
                }
                resolve({ success: true });
              } catch (err) {
                pendingCartMutationsRef.current = Math.max(0, pendingCartMutationsRef.current - 1);
                // Reinsert removed line on failure only if no newer mutation on this product superseded it
                // and avoid duplicating if item was re-added concurrently
                if (productOpVersionRef.current.get(pid) === opVersion && removedLine) {
                  const alreadyExists = cartRef.current.some((l) => String(l.product.id) === pid);
                  if (!alreadyExists) {
                    const reverted = [...cartRef.current, removedLine];
                    updateCartState(reverted);
                  }
                }
                notify(err.message || "Failed to remove item. Please try again.");
                if (pendingCartMutationsRef.current === 0) {
                  await refetchServerCart();
                }
                resolve({ success: false, error: err.message });
              }
            })
            .catch(() => {
              pendingCartMutationsRef.current = Math.max(0, pendingCartMutationsRef.current - 1);
              resolve({ success: false, error: "Network error" });
            });
        });
      }

      return { success: true };
    },
    [user, notify, updateCartState, refetchServerCart]
  );

  // Cart Operation: Clear with Mutex Queue, Delta Safety & Server Authorization
  const clear = useCallback(async () => {
    productOpVersionRef.current.clear();
    const prevCart = [...cartRef.current];
    updateCartState([]);

    if (user) {
      pendingCartMutationsRef.current++;
      return new Promise((resolve) => {
        cartQueueRef.current = cartQueueRef.current
          .then(async () => {
            try {
              const res = await cartApi.clear();
              pendingCartMutationsRef.current = Math.max(0, pendingCartMutationsRef.current - 1);
              // Only overwrite with empty array if no subsequent mutations were queued in the meantime
              if (pendingCartMutationsRef.current === 0) {
                if (res?.cart) {
                  const serverItems = res.cart
                    .filter((l) => l.productId)
                    .map((l) => ({ product: normalizeProduct(l.productId), qty: l.quantity }));
                  updateCartState(serverItems);
                } else {
                  updateCartState([]);
                }
              }
              resolve({ success: true });
            } catch (err) {
              pendingCartMutationsRef.current = Math.max(0, pendingCartMutationsRef.current - 1);
              // Recover user data on failed clear only if no newer operations were queued
              if (pendingCartMutationsRef.current === 0) {
                updateCartState(prevCart);
                notify("Failed to clear shopping bag. Your items were restored.");
                await refetchServerCart();
              } else {
                notify("Failed to clear shopping bag.");
              }
              resolve({ success: false, error: err.message || "Failed to clear bag" });
            }
          })
          .catch((err) => {
            pendingCartMutationsRef.current = Math.max(0, pendingCartMutationsRef.current - 1);
            resolve({ success: false, error: err?.message || "Network error" });
          });
      });
    }

    return { success: true };
  }, [user, notify, updateCartState, refetchServerCart]);

  // Wishlist Operation: Toggle with Concurrency In-Flight Guard & Optimistic Rollback
  const toggleWishlist = useCallback(
    async (id) => {
      const productId = String(id);
      if (wishlistInFlightRef.current.has(productId)) {
        return; // Guard rapid double-taps
      }
      wishlistInFlightRef.current.add(productId);

      const previouslySaved = wishlist.includes(productId);

      setWishlist((current) =>
        previouslySaved ? current.filter((x) => x !== productId) : [...current, productId]
      );

      if (!user) {
        wishlistInFlightRef.current.delete(productId);
        return;
      }

      try {
        const updated = previouslySaved
          ? await accountApi.wishlistRemove(productId)
          : await accountApi.wishlistAdd(productId);
        if (updated?.success) {
          setWishlist(wishlistIds(updated));
        }
      } catch (error) {
        setWishlist((current) =>
          previouslySaved
            ? [...new Set([...current, productId])]
            : current.filter((x) => x !== productId)
        );
        notify(error.message || "Failed to update wishlist.");
      } finally {
        wishlistInFlightRef.current.delete(productId);
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
      loadCatalog,
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
      awaitCartSettled,
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
    loadCatalog,
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
    awaitCartSettled,
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
