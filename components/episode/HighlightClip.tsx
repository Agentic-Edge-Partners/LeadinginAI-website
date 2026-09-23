import type { Clip } from "@/lib/schemas";
import { PlayerEmbed } from "./PlayerEmbed";
import { SeekButton } from "./SeekButton";

/** A short clip attached to its parent episode, shown as a vertical poster. */
export function HighlightClip({ clip }: { clip: Clip }) {
  return (
    <figure className="flex flex-col gap-3">
      <PlayerEmbed
        youtubeId={clip.youtubeId}
        title={clip.sync.title}
        poster={clip.sync.thumbnailUrl}
        aspect="short"
        durationSeconds={clip.sync.durationSeconds}
      />
      <figcaption>
        <p className="font-semibold text-ink">{clip.sync.title}</p>
        {clip.editorial.caption && (
          <p className="mt-1 text-sm text-ink-muted">{clip.editorial.caption}</p>
        )}
        {clip.editorial.sourceTimestamp !== null && (
          <p className="mt-2">
            <SeekButton seconds={clip.editorial.sourceTimestamp}>
              Jump to this moment in the episode
            </SeekButton>
          </p>
        )}
      </figcaption>
    </figure>
  );
}
