/**
 * Content schemas. Every file under /content is validated against these at
 * build time (scripts/validate.ts + lib/content.ts). See docs/CONTENT-MODEL.md.
 *
 * Rule: `sync` blocks are owned by scripts/sync.ts; `editorial` blocks are
 * owned by humans. Keep the two apart here as well.
 */
import { z } from "zod";

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const episodeSlugPattern = /^\d{3}-[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const youtubeIdPattern = /^[A-Za-z0-9_-]{11}$/;
export const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

const slug = z.string().regex(slugPattern, "must be a kebab-case slug");
const episodeSlug = z.string().regex(episodeSlugPattern, "must look like 009-guest-name");
const isoDate = z.string().regex(isoDatePattern, "must be YYYY-MM-DD");
const url = z.url();
const nullableUrl = url.nullable();

export const ChapterSchema = z.object({
  start: z.number().min(0),
  title: z.string().min(1),
});

export const QuoteSchema = z.object({
  text: z.string().min(1),
  speaker: slug.nullable(),
  timestamp: z.number().min(0).nullable(),
});

export const LinkSchema = z.object({
  label: z.string().min(1),
  url,
});

export const EpisodeSchema = z.object({
  schema: z.literal("episode/1"),
  slug: episodeSlug,
  number: z.number().int().positive(),
  season: z.number().int().positive().default(1),
  sync: z.object({
    title: z.string().min(1),
    rawTitle: z.string().min(1),
    publishedAt: isoDate,
    youtubeId: z.string().regex(youtubeIdPattern),
    spotifyEpisodeId: z.string().nullable(),
    durationSeconds: z.number().int().positive().nullable(),
    youtubeDescription: z.string(),
    thumbnailUrl: url,
    lastSyncedAt: z.string(),
  }),
  editorial: z.object({
    guests: z.array(slug),
    topics: z.array(slug),
    summary: z.string(),
    hook: z.string().max(120),
    featured: z.boolean().default(false),
    chapters: z.array(ChapterSchema).default([]),
    quotes: z.array(QuoteSchema).default([]),
    links: z.array(LinkSchema).default([]),
    /** Input for `npm run artwork`. `*word*` marks the accent-coloured word. */
    thumbnail: z.object({ title: z.string().nullable() }).optional(),
  }),
});

export const GuestSchema = z.object({
  schema: z.literal("guest/1"),
  slug,
  name: z.string().min(1),
  role: z.string().min(1),
  company: z.string().nullable(),
  companyUrl: nullableUrl,
  industry: z.string().min(1),
  location: z.string().nullable(),
  bio: z.string(),
  headshot: z
    .string()
    .regex(/^\/guests\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/)
    .nullable(),
  links: z.object({
    linkedin: nullableUrl,
    x: nullableUrl,
    website: nullableUrl,
  }),
  // Derived at build time from episodes[].editorial.guests. Ignored if present.
  episodes: z.array(episodeSlug).optional(),
});

export const ClipSchema = z.object({
  schema: z.literal("clip/1"),
  youtubeId: z.string().regex(youtubeIdPattern),
  sync: z.object({
    title: z.string().min(1),
    rawTitle: z.string().optional(),
    publishedAt: isoDate,
    durationSeconds: z.number().int().positive().nullable(),
    thumbnailUrl: url,
    lastSyncedAt: z.string(),
  }),
  editorial: z.object({
    parentEpisode: episodeSlug.nullable(),
    sourceTimestamp: z.number().min(0).nullable(),
    caption: z.string().nullable(),
  }),
});

export const TranscriptCueSchema = z.object({
  start: z.number().min(0),
  end: z.number().min(0),
  speaker: z.string().nullable(),
  text: z.string(),
});

export const TranscriptSchema = z.object({
  schema: z.literal("transcript/1"),
  episode: episodeSlug,
  source: z.enum(["youtube-auto", "youtube-manual", "srt-upload", "whisper"]),
  language: z.string().min(2),
  generatedAt: z.string(),
  cues: z.array(TranscriptCueSchema),
});

export const TopicSchema = z.object({
  slug,
  name: z.string().min(1),
  description: z.string().min(1),
});
export const TopicsSchema = z.array(TopicSchema);

export const SiteSchema = z.object({
  name: z.string().min(1),
  shortName: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  url: url,
  language: z.string().default("en"),
  host: z.object({
    name: z.string(),
    bio: z.string(),
    photo: z.string().nullable(),
    linkedin: nullableUrl,
  }),
  listen: z.object({
    youtube: url,
    spotify: url,
    apple: nullableUrl,
    rss: nullableUrl,
  }),
  youtubeChannelId: z.string().min(1),
  spotifyShowId: z.string().min(1),
  social: z.object({
    linkedin: nullableUrl,
    instagram: nullableUrl,
    x: nullableUrl,
  }),
  contact: z.email(),
  newsletter: z.object({
    provider: z.string(),
    headline: z.string(),
    subheadline: z.string(),
    buttonLabel: z.string().default("Subscribe"),
    successMessage: z.string().default("You're in. Check your inbox to confirm."),
    alreadySubscribedMessage: z.string().default("You're already subscribed."),
  }),
  about: z.object({
    intro: z.string(),
    audience: z.string(),
    format: z.string(),
  }),
});

export type Episode = z.infer<typeof EpisodeSchema>;
export type Guest = z.infer<typeof GuestSchema>;
export type Clip = z.infer<typeof ClipSchema>;
export type Transcript = z.infer<typeof TranscriptSchema>;
export type TranscriptCue = z.infer<typeof TranscriptCueSchema>;
export type Topic = z.infer<typeof TopicSchema>;
export type Site = z.infer<typeof SiteSchema>;
export type Chapter = z.infer<typeof ChapterSchema>;
export type Quote = z.infer<typeof QuoteSchema>;
