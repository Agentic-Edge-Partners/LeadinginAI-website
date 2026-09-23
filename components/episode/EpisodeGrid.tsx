"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { EpisodeCardData } from "@/lib/cards";
import { EpisodeCard } from "./EpisodeCard";
import { Button } from "@/components/ui/Button";
import { EASE } from "@/lib/motion";

const PAGE = 12;

/**
 * Reflowing card grid. Cards reposition with `layout` animation when the list
 * changes rather than snapping (docs/BRAND.md §4 move 7). "Load more", never
 * numbered pages.
 */
export function EpisodeGrid({
  episodes,
  pageSize = PAGE,
  columns = 3,
}: {
  episodes: EpisodeCardData[];
  pageSize?: number;
  columns?: 2 | 3;
}) {
  const [limit, setLimit] = useState(pageSize);
  const visible = episodes.slice(0, limit);
  const more = episodes.length - visible.length;

  return (
    <div>
      <motion.ul
        layout
        className={
          columns === 3
            ? "grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
            : "grid gap-x-6 gap-y-12 sm:grid-cols-2"
        }
      >
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((e, i) => (
            <motion.li
              key={e.slug}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <EpisodeCard episode={e} priority={i < 3} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
      {more > 0 && (
        <div className="mt-14 flex justify-center">
          <Button variant="secondary" size="lg" onClick={() => setLimit((l) => l + pageSize)}>
            Load more
            <span className="meta text-ink-dim">+{Math.min(more, pageSize)}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
