/**
 * npm run artwork [thumbnails|banner|logos]
 *
 * Renders channel artwork from the same content and brand tokens the site
 * uses, so every thumbnail is on-brand without opening a design tool:
 *
 *   artwork/thumbnails/<slug>.jpg   1280×720 YouTube thumbnail per episode
 *   artwork/youtube-banner.jpg      2560×1440 channel banner (+ a guide with the safe area)
 *   artwork/logo-concepts.jpg       three logo directions for review
 *
 * Inputs: content/episodes/*.json (editorial.thumbnail.title, `*word*` = accent),
 * content/guests/*.json, artwork/guests/<slug>.png (transparent cutout — make one
 * with `npm run headshot -- <slug> <photo>`).
 */
import fs from "node:fs";
import path from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import { loadLibrary } from "../lib/content-core";
import { episodeLabel } from "../lib/format";

const ROOT = process.cwd();
const FONTS = path.join(ROOT, "assets", "fonts");
/** Per-glyph advance widths in em, generated from the TTFs (see docs/WORKFLOW.md → Artwork). */
const WIDTHS: Record<string, Record<string, number>> = JSON.parse(
  fs.readFileSync(path.join(FONTS, "advance-widths.json"), "utf8"),
);
function textWidth(text: string, font: string, size: number, letterSpacing = 0): number {
  const table = WIDTHS[font] ?? {};
  let w = 0;
  for (const ch of text) w += (table[ch] ?? table[ch.toUpperCase()] ?? 0.55) * size + letterSpacing;
  return w;
}
const OUT = path.join(ROOT, "artwork");
const C = {
  ground: "#000000",
  surface: "#0B0E14",
  navy: "#1A2342",
  teal: "#0D9CAC",
  cyan: "#00D9E0",
  ink: "#FFFFFF",
  muted: "#B4BCCC",
  dim: "#8A93A6",
};

const fonts = [
  {
    name: "Archivo",
    data: fs.readFileSync(path.join(FONTS, "Archivo-Bold.ttf")),
    weight: 700 as const,
    style: "normal" as const,
  },
  {
    name: "Archivo Condensed",
    data: fs.readFileSync(path.join(FONTS, "Archivo-CondensedExtraBold.ttf")),
    weight: 800 as const,
    style: "normal" as const,
  },
  {
    name: "Inter",
    data: fs.readFileSync(path.join(FONTS, "Inter-Regular.ttf")),
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    name: "Inter",
    data: fs.readFileSync(path.join(FONTS, "Inter-SemiBold.ttf")),
    weight: 600 as const,
    style: "normal" as const,
  },
  {
    name: "JetBrains Mono",
    data: fs.readFileSync(path.join(FONTS, "JetBrainsMono-Medium.ttf")),
    weight: 500 as const,
    style: "normal" as const,
  },
];

async function render(
  el: React.ReactNode,
  width: number,
  height: number,
  file: string,
  quality = 90,
) {
  const svg = await satori(el as React.ReactElement, { width, height, fonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (file.endsWith(".png")) fs.writeFileSync(file, png);
  else await sharp(png).jpeg({ quality, mozjpeg: true }).toFile(file);
  console.log(`✔ ${path.relative(ROOT, file)}`);
}

async function dataUrl(
  file: string,
): Promise<{ src: string; width: number; height: number } | null> {
  if (!fs.existsSync(file)) return null;
  const buf = fs.readFileSync(file);
  const meta = await sharp(buf).metadata();
  return {
    src: `data:image/png;base64,${buf.toString("base64")}`,
    width: meta.width ?? 1,
    height: meta.height ?? 1,
  };
}

// ── Title fitting ─────────────────────────────────────────────────────────────
type Word = { text: string; accent: boolean };
function parseTitle(t: string): Word[] {
  return t
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => {
      const accent = /^\*.*\*[,.!?]?$/.test(w) || /\*/.test(w);
      return { text: w.replace(/\*/g, ""), accent };
    });
}
/** Picks the largest size whose greedy wrap fits `maxWidth` in ≤ maxLines (uppercase, measured). */
function fitTitle(words: Word[], maxWidth: number, maxLines: number, letterSpacing = -1) {
  for (let size = 136; size >= 64; size -= 4) {
    const space = textWidth(" ", "Archivo Condensed", size);
    let lines = 1,
      x = 0,
      ok = true;
    for (const w of words) {
      const ww = textWidth(w.text.toUpperCase(), "Archivo Condensed", size, letterSpacing) * 1.06; // measured + safety margin
      if (ww > maxWidth) {
        ok = false;
        break;
      }
      if (x > 0 && x + space + ww > maxWidth) {
        lines++;
        x = ww;
      } else x += (x > 0 ? space : 0) + ww;
      if (lines > maxLines) {
        ok = false;
        break;
      }
    }
    // Keep the title block under 400px tall so the name and role always fit beneath it.
    if (ok && lines * size * 0.92 <= 400) return size;
  }
  return 64;
}

const Mark = ({ size = 1 }: { size?: number }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 * size }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 56 * size,
        height: 56 * size,
        borderRadius: 12 * size,
        background: `linear-gradient(180deg, #3B4F8F 0%, ${C.teal} 50%, ${C.cyan} 100%)`,
      }}
    >
      <span
        style={{
          fontFamily: "Archivo",
          fontSize: 30 * size,
          color: "rgba(0,0,0,0.8)",
          letterSpacing: -1,
        }}
      >
        AI
      </span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
      <span
        style={{ fontFamily: "Archivo", fontSize: 20 * size, color: C.ink, letterSpacing: 0.5 }}
      >
        LEADING IN AI
      </span>
      <span
        style={{
          fontFamily: "JetBrains Mono",
          fontSize: 11 * size,
          color: C.dim,
          letterSpacing: 3 * size,
          marginTop: 4 * size,
        }}
      >
        PODCAST
      </span>
    </div>
  </div>
);

// ── Thumbnails ────────────────────────────────────────────────────────────────
async function thumbnails() {
  const lib = loadLibrary();
  for (const e of lib.episodes) {
    const guest = lib.guests.find((g) => g.slug === e.editorial.guests[0]);
    const words = parseTitle(e.editorial.thumbnail?.title ?? e.sync.title);
    const size = fitTitle(words, 600, 3);
    const cut = guest ? await dataUrl(path.join(OUT, "guests", `${guest.slug}.png`)) : null;
    const gH = 700;
    const gW = cut ? Math.round((cut.width / cut.height) * gH) : 0;
    const gLeft = Math.min(1280 - gW + 40, Math.round(950 - gW / 2));
    const el = (
      <div
        style={{
          width: 1280,
          height: 720,
          display: "flex",
          position: "relative",
          background: C.surface,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 640,
            top: 0,
            width: 640,
            height: 720,
            background: `linear-gradient(165deg, #12BFD0 0%, ${C.teal} 50%, #086B76 100%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 620,
            top: 0,
            width: 60,
            height: 720,
            background: `linear-gradient(90deg, ${C.surface} 0%, rgba(11,14,20,0) 100%)`,
          }}
        />
        {cut && (
          <img
            src={cut.src}
            width={gW}
            height={gH}
            style={{ position: "absolute", left: gLeft, top: 720 - gH }}
          />
        )}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 640,
            height: 720,
            background: `linear-gradient(90deg, ${C.surface} 82%, rgba(11,14,20,0) 100%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 56,
            top: 52,
            width: 600,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span
            style={{ fontFamily: "JetBrains Mono", fontSize: 26, color: C.cyan, letterSpacing: 5 }}
          >
            {episodeLabel(e.number)}
          </span>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              marginTop: 26,
              width: 600,
              fontFamily: "Archivo Condensed",
              fontSize: size,
              lineHeight: 0.92,
              letterSpacing: -1,
              textTransform: "uppercase",
              color: C.ink,
            }}
          >
            {words.map((w, i) => (
              <span
                key={i}
                style={{
                  marginRight: textWidth(" ", "Archivo Condensed", size),
                  color: w.accent ? C.cyan : C.ink,
                }}
              >
                {w.text}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 30, width: 120, height: 5, background: C.cyan }} />
          {guest && (
            <div style={{ display: "flex", flexDirection: "column", width: 600, marginTop: 20 }}>
              <span
                style={{
                  fontFamily: "Archivo",
                  fontSize: guest.name.length > 18 ? 34 : 40,
                  color: C.ink,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {guest.name}
              </span>
              <span
                style={{
                  marginTop: 8,
                  fontFamily: "Inter",
                  fontSize: 24,
                  color: C.muted,
                  lineHeight: 1.3,
                }}
              >
                {[guest.role, guest.company].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
        </div>
        <div style={{ position: "absolute", right: 40, top: 34, display: "flex" }}>
          <Mark />
        </div>
      </div>
    );
    await render(el, 1280, 720, path.join(OUT, "thumbnails", `${e.slug}.jpg`), 92);
    if (!cut) console.log(`  ⚠ ${e.slug}: no cutout at artwork/guests/${guest?.slug}.png`);
  }
}

// ── Channel banner ────────────────────────────────────────────────────────────
async function banner(guide = false) {
  const lib = loadLibrary();
  const W = 2560,
    H = 1440;
  const safe = { w: 1546, h: 423 };
  const el = (
    <div
      style={{
        width: W,
        height: H,
        display: "flex",
        position: "relative",
        background: C.ground,
        overflow: "hidden",
        fontFamily: "Archivo",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: W / 2 - 900,
          top: H / 2 - 600,
          width: 1800,
          height: 1200,
          background: `radial-gradient(closest-side, rgba(13,156,172,0.35), rgba(0,0,0,0))`,
        }}
      />
      <span
        style={{
          position: "absolute",
          left: -60,
          top: 120,
          fontFamily: "Archivo",
          fontSize: 1100,
          lineHeight: 1,
          color: "rgba(255,255,255,0.035)",
          letterSpacing: -40,
        }}
      >
        AI
      </span>
      <span
        style={{
          position: "absolute",
          right: -40,
          top: 260,
          fontFamily: "Archivo",
          fontSize: 1100,
          lineHeight: 1,
          color: "rgba(0,217,224,0.05)",
          letterSpacing: -40,
        }}
      >
        AI
      </span>
      <div
        style={{
          position: "absolute",
          left: (W - safe.w) / 2,
          top: (H - safe.h) / 2,
          width: safe.w,
          height: safe.h,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: guide ? "4px dashed #00D9E0" : "none",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ fontSize: 132, color: C.ink, letterSpacing: -3 }}>LEADING IN</span>
            <span style={{ fontSize: 176, color: C.cyan, letterSpacing: -6, marginLeft: 28 }}>
              AI
            </span>
          </div>
          <span
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: 30,
              color: C.dim,
              letterSpacing: 12,
              marginTop: 4,
            }}
          >
            PODCAST
          </span>
          <span style={{ fontFamily: "Inter", fontSize: 38, color: C.muted, marginTop: 30 }}>
            {lib.site.tagline}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14 }}>
          <span
            style={{ fontFamily: "JetBrains Mono", fontSize: 26, color: C.cyan, letterSpacing: 6 }}
          >
            NEW EPISODES WEEKLY
          </span>
          <span style={{ fontFamily: "Inter", fontSize: 28, color: C.muted }}>
            YouTube · Spotify · Apple Podcasts
          </span>
        </div>
      </div>
    </div>
  );
  await render(
    el,
    W,
    H,
    path.join(OUT, guide ? "youtube-banner-guide.jpg" : "youtube-banner.jpg"),
    90,
  );
}

// ── Logo concepts ─────────────────────────────────────────────────────────────
function Bars({ h = 1 }: { h?: number }) {
  const heights = [0.35, 0.65, 1, 0.65, 0.35];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 * h, height: 56 * h }}>
      {heights.map((f, i) => (
        <div
          key={i}
          style={{
            width: 9 * h,
            height: 56 * h * f,
            borderRadius: 5 * h,
            background: `linear-gradient(180deg, ${C.cyan} 0%, ${C.teal} 100%)`,
          }}
        />
      ))}
    </div>
  );
}
const ConceptA = ({ light = false }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
    <span
      style={{
        fontFamily: "Archivo",
        fontSize: 64,
        color: light ? C.navy : C.ink,
        letterSpacing: -1,
      }}
    >
      LEADING IN
    </span>
    <span style={{ fontFamily: "Archivo", fontSize: 96, color: C.cyan, letterSpacing: -3 }}>
      AI
    </span>
    <span
      style={{
        fontFamily: "JetBrains Mono",
        fontSize: 22,
        color: light ? "#4B5675" : C.dim,
        letterSpacing: 6,
      }}
    >
      PODCAST
    </span>
  </div>
);
const ConceptB = ({ light = false }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 104,
        height: 104,
        borderRadius: 24,
        background: `linear-gradient(180deg, #3B4F8F 0%, ${C.teal} 50%, ${C.cyan} 100%)`,
      }}
    >
      <span
        style={{
          fontFamily: "Archivo",
          fontSize: 58,
          color: "rgba(0,0,0,0.82)",
          letterSpacing: -2,
        }}
      >
        AI
      </span>
    </div>
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span
        style={{
          fontFamily: "Archivo",
          fontSize: 56,
          color: light ? C.navy : C.ink,
          letterSpacing: -1,
          lineHeight: 1,
        }}
      >
        LEADING IN AI
      </span>
      <span
        style={{
          fontFamily: "JetBrains Mono",
          fontSize: 20,
          color: light ? "#4B5675" : C.dim,
          letterSpacing: 8,
          marginTop: 10,
        }}
      >
        PODCAST
      </span>
    </div>
  </div>
);
const ConceptC = ({ light = false }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
    <Bars h={1.6} />
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span
        style={{
          fontFamily: "Archivo Condensed",
          fontSize: 84,
          color: light ? C.navy : C.ink,
          letterSpacing: 0,
          lineHeight: 0.9,
          textTransform: "uppercase",
        }}
      >
        Leading in AI
      </span>
      <span
        style={{
          fontFamily: "JetBrains Mono",
          fontSize: 20,
          color: light ? "#4B5675" : C.dim,
          letterSpacing: 10,
          marginTop: 10,
        }}
      >
        THE PODCAST
      </span>
    </div>
  </div>
);
async function logos() {
  const rows = [
    { label: "A · Current mark, refined (what the site uses today)", El: ConceptA },
    { label: "B · Tile monogram + wordmark (works as avatar, favicon, watermark)", El: ConceptB },
    {
      label: "C · Signal bars + condensed wordmark (audio cue, more 'show', less 'consultancy')",
      El: ConceptC,
    },
  ];
  const el = (
    <div
      style={{
        width: 1800,
        height: 1500,
        display: "flex",
        flexDirection: "column",
        background: C.ground,
        padding: 60,
        fontFamily: "Inter",
      }}
    >
      <span style={{ fontFamily: "JetBrains Mono", fontSize: 22, color: C.cyan, letterSpacing: 6 }}>
        LOGO DIRECTIONS · FOR REVIEW
      </span>
      {rows.map(({ label, El }, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", marginTop: 44 }}>
          <span style={{ fontSize: 26, color: C.muted }}>{label}</span>
          <div style={{ display: "flex", marginTop: 20, gap: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flex: 1,
                height: 300,
                padding: 48,
                borderRadius: 24,
                background: C.surface,
                border: "1px solid #1E2534",
              }}
            >
              <El />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: 720,
                height: 300,
                padding: 48,
                borderRadius: 24,
                background: "#FFFFFF",
              }}
            >
              <El light />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  await render(el, 1800, 1500, path.join(OUT, "logo-concepts.jpg"), 90);
}

const what = process.argv[2] ?? "all";
(async () => {
  if (what === "all" || what === "thumbnails") await thumbnails();
  if (what === "all" || what === "banner") {
    await banner(false);
    await banner(true);
  }
  if (what === "all" || what === "logos") await logos();
})().catch((err) => {
  console.error(`✖ ${(err as Error).message}`);
  process.exit(1);
});
