# Leading in AI — website

@AGENTS.md

Read `PLAN.md` first: it records the decisions already made with the owner. Then
`docs/WORKFLOW.md` (how content gets published), `docs/CONTENT-MODEL.md` and
`docs/BRAND.md`. Do not re-litigate decisions in PLAN.md §2 without asking.

## Where things live

|                       |                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `content/`            | All words and data. Episodes, guests, clips, transcripts, `topics.json`, `site.json`. Validated by Zod at build.         |
| `lib/content-core.ts` | Loads and cross-validates `/content`. `lib/content.ts` wraps it for pages. Add derived views here, not in components.    |
| `lib/schemas.ts`      | The content schemas. Change a schema → update `docs/CONTENT-MODEL.md`.                                                   |
| `components/*`        | Small, single-purpose components grouped by domain (`layout`, `episode`, `guest`, `discovery`, `motion`, `ui`, `forms`). |
| `app/`                | Routes. Pages read content via `lib/content.ts` and pass client-safe card data (`lib/cards.ts`) to client components.    |
| `scripts/sync.ts`     | `npm run sync`. Owns every `sync` block. Never writes inside `editorial`.                                                |
| `scripts/validate.ts` | `npm run validate`, also runs before every build.                                                                        |
| `app/globals.css`     | Brand tokens (`@theme`) and the type scale. Colours change here only.                                                    |
| `assets/fonts/`       | Static TTFs for OG images and the logo generator. Web fonts come from `next/font`.                                       |

## Rules

- **Content is data.** Text a human might ask to change belongs in `/content`, never in JSX.
- **`sync` vs `editorial`.** The sync script owns `sync`; humans own `editorial`. Keep them apart.
- **Agentic Edge appears nowhere on the site.** YouTube descriptions mention it; they are stored raw in `sync.youtubeDescription` and are never rendered. Do not render that field.
- **Motion is a finish, not structure.** Every effect degrades under `prefers-reduced-motion` (`MotionConfig reducedMotion="user"` + the CSS reset). Use `Reveal` / `StaggerGroup` / `MagneticButton`, not ad-hoc inline animation config.
- **No YouTube iframe in the initial load.** `PlayerEmbed` is click-to-load. Keep it that way.
- **Never call the newsletter provider from the client.** Only `app/api/subscribe/route.ts` talks to Beehiiv.
- **Apple Podcasts is a first-class slot.** `ListenOnLinks` renders `listen.apple` when non-null. Don't special-case it elsewhere.
- Builds must be deterministic and offline-safe: no network at build time.

## Skills

- `/publish-episode` (`.claude/skills/publish-episode/SKILL.md`): the whole new-episode
  pipeline — sync, editorial, guest, headshot, thumbnail, verify, commit, deploy. Use it
  whenever an episode needs publishing or a thumbnail needs regenerating.

## Commands

```bash
npm run dev          # localhost:3000
npm run sync         # pull new episodes/clips/transcripts into /content
npm run artwork      # regenerate thumbnails/banner into /artwork
npm run headshot -- <slug> <photo>   # cut out a guest photo for site + thumbnails
npm run validate     # content checks (also runs before build)
npm run build        # production build
npm run lint && npm run typecheck && npm run format
```

## Verifying a change

Run `npm run validate`, `npm run typecheck`, `npm run lint`, then `npm run build`.
For UI work, look at it in `npm run dev` with reduced motion on and off.
