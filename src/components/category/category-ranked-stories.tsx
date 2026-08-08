import type { Article } from "@/types";
import { RankedStory } from "@/components/article/ranked-story";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";

export function CategoryRankedStories({ articles, label }: { articles:readonly Article[]; label:string }) {
  if (!articles.length) return null;
  const headingId = `most-read-${label.toLowerCase()}-heading`;
  return <section aria-labelledby={headingId}><EditorialSectionHeader id={headingId} title={`Most Read in ${label}`} /><div className="grid gap-x-12 lg:grid-cols-2">{articles.map((article, index) => <RankedStory article={article} key={article.id} rank={index + 1} />)}</div></section>;
}
