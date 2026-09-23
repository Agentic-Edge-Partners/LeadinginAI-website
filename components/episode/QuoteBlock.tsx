import type { Quote } from "@/lib/schemas";
import { SeekButton } from "./SeekButton";

/** A pull quote with attribution and a timestamp that seeks the player. */
export function QuoteBlock({ quote, speakerName }: { quote: Quote; speakerName: string | null }) {
  return (
    <figure className="relative border-l-2 border-teal pl-6">
      <blockquote className="display-m text-ink">“{quote.text}”</blockquote>
      <figcaption className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
        {speakerName && <span className="font-semibold text-ink">{speakerName}</span>}
        {quote.timestamp !== null && <SeekButton seconds={quote.timestamp} />}
      </figcaption>
    </figure>
  );
}
