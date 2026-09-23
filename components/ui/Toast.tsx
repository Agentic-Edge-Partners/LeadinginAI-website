"use client";

import { AnimatePresence, motion } from "motion/react";
import { EASE } from "@/lib/motion";
import { cx } from "@/lib/cx";

/** Polite status message. Render it near the thing that changed. */
export function Toast({
  message,
  tone = "info",
}: {
  message: string | null;
  tone?: "info" | "success" | "error";
}) {
  const tones = {
    info: "border-line-bright text-ink-muted",
    success: "border-cyan/50 text-cyan",
    error: "border-red-400/50 text-red-300",
  };
  return (
    <div aria-live="polite" role="status" className="min-h-6">
      <AnimatePresence>
        {message && (
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: EASE }}
            className={cx(
              "inline-block rounded-btn border bg-surface px-3 py-1.5 text-sm",
              tones[tone],
            )}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
