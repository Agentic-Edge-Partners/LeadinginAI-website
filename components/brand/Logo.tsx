import { cx } from "@/lib/cx";

/**
 * Brand marks. The SVGs live in /public/brand and are generated from Archivo
 * Bold outlines (see docs/BRAND.md §5). Use these components rather than
 * hardcoding <img> paths so a logo change is a one-file edit.
 */
type Props = { className?: string; variant?: "dark" | "light"; priority?: boolean };

/** Horizontal lockup — header. Intrinsic ratio ≈ 9.85 : 1. */
export function Lockup({ className, variant = "dark" }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/brand/lockup-${variant}.svg`}
      alt="Leading in AI Podcast"
      width={1131}
      height={115}
      className={cx("h-6 w-auto", className)}
      decoding="async"
    />
  );
}

/** Stacked wordmark — footer, about. Intrinsic ratio ≈ 1.3 : 1. */
export function Wordmark({ className, variant = "dark" }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/brand/wordmark-${variant}.svg`}
      alt="Leading in AI Podcast"
      width={733}
      height={563}
      className={cx("h-auto w-40", className)}
      decoding="async"
      loading="lazy"
    />
  );
}

/** Gradient "AI" monogram — small sizes, favicon, avatars. */
export function Monogram({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/monogram.svg"
      alt=""
      aria-hidden="true"
      width={512}
      height={512}
      className={cx("size-8", className)}
      decoding="async"
    />
  );
}
