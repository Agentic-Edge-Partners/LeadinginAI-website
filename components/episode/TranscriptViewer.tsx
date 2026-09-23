"use client";

import { useState } from "react";
import type { TranscriptParagraph } from "@/lib/transcript";
import { SeekButton } from "./SeekButton";
import { Button } from "@/components/ui/Button";
import { cx } from "@/lib/cx";

/**
 * Full transcript, server-rendered as real HTML for search engines, shown
 * collapsed with a "Read full transcript" control. Every timestamp is a
 * <button> that seeks the player. Paragraphs carry ids for deep links (#t-754).
 */
export function TranscriptViewer({
  paragraphs,
  source,
  words,
}: {
  paragraphs: TranscriptParagraph[];
  source: string;
  words: number;
}) {
  const [expanded, setExpanded] = useState(false);
  if (paragraphs.length === 0) return null;
  const readMinutes = Math.max(1, Math.round(words / 200));
  const sourceLabel =
    source === "youtube-auto"
      ? "Auto-generated captions; may contain errors."
      : source === "srt-upload"
        ? "From uploaded captions."
        : "";

  return (
    <div>
      <p className="meta text-ink-dim">
        {words.toLocaleString("en-GB")} words · ~{readMinutes} min read
        {sourceLabel && <span className="ml-3 tracking-normal normal-case">{sourceLabel}</span>}
      </p>
      <div className={cx("relative mt-6", !expanded && "max-h-[28rem] overflow-hidden")}>
        <div className="flex flex-col gap-6">
          {paragraphs.map((p) => (
            <p
              key={p.start}
              id={`t-${Math.floor(p.start)}`}
              className="text-ink-muted [&>button]:mr-3 [&>button]:align-baseline"
            >
              <SeekButton seconds={p.start} />
              {p.text}
            </p>
          ))}
        </div>
        {!expanded && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ground to-transparent"
            aria-hidden="true"
          />
        )}
      </div>
      <div className="mt-6">
        <Button variant="secondary" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
          {expanded ? "Collapse transcript" : `Read full transcript`}
        </Button>
      </div>
    </div>
  );
}
