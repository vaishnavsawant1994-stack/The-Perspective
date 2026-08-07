import type { Article } from "@/types";
import { ArticleCard } from "@/components/article/article-card";
import { HeroStory } from "@/components/article/hero-story";
import { PageContainer } from "@/components/layout/page-container";
export function HomepageHero({ main, secondary }: { main:Article; secondary:readonly Article[] }) { return <PageContainer className="section-space"><section aria-label="Top stories" className="grid gap-10 lg:grid-cols-[1.8fr_1fr] lg:gap-8 xl:gap-12"><HeroStory article={main} /><div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1 lg:content-start">{secondary.map((article) => <ArticleCard article={article} key={article.id} variant="standard" />)}</div></section></PageContainer>; }
