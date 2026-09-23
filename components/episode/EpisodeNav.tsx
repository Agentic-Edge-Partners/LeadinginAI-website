import Link from "next/link";
import type { Episode } from "@/lib/schemas";
import { episodeLabel } from "@/lib/format";

function NavItem({ e, dir }: { e: Episode; dir: "prev" | "next" }) {
  return (
    <Link
      href={`/episodes/${e.slug}`}
      className={`group flex h-full flex-col gap-2 rounded-card border border-line p-6 transition-colors hover:border-cyan ${dir === "next" ? "text-right" : ""}`}
    >
      <span className="meta text-ink-dim">{dir === "prev" ? "← Previous" : "Next →"}</span>
      <span className="meta text-cyan">{episodeLabel(e.number)}</span>
      <span className="heading text-ink group-hover:text-cyan">{e.sync.title}</span>
    </Link>
  );
}

/** Previous / next episode links at the foot of an episode page. */
export function EpisodeNav({ prev, next }: { prev?: Episode; next?: Episode }) {
  if (!prev && !next) return null;
  return (
    <nav aria-label="Episode navigation" className="grid gap-4 sm:grid-cols-2">
      <div>{prev && <NavItem e={prev} dir="prev" />}</div>
      <div>{next && <NavItem e={next} dir="next" />}</div>
    </nav>
  );
}
