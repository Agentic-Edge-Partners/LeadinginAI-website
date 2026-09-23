import Link from "next/link";
import type { Topic } from "@/lib/schemas";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";

/** The closed topic vocabulary as large clickable type (home page §8). */
export function TopicWall({ topics, counts }: { topics: Topic[]; counts: Record<string, number> }) {
  return (
    <StaggerGroup
      as="ul"
      count={topics.length}
      className="divide-y divide-line border-y border-line"
    >
      {topics.map((t) => (
        <StaggerItem key={t.slug} as="li">
          <Link
            href={`/topics/${t.slug}`}
            className="group flex items-baseline justify-between gap-6 py-5 outline-offset-[-2px] md:py-7"
          >
            <span className="display-m text-ink transition-colors group-hover:text-cyan">
              {t.name}
            </span>
            <span className="shrink-0 meta text-ink-dim transition-colors group-hover:text-cyan">
              {counts[t.slug] ?? 0} {counts[t.slug] === 1 ? "episode" : "episodes"}
              <span
                className="ml-3 inline-block transition-transform duration-300 ease-house group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </span>
          </Link>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
