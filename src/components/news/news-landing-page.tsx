import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { NewsDeskSection, NewsLandingContent } from "@/types";
import { ArticleCard } from "@/components/article/article-card";
import { ArticleRow } from "@/components/article/article-row";
import { RankedStory } from "@/components/article/ranked-story";
import { CategoryNewsletter } from "@/components/category/category-newsletter";
import { CategoryPromotionSection } from "@/components/category/category-promotion";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";
import { PageContainer } from "@/components/layout/page-container";
import { CoverageDirectory } from "./coverage-directory";
import { NewsLead } from "./news-lead";
import { NewsPageHeader } from "./news-page-header";
import { TopicCluster } from "./topic-cluster";

function NewsDesk({ content, headingId, reverse = false }: { content: NewsDeskSection; headingId: string; reverse?: boolean }) {
  return <section aria-labelledby={headingId}>
    <EditorialSectionHeader actionLabel={content.actionLabel} description={content.description} href={content.href} id={headingId} title={content.label} />
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,.92fr)] lg:gap-12">
      <ArticleCard article={content.feature} className={reverse ? "lg:order-2" : undefined} variant="feature" />
      <div className={reverse ? "lg:order-1" : undefined}>{content.supporting.map((article) => <ArticleRow article={article} key={article.id} />)}</div>
    </div>
  </section>;
}

function TrendingTopics({ topics }: { topics: NewsLandingContent["trendingTopics"] }) {
  return <section aria-labelledby="trending-news-topics-heading">
    <EditorialSectionHeader description="Editorial themes the newsroom is following across the current edition." id="trending-news-topics-heading" title="What We're Following" />
    <ol className="border-y border-foreground md:grid md:grid-cols-2">{topics.map((topic, index) => <li className="border-b border-border last:border-b-0 md:odd:border-r md:[&:nth-last-child(-n+2)]:border-b-0" key={topic.label}><Link className="group grid min-h-20 grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 px-2 py-3 hover:text-accent sm:min-h-24 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:px-4" href={topic.href}><span className="font-serif text-2xl text-accent/75 sm:text-3xl">{String(index + 1).padStart(2, "0")}</span><span className="font-serif text-xl sm:text-2xl">{topic.label}</span><ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" /></Link></li>)}</ol>
  </section>;
}

export function NewsLandingPage({ content }: { content: NewsLandingContent }) {
  return <>
    <NewsPageHeader />
    <NewsLead developing={content.developing} topStories={content.topStories} />

    <div className="bg-surface-subtle"><PageContainer className="section-space" width="standard"><section aria-labelledby="major-news-topics-heading"><EditorialSectionHeader description="Eight continuing stories that connect reporting across desks and regions." id="major-news-topics-heading" title="Major Topics" /><div className="grid gap-x-12 md:grid-cols-2">{content.topics.map((topic) => <TopicCluster key={topic.label} topic={topic} />)}</div></section></PageContainer></div>

    <PageContainer className="section-space" width="standard"><CoverageDirectory destinations={content.coverage} /></PageContainer>

    <div className="bg-surface"><PageContainer className="section-space" width="standard"><NewsDesk content={content.business} headingId="news-business-heading" /></PageContainer></div>
    <PageContainer className="section-space" width="standard"><NewsDesk content={content.leadership} headingId="news-leadership-heading" reverse /></PageContainer>
    <div className="bg-surface-subtle"><PageContainer className="section-space" width="standard"><NewsDesk content={content.technology} headingId="news-technology-heading" /></PageContainer></div>
    <PageContainer className="section-space" width="standard"><NewsDesk content={content.markets} headingId="news-markets-heading" reverse /></PageContainer>
    <div className="bg-surface"><PageContainer className="section-space" width="standard"><NewsDesk content={content.globalAffairs} headingId="news-global-affairs-heading" /></PageContainer></div>

    <PageContainer className="section-space" width="standard"><TrendingTopics topics={content.trendingTopics} /></PageContainer>

    <div className="bg-foreground text-white"><PageContainer className="section-space" width="standard"><section aria-labelledby="news-analysis-heading"><header className="mb-9 border-t-2 border-white pt-4"><h2 className="text-sm font-extrabold uppercase tracking-[.12em]" id="news-analysis-heading">Analysis</h2><p className="mt-3 max-w-2xl font-serif text-xl text-white/65">Deeper reporting that explains the systems beneath the daily news.</p></header><div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">{content.analysis.map((article) => <article className="border-t border-white/25 pt-5" key={article.id}><div className="flex flex-wrap items-center gap-3"><p className="type-meta text-[#efaaa4]">{article.subcategory ?? article.category.name}</p>{article.premium && <span className="type-meta border border-[#d5ba82] px-2.5 py-1 text-[#d5ba82]">Premium</span>}</div><h3 className="mt-4 font-serif text-xl leading-tight"><Link className="hover:text-[#efaaa4]" href={`/article/${article.slug}`}>{article.title}</Link></h3><p className="mt-3 text-sm leading-6 text-white/65">{article.excerpt}</p></article>)}</div></section></PageContainer></div>

    <PageContainer className="section-space" width="standard"><section aria-labelledby="news-most-read-heading"><EditorialSectionHeader description="A deterministic editorial ranking from across The Perspective." id="news-most-read-heading" title="Most Read" /><div className="grid gap-x-14 lg:grid-cols-2">{content.mostRead.map((article, index) => <RankedStory article={article} key={article.id} rank={index + 1} />)}</div></section></PageContainer>

    <div className="bg-surface-subtle"><PageContainer className="section-space" width="standard"><section aria-labelledby="latest-news-updates-heading"><EditorialSectionHeader actionLabel="View All Latest" description="The newest reporting across The Perspective's non-opinion desks." href="/latest" id="latest-news-updates-heading" title="Latest Updates" /><div className="grid gap-x-12 md:grid-cols-2">{content.latestUpdates.map((article) => <ArticleRow article={article} key={article.id} />)}</div><Link className="mt-8 inline-flex min-h-11 items-center gap-2 border-b border-foreground text-sm font-bold hover:text-accent" href="/latest">View All Latest <ArrowRight aria-hidden="true" className="size-4" /></Link></section></PageContainer></div>

    <CategoryPromotionSection promotion={content.promotion} />

    <div className="bg-surface"><PageContainer className="section-space" width="standard"><CategoryNewsletter description="The stories, developments and ideas worth knowing—curated by The Perspective newsroom." eyebrow="Essential news, every day" title="The Daily Briefing" /></PageContainer></div>
  </>;
}
