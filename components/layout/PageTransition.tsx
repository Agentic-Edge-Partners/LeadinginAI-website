"use client";

import { motion } from "motion/react";
import { EASE } from "@/lib/motion";

/**
 * Enter-only page transition, mounted from app/template.tsx so it re-runs on
 * every navigation. Kept to opacity so it never fights the card→page morph.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
