import { ImageResponse } from "next/og";
import { getEpisodesForGuest, getGuest, getGuests } from "@/lib/content";
import { initials } from "@/lib/format";
import { loadOgFonts, og, OG_SIZE, OgFrame, publicImageDataUrl } from "@/lib/og";

export const alt = "Leading in AI Podcast guest";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getGuests().map((g) => ({ slug: g.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = getGuest(slug);
  const fonts = await loadOgFonts();
  if (!g)
    return new ImageResponse(
      <OgFrame>
        <div style={{ fontFamily: "Archivo", fontSize: 64 }}>Leading in AI</div>
      </OgFrame>,
      { ...size, fonts },
    );
  const headshot = await publicImageDataUrl(g.headshot);
  const n = getEpisodesForGuest(slug).length;
  return new ImageResponse(
    <OgFrame
      footer={
        <div
          style={{
            display: "flex",
            fontFamily: "JetBrains Mono",
            fontSize: 18,
            color: og.dim,
            letterSpacing: 2,
          }}
        >
          {n === 1 ? "1 EPISODE" : `${n} EPISODES`}
        </div>
      }
    >
      <div style={{ display: "flex", gap: 48, flex: 1, alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            width: 300,
            height: 300,
            borderRadius: 24,
            overflow: "hidden",
            background: `linear-gradient(180deg, #3B4F8F 0%, ${og.teal} 50%, ${og.cyan} 100%)`,
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {headshot ? (
            <img src={headshot} width={300} height={300} style={{ objectFit: "cover" }} alt="" />
          ) : (
            <div
              style={{
                display: "flex",
                fontFamily: "Archivo",
                fontSize: 120,
                color: "rgba(0,0,0,0.75)",
              }}
            >
              {initials(g.name)}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div
            style={{
              display: "flex",
              fontFamily: "JetBrains Mono",
              fontSize: 22,
              color: og.cyan,
              letterSpacing: 3,
            }}
          >
            GUEST
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 16,
              fontFamily: "Archivo",
              fontSize: 68,
              lineHeight: 1.02,
              letterSpacing: -1.5,
              color: og.ink,
            }}
          >
            {g.name}
          </div>
          <div style={{ display: "flex", marginTop: 20, fontSize: 28, color: og.muted }}>
            {[g.role, g.company].filter(Boolean).join(", ")}
          </div>
        </div>
      </div>
    </OgFrame>,
    { ...size, fonts },
  );
}
