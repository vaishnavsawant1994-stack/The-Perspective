import Link from "next/link";
import { ArrowRight, BookOpen, Check, Library, Maximize2 } from "lucide-react";
import type { MagazineIssue, MagazineLandingContent } from "@/types";
import { ArticleCard } from "@/components/article/article-card";
import { CategoryNewsletter } from "@/components/category/category-newsletter";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";
import { PersonalMagazineSection } from "@/components/home/personal-magazine-section";
import { PageContainer } from "@/components/layout/page-container";
import { IssueTableOfContents } from "./issue-table-of-contents";
import { LatestIssueHero } from "./latest-issue-hero";
import { MagazineCover } from "./magazine-cover";
import { MagazinePageHeader } from "./magazine-page-header";
import { PreviousIssues } from "./previous-issues";

const premiumBenefits = ["Exclusive editions", "Premium essays", "Member interviews", "Archive access", "Special reports"];
const subscriptionBenefits = ["Digital magazine access", "Premium editions", "Archive access", "Exclusive stories", "Special reports"];

function DigitalReaderPreview({ issue }: { issue: MagazineIssue }) {
  const readerHref = issue.readerAvailable ? `/magazine/read/${issue.slug}` : "/magazine#inside-this-issue";
  return <div className="bg-[#d8d0c2]" id="digital-reader"><PageContainer className="section-space-lg" width="standard"><section aria-labelledby="digital-reader-heading" className="grid gap-12 lg:grid-cols-[.82fr_1.18fr] lg:items-center lg:gap-20">
    <div><p className="eyebrow text-accent">Digital Edition</p><h2 className="type-display-lg mt-5" id="digital-reader-heading">Read the Magazine</h2><p className="type-deck mt-6 max-w-2xl text-[#4d4a43]">Experience The Perspective as a complete digital issue—designed for focused reading, page-by-page storytelling and immersive editorial presentation.</p><div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#4d4a43]"><span className="inline-flex items-center gap-2"><BookOpen aria-hidden="true" className="size-4" /> 26 digital pages</span><span className="inline-flex items-center gap-2"><Library aria-hidden="true" className="size-4" /> Issue contents</span><span className="inline-flex items-center gap-2"><Maximize2 aria-hidden="true" className="size-4" /> Focused reading</span></div><p className="mt-8 text-sm text-[#4d4a43]">The August edition is available as a structured, accessible digital publication.</p><div className="mt-5 flex flex-wrap gap-3"><Link className="inline-flex min-h-12 items-center bg-foreground px-5 text-sm font-bold text-white" href={readerHref}>Open Digital Issue</Link><Link className="inline-flex min-h-12 items-center gap-2 border-b border-foreground text-sm font-bold" href="/magazine#inside-this-issue">Explore this issue <ArrowRight aria-hidden="true" className="size-4" /></Link></div></div>
    <div aria-label="Preview of the future digital magazine reading experience" className="grid min-h-[24rem] grid-cols-[minmax(8rem,.42fr)_minmax(0,.58fr)] gap-3 border border-[#8f8779] bg-[#bbb2a3] p-3 shadow-[0_20px_50px_rgb(0_0_0/15%)] sm:min-h-[32rem] sm:p-5" role="img"><MagazineCover issue={issue} variant="compact" /><div className="grid grid-rows-2 gap-3"><div className="bg-surface p-4 sm:p-6"><p className="type-meta text-accent">Cover Story</p><p className="mt-4 font-serif text-[clamp(1.2rem,3vw,2.25rem)] leading-none">{issue.coverHeadline}</p><div className="mt-6 space-y-2"><span className="block h-px w-full bg-border" /><span className="block h-px w-4/5 bg-border" /><span className="block h-px w-5/6 bg-border" /></div></div><div className="bg-[#272723] p-4 text-white sm:p-6"><p className="type-meta text-[#d7ad68]">Inside the Issue</p><p className="mt-4 font-serif text-lg leading-tight sm:text-2xl">Ideas designed for sustained, page-by-page reading.</p></div></div></div>
  </section></PageContainer></div>;
}

function PremiumMagazine({ issue }: { issue: MagazineIssue }) {
  return <div className="bg-[#11120f] text-white" id="premium"><PageContainer className="section-space-lg" width="standard"><section aria-labelledby="magazine-premium-heading" className="grid gap-14 lg:grid-cols-[minmax(15rem,.65fr)_minmax(0,1.35fr)] lg:items-center lg:gap-20"><div className="mx-auto w-[72%] max-w-sm lg:w-full"><MagazineCover issue={issue} variant="standard" /></div><div><p className="eyebrow text-premium">Premium Edition</p><h2 className="type-display-lg mt-5" id="magazine-premium-heading">The Perspective Premium</h2><p className="type-deck mt-7 max-w-2xl text-white/65">Deeper editions for readers who want more context, longer interviews, exclusive analysis and complete archive access.</p><ul className="mt-8 grid gap-x-8 sm:grid-cols-2">{premiumBenefits.map((benefit) => <li className="flex min-h-12 items-center gap-3 border-t border-white/20 text-sm text-white/75" key={benefit}><Check aria-hidden="true" className="size-4 text-premium" />{benefit}</li>)}</ul><div className="mt-8"><Link className="inline-flex min-h-12 items-center gap-2 bg-white px-5 text-sm font-bold text-foreground hover:bg-[#f3e6d0]" href="/magazine/premium">Explore Premium Editions <ArrowRight aria-hidden="true" className="size-4" /></Link></div></div></section></PageContainer></div>;
}

function ArchivePreview({ issues }: { issues: readonly MagazineIssue[] }) {
  return <div className="bg-surface" id="archive"><PageContainer className="section-space" width="standard"><section aria-labelledby="magazine-archive-heading" className="grid gap-10 lg:grid-cols-[.65fr_1.35fr] lg:gap-20"><div><p className="eyebrow text-accent">Collection</p><h2 className="type-display-lg mt-5" id="magazine-archive-heading">The Archive</h2><p className="type-body-lg mt-6 max-w-md text-muted">Explore past issues, themes, interviews and special editions from The Perspective.</p><p className="mt-7 text-sm text-muted">Browse the complete publication record by year, theme, Premium status and Digital Reader availability.</p><div className="mt-5"><Link className="inline-flex min-h-12 items-center gap-2 bg-foreground px-5 text-sm font-bold text-white hover:bg-accent" href="/magazine/archive">Browse Full Archive <ArrowRight aria-hidden="true" className="size-4" /></Link></div></div><div><p className="type-meta border-t-2 border-foreground py-4">2026</p><ol>{issues.map((issue) => <li className="grid grid-cols-[5rem_minmax(0,1fr)_auto] items-center gap-4 border-t border-border py-5 last:border-b" key={issue.id}><time className="type-meta text-muted" dateTime={issue.publicationDate}>{new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(new Date(issue.publicationDate))}</time><div><p className="font-serif text-xl sm:text-2xl">{issue.coverHeadline}</p><p className="mt-1 text-xs text-muted">{issue.theme}</p></div><span className="type-meta text-muted">{issue.pageCount}p</span></li>)}</ol></div></section></PageContainer></div>;
}

function SubscriptionCta() {
  return <div className="bg-accent text-white" id="subscribe"><PageContainer className="section-space-lg" width="standard"><section aria-labelledby="magazine-subscribe-heading" className="grid gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-end lg:gap-20"><div><p className="eyebrow text-white/70">The complete publication</p><h2 className="type-display-lg mt-5" id="magazine-subscribe-heading">Subscribe to The Perspective</h2><p className="type-deck mt-7 max-w-2xl text-white/75">Read every issue, explore Premium editions and choose the level of the publication that fits how you want to read.</p><p className="mt-7 text-sm text-white/70">Compare the Reader, Digital and Premium experiences. Checkout and account access remain reserved for the membership phase.</p><div className="mt-5"><Link className="inline-flex min-h-12 items-center gap-2 bg-white px-5 text-sm font-bold text-foreground hover:bg-[#f3e6d0]" href="/magazine/subscribe">Compare Subscription Plans <ArrowRight aria-hidden="true" className="size-4" /></Link></div></div><ul className="border-t border-white/35">{subscriptionBenefits.map((benefit) => <li className="flex min-h-12 items-center gap-3 border-b border-white/25 text-sm text-white/85" key={benefit}><Check aria-hidden="true" className="size-4" />{benefit}</li>)}</ul></section></PageContainer></div>;
}

export function MagazineLandingPage({ content }: { content: MagazineLandingContent }) {
  const archiveIssues = [content.latestIssue, ...content.previousIssues];
  const readerHref = content.latestIssue.readerAvailable ? `/magazine/read/${content.latestIssue.slug}` : "/magazine#digital-reader";
  return <>
    <MagazinePageHeader readerHref={readerHref} />
    <LatestIssueHero issue={content.latestIssue} />

    <div className="bg-surface" id="inside-this-issue"><PageContainer className="section-space" width="standard"><section aria-labelledby="inside-this-issue-heading"><EditorialSectionHeader description="Reporting, interviews and essays selected as one complete August edition." id="inside-this-issue-heading" title="Inside This Issue" /></section></PageContainer></div>

    <PageContainer className="pb-[var(--space-section-sm)]" width="standard"><section aria-labelledby="cover-story-heading"><EditorialSectionHeader description="The defining feature at the center of this edition." id="cover-story-heading" title="Cover Story" /><ArticleCard article={content.coverStory} variant="feature" /></section></PageContainer>

    <div className="bg-surface-subtle"><PageContainer className="section-space" width="standard"><section aria-labelledby="issue-highlights-heading"><EditorialSectionHeader description="Six essential stories from across the current issue." id="issue-highlights-heading" title="Issue Highlights" /><div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">{content.issueHighlights.map((article, index) => <ArticleCard article={article} key={article.id} variant={index < 3 ? "standard" : "compact"} />)}</div></section></PageContainer></div>

    <PageContainer className="section-space" width="standard"><IssueTableOfContents sections={content.issueSections} /></PageContainer>

    <div className="bg-surface"><PageContainer className="section-space" width="standard"><PreviousIssues issues={content.previousIssues} /></PageContainer></div>

    <DigitalReaderPreview issue={content.latestIssue} />
    <PremiumMagazine issue={content.premiumIssue} />
    <PersonalMagazineSection destination="/personal-magazines" id="personal-magazines" people={content.personalMagazineProfiles} />
    <ArchivePreview issues={archiveIssues} />
    <SubscriptionCta />

    <div className="bg-surface"><PageContainer className="section-space" width="standard"><CategoryNewsletter description="New issues, cover stories, interviews and special editions—delivered when they matter." eyebrow="For readers who keep the long view" title="The Magazine Briefing" /></PageContainer></div>
  </>;
}
