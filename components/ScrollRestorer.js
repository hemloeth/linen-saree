"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const SCROLL_STORAGE_KEY_PREFIX = "hoq_scroll_pos_";
const CLICKED_ID_KEY = "hoq_last_clicked_product_id";

/**
 * Global Scroll Restoration Coordinator
 * 
 * 1. Automatically restores native scroll position on browser back/forward (PopState).
 * 2. Saves scroll position before unmount/route changes.
 * 3. If returning from a product details page, smoothly scrolls exactly to the clicked product card.
 */
export default function ScrollRestorer() {
  const pathname = usePathname();
  const isPopStateRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Tell the browser we want manual control so it doesn't jump to (0,0) before our state mounts
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    function onPopState() {
      isPopStateRef.current = true;
    }

    function onBeforeUnload() {
      sessionStorage.setItem(`${SCROLL_STORAGE_KEY_PREFIX}${window.location.pathname}`, String(window.scrollY));
    }

    window.addEventListener("popstate", onPopState);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedPos = sessionStorage.getItem(`${SCROLL_STORAGE_KEY_PREFIX}${pathname}`);
    const lastClickedId = sessionStorage.getItem(CLICKED_ID_KEY);

    // If navigated back via browser back or Link back
    if (isPopStateRef.current || (!pathname.startsWith("/product/") && lastClickedId)) {
      isPopStateRef.current = false;

      // Strategy A: If coming back from product details, find that product element by id
      if (lastClickedId && !pathname.startsWith("/product/")) {
        let attempts = 0;
        const maxAttempts = 15;

        const interval = setInterval(() => {
          attempts++;
          const targetCard = document.getElementById(`product-card-${lastClickedId}`);
          if (targetCard) {
            clearInterval(interval);
            sessionStorage.removeItem(CLICKED_ID_KEY);
            targetCard.scrollIntoView({ behavior: "instant", block: "center" });
            return;
          }

          // Fallback to saved pixel scroll position if card element takes too long
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            sessionStorage.removeItem(CLICKED_ID_KEY);
            if (savedPos !== null) {
              window.scrollTo({ top: Number(savedPos), behavior: "instant" });
            }
          }
        }, 60);

        return () => clearInterval(interval);
      }

      // Strategy B: General back navigation to saved coordinate
      if (savedPos !== null) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: Number(savedPos), behavior: "instant" });
        });
      }
    }

    // Save scroll position periodically and on leave
    function saveCurrentScroll() {
      sessionStorage.setItem(`${SCROLL_STORAGE_KEY_PREFIX}${pathname}`, String(window.scrollY));
    }

    window.addEventListener("scroll", saveCurrentScroll, { passive: true });
    return () => {
      saveCurrentScroll();
      window.removeEventListener("scroll", saveCurrentScroll);
    };
  }, [pathname]);

  return null;
}
