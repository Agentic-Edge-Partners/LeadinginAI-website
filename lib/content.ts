import "server-only";
/**
 * The content layer used by pages. Wraps lib/content-core.ts in React's
 * per-request cache so a page can call getEpisodes()/getGuest() freely.
 *
 * Pages import from this file only. If you need a new derived view of the
 * content, add a function here rather than computing it inside a component.
 */
import { cache } from "react";
import { loadLibrary, type Library } from "./content-core";
import type { Episode, Guest } from "./schemas";

export type { Library } from "./content-core";
export { ContentError, CONTENT_DIR } from "./content-core";

/** Loads and cross-validates everything once per build/request. */
export const getLibrary = cache((): Library => loadLibrary());

// ─── Convenience accessors ──────────────────────────────────────────────────

export const getSite = () => getLibrary().site;
export const getTopics = () => getLibrary().topics;
export const getTopic = (slug: string) => getLibrary().topics.find((t) => t.slug === slug);

export const getEpisodes = () => getLibrary().episodes;
export const getEpisode = (slug: string) => getLibrary().episodes.find((e) => e.slug === slug);
export const getFeaturedEpisode = (): Episode | undefined => {
  const eps = getLibrary().episodes;
  return eps.find((e) => e.editorial.featured) ?? eps[0];
};
export const getEpisodesByTopic = (topic: string) =>
  getLibrary().episodes.filter((e) => e.editorial.topics.includes(topic));
export const getEpisodesForGuest = (guest: string) =>
  getLibrary().episodes.filter((e) => e.editorial.guests.includes(guest));

export const getGuests = () => getLibrary().guests;
export const getGuest = (slug: string) => getLibrary().guests.find((g) => g.slug === slug);
export const getGuestsForEpisode = (episode: Episode): Guest[] =>
  episode.editorial.guests.map((s) => getGuest(s)).filter((g): g is Guest => Boolean(g));

export const getClipsForEpisode = (slug: string) =>
  getLibrary()
    .clips.filter((c) => c.editorial.parentEpisode === slug)
    .sort((a, b) => (a.editorial.sourceTimestamp ?? 0) - (b.editorial.sourceTimestamp ?? 0));

export const getTranscript = (slug: string) => getLibrary().transcripts.get(slug);
export const getShowNotes = (slug: string) => getLibrary().showNotes.get(slug);

/** prev = older episode, next = newer episode. */
export function getAdjacentEpisodes(slug: string): { prev?: Episode; next?: Episode } {
  const eps = getLibrary().episodes; // newest first
  const i = eps.findIndex((e) => e.slug === slug);
  if (i < 0) return {};
  return { next: eps[i - 1], prev: eps[i + 1] };
}

/** Guests who share at least one topic with this guest's episodes, most overlap first. */
export function getRelatedGuests(slug: string, limit = 4): Guest[] {
  const lib = getLibrary();
  const mine = new Set(getEpisodesForGuest(slug).flatMap((e) => e.editorial.topics));
  const scored = lib.guests
    .filter((g) => g.slug !== slug)
    .map((g) => {
      const theirs = getEpisodesForGuest(g.slug).flatMap((e) => e.editorial.topics);
      const overlap = theirs.filter((t) => mine.has(t)).length;
      return { g, overlap };
    })
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap);
  return scored.slice(0, limit).map((x) => x.g);
}

/** Distinct industries across guests, for the directory filter. */
export const getIndustries = () =>
  Array.from(new Set(getLibrary().guests.map((g) => g.industry))).sort();

/** Distinct seasons, for the archive filter. */
export const getSeasons = () =>
  Array.from(new Set(getLibrary().episodes.map((e) => e.season))).sort((a, b) => a - b);

/** Absolute URL for a path, using the canonical site origin. */
export function absoluteUrl(p = "/"): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || getSite().url).replace(/\/$/, "");
  return `${base}${p.startsWith("/") ? p : `/${p}`}`;
}
