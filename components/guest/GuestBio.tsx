import type { Guest } from "@/lib/schemas";
import { GuestAvatar } from "./GuestAvatar";
import { Button } from "@/components/ui/Button";

const LinkedInIcon = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
  </svg>
);

/** Guest page header: portrait, name, role, company, location and links. */
export function GuestBio({ guest: g }: { guest: Guest }) {
  return (
    <div className="grid gap-10 md:grid-cols-12 md:items-start">
      <div className="md:col-span-4 lg:col-span-3">
        <GuestAvatar
          name={g.name}
          headshot={g.headshot}
          sizes="(min-width: 768px) 320px, 60vw"
          priority
          className="[container-type:inline-size] max-w-xs"
        />
      </div>
      <div className="md:col-span-8 lg:col-span-9">
        <p className="meta text-teal">Guest</p>
        <h1 className="mt-3 display-l text-ink">{g.name}</h1>
        <p className="mt-4 text-lg text-ink-muted">
          {g.role}
          {g.company && (
            <>
              {" "}
              at{" "}
              {g.companyUrl ? (
                <a
                  href={g.companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-ink underline decoration-teal/60 underline-offset-4 hover:text-cyan"
                >
                  {g.company}
                </a>
              ) : (
                <span className="font-semibold text-ink">{g.company}</span>
              )}
            </>
          )}
        </p>
        <p className="mt-3 meta text-ink-dim">
          {g.industry}
          {g.location && <span className="ml-3">· {g.location}</span>}
        </p>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">{g.bio}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {g.links.linkedin && (
            <Button href={g.links.linkedin} variant="secondary" icon={LinkedInIcon}>
              LinkedIn
            </Button>
          )}
          {g.links.x && (
            <Button href={g.links.x} variant="secondary">
              X
            </Button>
          )}
          {g.links.website && (
            <Button href={g.links.website} variant="secondary">
              Website
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
