import type { Metadata } from "next";
import { getEpisodesByTopic, getTopics } from "@/lib/content";
import { Section } from "@/components/layout/Section";
import { TopicWall } from "@/components/discovery/TopicWall";

export const metadata: Metadata = {
  title: "Topics",
  description:
    "Browse Leading in AI episodes by theme: AI strategy, governance, agents, enterprise transformation, public policy and more.",
  alternates: { canonical: "/topics" },
};

export default function TopicsPage() {
  const topics = getTopics();
  const counts = Object.fromEntries(topics.map((t) => [t.slug, getEpisodesByTopic(t.slug).length]));
  return (
    <Section
      eyebrow="Themes"
      title="Topics"
      intro="A closed set of themes we keep coming back to. Each one collects every episode tagged with it."
    >
      <TopicWall topics={topics} counts={counts} />
    </Section>
  );
}
