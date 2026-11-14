"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const SCROLL_STORAGE_KEY_PREFIX = "hoq_scroll_pos_";
const TARGET_ID_KEY = "hoq_last_clicked_target_id";
const LEGACY_PRODUCT_ID_KEY = "hoq_last_clicked_product_id";

/**
 * Standard Production-Grade Scroll Restoration Coordinator
 * 
 * 1. Manages window.history.scrollRestoration = 'manual' to prevent jarring browser jumps to (0,0).
 * 2. Tracks and restores exact scroll position & clicked card anchors across navigation (back/forward).
 * 3. Handles async Next.js client component hydration gracefully via layout & height polling.
 * 4. Supports collection cards, category cards, and product cards uniformly.
 */
export default function ScrollRestorer() {
  const pathname = usePathname();
  const isPopStateRef = useRef(false);
  const prevPathnameRef = useRef(pathname);

  // 1. One-time setup: enable manual scroll restoration and hook popstate + beforeunload
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    function onPopState() {
      isPopStateRef.current = true;
    }

    function onBeforeUnload() {
      try {
        sessionStorage.setItem(`${SCROLL_STORAGE_KEY_PREFIX}${window.location.pathname}`, String(window.scrollY));
      } catch {
        /* ignore */
      }
    }

    window.addEventListener("popstate", onPopState);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  // 2. Continuous passive scroll tracker for active route (throttled via requestAnimationFrame)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let ticking = false;

    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          try {
            sessionStorage.setItem(`${SCROLL_STORAGE_KEY_PREFIX}${pathname}`, String(window.scrollY));
          } catch {
            /* ignore */
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      // Save exact final position on route unmount/change
      try {
        sessionStorage.setItem(`${SCROLL_STORAGE_KEY_PREFIX}${pathname}`, String(window.scrollY));
      } catch {
        /* ignore */
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  // 3. Restoration Engine on Route Transition / Back Navigation (Pre-Paint Execution)
  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const isBackNavigation = isPopStateRef.current;
    isPopStateRef.current = false;

    const savedPosRaw = sessionStorage.getItem(`${SCROLL_STORAGE_KEY_PREFIX}${pathname}`);
    const savedTargetId = sessionStorage.getItem(TARGET_ID_KEY);
    const legacyProductId = sessionStorage.getItem(LEGACY_PRODUCT_ID_KEY);

    const targetElementId = savedTargetId || (legacyProductId ? `product-card-${legacyProductId}` : null);
    const savedPos = savedPosRaw !== null ? Number(savedPosRaw) : null;

    // Check if user returned to a parent/previous page
    const isReturningToParent =
      Boolean(targetElementId) &&
      !pathname.startsWith("/product/") &&
      !pathname.startsWith("/collections/") &&
      !pathname.startsWith("/categories/");

    if (isBackNavigation || isReturningToParent) {
      // Step 0: Synchronous instant pre-paint jump (eliminates Hero section blink completely!)
      if (savedPos !== null && !isNaN(savedPos) && savedPos > 0) {
        window.scrollTo({ top: savedPos, behavior: "instant" });
      }

      // If target anchor is already in DOM, center it before browser paints frame 0
      if (targetElementId) {
        const immediateEl = document.getElementById(targetElementId);
        if (immediateEl && (immediateEl.getBoundingClientRect().height > 0 || immediateEl.offsetParent !== null)) {
          immediateEl.scrollIntoView({ behavior: "instant", block: "center" });
        }
      }

      let attempts = 0;
      const maxAttempts = 75; // 75 * 40ms = 3000ms max polling for lazy/hydrating components

      const timer = setInterval(() => {
        attempts++;

        // Strategy A: Targeted anchor element restoration (CollectionCard, CategoryCard, ProductCard, VideoCard)
        if (targetElementId) {
          const targetEl = document.getElementById(targetElementId);
          if (targetEl) {
            const rect = targetEl.getBoundingClientRect();
            if (rect.height > 0 || targetEl.offsetParent !== null) {
              clearInterval(timer);
              sessionStorage.removeItem(TARGET_ID_KEY);
              sessionStorage.removeItem(LEGACY_PRODUCT_ID_KEY);
              targetEl.scrollIntoView({ behavior: "instant", block: "center" });
              return;
            }
          }
        }

        // Strategy B: Height-aware pixel scroll restoration
        if (savedPos !== null && !isNaN(savedPos) && savedPos > 0) {
          const currentScrollHeight = document.documentElement.scrollHeight;
          const maxPossible = Math.max(0, currentScrollHeight - window.innerHeight);
          const desired = Math.min(savedPos, maxPossible);

          window.scrollTo({ top: desired, behavior: "instant" });

          // If reached target position within tolerance, or document is tall enough to hold target:
          if (Math.abs(window.scrollY - savedPos) <= 12 || (currentScrollHeight >= savedPos + window.innerHeight && attempts > 5)) {
            clearInterval(timer);
            sessionStorage.removeItem(TARGET_ID_KEY);
            sessionStorage.removeItem(LEGACY_PRODUCT_ID_KEY);
            return;
          }
        }

        // Strategy C: Timeout fallback
        if (attempts >= maxAttempts) {
          clearInterval(timer);
          sessionStorage.removeItem(TARGET_ID_KEY);
          sessionStorage.removeItem(LEGACY_PRODUCT_ID_KEY);
          if (savedPos !== null && !isNaN(savedPos) && savedPos > 0) {
            const maxPossible = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            window.scrollTo({ top: Math.min(savedPos, maxPossible), behavior: "instant" });
          }
        }
      }, 40);

      prevPathnameRef.current = pathname;
      return () => clearInterval(timer);
    } else {
      // Fresh navigation forward: scroll to top naturally
      window.scrollTo({ top: 0, behavior: "instant" });
      prevPathnameRef.current = pathname;
    }
  }, [pathname]);

  return null;
}
