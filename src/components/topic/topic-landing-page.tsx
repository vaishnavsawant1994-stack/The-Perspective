import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CategoryPromotion, TopicLandingContent } from "@/types";
import { ArticleCard } from "@/components/article/article-card";
import { ArticleRow } from "@/components/article/article-row";
import { OpinionCard } from "@/components/article/opinion-card";
import { RankedStory } from "@/components/article/ranked-story";
import { CategoryNewsletter } from "@/components/category/category-newsletter";
import { CategoryPromotionSection } from "@/components/category/category-promotion";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";
import { PageContainer } from "@/components/layout/page-container";
import { ContributorCard } from "@/components/person/contributor-card";
import { RelatedTopics } from "./related-topics";
import { TopicLead } from "./topic-lead";
import { TopicPageHeader } from "./topic-page-header";

function LatestCoverage({ content }: { content: TopicLandingContent }) {
  if (content.latest.length === 0) return null;
  return <section aria-labelledby="latest-topic-coverage-heading" id="latest-coverage">
    <EditorialSectionHeader description={`The newest non-opinion reporting connected to ${content.topic.name.toLowerCase()}.`} id="latest-topic-coverage-heading" title={`Latest on ${content.topic.name}`} />
    <div className="grid gap-x-12 md:grid-cols-2">{content.latest.map((article) => <ArticleRow article={article} key={article.id} />)}</div>
  </section>;
}

function Analysis({ articles }: { articles: TopicLandingContent["analysis"] }) {
  if (articles.length === 0) return null;
  return <div className="bg-foreground text-white"><PageContainer className="section-space" width="standard"><section aria-labelledby="topic-analysis-heading">
    <header className="mb-9 border-t-2 border-white pt-4"><h2 className="text-sm font-extrabold uppercase tracking-[.12em]" id="topic-analysis-heading">Analysis</h2><p className="mt-3 max-w-2xl font-serif text-xl text-white/65">Deeper reporting across desks, systems and long-term consequences.</p></header>
    <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">{articles.map((article) => <article className="border-t border-white/25 pt-5" key={article.id}><p className="type-meta text-[#efaaa4]">{article.subcategory ?? article.category.name}</p><h3 className="mt-4 font-serif text-2xl leading-tight"><Link className="hover:text-[#efaaa4]" href={`/article/${article.slug}`}>{article.title}</Link></h3><p className="mt-4 text-sm leading-6 text-white/65">{article.excerpt}</p></article>)}</div>
  </section></PageContainer></div>;
}

function RelatedCoverage({ content }: { content: TopicLandingContent }) {
  return <section aria-labelledby="related-coverage-heading">
    <EditorialSectionHeader description="Permanent desks and editorial destinations that add context to this subject." id="related-coverage-heading" title="Related Coverage" />
    <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">{content.topic.relatedCoverage.map((destination) => <article className="flex min-h-52 flex-col bg-background p-6" key={destination.href}><h3 className="font-serif text-2xl">{destination.label}</h3><p className="mt-3 flex-1 text-sm leading-6 text-muted">{destination.description}</p><Link className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold hover:text-accent" href={destination.href}>Explore {destination.label} <ArrowRight aria-hidden="true" className="size-4" /></Link></article>)}</div>
  </section>;
}

export function TopicLandingPage({ content }: { content: TopicLandingContent }) {
  const { topic } = content;
  const promotion: CategoryPromotion = {
    kind: "premium",
    eyebrow: "The Perspective Premium",
    title: "Important subjects deserve more than headlines.",
    description: `Go deeper into ${topic.name.toLowerCase()}, leadership and the institutions shaping what comes next.`,
    primaryAction: { label: "Explore Premium", href: "/premium" },
    secondaryAction: { label: "View Magazine", href: "/magazine" },
  };

  return <>
    <TopicPageHeader coverageCount={content.coverageCount} topic={topic} />

    <PageContainer className="section-space" width="standard"><TopicLead leadArticle={content.leadArticle} supporting={content.topStories} /></PageContainer>

    <div className="bg-surface-subtle"><PageContainer className="section-space" width="standard"><LatestCoverage content={content} /></PageContainer></div>

    {content.essential.length > 0 ? <PageContainer className="section-space" width="standard"><section aria-labelledby="essential-reading-heading"><EditorialSectionHeader description="Curated stories that establish the durable context behind the subject." id="essential-reading-heading" title="Essential Reading" /><div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">{content.essential.map((article) => <ArticleCard article={article} key={article.id} />)}</div></section></PageContainer> : null}

    <div className="bg-surface"><PageContainer className="section-space" width="standard"><section aria-labelledby="why-this-topic-matters-heading" className="grid gap-8 border-y border-foreground py-8 sm:py-10 lg:grid-cols-[minmax(12rem,.35fr)_minmax(0,.65fr)] lg:gap-16"><div><p className="eyebrow text-accent">Topic Context</p><h2 className="type-h2 mt-4" id="why-this-topic-matters-heading">Why This Matters</h2></div><p className="max-w-3xl font-serif text-[clamp(1.35rem,2.2vw,2rem)] leading-[1.4] text-muted">{topic.whatMatters}</p></section></PageContainer></div>

    <Analysis articles={content.analysis} />

    {content.opinions.length > 0 ? <PageContainer className="section-space" width="standard"><section aria-labelledby="topic-perspectives-heading"><EditorialSectionHeader actionLabel="Explore The Perspective" description="Arguments from contributors examining the choices and assumptions beneath the subject." href="/perspective" id="topic-perspectives-heading" title="Perspectives" /><div className="grid gap-9 md:grid-cols-2 xl:grid-cols-3">{content.opinions.map((article) => <OpinionCard article={article} key={article.id} />)}</div></section></PageContainer> : null}

    {content.contributors.length > 0 ? <div className="bg-surface-subtle"><PageContainer className="section-space" width="standard"><section aria-labelledby="topic-contributors-heading"><EditorialSectionHeader description="Contributors whose reporting and arguments add sustained context to this subject." id="topic-contributors-heading" title="Voices on This Topic" /><div className="grid gap-9 md:grid-cols-2 xl:grid-cols-3">{content.contributors.map((contributor) => <ContributorCard columnist={contributor} key={contributor.author.id} />)}</div></section></PageContainer></div> : null}

    <PageContainer className="section-space" width="standard"><RelatedCoverage content={content} /></PageContainer>

    {content.mostRead.length > 0 ? <div className="bg-surface"><PageContainer className="section-space" width="standard"><section aria-labelledby="topic-most-read-heading"><EditorialSectionHeader description="A deterministic editorial selection from this topic's wider reading list." id="topic-most-read-heading" title="Most Read" /><div className="grid gap-x-14 lg:grid-cols-2">{content.mostRead.map((article, index) => <RankedStory article={article} key={article.id} rank={index + 1} />)}</div></section></PageContainer></div> : null}

    <PageContainer className="section-space" width="standard"><RelatedTopics topics={content.relatedTopics} /></PageContainer>

    <CategoryPromotionSection promotion={promotion} />

    <div className="bg-surface"><PageContainer className="section-space" width="standard"><CategoryNewsletter description={`Reporting, analysis and perspectives on ${topic.name.toLowerCase()}—curated by The Perspective newsroom.`} eyebrow="Coverage worth keeping" title={topic.briefingTitle ?? "The Perspective Briefing"} /></PageContainer></div>
  </>;
}
