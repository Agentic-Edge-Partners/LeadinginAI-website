"use client";

import { MotionConfig } from "motion/react";
import { DURATION, EASE } from "@/lib/motion";

/**
 * One place for the house easing and the reduced-motion policy.
 * `reducedMotion="user"` disables transform/layout animations for people who
 * asked for less motion, while keeping opacity fades.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: DURATION.standard, ease: EASE }}>
      {children}
    </MotionConfig>
  );
}
