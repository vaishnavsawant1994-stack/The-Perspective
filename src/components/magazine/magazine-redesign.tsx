"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Cpu,
  FileText,
  Globe2,
  Heart,
  Lightbulb,
  Monitor,
  Newspaper,
  ShieldCheck,
  Star,
} from "lucide-react";
import type { Article, MagazineIssue, MagazineLandingContent } from "@/types";
import { IssueTableOfContents } from "./issue-table-of-contents";
import { LatestIssueHero } from "./latest-issue-hero";
import styles from "./magazine-redesign.module.css";

function issueHref(issue: MagazineIssue) {
  return issue.readerAvailable ? `/magazine/read/${issue.slug}` : `/magazine/archive?issue=${issue.slug}`;
}

function issueDate(issue: MagazineIssue, short = false) {
  return new Intl.DateTimeFormat("en-US", { month: short ? "short" : "long", year: "numeric", timeZone: "UTC" }).format(new Date(issue.publicationDate));
}

function IssueCover({ issue, priority = false, className = "" }: { issue: MagazineIssue; priority?: boolean; className?: string }) {
  return (
    <Link aria-label={`Read ${issue.title}`} className={`${styles.issueCover} ${className}`} href={issueHref(issue)}>
      {issue.coverImage ? <Image alt={issue.coverImage.alt} fill loading={priority ? "eager" : "lazy"} priority={priority} sizes="(max-width: 700px) 68vw, 300px" src={issue.coverImage.src} /> : <span className={styles.coverFallback} />}
      <span className={styles.coverShade} />
      <span className={styles.coverBrand}>The<br /><b>Perspective</b><small>News. Knowledge. Influence.</small></span>
      <span className={styles.coverCopy}><small>{issue.coverKicker}</small><b>{issue.coverHeadline}</b></span>
    </Link>
  );
}

export function MagazineBreakingRail() {
  return (
    <aside aria-label="Breaking news" className={styles.breakingRail}>
      <div className={styles.pageWrap}>
        <strong>Breaking</strong>
        <div>
          <Link href="/article/markets-optimism"><i /> Markets assess a changing rate outlook</Link>
          <Link href="/article/industrial-investment-strategy"><i /> Industrial investment moves back to the center of strategy</Link>
          <Link href="/article/global-computing-capacity"><i /> Computing capacity becomes a global priority</Link>
        </div>
        <span><i /> Live</span>
      </div>
    </aside>
  );
}

function MagazineHero({ latest, previous }: { latest: MagazineIssue; previous: readonly MagazineIssue[] }) {
  const second = previous[0] ?? latest;
  const third = previous[1] ?? previous[0] ?? latest;
  return (
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <p>The Perspective Magazine</p>
        <h1>In-Depth. Insightful.<br />Influential.</h1>
        <div>The Perspective Magazine delivers authoritative analysis, exclusive interviews, and future-shaping ideas from leaders and changemakers across the world.</div>
        <nav aria-label="Magazine actions"><Link href="/magazine/subscribe">Subscribe now</Link><Link href={issueHref(latest)}>View latest issue</Link></nav>
      </div>
      <div aria-label="Featured magazine covers" className={styles.heroCovers}>
        <IssueCover className={styles.heroCoverMain} issue={latest} priority />
        <IssueCover className={styles.heroCoverSecond} issue={second} />
        <IssueCover className={styles.heroCoverThird} issue={third} />
      </div>
    </section>
  );
}

const metrics = [
  [BookOpen, "120+", "Issues published"],
  [Lightbulb, "250+", "Exclusive interviews"],
  [Star, "500+", "Industry leaders featured"],
  [Globe2, "1M+", "Global readers"],
  [ShieldCheck, "15+", "Years of trusted journalism"],
] as const;

function MetricsStrip() {
  return <section aria-label="Magazine publication facts" className={styles.metrics}>{metrics.map(([Icon, value, label]) => <article key={label}><Icon aria-hidden="true" /><div><b>{value}</b><span>{label}</span></div></article>)}</section>;
}

function LatestIssue({ issue, coverStory, highlights }: { issue: MagazineIssue; coverStory: Article; highlights: readonly Article[] }) {
  return (
    <section className={styles.latestIssue}>
      <div className={styles.latestIssueCopy}>
        <p>Latest issue</p>
        <h2>{issue.coverHeadline}</h2>
        <time dateTime={issue.publicationDate}>{issueDate(issue)}</time>
        <div>{issue.description} This edition brings together original reporting, thoughtful interviews and ideas designed for the long view.</div>
        <nav><Link href={issueHref(issue)}>Read now</Link><a href="#magazine-contents">View contents</a></nav>
      </div>
      <Link aria-label={`Read the cover story: ${coverStory.title}`} className={styles.latestIssueImage} href={`/article/${coverStory.slug}`}>
        {coverStory.heroImage ? <Image alt={coverStory.heroImage.alt} fill sizes="(max-width: 800px) 100vw, 520px" src={coverStory.heroImage.src} /> : null}
        <span><small>Cover story</small><b>{coverStory.title}</b></span>
      </Link>
      <div className={styles.issueContents} id="magazine-contents">
        <h2>In this issue</h2>
        <ol>{highlights.slice(0, 5).map((article, index) => <li key={article.id}><Link className={styles.contentsThumb} href={`/article/${article.slug}`}>{article.heroImage ? <Image alt={article.heroImage.alt} fill sizes="58px" src={article.heroImage.src} /> : null}</Link><Link href={`/article/${article.slug}`}>{article.title}</Link><span>pg. {18 + index * 12}</span></li>)}</ol>
      </div>
    </section>
  );
}

function PastIssues({ issues }: { issues: readonly MagazineIssue[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  function move(direction: number) { railRef.current?.scrollBy({ left: direction * Math.max(240, railRef.current.clientWidth * .72), behavior: "smooth" }); }
  return (
    <section className={styles.pastIssues}>
      <header><h2>Explore past issues</h2><Link href="/magazine/archive">View all issues <ArrowRight aria-hidden="true" /></Link></header>
      <div className={styles.issueCarousel}>
        <button aria-label="Previous magazine issues" onClick={() => move(-1)} type="button"><ChevronLeft aria-hidden="true" /></button>
        <div className={styles.issueRail} ref={railRef}>{issues.map((issue) => <article key={issue.id}>
          <IssueCover issue={issue} />
          <div className={styles.archiveIssueCopy}>
            <p><time dateTime={issue.publicationDate}>{issueDate(issue)}</time><span>Issue {String(issue.issueNumber).padStart(2, "0")}</span></p>
            <h3><Link href={issueHref(issue)}>{issue.coverHeadline}</Link></h3>
            <b>{issue.coverKicker}</b>
            <div>{issue.description}</div>
          </div>
        </article>)}</div>
        <button aria-label="Next magazine issues" onClick={() => move(1)} type="button"><ChevronRight aria-hidden="true" /></button>
      </div>
    </section>
  );
}

const categoryLinks = [
  [BookOpen, "Leadership", "/magazine/category/leadership"],
  [BriefcaseBusiness, "Business & Economy", "/magazine/category/business"],
  [Cpu, "Technology", "/magazine/category/technology"],
  [BarChart3, "Markets & Finance", "/search?q=markets"],
  [FileText, "Policy & Governance", "/search?q=governance"],
  [Lightbulb, "Science & Innovation", "/search?q=innovation"],
  [Heart, "Culture & Lifestyle", "/search?q=culture&type=articles"],
  [Newspaper, "Special Editions", "/magazine/archive"],
] as const;

function CategoryBrowse() {
  return <section className={styles.categories}><h2>Browse by category</h2><nav aria-label="Magazine categories">{categoryLinks.map(([Icon, label, href]) => <Link href={href} key={label}><Icon aria-hidden="true" /><span>{label}</span></Link>)}</nav></section>;
}

const subscriptionBenefits = [
  [Newspaper, "Premium content", "In-depth stories and exclusive interviews"],
  [Monitor, "Print & digital access", "Read anytime, anywhere on any device"],
  [Star, "Subscriber benefits", "Early access, invitations and special offers"],
] as const;

function SubscriptionBanner({ article }: { article: Article }) {
  return (
    <section className={styles.subscriptionBanner}>
      <div className={styles.subscriptionCopy}><p>The Perspective Magazine</p><h2>Stay Informed. Stay Ahead.</h2><div>Subscribe to The Perspective Magazine and get exclusive access to expert insights, in-depth analysis, and future-shaping ideas delivered to your door.</div><Link href="/magazine/subscribe">Subscribe now</Link></div>
      <div className={styles.subscriptionBenefits}>{subscriptionBenefits.map(([Icon, title, description]) => <article key={title}><Icon aria-hidden="true" /><div><b>{title}</b><span>{description}</span></div></article>)}</div>
      <div className={styles.subscriptionVisual}>{article.heroImage ? <Image alt={article.heroImage.alt} fill sizes="420px" src={article.heroImage.src} /> : null}<span className={styles.paperStack}><b>The Perspective</b><small>{article.title}</small></span></div>
    </section>
  );
}

export function MagazineRedesign({ content }: { content: MagazineLandingContent }) {
  const archiveIssues = content.previousIssues.filter((issue) => !issue.premium);
  return <div className={styles.page} data-magazine-v2>
    <div className={styles.pageWrap}>
      <MagazineHero latest={content.latestIssue} previous={archiveIssues} />
      <MetricsStrip />
      <LatestIssueHero issue={content.latestIssue} />
      <LatestIssue coverStory={content.coverStory} highlights={content.issueHighlights} issue={content.latestIssue} />
      <PastIssues issues={archiveIssues} />
      <div className={styles.exploreIssueBlock}><IssueTableOfContents sections={content.issueSections} /></div>
      <CategoryBrowse />
      <SubscriptionBanner article={content.issueHighlights[0] ?? content.coverStory} />
    </div>
  </div>;
}
