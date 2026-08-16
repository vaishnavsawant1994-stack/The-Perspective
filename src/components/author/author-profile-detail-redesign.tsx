import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Bookmark,
  BriefcaseBusiness,
  Globe2,
  Mail,
  MessageSquareText,
  Play,
  Quote,
  Scale,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { MagazineCover } from "@/components/magazine/magazine-cover";
import { magazineIssues } from "@/data/mock/magazines";
import type { Article, AuthorProfileData } from "@/types";
import styles from "./author-profile-detail-redesign.module.css";

const portraitMap: Record<string, string> = {
  "maya-patel": "/images/authors/ananya-mehta-featured.png",
  "daniel-brooks": "/images/articles/marcus-chen.png",
  "sophia-laurent": "/images/articles/elena-rossi.png",
  "oliver-grant": "/images/articles/daniel-kim.png",
  "amara-okafor": "/images/articles/future-leader.png",
  "julian-hart": "/images/articles/marcus-chen.png",
  "ava-morgan": "/images/authors/ananya-mehta-featured.png",
  "amara-sen": "/images/articles/elena-rossi.png",
  "julian-cross": "/images/articles/marcus-chen.png",
  "noor-rahman": "/images/articles/daniel-kim.png",
  "lena-park": "/images/articles/future-leader.png",
  "david-owusu": "/images/articles/arjun-mehta.png",
};

const topicIcons = [UsersRound, Globe2, BriefcaseBusiness, Scale, BookOpen, Sparkles] as const;

function articleHref(article: Article) { return `/article/${article.slug}`; }
function imageFor(article: Article) { return article.heroImage?.src ?? "/images/articles/global-leadership.png"; }
function altFor(article: Article) { return article.heroImage?.alt ?? article.title; }
function articleMeta(article: Article) { return `${article.displayTime ?? "August 2026"} · ${article.readingMinutes} min read`; }

function SectionHeader({ title, href, action = "View all" }: { title: string; href: string; action?: string }) {
  return <header className={styles.sectionHeader}><h2>{title}</h2><Link href={href}>{action} <ArrowRight aria-hidden="true" /></Link></header>;
}

function LatestCard({ article }: { article: Article }) {
  return <article className={styles.latestCard}>
    <Link className={styles.cardImage} href={articleHref(article)}><Image alt={altFor(article)} fill sizes="(max-width:700px) 90vw, 260px" src={imageFor(article)} /></Link>
    <p>{article.subcategory ?? article.category.name}</p>
    <h3><Link href={articleHref(article)}>{article.title}</Link></h3>
    <small>{articleMeta(article)}</small>
  </article>;
}

export function AuthorProfileDetailRedesign({ profile }: { profile: AuthorProfileData }) {
  const { author } = profile;
  const portrait = author.avatar?.src ?? portraitMap[author.slug] ?? "/images/authors/ananya-mehta-featured.png";
  const expertise = author.expertise?.length ? author.expertise : profile.topics.map((topic) => topic.name);
  const latest = profile.latestArticles.slice(0, 4);
  const archive = profile.articles.slice(0, 6);
  const quote = author.slug === "maya-patel"
    ? "Good leadership is not about being in charge. It is about taking care of the future."
    : `The most useful ideas help readers see ${expertise[0]?.toLowerCase() ?? "the world"} with greater clarity and consequence.`;
  const years = Math.max(12, Math.min(28, profile.articles.length + 11));
  const readers = (1.4 + profile.articles.length * .08).toFixed(1);

  return <div className={styles.page}>
    <nav aria-label="Breadcrumb" className={styles.breadcrumb}><Link href="/">Home</Link><span>›</span><Link href="/authors">Authors</Link><span>›</span><b>{author.name}</b></nav>

    <section aria-labelledby="author-detail-title" className={styles.hero}>
      <div className={styles.heroCopy}>
        <p>Author</p>
        <h1 id="author-detail-title">{author.name}</h1>
        <h2>{author.role ?? "Contributor"}</h2>
        <div>{expertise.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div>
        <p>{author.biography} Their work brings readers rigorous context, clear arguments and an independent view of the decisions shaping institutions and society.</p>
        <footer><Link href={articleHref(profile.featuredArticle)}>Read latest essay</Link><Link href="#author-article-archive">Explore all articles</Link><a aria-label={`Email ${author.name}`} href={`mailto:editorial@theperspective.media?subject=${encodeURIComponent(`Message for ${author.name}`)}`}><Mail aria-hidden="true" /></a></footer>
      </div>
      <div className={styles.heroPortrait}><span /><Image alt={`Portrait of ${author.name}`} fill priority sizes="(max-width:800px) 90vw, 550px" src={portrait} /></div>
      <blockquote><Quote aria-hidden="true" /><p>{quote}</p><cite>— {author.name}</cite></blockquote>
    </section>

    <section aria-label={`${author.name} by the numbers`} className={styles.stats}>
      {[
        { Icon: BriefcaseBusiness, value: profile.articles.length * 12, label: "Articles Published" },
        { Icon: Bookmark, value: `${years}+`, label: "Years in Journalism" },
        { Icon: Award, value: 24, label: "Countries Covered" },
        { Icon: BookOpen, value: 5, label: "Books & Anthologies" },
        { Icon: UsersRound, value: `${readers}M+`, label: "Readers" },
        { Icon: Sparkles, value: 8, label: "Awards & Honors" },
      ].map(({ Icon, value, label }) => <div key={label}><Icon aria-hidden="true" /><p><b>{value}</b><span>{label}</span></p></div>)}
    </section>

    <nav aria-label={`${author.name} profile sections`} className={styles.localNav}>{["Overview","Articles","Essays","Interviews","Topics","Appearances","About"].map((item,index)=><Link href={index===0?"#featured-author-essay":`#author-${item.toLowerCase()}`} key={item}>{item}</Link>)}</nav>

    <div className={styles.mainGrid}>
      <main>
        <section id="featured-author-essay">
          <SectionHeader action="Read essay" href={articleHref(profile.featuredArticle)} title="Featured essay" />
          <article className={styles.featuredEssay}><Link className={styles.featureImage} href={articleHref(profile.featuredArticle)}><Image alt={altFor(profile.featuredArticle)} fill sizes="(max-width:800px) 90vw, 600px" src={imageFor(profile.featuredArticle)} /></Link><div><p>{profile.featuredArticle.articleType === "opinion" ? "Essay" : profile.featuredArticle.category.name}</p><h2><Link href={articleHref(profile.featuredArticle)}>{profile.featuredArticle.title}</Link></h2><span>{profile.featuredArticle.dek ?? profile.featuredArticle.excerpt}</span><footer><small>{articleMeta(profile.featuredArticle)}</small><Link href={articleHref(profile.featuredArticle)}>Read essay <ArrowRight /></Link></footer></div></article>
        </section>

        <section id="author-articles">
          <SectionHeader action="View all articles" href="#author-article-archive" title="Latest articles" />
          <div className={styles.latestGrid}>{latest.map((article) => <LatestCard article={article} key={article.id} />)}</div>
        </section>

        <section id="author-essays">
          <SectionHeader href={`/search?q=${encodeURIComponent(author.name)}`} title="Essential reading" />
          <div className={styles.essentialGrid}>{profile.essentialArticles.slice(0,3).map((article) => <LatestCard article={article} key={article.id} />)}</div>
        </section>

        <section id="author-article-archive">
          <SectionHeader action="All topics · Newest first" href={`/search?q=${encodeURIComponent(author.name)}`} title={`All articles by ${author.name}`} />
          <div className={styles.archive}>{archive.map((article) => <article key={article.id}><Link className={styles.archiveImage} href={articleHref(article)}><Image alt={altFor(article)} fill sizes="160px" src={imageFor(article)} /></Link><div><p>{article.subcategory ?? article.category.name}</p><h3><Link href={articleHref(article)}>{article.title}</Link></h3><span>{article.excerpt}</span><small>{articleMeta(article)}</small></div></article>)}</div>
          <Link className={styles.moreLink} href={`/search?q=${encodeURIComponent(author.name)}`}>View more articles <ArrowRight /></Link>
        </section>
      </main>

      <aside className={styles.sidebar}>
        <section id="author-about"><h2>About {author.name.split(" ")[0]}</h2><p>{author.biography}</p><p>Their insights help leaders, institutions and readers navigate complexity with clarity and responsibility.</p><Link href="#author-about">View full bio <ArrowRight /></Link></section>

        <section className={styles.newsletter}><h2>Stay updated</h2><p>Get new essays, articles and insights from {author.name} in your inbox.</p><NewsletterForm buttonLabel="Subscribe" label="Author updates" theme="light" /><small>No spam. Unsubscribe anytime.</small></section>

        <section><h2>By the numbers</h2><dl><div><dt>{profile.articles.length * 12}</dt><dd>Articles & Essays</dd></div><div><dt>{readers}M+</dt><dd>Total Readers</dd></div><div><dt>150K+</dt><dd>Newsletter Subscribers</dd></div><div><dt>{years}+</dt><dd>Years in Journalism</dd></div><div><dt>24</dt><dd>Countries Covered</dd></div></dl></section>

        <section><SectionHeader action="View all" href={`/search?q=${encodeURIComponent(author.name)}`} title={`Most read by ${author.name.split(" ")[0]}`} /><ol className={styles.mostRead}>{profile.mostReadArticles.map((article,index)=><li key={article.id}><b>{String(index+1).padStart(2,"0")}</b><Link href={articleHref(article)}><span><Image alt={altFor(article)} fill sizes="62px" src={imageFor(article)} /></span><p>{article.title}<small>{articleMeta(article)}</small></p></Link></li>)}</ol></section>

        <section id="author-topics"><h2>Topics {author.name.split(" ")[0]} writes about</h2><div className={styles.topics}>{[...profile.topics,...profile.topics].slice(0,6).map((topic,index)=>{const Icon=topicIcons[index];return <Link href={`/search?q=${encodeURIComponent(topic.name)}`} key={`${topic.slug}-${index}`}><Icon/><b>{topic.name}</b><span>{28+index*7} Articles</span></Link>})}</div><Link className={styles.sidebarLink} href={`/search?q=${encodeURIComponent(author.name)}`}>Explore all topics <ArrowRight /></Link></section>

        <section id="author-interviews"><h2>In conversation</h2><Link className={styles.conversation} href={articleHref(profile.featuredArticle)}><span><Image alt={`${author.name} in conversation`} fill sizes="300px" src={portrait} /><i><Play /></i></span><b>Interview: {author.name} on {expertise[0] ?? "ideas that matter"}</b><small>Watch video · 32 min</small></Link></section>
      </aside>
    </div>

    <section className={styles.magazineCta}><div className={styles.magazineArt}><MagazineCover href="/magazine/read/august-2026" issue={magazineIssues[0]} variant="compact" /><span><Image alt="The Perspective magazine editorial spread" fill sizes="220px" src="/images/articles/global-leadership.png" /></span></div><div><h2>Stories that inform. Insights that inspire.</h2><p>Dive deeper with The Perspective Magazine.</p><Link href="/magazine">Explore magazine</Link></div><ul><li><MessageSquareText />Deep Analysis<small>In-depth reporting on the issues shaping our world.</small></li><li><Globe2 />Global Perspective<small>Balanced, independent and globally minded editorial.</small></li><li><Award />Thought Leadership<small>Voices and ideas from leaders and change makers.</small></li></ul></section>

    <section className={styles.preserved}><BookOpen aria-hidden="true" /><div><p>Continue exploring</p><h2>The original {author.name} contributor experience</h2><span>The existing profile biography, latest work, expertise, archive and editorial briefing continue below.</span></div><ArrowRight aria-hidden="true" /></section>
  </div>;
}
