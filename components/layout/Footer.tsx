import Link from "next/link";
import type { Site } from "@/lib/schemas";
import { Wordmark } from "@/components/brand/Logo";
import { Container } from "./Container";
import { ListenOnLinks } from "@/components/episode/ListenOnLinks";

const EXPLORE = [
  { href: "/episodes", label: "Episodes" },
  { href: "/guests", label: "Guests" },
  { href: "/topics", label: "Topics" },
  { href: "/about", label: "About" },
  { href: "/subscribe", label: "Newsletter" },
] as const;

export function Footer({ site }: { site: Site }) {
  const follow = [
    site.social.linkedin && { label: "LinkedIn", href: site.social.linkedin },
    site.social.instagram && { label: "Instagram", href: site.social.instagram },
    site.social.x && { label: "X", href: site.social.x },
  ].filter((x): x is { label: string; href: string } => Boolean(x));

  return (
    <footer className="mt-24 border-t border-line">
      <div className="gradient-rule" aria-hidden="true" />
      <Container className="grid gap-12 py-16 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <Wordmark className="w-36" />
          <p className="mt-6 max-w-sm text-ink-muted">{site.tagline}</p>
          {site.host.name && (
            <p className="mt-4 text-sm text-ink-dim">Hosted by {site.host.name}</p>
          )}
        </div>

        <nav className="md:col-span-2" aria-label="Explore">
          <h2 className="meta text-ink-dim">Explore</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {EXPLORE.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-ink-muted transition-colors hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <h2 className="meta text-ink-dim">Listen on</h2>
          <div className="mt-4">
            <ListenOnLinks listen={site.listen} variant="list" />
          </div>
        </div>

        <div className="md:col-span-2">
          <h2 className="meta text-ink-dim">Follow</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {follow.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-muted transition-colors hover:text-ink"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${site.contact}`}
                className="text-ink-muted transition-colors hover:text-ink"
              >
                {site.contact}
              </a>
            </li>
          </ul>
        </div>
      </Container>
      <Container className="flex flex-col gap-2 border-t border-line py-6 text-xs text-ink-dim sm:flex-row sm:items-center sm:justify-between">
        <p className="meta">
          © {new Date().getFullYear()} {site.shortName}
        </p>
        <p className="meta">
          <Link href="/rss.xml" className="hover:text-ink">
            Site feed
          </Link>
        </p>
      </Container>
    </footer>
  );
}
