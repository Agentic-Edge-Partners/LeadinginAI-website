"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { usePlayerOptional } from "./PlayerProvider";
import { cx } from "@/lib/cx";
import { formatDuration } from "@/lib/format";

type Props = {
  youtubeId: string;
  title: string;
  poster: string;
  aspect?: "video" | "short";
  durationSeconds?: number | null;
  className?: string;
};

/**
 * Click-to-load YouTube embed. The iframe never enters the initial page load:
 * the poster is a plain image until someone presses play (PLAN.md §11).
 * Registers with PlayerProvider so chapters/transcript can seek into it.
 */
export function PlayerEmbed({
  youtubeId,
  title,
  poster,
  aspect = "video",
  durationSeconds,
  className,
}: Props) {
  const player = usePlayerOptional();
  const reduced = useReducedMotion();
  const [start, setStart] = useState<number>(0);
  const [loaded, setLoaded] = useState(false);
  const iframe = useRef<HTMLIFrameElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);

  const post = useCallback((func: string, args: unknown[] = []) => {
    iframe.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "*",
    );
  }, []);

  useEffect(() => {
    if (!player) return;
    return player.register((s) => {
      wrapper.current?.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
      if (!loaded) {
        setStart(Math.floor(s));
        setLoaded(true);
      } else {
        post("seekTo", [Math.floor(s), true]);
        post("playVideo");
      }
    });
  }, [player, loaded, post, reduced]);

  // Deep links: /episodes/slug?t=754 → routed through the provider so the
  // player loads at that timestamp and scrolls into view.
  useEffect(() => {
    if (!player || aspect !== "video") return;
    const t = Number(new URLSearchParams(window.location.search).get("t"));
    if (t > 0) player.seek(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onIframeLoad = () => {
    // Ask the player to stream infoDelivery messages (currentTime) to the page.
    iframe.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "listening", id: youtubeId, channel: "widget" }),
      "*",
    );
  };

  // Only ever rendered after a client-side interaction, so window is defined.
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const src = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&playsinline=1${start > 0 ? `&start=${start}` : ""}${origin ? `&origin=${encodeURIComponent(origin)}` : ""}`;
  const duration = formatDuration(durationSeconds);

  return (
    <div
      ref={wrapper}
      className={cx(
        "relative overflow-hidden rounded-img bg-surface-2",
        aspect === "video" ? "aspect-video" : "aspect-[9/16]",
        className,
      )}
    >
      {loaded ? (
        <iframe
          ref={iframe}
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={onIframeLoad}
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="group absolute inset-0 size-full text-left"
          aria-label={`Play: ${title}`}
        >
          <Image
            src={poster}
            alt=""
            fill
            sizes="(min-width: 1024px) 896px, 100vw"
            className="object-cover transition-transform duration-700 ease-house group-hover:scale-[1.02]"
            priority={false}
          />
          <span
            className="absolute inset-0 bg-gradient-to-t from-ground/70 via-transparent to-transparent"
            aria-hidden="true"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <motion.span
              whileHover={{ scale: 1.06 }}
              className="flex size-16 items-center justify-center rounded-full bg-cyan text-ground shadow-[0_0_0_10px_rgb(0_217_224/0.18)] sm:size-20"
              aria-hidden="true"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.14v13.72c0 .8.87 1.3 1.56.87l10.28-6.86a1 1 0 0 0 0-1.66L9.56 4.27C8.87 3.84 8 4.34 8 5.14Z" />
              </svg>
            </motion.span>
          </span>
          {duration && (
            <span className="absolute right-3 bottom-3 rounded-sm bg-ground/80 px-1.5 py-0.5 meta text-ink backdrop-blur">
              {duration}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
