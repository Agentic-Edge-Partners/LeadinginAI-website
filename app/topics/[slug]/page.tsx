import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl, getEpisodesByTopic, getGuests, getTopic, getTopics } from "@/lib/content";
import { toEpisodeCard } from "@/lib/cards";
import { breadcrumbJsonLd, topicJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Section } from "@/components/layout/Section";
import { EpisodeGrid } from "@/components/episode/EpisodeGrid";
import { EmptyState } from "@/components/discovery/EmptyState";
import { TopicPill } from "@/components/discovery/TopicPill";

export const dynamicParams = false;

export function generateStaticParams() {
  return getTopics().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t = getTopic(slug);
  if (!t) return {};
  return {
    title: t.name,
    description: t.description,
    alternates: { canonical: `/topics/${t.slug}` },
  };
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = getTopic(slug);
  if (!t) notFound();
  const episodes = getEpisodesByTopic(slug);
  const topics = getTopics();
  const guests = getGuests();
  const cards = episodes.map((e) => toEpisodeCard(e, guests, topics));
  const origin = absoluteUrl("/").replace(/\/$/, "");

  return (
    <>
      <JsonLd
        data={[
          topicJsonLd(t, origin, episodes),
          breadcrumbJsonLd(origin, [
            { name: "Home", path: "/" },
            { name: "Topics", path: "/topics" },
            { name: t.name, path: `/topics/${t.slug}` },
          ]),
        ]}
      />
      <Section eyebrow="Topic" title={t.name} intro={t.description}>
        {cards.length > 0 ? (
          <EpisodeGrid episodes={cards} />
        ) : (
          <EmptyState
            title="No episodes tagged with this topic yet"
            action={{ label: "Browse all episodes", href: "/episodes" }}
          />
        )}
        <div className="mt-16 flex flex-wrap items-center gap-2 border-t border-line pt-8">
          <span className="mr-2 meta text-ink-dim">Other topics</span>
          {topics
            .filter((o) => o.slug !== t.slug)
            .map((o) => (
              <TopicPill key={o.slug} slug={o.slug} name={o.name} />
            ))}
        </div>
      </Section>
    </>
  );
}
