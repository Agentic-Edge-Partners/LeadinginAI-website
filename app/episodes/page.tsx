import type { Metadata } from "next";
import { absoluteUrl, getEpisodes, getGuests, getSeasons, getSite, getTopics } from "@/lib/content";
import { toEpisodeCard } from "@/lib/cards";
import { collectionJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Section } from "@/components/layout/Section";
import { EpisodeArchive } from "@/components/discovery/EpisodeArchive";

export const metadata: Metadata = {
  title: "Episodes",
  description:
    "Every episode of Leading in AI: long-form conversations with executives, founders and thought-leaders on AI strategy, governance, agents and transformation.",
  alternates: { canonical: "/episodes" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? (v[0] ?? "") : (v ?? ""));

export default async function EpisodesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const initial = {
    topic: first(sp.topic),
    guest: first(sp.guest),
    season: first(sp.season),
    q: first(sp.q),
  };

  const site = getSite();
  const episodes = getEpisodes();
  const guests = getGuests();
  const topics = getTopics();
  const cards = episodes.map((e) => toEpisodeCard(e, guests, topics));
  const usedTopics = new Set(episodes.flatMap((e) => e.editorial.topics));
  const origin = absoluteUrl("/").replace(/\/$/, "");

  return (
    <>
      <JsonLd
        data={collectionJsonLd(
          `Episodes — ${site.shortName}`,
          metadata.description ?? "",
          `${origin}/episodes`,
          episodes.map((e) => ({ name: e.sync.title, url: `${origin}/episodes/${e.slug}` })),
        )}
      />
      <Section
        eyebrow="Archive"
        title="Every episode"
        intro="Filter by theme or guest, or search across titles, summaries and full transcripts."
      >
        <EpisodeArchive
          episodes={cards}
          topics={topics
            .filter((t) => usedTopics.has(t.slug))
            .map((t) => ({ value: t.slug, label: t.name }))}
          guests={guests
            .filter((g) => (g.episodes?.length ?? 0) > 0)
            .map((g) => ({ value: g.slug, label: g.name }))}
          seasons={getSeasons().map((s) => ({ value: String(s), label: `Season ${s}` }))}
          initial={initial}
        />
      </Section>
    </>
  );
}
