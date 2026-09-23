/**
 * Motion constants — docs/BRAND.md §4. Import these instead of re-typing
 * numbers so the whole site shares one house curve.
 */
export const EASE = [0.16, 1, 0.3, 1] as const; // "expo out"

export const DURATION = {
  micro: 0.15,
  standard: 0.4,
  entrance: 0.7,
  morph: 0.6,
} as const;

export const STAGGER = 0.06; // seconds between siblings
export const STAGGER_CAP = 8; // never stagger more than this many items
export const REVEAL_DISTANCE = 24; // px, translate-y for reveals

export const SPRING_MAGNETIC = { stiffness: 150, damping: 15, mass: 0.2 } as const;
export const SPRING_PLAYHEAD = { stiffness: 120, damping: 20 } as const;
