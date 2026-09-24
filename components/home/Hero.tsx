import type { Site } from "@/lib/schemas";
import type { EpisodeCardData } from "@/lib/cards";
import { Container } from "@/components/layout/Container";
import { HeroReveal } from "@/components/motion/HeroReveal";
import { Button } from "@/components/ui/Button";
import { EpisodeCard } from "@/components/episode/EpisodeCard";
import { ListenOnLinks } from "@/components/episode/ListenOnLinks";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Home hero: wordmark reveal, then one line with the positioning and the
 * calls to action, then the latest episode as a wide featured card.
 */
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
      <Container className="relative pt-14 pb-20 md:pt-20 md:pb-24">
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

        <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <div className="max-w-lg">
            <p className="text-lg text-ink-muted md:text-xl">{site.tagline}</p>
            <ListenOnLinks
              listen={site.listen}
              variant="inline"
              label="Listen on"
              className="mt-6"
            />
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
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
        </div>

        <Reveal className="mt-16 border-t border-line pt-10 md:mt-20" distance="none">
          <p className="mb-6 meta text-ink-dim">Latest episode</p>
          <EpisodeCard episode={featured} variant="featured" priority />
        </Reveal>
      </Container>
    </section>
  );
}
