import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  absoluteUrl,
  getEpisodesForGuest,
  getGuest,
  getGuests,
  getRelatedGuests,
  getSite,
  getTopics,
} from "@/lib/content";
import { toEpisodeCard, toGuestCard } from "@/lib/cards";
import { breadcrumbJsonLd, personJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Section } from "@/components/layout/Section";
import { GuestBio } from "@/components/guest/GuestBio";
import { GuestCard } from "@/components/guest/GuestCard";
import { EpisodeCard } from "@/components/episode/EpisodeCard";
import { QuoteBlock } from "@/components/episode/QuoteBlock";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";

export const dynamicParams = false;

export function generateStaticParams() {
  return getGuests().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuest(slug);
  if (!g) return {};
  return {
    title: `${g.name} — ${[g.role, g.company].filter(Boolean).join(", ")}`,
    description: g.bio.slice(0, 160),
    alternates: { canonical: `/guests/${g.slug}` },
    openGraph: { type: "profile", title: g.name, description: g.bio },
  };
}

export default async function GuestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = getGuest(slug);
  if (!g) notFound();
  const site = getSite();
  const topics = getTopics();
  const allGuests = getGuests();
  const episodes = getEpisodesForGuest(slug);
  const cards = episodes.map((e) => toEpisodeCard(e, allGuests, topics));
  const [latest, ...older] = cards;
  const quotes = episodes.flatMap((e) =>
    e.editorial.quotes.filter((q) => q.speaker === slug).map((q) => ({ q, episode: e })),
  );
  const related = getRelatedGuests(slug);
  const origin = absoluteUrl("/").replace(/\/$/, "");
  const firstName = g.name.split(" ")[0];

  return (
    <>
      <JsonLd
        data={[
          personJsonLd(g, site, origin),
          breadcrumbJsonLd(origin, [
            { name: "Home", path: "/" },
            { name: "Guests", path: "/guests" },
            { name: g.name, path: `/guests/${g.slug}` },
          ]),
        ]}
      />
      <Section tight className="pt-10 md:pt-16">
        <GuestBio guest={g} />
      </Section>

      {latest && (
        <Section
          eyebrow="On the podcast"
          title={
            older.length ? `Conversations with ${firstName}` : `The conversation with ${firstName}`
          }
          tight
        >
          <Reveal distance="none">
            <EpisodeCard episode={latest} variant="featured" priority />
          </Reveal>
          {episodes[0]?.editorial.summary && (
            <Reveal className="mt-10 grid gap-8 lg:grid-cols-12">
              <p className="meta text-teal lg:col-span-2">In this episode</p>
              <p className="max-w-3xl text-lg leading-relaxed text-ink-muted lg:col-span-10">
                {episodes[0].editorial.summary}
              </p>
            </Reveal>
          )}
          {older.length > 0 && (
            <StaggerGroup
              as="ul"
              count={older.length}
              className="mt-16 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
            >
              {older.map((c) => (
                <StaggerItem key={c.slug} as="li">
                  <EpisodeCard episode={c} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </Section>
      )}

      {quotes.length > 0 && (
        <Section eyebrow="In their words" title="Pull quotes" tight>
          <div className="flex flex-col gap-10">
            {quotes.map(({ q }, i) => (
              <QuoteBlock key={i} quote={{ ...q, timestamp: null }} speakerName={null} />
            ))}
          </div>
        </Section>
      )}

      {related.length > 0 && (
        <Section eyebrow="Related" title="Guests on similar themes" tight>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((r) => (
              <li key={r.slug}>
                <GuestCard guest={toGuestCard(r, getEpisodesForGuest(r.slug))} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
