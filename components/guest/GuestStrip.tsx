import Link from "next/link";
import type { GuestCardData } from "@/lib/cards";
import { GuestAvatar } from "./GuestAvatar";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";

/**
 * The home-page credibility grid: everyone who has been on the show. At nine
 * guests this is the section that makes the show look established.
 */
export function GuestStrip({ guests }: { guests: GuestCardData[] }) {
  return (
    <StaggerGroup
      as="ul"
      count={guests.length}
      className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 lg:gap-5"
    >
      {guests.map((g) => (
        <StaggerItem key={g.slug} as="li">
          <Link href={`/guests/${g.slug}`} className="group block rounded-img outline-offset-4">
            <GuestAvatar
              name={g.name}
              headshot={g.headshot}
              sizes="(min-width: 1024px) 140px, 30vw"
              className="[container-type:inline-size] transition-transform duration-500 ease-house group-hover:-translate-y-1"
            />
            <p className="mt-2 truncate text-sm font-medium text-ink group-hover:text-cyan">
              {g.name}
            </p>
            <p className="truncate text-xs text-ink-dim">{g.company ?? g.industry}</p>
          </Link>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
