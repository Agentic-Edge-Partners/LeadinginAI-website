"use client";

import type { Chapter } from "@/lib/schemas";
import { formatTimestamp } from "@/lib/format";
import { usePlayerOptional } from "./PlayerProvider";
import { ChapterScrubber } from "./ChapterScrubber";
import { cx } from "@/lib/cx";

/** Chapter list with timestamp deep-links into the player, plus the scrubber. */
export function ChapterList({
  chapters,
  durationSeconds,
}: {
  chapters: Chapter[];
  durationSeconds: number | null;
}) {
  const player = usePlayerOptional();
  if (chapters.length === 0) return null;
  const position = player?.position ?? 0;
  const activeIndex = chapters.reduce((acc, c, i) => (position >= c.start ? i : acc), -1);

  return (
    <div>
      <ChapterScrubber chapters={chapters} durationSeconds={durationSeconds} />
      <ol className="mt-6 divide-y divide-line">
        {chapters.map((c, i) => (
          <li key={`${c.start}-${i}`}>
            <button
              type="button"
              onClick={() => player?.seek(c.start)}
              className={cx(
                "group flex w-full items-baseline gap-4 py-3 text-left transition-colors hover:text-cyan",
                i === activeIndex ? "text-cyan" : "text-ink",
              )}
              aria-current={i === activeIndex ? "true" : undefined}
            >
              <span className="w-14 shrink-0 meta text-ink-dim group-hover:text-cyan">
                {formatTimestamp(c.start)}
              </span>
              <span className="font-medium">{c.title}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
