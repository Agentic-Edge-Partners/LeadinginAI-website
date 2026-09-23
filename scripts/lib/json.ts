import fs from "node:fs";
import path from "node:path";

/** Stable, diff-friendly JSON: 2-space indent, trailing newline. */
export function stringify(obj: unknown): string {
  return `${JSON.stringify(obj, null, 2)}\n`;
}

export function readJsonIfExists<T = unknown>(file: string): T | null {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

/** Writes only when the serialised content changed. Returns true if written. */
export function writeIfChanged(file: string, content: string): boolean {
  if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === content) return false;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return true;
}
