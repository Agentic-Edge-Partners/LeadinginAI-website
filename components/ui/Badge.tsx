import { cx } from "@/lib/cx";

/** Mono metadata chip: episode numbers, durations, dates. */
export function Badge({
  children,
  className,
  tone = "dim",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "dim" | "ink" | "cyan" | "solid";
}) {
  const tones = {
    dim: "text-ink-dim",
    ink: "text-ink",
    cyan: "text-cyan",
    solid: "rounded-sm bg-ground/80 px-1.5 py-0.5 text-ink backdrop-blur",
  };
  return <span className={cx("meta", tones[tone], className)}>{children}</span>;
}
