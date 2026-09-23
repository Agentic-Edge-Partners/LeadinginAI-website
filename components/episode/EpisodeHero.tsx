"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { EpisodeCardData } from "@/lib/cards";
import { episodeLabel, formatDate, formatDuration } from "@/lib/format";
import { PlayerEmbed } from "./PlayerEmbed";
import { Tag } from "@/components/ui/Tag";
import { Container } from "@/components/layout/Container";

/**
 * Episode page hero. The player poster shares `layoutId` with the card art so
 * the card expands into the hero on navigation (docs/BRAND.md §4 move 3).
 */
export function EpisodeHero({
  episode: e,
  children,
}: {
  episode: EpisodeCardData;
  children?: React.ReactNode;
}) {
  const duration = formatDuration(e.durationSeconds);
  return (
    <header className="relative overflow-hidden pt-10 pb-12 md:pt-16 md:pb-16">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[60vh] bg-[radial-gradient(60%_60%_at_50%_0%,rgb(13_156_172/0.25),transparent_70%)]"
        aria-hidden="true"
      />
      <Container>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 meta text-ink-dim">
          <span className="text-cyan">{episodeLabel(e.number)}</span>
          <span aria-hidden="true">·</span>
          <span>{formatDate(e.publishedAt)}</span>
          {duration && (
            <>
              <span aria-hidden="true">·</span>
              <span>{duration}</span>
            </>
          )}
        </p>
        <h1 className="mt-4 max-w-4xl display-l text-ink">{e.title}</h1>
        {e.guests.length > 0 && (
          <p className="mt-5 text-lg text-ink-muted">
            with{" "}
            {e.guests.map((g, i) => (
              <span key={g.slug}>
                <Link
                  href={`/guests/${g.slug}`}
                  className="font-semibold text-ink underline decoration-teal/60 underline-offset-4 transition-colors hover:text-cyan hover:decoration-cyan"
                >
                  {g.name}
                </Link>
                {[g.role, g.company].filter(Boolean).length > 0 && (
                  <span className="text-ink-dim">
                    , {[g.role, g.company].filter(Boolean).join(" at ")}
                  </span>
                )}
                {i < e.guests.length - 1 ? " and " : ""}
              </span>
            ))}
          </p>
        )}
        {e.topics.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {e.topics.map((t) => (
              <Tag key={t.slug} href={`/topics/${t.slug}`}>
                {t.name}
              </Tag>
            ))}
          </div>
        )}

        <motion.div
          layoutId={`episode-art-${e.slug}`}
          className="mt-10 overflow-hidden rounded-card"
        >
          <PlayerEmbed
            youtubeId={e.youtubeId}
            title={`${episodeLabel(e.number)} — ${e.title}`}
            poster={e.thumbnailUrl}
            durationSeconds={e.durationSeconds}
          />
        </motion.div>
        {children}
      </Container>
    </header>
  );
}
