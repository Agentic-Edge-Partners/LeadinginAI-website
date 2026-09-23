import { cx } from "@/lib/cx";

/** 1280px max width, 24px gutter mobile / 48px desktop (docs/BRAND.md §3). */
export function Container({
  className,
  children,
  as: Tag = "div",
}: {
  className?: string;
  children: React.ReactNode;
  as?: "div" | "section" | "nav" | "header" | "footer";
}) {
  return <Tag className={cx("mx-auto w-full max-w-site px-6 lg:px-12", className)}>{children}</Tag>;
}
