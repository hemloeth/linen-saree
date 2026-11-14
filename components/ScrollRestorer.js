"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const SCROLL_STORAGE_KEY_PREFIX = "hoq_scroll_pos_";
const TARGET_ID_KEY = "hoq_last_clicked_target_id";
const LEGACY_PRODUCT_ID_KEY = "hoq_last_clicked_product_id";
const FALLBACK_SCROLL_KEY = "hoq_last_scroll_y";

/**
 * Universal Production-Grade Scroll Restoration Engine
 * 
 * 1. Manages window.history.scrollRestoration = 'manual' to prevent jarring browser jumps to (0,0).
 * 2. Tracks exact pixel scroll position continuously and never allows route unmounts to wipe it with 0.
 * 3. Restores scroll position BEFORE the browser paints frame-0 (useLayoutEffect) to eliminate top/Hero flash.
 * 4. Works universally across ALL pages: Home (/), /shop, /best-sellers, /categories/*, /collections/*, /search, etc.
 * 5. Handles duplicate product cards across sections (e.g. New Arrivals vs Trending vs Bestsellers) by matching proximity.
 * 6. Polling ensures late-hydrating cards/images never push the scroll back to top.
 */
export default function ScrollRestorer() {
  const pathname = usePathname();
  const isPopStateRef = useRef(false);
  const prevPathnameRef = useRef(pathname);

  // 1. One-time setup: manual scroll restoration and popstate listener
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    function onPopState() {
      isPopStateRef.current = true;
    }

    function onBeforeUnload() {
      if (window.scrollY > 0) {
        try {
          sessionStorage.setItem(`${SCROLL_STORAGE_KEY_PREFIX}${window.location.pathname}`, String(window.scrollY));
          sessionStorage.setItem(FALLBACK_SCROLL_KEY, String(window.scrollY));
        } catch {}
      }
    }

    window.addEventListener("popstate", onPopState);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  // 2. Passive scroll tracker for current route (throttled via requestAnimationFrame)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let ticking = false;

    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 0) {
            try {
              sessionStorage.setItem(`${SCROLL_STORAGE_KEY_PREFIX}${pathname}`, String(window.scrollY));
            } catch {}
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      // ONLY save if scrollY is non-zero so we NEVER overwrite a real position with 0 during navigation!
      // Guard: never save a product detail scroll position as a catalog fallback scroll position!
      if (window.scrollY > 0) {
        try {
          sessionStorage.setItem(`${SCROLL_STORAGE_KEY_PREFIX}${pathname}`, String(window.scrollY));
          if (!pathname.startsWith("/product/")) {
            sessionStorage.setItem(FALLBACK_SCROLL_KEY, String(window.scrollY));
          }
        } catch {}
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  // 3. Pre-Paint Restoration Engine on Route Transition / Back Navigation
  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const isBackNavigation = isPopStateRef.current;
    isPopStateRef.current = false;

    // Normal forward navigation via Link (e.g. clicking "View all" to /shop, or any link):
    // ALWAYS start at the top (top: 0)! Never restore previous scroll on forward links.
    if (!isBackNavigation) {
      window.scrollTo({ top: 0, behavior: "instant" });
      sessionStorage.removeItem(TARGET_ID_KEY);
      sessionStorage.removeItem(LEGACY_PRODUCT_ID_KEY);
      sessionStorage.removeItem(FALLBACK_SCROLL_KEY);
      prevPathnameRef.current = pathname;
      return;
    }

    const savedPosRaw = sessionStorage.getItem(`${SCROLL_STORAGE_KEY_PREFIX}${pathname}`);
    const fallbackScrollRaw = sessionStorage.getItem(FALLBACK_SCROLL_KEY);
    const savedTargetId = sessionStorage.getItem(TARGET_ID_KEY);
    const legacyProductId = sessionStorage.getItem(LEGACY_PRODUCT_ID_KEY);

    const targetElementId = savedTargetId || (legacyProductId ? `product-card-${legacyProductId}` : null);

    // Resolve best scroll position: exact pathname position, or fallback click position
    let savedPos = null;
    if (savedPosRaw !== null && Number(savedPosRaw) > 0) {
      savedPos = Number(savedPosRaw);
    } else if (fallbackScrollRaw !== null && Number(fallbackScrollRaw) > 0) {
      savedPos = Number(fallbackScrollRaw);
    }

    // Determine if returning to any catalog/listing page (Home, Shop, Best-Sellers, Categories, Collections, Search)
    const isReturningToCatalog = !pathname.startsWith("/product/");

    if (isReturningToCatalog && (savedPos !== null || targetElementId)) {
      // Step 0: Synchronous instant pre-paint jump (stops Hero section flash dead in its tracks!)
      if (savedPos !== null && savedPos > 0) {
        window.scrollTo({ top: savedPos, behavior: "instant" });
      }

      // Pre-paint anchor proximity check
      if (targetElementId) {
        const matches = document.querySelectorAll(`[id="${targetElementId}"]`);
        let bestEl = null;
        if (matches.length === 1) {
          bestEl = matches[0];
        } else if (matches.length > 1 && savedPos !== null) {
          let minDiff = Infinity;
          matches.forEach((el) => {
            const docTop = window.scrollY + el.getBoundingClientRect().top;
            const diff = Math.abs(docTop - savedPos);
            if (diff < minDiff) {
              minDiff = diff;
              bestEl = el;
            }
          });
        }

        if (bestEl && (bestEl.getBoundingClientRect().height > 0 || bestEl.offsetParent !== null)) {
          const docTop = window.scrollY + bestEl.getBoundingClientRect().top;
          if (!savedPos || Math.abs(docTop - savedPos) < 500) {
            bestEl.scrollIntoView({ behavior: "instant", block: "center" });
          }
        }
      }

      // Step 1: Polling engine to maintain scroll position as async sections hydrate
      let attempts = 0;
      const maxAttempts = 60; // 60 * 35ms = ~2100ms max polling for lazy/hydrating cards

      const timer = setInterval(() => {
        attempts++;

        // Strategy A: Targeted anchor element restoration with duplicate-ID disambiguation
        if (targetElementId) {
          const matches = document.querySelectorAll(`[id="${targetElementId}"]`);
          let bestEl = null;
          if (matches.length === 1) {
            bestEl = matches[0];
          } else if (matches.length > 1 && savedPos !== null) {
            let minDiff = Infinity;
            matches.forEach((el) => {
              const docTop = window.scrollY + el.getBoundingClientRect().top;
              const diff = Math.abs(docTop - savedPos);
              if (diff < minDiff) {
                minDiff = diff;
                bestEl = el;
              }
            });
          }

          if (bestEl) {
            const rect = bestEl.getBoundingClientRect();
            if (rect.height > 0 || bestEl.offsetParent !== null) {
              const docTop = window.scrollY + rect.top;
              // Only scrollIntoView if it doesn't wildly conflict with savedPos (prevents top-jump)
              if (!savedPos || Math.abs(docTop - savedPos) < 500) {
                clearInterval(timer);
                sessionStorage.removeItem(TARGET_ID_KEY);
                sessionStorage.removeItem(LEGACY_PRODUCT_ID_KEY);
                sessionStorage.removeItem(FALLBACK_SCROLL_KEY);
                bestEl.scrollIntoView({ behavior: "instant", block: "center" });
                return;
              }
            }
          }
        }

        // Strategy B: Height-aware pixel scroll restoration
        if (savedPos !== null && savedPos > 0) {
          const currentScrollHeight = document.documentElement.scrollHeight;
          const maxPossible = Math.max(0, currentScrollHeight - window.innerHeight);
          const desired = Math.min(savedPos, maxPossible);

          window.scrollTo({ top: desired, behavior: "instant" });

          // If reached target position within 15px, or document is tall enough:
          if (Math.abs(window.scrollY - savedPos) <= 15 || (currentScrollHeight >= savedPos + window.innerHeight && attempts > 4)) {
            clearInterval(timer);
            sessionStorage.removeItem(TARGET_ID_KEY);
            sessionStorage.removeItem(LEGACY_PRODUCT_ID_KEY);
            sessionStorage.removeItem(FALLBACK_SCROLL_KEY);
            return;
          }
        }

        // Strategy C: Timeout fallback
        if (attempts >= maxAttempts) {
          clearInterval(timer);
          sessionStorage.removeItem(TARGET_ID_KEY);
          sessionStorage.removeItem(LEGACY_PRODUCT_ID_KEY);
          sessionStorage.removeItem(FALLBACK_SCROLL_KEY);
          if (savedPos !== null && savedPos > 0) {
            const maxPossible = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            window.scrollTo({ top: Math.min(savedPos, maxPossible), behavior: "instant" });
          }
        }
      }, 35);

      prevPathnameRef.current = pathname;
      return () => clearInterval(timer);
    } else {
      // Forward navigation to a new page: natural scroll to top
      window.scrollTo({ top: 0, behavior: "instant" });
      prevPathnameRef.current = pathname;
    }
  }, [pathname]);

  return null;
}
