import type { Article } from "@/types";
import { ArticleCard } from "@/components/article/article-card";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";
import { PageContainer } from "@/components/layout/page-container";
export function EditorsPicks({ articles }: { articles:readonly Article[] }) { return <div className="bg-surface-subtle"><PageContainer className="section-space"><section aria-labelledby="editors-picks-heading"><EditorialSectionHeader id="editors-picks-heading" title="Editor’s Picks" /><div className="grid gap-10 md:grid-cols-3">{articles.map((article) => <ArticleCard article={article} key={article.id} />)}</div></section></PageContainer></div>; }
