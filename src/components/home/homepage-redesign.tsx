import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, BarChart3, BookOpen, BriefcaseBusiness, Building2, ChevronRight,
  CirclePlay, Clock3, Globe2, Headphones, Lightbulb, Radio, Sparkles,
} from "lucide-react";
import type { Article, Author, ImageAsset } from "@/types";
import type { HomepageRedesignContent } from "@/lib/homepage-redesign";
import { HomepageHeroCarousel } from "./homepage-hero-carousel";
import { HomepageMagazineCarousel } from "./homepage-magazine-carousel";
import { HomepagePersonalCarousel } from "./homepage-personal-carousel";
import { HomepagePodcastCarousel } from "./homepage-podcast-carousel";

const articleHref = (article: Article) => `/article/${article.slug}`;
const authorHref = (author: Author) => `/author/${author.slug}`;
const magazineHref = (issue: HomepageRedesignContent["magazineIssues"][number]) => issue.readerAvailable ? `/magazine/read/${issue.slug}` : `/magazine/archive?issue=${issue.slug}`;
const articleDisplayDate = (article: Article) => article.displayTime ?? new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
}).format(new Date(article.publishedAt ?? article.updatedAt));

const topicRailItems = [
  { label: "Latest News", Icon: Clock3, href: "/latest", featured: true },
  { label: "Live Updates", Icon: Radio, href: "/news" },
  { label: "Top Stories", Icon: Sparkles, href: "/news" },
  { label: "Opinion", Icon: BookOpen, href: "/perspective" },
  { label: "Explainers", Icon: Lightbulb, href: "/search?q=explainer" },
  { label: "India", Icon: Globe2, href: "/search?q=India" },
  { label: "World", Icon: Globe2, href: "/search?q=World" },
  { label: "Business", Icon: BriefcaseBusiness, href: "/business" },
  { label: "Technology", Icon: Building2, href: "/technology" },
  { label: "AI", Icon: Sparkles, href: "/technology" },
  { label: "Markets", Icon: BarChart3, href: "/search?q=Markets" },
] as const;

const featuredAuthorPortraits = [
  "/images/articles/elena-rossi.png",
  "/images/articles/daniel-kim.png",
  "/images/articles/arjun-mehta.png",
  "/images/articles/future-leader.png",
  "/images/articles/global-leadership.png",
] as const;

const marketInsightRows = [
  { index: "S&P 500", value: "5,308.15", change: "+0.62%" },
  { index: "Dow Jones", value: "39,869.38", change: "+0.35%" },
  { index: "Nasdaq", value: "16,609.82", change: "+0.84%" },
  { index: "FTSE 100", value: "8,428.71", change: "+0.11%" },
  { index: "Nikkei 225", value: "38,920.26", change: "-0.21%" },
] as const;

function StoryImage({ image, sizes, contain = false, priority = false }: { image?: ImageAsset; sizes: string; contain?: boolean; priority?: boolean }) {
  return image ? <Image alt={image.alt} className={contain ? "object-contain" : "object-cover"} fill priority={priority} sizes={sizes} src={image.src} /> : <span className="home-image-fallback" />;
}

function SectionHeading({ title, href, action = "View all" }: { title: string; href: string; action?: string }) {
  return <header className="home-section-heading"><h2>{title}</h2><Link href={href}>{action} <ArrowRight aria-hidden="true" /></Link></header>;
}

function StoryMeta({ article, compact = false }: { article: Article; compact?: boolean }) {
  return <p className="home-story-meta">{!compact && <>By {article.authors[0]?.name ?? "The Perspective"} · </>}{article.readingMinutes} min read</p>;
}

function MagazineCover({ featured = false, issue }: { featured?: boolean; issue: HomepageRedesignContent["magazineIssues"][number] }) {
  return <Link aria-label={`Explore ${issue.title}`} className="home-mag-cover" href={magazineHref(issue)}>
    <StoryImage image={issue.coverImage} sizes={featured ? "(max-width: 767px) calc(100vw - 56px), (max-width: 1100px) 280px, 290px" : "(max-width: 480px) 44vw, (max-width: 900px) 22vw, (max-width: 1100px) 16vw, 230px"} />
    <span className="home-mag-shade" />
    <span className="home-mag-brand">The Perspective</span>
    <span className="home-mag-title">{issue.coverHeadline}</span>
    <span className="home-mag-date">{new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(`${issue.publicationDate}T00:00:00+05:30`))}</span>
  </Link>;
}

function BreakingNews({ stories }: { stories: HomepageRedesignContent["breaking"] }) {
  return <aside aria-label="Breaking news" className="home-breaking"><div className="home-wrap home-breaking-inner">
    <strong>Breaking</strong>
    <div>{stories.map((story, index) => <Link href={articleHref(story)} key={story.id}><i aria-hidden="true" />{story.title}{index === stories.length - 1 && <b><Radio aria-hidden="true" /> Live</b>}</Link>)}</div>
  </div></aside>;
}

function TopicRail() {
  return <nav aria-label="Explore news sections" className="home-topic-rail">
    <div className="home-topic-track">
      {topicRailItems.map((item) => <Link className={"featured" in item && item.featured ? "is-featured" : undefined} href={item.href} key={item.label}>
        <span className="home-topic-icon"><item.Icon aria-hidden="true" /></span>
        <span>{item.label}</span>
      </Link>)}
      <Link className="home-topic-more" href="/search"><span>More</span><ChevronRight aria-hidden="true" /></Link>
    </div>
  </nav>;
}

function CategoryNewsPanel({ column }: { column: HomepageRedesignContent["newsCategoryColumns"][number] }) {
  const [lead, ...stories] = column.articles;
  if (!lead) return null;
  return <section className="home-category-panel">
    <SectionHeading href={column.href} title={column.title} />
    <article className="home-category-lead">
      <Link className="home-category-lead-image" href={articleHref(lead)}><StoryImage image={lead.heroImage} sizes="(max-width: 767px) 100vw, (max-width: 1100px) 30vw, 255px" /></Link>
      <h3><Link href={articleHref(lead)}>{lead.title}</Link></h3>
      <p>By {lead.authors[0]?.name ?? "The Perspective"}<span>·</span>{articleDisplayDate(lead)}<span>·</span>{lead.readingMinutes} min read</p>
    </article>
    <div className="home-category-list">{stories.map((story) => <article key={story.id}>
      <Link className="home-category-thumb" href={articleHref(story)}><StoryImage image={story.heroImage} sizes="88px" /></Link>
      <div><h3><Link href={articleHref(story)}>{story.title}</Link></h3><p>{articleDisplayDate(story)}<span>·</span>{story.readingMinutes} min read</p></div>
    </article>)}</div>
  </section>;
}

function NewsDashboard({ content }: { content: HomepageRedesignContent }) {
  const lead = content.dailyFeature;
  if (!lead) return null;
  return <section aria-label="Daily newsroom" className="home-dashboard">
    <div className="home-dashboard-column home-daily">
      <SectionHeading href="/latest" title="Daily news" />
      <article className="home-daily-lead">
        <Link className="home-daily-image" href={articleHref(lead)}><StoryImage image={lead.heroImage} sizes="(max-width: 767px) 100vw, (max-width: 1100px) 62vw, 510px" /><span>{lead.category.name}</span></Link>
        <h3><Link href={articleHref(lead)}>{lead.title}</Link></h3>
        <StoryMeta article={lead} />
        <p className="home-daily-summary">{lead.dek ?? lead.excerpt}</p>
        <Link className="home-daily-read-more" href={articleHref(lead)}>Read full story <ArrowRight aria-hidden="true" /></Link>
      </article>
    </div>
    <div className="home-category-news-grid">{content.newsCategoryColumns.map((column) => <CategoryNewsPanel column={column} key={column.title} />)}</div>
  </section>;
}

function NewsFollowup({ content }: { content: HomepageRedesignContent }) {
  return <>
  <div aria-hidden="true" className="home-newsroom-separator" />

  <section aria-label="Live news, editor selections, blogs and authors" className="home-news-followup">
    <div className="home-followup-column home-live">
      <SectionHeading action="View live" href="/news" title="Live updates" />
      <ol>{content.liveUpdates.map((update) => <li key={update.id}><time>{update.time}</time><Link href={articleHref(update.article)}>{update.article.title}</Link></li>)}</ol>
      <Link className="home-outline-action" href="/news">Go to live center</Link>
    </div>

    <div className="home-followup-column home-picks">
      <SectionHeading href="/perspective" title="Editor's picks" />
      <div>{content.editorsPicks.map((story) => <article key={story.id}><Link className="home-pick-image" href={articleHref(story)}><StoryImage image={story.heroImage} sizes="(max-width: 767px) 120px, (max-width: 1100px) 180px, 190px" /></Link><p><Link href={articleHref(story)}>{story.title}</Link><span>By {story.authors[0]?.name}</span></p></article>)}</div>
      <Link className="home-text-action" href="/perspective">View more picks <ArrowRight aria-hidden="true" /></Link>
    </div>

    <div className="home-followup-column home-followup-blog">
      <SectionHeading action="View all" href="/perspective" title="Editor's blog" />
      <div>{content.editorBlogs.map((story) => <article className="home-horizontal-story" key={story.id}><Link href={articleHref(story)}><StoryImage image={story.heroImage} sizes="90px" /></Link><p><b><Link href={articleHref(story)}>{story.title}</Link></b><span>By {story.authors[0]?.name}</span></p></article>)}</div>
    </div>

    <div className="home-followup-column home-followup-authors">
      <SectionHeading action="View all authors" href="/authors" title="Top authors" />
      <ol className="home-ranked-authors">{content.featuredAuthors.map((author, index) => <li key={author.id}><span className="home-author-rank">{String(index + 1).padStart(2, "0")}</span><Link href={authorHref(author)}><span className="home-author-portrait"><Image alt={`${author.name}, ${author.role ?? "The Perspective contributor"}`} fill sizes="48px" src={featuredAuthorPortraits[index % featuredAuthorPortraits.length] ?? featuredAuthorPortraits[0]} /></span><span className="home-author-copy"><b>{author.name}</b><small>{author.role}</small></span></Link></li>)}</ol>
    </div>
  </section>
  </>;
}

function LatestStoriesShelf({ content }: { content: HomepageRedesignContent }) {
  return <section aria-labelledby="home-latest-stories-title" className="home-latest-stories">
    <div className="home-latest-stories-heading"><h2 id="home-latest-stories-title">Latest stories</h2><Link href="/latest">View all stories <ArrowRight aria-hidden="true" /></Link></div>
    <div className="home-latest-stories-grid">{content.latestStories.map(({ article, label }) => <article key={article.id}>
      <Link className="home-latest-story-image" href={articleHref(article)}><StoryImage image={article.heroImage} sizes="(max-width: 480px) calc(100vw - 40px), (max-width: 767px) 46vw, (max-width: 1100px) 30vw, 220px" /></Link>
      <p className="home-latest-story-label">{label}</p>
      <h3><Link href={articleHref(article)}>{article.title}</Link></h3>
      <p className="home-latest-story-meta"><time dateTime={article.publishedAt ?? article.updatedAt}>{articleDisplayDate(article)}</time><span>•</span>{article.readingMinutes} min read</p>
    </article>)}</div>
  </section>;
}

function MagazineShelf({ content }: { content: HomepageRedesignContent }) {
  const [featuredIssue, ...carouselIssues] = content.magazineIssues;
  return <section className="home-module home-magazine-module"><SectionHeading action="View all issues" href="/magazine/archive" title="The Perspective magazine" /><div className="home-magazine-row">
    {featuredIssue && <article className="home-magazine-feature">
      <MagazineCover featured issue={featuredIssue} />
      <div><p className="home-kicker">Latest issue</p><h3><Link href={magazineHref(featuredIssue)}>{featuredIssue.title}</Link></h3><p>{featuredIssue.description}</p><Link className="home-button home-button-gold" href={magazineHref(featuredIssue)}>Read issue <ArrowRight aria-hidden="true" /></Link></div>
    </article>}
    <HomepageMagazineCarousel trailing={<aside className="home-promo-card home-magazine-promo"><BookOpen aria-hidden="true" /><h3>Subscribe to The Perspective Magazine</h3><p>Provocative stories. Deep insights. Unlimited access.</p><Link className="home-button home-button-gold" href="/magazine/subscribe">Subscribe now</Link><Link href="/magazine">Learn more <ArrowRight aria-hidden="true" /></Link></aside>}>
      {carouselIssues.map((issue) => <MagazineCover issue={issue} key={issue.id} />)}
    </HomepageMagazineCarousel>
  </div></section>;
}

function PersonalMagazineCard({ personality }: { personality: HomepageRedesignContent["personalities"][number] }) {
  return <article className="home-personal-card">
    <Link className="home-personal-image" href={`/search?q=${encodeURIComponent(personality.name)}`}>
      <Image alt={`${personality.name}, ${personality.role}`} fill sizes="(max-width: 480px) 82vw, (max-width: 900px) 44vw, 240px" src={personality.image} />
      <span className="home-personal-card-badge">{personality.badge}</span>
      <span className="home-personal-image-copy"><b>{personality.name}</b><small>{personality.role}</small></span>
    </Link>
  </article>;
}

function PersonalMagazineShelf({ content }: { content: HomepageRedesignContent }) {
  const featured = content.personalMagazines[0];
  return <section className="home-module home-personal-module"><SectionHeading action="View all magazines" href="/personal-magazines" title="Personal magazines" /><div className="home-personal-row">
    {featured && <article className="home-personal-feature">
      <Link className="home-personal-image" href={`/personal-magazines/${featured.magazine.slug}`}>
        <StoryImage contain image={featured.coverImage} sizes="300px" />
        <span className="home-featured-ribbon">Latest profile</span>
        <span className="home-personal-feature-copy"><em>Featured</em><b>{featured.person.name}</b><i>{featured.person.title}{featured.person.company ? `, ${featured.person.company}` : ""}</i></span>
      </Link>
      <div><small>{featured.magazine.introduction}</small><Link className="home-button home-button-gold" href={`/personal-magazines/${featured.magazine.slug}`}>View profile <ArrowRight aria-hidden="true" /></Link></div>
    </article>}
    <HomepagePersonalCarousel trailing={<aside className="home-create-card home-personal-create-card"><h3>Create your Personal Magazine</h3><p>Your journey. Your ideas. Your defining moments.</p><ul><li>Magazine cover</li><li>In-depth interview</li><li>Multimedia stories</li></ul><Link className="home-button home-button-gold" href="/personal-magazines/create">Get featured <ArrowRight aria-hidden="true" /></Link></aside>}>
      {content.personalities.map((personality) => <PersonalMagazineCard key={personality.id} personality={personality} />)}
    </HomepagePersonalCarousel>
  </div></section>;
}

function PodcastCard({ episode }: { episode: HomepageRedesignContent["podcastEpisodes"][number] }) {
  return <article className="home-podcast-card">
    <Link className="home-podcast-art" href={articleHref(episode.article)}>
      <StoryImage image={episode.article.heroImage} sizes="(max-width: 480px) 44vw, (max-width: 900px) 22vw, (max-width: 1100px) 16vw, 230px" />
      <span className="home-podcast-shade" />
      <b><Headphones aria-hidden="true" />{episode.episode}</b>
      <em>{episode.duration}</em>
      <span className="home-podcast-image-copy"><strong>{episode.series}</strong><small>{episode.article.authors[0]?.name}</small></span>
    </Link>
  </article>;
}

function PodcastShelf({ content }: { content: HomepageRedesignContent }) {
  const [featuredEpisode, ...carouselEpisodes] = content.podcastEpisodes;
  return <section className="home-module home-podcast-module"><SectionHeading action="View all shows" href="/podcasts" title="The Perspective podcasts" /><div className="home-podcast-row">
    {featuredEpisode && <article className="home-podcast-feature">
      <Link className="home-podcast-art home-podcast-feature-art" href={articleHref(featuredEpisode.article)}>
        <StoryImage image={featuredEpisode.article.heroImage} sizes="(max-width: 767px) calc(100vw - 56px), (max-width: 900px) 320px, (max-width: 1100px) 390px, 440px" />
        <span className="home-podcast-shade" />
        <b><Headphones aria-hidden="true" />New</b>
        <em>{featuredEpisode.duration}</em>
        <span className="home-podcast-image-copy home-podcast-feature-copy"><small className="home-podcast-overlay-kicker">Featured episode</small><strong>{featuredEpisode.series}</strong><i>{featuredEpisode.article.title}</i><small>With {featuredEpisode.article.authors[0]?.name ?? "The Perspective"}</small></span>
      </Link>
      <div><Link className="home-button home-button-gold" href={articleHref(featuredEpisode.article)}><CirclePlay aria-hidden="true" />Listen now</Link></div>
    </article>}
    <HomepagePodcastCarousel trailing={<aside className="home-promo-card home-podcast-promo"><Headphones aria-hidden="true" /><h3>Join as a podcast guest</h3><p>Share your story with a highly engaged audience.</p><Link className="home-button home-button-gold" href="/search?q=podcast+guest">Apply now <ArrowRight aria-hidden="true" /></Link></aside>}>
      {carouselEpisodes.map((episode) => <PodcastCard episode={episode} key={episode.id} />)}
    </HomepagePodcastCarousel>
  </div></section>;
}

function VideoShelf({ title, stories, href, shorts = false }: { title: string; stories: HomepageRedesignContent["videos"] | HomepageRedesignContent["shorts"]; href: string; shorts?: boolean }) {
  return <section className={shorts ? "home-module home-shorts" : "home-module home-videos"}><SectionHeading action={shorts ? "View all shorts" : "View all videos"} href={href} title={title} /><div className={shorts ? "home-short-grid" : "home-video-grid"}>{stories.map(({ article, duration }) => <article key={article.id}>
    <Link className="home-video-image" href={articleHref(article)}><StoryImage image={article.heroImage} sizes={shorts ? "150px" : "220px"}/><span className="home-play"><CirclePlay aria-hidden="true" /></span><b>{duration}</b></Link>
    <p className="home-video-category">{article.category.name}</p>
    <h3><Link href={articleHref(article)}>{article.title}</Link></h3>
    <p className="home-video-meta"><time dateTime={article.publishedAt ?? article.updatedAt}>{articleDisplayDate(article)}</time><span>•</span>{article.readingMinutes} min read</p>
  </article>)}</div></section>;
}

function DiscoveryGrid({ content }: { content: HomepageRedesignContent }) {
  return <section className="home-discovery">
    <div><SectionHeading action="View all" href="/search?q=report" title="Research & reports" />{content.reports.slice(0, 1).map((report) => <article className="home-report" key={report.id}><p className="home-kicker">{report.eyebrow}</p><h3><Link href={articleHref(report.article)}>{report.title}</Link></h3><p>{report.description}</p><Link href={articleHref(report.article)}>Download report <ArrowRight aria-hidden="true" /></Link></article>)}</div>
    <div><SectionHeading action="View all" href="/search?q=event" title="Upcoming events" />{content.events.slice(0, 1).map((event) => <article className="home-event" key={event.id}><time>{event.date}</time><h3><Link href={event.href}>{event.title}</Link></h3><p>{event.location}</p><Link href={event.href}>Register now <ArrowRight aria-hidden="true" /></Link></article>)}</div>
  </section>;
}

function TrendingBlogs({ content }: { content: HomepageRedesignContent }) {
  return <section className="home-trending-blogs">
    <SectionHeading href="/search?q=trending" title="Trending blogs" />
    <div className="home-trending-list">{content.trending.map((story, index) => <article className="home-ranked-story" key={story.id}><span>{String(index + 1).padStart(2, "0")}</span><p><Link href={articleHref(story)}>{story.title}</Link><small>By {story.authors[0]?.name}</small></p></article>)}</div>
  </section>;
}

function EditorialIntelligenceRow({ content }: { content: HomepageRedesignContent }) {
  const perspectives = [...content.editorBlogs, ...content.executiveInsights].slice(0, 3);
  const issue = content.magazineIssues[0];
  return <section aria-label="Perspectives, magazine and market insights" className="home-intelligence-row">
    <div className="home-perspectives-panel"><SectionHeading href="/perspective" title="Perspectives" />
      <div className="home-perspectives-list">{perspectives.map((story, index) => <article key={story.id}><Link className="home-perspective-avatar" href={articleHref(story)}><Image alt={`${story.authors[0]?.name ?? "The Perspective"} portrait`} fill sizes="52px" src={featuredAuthorPortraits[index % featuredAuthorPortraits.length] ?? featuredAuthorPortraits[0]} /></Link><div><h3><Link href={articleHref(story)}>{story.title}</Link></h3><p>By {story.authors[0]?.name ?? "The Perspective"}</p></div></article>)}</div>
    </div>
    <div className="home-intelligence-magazine"><SectionHeading action="View latest issue" href={issue ? magazineHref(issue) : "/magazine"} title="The Perspective magazine" />
      {issue && <div className="home-intelligence-magazine-body"><MagazineCover issue={issue} /><div><h3>{issue.title}</h3><time dateTime={issue.publicationDate}>{new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(`${issue.publicationDate}T00:00:00+05:30`))}</time><p>{issue.description}</p><Link className="home-market-button" href={magazineHref(issue)}>Read the magazine</Link></div></div>}
    </div>
    <div className="home-market-insights"><SectionHeading action="View markets" href="/search?q=markets" title="Market insights" />
      <nav aria-label="Market insight categories" className="home-market-tabs"><Link className="is-active" href="/search?q=markets">Markets</Link><Link href="/search?q=commodities">Commodities</Link><Link href="/search?q=currencies">Currencies</Link><Link href="/search?q=bonds">Bonds</Link></nav>
      <table><thead><tr><th>Index</th><th>Value</th><th>Change</th></tr></thead><tbody>{marketInsightRows.map((row) => <tr key={row.index}><th scope="row">{row.index}</th><td>{row.value}</td><td className={row.change.startsWith("+") ? "is-positive" : "is-negative"}>{row.change}</td></tr>)}</tbody></table>
    </div>
  </section>;
}

function UtilityModules({ content }: { content: HomepageRedesignContent }) {
  return <section className="home-utility-modules">
    <div><SectionHeading action="View all" href="/leadership" title="Executive insights" />{content.executiveInsights.slice(0, 1).map((story) => <article key={story.id}><h3><Link href={articleHref(story)}>{story.title}</Link></h3><p>{story.excerpt}</p><Link href={articleHref(story)}>Discover <ArrowRight aria-hidden="true" /></Link></article>)}</div>
    <div><SectionHeading action="View all" href="/business" title="Company spotlight" />{content.companySpotlights.slice(0, 1).map((story) => <article key={story.id}><Building2 aria-hidden="true" /><h3><Link href={articleHref(story)}>{story.title}</Link></h3><p>{story.excerpt}</p><Link href={articleHref(story)}>View profile <ArrowRight aria-hidden="true" /></Link></article>)}</div>
  </section>;
}

export function HomepageRedesign({ content }: { content: HomepageRedesignContent }) {
  return <div className="home-v2" data-home-v2>
    <BreakingNews stories={content.breaking} />
    <div className="home-hero-stage">
      <div className="home-wrap"><HomepageHeroCarousel slides={content.heroSlides} /></div>
    </div>
    <section aria-label="Newsroom navigation" className="home-topic-stage">
      <div className="home-wrap"><TopicRail /></div>
    </section>
    <div className="home-wrap home-main">
      <NewsDashboard content={content} />
      <MagazineShelf content={content} />
      <PersonalMagazineShelf content={content} />
      <PodcastShelf content={content} />
      <div className="home-video-short-row"><VideoShelf href="/videos" stories={content.videos} title="Videos"/><VideoShelf href="/videos#shorts-archive" shorts stories={content.shorts} title="Shorts"/></div>
      <NewsFollowup content={content} />
      <LatestStoriesShelf content={content} />
      <TrendingBlogs content={content} />
      <EditorialIntelligenceRow content={content} />
      <div className="home-discovery-utility-row"><DiscoveryGrid content={content} /><UtilityModules content={content} /></div>
    </div>
  </div>;
}
