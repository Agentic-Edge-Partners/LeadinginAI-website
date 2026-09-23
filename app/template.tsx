import { PageTransition } from "@/components/layout/PageTransition";

/** Re-mounts on every navigation so the enter transition runs per page. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
