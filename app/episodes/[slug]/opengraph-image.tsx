import { ImageResponse } from "next/og";
import { getEpisode, getEpisodes, getGuestsForEpisode } from "@/lib/content";
import { episodeLabel, formatDate, joinNames } from "@/lib/format";
import { loadOgFonts, og, OG_SIZE, OgFrame, publicImageDataUrl } from "@/lib/og";
import { initials } from "@/lib/format";

export const alt = "Leading in AI Podcast episode";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getEpisodes().map((e) => ({ slug: e.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = getEpisode(slug);
  const fonts = await loadOgFonts();
  if (!e) {
    return new ImageResponse(
      <OgFrame>
        <div style={{ fontFamily: "Archivo", fontSize: 64 }}>Leading in AI</div>
      </OgFrame>,
      { ...size, fonts },
    );
  }
  const guests = getGuestsForEpisode(e);
  const guest = guests[0];
  const headshot = await publicImageDataUrl(guest?.headshot ?? null);
  const title = e.sync.title.length > 70 ? `${e.sync.title.slice(0, 68)}…` : e.sync.title;
  const titleSize = title.length > 48 ? 52 : 64;

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
          {formatDate(e.sync.publishedAt).toUpperCase()}
        </div>
      }
    >
      <div style={{ display: "flex", gap: 48, flex: 1 }}>
        <div
          style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "JetBrains Mono",
              fontSize: 22,
              color: og.cyan,
              letterSpacing: 3,
            }}
          >
            {episodeLabel(e.number)}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontFamily: "Archivo",
              fontSize: titleSize,
              lineHeight: 1.02,
              letterSpacing: -1.5,
              color: og.ink,
            }}
          >
            {title}
          </div>
          {guests.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", marginTop: 28 }}>
              <div style={{ display: "flex", fontSize: 30, fontWeight: 600, color: og.ink }}>
                {joinNames(guests.map((g) => g.name))}
              </div>
              {guest && (
                <div style={{ display: "flex", fontSize: 22, color: og.muted, marginTop: 6 }}>
                  {[guest.role, guest.company].filter(Boolean).join(", ")}
                </div>
              )}
            </div>
          )}
        </div>
        {guest && (
          <div
            style={{
              display: "flex",
              width: 300,
              height: 300,
              borderRadius: 24,
              overflow: "hidden",
              alignSelf: "center",
              background: `linear-gradient(180deg, #3B4F8F 0%, ${og.teal} 50%, ${og.cyan} 100%)`,
              alignItems: "center",
              justifyContent: "center",
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
                {initials(guest.name)}
              </div>
            )}
          </div>
        )}
      </div>
    </OgFrame>,
    { ...size, fonts },
  );
}
