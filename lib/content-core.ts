/**
 * Content loading core: reads /content, validates every file, derives cross-references.
 * No React, no server-only import — so scripts/*.ts can use it too. Reads /content at build time, validates every file, and
 * derives the cross-references (guest → episodes, topic → episodes, episode →
 * clips, related guests). Nothing here touches the network.
 *
 * Pages import from this file only. If you need a new derived view of the
 * content, add a function here rather than computing it inside a component.
 */
import fs from "node:fs";
import path from "node:path";
import {
  ClipSchema,
  EpisodeSchema,
  GuestSchema,
  SiteSchema,
  TopicsSchema,
  TranscriptSchema,
  type Clip,
  type Episode,
  type Guest,
  type Site,
  type Topic,
  type Transcript,
} from "./schemas";

export const CONTENT_DIR = path.join(process.cwd(), "content");

export class ContentError extends Error {
  constructor(
    public file: string,
    message: string,
  ) {
    super(`${file}: ${message}`);
    this.name = "ContentError";
  }
}

function readJson(file: string): unknown {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    throw new ContentError(
      path.relative(process.cwd(), file),
      `invalid JSON (${(err as Error).message})`,
    );
  }
}

function parseWith<T>(
  schema: {
    safeParse: (v: unknown) => {
      success: boolean;
      data?: T;
      error?: { issues: { path: PropertyKey[]; message: string }[] };
    };
  },
  file: string,
  raw: unknown,
): T {
  const res = schema.safeParse(raw);
  if (!res.success || res.data === undefined) {
    const issues = (res.error?.issues ?? [])
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
    throw new ContentError(path.relative(process.cwd(), file), issues || "does not match schema");
  }
  return res.data;
}

function listJson(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .sort()
    .map((f) => path.join(dir, f));
}

export type Library = {
  site: Site;
  topics: Topic[];
  episodes: Episode[]; // newest first
  guests: Guest[]; // with derived episodes[], ordered by most recent appearance
  clips: Clip[];
  transcripts: Map<string, Transcript>;
  showNotes: Map<string, string>; // episode slug → raw MDX/markdown
};

/** Loads and cross-validates everything. Uncached; lib/content.ts wraps it. */
export function loadLibrary(): Library {
  const site = parseWith<Site>(
    SiteSchema,
    path.join(CONTENT_DIR, "site.json"),
    readJson(path.join(CONTENT_DIR, "site.json")),
  );
  const topics = parseWith<Topic[]>(
    TopicsSchema,
    path.join(CONTENT_DIR, "topics.json"),
    readJson(path.join(CONTENT_DIR, "topics.json")),
  );
  const topicSlugs = new Set(topics.map((t) => t.slug));

  const guests = listJson(path.join(CONTENT_DIR, "guests")).map((f) => {
    const g = parseWith<Guest>(GuestSchema, f, readJson(f));
    if (path.basename(f, ".json") !== g.slug)
      throw new ContentError(
        path.relative(process.cwd(), f),
        `slug "${g.slug}" must match the filename`,
      );
    if (g.headshot && !fs.existsSync(path.join(process.cwd(), "public", g.headshot))) {
      throw new ContentError(
        path.relative(process.cwd(), f),
        `headshot "${g.headshot}" does not exist in /public`,
      );
    }
    return g;
  });
  const guestBySlug = new Map(guests.map((g) => [g.slug, g]));

  const episodes = listJson(path.join(CONTENT_DIR, "episodes")).map((f) => {
    const e = parseWith<Episode>(EpisodeSchema, f, readJson(f));
    const rel = path.relative(process.cwd(), f);
    if (path.basename(f, ".json") !== e.slug)
      throw new ContentError(rel, `slug "${e.slug}" must match the filename`);
    for (const t of e.editorial.topics) {
      if (!topicSlugs.has(t))
        throw new ContentError(rel, `editorial.topics: "${t}" is not in content/topics.json`);
    }
    for (const g of e.editorial.guests) {
      if (!guestBySlug.has(g))
        throw new ContentError(rel, `editorial.guests: no guest file content/guests/${g}.json`);
    }
    return e;
  });
  const numbers = new Map<number, string>();
  for (const e of episodes) {
    const dup = numbers.get(e.number);
    if (dup)
      throw new ContentError(
        `content/episodes/${e.slug}.json`,
        `episode number ${e.number} is also used by ${dup}`,
      );
    numbers.set(e.number, e.slug);
  }
  episodes.sort((a, b) => b.number - a.number);
  const episodeSlugs = new Set(episodes.map((e) => e.slug));

  const clips = listJson(path.join(CONTENT_DIR, "clips")).map((f) => {
    const c = parseWith<Clip>(ClipSchema, f, readJson(f));
    const rel = path.relative(process.cwd(), f);
    if (path.basename(f, ".json") !== c.youtubeId)
      throw new ContentError(rel, `youtubeId "${c.youtubeId}" must match the filename`);
    if (c.editorial.parentEpisode && !episodeSlugs.has(c.editorial.parentEpisode)) {
      throw new ContentError(
        rel,
        `editorial.parentEpisode: no episode "${c.editorial.parentEpisode}"`,
      );
    }
    return c;
  });

  const transcripts = new Map<string, Transcript>();
  for (const f of listJson(path.join(CONTENT_DIR, "transcripts"))) {
    const t = parseWith<Transcript>(TranscriptSchema, f, readJson(f));
    const rel = path.relative(process.cwd(), f);
    if (path.basename(f, ".json") !== t.episode)
      throw new ContentError(rel, `episode "${t.episode}" must match the filename`);
    if (!episodeSlugs.has(t.episode)) throw new ContentError(rel, `no episode "${t.episode}"`);
    transcripts.set(t.episode, t);
  }

  const showNotes = new Map<string, string>();
  const epDir = path.join(CONTENT_DIR, "episodes");
  if (fs.existsSync(epDir)) {
    for (const f of fs.readdirSync(epDir)) {
      if (f.endsWith(".mdx") || f.endsWith(".md")) {
        const slug = f.replace(/\.mdx?$/, "");
        if (episodeSlugs.has(slug))
          showNotes.set(slug, fs.readFileSync(path.join(epDir, f), "utf8"));
      }
    }
  }

  // Derived: guest.episodes[] and guest ordering by latest appearance.
  const appearances = new Map<string, string[]>();
  for (const e of episodes) {
    for (const g of e.editorial.guests) appearances.set(g, [...(appearances.get(g) ?? []), e.slug]);
  }
  const guestsWithEpisodes = guests
    .map((g) => ({ ...g, episodes: appearances.get(g.slug) ?? [] }))
    .sort((a, b) => {
      const an = a.episodes[0] ? Number(a.episodes[0].slice(0, 3)) : -1;
      const bn = b.episodes[0] ? Number(b.episodes[0].slice(0, 3)) : -1;
      return bn - an;
    });

  return { site, topics, episodes, guests: guestsWithEpisodes, clips, transcripts, showNotes };
}
