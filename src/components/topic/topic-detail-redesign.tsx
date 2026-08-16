import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  FileText,
  FlaskConical,
  Globe2,
  HeartHandshake,
  Mail,
  Play,
  Scale,
  Share2,
  Sparkles,
  Star,
} from "lucide-react";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { MagazineCover } from "@/components/magazine/magazine-cover";
import { magazineIssues } from "@/data/mock/magazines";
import type { Article, TopicLandingContent } from "@/types";
import styles from "./topic-detail-redesign.module.css";

const portraits = [
  "/images/authors/ananya-mehta-featured.png",
  "/images/articles/marcus-chen.png",
  "/images/articles/daniel-kim.png",
  "/images/articles/elena-rossi.png",
] as const;

const focusIcons = [BriefcaseBusiness, Bot, Scale, HeartHandshake, FlaskConical, Sparkles] as const;

const focusNames: Record<string, readonly string[]> = {
  "artificial-intelligence": ["AI in Business", "AI Technology", "AI Ethics & Policy", "AI & Society", "AI Research", "AI Startups"],
  productivity: ["Work Design", "Automation", "Management", "Skills", "Investment", "Institutions"],
  "global-markets": ["Public Markets", "Private Capital", "Currencies", "Commodities", "Policy", "Investment Ideas"],
  founders: ["Company Building", "Capital", "Product Strategy", "Leadership", "Governance", "Founder Stories"],
  cybersecurity: ["Enterprise Risk", "Identity", "AI Security", "Infrastructure", "Governance", "Resilience"],
  "data-centers": ["Compute", "Energy", "Cloud", "Infrastructure", "Policy", "Investment"],
  "industrial-strategy": ["Manufacturing", "Semiconductors", "Infrastructure", "Capital", "Policy", "Supply Chains"],
  "global-affairs": ["Trade", "Regional Power", "Capital Flows", "Institutions", "Policy", "Global Business"],
  startups: ["Funding", "AI-Native", "Founders", "Scale", "Product", "Emerging Markets"],
  "future-of-work": ["Automation", "Management", "Skills", "Culture", "Careers", "Organization Design"],
};

const events = [
  ["20", "MAY", "Ideas for Good Global Summit", "Geneva, Switzerland", "May 20–22, 2026"],
  ["12", "JUN", "The Perspective Leadership Roundtable", "Mumbai, India", "June 12, 2026"],
  ["05", "JUL", "Global Policy Forum 2026", "Washington, D.C., USA", "July 5–6, 2026"],
] as const;

function articleHref(article: Article) { return `/article/${article.slug}`; }
function articleImage(article: Article, fallback = "/images/articles/ai-infrastructure.png") { return article.heroImage?.src ?? fallback; }
function articleAlt(article: Article) { return article.heroImage?.alt ?? article.title; }
function meta(article: Article) { return `${article.displayTime ?? "August 2026"} · ${article.readingMinutes} min read`; }

function SectionHeader({ title, href = "#", action = "View all" }: { title: string; href?: string; action?: string }) {
  return <header className={styles.sectionHeader}><h2>{title}</h2><Link href={href}>{action} <ArrowRight aria-hidden="true" /></Link></header>;
}

function SmallStory({ article }: { article: Article }) {
  return <article className={styles.smallStory}>
    <Link className={styles.smallImage} href={articleHref(article)}><Image alt={articleAlt(article)} fill sizes="120px" src={articleImage(article)} /></Link>
    <div><p>{article.subcategory ?? article.category.name}</p><h3><Link href={articleHref(article)}>{article.title}</Link></h3><span>{article.displayTime ?? "August 2026"}</span></div>
  </article>;
}

function StandardCard({ article }: { article: Article }) {
  return <article className={styles.standardCard}>
    <Link className={styles.cardImage} href={articleHref(article)}><Image alt={articleAlt(article)} fill sizes="(max-width:700px) 90vw, 300px" src={articleImage(article)} /></Link>
    <p>{article.articleType === "opinion" ? "Opinion" : article.subcategory ?? article.category.name}</p>
    <h3><Link href={articleHref(article)}>{article.title}</Link></h3>
    <span>{article.excerpt}</span>
    <small>{meta(article)}</small>
  </article>;
}

export function TopicDetailRedesign({ content }: { content: TopicLandingContent }) {
  const { topic } = content;
  const focus = focusNames[topic.slug] ?? ["Business", "Technology", "Policy", "People", "Research", "Ideas"];
  const featuredSide = [...content.topStories, ...content.latest].slice(0, 4);
  const deepDive = [...content.analysis, ...content.essential].slice(0, 4);
  const interviews = [...content.contributors.map((item) => item.latestArticle), ...content.essential].slice(0, 3);
  const reports = magazineIssues.slice(0, 4);
  const heroImage = articleImage(content.leadArticle);

  return <div className={styles.page}>
    <nav aria-label="Breadcrumb" className={styles.breadcrumb}><Link href="/">Home</Link><span>›</span><Link href="/search">Topics</Link><span>›</span><b>{topic.name}</b></nav>

    <section aria-labelledby="topic-redesign-title" className={styles.hero}>
      <div className={styles.heroCopy}>
        <p><Star aria-hidden="true" /> {topic.eyebrow}</p>
        <h1 id="topic-redesign-title">{topic.name}</h1>
        <span>{topic.description}</span>
        <dl><div><dt>{Math.max(1248, content.coverageCount * 37).toLocaleString()}</dt><dd>Articles</dd></div><div><dt>{content.contributors.length * 96 + 38}</dt><dd>Interviews</dd></div><div><dt>{content.contributors.length * 24 + 12}</dt><dd>Expert Voices</dd></div><div><dt>{reports.length * 4 + 2}</dt><dd>Special Reports</dd></div></dl>
        <div><Link href="#topic-briefing"><Bell aria-hidden="true" /> Follow this topic</Link><Link href={`/search?q=${encodeURIComponent(topic.name)}`}><Share2 aria-hidden="true" /> Share topic</Link></div>
      </div>
      <div className={styles.heroImage}><Image alt={articleAlt(content.leadArticle)} fill priority sizes="(max-width:900px) 100vw, 60vw" src={heroImage} /><span /></div>
    </section>

    <nav aria-label={`${topic.name} page sections`} className={styles.localNav}>{["Overview", "Latest", "Interviews", "Opinions", "Deep Dives", "Reports", "Videos", "Podcasts", "Experts", "Events"].map((item, index) => <Link href={index === 0 ? "#featured-topic-stories" : `#${item.toLowerCase().replace(" ", "-")}`} key={item}>{item}</Link>)}</nav>

    <div className={styles.mainGrid}>
      <main>
        <section id="featured-topic-stories">
          <SectionHeader action="View all articles" href={`/search?q=${encodeURIComponent(topic.name)}`} title="Featured stories" />
          <div className={styles.featuredGrid}>
            <article className={styles.leadStory}><Link href={articleHref(content.leadArticle)}><span className={styles.leadImage}><Image alt={articleAlt(content.leadArticle)} fill sizes="(max-width:900px) 90vw, 580px" src={heroImage} /><b>Featured</b></span><p>{content.leadArticle.subcategory ?? content.leadArticle.category.name}</p><h2>{content.leadArticle.title}</h2><span>{content.leadArticle.excerpt}</span><small>By {content.leadArticle.authors[0]?.name ?? "The Perspective"} · {meta(content.leadArticle)}</small></Link></article>
            <div>{featuredSide.map((article) => <SmallStory article={article} key={article.id} />)}</div>
          </div>
        </section>

        <section id="deep-dives">
          <SectionHeader action="View all" href={`/search?q=${encodeURIComponent(`${topic.name} analysis`)}`} title="Deep dive & analysis" />
          <div className={styles.cardGrid}>{deepDive.map((article) => <StandardCard article={article} key={article.id} />)}</div>
        </section>

        <section id="interviews">
          <SectionHeader action="View all interviews" href={`/search?q=${encodeURIComponent(`${topic.name} interview`)}`} title="Interviews" />
          <div className={styles.interviewGrid}>{interviews.map((article, index) => <article key={article.id}><Link href={articleHref(article)}><span><Image alt={articleAlt(article)} fill sizes="(max-width:700px) 90vw, 380px" src={index < portraits.length ? portraits[index] : articleImage(article)} /><i><Play aria-hidden="true" /></i><b>{article.articleType === "interview" ? "Interview" : "Conversation"}</b></span><h3>{article.title}</h3><small>{article.displayTime ?? "August 2026"} · {article.readingMinutes + 18} min</small></Link></article>)}</div>
        </section>

        <section id="latest">
          <SectionHeader action="View all" href={`/search?q=${encodeURIComponent(topic.name)}`} title="Explore by focus area" />
          <div className={styles.focusGrid}>{focus.map((name, index) => { const Icon = focusIcons[index]; return <Link href={`/search?q=${encodeURIComponent(`${topic.name} ${name}`)}`} key={name}><Icon aria-hidden="true" /><b>{name}</b><span>{68 + (index * 31)} Articles</span></Link>; })}</div>
        </section>

        <section id="reports">
          <SectionHeader action="View all reports" href="/magazine/archive" title="Featured reports & specials" />
          <div className={styles.reportGrid}>{reports.map((issue) => <article key={issue.id}><MagazineCover className={styles.reportCover} href={`/magazine/read/${issue.slug}`} issue={issue} variant="compact" /><p>{issue.premium ? "Special edition" : "Research report"}</p><h3><Link href={`/magazine/read/${issue.slug}`}>{issue.title}</Link></h3><span>{issue.description}</span></article>)}</div>
        </section>
      </main>

      <aside className={styles.sidebar}>
        <section className={styles.about}><h2>About this topic</h2><p>{topic.whatMatters}</p><ul>{focus.map((name, index) => { const Icon = focusIcons[index]; return <li key={name}><Icon aria-hidden="true" />{name}</li>; })}</ul><Link href="#topic-briefing"><Mail aria-hidden="true" /> Follow topic updates</Link></section>

        <section><SectionHeader action="View all experts" href="/authors" title="Top experts" /><div className={styles.experts}>{content.contributors.map((contributor, index) => <Link href={`/author/${contributor.author.slug}`} key={contributor.author.id}><span><Image alt={contributor.author.name} fill sizes="54px" src={portraits[index % portraits.length]} /></span><p><b>{contributor.author.name}</b><small>{contributor.author.role}</small><small>{contributor.author.expertise?.[0] ?? topic.name}</small></p></Link>)}</div></section>

        <section className={styles.briefing} id="topic-briefing"><h2>Stay ahead in {topic.name}</h2><p>Get the latest stories, research and insights delivered to your inbox.</p><NewsletterForm buttonLabel="Subscribe" label="Topic briefing" theme="light" /><small>No spam. Unsubscribe anytime.</small></section>

        <section><SectionHeader action="View all trending" href={`/search?q=${encodeURIComponent(topic.name)}`} title="Trending articles" /><ol className={styles.trending}>{content.mostRead.map((article, index) => <li key={article.id}><b>{String(index + 1).padStart(2, "0")}</b><Link href={articleHref(article)}><span><Image alt={articleAlt(article)} fill sizes="64px" src={articleImage(article)} /></span><p>{article.title}<small>{article.displayTime ?? "August 2026"}</small></p></Link></li>)}</ol></section>

        <section id="events"><SectionHeader action="View all events" href="/events" title="Upcoming events" /><div className={styles.events}>{events.map(([day, month, name, place, date]) => <article key={name}><time><b>{day}</b>{month}</time><div><h3><Link href="/events">{name}</Link></h3><p>{place}</p><span>{date}</span></div></article>)}</div></section>
      </aside>
    </div>

    <section className={styles.personalCta}>
      <div className={styles.ctaArt}><div><Image alt="The Perspective Personal Magazine sample" fill sizes="180px" src="/images/articles/arjun-mehta.png" /></div><span><Image alt="Personal Magazine editorial spread" fill sizes="230px" src="/images/articles/global-growth.png" /></span></div>
      <div><p>Your story. Your ideas. Your legacy.</p><h2>Create a personal magazine that builds your authority, shares your journey and leaves a lasting impact.</h2><div><Link href="/personal-magazines/create">Create your magazine</Link><Link href="/personal-magazines">Learn more</Link></div></div>
      <ul><li><Globe2 />Global editorial team</li><li><BookOpen />Premium production</li><li><Sparkles />Maximum impact</li></ul>
    </section>

    <section className={styles.preserved}><FileText aria-hidden="true" /><div><p>Continue reading</p><h2>The original {topic.name} topic experience</h2><span>The existing detailed coverage, latest reporting, perspectives and related topic modules continue below.</span></div><ArrowRight aria-hidden="true" /></section>
  </div>;
}
