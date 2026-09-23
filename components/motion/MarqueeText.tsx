"use client";

import { useReducedMotion } from "motion/react";
import { cx } from "@/lib/cx";

/**
 * A slow, continuous marquee. Under reduced motion it renders one static row.
 * Items are separated by a gradient dot.
 */
export function MarqueeText({
  items,
  className,
  speed = 40,
}: {
  items: string[];
  className?: string;
  speed?: number;
}) {
  const reduced = useReducedMotion();
  const row = (ariaHidden: boolean) => (
    <ul className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={ariaHidden}>
      {items.map((it, i) => (
        <li key={`${it}-${i}`} className="flex items-center gap-8 whitespace-nowrap">
          <span>{it}</span>
          <span className="size-1.5 rounded-full bg-cyan" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
  if (reduced) {
    return (
      <div className={cx("overflow-hidden", className)}>
        <ul className="flex flex-wrap items-center gap-x-8 gap-y-2">
          {items.map((it, i) => (
            <li key={`${it}-${i}`}>{it}</li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div
      className={cx(
        "overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]",
        className,
      )}
    >
      <div
        className="flex w-max motion-safe:animate-[marquee_var(--marquee-duration)_linear_infinite]"
        style={{ ["--marquee-duration" as string]: `${speed}s` }}
      >
        {row(false)}
        {row(true)}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}
