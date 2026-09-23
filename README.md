# Leading in AI — Website

The website for the **Leading in AI Podcast** — conversations with executives,
founders and thought-leaders working in the age of AI.

🔗 [leadinginaipodcast.com](https://leadinginaipodcast.com) ·
[YouTube](https://www.youtube.com/@LeadinginAIPodcast) ·
[Spotify](https://open.spotify.com/show/2GXKeSmtIpy8WQhZmVaMLC)

> **Status: v1 built (phases 0–7 of the plan), awaiting owner inputs and deploy.**
> Start with [`PLAN.md`](PLAN.md). If you are a Claude Code session, read [`CLAUDE.md`](CLAUDE.md).

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in what you have; everything is optional locally
npm run dev                  # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm run sync` | Pull new episodes, clips and transcripts from YouTube into `content/` and print a report |
| `npm run validate` | Validate every content file (runs automatically before `build`) |
| `npm run build` | Production build. Fails loudly on broken content |
| `npm run lint` / `typecheck` / `format` | The usual |

## Stack

Next.js 16 (App Router, React 19, TypeScript strict) · Tailwind CSS v4 · `motion` + `lenis` ·
local JSON content validated with Zod · MiniSearch · Beehiiv via an API route · Vercel.

## Deploy

1. **Vercel**: import the GitHub repo, framework preset *Next.js*, no build overrides.
   Add environment variables from `.env.example` (`BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID`,
   `NEXT_PUBLIC_SITE_URL=https://leadinginaipodcast.com`).
2. **Domain**: in Vercel add `leadinginaipodcast.com` and `www.leadinginaipodcast.com`.
   In Cloudflare DNS create the records Vercel shows (`A` for the apex, `CNAME` for `www`)
   with the proxy **off** (grey cloud, DNS-only) so Vercel can issue certificates.
3. **GitHub secrets**: `YOUTUBE_API_KEY` for the scheduled sync workflow.

## Content workflow

See [`docs/WORKFLOW.md`](docs/WORKFLOW.md). In short: publish on YouTube with the
`#N - Guest: Title` format, run `npm run sync`, fill the `editorial` block, commit.

## Documents

| | |
|---|---|
| [`PLAN.md`](PLAN.md) | The full development plan — decisions, stack, architecture, phases |
| [`docs/BRAND.md`](docs/BRAND.md) | Colour, type, layout and the motion specification |
| [`docs/CONTENT-MODEL.md`](docs/CONTENT-MODEL.md) | Content schemas for episodes, guests, clips, transcripts |
| [`docs/WORKFLOW.md`](docs/WORKFLOW.md) | How to publish a new episode in five minutes |
