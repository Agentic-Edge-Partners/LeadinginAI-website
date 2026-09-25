"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { useHeroPointer } from "./HeroInteractive";
import { cx } from "@/lib/cx";

const REST = 112; // font-stretch % at rest (matches .display-xl)
const MAX = 125; // Archivo's width axis tops out at 125
const RADIUS = 240; // px of cursor influence
const LIFT = 7; // px the nearest letters rise

/**
 * Headline letters that widen and lift as the cursor passes over them, using
 * Archivo's variable width axis. Reads as one string to assistive tech.
 * Static under reduced-motion and on touch devices.
 */
export function KineticText({
  text,
  className,
  letterClassName,
}: {
  text: string;
  className?: string;
  /** Applied to every letter. Put gradient/colour classes here, not on `className`: each
   *  letter is its own stacking context, so a parent `background-clip: text` would not reach it. */
  letterClassName?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const pointer = useHeroPointer();
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = ref.current;
    if (!root || !pointer || reduced) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const letters = Array.from(root.querySelectorAll<HTMLSpanElement>("[data-letter]"));
    const update = () => {
      for (const el of letters) {
        let k = 0;
        if (pointer.active) {
          const r = el.getBoundingClientRect();
          const dx = pointer.clientX - (r.left + r.width / 2);
          const dy = pointer.clientY - (r.top + r.height / 2);
          const d = Math.hypot(dx, dy);
          k = d < RADIUS ? Math.pow(1 - d / RADIUS, 1.6) : 0;
        }
        el.style.fontStretch = `${REST + (MAX - REST) * k}%`;
        el.style.transform = k > 0 ? `translateY(${-LIFT * k}px)` : "";
      }
    };
    return pointer.subscribe(update);
  }, [pointer, reduced]);

  return (
    <span ref={ref} className={cx("inline-block", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {Array.from(text).map((ch, i) => (
          <span
            key={i}
            data-letter={ch === " " ? undefined : ""}
            className={cx(
              "inline-block transition-[font-stretch,transform] duration-300 ease-house will-change-transform",
              letterClassName,
            )}
            style={ch === " " ? { whiteSpace: "pre" } : undefined}
          >
            {ch}
          </span>
        ))}
      </span>
    </span>
  );
}
