import type { Article } from "@/types";
import { ArticleCard } from "@/components/article/article-card";
import { ArticleRow } from "@/components/article/article-row";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";
import { PageContainer } from "@/components/layout/page-container";
export function LatestSection({ feature, rows }: { feature:Article; rows:readonly Article[] }) { return <PageContainer className="pb-16 sm:pb-24"><section aria-labelledby="latest-heading"><EditorialSectionHeader href="/latest" id="latest-heading" title="Latest" /><div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-12"><ArticleCard article={feature} variant="feature" /><div>{rows.map((article) => <ArticleRow article={article} key={article.id} />)}</div></div></section></PageContainer>; }
