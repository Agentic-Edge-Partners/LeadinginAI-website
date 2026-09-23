import Link from "next/link";
import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "ghost" | "teal";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-btn font-semibold whitespace-nowrap transition-[background-color,color,border-color,transform] duration-200 ease-house disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]";
const variants: Record<Variant, string> = {
  primary: "bg-cyan text-ground hover:bg-[#33E3E8]",
  secondary: "border border-line-bright bg-transparent text-ink hover:border-cyan hover:text-cyan",
  ghost: "bg-transparent text-ink-muted hover:bg-surface-2 hover:text-ink",
  teal: "bg-teal text-ink hover:bg-[#10B0C1]",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-7 text-base",
};

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
};
type AsLink = Common & { href: string; external?: boolean } & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    "href" | "children"
  >;
type AsButton = Common & { href?: undefined } & Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "children"
  >;

const OWN = ["variant", "size", "className", "icon", "children", "href", "external"] as const;
function domProps<T extends object>(props: T): Omit<T, (typeof OWN)[number]> {
  const out = { ...props } as Record<string, unknown>;
  for (const k of OWN) delete out[k];
  return out as Omit<T, (typeof OWN)[number]>;
}

/** The one button. Renders a Link when given `href`, otherwise a <button>. */
export function Button(props: AsLink | AsButton) {
  const { variant = "primary", size = "md", className, children, icon } = props;
  const cls = cx(base, variants[variant], sizes[size], className);
  if (props.href !== undefined) {
    const { href, external } = props;
    const rest = domProps(props);
    if (external || /^https?:\/\//.test(href) || href.startsWith("mailto:")) {
      return (
        <a
          href={href}
          className={cls}
          target={href.startsWith("mailto:") ? undefined : "_blank"}
          rel="noopener noreferrer"
          {...rest}
        >
          {icon}
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} {...rest}>
        {icon}
        {children}
      </Link>
    );
  }
  const { type, ...buttonRest } = domProps(props);
  return (
    <button type={type ?? "button"} className={cls} {...buttonRest}>
      {icon}
      {children}
    </button>
  );
}
