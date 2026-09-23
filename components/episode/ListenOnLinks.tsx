import { cx } from "@/lib/cx";
import type { Site } from "@/lib/schemas";

export type ListenTargets = {
  youtube: string | null;
  spotify: string | null;
  apple: string | null;
  rss?: string | null;
};

const Icons = {
  youtube: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
    </svg>
  ),
  spotify: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.3a.75.75 0 0 1-1 .25c-2.8-1.7-6.4-2.1-10.6-1.2a.75.75 0 1 1-.3-1.5c4.6-1 8.5-.6 11.7 1.4.35.2.45.65.2 1.05Zm1.5-3.3a.94.94 0 0 1-1.3.3c-3.2-2-8.2-2.6-12-1.4a.94.94 0 1 1-.55-1.8c4.3-1.3 9.8-.7 13.5 1.6.45.25.6.85.35 1.3Zm.1-3.4C15.3 8.3 8.9 8.1 5.2 9.2a1.13 1.13 0 1 1-.65-2.15c4.2-1.3 11.3-1 15.7 1.6a1.13 1.13 0 0 1-1.15 1.95Z" />
    </svg>
  ),
  apple: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M12 1.5a10.5 10.5 0 0 0-3.9 20.25.75.75 0 0 0 .55-1.4 9 9 0 1 1 6.7 0 .75.75 0 0 0 .55 1.4A10.5 10.5 0 0 0 12 1.5Zm0 4.25a6.25 6.25 0 0 0-3.35 11.53.75.75 0 1 0 .8-1.27 4.75 4.75 0 1 1 5.1 0 .75.75 0 1 0 .8 1.27A6.25 6.25 0 0 0 12 5.75Zm0 3.5a2.75 2.75 0 1 0 0 5.5 2.75 2.75 0 0 0 0-5.5Zm0 6.75c-1.2 0-2.2.55-2.2 1.65 0 .55.5 3.7.9 5.05.2.7.7 1.05 1.3 1.05s1.1-.35 1.3-1.05c.4-1.35.9-4.5.9-5.05 0-1.1-1-1.65-2.2-1.65Z" />
    </svg>
  ),
  rss: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M4 4.5a15.5 15.5 0 0 1 15.5 15.5h-3A12.5 12.5 0 0 0 4 7.5v-3Zm0 6a9.5 9.5 0 0 1 9.5 9.5h-3A6.5 6.5 0 0 0 4 13.5v-3ZM6 16a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" />
    </svg>
  ),
};

const LABELS = {
  youtube: "YouTube",
  spotify: "Spotify",
  apple: "Apple Podcasts",
  rss: "RSS",
} as const;

/**
 * Listen links for three platforms. Apple (and RSS) render only when the URL
 * exists in content/site.json — the slot is built, styled and waiting.
 * PLAN.md §13.
 */
export function ListenOnLinks({
  listen,
  variant = "buttons",
  className,
  label,
}: {
  listen: ListenTargets | Site["listen"];
  variant?: "buttons" | "list" | "inline";
  className?: string;
  label?: string;
}) {
  const entries = (["youtube", "spotify", "apple", "rss"] as const)
    .map((key) => ({ key, href: (listen as ListenTargets)[key] ?? null }))
    .filter((e): e is { key: keyof typeof LABELS; href: string } => Boolean(e.href));

  if (entries.length === 0) return null;

  if (variant === "list") {
    return (
      <ul className={cx("flex flex-col gap-2", className)}>
        {entries.map((e) => (
          <li key={e.key}>
            <a
              href={e.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-ink-muted transition-colors hover:text-ink"
            >
              {Icons[e.key]}
              {LABELS[e.key]}
            </a>
          </li>
        ))}
      </ul>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cx("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
        {label && <span className="meta text-ink-dim">{label}</span>}
        {entries.map((e) => (
          <a
            key={e.key}
            href={e.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-cyan"
          >
            {Icons[e.key]}
            {LABELS[e.key]}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className={cx("flex flex-wrap gap-3", className)}>
      {entries.map((e) => (
        <a
          key={e.key}
          href={e.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center gap-2 rounded-btn border border-line-bright bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-cyan hover:text-cyan"
        >
          {Icons[e.key]}
          {LABELS[e.key]}
        </a>
      ))}
    </div>
  );
}
