import type { Article } from "@/types";
import { ArticleCard } from "@/components/article/article-card";
import { ArticleRow } from "@/components/article/article-row";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";

export function TopicLead({ leadArticle, supporting }: { leadArticle: Article; supporting: readonly Article[] }) {
  return <section aria-labelledby="topic-lead-heading">
    <EditorialSectionHeader description="The defining stories and developments to understand first." id="topic-lead-heading" title="The Big Picture" />
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,.65fr)] lg:gap-12">
      <ArticleCard article={leadArticle} priority variant="feature" />
      <div>{supporting.map((article) => <ArticleRow article={article} key={article.id} />)}</div>
    </div>
  </section>;
}
