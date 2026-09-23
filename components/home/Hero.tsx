import type { Site } from "@/lib/schemas";
import type { EpisodeCardData } from "@/lib/cards";
import { Container } from "@/components/layout/Container";
import { HeroReveal } from "@/components/motion/HeroReveal";
import { Button } from "@/components/ui/Button";
import { EpisodeCard } from "@/components/episode/EpisodeCard";
import { ListenOnLinks } from "@/components/episode/ListenOnLinks";
import { MagneticButton } from "@/components/motion/MagneticButton";

/** Home hero: wordmark reveal, positioning line, latest episode as a featured card. */
export function Hero({
  site,
  featured,
  episodeCount,
}: {
  site: Site;
  featured: EpisodeCardData;
  episodeCount: number;
}) {
  return (
    <section className="relative overflow-hidden dot-grid">
      <div
        className="pointer-events-none absolute -top-48 left-1/2 -z-0 h-[40rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(13_156_172/0.22),transparent)]"
        aria-hidden="true"
      />
      <Container className="relative pt-14 pb-20 md:pt-20 md:pb-28">
        <p className="meta text-teal">Interview podcast · {episodeCount} episodes</p>
        <HeroReveal
          className="mt-5"
          lines={[
            "Leading in",
            <>
              <span className="text-gradient">AI</span>
              <span className="ml-[0.22em] text-ink-dim">Podcast</span>
            </>,
          ]}
        />
        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-10">
          <div className="lg:col-span-5">
            <p className="max-w-xl text-lg text-ink-muted md:text-xl">{site.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <MagneticButton>
                <Button href="/episodes" size="lg">
                  Browse episodes
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button href={site.listen.youtube} variant="secondary" size="lg">
                  Watch on YouTube
                </Button>
              </MagneticButton>
            </div>
            <ListenOnLinks
              listen={site.listen}
              variant="inline"
              label="Listen on"
              className="mt-10"
            />
          </div>
          <div className="lg:col-span-7">
            <p className="mb-4 meta text-ink-dim">Latest episode</p>
            <EpisodeCard episode={featured} variant="featured" priority />
          </div>
        </div>
      </Container>
    </section>
  );
}
