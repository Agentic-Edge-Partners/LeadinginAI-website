import type { Metadata } from "next";
import { getEpisodes, getGuests, getSite } from "@/lib/content";
import { toGuestCard } from "@/lib/cards";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { ListenOnLinks } from "@/components/episode/ListenOnLinks";
import { GuestStrip } from "@/components/guest/GuestStrip";
import { Wordmark } from "@/components/brand/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { formatMonthYear } from "@/lib/format";

export const metadata: Metadata = {
  title: "About",
  description:
    "What Leading in AI is, who it is for, who hosts it, and how to listen or get in touch.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const site = getSite();
  const episodes = getEpisodes();
  const guests = getGuests().filter((g) => (g.episodes?.length ?? 0) > 0);
  const since = episodes.length
    ? formatMonthYear(episodes[episodes.length - 1].sync.publishedAt)
    : null;

  return (
    <>
      <Section tight className="pt-10 md:pt-16">
        <div className="grid gap-12 md:grid-cols-12 md:items-start">
          <Reveal className="md:col-span-7">
            <p className="meta text-teal">About the show</p>
            <h1 className="mt-3 display-l text-ink">Conversations about the work, not the hype.</h1>
            <div className="mt-8 flex flex-col gap-5 text-lg leading-relaxed text-ink-muted">
              <p>{site.about.intro}</p>
              <p>{site.about.audience}</p>
              <p>{site.about.format}</p>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-5 md:pl-8">
            <div className="rounded-card border border-line bg-surface p-8">
              <Wordmark className="w-32" />
              <dl className="mt-8 grid grid-cols-2 gap-6">
                <div>
                  <dt className="meta text-ink-dim">Episodes</dt>
                  <dd className="mt-1 display-m text-ink">{episodes.length}</dd>
                </div>
                <div>
                  <dt className="meta text-ink-dim">Guests</dt>
                  <dd className="mt-1 display-m text-ink">{guests.length}</dd>
                </div>
                {since && (
                  <div className="col-span-2">
                    <dt className="meta text-ink-dim">Publishing since</dt>
                    <dd className="mt-1 text-ink">{since}</dd>
                  </div>
                )}
              </dl>
            </div>
          </Reveal>
        </div>
      </Section>

      {site.host.name && site.host.bio && (
        <Section eyebrow="Host" title={`Hosted by ${site.host.name}`} tight>
          <p className="max-w-2xl text-lg leading-relaxed text-ink-muted">{site.host.bio}</p>
          {site.host.linkedin && (
            <div className="mt-6">
              <Button href={site.host.linkedin} variant="secondary">
                {site.host.name} on LinkedIn
              </Button>
            </div>
          )}
        </Section>
      )}

      <Section eyebrow="Guests" title="Who has been on" tight>
        <GuestStrip guests={guests.map((g) => toGuestCard(g, episodes))} />
      </Section>

      <Section
        eyebrow="Listen"
        title="How to listen"
        intro="Every episode is published on video and audio. Pick whichever you already use."
        tight
      >
        <ListenOnLinks listen={site.listen} />
        <div className="mt-6">
          <Button href="/subscribe" variant="ghost">
            Or get episodes by email →
          </Button>
        </div>
      </Section>

      <Section
        eyebrow="Contact"
        title="Get in touch"
        intro="Guest suggestions, feedback, partnerships: one address for everything."
        tight
      >
        <Button href={`mailto:${site.contact}`} size="lg">
          {site.contact}
        </Button>
      </Section>
    </>
  );
}
