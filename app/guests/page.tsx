import type { Metadata } from "next";
import { absoluteUrl, getEpisodes, getGuests, getIndustries, getSite } from "@/lib/content";
import { toGuestCard } from "@/lib/cards";
import { collectionJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Section } from "@/components/layout/Section";
import { GuestGrid } from "@/components/guest/GuestGrid";

export const metadata: Metadata = {
  title: "Guests",
  description:
    "Everyone who has been on Leading in AI: executives, founders, advisors and academics building and deploying AI in their organisations.",
  alternates: { canonical: "/guests" },
};

export default function GuestsPage() {
  const site = getSite();
  const episodes = getEpisodes();
  const guests = getGuests().filter((g) => (g.episodes?.length ?? 0) > 0);
  const origin = absoluteUrl("/").replace(/\/$/, "");
  return (
    <>
      <JsonLd
        data={collectionJsonLd(
          `Guests — ${site.shortName}`,
          metadata.description ?? "",
          `${origin}/guests`,
          guests.map((g) => ({ name: g.name, url: `${origin}/guests/${g.slug}` })),
        )}
      />
      <Section
        eyebrow="Directory"
        title="The guests"
        intro="Filter by industry. Every guest page collects their episodes, pull-quotes and related conversations."
      >
        <GuestGrid
          guests={guests.map((g) => toGuestCard(g, episodes))}
          industries={getIndustries()}
        />
      </Section>
    </>
  );
}
