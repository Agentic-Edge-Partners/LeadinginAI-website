"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { GuestCardData } from "@/lib/cards";
import { GuestCard } from "./GuestCard";
import { EmptyState } from "@/components/discovery/EmptyState";
import { EASE } from "@/lib/motion";
import { cx } from "@/lib/cx";

/** Guest directory with an industry filter and animated reflow. */
export function GuestGrid({
  guests,
  industries,
}: {
  guests: GuestCardData[];
  industries: string[];
}) {
  const [industry, setIndustry] = useState<string | null>(null);
  const visible = useMemo(
    () => (industry ? guests.filter((g) => g.industry === industry) : guests),
    [guests, industry],
  );

  return (
    <div>
      <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filter by industry">
        <FilterPill active={industry === null} onClick={() => setIndustry(null)}>
          All
        </FilterPill>
        {industries.map((ind) => (
          <FilterPill
            key={ind}
            active={industry === ind}
            onClick={() => setIndustry(ind === industry ? null : ind)}
          >
            {ind}
          </FilterPill>
        ))}
      </div>
      {visible.length === 0 ? (
        <EmptyState
          title="No guests in that industry yet"
          action={{ label: "Show everyone", onClick: () => setIndustry(null) }}
        />
      ) : (
        <motion.ul
          layout
          className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((g, i) => (
              <motion.li
                key={g.slug}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <GuestCard guest={g} priority={i < 4} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors",
        active
          ? "border-cyan bg-cyan text-ground"
          : "border-line-bright text-ink-muted hover:border-ink-dim hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
