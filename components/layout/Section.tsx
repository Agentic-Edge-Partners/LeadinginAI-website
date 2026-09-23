import { cx } from "@/lib/cx";
import { Container } from "./Container";

type Props = {
  id?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  intro?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
  tight?: boolean;
  /** Full-bleed sections opt out of the container. */
  bleed?: boolean;
};

/**
 * A page section with the house vertical rhythm and an optional editorial
 * header (mono eyebrow + display title + intro + right-aligned aside).
 */
export function Section({
  id,
  eyebrow,
  title,
  intro,
  aside,
  className,
  containerClassName,
  children,
  tight,
  bleed,
}: Props) {
  const header = (eyebrow || title || intro || aside) && (
    <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <p className="meta text-teal">{eyebrow}</p>}
        {title && <h2 className="mt-3 display-l text-ink">{title}</h2>}
        {intro && <p className="mt-4 max-w-2xl text-lg text-ink-muted">{intro}</p>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  );
  return (
    <section id={id} className={cx(tight ? "py-12 md:py-16" : "section-y", className)}>
      {bleed ? (
        <>
          {header && <Container>{header}</Container>}
          {children}
        </>
      ) : (
        <Container className={containerClassName}>
          {header}
          {children}
        </Container>
      )}
    </section>
  );
}
