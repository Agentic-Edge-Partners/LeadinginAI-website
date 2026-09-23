import { buildSearchIndex } from "@/lib/search";

export const dynamic = "force-static";

/** Prebuilt MiniSearch index, fetched lazily by the archive search. */
export function GET() {
  return new Response(buildSearchIndex(), {
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" },
  });
}
