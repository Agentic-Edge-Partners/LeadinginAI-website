---
name: publish-episode
description: Publish a new Leading in AI episode end to end — sync it from YouTube, write the editorial block, complete the guest, cut out the headshot, generate the YouTube thumbnail, validate, commit, push and redeploy to Vercel. Use when Pedro says a new episode is out, asks to sync the podcast, add a guest, regenerate or fix a thumbnail, or redeploy the site.
---

# Publish an episode

You are the developer for this repo. Read `CLAUDE.md` and `docs/WORKFLOW.md` first if
you haven't this session. Work through every step; stop only where the step says a
human input is needed, and say exactly what is missing.

## 0. Preconditions

- YouTube title format is `#N - Guest Name: Episode Title`. Anything else is filed as a clip.
- `.env.local` may hold `YOUTUBE_API_KEY` (durations, full back catalogue). Without it the
  sync uses the RSS fallback (latest 15 videos, no durations). Both are fine.
- The Vercel project is linked locally (`.vercel/project.json`). If it is missing:
  `npx vercel link --yes --project leadinginai-website`.

## 1. Sync

```bash
npm run sync
```

Read the report. It names the new episode slug (`NNN-guest-name`), any guest stub it
created, clips without a parent, and episodes without transcripts.

## 2. Editorial block — `content/episodes/<slug>.json`

Never edit the `sync` block. Fill `editorial`:

- `summary`: one paragraph for the website, rewritten from `sync.youtubeDescription`
  (facts only, third person, no "Agentic Edge" anywhere).
- `hook`: one line, ≤ 90 characters, for cards and OG images.
- `topics`: slugs from `content/topics.json` only (2–3 is typical).
- `guests`: the slug the sync set; keep it.
- `links`: the guest's company site if it is known.
- `thumbnail.title`: the thumbnail text, see §4 for the format.
- `chapters` / `quotes`: only if timestamps or a transcript exist.
- `featured`: `true` on the newest episode, `false` on the previous featured one.

## 3. Guest — `content/guests/<slug>.json`

The sync creates a stub with `TODO` fields; the build refuses to ship them. Fill from
the YouTube description's bio paragraph and its `Connect with …` LinkedIn line:
`role`, `company` (null if not named), `industry` (short, e.g. "Pharma"), `location`
(null if not stated), `bio` (2–3 sentences, third person), `links.linkedin`.

**Headshot — needs a human input.** Ask Pedro for a photo of the guest, ideally
≥ 1200px tall, facing the camera, chest-up. Then:

```bash
npm run headshot -- <guest-slug> /path/to/photo.jpg
```

That writes `artwork/guests/<slug>.png` (transparent cutout, used by the thumbnail) and
`public/guests/<slug>.jpg` (square, used by the site) and sets `headshot` in the guest
JSON. Until it runs, the site shows an initials avatar and the thumbnail has no photo,
so do not consider the episode finished without it.

## 4. Thumbnail

Format of `editorial.thumbnail.title`: a short mixed-case phrase of 3–6 words with the
punch word or phrase in `*asterisks*`. The asterisked part renders large in white; the
words before and after render slightly smaller in cyan. Punctuation directly after the
asterisked part stays attached to it. Examples that match the approved set:

- `Scaling AI *beyond* the pilot`
- `Thirty *agents*, two founders`
- `*Governance* comes first`
- `The *Big Tech* AI playbook`

Then:

```bash
npm run artwork thumbnails
```

Open `artwork/thumbnails/<slug>.jpg` (Read the file) and check: photo on the left with
headroom, three text tiers filling the right column, name line on one line, nothing
overlapping. If a line wraps badly, shorten the title rather than touching the template.
The template (`scripts/artwork.tsx`) is approved; do not restyle it without being asked.

Tell Pedro to upload the JPG in YouTube Studio as the custom thumbnail.

## 5. Clips and transcript

- New clips: set `editorial.parentEpisode` in `content/clips/<id>.json` when it is clear
  which episode they belong to; otherwise leave `null` and say so.
- Transcript: if Pedro dropped an `.srt`/`.vtt` in `content/transcripts/_inbox/` named
  after the slug, `npm run sync` files it. Otherwise ask for it; the episode page works
  without one.

## 6. Verify

```bash
npm run validate && npm run lint && npm run typecheck && npm run build
```

All four must pass. `validate` names the file and field for anything still wrong.

## 7. Ship

```bash
git add -A
git commit -m "Add episode N: Guest Name"
git push
npx vercel deploy --prod --yes
```

Smoke-test the production URL afterwards (home, `/episodes/<slug>`, `/guests/<slug>`
all return 200). The production URL is `https://leadinginai-website.vercel.app` until
the custom domain is live; then `https://leadinginaipodcast.com`.

## 8. Report

End with: what is live (with the episode URL), the thumbnail path to upload, and a
short list of anything still missing (photo, transcript, unlinked clips).

## Related one-offs

- Regenerate every thumbnail after a title edit: `npm run artwork thumbnails`.
- Channel banner: `npm run artwork banner` → `artwork/youtube-banner.jpg`.
- Redeploy without changes: `npx vercel deploy --prod --yes`.
