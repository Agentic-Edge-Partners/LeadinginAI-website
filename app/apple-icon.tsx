import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const archivo = await readFile(path.join(process.cwd(), "assets", "fonts", "Archivo-Bold.ttf"));
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        color: "#00D9E0",
        fontFamily: "Archivo",
        fontSize: 108,
        letterSpacing: -4,
      }}
    >
      AI
    </div>,
    { ...size, fonts: [{ name: "Archivo", data: archivo, weight: 700, style: "normal" }] },
  );
}
