import { cx } from "@/lib/cx";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cx("animate-pulse rounded-img bg-surface-2", className)} aria-hidden="true" />
  );
}
