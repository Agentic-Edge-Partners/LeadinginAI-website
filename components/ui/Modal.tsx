"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { EASE } from "@/lib/motion";
import { cx } from "@/lib/cx";

/**
 * Accessible modal on the native <dialog> element: focus trap, Escape, and
 * backdrop click come for free. Animate only the panel.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-label={title}
      className={cx(
        "m-auto w-[min(92vw,32rem)] rounded-card border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm",
        className,
      )}
    >
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="p-6 sm:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <h2 className="heading">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="-mt-2 -mr-2 inline-flex size-9 items-center justify-center rounded-btn text-ink-dim hover:bg-surface-2 hover:text-ink"
              aria-label="Close"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div className="mt-4">{children}</div>
        </motion.div>
      )}
    </dialog>
  );
}
