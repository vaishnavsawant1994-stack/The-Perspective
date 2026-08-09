import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/types";
import { ArticleCard } from "@/components/article/article-card";
import { ArticleRow } from "@/components/article/article-row";
import { CategoryLabel } from "@/components/common/category-label";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";
import { PageContainer } from "@/components/layout/page-container";
import { formatEditorialTime } from "@/lib/editorial-date";

function DevelopingStrip({ articles }: { articles: readonly Article[] }) {
  const [primary, ...supporting] = articles;
  if (!primary) return null;
  const publishedAt = primary.publishedAt ?? primary.updatedAt;

  return <div className="border-y border-accent/30 bg-[#f3e9e5]">
    <PageContainer className="py-5" width="standard">
      <section aria-labelledby="developing-news-heading" className="grid gap-5 lg:grid-cols-[8rem_minmax(0,1.25fr)_minmax(18rem,.75fr)] lg:items-center">
        <div><h2 className="eyebrow text-accent" id="developing-news-heading">Developing</h2><time className="type-caption mt-2 block text-muted" dateTime={publishedAt}>{formatEditorialTime(publishedAt)}</time></div>
        <h3 className="font-serif text-xl leading-tight sm:text-2xl"><Link className="hover:text-accent" href={`/article/${primary.slug}`}>{primary.title}</Link></h3>
        <ul className="divide-y divide-accent/20 border-t border-accent/20 lg:border-l lg:border-t-0 lg:pl-6">{supporting.map((article) => <li key={article.id}><Link className="flex min-h-11 items-center py-2 text-sm font-semibold leading-5 hover:text-accent" href={`/article/${article.slug}`}>{article.title}</Link></li>)}</ul>
      </section>
    </PageContainer>
  </div>;
}

function LeadStory({ article }: { article: Article }) {
  const publishedAt = article.publishedAt ?? article.updatedAt;
  return <article className="group">
    {article.heroImage && <Link aria-label={`Read ${article.title}`} className="relative block aspect-[16/10] overflow-hidden bg-surface-subtle" href={`/article/${article.slug}`}><Image alt={article.heroImage.alt} className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" fill loading="eager" sizes="(max-width: 1024px) 100vw, 46vw" src={article.heroImage.src} /></Link>}
    <div className="pt-6"><CategoryLabel>{article.subcategory ?? article.category.name}</CategoryLabel><h3 className="mt-4 max-w-4xl font-serif text-[clamp(2.15rem,4.2vw,4.5rem)] leading-[.96] tracking-[-.04em]"><Link className="decoration-accent decoration-2 underline-offset-8 group-hover:underline" href={`/article/${article.slug}`}>{article.title}</Link></h3><p className="type-deck mt-5 max-w-3xl text-muted">{article.dek ?? article.excerpt}</p><p className="type-meta mt-5 text-muted">By {article.authors[0]?.name} · <time dateTime={publishedAt}>{formatEditorialTime(publishedAt)}</time> · {article.readingMinutes} min read</p></div>
  </article>;
}

export function NewsLead({ developing, topStories }: { developing: readonly Article[]; topStories: { lead: Article; supporting: readonly Article[]; headlines: readonly Article[] } }) {
  return <>
    <DevelopingStrip articles={developing} />
    <PageContainer className="section-space" width="standard">
      <section aria-labelledby="news-top-stories-heading">
        <EditorialSectionHeader description="The stories setting the agenda across this edition." id="news-top-stories-heading" title="Top Stories" />
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(15rem,.7fr)_minmax(16rem,.72fr)] lg:gap-9 xl:gap-12">
          <LeadStory article={topStories.lead} />
          <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-1">{topStories.supporting.map((article) => <ArticleCard article={article} key={article.id} />)}</div>
          <div className="border-t-2 border-foreground"><p className="eyebrow py-4 text-muted">Across the newsroom</p>{topStories.headlines.map((article) => <ArticleRow article={article} key={article.id} />)}</div>
        </div>
      </section>
    </PageContainer>
  </>;
}
