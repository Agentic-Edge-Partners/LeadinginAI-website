import Link from "next/link";
import { cx } from "@/lib/cx";

/** Teal-tinted pill for topics and editorial emphasis. Links when given href. */
export function Tag({
  children,
  href,
  className,
  active,
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
  active?: boolean;
}) {
  const cls = cx(
    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
    active
      ? "border-cyan bg-cyan text-ground"
      : "border-teal/40 bg-teal/10 text-[#7EE6EC] hover:border-teal hover:bg-teal/20",
    className,
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return <span className={cls}>{children}</span>;
}
