import type { MetadataRoute } from "next";
import { absoluteUrl, getEpisodes, getGuests, getTopics } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = absoluteUrl("/").replace(/\/$/, "");
  const episodes = getEpisodes();
  const latest = episodes[0]?.sync.publishedAt;
  const statics: MetadataRoute.Sitemap = [
    "",
    "/episodes",
    "/guests",
    "/topics",
    "/about",
    "/subscribe",
  ].map((p) => ({
    url: `${origin}${p}`,
    lastModified: latest ? new Date(latest) : undefined,
    changeFrequency: p === "" || p === "/episodes" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.7,
  }));
  return [
    ...statics,
    ...episodes.map((e) => ({
      url: `${origin}/episodes/${e.slug}`,
      lastModified: new Date(e.sync.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...getGuests()
      .filter((g) => (g.episodes?.length ?? 0) > 0)
      .map((g) => ({
        url: `${origin}/guests/${g.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ...getTopics().map((t) => ({
      url: `${origin}/topics/${t.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
