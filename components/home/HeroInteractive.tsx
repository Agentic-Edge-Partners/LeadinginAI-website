"use client";

import { createContext, useContext, useMemo, useRef } from "react";

/**
 * One pointer listener for the whole hero. The signal field and the kinetic
 * headline read from this store imperatively (no React re-renders per move).
 * Coordinates: `x`/`y` are relative to the hero section; `clientX`/`clientY`
 * are viewport coordinates.
 */
export type HeroPointer = {
  x: number;
  y: number;
  clientX: number;
  clientY: number;
  active: boolean;
  subscribe: (fn: () => void) => () => void;
};

const HeroPointerContext = createContext<HeroPointer | null>(null);

function createStore(): HeroPointer & { notify: () => void; listeners: Set<() => void> } {
  const listeners = new Set<() => void>();
  return {
    x: -1e4,
    y: -1e4,
    clientX: -1e4,
    clientY: -1e4,
    active: false,
    listeners,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    notify() {
      listeners.forEach((fn) => fn());
    },
  };
}

export function HeroInteractive({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const store = useMemo(createStore, []);

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    store.x = e.clientX - r.left;
    store.y = e.clientY - r.top;
    store.clientX = e.clientX;
    store.clientY = e.clientY;
    store.active = true;
    store.notify();
  };
  const onPointerLeave = () => {
    store.active = false;
    store.notify();
  };

  return (
    <section
      ref={ref}
      className={className}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <HeroPointerContext.Provider value={store}>{children}</HeroPointerContext.Provider>
    </section>
  );
}

export function useHeroPointer(): HeroPointer | null {
  return useContext(HeroPointerContext);
}
