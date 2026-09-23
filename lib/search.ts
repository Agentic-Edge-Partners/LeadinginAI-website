import "server-only";
import MiniSearch from "minisearch";
import { getLibrary } from "./content";
import { searchOptions, type SearchDoc } from "./search-options";
import { transcriptText } from "./transcript";

/** Builds the serialised MiniSearch index for /search-index.json. */
export function buildSearchIndex(): string {
  const lib = getLibrary();
  const guestName = new Map(lib.guests.map((g) => [g.slug, g.name]));
  const topicName = new Map(lib.topics.map((t) => [t.slug, t.name]));
  const docs: SearchDoc[] = lib.episodes.map((e) => ({
    id: e.slug,
    title: e.sync.title,
    guests: e.editorial.guests.map((g) => guestName.get(g) ?? g).join(" "),
    topics: e.editorial.topics.map((t) => topicName.get(t) ?? t).join(" "),
    hook: e.editorial.hook,
    summary: e.editorial.summary,
    transcript: lib.transcripts.has(e.slug)
      ? transcriptText(lib.transcripts.get(e.slug)!.cues)
      : "",
  }));
  const ms = new MiniSearch<SearchDoc>(searchOptions);
  ms.addAll(docs);
  return JSON.stringify(ms.toJSON());
}
