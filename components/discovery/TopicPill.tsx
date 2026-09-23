import { Tag } from "@/components/ui/Tag";

export function TopicPill({
  slug,
  name,
  active,
}: {
  slug: string;
  name: string;
  active?: boolean;
}) {
  return (
    <Tag href={`/topics/${slug}`} active={active}>
      {name}
    </Tag>
  );
}
