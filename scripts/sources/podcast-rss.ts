import { XMLParser } from "fast-xml-parser";
import type { PodcastItem, PodcastSource } from "./types";
import { parseEpisodeTitle } from "../lib/titles";

function parseItunesDuration(v: unknown): number | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  if (/^\d+$/.test(s)) return Number(s);
  const parts = s.split(":").map(Number);
  if (parts.some(Number.isNaN)) return null;
  return parts.reduce((acc, p) => acc * 60 + p, 0);
}

/**
 * The audio host's RSS feed (arrives with the Apple Podcasts submission,
 * PLAN.md §13). Used to enrich durations. Set content/site.json → listen.rss.
 */
export class PodcastRssSource implements PodcastSource {
  readonly name = "podcast-rss";
  constructor(private url: string) {}

  async fetchItems(): Promise<PodcastItem[]> {
    const res = await fetch(this.url, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) throw new Error(`Podcast RSS responded ${res.status}`);
    const xml = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      cdataPropName: "__cdata",
    });
    const doc = parser.parse(xml);
    const items = doc?.rss?.channel?.item ?? [];
    const list = Array.isArray(items) ? items : [items];
    const text = (v: unknown): string =>
      v && typeof v === "object" && "__cdata" in (v as object)
        ? String((v as { __cdata: unknown }).__cdata)
        : v === undefined
          ? ""
          : String(v);
    return list.map((it: Record<string, unknown>) => {
      const title = text(it.title);
      const parsed = parseEpisodeTitle(title);
      const pub = it.pubDate ? new Date(String(it.pubDate)) : null;
      const enclosure = it.enclosure as { "@_url"?: string } | undefined;
      return {
        title,
        number:
          parsed?.number ??
          (typeof it["itunes:episode"] === "number" ? Number(it["itunes:episode"]) : null),
        publishedAt: pub && !Number.isNaN(pub.getTime()) ? pub.toISOString().slice(0, 10) : null,
        durationSeconds: parseItunesDuration(it["itunes:duration"]),
        description: text(it["content:encoded"] ?? it.description),
        audioUrl: enclosure?.["@_url"] ?? null,
      };
    });
  }
}
