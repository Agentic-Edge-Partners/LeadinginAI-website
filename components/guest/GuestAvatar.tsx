import Image from "next/image";
import { initials } from "@/lib/format";
import { cx } from "@/lib/cx";

/**
 * Square portrait. Falls back to initials on the brand gradient when no
 * headshot has been committed yet, so the directory never shows a broken image.
 */
export function GuestAvatar({
  name,
  headshot,
  className,
  sizes = "160px",
  priority,
}: {
  name: string;
  headshot: string | null;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={cx("relative aspect-square overflow-hidden rounded-img bg-surface-2", className)}
    >
      {headshot ? (
        <Image
          src={headshot}
          alt={name}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div
          className="flex size-full items-center justify-center brand-gradient-bright"
          aria-hidden="true"
        >
          <span className="font-display text-[38cqw] leading-none font-bold tracking-tight text-ground/80">
            {initials(name)}
          </span>
        </div>
      )}
    </div>
  );
}
