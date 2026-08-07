import type { Article } from "@/types";
import { ArticleCard } from "./article-card";

export function RelatedStories({ articles }: { articles: readonly Article[] }) {
  return <section aria-labelledby="related-stories-heading" className="mt-14"><h2 className="border-t-2 border-foreground pt-4 text-sm font-extrabold uppercase tracking-[.12em]" id="related-stories-heading">Related Stories</h2><div className="mt-6 grid gap-8 sm:grid-cols-3">{articles.map((article) => <ArticleCard article={article} key={article.id} variant="standard" />)}</div></section>;
}
