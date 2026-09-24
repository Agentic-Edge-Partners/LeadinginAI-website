import {
  absoluteUrl,
  getEpisodes,
  getEpisodesByTopic,
  getFeaturedEpisode,
  getGuests,
  getSite,
  getTopics,
} from "@/lib/content";
import { toEpisodeCard, toGuestCard } from "@/lib/cards";
import { podcastSeriesJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Hero } from "@/components/home/Hero";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { EpisodeRail } from "@/components/episode/EpisodeRail";
import { GuestStrip } from "@/components/guest/GuestStrip";
import { TopicWall } from "@/components/discovery/TopicWall";
import { SubscribeInline } from "@/components/forms/SubscribeInline";
import { ListenOnLinks } from "@/components/episode/ListenOnLinks";
import { Reveal } from "@/components/motion/Reveal";

export default function HomePage() {
  const site = getSite();
  const episodes = getEpisodes();
  const guests = getGuests();
  const topics = getTopics();
  const featured = getFeaturedEpisode();
  const cards = episodes.map((e) => toEpisodeCard(e, guests, topics));
  const featuredCard = cards.find((c) => c.slug === featured?.slug) ?? cards[0];
  const rail = cards.filter((c) => c.slug !== featuredCard?.slug).slice(0, 8);
  const counts = Object.fromEntries(topics.map((t) => [t.slug, getEpisodesByTopic(t.slug).length]));

  return (
    <>
      <JsonLd data={podcastSeriesJsonLd(site, absoluteUrl("/").replace(/\/$/, ""))} />
      {featuredCard && <Hero site={site} featured={featuredCard} episodeCount={episodes.length} />}

      <Section
        eyebrow="Latest"
        title="Recent episodes"
        aside={
          <Button href="/episodes" variant="secondary">
            All episodes
          </Button>
        }
      >
        <Reveal distance="none">
          <EpisodeRail episodes={rail} />
        </Reveal>
      </Section>

      <Section
        eyebrow="Guests"
        title="The people who've been on"
        intro="Partners, founders, policy leads and practitioners, talking about the work rather than the hype."
        aside={
          <Button href="/guests" variant="secondary">
            Guest directory
          </Button>
        }
      >
        <GuestStrip guests={guests.map((g) => toGuestCard(g, episodes))} />
      </Section>

      <Section
        eyebrow="Topics"
        title="Explore by theme"
        intro="A closed set of themes we keep coming back to. Every episode is tagged with one or more."
      >
        <TopicWall topics={topics} counts={counts} />
      </Section>

      <SubscribeInline site={site} />

      <Section eyebrow="Listen" title="Wherever you listen" tight>
        <ListenOnLinks listen={site.listen} />
      </Section>
    </>
  );
}
