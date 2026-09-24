# Publishing Workflow

**Who this is for:** Pedro, and any Claude Code session helping him.
This is the document that makes the site "modular enough to edit quickly."

If you are a Claude Code session reading this: this file is the contract. If a
step here doesn't work, fix the tooling rather than working around it by hand —
the whole point is that this stays a five-minute job forever.

---

## Publishing a new episode

**Time budget: ~5 minutes.** Anything longer means something needs fixing.

### 1. Publish on YouTube and Spotify as usual
Title the YouTube video in the established format — this is what the sync
script parses:

```
#10 - Guest Name: Episode Title
```

The `#N - ` prefix is what distinguishes an episode from a clip. Get it wrong and
the episode is filed as a clip.

### 2. Run the sync

```bash
npm run sync
```

This fetches the channel, finds anything new, and writes content files. It prints
a report at the end. Read it — it tells you exactly what still needs a human.

```
✔ Added episode 010-maria-santos
✔ Fetched transcript (youtube-auto, 412 cues)
⚠ 010-maria-santos: editorial.summary is TODO
⚠ 010-maria-santos: editorial.topics is empty
⚠ Guest "maria-santos" does not exist — create content/guests/maria-santos.json
⚠ Clip xYz123abc has no parentEpisode
```

### 3. Fill in the editorial bits

Open `content/episodes/010-maria-santos.json` and fill the `editorial` block:
`summary`, `hook`, `topics`, `chapters`, `quotes`. Leave the `sync` block alone —
it gets overwritten every time.

**Or just ask Claude:**
> "Sync the podcast and write the editorial block for the new episode. Pull the
> chapters from the YouTube description and pick two or three good pull-quotes
> from the transcript."

### 4. If the guest is new
The sync already created a stub `content/guests/maria-santos.json` with `TODO`
fields. Fill in role, company, industry, bio and LinkedIn, and drop a square
headshot at `public/guests/maria-santos.jpg` (≥800×800), then set
`"headshot": "/guests/maria-santos.jpg"`. Until a headshot exists the site shows
an initials avatar.

**Or:** > "Add a guest file for Maria Santos, CTO at Acme. Here's her LinkedIn: …"

### 5. Link any clips
Set `editorial.parentEpisode` on each new clip file. Clips with no parent don't
appear anywhere on the site.

### 6. Check it, then ship

```bash
npm run validate # names every file and field that still needs attention
npm run dev      # look at localhost:3000
npm run build    # catches schema errors and broken links
git add -A && git commit -m "Add episode 10: Maria Santos" && git push
```

Vercel deploys automatically. Live in about a minute.

---

## If transcripts don't come through automatically

YouTube's caption endpoint is unofficial and occasionally stops working. The
fallback always works:

1. YouTube Studio → the video → Subtitles → download the `.srt` (or `.vtt`)
2. Drop it in `content/transcripts/_inbox/` named after the episode slug:
   `010-maria-santos.srt`
3. `npm run sync` — it converts, merges cues into readable sentences, and files it
   as `content/transcripts/010-maria-santos.json`. The original moves to
   `_inbox/_processed/` (ignored by git).

The automatic route needs a one-time OAuth token for the channel owner in
`YOUTUBE_OAUTH_TOKEN` (scope `youtube.force-ssl`). With it, the sync downloads
captions through the official API for every episode without a transcript.

---

## Artwork: thumbnails, banner, headshots

Artwork is generated from the same content the site uses, so nothing needs a
design tool.

```bash
npm run headshot -- 010-maria-santos maria.jpg   # → cutout + square headshot + guest JSON updated
npm run artwork thumbnails                        # → artwork/thumbnails/<slug>.jpg (1280×720)
npm run artwork banner                            # → artwork/youtube-banner.jpg (2560×1440)
```

- **Headshot input:** any photo, ideally ≥1200px tall, guest facing the camera,
  chest-up. The cutout uses macOS's built-in subject segmentation (no Adobe, no
  upload). It writes `artwork/guests/<slug>.png` (transparent, used by thumbnails)
  and `public/guests/<slug>.jpg` (square, used by the site).
- **Thumbnail title:** set `editorial.thumbnail.title` on the episode — three to
  five words, `*asterisks*` around the word to colour cyan. Example:
  `"Scaling AI *beyond* the pilot"`. Falls back to the episode title.
- Upload the JPG to YouTube Studio as the custom thumbnail. Keep the YouTube
  title in the `#N - Guest: Title` format; the thumbnail carries the hook.
- The banner's safe area (what every device shows) is the centred 1546×423 box;
  `artwork/youtube-banner-guide.jpg` outlines it.

The current eight cutouts were recovered from the old thumbnails, so they are
low-resolution. Re-run `npm run headshot` with the original photos when you have
them and the thumbnails and site update together.

---

## Common edits

| What you want | How |
|---|---|
| Change the homepage tagline | `content/site.json` → `tagline` |
| Add a social link | `content/site.json` → `social` |
| Add the Apple Podcasts link | `content/site.json` → `listen.apple` — paste the show URL once Apple approves. The button is already built and laid out; it appears everywhere listen links show. Add the feed URL to `listen.rss` at the same time. |
| Feature a different episode on the home page | Set `editorial.featured: true` on it, `false` on the old one |
| Add a new topic | Add it to `content/topics.json` *first*, then tag episodes with the slug |
| Fix a typo in a guest bio | `content/guests/<slug>.json` |
| Change the newsletter headline | `content/site.json` → `newsletter` |
| Change brand colours | `app/globals.css` → the `@theme` block |
| Add long-form show notes | Create `content/episodes/<slug>.md` (Markdown: headings, paragraphs, lists, links). A "Show notes" section appears automatically |
| Attach a chapter list | `editorial.chapters` on the episode: `[{ "start": 252, "title": "…" }]` in seconds |
| Add a pull-quote | `editorial.quotes`: `{ "text", "speaker": "<guest-slug>", "timestamp": 724 }` |

Rule of thumb: **if it's words or content, it's in `/content`.** If you find
yourself editing a `.tsx` file to change text, that text is in the wrong place —
ask Claude to move it into `/content`.

---

## Things that will break the build (deliberately)

The build fails loudly rather than shipping something broken:

- An episode tagged with a topic slug that isn't in `topics.json`
- An episode referencing a guest slug with no guest file
- A guest with a `headshot` path that doesn't exist in `/public`
- Malformed JSON, or a file that doesn't match its schema
- Two episodes with the same `number`
- An episode whose `editorial.summary` or `hook` is still `TODO`, or a guest file
  with `TODO` fields (the sync creates these stubs; the build refuses to ship them)

The error message names the file and the field. Read it, fix it, rebuild.

---

## Asking Claude for changes

The repo is built to be modified by a Claude Code session. Useful framings:

> "Read PLAN.md and docs/ first, then …"

- "Sync the podcast and prepare the new episode, then tell me what's still missing."
- "The guest grid on the homepage should show 12 instead of 8."
- "Make the episode rail auto-scroll slowly when it's not being dragged."
- "Add a Spanish version of the About page."
- "Extract three shareable quotes from episode 7's transcript and add them."

Things worth saying explicitly when you ask:
- Whether it should be committed and deployed, or just shown locally first
- Whether a change is for one page or site-wide
