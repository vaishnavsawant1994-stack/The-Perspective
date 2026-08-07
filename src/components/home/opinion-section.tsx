import { OpinionCard } from "@/components/article/opinion-card";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";
import { PageContainer } from "@/components/layout/page-container";
import { opinions } from "@/data/mock/homepage";
export function OpinionSection() { return <PageContainer className="section-space"><section aria-labelledby="opinion-heading"><EditorialSectionHeader href="/opinion" id="opinion-heading" title="Opinion" /><div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">{opinions.map((opinion,index) => <OpinionCard {...opinion} index={index} key={opinion.author} />)}</div></section></PageContainer>; }
