"use client";

import { useEffect } from "react";

let lockCount = 0;
let prevBodyOverflow = "";
let prevHtmlOverflow = "";
let prevBodyOverscroll = "";
let prevBodyTouchAction = "";

/**
 * Universal Scroll Lock Hook
 * Prevents background body and html scrolling on mobile, tablet, and desktop
 * when a modal, drawer, or sidebar is active.
 * Handles nested or sequential drawers via lock reference counting.
 */
export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked || typeof window === "undefined") return;

    if (lockCount === 0) {
      prevBodyOverflow = document.body.style.overflow;
      prevHtmlOverflow = document.documentElement.style.overflow;
      prevBodyOverscroll = document.body.style.overscrollBehavior;
      prevBodyTouchAction = document.body.style.touchAction;

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "none";
    }
    lockCount++;

    return () => {
      lockCount--;
      if (lockCount <= 0) {
        lockCount = 0;
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
        document.body.style.overscrollBehavior = prevBodyOverscroll;
        document.body.style.touchAction = prevBodyTouchAction;
      }
    };
  }, [locked]);
}

export default useScrollLock;

