import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Bookmark,
  CalendarDays,
  Check,
  ChevronDown,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import type {
  ArticleSearchResult,
  SearchCounts,
  SearchFilter,
  SearchResult,
  SearchSort,
} from "@/types";
import { articles } from "@/data/mock/articles";
import { getPublicAuthors } from "@/data/mock/author-profiles";
import { magazineIssues } from "@/data/mock/magazines";
import { people } from "@/data/mock/people";
import { buildSearchUrl, searchFilterLabels, searchFilters } from "@/lib/search";
import { formatEditorialDate } from "@/lib/editorial-date";
import styles from "./search-redesign.module.css";

const relatedTopics = [
  ["Machine Learning", 568],
  ["Generative AI", 432],
  ["AI Ethics", 312],
  ["AI in Business", 298],
  ["Robotics", 186],
  ["ChatGPT", 163],
  ["AI in Healthcare", 146],
  ["AI & Jobs", 134],
] as const;

const popularSearches = [
  "Artificial Intelligence",
  "Leadership",
  "Sustainability",
  "Future of Work",
  "Digital Transformation",
  "India Economy 2030",
  "Global Markets",
  "Startups",
] as const;

const categoryFilters = [
  ["Technology & AI", "technology"],
  ["Business & Economy", "business"],
  ["Leadership", "leadership"],
  ["Markets & Investing", "markets"],
  ["Policy & Impact", "policy"],
] as const;

const readTimes = ["Less than 5 min", "5–10 min", "10–20 min", "20+ min"] as const;

const resultTypeLabels: Record<SearchFilter, string> = {
  all: "All Content",
  articles: "Articles",
  contributors: "Authors",
  people: "People",
  magazines: "Magazines",
};

function BreakingStrip() {
  return (
    <section aria-label="Breaking news" className={styles.breaking}>
      <div className={styles.shell}>
        <strong>Breaking</strong>
        <div>
          <Link href="/article/markets-optimism">Markets reassess the path for interest rates and long-term capital</Link>
          <Link href="/article/industrial-investment-strategy">Industrial investment returns to the center of strategy</Link>
          <Link href="/article/global-computing-capacity">Computing capacity becomes a global priority</Link>
        </div>
        <span><i /> Live</span>
      </div>
    </section>
  );
}

function SearchHeading({ query, rawQuery, type, sort, count }: { query: string; rawQuery: string; type: SearchFilter; sort: SearchSort; count: number }) {
  return (
    <section className={styles.searchHeading}>
      <div className={styles.shell}>
        <p className={styles.eyebrow}>Search The Perspective</p>
        <h1>Find Stories, People &amp; Ideas</h1>
        <form action="/search" className={styles.searchForm} method="get" role="search">
          <Search aria-hidden="true" />
          <label className="sr-only" htmlFor="redesign-search-query">Search The Perspective</label>
          <input defaultValue={rawQuery} id="redesign-search-query" name="q" placeholder="Search stories, people, companies and ideas" type="search" />
          {rawQuery ? <Link aria-label="Clear search" href="/search"><X aria-hidden="true" /></Link> : null}
          {type !== "all" ? <input name="type" type="hidden" value={type} /> : null}
          {sort !== "relevance" ? <input name="sort" type="hidden" value={sort} /> : null}
          <button type="submit">Search</button>
        </form>
        <div className={styles.summaryLine}>
          <p>{query ? <>Results for <q>{query}</q></> : "Search our complete editorial archive"}</p>
          {query ? <span>{count} matching {count === 1 ? "result" : "results"}</span> : <span>Articles · Authors · People · Magazines</span>}
        </div>
      </div>
    </section>
  );
}

function ResultTabs({ counts, query, sort, type }: { counts: SearchCounts; query: string; sort: SearchSort; type: SearchFilter }) {
  return (
    <nav aria-label="Search result types" className={styles.resultTabs}>
      {searchFilters.map((filter) => (
        <Link aria-current={filter === type ? "page" : undefined} href={buildSearchUrl({ query, type: filter, sort })} key={filter}>
          {searchFilterLabels[filter]} <span>({counts[filter]})</span>
        </Link>
      ))}
    </nav>
  );
}

function SortControl({ query, type, sort }: { query: string; type: SearchFilter; sort: SearchSort }) {
  return (
    <form action="/search" className={styles.sort} method="get">
      <input name="q" type="hidden" value={query} />
      {type !== "all" ? <input name="type" type="hidden" value={type} /> : null}
      <label htmlFor="redesign-search-sort">Sort by:</label>
      <select defaultValue={sort} id="redesign-search-sort" name="sort">
        <option value="relevance">Most Relevant</option>
        <option value="newest">Newest</option>
      </select>
      <button aria-label="Apply sorting" type="submit"><ChevronDown aria-hidden="true" /></button>
    </form>
  );
}

function FilterSidebar({ counts, query, sort, type }: { counts: SearchCounts; query: string; sort: SearchSort; type: SearchFilter }) {
  return (
    <aside aria-label="Refine search results" className={styles.filters}>
      <header><h2>Refine Results</h2><Link href={buildSearchUrl({ query })}>Clear All</Link></header>
      <section>
        <h3>Content Type</h3>
        {searchFilters.map((filter) => (
          <Link className={filter === type ? styles.filterActive : undefined} href={buildSearchUrl({ query, type: filter, sort })} key={filter}>
            <i>{filter === type ? <Check aria-hidden="true" /> : null}</i><span>{resultTypeLabels[filter]}</span><b>{counts[filter]}</b>
          </Link>
        ))}
      </section>
      <section>
        <h3>Category <ChevronDown aria-hidden="true" /></h3>
        {categoryFilters.map(([label, value], index) => (
          <Link href={buildSearchUrl({ query: value })} key={value}><i /><span>{label}</span><b>{Math.max(8, 84 - index * 13)}</b></Link>
        ))}
        <Link className={styles.showMore} href="/search">Show More</Link>
      </section>
      <section>
        <h3>Date Range</h3>
        {["Any Time", "Past 24 Hours", "Past 7 Days", "Past 30 Days", "Past 12 Months"].map((label, index) => (
          <Link href={index === 0 ? buildSearchUrl({ query, type, sort }) : buildSearchUrl({ query: `${query} ${label}`.trim(), type, sort })} key={label}>
            <i className={index === 0 ? styles.radioActive : styles.radio} /><span>{label}</span>
          </Link>
        ))}
        <Link href={buildSearchUrl({ query: `${query} archive`.trim(), type, sort })}><CalendarDays aria-hidden="true" /><span>Custom Range</span></Link>
      </section>
      <section>
        <h3>Author</h3>
        <div className={styles.authorSearch}><input aria-label="Search authors" placeholder="Search authors…" /><Search aria-hidden="true" /></div>
        {getPublicAuthors().slice(0, 5).map((author, index) => (
          <Link href={buildSearchUrl({ query: author.name, type: "contributors" })} key={author.id}><span>{author.name}</span><b>{56 - index * 7}</b></Link>
        ))}
        <Link className={styles.showMore} href="/authors">Show More</Link>
      </section>
      <section>
        <h3>Read Time</h3>
        {readTimes.map((label, index) => <Link href={buildSearchUrl({ query, sort, type })} key={label}><i /><span>{label}</span><b>{423 - index * 91}</b></Link>)}
      </section>
      <Link className={styles.applyFilters} href={buildSearchUrl({ query, type, sort })}>Apply Filters</Link>
    </aside>
  );
}

function ResultImage({ result }: { result: SearchResult }) {
  if (!result.image) return <span className={styles.imageFallback}><Search aria-hidden="true" /></span>;
  return <Image alt={result.image.alt || ""} fill sizes="(max-width: 760px) 100vw, 340px" src={result.image.src} />;
}

function MatchCard({ result, featured = false }: { result: SearchResult; featured?: boolean }) {
  const article = result.type === "article" ? result : undefined;
  return (
    <article className={styles.matchCard}>
      {result.href ? <Link aria-label={`Open ${result.title}`} className={styles.matchImage} href={result.href}><ResultImage result={result} /></Link> : <div className={styles.matchImage}><ResultImage result={result} /></div>}
      <div>
        <p className={styles.resultKind}>{featured ? "Featured " : ""}{result.type === "contributor" ? "Author" : result.type}</p>
        <h3>{result.href ? <Link href={result.href}>{result.title}</Link> : result.title}</h3>
        <p className={styles.matchDescription}>{result.description}</p>
        {article ? <ArticleMeta article={article} /> : <p className={styles.genericMeta}>{result.type === "contributor" ? result.role : result.type === "person" ? [result.role, result.company].filter(Boolean).join(" · ") : result.type === "magazine" ? result.issueLabel : "The Perspective"}</p>}
        {result.href ? <Link aria-label={`Save ${result.title}`} className={styles.save} href={result.href}><Bookmark aria-hidden="true" /></Link> : null}
      </div>
    </article>
  );
}

function ArticleMeta({ article }: { article: ArticleSearchResult }) {
  const author = getPublicAuthors().find((candidate) => candidate.slug === article.authorSlug);
  return (
    <p className={styles.articleMeta}>
      {author?.avatar ? <span><Image alt="" fill sizes="28px" src={author.avatar.src} /></span> : null}
      <Link href={`/author/${article.authorSlug}`}>{article.authorName}</Link><i />
      <time dateTime={article.publishedAt}>{formatEditorialDate(article.publishedAt)}</time><i />
      {article.readingMinutes} min read
    </p>
  );
}

function EmptyState({ query, hasAnyResults }: { query: string; hasAnyResults: boolean }) {
  return (
    <section className={styles.emptyState}>
      <span><Search aria-hidden="true" /></span>
      <p className={styles.eyebrow}>{query ? "No exact matches" : "Start your search"}</p>
      <h2>{query ? `We couldn’t find ${hasAnyResults ? "this content type" : `“${query}”`}.` : "What are you curious about?"}</h2>
      <p>{query ? "Try another phrase, broaden your filters or explore one of our most-read subjects." : "Search ideas, reporting, contributors, interviews and every issue of The Perspective."}</p>
      <div>{popularSearches.slice(0, 5).map((topic) => <Link href={buildSearchUrl({ query: topic })} key={topic}>{topic}</Link>)}</div>
    </section>
  );
}

function AuthorDiscovery() {
  return (
    <section className={styles.discoverySection}>
      <SectionTitle action="View All Authors" href="/authors" title="Authors & Contributors" />
      <div className={styles.authorCards}>
        {getPublicAuthors().slice(0, 4).map((author) => (
          <Link href={`/author/${author.slug}`} key={author.id}>
            <span>{author.avatar ? <Image alt={`Portrait of ${author.name}`} fill sizes="180px" src={author.avatar.src} /> : null}</span>
            <h3>{author.name}</h3><p>{author.role}</p><b>{Math.max(31, 63 - author.name.length)} Articles</b>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PeopleDiscovery() {
  return (
    <section className={styles.discoverySection}>
      <SectionTitle action="View All People" href="/search?type=people&q=leader" title="People & Interviews" />
      <div className={styles.peopleCards}>
        {people.slice(0, 4).map((person) => (
          <Link href={buildSearchUrl({ query: person.name, type: "people" })} key={person.id}>
            <span>{person.portrait ? <Image alt={person.portrait.alt} fill sizes="150px" src={person.portrait.src} /> : <Search aria-hidden="true" />}</span>
            <div><h3>{person.name}</h3><p>{person.title}</p><b>Interview</b></div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function MagazineDiscovery() {
  return (
    <section className={styles.discoverySection}>
      <SectionTitle action="View All Magazines" href="/magazine/archive" title="Magazine Results" />
      <div className={styles.magazineCards}>
        {magazineIssues.filter((issue) => !issue.premium).slice(0, 4).map((issue) => (
          <Link href={issue.readerAvailable ? `/magazine/read/${issue.slug}` : `/magazine/archive?issue=${issue.slug}`} key={issue.id}>
            <span>{issue.coverImage ? <Image alt={issue.coverImage.alt} fill sizes="90px" src={issue.coverImage.src} /> : null}<i>THE<br />PERSPECTIVE</i></span>
            <div><h3>{issue.title}</h3><p>{issue.theme}</p><b>{issue.pageCount} pages</b></div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SectionTitle({ title, href, action }: { title: string; href?: string; action?: string }) {
  return <header className={styles.sectionTitle}><h2>{title}</h2>{href ? <Link href={href}>{action} <ArrowRight aria-hidden="true" /></Link> : null}</header>;
}

function DiscoverySidebar() {
  return (
    <aside aria-label="Search discovery" className={styles.discoverySidebar}>
      <section><h2>Related Topics</h2>{relatedTopics.map(([topic, count]) => <Link href={buildSearchUrl({ query: topic })} key={topic}>{topic} <span>({count})</span></Link>)}<Link className={styles.sidebarMore} href="/search">Show More <ChevronDown aria-hidden="true" /></Link></section>
      <section><h2>Popular Searches</h2>{popularSearches.map((topic, index) => <Link href={buildSearchUrl({ query: topic })} key={topic}>{topic}<TrendingUp aria-hidden="true" className={index === 2 || index === 6 ? styles.trendDown : undefined} /></Link>)}</section>
      <section className={styles.trending}><h2>Trending Now</h2><ol>{articles.slice(0, 5).map((article, index) => <li key={article.id}><b>{String(index + 1).padStart(2, "0")}</b><Link href={`/article/${article.slug}`}>{article.title}</Link></li>)}</ol><Link className={styles.sidebarMore} href="/latest">View All Trends <ArrowRight aria-hidden="true" /></Link></section>
    </aside>
  );
}

function SearchCta() {
  return (
    <section className={`${styles.searchCta} ${styles.shell}`}>
      <div><span><Search aria-hidden="true" /></span><div><h2>Can’t Find What You’re Looking For?</h2><p>Try different keywords or explore our topics and categories.</p><Link href="/search">Explore All Topics</Link></div></div>
      <div><span className={styles.envelope}>✉</span><div><h2>Stay Updated with The Perspective</h2><p>Get the best stories, interviews and insights delivered to your inbox every week.</p><form action="/search" method="get"><input aria-label="Email address" name="q" placeholder="Enter your email address" type="email" /><button type="submit">Subscribe</button></form></div></div>
    </section>
  );
}

export function SearchRedesign({ rawQuery, query, type, sort, allResults, filteredResults, counts }: { rawQuery: string; query: string; type: SearchFilter; sort: SearchSort; allResults: readonly SearchResult[]; filteredResults: readonly SearchResult[]; counts: SearchCounts }) {
  const topMatches = filteredResults.slice(0, 3);
  return (
    <div className={styles.page}>
      <BreakingStrip />
      <SearchHeading count={filteredResults.length} query={query} rawQuery={rawQuery} sort={sort} type={type} />
      <div className={`${styles.toolbar} ${styles.shell}`}><ResultTabs counts={counts} query={query} sort={sort} type={type} /><SortControl query={query} sort={sort} type={type} /></div>
      <div className={`${styles.resultsLayout} ${styles.shell}`}>
        <FilterSidebar counts={counts} query={query} sort={sort} type={type} />
        <main className={styles.resultsMain}>
          {query && topMatches.length ? <section><SectionTitle title={type === "all" ? "Top Matches" : searchFilterLabels[type]} />{topMatches.map((result, index) => <MatchCard featured={index === 0} key={`${result.type}-${result.id}`} result={result} />)}{filteredResults.length > topMatches.length ? <Link className={styles.moreResults} href="#current-search-experience">View More Results <ArrowDown aria-hidden="true" /></Link> : null}</section> : <EmptyState hasAnyResults={allResults.length > 0} query={query} />}
          <AuthorDiscovery />
          <PeopleDiscovery />
          <MagazineDiscovery />
        </main>
        <DiscoverySidebar />
      </div>
      <SearchCta />
      <section className={styles.archiveDivider} id="current-search-experience">
        <div className={styles.shell}><p className={styles.eyebrow}>Complete search archive</p><h2>Continue with the full Perspective search experience.</h2><p>Browse every matching result, the original discovery tools and the complete archive below.</p></div>
      </section>
    </div>
  );
}
