"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { EpisodeCardData } from "@/lib/cards";
import { EpisodeCard } from "./EpisodeCard";
import { cx } from "@/lib/cx";

/**
 * Horizontal episode rail (docs/BRAND.md §4 move 2).
 *
 * The mechanism is a native, snap-aligned horizontal scroller — so touch,
 * keyboard (arrow keys when focused) and the visible prev/next buttons all
 * work with no JavaScript. Mouse drag with inertia is layered on top as the
 * enhancement, and skipped under reduced motion.
 */
export function EpisodeRail({
  episodes,
  label = "Recent episodes",
}: {
  episodes: EpisodeCardData[];
  label?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const drag = useRef<{
    active: boolean;
    moved: boolean;
    startX: number;
    startLeft: number;
    lastX: number;
    lastT: number;
    v: number;
    raf: number;
  }>({
    active: false,
    moved: false,
    startX: 0,
    startLeft: 0,
    lastX: 0,
    lastT: 0,
    v: 0,
    raf: 0,
  });

  const updateEdges = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    updateEdges();
    const el = scroller.current;
    if (!el) return;
    el.addEventListener("scroll", updateEdges, { passive: true });
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      ro.disconnect();
    };
  }, [updateEdges]);

  const step = () => {
    const el = scroller.current;
    if (!el) return 0;
    const card = el.querySelector<HTMLElement>("[data-rail-item]");
    return card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
  };
  const scrollByCards = (dir: 1 | -1) =>
    scroller.current?.scrollBy({ left: dir * step(), behavior: reduced ? "auto" : "smooth" });

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollByCards(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollByCards(-1);
    } else if (e.key === "Home") {
      scroller.current?.scrollTo({ left: 0, behavior: reduced ? "auto" : "smooth" });
    } else if (e.key === "End") {
      scroller.current?.scrollTo({
        left: scroller.current.scrollWidth,
        behavior: reduced ? "auto" : "smooth",
      });
    }
  };

  // ── Mouse drag with inertia ───────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || reduced) return;
    const el = scroller.current;
    if (!el) return;
    cancelAnimationFrame(drag.current.raf);
    drag.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startLeft: el.scrollLeft,
      lastX: e.clientX,
      lastT: performance.now(),
      v: 0,
      raf: 0,
    };
    el.style.scrollSnapType = "none";
    el.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = scroller.current;
    if (!d.active || !el) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 5) d.moved = true;
    el.scrollLeft = d.startLeft - dx;
    const now = performance.now();
    const dt = now - d.lastT;
    if (dt > 0) d.v = (e.clientX - d.lastX) / dt; // px per ms
    d.lastX = e.clientX;
    d.lastT = now;
  };
  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = scroller.current;
    if (!d.active || !el) return;
    d.active = false;
    try {
      el.releasePointerCapture(e.pointerId);
    } catch {}
    let v = -d.v * 16; // px per frame
    const tick = () => {
      if (Math.abs(v) < 0.4) {
        el.style.scrollSnapType = "";
        return;
      }
      el.scrollLeft += v;
      v *= 0.94;
      d.raf = requestAnimationFrame(tick);
    };
    d.raf = requestAnimationFrame(tick);
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  return (
    <div className="relative">
      <div className="mb-6 flex items-center justify-end gap-2">
        <RailButton dir="prev" disabled={atStart} onClick={() => scrollByCards(-1)} />
        <RailButton dir="next" disabled={atEnd} onClick={() => scrollByCards(1)} />
      </div>
      <div
        ref={scroller}
        role="region"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        className={cx(
          "-mx-6 scrollbar-none flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-6 pb-4 lg:-mx-12 lg:px-12",
          "cursor-grab [scroll-padding-inline:1.5rem] active:cursor-grabbing motion-reduce:cursor-auto lg:[scroll-padding-inline:3rem]",
        )}
      >
        {episodes.map((e, i) => (
          <div
            key={e.slug}
            data-rail-item
            className="w-[min(80vw,26rem)] shrink-0 snap-start select-none"
          >
            <EpisodeCard episode={e} variant="rail" priority={i < 2} />
          </div>
        ))}
      </div>
    </div>
  );
}

function RailButton({
  dir,
  disabled,
  onClick,
}: {
  dir: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous episodes" : "Next episodes"}
      className="inline-flex size-11 items-center justify-center rounded-full border border-line-bright text-ink transition-colors hover:border-cyan hover:text-cyan disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line-bright disabled:hover:text-ink"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {dir === "prev" ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
      </svg>
    </button>
  );
}
