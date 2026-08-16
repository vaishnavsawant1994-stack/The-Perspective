import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Clock3,
  Crown,
  FileText,
  Globe2,
  LibraryBig,
  Lightbulb,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { MagazineCover } from "@/components/magazine/magazine-cover";
import { formatMagazineIssueDate } from "@/lib/magazine-issue-date";
import { getMagazineCategoryHref, getMagazineReaderHref } from "@/lib/magazine-categories";
import type { MagazineCategoryContent, MagazineCategoryStory, MagazineIssue } from "@/types";
import styles from "./magazine-category-redesign.module.css";

const categoryIcons = [Users, BookOpen, FileText, Lightbulb, ShieldCheck, Globe2, Sparkles, BriefcaseBusiness];

function issueHref(issue: MagazineIssue) {
  return getMagazineReaderHref(issue) ?? `/magazine/archive?issue=${issue.slug}`;
}

function StoryRow({ story }: { story: MagazineCategoryStory }) {
  const { article } = story;
  return (
    <Link className={styles.featureStory} href={`/article/${article.slug}`}>
      <span>{article.heroImage ? <Image alt={article.heroImage.alt} fill sizes="88px" src={article.heroImage.src} /> : null}</span>
      <div><small>{story.sectionLabel}</small><h3>{article.title}</h3><p>{article.authors[0]?.name ?? "The Perspective"} · {article.readingMinutes} min read</p></div>
    </Link>
  );
}

function CollectionIssue({ issue }: { issue: MagazineIssue }) {
  return (
    <article className={styles.collectionIssue}>
      <MagazineCover href={issueHref(issue)} issue={issue} variant="compact" />
      <p>{formatMagazineIssueDate(issue.publicationDate)} · Issue {String(issue.issueNumber).padStart(2, "0")}</p>
      <h3>{issue.title}</h3>
      <span>{issue.pageCount} pages · {Math.max(8, issue.featuredArticleIds.length + 6)} stories</span>
      <div>{issue.readerAvailable ? <b><BookOpen aria-hidden="true" /> Digital Reader</b> : <b>Archive edition</b>}{issue.premium ? <b className={styles.premium}><Crown aria-hidden="true" /> Premium</b> : null}</div>
      <Link href={issueHref(issue)}>Read issue</Link>
    </article>
  );
}

export function MagazineCategoryRedesign({ content }: { content: MagazineCategoryContent }) {
  const { category, featuredIssue } = content;
  const featuredCover = featuredIssue.coverImage;
  const archiveHref = `/magazine/archive?q=${encodeURIComponent(category.archiveQuery)}`;
  const categoryNav = [
    `All ${category.name}`,
    "Latest Issue",
    "Cover Stories",
    "Interviews",
    `${category.name} Essays`,
    "Strategy & Decision Making",
    "Culture & People",
    "Innovation & Transformation",
  ];
  const voices = content.archiveStories.flatMap((story) => story.article.authors).filter((author, index, authors) => authors.findIndex((candidate) => candidate.id === author.id) === index).slice(0, 3);

  return (
    <div className={styles.page}>
      <div aria-label="Breaking news" className={styles.breakingBar}>
        <strong>Breaking</strong>
        <Link href="/article/markets-optimism">Markets assess a changing rate outlook</Link><i aria-hidden="true" />
        <Link href="/article/industrial-investment-strategy">Industrial investment moves back to the center of strategy</Link><i aria-hidden="true" />
        <Link href="/article/global-computing-capacity">Computing capacity becomes a global priority</Link>
        <span><b aria-hidden="true" /> Live</span>
      </div>

      <div className={styles.crumbs}><Link href="/">Home</Link><span>/</span><Link href="/magazine">Magazine</Link><span>/</span><Link href="/magazine/archive">Magazine Categories</Link><span>/</span><b>{category.name}</b></div>

      <section aria-labelledby="category-redesign-heading" className={styles.hero}>
        <div className={styles.heroCopy}>
          <p>Magazine Category</p>
          <h1 id="category-redesign-heading">{category.name}</h1>
          <span>{category.description}</span>
          <div><Link href={issueHref(featuredIssue)}>Read latest {category.name} issue</Link><Link href="#category-archive-stories">Explore {category.name} stories</Link></div>
        </div>
        <div aria-label={`${category.name} magazine feature`} className={styles.heroArt}>
          <div className={styles.heroCover}><MagazineCover issue={featuredIssue} priority variant="large" /></div>
          <div className={styles.openMagazine}>
            <div><small>The Perspective</small><h2>{category.name}<br />in an Age of<br />Uncertainty</h2><p>Deep reporting, clear thinking and the people defining what comes next.</p></div>
            <div>{content.featuredIssueStories[0]?.article.heroImage ? <Image alt={content.featuredIssueStories[0].article.heroImage.alt} fill priority sizes="210px" src={content.featuredIssueStories[0].article.heroImage.src} /> : featuredCover ? <Image alt={featuredCover.alt} fill priority sizes="210px" src={featuredCover.src} /> : null}</div>
          </div>
        </div>
        <aside className={styles.heroStats}>
          <article><LibraryBig aria-hidden="true" /><b>{Math.max(28, content.matchingIssues.length)}</b><span>{category.name} issues</span></article>
          <article><FileText aria-hidden="true" /><b>{Math.max(210, content.storyCount)}+</b><span>{category.name} stories</span></article>
          <article><Users aria-hidden="true" /><b>120+</b><span>Executive interviews</span></article>
          <article><Clock3 aria-hidden="true" /><b>18+</b><span>Years of publishing</span></article>
        </aside>
      </section>

      <nav aria-label={`${category.name} magazine sections`} className={styles.categoryNav}>{categoryNav.map((item, index) => { const Icon = categoryIcons[index]; return <Link aria-current={index === 0 ? "page" : undefined} href={index === 0 ? getMagazineCategoryHref(category) : `${archiveHref}&section=${encodeURIComponent(item)}`} key={item}><Icon aria-hidden="true" />{item}</Link>; })}</nav>

      <section aria-labelledby="featured-category-issue" className={styles.featured}>
        <MagazineCover href={issueHref(featuredIssue)} issue={featuredIssue} priority variant="standard" />
        <div className={styles.featuredCopy}>
          <p>Featured {category.name} issue</p><span>{formatMagazineIssueDate(featuredIssue.publicationDate)} · Issue {String(featuredIssue.issueNumber).padStart(2, "0")}</span>
          <h2 id="featured-category-issue">{featuredIssue.title}</h2><em>{featuredIssue.coverKicker}</em><p>{featuredIssue.description}</p>
          <div className={styles.issueMeta}><span><FileText aria-hidden="true" /> {featuredIssue.pageCount} pages</span><span><BookOpen aria-hidden="true" /> {Math.max(11, featuredIssue.featuredArticleIds.length + 6)} featured stories</span></div>
          <div className={styles.featureActions}><Link href={issueHref(featuredIssue)}>Read digital issue</Link><Link href={`/article/${featuredIssue.coverStoryArticleId.replace("article-", "")}`}>View contents</Link></div>
        </div>
        <div className={styles.featureStories}><h2>Featured articles from this issue</h2>{content.featuredIssueStories.slice(0, 4).map((story) => <StoryRow key={story.article.id} story={story} />)}</div>
        <aside className={styles.inCategory}><h2>In this category</h2>{categoryNav.slice(0, 7).map((item) => <Link href={`${archiveHref}&section=${encodeURIComponent(item)}`} key={item}>{item}</Link>)}<Link className={styles.allStories} href={archiveHref}>View all {category.name} stories <ArrowRight aria-hidden="true" /></Link></aside>
      </section>

      <section aria-labelledby="category-collection-heading" className={styles.collection}>
        <header><div><h2 id="category-collection-heading">{category.name} issue collection</h2><p>Explore every {category.name} edition from The Perspective.</p></div><Link href={archiveHref}>View all {category.name} issues <ArrowRight aria-hidden="true" /></Link></header>
        <div>{content.matchingIssues.slice(0, 6).map((issue) => <CollectionIssue issue={issue} key={issue.id} />)}</div>
      </section>

      <section aria-labelledby="category-archive-stories-heading" className={styles.archiveStories} id="category-archive-stories">
        <header><div><h2 id="category-archive-stories-heading">{category.name} stories from the archive</h2><p>Timeless interviews and long-form features from past issues.</p></div><Link href={archiveHref}>View all archive stories <ArrowRight aria-hidden="true" /></Link></header>
        <div>{content.archiveStories.slice(0, 5).map(({ article, issue, sectionLabel }) => <Link href={`/article/${article.slug}`} key={article.id}><span>{article.heroImage ? <Image alt={article.heroImage.alt} fill sizes="(max-width: 760px) 100vw, 20vw" src={article.heroImage.src} /> : null}</span><small>{sectionLabel}</small><h3>{article.title}</h3><p>Issue {String(issue.issueNumber).padStart(2, "0")} · {formatMagazineIssueDate(issue.publicationDate)} · {article.readingMinutes} min read</p></Link>)}</div>
      </section>

      <section className={styles.discoveryGrid}>
        <article className={styles.premiumEditions}><h2>Premium {category.name} editions</h2><p>Collector&apos;s editions with exclusive interviews, rare covers and extended features.</p><Link href="/magazine/premium">View Premium editions <ArrowRight aria-hidden="true" /></Link><div>{content.premiumIssues.slice(0, 2).map((issue) => <MagazineCover href="/magazine/premium" issue={issue} key={issue.id} variant="compact" />)}</div></article>
        <article className={styles.voices}><h2>Featured {category.name} voices</h2><p>Insights from the leaders and thinkers who shape our world.</p>{voices.map((voice) => <Link href={`/author/${voice.slug}`} key={voice.id}><span>{voice.avatar ? <Image alt={voice.avatar.alt} fill sizes="54px" src={voice.avatar.src} /> : null}</span><div><b>{voice.name}</b><small>{voice.role ?? "Contributor"}</small></div></Link>)}<Link className={styles.textAction} href="/authors">View all {category.name} voices <ArrowRight aria-hidden="true" /></Link></article>
        <article className={styles.related}><h2>Related magazine categories</h2>{content.relatedCategories.slice(0, 4).map((related, index) => { const storyImage = content.archiveStories[index]?.article.heroImage; return <Link href={getMagazineCategoryHref(related)} key={related.id}><span>{storyImage ? <Image alt="" fill sizes="48px" src={storyImage.src} /> : null}</span><div><b>{related.name}</b><small>{related.shortDescription}</small></div></Link>; })}<Link className={styles.textAction} href="/magazine">Explore all categories <ArrowRight aria-hidden="true" /></Link></article>
        <aside className={styles.connect}><article><h2>Stay connected</h2><p>Get the best {category.name.toLowerCase()} stories and magazine updates delivered to your inbox.</p><NewsletterForm buttonLabel="Subscribe" label={`${category.name} newsletter`} theme="light" /></article><article><h2>Unlock full access</h2><ul><li>All digital magazine issues</li><li>Exclusive interviews</li><li>Premium collector editions</li><li>Insights and reports</li></ul><Link href="/magazine/subscribe">Subscribe now</Link></article></aside>
      </section>

      <section className={styles.finalCtas}>
        <article><Mail aria-hidden="true" /><div><h2>Never miss a {category.name} story</h2><p>Subscribe to The Perspective Magazine and get instant access to every edition.</p><Link href="/magazine/subscribe">View subscription plans</Link></div></article>
        <article><LibraryBig aria-hidden="true" /><div><h2>For institutions & libraries</h2><p>Provide your teams and students access to authoritative insights and archives.</p><Link href="/search?q=institutional+access">Learn about institutional access</Link></div></article>
      </section>

      <section aria-labelledby="original-category-heading" className={styles.originalIntro}><p>Complete category record</p><h2 id="original-category-heading">Original {category.name} category experience</h2><span>The current category content and discovery modules continue below.</span></section>
    </div>
  );
}
