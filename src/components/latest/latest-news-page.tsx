"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  ChevronDown,
  Radio,
} from "lucide-react";
import type { Article, MagazineIssue } from "@/types";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import styles from "./latest-news-page.module.css";

const topicFilters = ["All", "Business", "Economy", "Technology", "Markets", "Leadership"] as const;
const categoryFilters = ["All", "India", "World", "Business", "Technology", "Economy", "Markets", "Leadership", "Opinion", "Lifestyle", "Science", "Culture"] as const;

const liveUpdates = [
  ["2m ago", "RBI keeps repo rate unchanged at 6.50%, maintains neutral stance", "/article/markets-optimism"],
  ["7m ago", "Companies rewrite their supply-chain strategies", "/article/supply-chain-strategies"],
  ["12m ago", "Enterprise AI spending enters its next phase", "/article/enterprise-ai-phase"],
  ["16m ago", "Boards rethink succession planning for the AI era", "/article/boards-succession"],
  ["21m ago", "Private markets reshape corporate financing", "/article/private-markets-financing"],
  ["28m ago", "Asian markets advance after technology rally", "/article/asian-markets-advance"],
] as const;

function articleHref(article: Article) {
  return `/article/${article.slug}`;
}

function articleDate(article: Article) {
  if (article.displayTime) return article.displayTime;
  const date = new Date(article.publishedAt ?? article.updatedAt);
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(date);
}

function matchesFilter(article: Article, filter: string) {
  if (filter === "All") return true;
  const taxonomy = `${article.category.name} ${article.subcategory ?? ""}`.toLowerCase();
  const haystack = `${article.category.name} ${article.subcategory ?? ""} ${article.title} ${article.excerpt}`.toLowerCase();
  const aliases: Record<string, string[]> = {
    India: ["india", "indian"],
    World: ["world", "global", "international"],
    Economy: ["economy", "economic"],
    Science: ["science", "research", "computing"],
  };
  if (aliases[filter]) return aliases[filter].some((term) => haystack.includes(term));
  return taxonomy.includes(filter.toLowerCase());
}

function StoryImage({ article, sizes, priority = false }: { article: Article; sizes: string; priority?: boolean }) {
  return article.heroImage ? (
    <Image alt={article.heroImage.alt} fill loading={priority ? "eager" : "lazy"} priority={priority} sizes={sizes} src={article.heroImage.src} />
  ) : <span className={styles.imageFallback} />;
}

function BreakingRail() {
  return (
    <aside aria-label="Breaking news" className={styles.breakingRail}>
      <div className={styles.pageWrap}>
        <strong>Breaking</strong>
        <div className={styles.breakingStories}>
          <Link href="/article/markets-optimism"><i /> RBI keeps repo rate unchanged as investors assess the outlook</Link>
          <Link href="/article/industrial-investment-strategy"><i /> Industrial investment returns to the center of economic strategy</Link>
          <Link href="/article/global-computing-capacity"><i /> Global computing capacity enters a new investment cycle</Link>
        </div>
        <span className={styles.liveFlag}><i /> Live</span>
      </div>
    </aside>
  );
}

function LatestHeading({ active, onChange }: { active: string; onChange: (value: string) => void }) {
  return (
    <div className={styles.pageHeading}>
      <div>
        <h1>Latest News</h1>
        <p>Real-time updates and in-depth stories from India and around the world.</p>
      </div>
      <div className={styles.followTopics}>
        <span>Follow topics:</span>
        {topicFilters.map((topic) => <button aria-pressed={active === topic} key={topic} onClick={() => onChange(topic)} type="button">{topic}</button>)}
      </div>
    </div>
  );
}

function FilterBar({ active, onChange, sort, onSort }: { active: string; onChange: (value: string) => void; sort: string; onSort: (value: string) => void }) {
  return (
    <div className={styles.filterBar}>
      <div aria-label="Filter latest news" className={styles.filterScroller} role="toolbar">
        {categoryFilters.map((category) => <button aria-pressed={active === category} key={category} onClick={() => onChange(category)} type="button">{category}</button>)}
      </div>
      <label className={styles.sortControl}>Sort by:
        <select aria-label="Sort latest news" onChange={(event) => onSort(event.target.value)} value={sort}>
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="longest">Longest read</option>
        </select>
        <ChevronDown aria-hidden="true" />
      </label>
    </div>
  );
}

function LeadStory({ article, saved, onSave }: { article: Article; saved: boolean; onSave: () => void }) {
  const author = article.authors[0];
  return (
    <article className={styles.leadStory}>
      <Link aria-label={`Read ${article.title}`} className={styles.leadImage} href={articleHref(article)}>
        <StoryImage article={article} priority sizes="(max-width: 767px) 100vw, (max-width: 1100px) 52vw, 560px" />
      </Link>
      <div className={styles.leadCopy}>
        <p className={styles.storyLabel}>Top story</p>
        <h2><Link href={articleHref(article)}>{article.title}</Link></h2>
        <p className={styles.leadExcerpt}>{article.dek ?? article.excerpt}</p>
        <div className={styles.authorLine}>
          {author?.avatar ? <span className={styles.avatar}><Image alt={author.avatar.alt} fill sizes="34px" src={author.avatar.src} /></span> : <span className={styles.avatarInitials}>{author?.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>}
          <span>By {author?.name ?? "The Perspective Desk"}</span><i /> <span>{article.readingMinutes} min read</span>
        </div>
        <p className={styles.storyMeta}><time dateTime={article.publishedAt ?? article.updatedAt}>{articleDate(article)}</time><i />{article.category.name}</p>
        <button aria-label={`${saved ? "Remove" : "Save"} ${article.title}`} aria-pressed={saved} className={styles.saveButton} onClick={onSave} type="button"><Bookmark aria-hidden="true" fill={saved ? "currentColor" : "none"} /></button>
      </div>
    </article>
  );
}

function StoryRow({ article, saved, onSave }: { article: Article; saved: boolean; onSave: () => void }) {
  return (
    <article className={styles.storyRow}>
      <Link aria-label={`Read ${article.title}`} className={styles.storyImage} href={articleHref(article)}><StoryImage article={article} sizes="(max-width: 600px) 130px, 270px" /></Link>
      <div className={styles.storyCopy}>
        <p className={styles.storyLabel}>{article.category.name}</p>
        <h2><Link href={articleHref(article)}>{article.title}</Link></h2>
        <p>{article.excerpt}</p>
        <div className={styles.storyByline}><span>By {article.authors[0]?.name ?? "Perspective Desk"}</span><i /><time dateTime={article.publishedAt ?? article.updatedAt}>{articleDate(article)}</time><i /><span>{article.readingMinutes} min read</span></div>
      </div>
      <button aria-label={`${saved ? "Remove" : "Save"} ${article.title}`} aria-pressed={saved} className={styles.saveButton} onClick={onSave} type="button"><Bookmark aria-hidden="true" fill={saved ? "currentColor" : "none"} /></button>
    </article>
  );
}

function LiveUpdates() {
  return (
    <section className={styles.sidebarCard}>
      <header className={styles.sidebarHeading}><h2><Radio aria-hidden="true" /> Live updates</h2><Link href="/news">View all <ArrowRight aria-hidden="true" /></Link></header>
      <div className={styles.liveList}>{liveUpdates.map(([time, title, href]) => <article key={title}><time>{time}</time><Link href={href}>{title}</Link></article>)}</div>
      <Link className={styles.outlineAction} href="/news">Go to live center</Link>
    </section>
  );
}

function MostRead({ articles }: { articles: readonly Article[] }) {
  return (
    <section className={styles.sidebarCard}>
      <header className={styles.sidebarHeading}><h2>Most read</h2><Link href="/latest">View all <ArrowRight aria-hidden="true" /></Link></header>
      <ol className={styles.mostRead}>{articles.slice(0, 5).map((article, index) => <li key={article.id}><b>{String(index + 1).padStart(2, "0")}</b><Link className={styles.mostReadImage} href={articleHref(article)}><StoryImage article={article} sizes="72px" /></Link><Link href={articleHref(article)}>{article.title}</Link></li>)}</ol>
    </section>
  );
}

function MagazinePromo({ issue }: { issue: MagazineIssue }) {
  return (
    <section className={`${styles.sidebarCard} ${styles.magazinePromo}`}>
      <div><h2>The Perspective<br />Magazine</h2><p>India&apos;s trusted source for deep insights.</p><Link href="/magazine/subscribe">Subscribe now</Link><Link className={styles.learnMore} href="/magazine">Learn more <ArrowRight aria-hidden="true" /></Link></div>
      {issue.coverImage && <Link aria-label={`Read ${issue.title}`} className={styles.magazineCover} href={`/magazine/read/${issue.slug}`}><Image alt={issue.coverImage.alt} fill sizes="130px" src={issue.coverImage.src} /><span>The<br />Perspective</span><b>{issue.coverHeadline}</b></Link>}
    </section>
  );
}

function SidebarNewsletter() {
  return (
    <section className={`${styles.sidebarCard} ${styles.sidebarNewsletter}`}>
      <h2>Newsletter</h2><p>Curated stories, expert insights, straight to your inbox.</p>
      <NewsletterForm buttonLabel="Subscribe" label="Latest news newsletter" theme="light" />
      <small>No spam. Unsubscribe anytime.</small>
    </section>
  );
}

function SocialCard() {
  const social = [
    ["Facebook", "https://facebook.com", "f"],
    ["X", "https://x.com", "X"],
    ["LinkedIn", "https://linkedin.com", "in"],
    ["Instagram", "https://instagram.com", "ig"],
    ["YouTube", "https://youtube.com", "▶"],
  ] as const;
  return <section className={`${styles.sidebarCard} ${styles.socialCard}`}><h2>Follow us</h2><div>{social.map(([label, href, glyph]) => <a aria-label={label} href={href} key={label} rel="noreferrer" target="_blank">{glyph}</a>)}</div></section>;
}

function Pagination({ current, count, onChange }: { current: number; count: number; onChange: (page: number) => void }) {
  const visible = Array.from({ length: Math.min(5, count) }, (_, index) => index + 1);
  return <nav aria-label="Latest news pagination" className={styles.pagination}>{visible.map((page) => <button aria-current={current === page ? "page" : undefined} key={page} onClick={() => onChange(page)} type="button">{page}</button>)}{count > 6 && <span>…</span>}{count > 5 && <button aria-current={current === count ? "page" : undefined} onClick={() => onChange(count)} type="button">{count}</button>}<button disabled={current === count} onClick={() => onChange(Math.min(count, current + 1))} type="button">Next <ArrowRight aria-hidden="true" /></button></nav>;
}

function InDepth({ articles }: { articles: readonly Article[] }) {
  return (
    <section className={styles.inDepth}>
      <header><h2>In depth</h2><Link href="/search?q=analysis">View all in depth <ArrowRight aria-hidden="true" /></Link></header>
      <div>{articles.slice(0, 4).map((article) => <article key={article.id}><Link className={styles.inDepthImage} href={articleHref(article)}><StoryImage article={article} sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 310px" /></Link><p>In depth</p><h3><Link href={articleHref(article)}>{article.title}</Link></h3><small>By {article.authors[0]?.name ?? "Perspective Desk"}<i />{article.readingMinutes} min read</small></article>)}</div>
    </section>
  );
}

export function LatestNewsPage({ articles, leadArticles, inDepth, mostRead, magazineIssue }: { articles: Article[]; leadArticles: Article[]; inDepth: Article; mostRead: Article[]; magazineIssue: MagazineIssue }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sort, setSort] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [saved, setSaved] = useState<Set<string>>(() => new Set());
  const pageSize = 7;

  const filtered = useMemo(() => {
    const selected = articles.filter((article) => matchesFilter(article, activeCategory));
    return [...selected].sort((left, right) => {
      if (sort === "longest") return right.readingMinutes - left.readingMinutes;
      const comparison = (right.publishedAt ?? right.updatedAt).localeCompare(left.publishedAt ?? left.updatedAt);
      return sort === "oldest" ? -comparison : comparison;
    });
  }, [activeCategory, articles, sort]);

  const preferredLead = activeCategory === "All" ? leadArticles[0] : filtered[0];
  const lead = preferredLead ?? articles[0];
  const feed = filtered.filter((article) => article.id !== lead?.id);
  const pageCount = Math.max(1, Math.ceil(feed.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const visibleStories = feed.slice((safePage - 1) * pageSize, safePage * pageSize);
  const inDepthStories = [inDepth, ...articles.filter((article) => article.id !== inDepth.id && (article.articleType === "analysis" || article.premium))].slice(0, 4);

  function changeCategory(category: string) { setActiveCategory(category); setCurrentPage(1); }
  function toggleSaved(id: string) { setSaved((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }
  function changePage(page: number) { setCurrentPage(page); document.getElementById("latest-feed")?.scrollIntoView({ behavior: "smooth", block: "start" }); }

  return <div className={styles.page} data-latest-v2>
    <BreakingRail />
    <div className={styles.pageWrap}>
      <LatestHeading active={activeCategory} onChange={changeCategory} />
      <FilterBar active={activeCategory} onChange={changeCategory} onSort={(value) => { setSort(value); setCurrentPage(1); }} sort={sort} />
      <div className={styles.contentGrid} id="latest-feed">
        <div className={styles.newsColumn}>
          {lead ? <LeadStory article={lead} onSave={() => toggleSaved(lead.id)} saved={saved.has(lead.id)} /> : null}
          {visibleStories.length ? visibleStories.map((article) => <StoryRow article={article} key={article.id} onSave={() => toggleSaved(article.id)} saved={saved.has(article.id)} />) : <div className={styles.emptyState}><h2>No stories found</h2><p>Try another news category to continue exploring.</p><button onClick={() => changeCategory("All")} type="button">Show all latest news</button></div>}
          {feed.length > pageSize && <Pagination count={pageCount} current={safePage} onChange={changePage} />}
        </div>
        <aside aria-label="Latest news sidebar" className={styles.sidebar}><LiveUpdates /><MostRead articles={mostRead} /><MagazinePromo issue={magazineIssue} /><SidebarNewsletter /><SocialCard /></aside>
      </div>
      <InDepth articles={inDepthStories} />
    </div>
  </div>;
}
