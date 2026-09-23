"use client";

import { Button } from "@/components/ui/Button";

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: { label: string; onClick?: () => void; href?: string };
}) {
  return (
    <div className="rounded-card border border-dashed border-line-bright px-6 py-16 text-center">
      <p className="heading text-ink">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-md text-ink-muted">{body}</p>}
      {action && (
        <div className="mt-6">
          {action.href ? (
            <Button href={action.href} variant="secondary">
              {action.label}
            </Button>
          ) : (
            <Button variant="secondary" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
