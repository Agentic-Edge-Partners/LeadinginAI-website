"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { EpisodeCardData } from "@/lib/cards";
import { EpisodeGrid } from "@/components/episode/EpisodeGrid";
import { FilterBar, type FilterOption, type Filters } from "./FilterBar";
import { EmptyState } from "./EmptyState";
import { useSearchIndex } from "./useSearchIndex";

type Props = {
  episodes: EpisodeCardData[];
  topics: FilterOption[];
  guests: FilterOption[];
  seasons: FilterOption[];
  initial: Filters;
};

/**
 * The archive: filter state lives in the URL (?topic=&guest=&season=&q=) so
 * filtered views are shareable. Search uses the prebuilt MiniSearch index
 * (titles, guests, topics, summaries, transcripts) once loaded, and a simple
 * substring match before that.
 */
export function EpisodeArchive({ episodes, topics, guests, seasons, initial }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<Filters>(initial);
  const [, startTransition] = useTransition();
  const index = useSearchIndex(filters.q.trim().length >= 2);

  // Mirror state → URL (replace, no scroll) after a short debounce for typing.
  useEffect(() => {
    const t = setTimeout(() => {
      const p = new URLSearchParams();
      if (filters.topic) p.set("topic", filters.topic);
      if (filters.guest) p.set("guest", filters.guest);
      if (filters.season) p.set("season", filters.season);
      if (filters.q.trim()) p.set("q", filters.q.trim());
      const qs = p.toString();
      const next = qs ? `${pathname}?${qs}` : pathname;
      if (next !== `${window.location.pathname}${window.location.search}`) {
        startTransition(() => router.replace(next, { scroll: false }));
      }
    }, 250);
    return () => clearTimeout(t);
  }, [filters, pathname, router]);

  const results = useMemo(() => {
    let list = episodes;
    if (filters.topic) list = list.filter((e) => e.topics.some((t) => t.slug === filters.topic));
    if (filters.guest) list = list.filter((e) => e.guests.some((g) => g.slug === filters.guest));
    if (filters.season) list = list.filter((e) => String(e.season) === filters.season);
    const q = filters.q.trim();
    if (q.length >= 2) {
      if (index) {
        const ranked = index.search(q).map((r) => r.id as string);
        const rank = new Map(ranked.map((id, i) => [id, i]));
        list = list
          .filter((e) => rank.has(e.slug))
          .sort((a, b) => rank.get(a.slug)! - rank.get(b.slug)!);
      } else {
        const needle = q.toLowerCase();
        list = list.filter((e) =>
          [e.title, e.hook, ...e.guests.map((g) => g.name), ...e.topics.map((t) => t.name)]
            .join(" ")
            .toLowerCase()
            .includes(needle),
        );
      }
    }
    return list;
  }, [episodes, filters, index]);

  return (
    <div className="flex flex-col gap-10">
      <FilterBar
        filters={filters}
        onChange={setFilters}
        topics={topics}
        guests={guests}
        seasons={seasons}
        resultCount={results.length}
      />
      {results.length === 0 ? (
        <EmptyState
          title="Nothing matches those filters"
          body="Try a broader search, or clear the filters to see every episode."
          action={{
            label: "Clear filters",
            onClick: () => setFilters({ topic: "", guest: "", season: "", q: "" }),
          }}
        />
      ) : (
        <EpisodeGrid episodes={results} />
      )}
    </div>
  );
}
