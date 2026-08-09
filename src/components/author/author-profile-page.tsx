import Link from "next/link";
import type { Article, AuthorProfileData } from "@/types";
import { RankedStory } from "@/components/article/ranked-story";
import { CategoryNewsletter } from "@/components/category/category-newsletter";
import { CategoryPromotionSection } from "@/components/category/category-promotion";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";
import { PageContainer } from "@/components/layout/page-container";
import { PerspectiveStoryList } from "@/components/perspective/perspective-story-list";
import { perspectiveContent } from "@/data/mock/perspective";
import { formatEditorialDate } from "@/lib/editorial-date";
import { AuthorFeaturedStory } from "./author-featured-story";
import { AuthorArchive } from "./author-archive";
import { AuthorProfileHeader } from "./author-profile-header";
import { AuthorTopicExpertise } from "./author-topic-expertise";

function EssentialReading({ articles }: { articles: readonly Article[] }) {
  return <section aria-labelledby="essential-reading-heading">
    <EditorialSectionHeader description="A concise starting point for this contributor’s body of work." id="essential-reading-heading" title="Essential Reading" />
    <div className="grid gap-px bg-border border-y border-border md:grid-cols-3">
      {articles.map((article) => {
        const publishedAt = article.publishedAt ?? article.updatedAt;
        return <article className="bg-background py-7 md:px-7 md:first:pl-0 md:last:pr-0" key={article.id}>
          <p className="type-meta text-accent">{article.subcategory ?? article.category.name}</p>
          <h3 className="mt-3 font-serif text-2xl leading-tight"><Link className="hover:text-accent" href={`/article/${article.slug}`}>{article.title}</Link></h3>
          <p className="mt-4 text-sm leading-6 text-muted">{article.excerpt}</p>
          <p className="type-meta mt-5 text-muted"><time dateTime={publishedAt}>{formatEditorialDate(publishedAt)}</time> · {article.readingMinutes} min</p>
        </article>;
      })}
    </div>
  </section>;
}

function PerspectiveContext({ name }: { name: string }) {
  return <aside className="grid gap-7 border-y border-foreground py-9 lg:grid-cols-[1fr_auto] lg:items-end" aria-labelledby="perspective-context-heading">
    <div><p className="eyebrow text-accent">Opinion &amp; Ideas</p><h2 className="type-h2 mt-4" id="perspective-context-heading">Part of The Perspective</h2><p className="mt-4 max-w-3xl text-base leading-7 text-muted">{name} contributes independent analysis to our home for arguments, essays and ideas about the forces shaping business and society.</p></div>
    <Link className="inline-flex min-h-11 w-fit items-center border-b border-foreground text-sm font-bold hover:text-accent" href="/perspective">Explore all perspectives →</Link>
  </aside>;
}

export function AuthorProfilePage({ profile }: { profile: AuthorProfileData }) {
  return <>
    <AuthorProfileHeader profile={profile} />
    <PageContainer className="pb-[var(--space-section-sm)]" width="standard"><AuthorFeaturedStory article={profile.featuredArticle} /></PageContainer>
    <PageContainer className="section-space border-t border-border" width="standard"><section aria-labelledby="author-latest-heading"><EditorialSectionHeader description={`The newest reporting and analysis from ${profile.author.name}.`} id="author-latest-heading" title="Latest" /><PerspectiveStoryList articles={profile.latestArticles} showExcerpt /></section></PageContainer>
    <div className="bg-surface"><PageContainer className="section-space" width="standard"><AuthorTopicExpertise topics={profile.topics} /></PageContainer></div>
    <PageContainer className="section-space" width="standard"><EssentialReading articles={profile.essentialArticles} /></PageContainer>
    <PageContainer className="pb-[var(--space-section-sm)]" width="standard"><AuthorArchive articles={profile.articles} authorName={profile.author.name} /></PageContainer>
    <PageContainer className="section-space border-t border-border" width="standard"><section aria-labelledby="author-most-read-heading"><EditorialSectionHeader id="author-most-read-heading" title="Most Read" /><div className="grid gap-x-12 lg:grid-cols-2">{profile.mostReadArticles.map((article, index) => <RankedStory article={article} key={article.id} rank={index + 1} />)}</div></section></PageContainer>
    <PageContainer className="pb-[var(--space-section-sm)]" width="standard"><PerspectiveContext name={profile.author.name} /></PageContainer>
    <CategoryPromotionSection promotion={perspectiveContent.promotion} />
    <PageContainer className="section-space" width="standard"><CategoryNewsletter eyebrow="Ideas, selected" title="The Perspective Briefing" description={`The strongest essays from ${profile.author.name} and other Perspective contributors, selected for readers who want context, not noise.`} /></PageContainer>
  </>;
}
