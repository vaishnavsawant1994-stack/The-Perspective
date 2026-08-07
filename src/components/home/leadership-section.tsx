import type { Article, PersonProfile } from "@/types";
import { ArticleCard } from "@/components/article/article-card";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";
import { PageContainer } from "@/components/layout/page-container";
import { PersonFeature } from "@/components/person/person-feature";
export function LeadershipSection({ person, supporting }: { person:PersonProfile; supporting:readonly Article[] }) { return <PageContainer className="section-space"><section aria-labelledby="leadership-heading"><EditorialSectionHeader href="/leadership" id="leadership-heading" links={[{label:"Profiles",href:"/leadership/profiles"},{label:"Strategy",href:"/leadership/strategy"},{label:"Work",href:"/leadership/work"}]} title="Leadership" /><PersonFeature person={person} /><div className="mt-12 grid gap-8 border-t border-border pt-8 md:grid-cols-3">{supporting.map((article) => <ArticleCard article={article} key={article.id} variant="compact" />)}</div></section></PageContainer>; }
