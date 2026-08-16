import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, Bookmark, Building2, CircleUserRound,
  Cpu, FlaskConical, Globe2, Heart, Lightbulb, MessageCircleMore,
  NotebookPen, Scale, Sparkles, TrendingUp, UsersRound,
} from "lucide-react";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import type { HomepageRedesignContent } from "@/lib/homepage-redesign";
import type { Article, ImageAsset, PerspectiveContent } from "@/types";
import styles from "./blogs-redesign.module.css";

const topicLinks = [
  ["Leadership", UsersRound, "/perspective/leadership"],
  ["Business & Economy", TrendingUp, "/perspective/business"],
  ["Technology & AI", Cpu, "/perspective/technology"],
  ["Markets", Building2, "/perspective/markets"],
  ["Policy & Impact", Scale, "/search?q=policy+opinion"],
  ["Startups", Lightbulb, "/search?q=startups+opinion"],
  ["Culture & Lifestyle", Heart, "/perspective/culture"],
  ["Opinion & Commentary", MessageCircleMore, "/perspective"],
  ["Science & Innovation", FlaskConical, "/search?q=science+innovation"],
  ["Books & Ideas", NotebookPen, "/search?q=books+ideas"],
] as const;

const authorPortraits = [
  "/images/blogs/ananya-mehta-editor-hero.png",
  "/images/articles/daniel-kim.png",
  "/images/articles/future-leader.png",
  "/images/articles/marcus-chen.png",
  "/images/articles/elena-rossi.png",
];

function href(article: Article) { return `/article/${article.slug}`; }
function authorHref(article: Article) { return article.authors[0] ? `/author/${article.authors[0].slug}` : "/search?type=contributors"; }

function Art({ image, alt, sizes, priority = false, position = "center" }: { image?: ImageAsset | string; alt?: string; sizes: string; priority?: boolean; position?: string }) {
  const src = typeof image === "string" ? image : image?.src;
  const imageAlt = alt ?? (typeof image === "string" ? "The Perspective editorial image" : image?.alt ?? "The Perspective editorial image");
  if (!src) return <span className={styles.fallback}><NotebookPen /></span>;
  return <Image alt={imageAlt} fill priority={priority} sizes={sizes} src={src} style={{ objectPosition: position }} />;
}

function SectionHeader({ title, href: destination, action }: { title: string; href: string; action: string }) {
  return <header className={styles.sectionHeader}><h2>{title}</h2><Link href={destination}>{action}<ArrowRight /></Link></header>;
}

function Breaking({ stories }: { stories: HomepageRedesignContent["breaking"] }) {
  return <aside aria-label="Breaking news" className={styles.breaking}><div className={styles.shell}><strong>Breaking</strong><div>{stories.map((story) => <Link href={href(story)} key={story.id}>{story.title}</Link>)}</div><span><i />Live</span></div></aside>;
}

function BlogsHero({ lead }: { lead: PerspectiveContent["lead"]["primary"] }) {
  return <section aria-labelledby="blogs-heading" className={styles.hero}><div className={`${styles.shell} ${styles.heroStage}`}>
    <div className={styles.heroImage}><Art alt="Ananya Mehta, Editor-in-Chief of The Perspective" image="/images/blogs/ananya-mehta-editor-hero.png" priority sizes="(max-width: 800px) 100vw, 1380px" position="center" /><span /></div>
    <div className={styles.heroCopy}><p className={styles.eyebrow}>The Perspective Blogs</p><h1 id="blogs-heading">Ideas That Challenge.<br />Perspectives That Matter.</h1><p>Long-form essays, sharp analysis and bold opinions from the world’s leading thinkers, writers, and change agents.</p>
      <div className={styles.editor}><span><Image alt="Ananya Mehta" fill sizes="52px" src="/images/blogs/ananya-mehta-editor-hero.png" /></span><p><b>By Ananya Mehta</b><small>Editor-in-Chief</small><Link href="/author/ava-morgan">Read Editor’s Note<ArrowRight /></Link></p></div>
    </div>
    <aside className={styles.arguments}><h2>Key arguments</h2><ul><li><Globe2 />The world is changing faster than our institutions.</li><li><Lightbulb />Leadership today demands clarity, courage and empathy.</li><li><Sparkles />Innovation must be inclusive to be sustainable.</li><li><CircleUserRound />The future belongs to those who create value for all.</li></ul><Link href={href(lead)}>Read full essay<ArrowRight /></Link></aside>
    <article className={styles.editorPick}><p>Editor’s pick</p><Link className={styles.pickImage} href={href(lead)}><Art image={lead.heroImage} sizes="100px" /></Link><div><small>{lead.subcategory ?? "Leadership"}</small><h2><Link href={href(lead)}>The New Leadership Contract for a Volatile World</Link></h2><p>Why the next decade will reward leaders who prioritize trust, adaptability and purpose.</p><footer><span>May 10, 2026</span><i />Ananya Mehta<i />12 min read</footer></div><button aria-label="Save editor’s pick" type="button"><Bookmark /></button></article>
  </div></section>;
}

function LatestBlogs({ articles }: { articles: readonly Article[] }) {
  const titles = ["India @ 2030: The $10 Trillion Economy Roadmap", "AI Agents Are the New Apps. Here’s Why.", "Markets in Transition: Risks, Signals & Opportunities", "The Great Geopolitical Realignment Has Begun", "The Habits That Shape Extraordinary Lives"];
  const categories = ["Business & Economy", "Technology & AI", "Markets", "Opinion", "Culture & Lifestyle"];
  return <section className={styles.section}><div className={styles.shell}><SectionHeader action="View all blogs" href="#perspective-archive" title="Latest blogs" /><div className={styles.latestGrid}>{articles.slice(0,5).map((article,index)=><article className={styles.blogCard} key={article.id}><Link className={styles.blogImage} href={href(article)}><Art image={article.heroImage} sizes="(max-width:700px) 92vw, (max-width:1100px) 32vw, 260px" /></Link><div><p>{categories[index]}</p><h3><Link href={href(article)}>{titles[index]}</Link></h3><footer><Link className={styles.tinyAuthor} href={authorHref(article)}><span><Image alt={article.authors[0]?.name ?? "Author"} fill sizes="28px" src={authorPortraits[index] ?? authorPortraits[0]} /></span>{article.authors[0]?.name ?? "The Perspective"}</Link><time>May {9-index}, 2026</time><small>{article.readingMinutes} min read</small><button aria-label={`Save ${titles[index]}`} type="button"><Bookmark /></button></footer></div></article>)}</div></div></section>;
}

function Topics() { return <section className={styles.section}><div className={styles.shell}><SectionHeader action="View all topics" href="/search?q=opinion" title="Explore blogs by topic" /><div className={styles.topics}>{topicLinks.map(([title,Icon,destination])=><Link href={destination} key={title}><Icon /><span>{title}</span></Link>)}</div></div></section>; }

function BlogIntelligence({ content }: { content: PerspectiveContent }) {
  const trending = content.todayArguments.slice(0,5);
  const mostRead = content.mostRead.slice(0,4);
  const featured = content.featuredColumnists.slice(0,4);
  return <section className={styles.section}><div className={`${styles.shell} ${styles.intelligence}`}>
    <section className={styles.trending}><SectionHeader action="View all" href="/search?q=trending" title="Trending now" /><ol>{trending.map((article,index)=><li key={article.id}><b>{String(index+1).padStart(2,"0")}</b><Link className={styles.trendImage} href={href(article)}><Art image={article.heroImage} sizes="54px" /></Link><div><h3><Link href={href(article)}>{article.title}</Link></h3><p>{article.excerpt}</p><small>{article.authors[0]?.name}<i />{article.readingMinutes} min read</small></div></li>)}</ol></section>
    <section className={styles.mostRead}><SectionHeader action="View all" href="#perspective-archive" title="Most read this week" /><article className={styles.mostLead}><Link className={styles.mostImage} href={href(mostRead[0])}><Art image={mostRead[0].heroImage} sizes="240px" /></Link><div><h3><Link href={href(mostRead[0])}>The World in 2047: A New Global Order Taking Shape</Link></h3><p>{mostRead[0].authors[0]?.name}<i />May 5, 2026<i />14 min read</p></div></article><div className={styles.mostList}>{mostRead.slice(1).map((article,index)=><article key={article.id}><Link className={styles.mostThumb} href={href(article)}><Art image={article.heroImage} sizes="64px" /></Link><div><h3><Link href={href(article)}>{["India’s Manufacturing Renaissance", "Digital Rupee: India’s Bet on the Future", "Why Ethics Is the Ultimate Strategy"][index]}</Link></h3><p>{article.authors[0]?.name}<i />{article.readingMinutes} min read</p></div></article>)}</div></section>
    <section className={styles.authors}><SectionHeader action="View all authors" href="/authors" title="Featured authors" /><div>{featured.map((columnist,index)=><Link href={`/author/${columnist.author.slug}`} key={columnist.author.id}><span><Image alt={columnist.author.name} fill sizes="72px" src={authorPortraits[index] ?? authorPortraits[0]} /></span><div><h3>{index===0?"Ananya Mehta":columnist.author.name}</h3><b>{index===0?"Editor-in-Chief":columnist.author.role}</b><p>{columnist.author.biography}</p></div></Link>)}</div></section>
  </div></section>;
}

function ContributorBriefing() { return <section className={styles.section}><div className={`${styles.shell} ${styles.cta}`}><div className={styles.contributor}><NotebookPen /><div><h2>Become a Contributor</h2><p>Share your ideas with a global audience of leaders and decision-makers.</p><Link href="/search?q=become+an+author">Submit your article</Link></div></div><div className={styles.briefing}><div><h2>The Perspective Blog Briefing</h2><p>Get the best essays, opinions and analysis delivered to your inbox every week.</p></div><NewsletterForm buttonLabel="Subscribe" label="Weekly blog briefing" theme="light" /></div></div></section>; }

export function BlogsRedesign({ content, homepage }: { content: PerspectiveContent; homepage: HomepageRedesignContent }) {
  const latest=[content.lead.primary,...content.lead.supporting,content.bigEssay];
  return <div className={styles.page}><Breaking stories={homepage.breaking}/><BlogsHero lead={content.lead.primary}/><LatestBlogs articles={latest}/><Topics/><BlogIntelligence content={content}/><ContributorBriefing/><div className={styles.archiveDivider} id="perspective-archive"><div className={styles.shell}><p className={styles.eyebrow}>The existing publication</p><h2>Continue through the complete Perspective archive</h2><p>Every original essay, columnist, debate and long-form editorial section remains available below.</p></div></div></div>;
}
