import type { RawVideo, VideoSource } from "./types";

const API = "https://www.googleapis.com/youtube/v3";

/** ISO 8601 duration (PT48M12S) → seconds. */
export function parseIsoDuration(iso: string): number | null {
  const m = iso.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return null;
  const [, d, h, mi, s] = m;
  return Number(d ?? 0) * 86400 + Number(h ?? 0) * 3600 + Number(mi ?? 0) * 60 + Number(s ?? 0);
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `YouTube API ${res.status} for ${url.replace(/key=[^&]+/, "key=…")}: ${body.slice(0, 200)}`,
    );
  }
  return (await res.json()) as T;
}

type PlaylistPage = {
  nextPageToken?: string;
  items: Array<{ contentDetails: { videoId: string } }>;
};
type VideosPage = {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      publishedAt: string;
      thumbnails: Record<string, { url: string }>;
    };
    contentDetails: { duration: string };
    status: { privacyStatus: string; uploadStatus: string };
  }>;
};

/**
 * Primary source: YouTube Data API v3 with an API key. Free, 10k units/day;
 * a full sync of this channel costs well under 20 units.
 */
export class YouTubeApiSource implements VideoSource {
  readonly name = "youtube-api";
  constructor(
    private channelId: string,
    private apiKey: string,
  ) {}

  async fetchVideos(): Promise<RawVideo[]> {
    const uploads = `UU${this.channelId.slice(2)}`; // uploads playlist id
    const ids: string[] = [];
    let pageToken = "";
    do {
      const page = await getJson<PlaylistPage>(
        `${API}/playlistItems?part=contentDetails&maxResults=50&playlistId=${uploads}${pageToken ? `&pageToken=${pageToken}` : ""}&key=${this.apiKey}`,
      );
      ids.push(...page.items.map((i) => i.contentDetails.videoId));
      pageToken = page.nextPageToken ?? "";
    } while (pageToken);

    const out: RawVideo[] = [];
    for (let i = 0; i < ids.length; i += 50) {
      const chunk = ids.slice(i, i + 50);
      const page = await getJson<VideosPage>(
        `${API}/videos?part=snippet,contentDetails,status&id=${chunk.join(",")}&key=${this.apiKey}`,
      );
      for (const v of page.items) {
        if (v.status.privacyStatus !== "public" || v.status.uploadStatus !== "processed") continue;
        const th = v.snippet.thumbnails;
        out.push({
          id: v.id,
          title: v.snippet.title,
          publishedAt: v.snippet.publishedAt.slice(0, 10),
          description: v.snippet.description ?? "",
          durationSeconds: parseIsoDuration(v.contentDetails.duration),
          thumbnailUrl: th.maxres?.url ?? `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
        });
      }
    }
    return out.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  }
}
