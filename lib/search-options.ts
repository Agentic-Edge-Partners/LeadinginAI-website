/**
 * MiniSearch configuration shared by the index builder (server) and the
 * search hook (client). The two MUST stay identical or loadJSON() fails.
 */
export const SEARCH_FIELDS = [
  "title",
  "guests",
  "topics",
  "hook",
  "summary",
  "transcript",
] as const;

export const searchOptions = {
  fields: [...SEARCH_FIELDS],
  storeFields: [] as string[],
  idField: "id",
  searchOptions: {
    prefix: true,
    fuzzy: 0.2,
    combineWith: "AND" as const,
    boost: { title: 4, guests: 3, topics: 2, hook: 2, summary: 1.5, transcript: 1 },
  },
};

export type SearchDoc = {
  id: string; // episode slug
  title: string;
  guests: string;
  topics: string;
  hook: string;
  summary: string;
  transcript: string;
};
