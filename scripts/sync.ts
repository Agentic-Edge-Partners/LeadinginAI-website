/**
 * npm run sync — pulls the channel, writes /content, prints a report.
 *
 *   • Classifies every upload as an episode ("#N - " prefix) or a clip.
 *   • New episode  → content/episodes/NNN-slug.json with `sync` filled and
 *                    `editorial` stubbed with TODO markers (+ a guest stub if needed).
 *   • Existing     → only the `sync` block is rewritten. `editorial` is never touched.
 *   • Clips        → content/clips/<id>.json, parentEpisode null until a human links it.
 *   • Transcripts  → files anything in content/transcripts/_inbox/, then tries the
 *                    official captions API if YOUTUBE_OAUTH_TOKEN is set.
 *   • Exits non-zero if a network source failed, so a partial sync is obvious.
 *
 * Sources (scripts/sources): YouTube Data API (YOUTUBE_API_KEY) → YouTube RSS
 * fallback (latest 15 only) → podcast RSS enrichment when site.listen.rss is set.
 */
import fs from "node:fs";
import path from "node:path";
import type { Clip, Episode, Guest } from "../lib/schemas";
import { YouTubeApiSource } from "./sources/youtube-api";
import { YouTubeRssSource } from "./sources/youtube-rss";
import { PodcastRssSource } from "./sources/podcast-rss";
import type { PodcastItem, RawVideo, VideoSource } from "./sources/types";
import { cleanClipTitle, episodeSlug, parseEpisodeTitle, slugify } from "./lib/titles";
import { readJsonIfExists, stringify, writeIfChanged } from "./lib/json";
import { fetchOfficialCaptions, processInbox, transcriptExists } from "./lib/transcripts";

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content");
const NOW = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

// ── Report ──────────────────────────────────────────────────────────────────
const report = {
  added: [] as string[],
  updated: [] as string[],
  warnings: [] as string[],
  errors: [] as string[],
  info: [] as string[],
};
const log = {
  ok: (m: string) => report.info.push(m),
  warn: (m: string) => report.warnings.push(m),
};

function loadEnvLocal() {
  const f = path.join(ROOT, ".env.local");
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

async function main() {
  loadEnvLocal();
  const site = JSON.parse(fs.readFileSync(path.join(CONTENT, "site.json"), "utf8")) as {
    youtubeChannelId: string;
    listen: { rss: string | null };
  };

  // ── 1. Videos ─────────────────────────────────────────────────────────────
  const apiKey = process.env.YOUTUBE_API_KEY;
  const sources: VideoSource[] = apiKey
    ? [
        new YouTubeApiSource(site.youtubeChannelId, apiKey),
        new YouTubeRssSource(site.youtubeChannelId),
      ]
    : [new YouTubeRssSource(site.youtubeChannelId)];
  if (!apiKey)
    report.warnings.push(
      "YOUTUBE_API_KEY not set: using the RSS fallback (latest 15 videos, no durations). See .env.example",
    );

  let videos: RawVideo[] | null = null;
  for (const src of sources) {
    try {
      videos = await src.fetchVideos();
      report.info.push(`Fetched ${videos.length} videos via ${src.name}`);
      break;
    } catch (err) {
      report.errors.push(`${src.name} failed: ${(err as Error).message}`);
    }
  }
  if (!videos) throw new Error("Every video source failed");

  // ── 2. Podcast RSS enrichment (optional) ──────────────────────────────────
  const podcastByNumber = new Map<number, PodcastItem>();
  if (site.listen.rss) {
    try {
      const items = await new PodcastRssSource(site.listen.rss).fetchItems();
      for (const it of items) if (it.number !== null) podcastByNumber.set(it.number, it);
      report.info.push(`Fetched ${items.length} items from the podcast RSS feed`);
    } catch (err) {
      report.errors.push(`podcast-rss failed: ${(err as Error).message}`);
    }
  }

  // ── 3. Episodes & clips ───────────────────────────────────────────────────
  const existingEpisodes = fs
    .readdirSync(path.join(CONTENT, "episodes"))
    .filter((f) => f.endsWith(".json"));
  const byYoutubeId = new Map<string, { file: string; doc: Episode }>();
  for (const f of existingEpisodes) {
    const doc = readJsonIfExists<Episode>(path.join(CONTENT, "episodes", f))!;
    byYoutubeId.set(doc.sync.youtubeId, { file: f, doc });
  }
  const guestFiles = new Set(
    fs
      .readdirSync(path.join(CONTENT, "guests"))
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, "")),
  );
  const knownSlugs = new Set<string>();
  const episodeVideos = new Map<string, RawVideo>(); // slug → video

  for (const v of videos) {
    const parsed = parseEpisodeTitle(v.title);
    if (parsed) {
      const rss = podcastByNumber.get(parsed.number);
      const existing = byYoutubeId.get(v.id);
      const slug = existing?.doc.slug ?? episodeSlug(parsed.number, parsed.guestName, parsed.title);
      knownSlugs.add(slug);
      episodeVideos.set(slug, v);
      const sync: Episode["sync"] = {
        title: parsed.title,
        rawTitle: v.title,
        publishedAt: v.publishedAt,
        youtubeId: v.id,
        spotifyEpisodeId: existing?.doc.sync.spotifyEpisodeId ?? null,
        durationSeconds:
          v.durationSeconds ?? rss?.durationSeconds ?? existing?.doc.sync.durationSeconds ?? null,
        youtubeDescription: v.description,
        thumbnailUrl: v.thumbnailUrl,
        lastSyncedAt: NOW,
      };
      if (existing) {
        const doc: Episode = {
          schema: "episode/1",
          slug: existing.doc.slug,
          number: existing.doc.number,
          season: existing.doc.season ?? 1,
          sync,
          editorial: existing.doc.editorial,
        };
        // Don't count a run as an update if only lastSyncedAt moved.
        const before = stringify({
          ...existing.doc,
          sync: { ...existing.doc.sync, lastSyncedAt: NOW },
        });
        const after = stringify(doc);
        if (before !== after) {
          writeIfChanged(path.join(CONTENT, "episodes", existing.file), after);
          report.updated.push(`episode ${slug} (sync block)`);
        }
      } else {
        const guestSlug = parsed.guestName ? slugify(parsed.guestName) : null;
        const guests: string[] = [];
        if (guestSlug) {
          guests.push(guestSlug);
          if (!guestFiles.has(guestSlug)) {
            const stub: Guest = {
              schema: "guest/1",
              slug: guestSlug,
              name: parsed.guestName!,
              role: "TODO",
              company: null,
              companyUrl: null,
              industry: "TODO",
              location: null,
              bio: "TODO: two to three sentences, third person.",
              headshot: null,
              links: { linkedin: null, x: null, website: null },
            };
            writeIfChanged(path.join(CONTENT, "guests", `${guestSlug}.json`), stringify(stub));
            guestFiles.add(guestSlug);
            report.added.push(`guest stub ${guestSlug}`);
            report.warnings.push(
              `content/guests/${guestSlug}.json: fill role, industry, bio, LinkedIn; add public/guests/${guestSlug}.jpg`,
            );
          }
        } else {
          report.warnings.push(
            `${slug}: could not parse a guest name from "${v.title}"; set editorial.guests by hand`,
          );
        }
        const doc: Episode = {
          schema: "episode/1",
          slug,
          number: parsed.number,
          season: 1,
          sync,
          editorial: {
            guests,
            topics: [],
            summary: "TODO",
            hook: "TODO",
            featured: false,
            chapters: [],
            quotes: [],
            links: [],
          },
        };
        writeIfChanged(path.join(CONTENT, "episodes", `${slug}.json`), stringify(doc));
        report.added.push(`episode ${slug}`);
        report.warnings.push(`${slug}: editorial.summary is TODO`);
        report.warnings.push(`${slug}: editorial.hook is TODO`);
        report.warnings.push(`${slug}: editorial.topics is empty`);
      }
    } else {
      const file = path.join(CONTENT, "clips", `${v.id}.json`);
      const existing = readJsonIfExists<Clip>(file);
      const sync: Clip["sync"] = {
        title: cleanClipTitle(v.title),
        rawTitle: v.title,
        publishedAt: v.publishedAt,
        durationSeconds: v.durationSeconds ?? existing?.sync.durationSeconds ?? null,
        thumbnailUrl: existing?.sync.thumbnailUrl ?? `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
        lastSyncedAt: NOW,
      };
      const doc: Clip = {
        schema: "clip/1",
        youtubeId: v.id,
        sync,
        editorial: existing?.editorial ?? {
          parentEpisode: null,
          sourceTimestamp: null,
          caption: null,
        },
      };
      if (existing) {
        const before = stringify({ ...existing, sync: { ...existing.sync, lastSyncedAt: NOW } });
        const after = stringify(doc);
        if (before !== after) {
          writeIfChanged(file, after);
          report.updated.push(`clip ${v.id} (sync block)`);
        }
      } else {
        writeIfChanged(file, stringify(doc));
        report.added.push(`clip ${v.id} "${sync.title}"`);
      }
      if (!doc.editorial.parentEpisode)
        report.warnings.push(`Clip ${v.id} "${sync.title}" has no parentEpisode`);
    }
  }
  // Episodes in the repo that the source did not return (RSS window, or unlisted)
  for (const f of existingEpisodes) {
    const doc = readJsonIfExists<Episode>(path.join(CONTENT, "episodes", f))!;
    knownSlugs.add(doc.slug);
    if (!episodeVideos.has(doc.slug))
      report.info.push(`${doc.slug} not in this source's window; left untouched`);
  }

  // ── 4. Transcripts ────────────────────────────────────────────────────────
  processInbox(knownSlugs, NOW, log);
  const token = process.env.YOUTUBE_OAUTH_TOKEN;
  const missing = [...knownSlugs].filter((s) => !transcriptExists(s)).sort();
  if (token) {
    for (const slug of missing) {
      const v = episodeVideos.get(slug) ?? {
        id: readJsonIfExists<Episode>(path.join(CONTENT, "episodes", `${slug}.json`))?.sync
          .youtubeId,
      };
      if (!v?.id) continue;
      try {
        const ok = await fetchOfficialCaptions(v.id, slug, token, NOW);
        if (ok) report.added.push(`transcript ${slug} (youtube captions)`);
        else report.warnings.push(`${slug}: no caption track on YouTube yet`);
      } catch (err) {
        report.errors.push(`${slug}: captions download failed: ${(err as Error).message}`);
      }
    }
  } else if (missing.length) {
    report.warnings.push(
      `${missing.length} episode(s) without a transcript: ${missing.join(", ")}. Drop .srt files in content/transcripts/_inbox/ (docs/WORKFLOW.md)`,
    );
  }

  // ── 5. Report ─────────────────────────────────────────────────────────────
  const lines: string[] = [];
  for (const m of report.info) lines.push(`ℹ ${m}`);
  for (const m of report.added) lines.push(`✔ Added ${m}`);
  for (const m of report.updated) lines.push(`✔ Updated ${m}`);
  if (!report.added.length && !report.updated.length) lines.push("✔ Content already up to date");
  for (const m of report.warnings) lines.push(`⚠ ${m}`);
  for (const m of report.errors) lines.push(`✖ ${m}`);
  console.log(`\n${lines.join("\n")}\n`);
  console.log(`Next: npm run validate  →  npm run dev  →  commit.`);
  if (report.errors.length) {
    console.error(`${report.errors.length} source error(s): this sync may be partial.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`✖ ${(err as Error).message}`);
  process.exit(1);
});
