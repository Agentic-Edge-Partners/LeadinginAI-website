import type { Site } from "@/lib/schemas";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { SubscribeForm } from "./SubscribeForm";

/** Full-bleed, high-contrast newsletter section for the home page. */
export function SubscribeInline({ site }: { site: Site }) {
  const n = site.newsletter;
  return (
    <section className="relative overflow-hidden border-y border-line bg-surface">
      <div
        className="pointer-events-none absolute -top-40 right-0 -z-0 size-[32rem] rounded-full bg-[radial-gradient(circle,rgb(0_217_224/0.18),transparent_65%)]"
        aria-hidden="true"
      />
      <Container className="relative grid gap-10 section-y md:grid-cols-12 md:items-center">
        <Reveal className="md:col-span-7">
          <p className="meta text-teal">Newsletter</p>
          <h2 className="mt-3 display-l text-ink">{n.headline}</h2>
          <p className="mt-4 max-w-xl text-lg text-ink-muted">{n.subheadline}</p>
        </Reveal>
        <Reveal delay={0.1} className="md:col-span-5">
          <SubscribeForm copy={n} source="home" size="lg" />
        </Reveal>
      </Container>
    </section>
  );
}
