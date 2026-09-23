import { XMLParser } from "fast-xml-parser";
import type { RawVideo, VideoSource } from "./types";

/**
 * Zero-config fallback: the channel's Atom feed. Returns only the latest 15
 * videos and no durations — enough to catch a new episode, not enough to
 * rebuild the back catalogue. Prefer YouTubeApiSource (PLAN.md §6).
 */
export class YouTubeRssSource implements VideoSource {
  readonly name = "youtube-rss";
  constructor(private channelId: string) {}

  async fetchVideos(): Promise<RawVideo[]> {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${this.channelId}`,
      { signal: AbortSignal.timeout(20_000) },
    );
    if (!res.ok) throw new Error(`YouTube RSS feed responded ${res.status}`);
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const doc = parser.parse(xml);
    const entries = doc?.feed?.entry ?? [];
    const list = Array.isArray(entries) ? entries : [entries];
    return list.map((e: Record<string, unknown>) => {
      const id = String(e["yt:videoId"]);
      const group = (e["media:group"] ?? {}) as Record<string, unknown>;
      return {
        id,
        title: String(e.title ?? ""),
        publishedAt: String(e.published ?? "").slice(0, 10),
        description: String(group["media:description"] ?? ""),
        durationSeconds: null,
        thumbnailUrl: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
      };
    });
  }
}
