import type { Article } from "@/types";
import { ArticleCard } from "@/components/article/article-card";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";

export function CategoryStoryGrid({ articles, title = "Top Stories" }: { articles:readonly Article[]; title?:string }) {
  if (!articles.length) return null;
  const id = `${title.toLowerCase().replaceAll(" ", "-")}-heading`;
  return <section aria-labelledby={id}><EditorialSectionHeader id={id} title={title} /><div className="grid gap-x-8 gap-y-12 sm:grid-cols-2">{articles.map((article) => <ArticleCard article={article} key={article.id} />)}</div></section>;
}
