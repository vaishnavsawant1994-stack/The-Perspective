import type { Article } from "@/types";
import { RankedStory } from "@/components/article/ranked-story";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";
import { PageContainer } from "@/components/layout/page-container";
export function MostRead({ articles }: { articles:readonly Article[] }) { return <PageContainer className="section-space"><section aria-labelledby="most-read-heading"><EditorialSectionHeader id="most-read-heading" title="Most Read" /><div className="grid gap-x-14 lg:grid-cols-2">{articles.map((article,index) => <RankedStory article={article} key={article.id} rank={index+1} />)}</div></section></PageContainer>; }
