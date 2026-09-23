/**
 * Pluggable episode sources for scripts/sync.ts (PLAN.md §6).
 * YouTube is the source of truth; the podcast RSS feed enriches when present.
 */
export type RawVideo = {
  id: string; // YouTube video id
  title: string;
  publishedAt: string; // YYYY-MM-DD
  description: string;
  durationSeconds: number | null;
  thumbnailUrl: string;
};

export interface VideoSource {
  readonly name: string;
  /** All public uploads on the channel, newest first. Throws on network failure. */
  fetchVideos(): Promise<RawVideo[]>;
}

export type PodcastItem = {
  title: string;
  number: number | null;
  publishedAt: string | null;
  durationSeconds: number | null;
  description: string;
  audioUrl: string | null;
};

export interface PodcastSource {
  readonly name: string;
  fetchItems(): Promise<PodcastItem[]>;
}
