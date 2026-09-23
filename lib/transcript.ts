/**
 * Transcript helpers shared by the sync script and the site.
 * Pure functions, no I/O.
 */
import type { TranscriptCue } from "./schemas";

export type TranscriptParagraph = { start: number; end: number; text: string };

const SENTENCE_END = /[.!?]["')\]]?$/;

/**
 * Merge short caption fragments into sentence-level cues: keep merging until a
 * fragment ends with sentence punctuation or the cue reaches ~25 words.
 * Preserves the `start` of the first fragment. (docs/CONTENT-MODEL.md)
 */
export function mergeCues(cues: TranscriptCue[], maxWords = 25): TranscriptCue[] {
  const out: TranscriptCue[] = [];
  let cur: TranscriptCue | null = null;
  for (const c of cues) {
    const text = c.text.replace(/\s+/g, " ").trim();
    if (!text) continue;
    if (!cur) {
      cur = { ...c, text };
      continue;
    }
    const merged: string = `${cur.text} ${text}`;
    cur = { ...cur, end: c.end, text: merged };
    if (SENTENCE_END.test(text) || merged.split(" ").length >= maxWords) {
      out.push(cur);
      cur = null;
    }
  }
  if (cur) out.push(cur);
  return out;
}

/**
 * Group sentence cues into readable paragraphs of roughly `targetWords` words,
 * breaking only at sentence boundaries. Used for rendering.
 */
export function toParagraphs(cues: TranscriptCue[], targetWords = 90): TranscriptParagraph[] {
  const out: TranscriptParagraph[] = [];
  let cur: TranscriptParagraph | null = null;
  let words = 0;
  for (const c of cues) {
    const text = c.text.trim();
    if (!text) continue;
    if (!cur) {
      cur = { start: c.start, end: c.end, text };
      words = text.split(/\s+/).length;
      continue;
    }
    cur.text += ` ${text}`;
    cur.end = c.end;
    words += text.split(/\s+/).length;
    if (words >= targetWords && SENTENCE_END.test(text)) {
      out.push(cur);
      cur = null;
      words = 0;
    }
  }
  if (cur) out.push(cur);
  return out;
}

/** Plain text of a transcript, for search indexing. */
export function transcriptText(cues: TranscriptCue[]): string {
  return cues
    .map((c) => c.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Total words, for the "n-minute read" style metadata. */
export function wordCount(cues: TranscriptCue[]): number {
  return transcriptText(cues).split(" ").filter(Boolean).length;
}
