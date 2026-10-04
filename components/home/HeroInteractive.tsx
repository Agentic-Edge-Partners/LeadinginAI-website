"use client";

import { createContext, useContext, useRef, useState } from "react";

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

type HeroPointerStore = HeroPointer & {
  move: (x: number, y: number, clientX: number, clientY: number) => void;
  leave: () => void;
};

function createStore(): HeroPointerStore {
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((fn) => fn());
  return {
    x: -1e4,
    y: -1e4,
    clientX: -1e4,
    clientY: -1e4,
    active: false,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    move(x, y, clientX, clientY) {
      this.x = x;
      this.y = y;
      this.clientX = clientX;
      this.clientY = clientY;
      this.active = true;
      notify();
    },
    leave() {
      this.active = false;
      notify();
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
  const [store] = useState(createStore);

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    store.move(e.clientX - r.left, e.clientY - r.top, e.clientX, e.clientY);
  };
  const onPointerLeave = () => store.leave();

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
