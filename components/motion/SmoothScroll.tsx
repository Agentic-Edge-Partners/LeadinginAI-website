"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "motion/react";

/**
 * Lenis smooth scrolling. Smooths the wheel only — touch stays native, and it
 * is skipped entirely under prefers-reduced-motion. Never takes over scroll.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.12, wheelMultiplier: 1 });
    return () => lenis.destroy();
  }, [reduced]);
  return null;
}
