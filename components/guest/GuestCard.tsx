"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { GuestCardData } from "@/lib/cards";
import { GuestAvatar } from "./GuestAvatar";
import { EASE } from "@/lib/motion";

export function GuestCard({ guest: g, priority }: { guest: GuestCardData; priority?: boolean }) {
  const line = [g.role, g.company].filter(Boolean).join(", ");
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="group"
    >
      <Link href={`/guests/${g.slug}`} className="block rounded-card outline-offset-4">
        <GuestAvatar
          name={g.name}
          headshot={g.headshot}
          sizes="(min-width: 1024px) 300px, (min-width: 640px) 33vw, 50vw"
          priority={priority}
          className="[container-type:inline-size]"
        />
        <div className="mt-4">
          <h3 className="heading text-ink transition-colors group-hover:text-cyan">{g.name}</h3>
          {line && <p className="mt-1 text-sm text-ink-muted">{line}</p>}
          <p className="mt-2 meta text-ink-dim">
            {g.industry}
            {g.episodeCount > 1 && (
              <span className="ml-2 text-cyan">{g.episodeCount} episodes</span>
            )}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
