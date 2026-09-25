"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { useHeroPointer } from "./HeroInteractive";

const LINES = 26;
const STEP = 8; // px per segment

/**
 * Hero background: thin horizontal lines that ripple like a signal, drift on
 * their own and part around the cursor. Pure canvas, no assets, ~1% CPU.
 * Under reduced-motion it draws one still frame and ignores the pointer.
 */
export function SignalField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useHeroPointer();
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let grad: CanvasGradient | string = "#0D9CAC";
    let raf = 0;
    let visible = true;
    let px = -1e4;
    let py = -1e4;
    let amp = 0;
    const t0 = performance.now();

    const resize = () => {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, "#0D9CAC");
      g.addColorStop(0.5, "#00D9E0");
      g.addColorStop(1, "#0D9CAC");
      grad = g;
    };

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      if (pointer?.active && !reduced) {
        px += (pointer.x - px) * 0.14;
        py += (pointer.y - py) * 0.14;
        amp += (1 - amp) * 0.08;
      } else {
        amp *= 0.94;
      }
      ctx.clearRect(0, 0, w, h);
      const top = h * 0.04;
      const bottom = h * 0.72;
      const gap = (bottom - top) / (LINES - 1);
      ctx.lineWidth = 1;
      ctx.strokeStyle = grad;
      for (let i = 0; i < LINES; i++) {
        const baseY = top + i * gap;
        const phase = i * 0.37;
        const dy = baseY - py;
        const near = Math.exp(-(dy * dy) / (2 * 150 * 150)) * amp;
        const centre = 1 - Math.abs(i / (LINES - 1) - 0.42) * 1.7;
        ctx.globalAlpha = Math.min(0.6, 0.07 + 0.18 * Math.max(0, centre) + 0.3 * near);
        ctx.beginPath();
        for (let x = 0; x <= w + STEP; x += STEP) {
          const drift = reduced
            ? Math.sin(x * 0.0035 + phase) * 5
            : Math.sin(x * 0.0035 + t * 0.6 + phase) * 6 +
              Math.sin(x * 0.011 - t * 0.35 + phase * 1.7) * 3;
          const dx = x - px;
          const g = Math.exp(-(dx * dx) / (2 * 190 * 190)) * Math.exp(-(dy * dy) / (2 * 150 * 150));
          const push = (dy >= 0 ? 1 : -1) * g * 48 * amp;
          const y = baseY + drift + push;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (!reduced && visible && !document.hidden) raf = requestAnimationFrame(draw);
      else raf = 0;
    };

    const start = () => {
      if (raf === 0) raf = requestAnimationFrame(draw);
    };
    resize();
    start();

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(performance.now());
    });
    ro.observe(host);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(host);
    const onVisibility = () => {
      if (!document.hidden) start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const unsubscribe = pointer?.subscribe(start);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      unsubscribe?.();
    };
  }, [pointer, reduced]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
