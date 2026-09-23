/**
 * Shared pieces for the dynamic Open Graph images (the opengraph-image.tsx files under app/).
 * Fonts are vendored in /assets/fonts so builds stay offline-safe.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

export const OG_SIZE = { width: 1200, height: 630 } as const;

const FONT_DIR = path.join(process.cwd(), "assets", "fonts");

export async function loadOgFonts() {
  const [archivo, inter, interSemi, mono] = await Promise.all([
    readFile(path.join(FONT_DIR, "Archivo-Bold.ttf")),
    readFile(path.join(FONT_DIR, "Inter-Regular.ttf")),
    readFile(path.join(FONT_DIR, "Inter-SemiBold.ttf")),
    readFile(path.join(FONT_DIR, "JetBrainsMono-Medium.ttf")),
  ]);
  return [
    { name: "Archivo", data: archivo, weight: 700 as const, style: "normal" as const },
    { name: "Inter", data: inter, weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: interSemi, weight: 600 as const, style: "normal" as const },
    { name: "JetBrains Mono", data: mono, weight: 500 as const, style: "normal" as const },
  ];
}

/** Reads a /public image as a data URL for embedding in an OG image. */
export async function publicImageDataUrl(publicPath: string | null): Promise<string | null> {
  if (!publicPath) return null;
  try {
    const buf = await readFile(path.join(process.cwd(), "public", publicPath));
    const ext = path.extname(publicPath).slice(1).toLowerCase();
    const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export const og = {
  ground: "#000000",
  surface: "#0B0E14",
  navy: "#1A2342",
  teal: "#0D9CAC",
  cyan: "#00D9E0",
  ink: "#FFFFFF",
  muted: "#B4BCCC",
  dim: "#8A93A6",
  line: "#1E2534",
} as const;

/** The frame every OG image shares: black ground, gradient edge, wordmark. */
export function OgFrame({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: og.ground,
        color: og.ink,
        fontFamily: "Inter",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          width: 14,
          height: "100%",
          background: `linear-gradient(180deg, ${og.navy} 0%, ${og.teal} 55%, ${og.cyan} 100%)`,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
          padding: "56px 64px 48px 56px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>{children}</div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontFamily: "Archivo",
              fontSize: 30,
              letterSpacing: -0.5,
            }}
          >
            <span style={{ color: og.ink }}>LEADING IN</span>
            <span style={{ color: og.cyan, marginLeft: 10, fontSize: 40 }}>AI</span>
            <span style={{ color: og.dim, marginLeft: 12, fontSize: 16, letterSpacing: 3 }}>
              PODCAST
            </span>
          </div>
          {footer}
        </div>
      </div>
    </div>
  );
}
