"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Clock3,
  Crown,
  FileText,
  Gift,
  Globe2,
  Landmark,
  Lightbulb,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { MagazineCover } from "@/components/magazine/magazine-cover";
import { formatMagazineIssueDate } from "@/lib/magazine-issue-date";
import type { MagazineArchiveCounts, MagazineArchiveIssue, MagazineArchiveState } from "@/types";
import styles from "./magazine-archive-redesign.module.css";

type SortOrder = "latest" | "oldest";

type Props = {
  counts: MagazineArchiveCounts;
  displayedIssues: readonly MagazineArchiveIssue[];
  featuredIssue: MagazineArchiveIssue;
  sort: SortOrder;
  state: MagazineArchiveState;
  years: readonly number[];
};

const themeItems = [
  ["Leadership", "/magazine/category/leadership", Users],
  ["Business & Economy", "/magazine/category/business", BriefcaseBusiness],
  ["Technology & AI", "/magazine/category/technology", Sparkles],
  ["Markets & Finance", "/search?q=markets", Landmark],
  ["Policy & Governance", "/search?q=policy", FileText],
  ["Sustainability", "/search?q=sustainability", Globe2],
  ["Innovation", "/search?q=innovation", Lightbulb],
  ["Culture & Society", "/magazine/category/culture", Building2],
] as const;

function buildHref(state: MagazineArchiveState, sort: SortOrder, changes: Partial<{ year: number | null; type: MagazineArchiveState["type"]; query: string; sort: SortOrder }> = {}) {
  const params = new URLSearchParams();
  const query = changes.query ?? state.query;
  const year = changes.year === undefined ? state.year : changes.year ?? undefined;
  const type = changes.type ?? state.type;
  const nextSort = changes.sort ?? sort;
  if (query) params.set("q", query);
  if (year) params.set("year", String(year));
  if (type !== "all") params.set("type", type);
  if (nextSort !== "latest") params.set("sort", nextSort);
  const suffix = params.toString();
  return suffix ? `/magazine/archive?${suffix}` : "/magazine/archive";
}

function issueHref(archiveIssue: MagazineArchiveIssue) {
  const { issue } = archiveIssue;
  return issue.readerAvailable ? `/magazine/read/${issue.slug}` : `/magazine/archive?issue=${issue.slug}`;
}

function IssueCard({ archiveIssue }: { archiveIssue: MagazineArchiveIssue }) {
  const { issue, stories } = archiveIssue;
  return (
    <article className={styles.issueCard}>
      <div className={styles.cardCover}><MagazineCover href={issueHref(archiveIssue)} issue={issue} variant="compact" /></div>
      <div className={styles.cardCopy}>
        <p>{formatMagazineIssueDate(issue.publicationDate)} · Issue {String(issue.issueNumber).padStart(2, "0")}</p>
        <h3>{issue.title}</h3>
        <span>{issue.sectionGroups.slice(0, 3).map((section) => section.label).join(" · ") || issue.theme}</span>
        <p className={styles.description}>{issue.description}</p>
        <small>{issue.pageCount} pages · {Math.max(8, issue.featuredArticleIds.length + 6)} stories</small>
        <div className={styles.statusRow}>
          {issue.readerAvailable ? <b><BookOpen aria-hidden="true" /> Digital Reader</b> : <b className={styles.archiveBadge}>Archive issue</b>}
          {issue.premium ? <b className={styles.premiumBadge}><Crown aria-hidden="true" /> Premium</b> : null}
        </div>
        <div className={styles.cardActions}>
          <Link href={issueHref(archiveIssue)}>{issue.readerAvailable ? "Read issue" : "View issue"}</Link>
          <Link href={stories[0] ? `/article/${stories[0].slug}` : "/magazine"}>Explore stories</Link>
        </div>
      </div>
    </article>
  );
}

export function MagazineArchiveRedesign({ counts, displayedIssues, featuredIssue, sort, state, years }: Props) {
  const router = useRouter();
  const allYears = [...new Set([2026, 2025, 2024, 2023, 2022, 2021, 2020, ...years])].sort((a, b) => b - a);
  const grouped = allYears.map((year) => ({ year, issues: displayedIssues.filter(({ issue }) => Number(issue.publicationDate.slice(0, 4)) === year) })).filter((group) => group.issues.length > 0);
  const { issue: heroIssue, stories: heroStories } = featuredIssue;

  return (
    <div className={styles.archivePage}>
      <div aria-label="Breaking news" className={styles.breakingBar}>
        <strong>Breaking</strong>
        <Link href="/article/markets-optimism">Markets assess a changing rate outlook</Link><i aria-hidden="true" />
        <Link href="/article/industrial-investment-strategy">Industrial investment moves back to the center of strategy</Link><i aria-hidden="true" />
        <Link href="/article/global-computing-capacity">Computing capacity becomes a global priority</Link>
        <span><b aria-hidden="true" /> Live</span>
      </div>

      <section aria-labelledby="archive-redesign-title" className={styles.hero}>
        <div className={styles.heroCopy}>
          <p>The Archive</p>
          <h1 id="archive-redesign-title">Every Issue. Every Story.<br />One Growing Record.</h1>
          <span>Explore past editions of The Perspective and revisit the leaders, companies, technologies and ideas that defined each moment.</span>
          <form action="/magazine/archive" className={styles.heroSearch} role="search">
            <Search aria-hidden="true" />
            <label className="sr-only" htmlFor="archive-redesign-search">Search magazine issues</label>
            <input defaultValue={state.query} id="archive-redesign-search" name="q" placeholder="Search issues, themes and cover stories…" />
            {state.year ? <input name="year" type="hidden" value={state.year} /> : null}
            {state.type !== "all" ? <input name="type" type="hidden" value={state.type} /> : null}
            {sort !== "latest" ? <input name="sort" type="hidden" value={sort} /> : null}
            <button type="submit">Search</button>
          </form>
        </div>
        <div aria-label="The Perspective archive collection" className={styles.heroArt}>
          <div className={styles.coverStack}>
            <i /><i />
            <div className={styles.heroCover}>
              {heroIssue.coverImage ? <Image alt={heroIssue.coverImage.alt} fill priority sizes="250px" src={heroIssue.coverImage.src} /> : null}
              <span aria-hidden="true" />
              <div><small>The Perspective</small><b>{formatMagazineIssueDate(heroIssue.publicationDate)} · Issue {String(heroIssue.issueNumber).padStart(2, "0")}</b></div>
              <div><small>{heroIssue.coverKicker}</small><strong>{heroIssue.coverHeadline}</strong></div>
            </div>
          </div>
          <div className={styles.openIssue}>
            <div><small>The Perspective</small><h2>The Next Era<br />of Leadership</h2><p>Ideas, institutions and the people building a more consequential future.</p></div>
            <div className={styles.openPortrait}><Image alt="Editorial portrait from a Perspective leadership interview" fill sizes="220px" src="/images/articles/elena-rossi.png" /></div>
          </div>
        </div>
      </section>

      <nav aria-label="Archive year and edition filters" className={styles.filters}>
        <div className={styles.yearFilters}>
          <Link aria-current={!state.year ? "page" : undefined} href={buildHref(state, sort, { year: null })}>All years</Link>
          {allYears.map((year) => <Link aria-current={state.year === year ? "page" : undefined} href={buildHref(state, sort, { year })} key={year}>{year}</Link>)}
        </div>
        <div className={styles.typeFilters}>
          <Link aria-current={state.type === "all" ? "page" : undefined} href={buildHref(state, sort, { type: "all" })}>All issues</Link>
          <Link aria-current={state.type === "reader" ? "page" : undefined} href={buildHref(state, sort, { type: "reader" })}>Digital Reader</Link>
          <Link aria-current={state.type === "premium" ? "page" : undefined} href={buildHref(state, sort, { type: "premium" })}>Premium editions</Link>
        </div>
        <label className={styles.sortLabel}>Sort by:
          <select aria-label="Sort magazine issues" onChange={(event) => router.push(buildHref(state, sort, { sort: event.target.value as SortOrder }))} value={sort}>
            <option value="latest">Latest first</option><option value="oldest">Oldest first</option>
          </select>
        </label>
      </nav>

      <section aria-labelledby="featured-archive-redesign" className={styles.featured}>
        <div className={styles.featuredIssue}>
          <MagazineCover href={issueHref(featuredIssue)} issue={heroIssue} priority variant="standard" />
          <div>
            <p>Featured archived issue</p>
            <span>{formatMagazineIssueDate(heroIssue.publicationDate)} · Issue {String(heroIssue.issueNumber).padStart(2, "0")}</span>
            <h2 id="featured-archive-redesign">{heroIssue.title}</h2>
            <small>{heroIssue.theme} · {heroIssue.sectionGroups.map((section) => section.label).slice(0, 3).join(" · ")}</small>
            <p>{heroIssue.description}</p>
            <div className={styles.featureMeta}><span><FileText aria-hidden="true" /> {heroIssue.pageCount} pages</span><span><BookOpen aria-hidden="true" /> {Math.max(12, heroStories.length + 8)} featured stories</span></div>
            <div className={styles.featureActions}><Link href={issueHref(featuredIssue)}>Read digital issue</Link><Link href={heroStories[0] ? `/article/${heroStories[0].slug}` : "/magazine"}>Explore stories</Link></div>
          </div>
        </div>
        <aside className={styles.highlights}>
          <h2>Archive highlights</h2>
          <div><article><FileText aria-hidden="true" /><b>{Math.max(96, counts.all)}</b><span>Magazine issues</span></article><article><BookOpen aria-hidden="true" /><b>875+</b><span>In-depth articles</span></article><article><Users aria-hidden="true" /><b>350+</b><span>Global contributors</span></article><article><Clock3 aria-hidden="true" /><b>12M+</b><span>Readers worldwide</span></article></div>
        </aside>
      </section>

      <section aria-labelledby="archive-year-heading" className={styles.yearBrowse}>
        <header><h2 id="archive-year-heading">Browse issues by year</h2><span>{displayedIssues.length} editions</span></header>
        {grouped.length ? grouped.map((group) => <section aria-labelledby={`archive-year-${group.year}`} className={styles.yearGroup} key={group.year}><header><h3 id={`archive-year-${group.year}`}>{group.year}</h3><Link href={buildHref(state, sort, { year: group.year })}>View all {group.year} issues <ArrowRight aria-hidden="true" /></Link></header><div>{group.issues.map((issue) => <IssueCard archiveIssue={issue} key={issue.issue.id} />)}</div></section>) : <div className={styles.emptyState}><Search aria-hidden="true" /><h2>No editions match these filters.</h2><p>Try another year, edition type or search phrase.</p><Link href="/magazine/archive">Clear archive filters</Link></div>}
      </section>

      <section aria-labelledby="unlock-archive-heading" className={styles.unlock}>
        <div className={styles.unlockCopy}><h2 id="unlock-archive-heading">Unlock the Complete Archive</h2><p>Get unlimited access to every magazine issue, exclusive interviews, deep analysis and premium reports.</p><ul><li>Digital Reader access</li><li>Premium and collector editions</li><li>Exclusive archive content</li><li>Cancel anytime</li></ul><Link href="/magazine/subscribe">View subscription plans</Link></div>
        <div className={styles.unlockCovers}>{displayedIssues.slice(0, 3).map(({ issue }) => <MagazineCover issue={issue} key={issue.id} variant="compact" />)}</div>
        <div className={styles.darkBriefing}><Mail aria-hidden="true" /><h2>The Perspective Briefing</h2><p>The best essays, interviews and insights delivered every week.</p><NewsletterForm buttonLabel="Subscribe" label="Archive briefing email" theme="dark" /></div>
      </section>

      <section aria-labelledby="archive-theme-heading" className={styles.themes}>
        <header><h2 id="archive-theme-heading">Explore by theme</h2><Link href="/magazine">View all themes <ArrowRight aria-hidden="true" /></Link></header>
        <div>{themeItems.map(([label, href, Icon]) => <Link href={href} key={label}><Icon aria-hidden="true" /><span>{label}</span></Link>)}</div>
      </section>

      <section aria-label="Magazine services" className={styles.services}>
        <article><BookOpen aria-hidden="true" /><div><h2>Digital Reader access</h2><p>Read every issue online with our immersive digital experience.</p><Link href="/magazine/read/august-2026">Learn more <ArrowRight aria-hidden="true" /></Link></div></article>
        <article><Crown aria-hidden="true" /><div><h2>Premium editions</h2><p>Collector&apos;s editions with exclusive covers and special content.</p><Link href="/magazine/premium">Explore Premium <ArrowRight aria-hidden="true" /></Link></div></article>
        <article><Gift aria-hidden="true" /><div><h2>Gift a subscription</h2><p>Share knowledge and insight with colleagues and loved ones.</p><Link href="/magazine/subscribe">Gift now <ArrowRight aria-hidden="true" /></Link></div></article>
        <article><ShieldCheck aria-hidden="true" /><div><h2>Institutional access</h2><p>Solutions for libraries, universities and organizations.</p><Link href="/search?q=institutional+access">Contact us <ArrowRight aria-hidden="true" /></Link></div></article>
      </section>

      <section aria-labelledby="original-archive-heading" className={styles.originalIntro}>
        <p>Complete publication record</p><h2 id="original-archive-heading">Original archive experience</h2><span>The existing archive content and discovery modules continue below.</span>
      </section>
    </div>
  );
}
