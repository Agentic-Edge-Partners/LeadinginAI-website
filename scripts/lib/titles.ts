/**
 * Title parsing. Episodes are titled  "#10 - Guest Name: Episode Title | Leading in AI Podcast".
 * The "#N - " prefix is what makes a video an episode; everything else is a clip.
 */
export const EPISODE_RE = /^#(\d+)\s*[-–—]\s*(.+?)\s*$/;
const SUFFIX_RE = /\s*\|\s*Leading in AI(?:\s+Podcast)?\s*$/i;

export type ParsedTitle = { number: number; guestName: string | null; title: string; raw: string };

export function parseEpisodeTitle(raw: string): ParsedTitle | null {
  const m = raw.match(EPISODE_RE);
  if (!m) return null;
  const number = Number(m[1]);
  const rest = m[2].replace(SUFFIX_RE, "").trim();
  const split = rest.match(/^(.+?):\s+(.+)$/);
  if (split) return { number, guestName: split[1].trim(), title: split[2].trim(), raw };
  return { number, guestName: null, title: rest, raw };
}

/** "Ciara O'Buachalla" → "ciara-o-buachalla" */
export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function episodeSlug(number: number, guestName: string | null, title: string): string {
  return `${String(number).padStart(3, "0")}-${slugify(guestName ?? title)
    .slice(0, 60)
    .replace(/-+$/, "")}`;
}

/** Strip hashtags from clip titles: "Is There Any Intelligence in AI? #podcast #ai" */
export function cleanClipTitle(raw: string): string {
  return raw
    .replace(/\s*#\w+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
