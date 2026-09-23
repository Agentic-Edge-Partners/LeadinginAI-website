"use client";

import { usePlayerOptional } from "./PlayerProvider";
import { formatTimestamp } from "@/lib/format";
import { cx } from "@/lib/cx";

/** A timestamp rendered as a real <button> that seeks the page's player. */
export function SeekButton({
  seconds,
  className,
  children,
}: {
  seconds: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const player = usePlayerOptional();
  return (
    <button
      type="button"
      onClick={() => player?.seek(seconds)}
      className={cx("rounded-sm meta text-cyan transition-colors hover:text-ink", className)}
      aria-label={`Play from ${formatTimestamp(seconds)}`}
    >
      {children ?? formatTimestamp(seconds)}
    </button>
  );
}
