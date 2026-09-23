import { absoluteUrl, getEpisodes, getGuestsForEpisode, getSite } from "@/lib/content";
import { joinNames } from "@/lib/format";

export const dynamic = "force-static";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Site feed (blog-style, links to episode pages). Not the audio feed. */
export function GET() {
  const site = getSite();
  const origin = absoluteUrl("/").replace(/\/$/, "");
  const items = getEpisodes()
    .map((e) => {
      const url = `${origin}/episodes/${e.slug}`;
      const guests = joinNames(getGuestsForEpisode(e).map((g) => g.name));
      return `    <item>
      <title>${esc(`#${e.number} — ${e.sync.title}${guests ? ` with ${guests}` : ""}`)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${e.sync.publishedAt}T09:00:00Z`).toUTCString()}</pubDate>
      <description>${esc(e.editorial.summary)}</description>
      ${e.editorial.topics.map((t) => `<category>${esc(t)}</category>`).join("")}
    </item>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(site.shortName)}</title>
    <link>${origin}</link>
    <atom:link href="${origin}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>${esc(site.description)}</description>
    <language>${site.language}</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
