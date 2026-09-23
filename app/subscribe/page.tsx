import type { Metadata } from "next";
import { getSite } from "@/lib/content";
import { Section } from "@/components/layout/Section";
import { SubscribeForm } from "@/components/forms/SubscribeForm";
import { ListenOnLinks } from "@/components/episode/ListenOnLinks";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Subscribe",
  description:
    "Get every new Leading in AI episode by email: who the guest is, what they said, and the moments worth your time.",
  alternates: { canonical: "/subscribe" },
};

export default function SubscribePage() {
  const site = getSite();
  const n = site.newsletter;
  return (
    <Section tight className="pt-10 md:pt-16">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <p className="meta text-teal">Newsletter</p>
          <h1 className="mt-3 display-l text-ink">{n.headline}</h1>
          <p className="mt-5 text-lg text-ink-muted">{n.subheadline}</p>
        </Reveal>
        <Reveal delay={0.1} className="mt-10">
          <SubscribeForm copy={n} source="page" size="lg" autoFocus />
        </Reveal>
        <Reveal delay={0.2} className="mt-16 border-t border-line pt-8">
          <p className="meta text-ink-dim">Prefer an app?</p>
          <ListenOnLinks listen={site.listen} className="mt-4" />
        </Reveal>
      </div>
    </Section>
  );
}
