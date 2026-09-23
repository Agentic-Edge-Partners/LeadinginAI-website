/**
 * SRT / WebVTT parsing for the transcript inbox. Pure, no I/O.
 * Accepts the .srt YouTube Studio exports and plain .vtt files.
 */
import type { TranscriptCue } from "./schemas";

function parseTime(s: string): number {
  // 00:12:34,567  |  00:12:34.567  |  12:34.567
  const m = s.trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{2})[.,](\d{1,3})$/);
  if (!m) throw new Error(`Unrecognised timestamp "${s}"`);
  const [, h, mm, ss, ms] = m;
  return Number(h ?? 0) * 3600 + Number(mm) * 60 + Number(ss) + Number(ms.padEnd(3, "0")) / 1000;
}

const stripTags = (t: string) =>
  t
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

export function parseSrt(input: string): TranscriptCue[] {
  const text = input.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const blocks = text.split(/\n{2,}/);
  const cues: TranscriptCue[] = [];
  for (const block of blocks) {
    const lines = block.split("\n").filter((l) => l.trim() !== "");
    if (lines.length === 0) continue;
    if (/^WEBVTT/i.test(lines[0]) || /^(NOTE|STYLE|REGION)/.test(lines[0])) continue;
    let i = 0;
    if (/^\d+$/.test(lines[0].trim())) i = 1; // numeric index (SRT)
    const timing = lines[i]?.match(/(\S+)\s+-->\s+(\S+)/);
    if (!timing) continue;
    const start = parseTime(timing[1]);
    const end = parseTime(timing[2]);
    const body = stripTags(lines.slice(i + 1).join(" "))
      .replace(/\s+/g, " ")
      .trim();
    if (!body) continue;
    // YouTube auto-captions repeat the previous line in each block; drop the duplicate prefix.
    const prev = cues[cues.length - 1];
    const clean = prev && body.startsWith(prev.text) ? body.slice(prev.text.length).trim() : body;
    if (!clean) continue;
    cues.push({ start, end, speaker: null, text: clean });
  }
  return cues;
}
