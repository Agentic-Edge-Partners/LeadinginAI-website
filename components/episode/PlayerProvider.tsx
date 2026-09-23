"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMotionValue, type MotionValue } from "motion/react";

type Handler = (seconds: number) => void;

type Ctx = {
  /** Seek the page's player to a timestamp (loads it first if needed). */
  seek: (seconds: number) => void;
  /** Called by PlayerEmbed to receive seek requests. */
  register: (fn: Handler) => () => void;
  /** Live playback position, driven by the YouTube iframe when playing. */
  currentTime: MotionValue<number>;
  /** Last known position as React state (updates ~4×/s while playing). */
  position: number;
};

const PlayerContext = createContext<Ctx | null>(null);

/**
 * Connects chapters, transcript timestamps and quotes to the episode player.
 * Wrap the episode page in it; PlayerEmbed registers itself.
 */
export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const handler = useRef<Handler | null>(null);
  const pending = useRef<number | null>(null);
  const currentTime = useMotionValue(0);
  const [position, setPosition] = useState(0);

  const seek = useCallback(
    (s: number) => {
      currentTime.set(s);
      setPosition(s);
      if (handler.current) handler.current(s);
      else pending.current = s;
    },
    [currentTime],
  );

  const register = useCallback((fn: Handler) => {
    handler.current = fn;
    if (pending.current !== null) {
      fn(pending.current);
      pending.current = null;
    }
    return () => {
      if (handler.current === fn) handler.current = null;
    };
  }, []);

  // Listen to YouTube's infoDelivery messages for the live playhead.
  useEffect(() => {
    let last = 0;
    const onMessage = (e: MessageEvent) => {
      if (typeof e.data !== "string" || !/youtube/.test(e.origin)) return;
      try {
        const data = JSON.parse(e.data);
        const t = data?.info?.currentTime;
        if (typeof t === "number") {
          currentTime.set(t);
          if (Math.abs(t - last) > 0.25) {
            last = t;
            setPosition(t);
          }
        }
      } catch {}
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [currentTime]);

  const value = useMemo(
    () => ({ seek, register, currentTime, position }),
    [seek, register, currentTime, position],
  );
  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): Ctx {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}

/** Safe variant for components that may render outside an episode page. */
export function usePlayerOptional(): Ctx | null {
  return useContext(PlayerContext);
}
