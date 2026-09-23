"use client";

import { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { Chapter } from "@/lib/schemas";
import { formatTimestamp } from "@/lib/format";
import { usePlayerOptional } from "./PlayerProvider";
import { SPRING_PLAYHEAD } from "@/lib/motion";

/**
 * Chapter scrubber (docs/BRAND.md §4 move 6): a timeline with chapter markers.
 * Hover/focus shows the chapter title, click deep-links into the player. The
 * playhead follows the live player position on a spring.
 */
export function ChapterScrubber({
  chapters,
  durationSeconds,
}: {
  chapters: Chapter[];
  durationSeconds: number | null;
}) {
  const player = usePlayerOptional();
  const [hover, setHover] = useState<number | null>(null);
  // Without a known duration, extend the timeline a little beyond the last chapter.
  const last = chapters[chapters.length - 1]?.start ?? 0;
  const total = durationSeconds ?? Math.max(last * 1.15, last + 300);
  const pct = (s: number) => Math.min(100, Math.max(0, (s / total) * 100));
  const fallback = useMotionValue(0);
  const spring = useSpring(player?.currentTime ?? fallback, SPRING_PLAYHEAD);
  const left = useTransform(spring, (v) => `${pct(v)}%`);

  if (chapters.length === 0 || total <= 0) return null;

  return (
    <div className="relative pt-8 pb-2">
      <div
        className="relative h-1.5 rounded-full bg-line"
        role="group"
        aria-label="Chapter timeline"
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-cyan/40"
          style={{ width: left }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan shadow-[0_0_0_4px_rgb(0_217_224/0.2)]"
          style={{ left }}
          aria-hidden="true"
        />
        {chapters.map((c, i) => (
          <button
            key={`${c.start}-${i}`}
            type="button"
            onClick={() => player?.seek(c.start)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            className="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2 p-2"
            style={{ left: `${pct(c.start)}%` }}
            aria-label={`${c.title}, ${formatTimestamp(c.start)}`}
          >
            <span className="block size-2 rounded-full bg-ink-dim ring-2 ring-ground transition-colors group-hover:bg-cyan group-focus-visible:bg-cyan" />
            <span
              role="tooltip"
              className={`pointer-events-none absolute bottom-full left-1/2 mb-1 w-max max-w-56 -translate-x-1/2 rounded-btn border border-line bg-surface px-2 py-1 text-left text-xs text-ink transition-opacity ${hover === i ? "opacity-100" : "opacity-0"}`}
            >
              <span className="mr-1.5 meta text-cyan">{formatTimestamp(c.start)}</span>
              {c.title}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-between">
        <span className="meta text-ink-dim">0:00</span>
        <span className="meta text-ink-dim">
          {durationSeconds ? formatTimestamp(durationSeconds) : "—"}
        </span>
      </div>
    </div>
  );
}
