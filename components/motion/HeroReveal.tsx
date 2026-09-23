"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";

const KEY = "lia:hero-revealed";
const noopSubscribe = () => () => {};

/**
 * Hero wordmark reveal: each line clip-reveals upward from a mask, staggered
 * 80ms; `sub` fades in at +400ms. Runs once per session (docs/BRAND.md §4 move 1).
 */
export function HeroReveal({
  lines,
  sub,
  className,
  lineClassName,
}: {
  lines: React.ReactNode[];
  sub?: React.ReactNode;
  className?: string;
  lineClassName?: string;
}) {
  const reduced = useReducedMotion();
  // Server: render revealed. Client: read the session flag once, before paint.
  const seenRef = useRef<boolean | null>(null);
  const seen = useSyncExternalStore(
    noopSubscribe,
    () => {
      if (seenRef.current === null) {
        try {
          seenRef.current = sessionStorage.getItem(KEY) === "1";
        } catch {
          seenRef.current = true;
        }
      }
      return seenRef.current;
    },
    () => true,
  );
  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
  }, []);

  const animate = !seen && !reduced;
  return (
    <div className={className}>
      <h1 className="display-xl text-ink">
        {lines.map((line, i) => (
          <span key={i} className="block overflow-hidden pb-[0.08em]">
            <motion.span
              className={lineClassName ?? "block"}
              initial={false}
              animate={animate ? { y: ["100%", "0%"] } : { y: "0%" }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.08 * i }}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </h1>
      {sub && (
        <motion.div
          initial={false}
          animate={animate ? { opacity: [0, 1], y: [12, 0] } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
        >
          {sub}
        </motion.div>
      )}
    </div>
  );
}
