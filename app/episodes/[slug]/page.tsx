import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  absoluteUrl,
  getAdjacentEpisodes,
  getClipsForEpisode,
  getEpisode,
  getEpisodes,
  getGuestsForEpisode,
  getShowNotes,
  getSite,
  getTopics,
  getTranscript,
} from "@/lib/content";
import { toEpisodeCard } from "@/lib/cards";
import { episodeLabel, joinNames, spotifyEpisodeUrl, youtubeWatchUrl } from "@/lib/format";
import { mergeCues, toParagraphs, wordCount } from "@/lib/transcript";
import { breadcrumbJsonLd, podcastEpisodeJsonLd } from "@/lib/seo";
import { Markdown } from "@/lib/markdown";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { PlayerProvider } from "@/components/episode/PlayerProvider";
import { EpisodeHero } from "@/components/episode/EpisodeHero";
import { ChapterList } from "@/components/episode/ChapterList";
import { QuoteBlock } from "@/components/episode/QuoteBlock";
import { HighlightClip } from "@/components/episode/HighlightClip";
import { TranscriptViewer } from "@/components/episode/TranscriptViewer";
import { ListenOnLinks } from "@/components/episode/ListenOnLinks";
import { EpisodeNav } from "@/components/episode/EpisodeNav";
import { GuestAvatar } from "@/components/guest/GuestAvatar";
import { Tag } from "@/components/ui/Tag";
import { Reveal } from "@/components/motion/Reveal";

export const dynamicParams = false;

export function generateStaticParams() {
  return getEpisodes().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = getEpisode(slug);
  if (!e) return {};
  const guests = getGuestsForEpisode(e);
  const title = `${episodeLabel(e.number)} · ${e.sync.title}${guests.length ? ` with ${joinNames(guests.map((g) => g.name))}` : ""}`;
  return {
    title,
    description: e.editorial.hook || e.editorial.summary.slice(0, 160),
    alternates: { canonical: `/episodes/${e.slug}` },
    openGraph: {
      type: "article",
      publishedTime: e.sync.publishedAt,
      title,
      description: e.editorial.summary,
    },
  };
}

function SubHeading({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mb-6 meta text-teal">
      {children}
    </h2>
  );
}

export default async function EpisodePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = getEpisode(slug);
  if (!e) notFound();

  const site = getSite();
  const guests = getGuestsForEpisode(e);
  const topics = getTopics();
  const clips = getClipsForEpisode(slug);
  const transcript = getTranscript(slug);
  const showNotes = getShowNotes(slug);
  const { prev, next } = getAdjacentEpisodes(slug);
  const card = toEpisodeCard(e, guests, topics);
  const origin = absoluteUrl("/").replace(/\/$/, "");

  const cues = transcript ? mergeCues(transcript.cues) : [];
  const paragraphs = toParagraphs(cues);
  const guestName = (s: string | null) =>
    guests.find((g) => g.slug === s)?.name ?? (s === "host" ? site.host.name : null);

  const listen = {
    youtube: youtubeWatchUrl(e.sync.youtubeId),
    spotify: e.sync.spotifyEpisodeId
      ? spotifyEpisodeUrl(e.sync.spotifyEpisodeId)
      : site.listen.spotify,
    apple: site.listen.apple,
  };

  return (
    <PlayerProvider>
      <JsonLd
        data={[
          podcastEpisodeJsonLd(e, guests, site, origin),
          breadcrumbJsonLd(origin, [
            { name: "Home", path: "/" },
            { name: "Episodes", path: "/episodes" },
            { name: e.sync.title, path: `/episodes/${e.slug}` },
          ]),
        ]}
      />
      <EpisodeHero episode={card} />

      <Container className="grid gap-16 pb-8 lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col gap-16 lg:col-span-8">
          <Reveal as="section" aria-labelledby="about">
            <SubHeading id="about">About this episode</SubHeading>
            <p className="max-w-3xl text-lg leading-relaxed text-ink-muted">
              {e.editorial.summary}
            </p>
            {e.editorial.links.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                {e.editorial.links.map((l) => (
                  <li key={l.url}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-cyan underline underline-offset-4 hover:text-ink"
                    >
                      {l.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Reveal>

          {e.editorial.chapters.length > 0 && (
            <Reveal as="section" aria-labelledby="chapters">
              <SubHeading id="chapters">Chapters</SubHeading>
              <ChapterList
                chapters={e.editorial.chapters}
                durationSeconds={e.sync.durationSeconds}
              />
            </Reveal>
          )}

          {e.editorial.quotes.length > 0 && (
            <Reveal as="section" aria-labelledby="quotes">
              <SubHeading id="quotes">Key quotes</SubHeading>
              <div className="flex flex-col gap-10">
                {e.editorial.quotes.map((q, i) => (
                  <QuoteBlock key={i} quote={q} speakerName={guestName(q.speaker)} />
                ))}
              </div>
            </Reveal>
          )}

          {clips.length > 0 && (
            <Reveal as="section" aria-labelledby="highlights">
              <SubHeading id="highlights">Highlights</SubHeading>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                {clips.map((c) => (
                  <HighlightClip key={c.youtubeId} clip={c} />
                ))}
              </div>
            </Reveal>
          )}

          {showNotes && (
            <Reveal as="section" aria-labelledby="notes">
              <SubHeading id="notes">Show notes</SubHeading>
              <Markdown source={showNotes} />
            </Reveal>
          )}

          {paragraphs.length > 0 && transcript && (
            <section aria-labelledby="transcript" id="transcript">
              <SubHeading id="transcript-heading">Transcript</SubHeading>
              <TranscriptViewer
                paragraphs={paragraphs}
                source={transcript.source}
                words={wordCount(transcript.cues)}
              />
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-12 lg:col-span-4">
          <div>
            <SubHeading>Listen to this episode</SubHeading>
            <ListenOnLinks listen={listen} variant="list" />
          </div>

          {guests.length > 0 && (
            <div>
              <SubHeading>{guests.length === 1 ? "The guest" : "The guests"}</SubHeading>
              <ul className="flex flex-col gap-6">
                {guests.map((g) => (
                  <li key={g.slug} className="flex gap-4">
                    <Link href={`/guests/${g.slug}`} className="shrink-0 rounded-img">
                      <GuestAvatar
                        name={g.name}
                        headshot={g.headshot}
                        sizes="96px"
                        className="[container-type:inline-size] w-20"
                      />
                    </Link>
                    <div className="min-w-0">
                      <Link href={`/guests/${g.slug}`} className="heading text-ink hover:text-cyan">
                        {g.name}
                      </Link>
                      <p className="mt-1 text-sm text-ink-muted">
                        {[g.role, g.company].filter(Boolean).join(", ")}
                      </p>
                      <p className="mt-2 line-clamp-3 text-sm text-ink-dim">{g.bio}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {card.topics.length > 0 && (
            <div>
              <SubHeading>Topics</SubHeading>
              <div className="flex flex-wrap gap-2">
                {card.topics.map((t) => (
                  <Tag key={t.slug} href={`/topics/${t.slug}`}>
                    {t.name}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </aside>
      </Container>

      <Section tight>
        <EpisodeNav prev={prev} next={next} />
      </Section>
    </PlayerProvider>
  );
}
