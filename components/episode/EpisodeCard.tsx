"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import type { EpisodeCardData } from "@/lib/cards";
import { episodeLabel, formatDate, formatDuration, joinNames } from "@/lib/format";
import { cx } from "@/lib/cx";
import { EASE } from "@/lib/motion";
import { Tag } from "@/components/ui/Tag";

type Props = {
  episode: EpisodeCardData;
  variant?: "default" | "featured" | "rail" | "compact";
  priority?: boolean;
  className?: string;
  /** Disable the shared-layout morph (e.g. inside lists that never navigate to the hero). */
  morph?: boolean;
};

/**
 * The episode card. Its artwork carries a `layoutId` shared with EpisodeHero
 * so clicking it morphs into the episode page (docs/BRAND.md §4 move 3).
 */
export function EpisodeCard({
  episode: e,
  variant = "default",
  priority,
  className,
  morph = true,
}: Props) {
  const guests = joinNames(e.guests.map((g) => g.name));
  const guestLine =
    e.guests.length === 1
      ? [e.guests[0].role, e.guests[0].company].filter(Boolean).join(", ")
      : null;
  const duration = formatDuration(e.durationSeconds);
  const featured = variant === "featured";
  const rail = variant === "rail";
  const compact = variant === "compact";

  if (featured) {
    return (
      <motion.article
        className={cx("group grid gap-6 lg:grid-cols-12 lg:items-center lg:gap-12", className)}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <Link
          href={`/episodes/${e.slug}`}
          className="block rounded-card outline-offset-4 lg:col-span-7"
          aria-label={`${episodeLabel(e.number)}: ${e.title}`}
        >
          <motion.div
            layoutId={morph ? `episode-art-${e.slug}` : undefined}
            className="relative aspect-video overflow-hidden rounded-img bg-surface-2"
          >
            <Image
              src={e.thumbnailUrl}
              alt=""
              fill
              priority={priority}
              sizes="(min-width: 1024px) 720px, 100vw"
              className="object-cover transition-transform duration-700 ease-house group-hover:scale-[1.04]"
            />
            <span
              className="absolute inset-0 bg-gradient-to-t from-ground/60 via-transparent to-transparent opacity-80"
              aria-hidden="true"
            />
            <span className="absolute top-3 left-3 rounded-sm bg-ground/80 px-1.5 py-0.5 meta text-ink backdrop-blur">
              {episodeLabel(e.number)}
            </span>
            {duration && (
              <span className="absolute right-3 bottom-3 rounded-sm bg-ground/80 px-1.5 py-0.5 meta text-ink backdrop-blur">
                {duration}
              </span>
            )}
          </motion.div>
        </Link>
        <div className="lg:col-span-5">
          <p className="meta text-ink-dim">
            {formatDate(e.publishedAt)}
            {guests && (
              <>
                <span className="mx-2 text-line-bright" aria-hidden="true">
                  /
                </span>
                <span className="tracking-normal text-ink-muted normal-case">{guests}</span>
              </>
            )}
          </p>
          <h3 className="mt-3 display-m text-ink">
            <Link
              href={`/episodes/${e.slug}`}
              className="transition-colors group-hover:text-cyan hover:text-cyan"
            >
              {e.title}
            </Link>
          </h3>
          {guestLine && <p className="mt-2 text-sm text-ink-muted">{guestLine}</p>}
          {e.hook && <p className="mt-5 max-w-xl text-lg text-ink-muted">{e.hook}</p>}
          {e.topics.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {e.topics.map((t) => (
                <Tag key={t.slug} href={`/topics/${t.slug}`}>
                  {t.name}
                </Tag>
              ))}
            </div>
          )}
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      className={cx("group relative", className)}
      whileHover={rail ? { y: -6, scale: 1.03 } : { y: -4 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <Link href={`/episodes/${e.slug}`} className="block rounded-card outline-offset-4">
        <motion.div
          layoutId={morph ? `episode-art-${e.slug}` : undefined}
          className={cx(
            "relative overflow-hidden rounded-img bg-surface-2",
            compact ? "aspect-video" : "aspect-video",
          )}
        >
          <Image
            src={e.thumbnailUrl}
            alt=""
            fill
            priority={priority}
            sizes={
              rail
                ? "(min-width: 640px) 420px, 80vw"
                : "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            }
            className="object-cover transition-transform duration-700 ease-house group-hover:scale-[1.04]"
          />
          <span
            className="absolute inset-0 bg-gradient-to-t from-ground/60 via-transparent to-transparent opacity-80"
            aria-hidden="true"
          />
          <span className="absolute top-3 left-3 rounded-sm bg-ground/80 px-1.5 py-0.5 meta text-ink backdrop-blur">
            {episodeLabel(e.number)}
          </span>
          {duration && (
            <span className="absolute right-3 bottom-3 rounded-sm bg-ground/80 px-1.5 py-0.5 meta text-ink backdrop-blur">
              {duration}
            </span>
          )}
        </motion.div>

        <div className="mt-4">
          <p className="meta text-ink-dim">
            {formatDate(e.publishedAt)}
            {guests && (
              <>
                <span className="mx-2 text-line-bright" aria-hidden="true">
                  /
                </span>
                <span className="tracking-normal text-ink-muted normal-case">{guests}</span>
              </>
            )}
          </p>
          <h3
            className={cx(
              featured ? "mt-3 display-m" : compact ? "mt-2 heading text-base" : "mt-2 heading",
              "text-ink transition-colors group-hover:text-cyan",
            )}
          >
            {e.title}
          </h3>
          {guestLine && !compact && <p className="mt-1.5 text-sm text-ink-muted">{guestLine}</p>}
        </div>
      </Link>
    </motion.article>
  );
}
