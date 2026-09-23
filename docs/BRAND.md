# Brand & Motion Specification

Derived from the existing YouTube/Spotify artwork. Nothing here is invented —
the palette and typographic character are pulled from the wordmark and the
episode thumbnail template that are already in use.

---

## 1. Colour

Sampled directly from the channel avatar and episode thumbnails.

```css
@theme {
  /* Ground */
  --color-ground:      #000000;  /* page background — matches thumbnail ground */
  --color-surface:     #0B0E14;  /* cards, raised panels */
  --color-surface-2:   #121722;  /* hover state, nested panels */

  /* Brand */
  --color-navy:        #1A2342;  /* wordmark top, gradient origin, borders */
  --color-teal:        #0D9CAC;  /* thumbnail title blocks, guest nameplate */
  --color-cyan:        #00D9E0;  /* wordmark gradient tip — primary accent */

  /* Text */
  --color-ink:         #FFFFFF;
  --color-ink-muted:   #B4BCCC;  /* secondary text */
  --color-ink-dim:     #8A93A6;  /* metadata — VERIFY 4.5:1 on ground */

  /* Lines */
  --color-line:        #1E2534;
  --color-line-bright: #2C3548;
}
```

**The brand gradient**, straight off the wordmark:
`linear-gradient(180deg, #1A2342 0%, #0D9CAC 55%, #00D9E0 100%)`

Use it sparingly — the wordmark, one hero accent, and section rules. Gradient
text everywhere reads cheap; the restraint is what makes it feel premium.

### Usage rules

- `--color-cyan` is for **interaction**: links, focus rings, active states, the
  play button. If it isn't clickable, it shouldn't be cyan.
- `--color-teal` is for **editorial emphasis**: the title block behind episode
  titles (a direct quote of the thumbnail template), tags, topic pills.
- Never put cyan text on teal or vice versa.
- Focus rings: `2px solid var(--color-cyan)` with `2px` offset. Do not remove
  outlines anywhere.

### Contrast checks to run in Phase 1
`--color-ink-dim` (#8A93A6) on `--color-ground` (#000) measures ~7.7:1 — passes.
`--color-cyan` (#00D9E0) on `--color-ground` measures ~11:1 — passes.
`--color-ink` on `--color-teal` (#0D9CAC) measures ~3.1:1 — **fails for body
text**. Only use white-on-teal at ≥24px bold (large-text threshold is 3:1), which
is exactly how the thumbnails use it. For anything smaller, darken the teal or
use near-black text.

---

## 2. Typography

Three roles. All free, all on Google Fonts, all variable.

| Role | Family | Usage |
|---|---|---|
| Display | **Archivo** (variable, incl. width axis) | Hero, page titles, episode titles, section headers. Use the Expanded width (`font-stretch: 112%`) at ≥48px for the wide, confident character of the wordmark. Uppercase for the largest sizes only. |
| Body | **Inter** (variable) | Paragraphs, bios, transcripts, UI labels. Matches the existing thumbnail typography. |
| Metadata | **JetBrains Mono** | Episode numbers, timestamps, durations, dates, tags, chapter markers. |

The mono layer is doing real work — it's what separates this from a generic
business podcast site and reads as "technical" without any other decoration.
Use it for anything numeric or systematic.

### Scale

```
display-xl   clamp(2.5rem, 8.5vw, 7.5rem) Archivo Expanded 700, -0.03em, 0.92 lh  (min lowered so "LEADING IN" fits a 390px phone)
display-l    clamp(2.5rem, 6vw, 4.5rem)   Archivo Expanded 700, -0.025em, 0.98 lh
display-m    clamp(1.75rem, 3.5vw, 2.5rem) Archivo 600, -0.02em, 1.1 lh
heading      1.25rem                       Archivo 600, -0.01em, 1.3 lh
body-l       1.125rem                      Inter 400, 1.65 lh
body         1rem                          Inter 400, 1.6 lh
small        0.875rem                      Inter 400, 1.5 lh
meta         0.75rem                       JetBrains Mono 500, 0.08em tracking, uppercase
```

---

## 3. Layout

```
Container     max-width 1280px, 24px gutter mobile / 48px desktop
Grid          12 columns, 24px gap
Section       py: clamp(80px, 12vh, 160px)
Radius        cards 16px · buttons 8px · pills 999px · images 12px
Breakpoints   sm 640 · md 768 · lg 1024 · xl 1280 (Tailwind defaults)
```

Generous vertical space is doing a lot of the "premium editorial" work. Do not
compress sections to fit more above the fold.

---

## 4. Motion specification

The chosen direction is **kinetic editorial**: motion that makes the site feel
alive and crafted, while the content stays immediately readable. Every effect
below must degrade to a static, fully functional page.

### Global rules

```
Easing       cubic-bezier(0.16, 1, 0.3, 1)     — "expo out", the house curve
Duration     micro 150ms · standard 400ms · entrance 700ms · morph 600ms
Stagger      60ms between siblings, capped at 8 items
Distance     translate-y 24px for reveals — never more, it reads as jank
```

**`prefers-reduced-motion: reduce` is not an afterthought.** Implement it as a
single `useReducedMotion()` check that collapses every duration to 0 and removes
every transform. Test the site with it on; it must be completely usable.

### The seven signature moves

**1. Hero wordmark reveal** *(home, on load)*
Words clip-reveal upward from a mask, staggered 80ms. Subhead fades in at +400ms.
Runs once per session — store a flag; a re-reveal on every navigation is irritating.

**2. Draggable episode rail** *(home)*
Horizontal strip, inertial drag via `motion`'s `drag="x"` with `dragConstraints`
and `dragElastic={0.08}`. Cards scale to 1.03 and lift on hover.
**Accessibility:** must also respond to arrow keys when focused, expose visible
prev/next buttons, and scroll normally on touch. Drag is the enhancement, not the
mechanism.

**3. Card → page morph** *(episode cards → episode page)*
Shared-element transition using `layoutId` on the card's image and title. The
card's artwork expands into the episode hero. This is the signature interaction —
budget real iteration time for it. Requires `<AnimatePresence mode="wait">` at the
layout level and a `PageTransition` wrapper.

**4. Magnetic hover** *(primary CTAs, nav items)*
Element translates toward the cursor, max 8px displacement, spring
`{ stiffness: 150, damping: 15 }`. Disabled on touch devices and under
reduced-motion. Subtle — if it's noticeable as an effect, it's too strong.

**5. Scroll reveal** *(all sections)*
`opacity: 0 → 1`, `translateY: 24px → 0`, triggered at 15% viewport entry, via
`whileInView` with `viewport={{ once: true, amount: 0.15 }}`. Children stagger.
Use the `<Reveal>` / `<StaggerGroup>` components so this is one import, not
repeated inline config.

**6. Chapter scrubber** *(episode page)*
A horizontal timeline with chapter markers. Hovering a marker shows the chapter
title; clicking deep-links into the player at that timestamp. The transcript data
makes this possible. Animate the playhead with a spring, not a linear tween.

**7. Filter reflow** *(archive, guest directory)*
Cards reposition with `layout` animation when filters change, rather than
snapping. Use `<AnimatePresence>` for entering/exiting cards. Keep the duration
short (300ms) — long reflows feel sluggish when someone is scanning.

### What NOT to do

- No scroll-jacking. Lenis smooths the scroll; it must never take it over.
- No custom cursor replacing the system cursor.
- No loading screens or page-entry curtains.
- No parallax on text. Images only, and gently (max 10% displacement).
- No animation on anything the user is trying to read.

---

## 5. Logo

The existing wordmark: "LEADING IN" in navy, "AI" oversized with the
navy→cyan vertical gradient, "PODCAST" in navy beneath. Currently only exists as
raster (900×900 JPG on white).

Tasks:
1. Rebuild as SVG with the gradient as a real `<linearGradient>`, so it stays
   crisp and can be recoloured via CSS.
2. Produce a **dark-ground variant** — "LEADING IN" and "PODCAST" become white;
   the "AI" gradient stays.
3. Produce a **horizontal lockup** for the header (the square stack is too tall
   for a nav bar).
4. Produce a **monogram** — just the gradient "AI" — for the favicon and small sizes.
5. Favicon set: 16, 32, 180 (apple-touch), 192, 512, plus `favicon.svg`.

**Do not** reproduce the current thumbnail lockup that places the Leading in AI
mark beside the Agentic Edge mark. The brands have been separated; Agentic Edge
appears nowhere on this site.
