"use client";

import { useEffect } from "react";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <Section className="min-h-[60vh]">
      <p className="meta text-teal">Something broke</p>
      <h1 className="mt-3 display-l text-ink">We hit an error rendering this page.</h1>
      <p className="mt-4 max-w-md text-lg text-ink-muted">
        It&apos;s on our side. Try again, or head back to the episodes.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button href="/episodes" variant="secondary">
          Browse episodes
        </Button>
      </div>
    </Section>
  );
}
