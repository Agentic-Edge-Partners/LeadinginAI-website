/**
 * npm run headshot -- <guest-slug> <photo.jpg|png>
 *
 * Turns any photo of a guest into the two assets the site and the artwork
 * generator need, using macOS's built-in Vision subject segmentation:
 *   artwork/guests/<slug>.png   transparent cutout (source for thumbnails)
 *   public/guests/<slug>.jpg    800×800 square headshot on the brand ground
 * …and sets "headshot" in content/guests/<slug>.json.
 *
 * Best input: a photo ≥1200px tall, guest facing the camera, chest-up or wider.
 * macOS only (needs Xcode Command Line Tools for the one-time compile).
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const TOOL_SRC = path.join(ROOT, "scripts", "cutout", "cutout.swift");
const TOOL_BIN = path.join(ROOT, "scripts", "cutout", "cutout");

function ensureTool() {
  if (fs.existsSync(TOOL_BIN) && fs.statSync(TOOL_BIN).mtimeMs >= fs.statSync(TOOL_SRC).mtimeMs)
    return;
  console.log("Compiling the Vision cutout tool (one time)…");
  execFileSync(
    "xcrun",
    ["swiftc", "-O", TOOL_SRC, "-o", TOOL_BIN, "-framework", "Vision", "-framework", "CoreImage"],
    { stdio: "inherit" },
  );
}

export async function makeHeadshot(slug: string, input: string) {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`"${slug}" is not a guest slug`);
  const guestFile = path.join(ROOT, "content", "guests", `${slug}.json`);
  if (!fs.existsSync(guestFile)) throw new Error(`No guest file ${path.relative(ROOT, guestFile)}`);
  ensureTool();

  const tmp = path.join(ROOT, "artwork", "raw", `.${slug}.cutout.png`);
  execFileSync(TOOL_BIN, [path.resolve(input), tmp], { stdio: "inherit" });

  // Trim transparent margins → the thumbnail source.
  const cutoutPath = path.join(ROOT, "artwork", "guests", `${slug}.png`);
  const cutout = await sharp(tmp).trim({ threshold: 8 }).png().toBuffer();
  fs.writeFileSync(cutoutPath, cutout);
  fs.unlinkSync(tmp);
  const meta = await sharp(cutout).metadata();

  // Square headshot: subject bottom-aligned at ~92% height on the brand ground.
  const S = 800;
  const targetH = Math.round(S * 0.92);
  let person = sharp(cutout).resize({ height: targetH });
  const pm = await person.toBuffer({ resolveWithObject: true });
  if (pm.info.width > S * 0.96) person = sharp(cutout).resize({ width: Math.round(S * 0.96) });
  const personBuf = await person.png().toBuffer();
  const pInfo = await sharp(personBuf).metadata();
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1A2342" stop-opacity="0.35"/><stop offset="1" stop-color="#0B0E14" stop-opacity="0"/></linearGradient>
      <radialGradient id="r" cx="0.5" cy="1.05" r="0.75"><stop offset="0" stop-color="#0D9CAC" stop-opacity="0.55"/><stop offset="1" stop-color="#0D9CAC" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="${S}" height="${S}" fill="#0B0E14"/>
    <rect width="${S}" height="${S}" fill="url(#g)"/>
    <rect width="${S}" height="${S}" fill="url(#r)"/>
  </svg>`);
  const out = path.join(ROOT, "public", "guests", `${slug}.jpg`);
  await sharp(bg)
    .composite([
      {
        input: personBuf,
        left: Math.round((S - (pInfo.width ?? 0)) / 2),
        top: S - (pInfo.height ?? 0),
      },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(out);

  const guest = JSON.parse(fs.readFileSync(guestFile, "utf8"));
  guest.headshot = `/guests/${slug}.jpg`;
  fs.writeFileSync(guestFile, `${JSON.stringify(guest, null, 2)}\n`);
  console.log(
    `✔ ${slug}: cutout ${meta.width}×${meta.height} → artwork/guests/${slug}.png, headshot → public/guests/${slug}.jpg`,
  );
  if ((meta.height ?? 0) < 900)
    console.log(
      `⚠ Source is small (${meta.height}px tall). Thumbnails will look soft; use a photo ≥1200px tall when you have one.`,
    );
}

if (process.argv[1] && process.argv[1].endsWith("headshot.ts")) {
  const [slug, input] = process.argv.slice(2);
  if (!slug || !input) {
    console.error("usage: npm run headshot -- <guest-slug> <photo.jpg>");
    process.exit(1);
  }
  makeHeadshot(slug, input).catch((err) => {
    console.error(`✖ ${(err as Error).message}`);
    process.exit(1);
  });
}
