# Leading in AI — Website Development Plan

> **This document is the brief for the build session.** It records decisions already
> made with the owner, so they should not be re-litigated. Where something is still
> open it is listed explicitly in [§14 Open inputs](#14-open-inputs-needed-from-pedro).
>
> Companion docs: [`docs/BRAND.md`](docs/BRAND.md) · [`docs/CONTENT-MODEL.md`](docs/CONTENT-MODEL.md) · [`docs/WORKFLOW.md`](docs/WORKFLOW.md)
>
> Written 2026-09-23.

---

## 1. Context

**Leading in AI Podcast** — interview show with executives, founders and thought-leaders
working in the age of AI. Hosted in English, with a strongly European (notably
Spanish/Catalan) guest base.

| | |
|---|---|
| Domain | `leadinginaipodcast.com` (registered, DNS at Cloudflare) |
| YouTube | `@LeadinginAIPodcast` — channel ID `UCsfIEG1ZMrXGP2cLvxRUxWQ` |
| Spotify | show `2GXKeSmtIpy8WQhZmVaMLC` |
| Apple Podcasts | **launching** — assumed live before/around site launch, see §13 |
| Episodes published | 9 numbered episodes (May–Jul 2026) + ~6 short clips |
| YouTube subscribers | ~22 at time of writing |
| Status | Actively recording; more episodes coming |

This is an early-stage show. The website's job is **credibility and growth**: make the
back catalogue feel like a real body of work, make prospective guests want to say yes,
and convert visitors into subscribers. It is *not* a high-traffic archive problem.

### Episode inventory (as of 2026-09-23)

| # | Guest | Topic | YouTube ID | Published |
|---|---|---|---|---|
| 9 | Vuk Vegezzi | Visium's Approach to AI Transformation | `h3CkDDP0pwc` | 2026-07-24 |
| 8 | Joan Clotet | Keeping Humans at the Center of AI | `Gj--98r27mI` | 2026-07-15 |
| 7 | Gianmarco Mazzocchi | Shaping Public Policy with AI Economics | `JqKSe0dvNVo` | 2026-07-09 |
| 6 | Jordi Escayola | Deploying AI in Pharma — Lessons from the Field | `vI7TiSeDM-I` | 2026-06-25 |
| 5 | Ciara O'Buachalla | Responsible AI Starts with Governance | `7Yz8B91e1fY` | 2026-06-10 |
| 4 | Carlos Escapa | The Big Tech AI Blueprint | `t9zrVOMhVII` | 2026-06-03 |
| 3 | Jaume Portell | How AI Agents are Reshaping E-Commerce | `A1CKOvEykEU` | 2026-05-27 |
| 2 | Albert Esplugas | The Fifth Transformation Wave | `GlrmMj6YQnU` | 2026-05-20 |
| 1 | *(to be supplied)* | — | — | — |

Clips on YouTube not present in the Spotify feed: `LIrKx5aFeJI` (Is There Any
Intelligence in AI?), `cjLechMI2Rk` (AI Agents: Specialized Roles & Collaboration),
`kL5mIkrreMs`, `lvctz-KdxJQ`, `jNFMpmgWkjQ`, `HeoLCz5ENa8` (the "AI Strategy" /
"AI: The New Electricity" / "AI: The Next Big Wave" set).

---

## 2. Decisions already made

These came out of a requirements session with the owner. **Do not revisit without asking.**

| Decision | Choice | Consequence |
|---|---|---|
| **Design direction** | **Kinetic editorial** | 20VC's clarity + real motion design. Animated type, scroll-reveals, a draggable horizontal episode rail, card→page morph transitions, magnetic hover. Content stays king. **Not** WebGL/scroll-jacking. |
| **Reference site** | [thetwentyminutevc.com](https://www.thetwentyminutevc.com/) | Borrow the information architecture and editorial restraint; add the motion layer 20VC lacks. |
| **Publishing workflow** | **Auto-sync from YouTube + RSS** | A sync script pulls new episodes; owner optionally enriches with guest data. No manual episode entry. |
| **Who maintains it** | **Claude Code, via plain-English requests** | Optimise the repo for AI legibility: explicit conventions, small isolated components, a content layer that is obviously editable, a `docs/WORKFLOW.md` written for a future session. |
| **v1 features** | Email capture · guest & topic discovery · transcripts | Sponsorship and "be a guest" pages deferred to v2. |
| **Transcripts** | **Yes — auto-generated from YouTube captions** | Timestamped, deep-linkable, indexed for search and SEO. |
| **Clips** | **Attached to parent episodes** | Clips are *not* a top-level section. They surface as "Highlights" on the episode page. Requires a `parentEpisode` tag per clip. |
| **Brand** | **Keep current logo, refine in code** | Existing wordmark cleaned into proper SVG; palette and type system derived from existing artwork. No redesign. |
| **Site fronting** | **Show brand only** | "Leading in AI" is the entity. Host credited but not foregrounded. Supports adding co-hosts later. |
| **Agentic Edge** | **Removed entirely** | The brands have been separated. No mention, no logo, no link anywhere on the site. The existing thumbnail template also needs the Agentic Edge lockup removed (owner's task, outside this repo). |
| **Apple Podcasts** | **Assume launching** | Build the Apple listen slot as a first-class option everywhere, hidden while `listen.apple` is `null`. See §13. |
| **Hosting** | **Vercel**, DNS stays at Cloudflare | Free tier. CNAME from Cloudflare, proxy **off** (DNS-only) to avoid double-proxy and certificate issues. |

---

## 3. Tech stack

Chosen for: fast to build, easy for a future Claude Code session to modify safely,
free to run, and genuinely capable of the motion work.

```
Framework      Next.js 15 (App Router, React 19, TypeScript, strict)
Styling        Tailwind CSS v4 — @theme tokens, no config file
Motion         motion (v12, the Framer Motion successor) + lenis (smooth scroll)
Content        Local JSON + MDX in /content, generated by a committed sync script
Search         MiniSearch, prebuilt index at build time, client-side
Email          Beehiiv (free tier) via API route — see §10
Media          next/image; YouTube thumbnails remote, guest portraits local
Deploy         Vercel (free), DNS at Cloudflare
Analytics      Vercel Analytics (free) + Vercel Speed Insights
Lint/format    ESLint + Prettier + prettier-plugin-tailwindcss
```

### Why these, specifically

- **Next.js over Astro.** Astro would be marginally faster to ship for a static
  content site, but the interactive layer here is substantial (draggable rail,
  filterable archive, transcript player, search) and Next + React is where the
  motion ecosystem lives. It's also the stack a future AI session handles most
  reliably.
- **`motion` over GSAP.** GSAP is free now, but `motion` is React-idiomatic
  (`<motion.div>`, `useScroll`, `layoutId`) which makes the animation code
  declarative and local to the component. A future session editing one card's
  hover doesn't have to understand a global timeline. Use GSAP ScrollTrigger only
  if a specific effect genuinely needs it.
- **Local JSON content over a CMS.** The owner does not want to fill in forms, and
  the content is machine-derived. Committed JSON means builds are deterministic,
  history is in git, and Claude can edit content with the same tools it edits code.
- **`layoutId` for the card→page morph.** This is the signature transition from the
  chosen design direction and `motion` gives it almost for free via shared layout
  animations. Budget real time for making it feel right.

---

## 4. Information architecture

```
/                         Home
/episodes                 Archive — filterable, searchable
/episodes/[slug]          Episode page (player, chapters, transcript, highlights, guest)
/guests                   Guest directory
/guests/[slug]            Guest page — bio, links, their episode(s), their quotes
/topics/[slug]            Topic hub — all episodes tagged with a theme
/about                    The show, the host, how to listen, contact
/subscribe                Full-page newsletter signup (modal used elsewhere)

/api/subscribe            POST → Beehiiv
/rss.xml                  Site feed (blog-style, not the audio feed)
/sitemap.xml  /robots.txt
/og/[...slug]             Dynamic OG image generation (@vercel/og)
```

**Deferred to v2** (design for them, don't build): `/be-a-guest`, `/sponsor`
(media kit), `/clips` as a standalone section, Spanish localisation.

### Navigation

Header: `Episodes · Guests · About` + a persistent `Subscribe` button.
Keep it to three items plus the CTA. The 20VC "Load More" pattern is fine for
the archive; do not paginate with numbered pages.

---

## 5. Content model

Full schemas in [`docs/CONTENT-MODEL.md`](docs/CONTENT-MODEL.md). Summary:

```
content/
  episodes/
    009-vuk-vegezzi.json        ← generated by sync, enriched by hand
    009-vuk-vegezzi.mdx         ← optional: show notes, editorial intro
  guests/
    vuk-vegezzi.json            ← bio, role, company, links, headshot ref
  clips/
    lIrKx5aFeJI.json            ← includes parentEpisode
  transcripts/
    009-vuk-vegezzi.json        ← [{ start, end, speaker?, text }]
  topics.json                   ← canonical topic list with slugs + descriptions
  site.json                     ← show metadata, social links, host bio
public/
  guests/vuk-vegezzi.jpg        ← headshots, committed
```

Three principles that matter for maintainability:

1. **Generated fields and human fields live in the same file but are clearly
   separated.** Sync writes a `sync` block and never touches the `editorial` block.
   The sync script must be idempotent and must not clobber hand-written data.
2. **Guests are first-class, not strings on an episode.** This is what makes the
   guest directory and topic discovery possible, and it's the main thing that
   makes 9 episodes feel like a library.
3. **Topics are a closed vocabulary** in `topics.json`. Free-text tags rot. Start
   with: AI Strategy · Governance & Responsible AI · Agents · Enterprise
   Transformation · Public Policy · Healthcare & Pharma · E-Commerce · Human-Centred AI.

---

## 6. Data pipeline

This is the part that earns "modular — I can update it quickly." Read
[`docs/WORKFLOW.md`](docs/WORKFLOW.md) for the owner-facing version.

```
  YouTube Data API v3  ─┐
  (playlistItems)       │
                        ├──►  scripts/sync.ts  ──►  content/*.json  ──►  git commit  ──►  Vercel build
  Podcast RSS feed     ─┤                             (reviewed by a human)
  (Spotify, if avail.)  │
                        │
  YouTube captions     ─┘
```

### Key constraints discovered during research

- **The RSS feed is arriving, not present.** The show is not yet on Apple
  Podcasts and Spotify does not expose the underlying feed, so there is no public
  RSS URL *today*. The owner is launching on Apple Podcasts (§13), which requires
  submitting the audio host's feed — so a stable, public RSS URL **will** exist.
  Build the sync with a pluggable source interface: YouTube is the source of truth
  from day one, and the RSS source slots in behind the same interface the moment
  the URL exists, without rework. Do not block any phase on it.
- **The YouTube RSS feed (`/feeds/videos.xml?channel_id=…`) returns only the latest
  15 items.** It works today because the channel has ~15 videos, but it will
  silently start dropping the back catalogue. **Use the YouTube Data API v3 with an
  API key** (free, 10,000 units/day, far more than needed) as the primary source,
  and keep the RSS feed as a zero-config fallback.
- **Episode #1 is already outside the RSS window** and must be seeded manually or
  via the API.
- **Captions are the fragile link.** The unofficial `timedtext` endpoint breaks
  regularly. Plan for a two-tier approach:
  1. *Preferred:* one-time OAuth as the channel owner → `captions.download` from
     the YouTube Data API. Legitimate and reliable, since the owner owns the channel.
  2. *Fallback:* the owner downloads the `.srt` from YouTube Studio and drops it
     in `content/transcripts/_inbox/`; the sync script converts and files it.
  Build tier 2 first — it always works and unblocks everything. Add tier 1 after.

### Sync script requirements

`scripts/sync.ts`, run with `npm run sync`:

- Fetches the channel's uploads playlist; classifies each video as **episode**
  (title matches `/^#(\d+)\s*[-–]/`) or **clip** (everything else).
- For a new episode: creates `content/episodes/NNN-slug.json` with the `sync` block
  populated and the `editorial` block stubbed with `TODO` markers.
- For an existing episode: updates only the `sync` block. Never overwrites
  `editorial`. Diff-friendly output — stable key order, 2-space indent, trailing newline.
- For clips: creates the clip file with `parentEpisode: null` and prints a warning
  listing clips that still need to be linked to an episode.
- Pulls transcripts for any episode missing one.
- Ends with a **summary report** to stdout: what was added, what needs human input.
  This report is what a future Claude Code session reads to know what to do next.
- Exit non-zero if a network source fails, so it's obvious when a sync was partial.

Run it manually (`npm run sync`) or on a schedule via a GitHub Action that opens a
PR. Do **not** sync at request time — builds must be deterministic and offline-safe.

---

## 7. Design direction

Full token set and motion spec in [`docs/BRAND.md`](docs/BRAND.md). The essentials:

**Dark-first.** The existing thumbnails are black-ground with cyan accents; the
site should be a continuation of that, not a contrast to it. Light mode is not
required for v1 — but define colours as tokens so it stays possible.

| Token | Value | Role |
|---|---|---|
| `--ground` | `#000000` | Page background |
| `--surface` | `#0B0E14` | Cards, raised panels |
| `--navy` | `#1A2342` | Depth, gradient origin, borders |
| `--cyan` | `#00D9E0` | Primary accent, links, focus rings |
| `--teal` | `#0D9CAC` | Secondary accent, title blocks (matches thumbnails) |
| `--ink` | `#FFFFFF` | Primary text |
| `--ink-dim` | `#8A93A6` | Metadata, captions |

**Type system** — three roles, all free, all on Google Fonts:

- **Display: Archivo** (variable, use the Expanded width axis at large sizes).
  Wide, confident, uppercase — closest free match to the wordmark's character.
- **Body: Inter.** Matches the existing thumbnail typography.
- **Metadata: JetBrains Mono.** Episode numbers, timestamps, durations, tags.
  This is what gives the site its technical texture and keeps it from reading
  like a generic business podcast.

**The signature moves** (these are what "super interactive" means here):

1. Hero wordmark with a **stagger-fade + clip-reveal** on load.
2. A **draggable / scroll-linked horizontal episode rail** on the home page,
   with inertia. Keyboard and touch accessible.
3. **Card → page morph**: clicking an episode card animates the card into the
   episode page hero via a shared `layoutId`.
4. **Magnetic hover** on primary CTAs and nav items — subtle, ~8px max displacement.
5. **Scroll-reveal** on section entry: translate-y + opacity, staggered by child.
6. **Live waveform / chapter scrubber** on the episode page (the transcript makes
   this possible — chapters deep-link to timestamps).
7. **Filter transitions** in the archive: cards reflow with `layout` animation
   rather than snapping.

**Hard rule:** every one of these must be gated behind `prefers-reduced-motion`
and must degrade to a static, fully usable page. Motion is the finish, not the
structure.

---

## 8. Page specifications

### `/` Home
1. **Hero** — wordmark, one-line positioning, latest episode as a large featured card.
2. **Episode rail** — draggable horizontal strip of recent episodes.
3. **Guests strip** — portrait grid of everyone who's been on. At 9 guests this is
   a strong credibility signal; it's the section that makes the show look established.
4. **Topics** — the closed topic vocabulary as large clickable type, each linking
   to its hub.
5. **Newsletter** — full-bleed, high-contrast, single field.
6. **Listen on** — YouTube / Spotify / Apple (once listed).

### `/episodes` Archive
Filter bar (topic · guest · season) + search input, reflowing card grid,
"Load More". Filter state lives in the URL query string so filtered views are
shareable and indexable.

### `/episodes/[slug]` Episode
Hero (number, title, guest, duration, date) → embedded player (YouTube primary,
Spotify secondary) → chapter list with timestamp deep-links → key quotes →
**Highlights** (the clips attached to this episode) → full transcript, collapsible,
timestamps clickable → guest card → prev/next episode.

### `/guests` + `/guests/[slug]`
Directory with filter by company/industry. Individual page: portrait, bio, role,
company, LinkedIn/X, their episode(s), their pull-quotes, related guests by
shared topic.

### `/topics/[slug]`
A short editorial description of the theme, then every episode tagged with it.
These pages are cheap to build and are the main long-tail SEO surface.

### `/about`
What the show is, who it's for, the host, how to listen, how to get in touch.
Keep a `mailto:` or a simple form — no CRM in v1.

---

## 9. Component inventory

Build these as isolated, single-purpose components. A future session should be
able to change one without reading the rest.

```
layout/       Header  Footer  Container  Section  PageTransition
episode/      EpisodeCard  EpisodeRail  EpisodeHero  EpisodeGrid
              ChapterList  TranscriptViewer  QuoteBlock  HighlightClip
              PlayerEmbed  ListenOnLinks
guest/        GuestCard  GuestGrid  GuestBio  GuestAvatar
discovery/    FilterBar  TopicPill  SearchInput  SearchResults  EmptyState
motion/       Reveal  StaggerGroup  MagneticButton  MarqueeText  SmoothScroll
ui/           Button  Tag  Badge  Skeleton  Modal  Toast
forms/        SubscribeForm  SubscribeModal  SubscribeInline
```

---

## 10. Email capture

**Beehiiv free tier** (up to 2,500 subscribers, no cost, good deliverability,
built-in landing pages if ever needed). Alternatives considered: ConvertKit free
tier is also fine; Substack is not, because it would compete with the site for
the brand.

Implementation: a `SubscribeForm` component posting to `/api/subscribe`, which
calls the Beehiiv API server-side with the key in an env var. Never call the
provider from the client. Handle: success, already-subscribed, invalid email,
provider-down — all four states visible in the UI.

Three placements: inline section on the home page, a modal triggered from the
header CTA, and a full `/subscribe` page for direct linking.

---

## 11. SEO, metadata, performance

- **Per-page metadata** via the App Router `generateMetadata` export. Every episode
  and guest page gets a unique title and description.
- **Structured data**: `PodcastSeries` on the home page, `PodcastEpisode` on each
  episode page, `Person` on guest pages. This is how episodes surface in Google's
  podcast results.
- **Dynamic OG images** via `@vercel/og` — episode number, title, guest name,
  guest portrait, on the black/cyan brand ground. Every share looks designed.
- **Transcripts are the SEO engine.** Nine episodes of full-text conversation is
  far more indexable content than nine episode descriptions. Render them server-side
  as real HTML, not lazily fetched.
- **Budgets**: LCP < 2.0s, CLS < 0.05, initial JS < 150KB gzipped excluding the
  motion library. Lazy-load the player embeds behind a click-to-load poster —
  never let a YouTube iframe into the initial load.

---

## 12. Accessibility

Not optional, and cheap if done from the start:

- All motion gated behind `prefers-reduced-motion: reduce`.
- The draggable rail must be operable with keyboard (arrow keys) and expose
  scroll buttons; drag is an enhancement.
- Focus rings in `--cyan` on the black ground — high contrast by default.
- Verify text contrast: `--ink-dim` on `--ground` needs checking; lighten if it
  fails 4.5:1.
- Transcript timestamps are `<button>`s, not divs.
- Semantic landmarks, skip link, real heading hierarchy.

---

## 13. Apple Podcasts (assumed launching)

**Assumption, confirmed by the owner: the show will launch on Apple Podcasts.**
Build for it as a given rather than a maybe.

The show is currently on YouTube and Spotify only. Apple is still the
second-largest podcast platform and the source most other directories
(Overcast, Pocket Casts, Castro, Podcast Index) index from — so one submission
cascades into broad distribution.

What the build should assume:

- **An Apple Podcasts link is a first-class listen option**, alongside YouTube and
  Spotify, everywhere listen links appear: home hero, episode pages, About, footer.
  Design the `ListenOnLinks` component for **three** platforms, not two-plus-a-maybe.
- **`content/site.json` → `listen.apple` stays `null` until the URL exists**, and
  the component renders only non-null entries. So the slot is built, styled and
  laid out now; it lights up the day the owner pastes the URL in. No code change,
  no redesign, no reflow surprise.
- **A public RSS URL will exist** as a side effect of submission — Apple requires
  it. That unlocks the RSS sync source described in §6 and is the more robust
  long-term feed for episode metadata (accurate durations, real audio publish dates,
  episode descriptions authored for audio rather than YouTube).
- **`PodcastSeries` structured data should carry the Apple URL** in `sameAs` once
  known, alongside the Spotify and YouTube URLs.
- Add an **Apple Podcasts subscribe CTA** to the same set as YouTube/Spotify in
  the footer and on `/about`.

Owner-side steps (outside this repo): retrieve the RSS feed URL from the audio
host, submit at [podcastsconnect.apple.com](https://podcastsconnect.apple.com),
wait for review (typically a few days), then paste both the Apple show URL and the
RSS URL into `content/site.json`. Worth submitting to Podcast Index at the same
time — it is what most third-party apps read from.

---

## 14. Open inputs needed from Pedro

The build can start without these, but each one blocks a specific piece:

| # | Input | Blocks |
|---|---|---|
| 1 | **RSS feed URL** from the audio host's dashboard (Spotify for Creators → Settings, or wherever the audio is hosted) | Apple Podcasts submission; RSS sync source (§6). Needed for the Apple launch, not for the site build |
| 1b | **Apple Podcasts show URL**, once the submission is approved | Lights up the already-built Apple listen slot (§13) — paste into `content/site.json`, no code change |
| 2 | **Episode #1** — guest, title, YouTube ID, date | Complete archive |
| 3 | **Guest headshots** (square, ≥800px) for all 9 guests | Guest directory, OG images |
| 4 | **Guest bios + roles + company + LinkedIn** | Guest pages |
| 5 | **Host bio + photo** | About page |
| 6 | **Chapter timestamps** per episode, if they exist (YouTube chapters count) | Chapter list; otherwise derive from transcript |
| 7 | **Logo as SVG or vector** — if only the JPG exists, it gets traced | Crisp wordmark at all sizes |
| 8 | **Beehiiv account** + API key | Newsletter |
| 9 | **Vercel account** connected to the GitHub repo | Deploy |
| 10 | **YouTube Data API key** (Google Cloud console, free) | Reliable sync |
| 11 | **Target launch date**, if there is one | Phase scheduling |

---

## 15. Build phases

Sized in Claude Code sessions, not calendar days. Each phase ends somewhere
shippable — no phase leaves the repo broken.

### Phase 0 — Scaffold
Next.js 15 + TS + Tailwind v4, ESLint/Prettier, folder structure, `docs/` in place,
Vercel project connected, `leadinginaipodcast.com` pointed (Cloudflare CNAME,
DNS-only). **Ships:** a deployed "coming soon" page on the real domain.

### Phase 1 — Brand foundations
Colour and type tokens in `@theme`, fonts loaded, logo cleaned to SVG, `Button`/
`Tag`/`Container`/`Section` primitives, header and footer, dark ground.
**Ships:** an empty but unmistakably on-brand shell.

### Phase 2 — Content pipeline
`content/` schemas, `scripts/sync.ts`, seed the 9 episodes + 6 clips + 9 guests +
topic vocabulary. Transcript ingestion via the SRT-inbox fallback.
**Ships:** all content in the repo, typed and validated. *No UI yet.*

### Phase 3 — Core pages, static
`/`, `/episodes`, `/episodes/[slug]`, `/guests`, `/guests/[slug]`, `/topics/[slug]`,
`/about`. Correct, responsive, accessible — and deliberately motionless.
**Ships:** a complete, working website. This is the real milestone.

### Phase 4 — The motion layer
Lenis smooth scroll, `Reveal`/`StaggerGroup`, hero animation, draggable episode
rail, card→page morph, magnetic CTAs, page transitions, reduced-motion pass.
**Ships:** the kinetic editorial feel. Iterate here — this is where taste is spent.

### Phase 5 — Discovery
Filter bar with URL state, MiniSearch index across titles/guests/topics/transcripts,
search UI, animated filter reflow, empty states.
**Ships:** the archive becomes a library.

### Phase 6 — Transcripts & player
`TranscriptViewer` with timestamp deep-links, chapter scrubber, quote extraction
and share, highlight clips on episode pages, click-to-load player embeds.
**Ships:** the site becomes the best place to consume the show.

### Phase 7 — Growth plumbing
Beehiiv integration, subscribe modal/inline/page, dynamic OG images, structured
data (`PodcastSeries` with `sameAs` covering YouTube, Spotify and Apple),
sitemap, robots, analytics. `ListenOnLinks` built for three platforms with the
Apple entry rendering conditionally.
**Ships:** the site can actually grow the audience.

### Phase 8 — Launch pass
Lighthouse and Core Web Vitals against the budgets, axe accessibility audit,
cross-browser check, 404/500 pages, favicon set, `docs/WORKFLOW.md` verified by
running through it end to end.
**Ships:** launch.

**Suggested order change if time is short:** Phases 0–3 plus 7 give a complete,
credible, growing site. Phases 4–6 are what make it *the* site. Do not skip 4
entirely — the motion layer is the stated reason for the project.

---

## 16. Risks

| Risk | Mitigation |
|---|---|
| YouTube caption scraping breaks | SRT-inbox fallback built first; automation is the enhancement |
| Apple submission is delayed or rejected | Site ships regardless — the Apple slot renders only when `listen.apple` is non-null; YouTube remains a sufficient sync source |
| Motion work expands without limit | Phase 3 ships a complete site first; motion is additive and time-boxed |
| 9 episodes looks sparse | Guest grid, topic hubs and transcripts multiply the apparent surface area — this is deliberate |
| Owner can't modify it later | `docs/WORKFLOW.md` is a deliverable, not an afterthought; verified in Phase 8 |
| Cloudflare proxy breaks Vercel SSL | DNS-only (grey cloud), documented in Phase 0 |
