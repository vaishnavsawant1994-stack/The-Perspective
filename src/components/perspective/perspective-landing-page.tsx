import Image from "next/image";
import Link from "next/link";
import type { PerspectiveContent } from "@/types";
import { RankedStory } from "@/components/article/ranked-story";
import { PointCounterpoint } from "@/components/article/point-counterpoint";
import { CategoryNewsletter } from "@/components/category/category-newsletter";
import { CategoryPromotionSection } from "@/components/category/category-promotion";
import { CategorySubnav } from "@/components/category/category-subnav";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";
import { PageContainer } from "@/components/layout/page-container";
import { ContributorCard } from "@/components/person/contributor-card";
import { Avatar } from "@/components/ui/avatar";
import { PerspectiveEditorialSection } from "./perspective-editorial-section";
import { PerspectiveLead } from "./perspective-lead";
import { PerspectiveStoryList } from "./perspective-story-list";

function PerspectiveHeader({ content }: { content: PerspectiveContent }) {
  return <PageContainer className="pb-9 pt-10 sm:pb-12 sm:pt-14 lg:pb-14 lg:pt-18" width="standard">
    <nav aria-label="Breadcrumb"><ol className="flex items-center gap-2 text-xs text-muted"><li><Link className="hover:text-accent" href="/">Home</Link></li><li aria-hidden="true">/</li><li aria-current="page">The Perspective</li></ol></nav>
    <div className="mt-8 grid gap-8 border-b border-foreground pb-9 lg:grid-cols-[1.15fr_.85fr] lg:items-end lg:pb-12">
      <div><p className="eyebrow text-accent">{content.label}</p><h1 className="type-display-lg mt-4">{content.title}</h1></div>
      <div><p className="type-deck text-muted">{content.description}</p><p className="type-meta mt-5 text-muted">{content.supportingLine}</p></div>
    </div>
  </PageContainer>;
}

function BigEssay({ article }: { article: PerspectiveContent["bigEssay"] }) {
  const author = article.authors[0];
  return <div className="bg-foreground text-white"><PageContainer className="section-space-lg" width="standard"><section aria-labelledby="big-essay-heading" className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:gap-16">
    <div><p className="eyebrow text-premium">The Big Essay</p><p className="type-meta mt-6 text-white/55">Essay</p><h2 className="type-display-lg mt-4 max-w-5xl" id="big-essay-heading"><Link className="hover:text-premium" href={`/article/${article.slug}`}>{article.title}</Link></h2><p className="type-deck mt-7 max-w-3xl text-white/70">{article.dek ?? article.excerpt}</p>{author && <p className="mt-7 text-sm font-semibold">By <Link className="hover:text-premium" href={`/author/${author.slug}`}>{author.name}</Link>{author.role && <span className="font-normal text-white/60"> · {author.role}</span>}<span className="font-normal text-white/60"> · {article.readingMinutes} min read</span></p>}<Link className="mt-8 inline-flex min-h-11 items-center border-b border-premium text-sm font-bold text-premium" href={`/article/${article.slug}`}>Read the Essay →</Link></div>
    {article.heroImage && <Link className="relative block aspect-[4/5] max-h-[44rem] overflow-hidden bg-white/10" href={`/article/${article.slug}`}><Image alt={article.heroImage.alt} className="object-cover grayscale-[30%] opacity-90" fill sizes="(max-width: 1024px) 100vw, 42vw" src={article.heroImage.src} /></Link>}
  </section></PageContainer></div>;
}

function ContributorSpotlight({ spotlight }: { spotlight: PerspectiveContent["contributorSpotlight"] }) {
  const { author, latestArticle } = spotlight;
  const initials = author.name.split(" ").map((part) => part[0]).join("").slice(0, 2);
  return <section aria-labelledby="contributor-spotlight-heading"><EditorialSectionHeader id="contributor-spotlight-heading" title="Contributor Spotlight" /><article className="grid gap-9 bg-surface-subtle p-6 sm:p-9 lg:grid-cols-[.55fr_1.45fr] lg:items-center lg:p-12"><div className="flex flex-col items-start"><Avatar alt={author.name} className="size-24 text-2xl sm:size-32" initials={initials} src={author.avatar?.src} /><h3 className="mt-6 font-serif text-3xl">{author.name}</h3>{author.role && <p className="mt-2 text-sm font-semibold text-muted">{author.role}</p>}{author.expertise && author.expertise.length > 0 ? <div className="mt-5 flex flex-wrap gap-2">{author.expertise.map((item) => <span className="border border-border bg-surface px-3 py-2 text-xs" key={item}>{item}</span>)}</div> : null}</div><div><p className="type-deck text-muted">{author.biography}</p><p className="type-meta mt-8 text-accent">Latest essay</p><h3 className="type-h2 mt-4"><Link className="hover:text-accent" href={`/article/${latestArticle.slug}`}>{latestArticle.title}</Link></h3><p className="mt-5 max-w-3xl text-base leading-7 text-muted">{latestArticle.excerpt}</p><Link className="mt-7 inline-flex min-h-11 items-center border-b border-foreground text-sm font-bold hover:text-accent" href={`/author/${author.slug}`}>Read {author.name} →</Link></div></article></section>;
}

export function PerspectiveLandingPage({ content }: { content: PerspectiveContent }) {
  return <>
    <PerspectiveHeader content={content} />
    <CategorySubnav items={content.topics} label="Perspective" />
    <PageContainer className="section-space" width="standard"><PerspectiveLead lead={content.lead} /></PageContainer>
    <PageContainer className="pb-[var(--space-section-sm)]" width="standard"><section aria-labelledby="featured-columnists-heading"><EditorialSectionHeader description="Recurring voices on economics, capital, leadership, technology and global affairs." id="featured-columnists-heading" title="Featured Columnists" /><div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-6 lg:gap-7">{content.featuredColumnists.map((columnist) => <ContributorCard columnist={columnist} key={columnist.author.id} />)}</div></section></PageContainer>
    <PageContainer className="section-space border-t border-border" width="standard"><section aria-labelledby="todays-arguments-heading"><EditorialSectionHeader description="Six propositions for the decisions institutions are making now." id="todays-arguments-heading" title="Today’s Arguments" /><PerspectiveStoryList articles={content.todayArguments} showExcerpt /></section></PageContainer>
    <div className="bg-surface"><PageContainer className="section-space space-y-[var(--space-section-sm)]" width="standard">{content.sections.map((section) => <PerspectiveEditorialSection key={section.id} section={section} />)}</PageContainer></div>
    <BigEssay article={content.bigEssay} />
    <PageContainer className="section-space" width="standard"><PointCounterpoint {...content.debate} /></PageContainer>
    <PageContainer className="pb-[var(--space-section-sm)]" width="standard"><ContributorSpotlight spotlight={content.contributorSpotlight} /></PageContainer>
    <PageContainer className="section-space border-t border-border" width="standard"><section aria-labelledby="most-read-perspectives-heading"><EditorialSectionHeader id="most-read-perspectives-heading" title="Most Read Perspectives" /><div className="grid gap-x-12 lg:grid-cols-2">{content.mostRead.map((article, index) => <RankedStory article={article} key={article.id} rank={index + 1} />)}</div></section></PageContainer>
    <PageContainer className="pb-[var(--space-section-sm)]" width="standard"><section aria-labelledby="latest-perspectives-heading"><EditorialSectionHeader description="The newest essays and arguments from The Perspective’s contributors." id="latest-perspectives-heading" title="Latest Perspectives" /><PerspectiveStoryList articles={content.latest} /><Link className="mt-7 inline-flex min-h-11 items-center border-b border-foreground text-sm font-bold hover:text-accent" href="/perspective">View All Opinion →</Link></section></PageContainer>
    <CategoryPromotionSection promotion={content.promotion} />
    <PageContainer className="section-space" width="standard"><CategoryNewsletter {...content.newsletter} /></PageContainer>
  </>;
}
