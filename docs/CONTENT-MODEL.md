# Content Model

All content lives as typed JSON (plus optional MDX for editorial prose) under
`/content`, committed to git. There is no CMS and no runtime database.

**The central rule:** every file has a `sync` block that the sync script owns and
overwrites, and an `editorial` block that only humans (and Claude, on request)
touch. The sync script must never write inside `editorial`. This is what makes
"auto-sync" and "hand-curated" coexist without one destroying the other.

Validate every file against a Zod schema at build time. A malformed content file
should fail the build loudly, not render a broken page.

---

## Episode

`content/episodes/009-vuk-vegezzi.json`

```jsonc
{
  "schema": "episode/1",
  "slug": "009-vuk-vegezzi",
  "number": 9,
  "season": 1,

  // ─── Owned by scripts/sync.ts. Overwritten on every sync. ───
  "sync": {
    "title": "Visium's Approach to AI Transformation",
    "rawTitle": "#9 - Vuk Vegezzi: Visium's Approach to AI Transformation",
    "publishedAt": "2026-07-24",
    "youtubeId": "h3CkDDP0pwc",
    "spotifyEpisodeId": null,
    "durationSeconds": 2892,
    "youtubeDescription": "…",
    "thumbnailUrl": "https://i.ytimg.com/vi/h3CkDDP0pwc/maxresdefault.jpg",
    "lastSyncedAt": "2026-09-23T10:00:00Z"
  },

  // ─── Owned by humans. Never touched by sync. ───
  "editorial": {
    "guests": ["vuk-vegezzi"],
    "topics": ["enterprise-transformation", "ai-strategy"],
    "summary": "One-paragraph editorial summary, written for the website rather than lifted from the YouTube description.",
    "hook": "Short punchy line for cards and OG images. ≤90 chars.",
    "featured": false,
    "chapters": [
      { "start": 0,    "title": "Introduction" },
      { "start": 252,  "title": "Why most AI pilots stall" },
      { "start": 1180, "title": "Building the data layer" },
      { "start": 1985, "title": "What 2027 looks like" }
    ],
    "quotes": [
      {
        "text": "Most companies buy models when what they needed was a process.",
        "speaker": "vuk-vegezzi",
        "timestamp": 724
      }
    ],
    "links": [
      { "label": "Visium", "url": "https://visium.ch" }
    ]
  }
}
```

Optional sibling `content/episodes/009-vuk-vegezzi.mdx` for long-form show notes.
If present, it renders in a "Show notes" section. If absent, that section is omitted.

**Slug rule:** `NNN-guest-name-slug`, zero-padded to 3 digits. Sorts correctly in
a file listing, which matters when a human or an AI is scanning the directory.

---

## Guest

`content/guests/vuk-vegezzi.json`

```jsonc
{
  "schema": "guest/1",
  "slug": "vuk-vegezzi",
  "name": "Vuk Vegezzi",
  "role": "…",                          // job title at time of recording
  "company": "Visium",
  "companyUrl": "https://visium.ch",
  "industry": "Consulting",             // used for directory filtering
  "location": "Switzerland",
  "bio": "Two to three sentences, third person, written for the site.",
  "headshot": "/guests/vuk-vegezzi.jpg", // square, ≥800px, committed to /public
  "links": {
    "linkedin": "https://linkedin.com/in/…",
    "x": null,
    "website": null
  },
  "episodes": ["009-vuk-vegezzi"]        // derived at build time; do not hand-edit
}
```

Guests are first-class entities, not strings on an episode. This is what enables
the guest directory, "related guests by shared topic", and the credibility grid on
the home page — the features that make nine episodes read as a body of work.

---

## Clip

`content/clips/LIrKx5aFeJI.json`

```jsonc
{
  "schema": "clip/1",
  "youtubeId": "LIrKx5aFeJI",
  "sync": {
    "title": "Is There Any Intelligence in AI?",
    "publishedAt": "2026-06-16",
    "durationSeconds": 58,
    "thumbnailUrl": "https://i.ytimg.com/vi/LIrKx5aFeJI/maxresdefault.jpg",
    "lastSyncedAt": "2026-09-23T10:00:00Z"
  },
  "editorial": {
    "parentEpisode": "006-jordi-escayola",  // null until a human links it
    "sourceTimestamp": 1420,                 // optional: where in the episode
    "caption": "Optional one-liner"
  }
}
```

Clips have **no page of their own**. They render as "Highlights" on their parent
episode page. A clip with `parentEpisode: null` renders nowhere and is reported
by the sync script as needing attention.

Known clips to link: `LIrKx5aFeJI`, `cjLechMI2Rk`, `kL5mIkrreMs`, `lvctz-KdxJQ`,
`jNFMpmgWkjQ`, `HeoLCz5ENa8`.

---

## Transcript

`content/transcripts/009-vuk-vegezzi.json`

```jsonc
{
  "schema": "transcript/1",
  "episode": "009-vuk-vegezzi",
  "source": "youtube-auto",    // "youtube-auto" | "youtube-manual" | "srt-upload" | "whisper"
  "language": "en",
  "generatedAt": "2026-09-23T10:00:00Z",
  "cues": [
    { "start": 0.0,  "end": 4.2,  "speaker": null, "text": "Welcome to Leading in AI." },
    { "start": 4.2,  "end": 9.8,  "speaker": null, "text": "Today I'm joined by Vuk Vegezzi." }
  ]
}
```

`speaker` stays `null` for YouTube auto-captions (they carry no diarisation). Keep
the field so a future upgrade to proper transcription slots in without a migration.

**Cue merging:** YouTube captions arrive as ~2-second fragments, which read
terribly. The ingest step must merge cues into sentence- or paragraph-level blocks
(merge until a sentence-ending punctuation mark or ~25 words) while preserving the
`start` of the first fragment. Render paragraphs; keep the timestamps clickable.

---

## Topics

`content/topics.json` — a **closed vocabulary**. Free-text tags rot; a fixed list
stays coherent and gives every topic a real page worth indexing.

```jsonc
[
  { "slug": "ai-strategy",               "name": "AI Strategy",                "description": "…" },
  { "slug": "governance",                "name": "Governance & Responsible AI", "description": "…" },
  { "slug": "agents",                    "name": "AI Agents",                   "description": "…" },
  { "slug": "enterprise-transformation", "name": "Enterprise Transformation",   "description": "…" },
  { "slug": "public-policy",             "name": "Public Policy & Economics",   "description": "…" },
  { "slug": "healthcare-pharma",         "name": "Healthcare & Pharma",         "description": "…" },
  { "slug": "ecommerce",                 "name": "E-Commerce",                  "description": "…" },
  { "slug": "human-centred-ai",          "name": "Human-Centred AI",            "description": "…" }
]
```

Adding a topic is a deliberate act: add it here, write its description, then tag
episodes. An episode referencing an unknown topic slug fails the build.

---

## Site

`content/site.json` — everything that would otherwise be hardcoded in a component.

```jsonc
{
  "name": "Leading in AI",
  "tagline": "Conversations with the people leading in the age of AI.",
  "description": "Executives, founders and thought-leaders discuss their work, share their perspectives, and explore where AI is going.",
  "url": "https://leadinginaipodcast.com",
  "host": {
    "name": "…",
    "bio": "…",
    "photo": "/host.jpg",
    "linkedin": "…"
  },
  "listen": {
    "youtube": "https://www.youtube.com/@LeadinginAIPodcast",
    "spotify": "https://open.spotify.com/show/2GXKeSmtIpy8WQhZmVaMLC",
    "apple": null,          // Apple launch is assumed (PLAN.md §13). Slot is built
                            // and styled; renders only when non-null. Paste the
                            // show URL here when the submission is approved.
    "rss": null             // arrives with the Apple submission; enables the RSS sync source
  },
  "social": {
    "linkedin": "…",
    "x": null,
    "instagram": null
  },
  "contact": "hello@leadinginaipodcast.com",
  "newsletter": {
    "provider": "beehiiv",
    "headline": "…",
    "subheadline": "…"
  }
}
```

Anything a future session might be asked to "just change the text of" belongs
here, not in JSX.

---

## Derived indexes

Built at compile time from the above — never hand-written, never committed:

- `guest.episodes[]` — back-reference from episodes
- Topic → episodes mapping
- Episode → clips mapping
- Related guests (shared topics)
- MiniSearch index over episode titles, summaries, guest names, topics and
  transcript text
- Prev/next episode by number
