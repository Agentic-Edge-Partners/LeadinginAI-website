/**
 * npm run artwork [thumbnails|banner]
 *
 * Renders channel artwork from the same content and brand tokens the site
 * uses, so every thumbnail is on-brand without opening a design tool:
 *
 *   artwork/thumbnails/<slug>.jpg   1280×720 YouTube thumbnail per episode
 *   artwork/youtube-banner.jpg      2560×1440 channel banner (+ a guide with the safe area)
 *
 * Inputs: content/episodes/*.json (editorial.thumbnail.title, `*phrase*` = the big line),
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

/** Cutout with its right edge and bottom softly faded to transparent, so the photo melts into the ground. */
async function fadedCutout(
  file: string,
): Promise<{ src: string; width: number; height: number } | null> {
  if (!fs.existsSync(file)) return null;
  const src = sharp(fs.readFileSync(file));
  const { width = 1, height = 1 } = await src.metadata();
  const mask = (grad: string) =>
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs>${grad}</defs><rect width="${width}" height="${height}" fill="url(#m)"/></svg>`,
    );
  const horizontal = mask(
    `<linearGradient id="m" x1="0" y1="0" x2="1" y2="0"><stop offset="0.62" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
  );
  const vertical = mask(
    `<linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop offset="0.8" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0.15"/></linearGradient>`,
  );
  const buf = await sharp(await src.png().toBuffer())
    .composite([{ input: horizontal, blend: "dest-in" }])
    .png()
    .toBuffer()
    .then((b) =>
      sharp(b)
        .composite([{ input: vertical, blend: "dest-in" }])
        .png()
        .toBuffer(),
    );
  return { src: `data:image/png;base64,${buf.toString("base64")}`, width, height };
}

// ── Title parsing & fitting ───────────────────────────────────────────────────
/**
 * Thumbnail titles are one sentence with the punchline in *asterisks*:
 *   "From zero to *20 clients* in two years."
 * → small accent line, BIG white phrase, small accent line.
 */
function parseTitle(t: string): { pre: string; big: string; post: string } {
  const m = t.match(/^([^*]*)\*([^*]+)\*([^*]*)$/);
  if (!m) return { pre: "", big: t.trim(), post: "" };
  // Punctuation glued to the phrase ("*agents*, two founders") stays with the phrase.
  const trailing = m[3].match(/^([,.!?:;…]+)(.*)$/);
  const big = m[2].trim() + (trailing ? trailing[1] : "");
  const post = (trailing ? trailing[2] : m[3]).trim();
  return { pre: m[1].trim(), big, post };
}
/** Largest size at which `text` wraps into ≤ maxLines within maxWidth (greedy, measured). */
function fitText(
  text: string,
  font: string,
  maxWidth: number,
  maxLines: number,
  from: number,
  to: number,
  letterSpacing = 0,
) {
  for (let size = from; size >= to; size -= 4) {
    const space = textWidth(" ", font, size);
    let lines = 1,
      x = 0,
      ok = true;
    for (const w of text.split(/\s+/)) {
      const ww = textWidth(w, font, size, letterSpacing) * 1.05;
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
    if (ok) return size;
  }
  return to;
}

// ── Thumbnails ────────────────────────────────────────────────────────────────
async function thumbnails() {
  const lib = loadLibrary();
  for (const e of lib.episodes) {
    const guest = lib.guests.find((g) => g.slug === e.editorial.guests[0]);
    const { pre, big, post } = parseTitle(e.editorial.thumbnail?.title ?? e.sync.title);
    const TEXT_W = 680;
    // Size the three lines together: cyan lines at 70% of the white one, then grow the whole
    // block until it fills the column (≤ 2 lines per part, ≤ 560px tall).
    const linesFor = (text: string, size: number) => {
      if (!text) return 0;
      const space = textWidth(" ", "Archivo", size);
      let lines = 1,
        x = 0;
      for (const w of text.split(/\s+/)) {
        const ww = textWidth(w, "Archivo", size, -2) * 1.05;
        if (x > 0 && x + space + ww > TEXT_W) {
          lines++;
          x = ww;
        } else x += (x > 0 ? space : 0) + ww;
      }
      return lines;
    };
    let bigSize = 88;
    let smallSize = 62;
    for (let b = 150; b >= 88; b -= 4) {
      const sm = Math.round(b * 0.7);
      const lp = linesFor(pre, sm),
        lb = linesFor(big, b),
        lpo = linesFor(post, sm);
      const widest = Math.max(
        ...[pre, post]
          .filter(Boolean)
          .map((t) => Math.max(...t.split(/\s+/).map((w) => textWidth(w, "Archivo", sm, -2)))),
        ...big.split(/\s+/).map((w) => textWidth(w, "Archivo", b, -2)),
      );
      const height = lp * sm * 1.12 + lb * b * 1.0 + lpo * sm * 1.12 + 70;
      if (lb <= 2 && lp <= 2 && lpo <= 2 && widest <= TEXT_W && height <= 560) {
        bigSize = b;
        smallSize = sm;
        break;
      }
    }
    const cut = guest ? await fadedCutout(path.join(OUT, "guests", `${guest.slug}.png`)) : null;
    // Photo: bottom-aligned on the left with a little headroom; edges pre-faded into the ground.
    const gH = 664;
    const gW = cut ? Math.round((cut.width / cut.height) * gH) : 0;
    const gLeft = Math.round(290 - gW / 2);
    // "Name · Company"; fall back to the role, and to the name alone if the line would wrap.
    const withDetail = guest
      ? [guest.name, guest.company ?? guest.role].filter(Boolean).join(" · ")
      : "";
    const nameLine = withDetail.length > 36 ? (guest?.name ?? "") : withDetail;
    const el = (
      <div
        style={{
          width: 1280,
          height: 720,
          display: "flex",
          position: "relative",
          background: "#050608",
          overflow: "hidden",
          fontFamily: "Archivo",
        }}
      >
        {/* glow behind the text, like the reference's warm halo, in brand teal */}
        <div
          style={{
            position: "absolute",
            left: 420,
            top: -220,
            width: 1100,
            height: 1100,
            background: `radial-gradient(circle at 50% 50%, rgba(13,156,172,0.5) 0%, rgba(13,156,172,0.2) 40%, rgba(13,156,172,0) 70%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -200,
            top: 200,
            width: 900,
            height: 900,
            background: `radial-gradient(circle at 50% 50%, rgba(26,35,66,0.7) 0%, rgba(26,35,66,0) 70%)`,
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
        {/* fade the photo's right edge and bottom into the ground so the text sits clean */}
        <div
          style={{
            position: "absolute",
            left: 380,
            top: 0,
            width: 360,
            height: 720,
            background: `linear-gradient(90deg, rgba(5,6,8,0) 0%, rgba(5,6,8,0.85) 60%, rgba(5,6,8,0) 100%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 560,
            width: 1280,
            height: 160,
            background: `linear-gradient(180deg, rgba(5,6,8,0) 0%, rgba(5,6,8,0.9) 100%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 0,
            width: TEXT_W,
            height: 720,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {pre && (
            <div
              style={{
                display: "flex",
                fontSize: smallSize,
                lineHeight: 1.15,
                color: C.cyan,
                letterSpacing: -1,
              }}
            >
              {pre}
            </div>
          )}
          <div
            style={{
              display: "flex",
              marginTop: pre ? 4 : 0,
              fontSize: bigSize,
              lineHeight: 0.98,
              color: C.ink,
              letterSpacing: -3,
              textShadow: "0 6px 30px rgba(0,0,0,0.55)",
            }}
          >
            {big}
          </div>
          {post && (
            <div
              style={{
                display: "flex",
                marginTop: 6,
                fontSize: smallSize,
                lineHeight: 1.15,
                color: C.cyan,
                letterSpacing: -1,
              }}
            >
              {post}
            </div>
          )}
          {nameLine && (
            <div
              style={{
                display: "flex",
                marginTop: 26,
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: 28,
                color: C.ink,
                opacity: 0.92,
              }}
            >
              {nameLine}
            </div>
          )}
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
          background: `radial-gradient(circle at 50% 50%, rgba(13,156,172,0.35) 0%, rgba(13,156,172,0) 70%)`,
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

const what = process.argv[2] ?? "all";
(async () => {
  if (what === "all" || what === "thumbnails") await thumbnails();
  if (what === "all" || what === "banner") {
    await banner(false);
    await banner(true);
  }
})().catch((err) => {
  console.error(`✖ ${(err as Error).message}`);
  process.exit(1);
});
