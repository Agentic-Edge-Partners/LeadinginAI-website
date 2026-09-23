import { ImageResponse } from "next/og";
import { getEpisodes, getGuests, getSite } from "@/lib/content";
import { loadOgFonts, og, OG_SIZE, OgFrame } from "@/lib/og";

export const alt = "Leading in AI Podcast";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const site = getSite();
  const fonts = await loadOgFonts();
  const n = getEpisodes().length;
  const g = getGuests().filter((x) => (x.episodes?.length ?? 0) > 0).length;
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
        >{`${n} EPISODES · ${g} GUESTS`}</div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
        <div
          style={{
            display: "flex",
            fontFamily: "Archivo",
            fontSize: 96,
            lineHeight: 0.95,
            letterSpacing: -3,
            color: og.ink,
          }}
        >
          LEADING IN
        </div>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Archivo",
              fontSize: 160,
              lineHeight: 0.95,
              letterSpacing: -6,
              color: og.cyan,
            }}
          >
            AI
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Archivo",
              fontSize: 48,
              letterSpacing: 6,
              color: og.dim,
              marginLeft: 28,
            }}
          >
            PODCAST
          </div>
        </div>
        <div
          style={{ display: "flex", marginTop: 36, fontSize: 30, color: og.muted, maxWidth: 900 }}
        >
          {site.tagline}
        </div>
      </div>
    </OgFrame>,
    { ...size, fonts },
  );
}
