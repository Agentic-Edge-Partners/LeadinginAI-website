import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Section className="min-h-[60vh]">
      <p className="meta text-teal">404</p>
      <h1 className="mt-3 display-l text-ink">That page isn&apos;t here.</h1>
      <p className="mt-4 max-w-md text-lg text-ink-muted">
        It may have moved, or the link was mistyped. The episodes are still where they were.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/episodes">Browse episodes</Button>
        <Button href="/" variant="secondary">
          Back home
        </Button>
      </div>
    </Section>
  );
}
