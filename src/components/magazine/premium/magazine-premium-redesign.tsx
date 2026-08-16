import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Crown,
  FileText,
  Lightbulb,
  LockKeyhole,
  Mail,
  MonitorSmartphone,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { MagazineCover } from "@/components/magazine/magazine-cover";
import { magazineIssues } from "@/data/mock/magazines";
import { formatMagazineIssueDate } from "@/lib/magazine-issue-date";
import { getMagazineReaderHref } from "@/lib/magazine-categories";
import type { MagazineIssue, MagazinePremiumPageContent, MagazinePremiumStory } from "@/types";
import styles from "./magazine-premium-redesign.module.css";

const benefitIcons = [BookOpen, Users, FileText, LockKeyhole, MonitorSmartphone, Star];

function issueHref(issue: MagazineIssue) {
  return getMagazineReaderHref(issue) ?? `/magazine/archive?issue=${issue.slug}`;
}

function CatalogueIssue({ issue }: { issue: MagazineIssue }) {
  return (
    <article className={styles.catalogueIssue}>
      <MagazineCover href={issueHref(issue)} issue={issue} variant="compact" />
      <p>{formatMagazineIssueDate(issue.publicationDate)} · {issue.premium ? "Premium edition" : "Curated collection"}</p>
      <h3>{issue.title}</h3><em>{issue.coverKicker}</em>
      <span>{issue.pageCount} pages · {Math.max(9, issue.featuredArticleIds.length + 6)} feature stories</span>
      <div>{issue.readerAvailable ? <b><BookOpen aria-hidden="true" /> Digital Reader</b> : <b className={styles.archiveStatus}>Archive access</b>}{issue.premium ? <b className={styles.premiumStatus}><Crown aria-hidden="true" /> Premium</b> : null}</div>
      <Link href={issueHref(issue)}>Explore issue</Link>
    </article>
  );
}

function PremiumStoryCard({ story }: { story: MagazinePremiumStory }) {
  const { article } = story;
  return <Link className={styles.storyCard} href={`/article/${article.slug}`}><span>{article.heroImage ? <Image alt={article.heroImage.alt} fill sizes="(max-width: 760px) 100vw, 20vw" src={article.heroImage.src} /> : null}</span><small>{story.sectionLabel}</small><h3>{article.title}</h3><p>{formatMagazineIssueDate(story.issue.publicationDate)} · {article.readingMinutes} min read</p></Link>;
}

export function MagazinePremiumRedesign({ content }: { content: MagazinePremiumPageContent }) {
  const hero = content.heroIssue;
  const heroStory = content.heroStories[0]?.article;
  const catalogue = [...content.premiumIssues, ...magazineIssues.filter((issue) => !issue.premium && issue.status === "published")].slice(0, 5);
  const archive = magazineIssues.filter((issue) => issue.status === "published" && !catalogue.some((item) => item.id === issue.id)).slice(0, 6);
  const categories = [
    ["Leadership", "/magazine/category/leadership", Users, "Issues and stories on leadership and strategy."],
    ["Business", "/magazine/category/business", BriefcaseBusiness, "Markets, companies and the economy."],
    ["Technology & AI", "/magazine/category/technology", Sparkles, "Innovation, AI and the future of technology."],
    ["The Perspective", "/magazine/category/perspective", Lightbulb, "Opinion, essays and long-form ideas."],
    ["Special Editions", "/magazine/category/special-editions", Crown, "Curated themes and collector issues."],
  ] as const;

  return (
    <div className={styles.page}>
      <div aria-label="Breaking news" className={styles.breakingBar}><strong>Breaking</strong><Link href="/article/markets-optimism">Markets assess a changing rate outlook</Link><i aria-hidden="true" /><Link href="/article/industrial-investment-strategy">Industrial investment moves back to the center of strategy</Link><i aria-hidden="true" /><Link href="/article/global-computing-capacity">Computing capacity becomes a global priority</Link><span><b aria-hidden="true" /> Live</span></div>

      <section aria-labelledby="premium-redesign-heading" className={styles.hero}>
        <div className={styles.heroCopy}><p>The Perspective Premium</p><h1 id="premium-redesign-heading">Deeper Stories.<br />Defining Ideas.<br /><em>Premium Editions.</em></h1><span>Premium long-form interviews, special reports and exclusive editorial packages featuring the leaders, companies and ideas shaping the future.</span><div><Link href="#premium-catalogue">Explore Premium editions</Link><Link href="/magazine/archive?type=premium">View all Premium issues</Link></div></div>
        <div className={styles.heroArt}><div className={styles.heroCover}><MagazineCover issue={hero} priority variant="large" /></div><div className={styles.openMagazine}><div><small>The Perspective</small><h2>Building for the<br />Next Generation</h2><p>Insight, purpose and the decisions that build enduring institutions.</p></div><div>{heroStory?.heroImage ? <Image alt={heroStory.heroImage.alt} fill priority sizes="210px" src={heroStory.heroImage.src} /> : null}</div></div></div>
        <aside className={styles.insidePremium}><h2>Inside Premium</h2>{["Long-form interviews","Special editions & themed issues","Deep analysis & investigations","Exclusive editorial packages","Premium archive access","Digital Reader when available"].map((item,index)=>{const Icon=benefitIcons[index];return <p key={item}><Icon aria-hidden="true" />{item}</p>})}</aside>
      </section>

      <section aria-labelledby="premium-includes-heading" className={styles.benefits}><h2 id="premium-includes-heading">What Premium includes</h2><div>{[...content.benefits,{id:"access",title:"Early access",description:"Be the first to read new Premium releases."}].slice(0,6).map((benefit,index)=>{const Icon=benefitIcons[index];return <article key={benefit.id}><Icon aria-hidden="true" /><div><h3>{benefit.title}</h3><p>{benefit.description}</p></div></article>})}</div></section>

      <section aria-labelledby="premium-catalogue-heading" className={styles.catalogue} id="premium-catalogue"><header><h2 id="premium-catalogue-heading">Premium issue catalogue</h2><Link href="/magazine/archive?type=premium">View all Premium issues <ArrowRight aria-hidden="true" /></Link></header><div>{catalogue.map((issue)=><CatalogueIssue issue={issue} key={issue.id}/>)}</div></section>

      <section aria-labelledby="premium-stories-heading" className={styles.stories}><header><h2 id="premium-stories-heading">Featured Premium stories</h2><Link href="#premium-current-content">View all stories <ArrowRight aria-hidden="true" /></Link></header><div>{content.featuredStories.slice(0,5).map((story)=><PremiumStoryCard key={story.article.id} story={story}/>)}</div></section>

      <section aria-labelledby="premium-archive-heading" className={styles.archive}><header><h2 id="premium-archive-heading">From the Premium archive</h2><Link href="/magazine/archive?type=premium">View archive <ArrowRight aria-hidden="true" /></Link></header><div>{archive.map((issue)=><article key={issue.id}><MagazineCover href={issueHref(issue)} issue={issue} variant="compact"/><div><p>{issue.premium ? "Premium edition" : issue.theme}</p><h3>{issue.title}</h3><span>{formatMagazineIssueDate(issue.publicationDate)} · {issue.pageCount} pages</span><Link href={issueHref(issue)}>Read issue</Link></div></article>)}</div></section>

      <section className={styles.membership}><article><h2>Standard vs Premium editorial</h2><div><section><p>Standard editions</p>{["Timely news & analysis","Short and medium-form stories","Industry updates & insights","Available to all readers"].map(item=><span key={item}>✓ {item}</span>)}</section><section><p>Premium editions</p>{content.comparison.premium.concat(["Curated editorial packages"]).map(item=><span key={item}>✓ {item}</span>)}</section></div></article><article className={styles.whyPremium}><h2>Why go Premium?</h2><p>Go beyond the headlines. Premium gives you unparalleled access to the stories, leaders and ideas that define our world.</p><div><b>96+</b><span>Premium issues</span><b>210+</b><span>Long-form interviews</span><b>12M+</b><span>Readers worldwide</span></div></article><aside><h2>Unlock Premium access</h2><ul><li>Unlimited Premium articles & issues</li><li>Exclusive interviews & reports</li><li>Premium archive & digital reader</li><li>Special editions & early access</li><li>Cancel anytime</li></ul><Link href="/magazine/subscribe">View subscription plans</Link></aside></section>

      <section className={styles.subscribeStrip}><div className={styles.miniCovers}>{content.premiumIssues.map(issue=><MagazineCover issue={issue} key={issue.id} variant="compact"/>)}</div><div><h2>Stay ahead with The Perspective Premium</h2><p>Subscribe today and start reading our most exclusive content.</p></div><NewsletterForm buttonLabel="Subscribe now" label="Premium newsletter" theme="light" /></section>

      <section aria-labelledby="premium-category-heading" className={styles.categories}><header><h2 id="premium-category-heading">Explore other magazine categories</h2><Link href="/magazine">View all categories <ArrowRight aria-hidden="true" /></Link></header><div>{categories.map(([label,href,Icon,description])=><Link href={href} key={label}><Icon aria-hidden="true"/><div><h3>{label}</h3><p>{description}</p><span>Explore <ArrowRight aria-hidden="true"/></span></div></Link>)}</div></section>

      <section className={styles.briefing}><div><Mail aria-hidden="true"/><h2>Perspective Briefing</h2><p>Get Premium stories, interview highlights and exclusive insights delivered weekly.</p></div><NewsletterForm buttonLabel="Subscribe" label="Perspective Premium briefing" theme="light"/><ul><li>Exclusive previews</li><li>Premium stories</li><li>Leader interviews</li><li>Special reports</li></ul></section>

      <section aria-labelledby="original-premium-heading" className={styles.originalIntro}><p>Complete Premium collection</p><h2 id="original-premium-heading">Original Premium magazine experience</h2><span>The existing Premium catalogue and editorial modules continue below.</span></section>
      <div id="premium-current-content" />
    </div>
  );
}
