/**
 * npm run validate — also runs automatically before every build (prebuild).
 * Fails loudly, naming the file and field, on anything that would ship broken.
 */
import { ContentError, loadLibrary } from "../lib/content-core";

function main() {
  let lib;
  try {
    lib = loadLibrary();
  } catch (err) {
    if (err instanceof ContentError) {
      console.error(`✖ ${err.message}`);
      process.exit(1);
    }
    throw err;
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  for (const e of lib.episodes) {
    const f = `content/episodes/${e.slug}.json`;
    if (!e.editorial.summary.trim() || /^TODO/i.test(e.editorial.summary))
      errors.push(`${f}: editorial.summary is TODO — write it before shipping`);
    if (!e.editorial.hook.trim() || /^TODO/i.test(e.editorial.hook))
      errors.push(`${f}: editorial.hook is TODO`);
    if (e.editorial.topics.length === 0)
      warnings.push(`${f}: editorial.topics is empty (won't appear on any topic page)`);
    if (e.editorial.guests.length === 0) warnings.push(`${f}: editorial.guests is empty`);
    for (const q of e.editorial.quotes)
      if (q.speaker && !e.editorial.guests.includes(q.speaker) && q.speaker !== "host")
        errors.push(`${f}: quote speaker "${q.speaker}" is not a guest on this episode`);
    const sortedChapters = [...e.editorial.chapters].every(
      (c, i, a) => i === 0 || c.start > a[i - 1].start,
    );
    if (!sortedChapters) errors.push(`${f}: editorial.chapters must be in ascending order`);
  }
  for (const g of lib.guests) {
    const f = `content/guests/${g.slug}.json`;
    if (/^TODO/i.test(g.role) || /^TODO/i.test(g.industry) || /^TODO/i.test(g.bio))
      errors.push(`${f}: still has TODO fields (role / industry / bio)`);
    if ((g.episodes?.length ?? 0) === 0) warnings.push(`${f}: no episode references this guest`);
    if (!g.headshot) warnings.push(`${f}: no headshot yet (initials avatar will be used)`);
  }
  for (const c of lib.clips) {
    if (!c.editorial.parentEpisode)
      warnings.push(
        `content/clips/${c.youtubeId}.json: parentEpisode is null (clip renders nowhere)`,
      );
  }
  const featured = lib.episodes.filter((e) => e.editorial.featured);
  if (featured.length > 1)
    warnings.push(`${featured.length} episodes are featured; the newest wins on the home page`);

  console.log(
    `Content: ${lib.episodes.length} episodes · ${lib.guests.length} guests · ${lib.clips.length} clips · ${lib.transcripts.size} transcripts · ${lib.topics.length} topics`,
  );
  for (const w of warnings) console.log(`⚠ ${w}`);
  for (const e of errors) console.error(`✖ ${e}`);
  if (errors.length) {
    console.error(`\n${errors.length} content error(s). Fix them and re-run npm run validate.`);
    process.exit(1);
  }
  console.log(
    `✔ Content valid${warnings.length ? ` (${warnings.length} warning${warnings.length === 1 ? "" : "s"})` : ""}`,
  );
}

main();
