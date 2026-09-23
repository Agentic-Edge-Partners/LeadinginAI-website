import fs from "node:fs";
import path from "node:path";
import { parseSrt } from "../../lib/srt";
import { mergeCues } from "../../lib/transcript";
import type { Transcript } from "../../lib/schemas";
import { stringify, writeIfChanged } from "./json";

export const TRANSCRIPTS_DIR = path.join(process.cwd(), "content", "transcripts");
export const INBOX_DIR = path.join(TRANSCRIPTS_DIR, "_inbox");

export function transcriptExists(slug: string): boolean {
  return fs.existsSync(path.join(TRANSCRIPTS_DIR, `${slug}.json`));
}

function writeTranscript(
  slug: string,
  source: Transcript["source"],
  cues: Transcript["cues"],
  now: string,
): boolean {
  const doc: Transcript = {
    schema: "transcript/1",
    episode: slug,
    source,
    language: "en",
    generatedAt: now,
    cues: mergeCues(cues),
  };
  return writeIfChanged(path.join(TRANSCRIPTS_DIR, `${slug}.json`), stringify(doc));
}

/**
 * Tier 2 (always works): file any .srt/.vtt dropped in content/transcripts/_inbox/,
 * named after the episode slug. Processed files move to _inbox/_processed/.
 */
export function processInbox(
  knownSlugs: Set<string>,
  now: string,
  log: { ok: (m: string) => void; warn: (m: string) => void },
): number {
  if (!fs.existsSync(INBOX_DIR)) return 0;
  let filed = 0;
  for (const f of fs.readdirSync(INBOX_DIR)) {
    if (!/\.(srt|vtt)$/i.test(f)) continue;
    const slug = f.replace(/\.(srt|vtt)$/i, "");
    if (!knownSlugs.has(slug)) {
      log.warn(
        `Inbox file ${f}: no episode "${slug}". Name it after the episode slug, e.g. 010-maria-santos.srt`,
      );
      continue;
    }
    const cues = parseSrt(fs.readFileSync(path.join(INBOX_DIR, f), "utf8"));
    if (cues.length === 0) {
      log.warn(`Inbox file ${f}: no cues found`);
      continue;
    }
    writeTranscript(slug, "srt-upload", cues, now);
    const done = path.join(INBOX_DIR, "_processed");
    fs.mkdirSync(done, { recursive: true });
    fs.renameSync(path.join(INBOX_DIR, f), path.join(done, f));
    log.ok(`Filed transcript for ${slug} from inbox (${cues.length} cues)`);
    filed++;
  }
  return filed;
}

/**
 * Tier 1 (preferred once set up): official captions.download with an OAuth
 * token belonging to the channel owner. Needs YOUTUBE_OAUTH_TOKEN with the
 * youtube.force-ssl scope. Returns false when no caption track is available.
 */
export async function fetchOfficialCaptions(
  videoId: string,
  slug: string,
  token: string,
  now: string,
): Promise<boolean> {
  const headers = { Authorization: `Bearer ${token}` };
  const list = await fetch(
    `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}`,
    { headers, signal: AbortSignal.timeout(20_000) },
  );
  if (!list.ok)
    throw new Error(`captions.list ${list.status}: ${(await list.text()).slice(0, 200)}`);
  const data = (await list.json()) as {
    items?: Array<{ id: string; snippet: { language: string; trackKind: string } }>;
  };
  const tracks = data.items ?? [];
  const track =
    tracks.find((t) => t.snippet.language.startsWith("en") && t.snippet.trackKind !== "asr") ??
    tracks.find((t) => t.snippet.language.startsWith("en")) ??
    tracks[0];
  if (!track) return false;
  const dl = await fetch(`https://www.googleapis.com/youtube/v3/captions/${track.id}?tfmt=srt`, {
    headers,
    signal: AbortSignal.timeout(30_000),
  });
  if (!dl.ok) throw new Error(`captions.download ${dl.status}: ${(await dl.text()).slice(0, 200)}`);
  const cues = parseSrt(await dl.text());
  if (cues.length === 0) return false;
  writeTranscript(
    slug,
    track.snippet.trackKind === "asr" ? "youtube-auto" : "youtube-manual",
    cues,
    now,
  );
  return true;
}
