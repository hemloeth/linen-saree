"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * useVideoCoordinator
 *
 * Centralized coordination of video playback across multiple video cards:
 * - Desktop (>= 1024px): Up to 4 videos autoplay simultaneously when eligible and visible
 * - Mobile (< 1024px): Up to 2 videos autoplay simultaneously when eligible and visible
 * - Centralized IntersectionObserver: single observer for all cards with hysteresis
 * - Automatic pause on tab hidden (document.visibilityState === 'hidden')
 * - Respects prefers-reduced-motion and navigator.connection.saveData
 * - Fair rotation scheduling on mobile when more than 2 videos are eligible
 * - Eliminates play/pause thrashing during minor scroll movements
 */
export function useVideoCoordinator() {
  const cardsRef = useRef(new Map()); // id -> { element, video, ratio, isIntersecting, manualPause, isPlaying }
  const [playingIds, setPlayingIds] = useState(() => new Set());
  const rotationTimerRef = useRef(null);
  const rotationIndexRef = useRef(0);
  const observerRef = useRef(null);

  const updatePlayback = useCallback(() => {
    if (typeof window === "undefined") return;

    // 1. If tab is hidden, pause all
    if (document.visibilityState === "hidden") {
      setPlayingIds(new Set());
      cardsRef.current.forEach(({ video }) => {
        if (video && !video.paused) {
          video.pause();
        }
      });
      return;
    }

    // 2. If user prefers reduced motion or data saving, do not autoplay
    const prefersReducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = Boolean(navigator?.connection?.saveData);
    if (prefersReducedMotion || saveData) {
      setPlayingIds(new Set());
      cardsRef.current.forEach(({ video }) => {
        if (video && !video.paused) {
          video.pause();
        }
      });
      return;
    }

    const isDesktop = window.innerWidth >= 1024;
    const budget = isDesktop ? 4 : 2;

    // Collect eligible cards (visible and not manually paused)
    const eligible = [];
    cardsRef.current.forEach((data, id) => {
      if (data.manualPause) return;
      // Hysteresis: enter when visible (ratio >= 0.30), stay if previously playing (ratio >= 0.15)
      const threshold = data.isPlaying ? 0.15 : 0.30;
      if (data.ratio >= threshold) {
        eligible.push({ id, ...data });
      }
    });

    let selectedIds = [];
    if (eligible.length <= budget) {
      // All eligible play (e.g. all 4 desktop videos in row)
      selectedIds = eligible.map((e) => e.id);
    } else {
      // More visible than budget (e.g. on mobile/tablet)
      eligible.sort((a, b) => b.ratio - a.ratio);
      const offset = rotationIndexRef.current % eligible.length;
      const rotated = [...eligible.slice(offset), ...eligible.slice(0, offset)];
      selectedIds = rotated.slice(0, budget).map((e) => e.id);
    }

    const nextPlayingSet = new Set(selectedIds);

    // Apply playback directly to video elements to minimize React re-render lag
    cardsRef.current.forEach((data, id) => {
      const shouldPlay = nextPlayingSet.has(id);
      data.isPlaying = shouldPlay;
      if (data.video) {
        if (shouldPlay) {
          data.video.muted = true;
          const playPromise = data.video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {});
          }
        } else {
          if (!data.video.paused) {
            data.video.pause();
          }
        }
      }
    });

    setPlayingIds(nextPlayingSet);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.dataset.videoId;
          if (id && cardsRef.current.has(id)) {
            const data = cardsRef.current.get(id);
            data.ratio = entry.intersectionRatio;
            data.isIntersecting = entry.isIntersecting;
          }
        });
        updatePlayback();
      },
      {
        threshold: [0, 0.15, 0.3, 0.5, 0.7, 0.85, 1.0],
        rootMargin: "-20px 0px -20px 0px",
      }
    );

    // Re-observe any already registered elements
    cardsRef.current.forEach(({ element }) => {
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    const handleVisibilityChange = () => {
      updatePlayback();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handleResize = () => {
      updatePlayback();
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Fair rotation timer for mobile when > 2 eligible
    rotationTimerRef.current = setInterval(() => {
      const isDesktop = window.innerWidth >= 1024;
      if (!isDesktop) {
        rotationIndexRef.current = (rotationIndexRef.current + 1) % 100;
        updatePlayback();
      }
    }, 7000);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);
      if (rotationTimerRef.current) clearInterval(rotationTimerRef.current);
    };
  }, [updatePlayback]);

  const registerCard = useCallback((id, element, video) => {
    if (!id || !element) return;
    const sid = String(id);
    element.dataset.videoId = sid;
    const existing = cardsRef.current.get(sid) || {};
    cardsRef.current.set(sid, {
      ...existing,
      element,
      video,
      ratio: existing.ratio || 0,
      isIntersecting: existing.isIntersecting || false,
      manualPause: existing.manualPause || false,
      isPlaying: existing.isPlaying || false,
    });

    if (observerRef.current && element) {
      observerRef.current.observe(element);
    }
  }, []);

  const unregisterCard = useCallback((id) => {
    const sid = String(id);
    const data = cardsRef.current.get(sid);
    if (data?.element && observerRef.current) {
      observerRef.current.unobserve(data.element);
    }
    cardsRef.current.delete(sid);
  }, []);

  const togglePlay = useCallback(
    (id) => {
      const sid = String(id);
      const data = cardsRef.current.get(sid);
      if (!data) return;

      data.manualPause = !data.manualPause;
      if (data.manualPause) {
        data.isPlaying = false;
        if (data.video) data.video.pause();
        setPlayingIds((prev) => {
          const next = new Set(prev);
          next.delete(sid);
          return next;
        });
      } else {
        updatePlayback();
      }
    },
    [updatePlayback]
  );

  return {
    registerCard,
    unregisterCard,
    togglePlay,
    playingIds,
  };
}
