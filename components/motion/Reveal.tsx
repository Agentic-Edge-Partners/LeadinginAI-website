"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { DURATION, EASE, REVEAL_DISTANCE } from "@/lib/motion";

type Props = HTMLMotionProps<"div"> & {
  /** Delay in seconds. */
  delay?: number;
  /** Use "none" to skip the translate and only fade. */
  distance?: number | "none";
  as?: "div" | "section" | "article" | "header" | "aside";
};

/**
 * Scroll reveal: opacity 0→1, translate-y 24px→0, at 15% viewport entry, once.
 * docs/BRAND.md §4 move 5. Wrap a block; do not wrap running text.
 */
export function Reveal({
  delay = 0,
  distance = REVEAL_DISTANCE,
  as = "div",
  children,
  ...rest
}: Props) {
  const Tag = motion[as] as typeof motion.div;
  const y = distance === "none" ? 0 : distance;
  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: DURATION.entrance, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
