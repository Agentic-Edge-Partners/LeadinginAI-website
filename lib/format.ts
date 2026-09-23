/** Small, dependency-free formatters shared by server and client components. */

export function padEpisode(n: number): string {
  return String(n).padStart(3, "0");
}

/** "EP 009" — the mono metadata label used on cards and heroes. */
export function episodeLabel(n: number): string {
  return `EP ${padEpisode(n)}`;
}

/** 2892 → "48 min"; 4020 → "1 h 07 min". Null-safe. */
export function formatDuration(seconds: number | null | undefined): string | null {
  if (!seconds || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h === 0) return `${m} min`;
  return `${h} h ${String(m).padStart(2, "0")} min`;
}

/** 754 → "12:34"; 3723 → "1:02:03". */
export function formatTimestamp(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(sec).padStart(2, "0")}`;
}

/** ISO 8601 duration for structured data: 2892 → "PT48M12S". */
export function isoDuration(seconds: number | null | undefined): string | undefined {
  if (!seconds) return undefined;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${s ? `${s}S` : ""}`;
}

/** "2026-07-24" → "24 Jul 2026". Rendered identically on server and client. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${d} ${months[(m ?? 1) - 1]} ${y}`;
}

/** "2026-07-24" → "July 2026". */
export function formatMonthYear(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${months[(m ?? 1) - 1]} ${y}`;
}

/** "Vuk Vegezzi" → "VV" for the initials avatar fallback. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Joins names as "A", "A and B", "A, B and C". */
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function youtubeWatchUrl(id: string, start?: number): string {
  const t = start && start > 0 ? `&t=${Math.floor(start)}s` : "";
  return `https://www.youtube.com/watch?v=${id}${t}`;
}

export function spotifyEpisodeUrl(id: string): string {
  return `https://open.spotify.com/episode/${id}`;
}
