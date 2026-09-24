/**
 * Client-safe "card" projections of content. Client components receive these
 * instead of full content objects so bundles stay small and no server-only
 * data (descriptions, transcripts) leaks to the browser.
 */
import type { Episode, Guest, Topic } from "./schemas";

export type EpisodeCardData = {
  slug: string;
  number: number;
  season: number;
  title: string;
  hook: string;
  publishedAt: string;
  durationSeconds: number | null;
  thumbnailUrl: string;
  youtubeId: string;
  guests: Array<{ slug: string; name: string; role: string; company: string | null }>;
  topics: Array<{ slug: string; name: string }>;
};

export function toEpisodeCard(e: Episode, guests: Guest[], topics: Topic[]): EpisodeCardData {
  const guestBySlug = new Map(guests.map((g) => [g.slug, g]));
  const topicBySlug = new Map(topics.map((t) => [t.slug, t]));
  return {
    slug: e.slug,
    number: e.number,
    season: e.season,
    title: e.sync.title,
    hook: e.editorial.hook,
    publishedAt: e.sync.publishedAt,
    durationSeconds: e.sync.durationSeconds,
    thumbnailUrl: e.sync.thumbnailUrl,
    youtubeId: e.sync.youtubeId,
    guests: e.editorial.guests
      .map((s) => guestBySlug.get(s))
      .filter((g): g is Guest => Boolean(g))
      .map((g) => ({ slug: g.slug, name: g.name, role: g.role, company: g.company })),
    topics: e.editorial.topics
      .map((s) => topicBySlug.get(s))
      .filter((t): t is Topic => Boolean(t))
      .map((t) => ({ slug: t.slug, name: t.name })),
  };
}

export type GuestCardData = {
  slug: string;
  name: string;
  role: string;
  company: string | null;
  industry: string;
  headshot: string | null;
  episodeCount: number;
  latestEpisodeSlug: string | null;
  latestEpisodeTitle: string | null;
  latestEpisodeNumber: number | null;
};

export function toGuestCard(g: Guest, episodes: Episode[] = []): GuestCardData {
  const latest = episodes.find((e) => e.slug === g.episodes?.[0]);
  return {
    slug: g.slug,
    name: g.name,
    role: g.role,
    company: g.company,
    industry: g.industry,
    headshot: g.headshot,
    episodeCount: g.episodes?.length ?? 0,
    latestEpisodeSlug: g.episodes?.[0] ?? null,
    latestEpisodeTitle: latest?.sync.title ?? null,
    latestEpisodeNumber: latest?.number ?? null,
  };
}
