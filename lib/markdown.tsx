/**
 * A deliberately tiny Markdown renderer for optional show notes
 * (content/episodes/<slug>.md). Supports headings, paragraphs, bullet lists,
 * links, bold and italics. Anything richer belongs in the JSON editorial
 * block rather than prose.
 */
import type { ReactNode } from "react";

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${key}-${i++}`;
    if (m[1])
      out.push(
        <a
          key={k}
          href={m[2]}
          className="text-cyan underline underline-offset-4"
          target={/^https?:/.test(m[2]) ? "_blank" : undefined}
          rel="noopener noreferrer"
        >
          {m[1]}
        </a>,
      );
    else if (m[3])
      out.push(
        <strong key={k} className="font-semibold text-ink">
          {m[3]}
        </strong>,
      );
    else if (m[4]) out.push(<em key={k}>{m[4]}</em>);
    else if (m[5])
      out.push(
        <code key={k} className="font-mono text-sm text-ink">
          {m[5]}
        </code>,
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const body = source.replace(/^---[\s\S]*?---\s*/, ""); // drop frontmatter if any
  const blocks = body
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  return (
    <div className="flex flex-col gap-5 text-ink-muted">
      {blocks.map((b, i) => {
        const h = b.match(/^(#{1,4})\s+(.*)$/);
        if (h) {
          const level = h[1].length;
          const cls = level <= 2 ? "display-m text-ink" : "heading text-ink";
          const Tag = (level <= 2 ? "h3" : "h4") as "h3" | "h4";
          return (
            <Tag key={i} className={cls}>
              {inline(h[2], `h${i}`)}
            </Tag>
          );
        }
        if (/^(-|\*|\d+\.)\s/.test(b)) {
          const items = b.split("\n").map((l) => l.replace(/^(-|\*|\d+\.)\s+/, ""));
          const ordered = /^\d+\./.test(b);
          const L = (ordered ? "ol" : "ul") as "ol" | "ul";
          return (
            <L key={i} className={ordered ? "list-decimal pl-6" : "list-disc pl-6"}>
              {items.map((it, j) => (
                <li key={j}>{inline(it, `li${i}-${j}`)}</li>
              ))}
            </L>
          );
        }
        return (
          <p key={i} className="leading-relaxed">
            {inline(b.replace(/\n/g, " "), `p${i}`)}
          </p>
        );
      })}
    </div>
  );
}
