import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, Bookmark, BriefcaseBusiness, Building2, Cpu, FlaskConical,
  Globe2, Heart, Lightbulb, MessageCircleMore, Scale, Sparkles,
  Sprout, TrendingUp, UsersRound,
} from "lucide-react";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import type { HomepageRedesignContent } from "@/lib/homepage-redesign";
import type { Article, AuthorProfileData, ImageAsset } from "@/types";
import styles from "./authors-page.module.css";

const portraits = [
  "/images/authors/ananya-mehta-featured.png",
  "/images/podcasts/naveen-malhotra-hero-final.png",
  "/images/articles/marcus-chen.png",
  "/images/articles/elena-rossi.png",
  "/images/articles/future-leader.png",
  "/images/articles/daniel-kim.png",
  "/images/articles/arjun-mehta.png",
  "/images/personal-magazines/sophia-reynolds-cover-v2.png",
] as const;

const expertise = [
  ["All Authors", UsersRound, "/authors"],
  ["Leadership", UsersRound, "/search?q=leadership&type=contributors"],
  ["Business & Economy", TrendingUp, "/search?q=economy&type=contributors"],
  ["Technology & AI", Cpu, "/search?q=technology&type=contributors"],
  ["Markets & Investing", Building2, "/search?q=markets&type=contributors"],
  ["Policy & Governance", Scale, "/search?q=policy&type=contributors"],
  ["Opinion & Commentary", MessageCircleMore, "/search?q=opinion&type=contributors"],
  ["Culture & Lifestyle", Heart, "/search?q=culture&type=contributors"],
  ["Science & Innovation", FlaskConical, "/search?q=innovation&type=contributors"],
  ["Sustainability", Sprout, "/search?q=sustainability&type=contributors"],
] as const;

function articleHref(article: Article) { return `/article/${article.slug}`; }

function Art({ image, alt, sizes, priority = false, position = "center" }: { image?: ImageAsset | string; alt?: string; sizes: string; priority?: boolean; position?: string }) {
  const src = typeof image === "string" ? image : image?.src;
  const imageAlt = alt ?? (typeof image === "string" ? "The Perspective contributor" : image?.alt ?? "The Perspective contributor");
  if (!src) return <span className={styles.fallback}><UsersRound /></span>;
  return <Image alt={imageAlt} fill priority={priority} sizes={sizes} src={src} style={{ objectPosition: position }} />;
}

function SectionHeader({ title, href, action }: { title: string; href: string; action: string }) {
  return <header className={styles.sectionHeader}><h2>{title}</h2><Link href={href}>{action}<ArrowRight /></Link></header>;
}

function Breaking({ stories }: { stories: HomepageRedesignContent["breaking"] }) {
  return <aside aria-label="Breaking news" className={styles.breaking}><div className={styles.shell}><strong>Breaking</strong><div>{stories.map((story)=><Link href={articleHref(story)} key={story.id}>{story.title}</Link>)}</div><span><i/>Live</span></div></aside>;
}

function AuthorsHero({ featured }: { featured: AuthorProfileData }) {
  const essentials = [featured.featuredArticle,...featured.essentialArticles].slice(0,3);
  return <section aria-labelledby="authors-heading" className={styles.hero}><div className={`${styles.shell} ${styles.heroGrid}`}>
    <div className={styles.heroCopy}><p className={styles.eyebrow}>The Perspective Authors</p><h1 id="authors-heading">The Voices<br/>Behind the Ideas</h1><p>Our authors are thinkers, doers and change makers who bring you ideas that challenge, insights that matter and perspectives that shape what comes next.</p><div><Link className={styles.primary} href="#author-directory">Explore authors</Link><Link className={styles.secondary} href="/search?q=become+an+author">Become a contributor</Link></div></div>
    <div className={styles.heroPortrait}><Art alt="Ava Morgan, featured contributor at The Perspective" image="/images/authors/ananya-mehta-featured.png" priority sizes="(max-width:800px) 88vw, (max-width:1200px) 45vw, 500px" position="center 15%"/></div>
    <div className={styles.featuredIdentity}><p>Featured contributor</p><h2>Ava Morgan</h2><span>Editor-in-Chief</span><div className={styles.tags}><b>Leadership</b><b>Global Affairs</b><b>Future of Work</b></div><blockquote>“Thoughtful journalism begins with asking better questions.”</blockquote><footer><Link className={styles.primary} href={`/author/${featured.author.slug}`}>View author profile</Link><Link href={articleHref(featured.featuredArticle)}>Read latest essay<ArrowRight/></Link></footer></div>
    <aside className={styles.authorAside}><h2>Writes about</h2><ul><li><UsersRound/>Leadership &amp; Strategy</li><li><Globe2/>Global Affairs</li><li><Lightbulb/>Future of Work</li><li><BriefcaseBusiness/>Policy &amp; Governance</li></ul><div><h3>Essential reading</h3>{essentials.map((article,index)=><Link href={articleHref(article)} key={article.id}><span><Art image={article.heroImage} sizes="54px"/></span><b>{["The New Leadership Contract for a Volatile World","India @ 2030: The $10 Trillion Economy","The Future of Work Is Human"][index]}</b></Link>)}</div></aside>
  </div></section>;
}

function SeniorVoices({ profiles }: { profiles: readonly AuthorProfileData[] }) {
  const senior=profiles.slice(0,5);
  return <section className={styles.section}><div className={styles.shell}><SectionHeader action="View all senior voices" href="#author-directory" title="Editor-in-chief & senior voices"/><div className={styles.seniorGrid}>{senior.map((profile,index)=><article className={styles.authorCard} key={profile.author.id}><Link className={styles.authorImage} href={`/author/${profile.author.slug}`}><Art alt={profile.author.name} image={portraits[index]} sizes="(max-width:700px) 45vw, (max-width:1100px) 28vw, 240px" position="center 15%"/></Link><div><h3><Link href={`/author/${profile.author.slug}`}>{index===0?"Ava Morgan":profile.author.name}</Link></h3><p>{index===0?"Editor-in-Chief":profile.author.role}</p><small>{(profile.author.expertise?.slice(0,3) ?? ["Leadership","Ideas"]).join(" · ")}</small><footer><b>{128-index*11} Articles</b><button aria-label={`Save ${profile.author.name}`} type="button"><Bookmark/></button></footer></div></article>)}</div></div></section>;
}

function Expertise() { return <section className={styles.section}><div className={styles.shell}><SectionHeader action="View all expertise" href="/search?type=contributors" title="Browse authors by expertise"/><div className={styles.expertise}>{expertise.map(([name,Icon,destination],index)=><Link className={index===0?styles.activeExpertise:undefined} href={destination} key={name}><Icon/><span>{name}</span></Link>)}</div></div></section>; }

function FeaturedAuthors({ profiles }: { profiles: readonly AuthorProfileData[] }) {
  const featured=profiles.slice(5,11);
  return <section className={styles.section}><div className={styles.shell}><SectionHeader action="View all authors" href="#author-directory" title="Featured authors"/><div className={styles.featuredGrid}>{featured.map((profile,index)=><article className={styles.featuredCard} key={profile.author.id}><Link className={styles.featuredImage} href={`/author/${profile.author.slug}`}><Art alt={profile.author.name} image={portraits[(index+2)%portraits.length]} sizes="(max-width:700px) 45vw, (max-width:1100px) 28vw, 200px" position="center 15%"/></Link><div><h3><Link href={`/author/${profile.author.slug}`}>{profile.author.name}</Link></h3><p>{profile.author.role}</p><small>{(profile.author.expertise?.slice(0,2) ?? [profile.topics[0]?.name,"Ideas"]).filter(Boolean).join(" · ")}</small><b>{54+index*4} Articles</b></div></article>)}</div></div></section>;
}

function AuthorIntelligence({ profiles }: { profiles: readonly AuthorProfileData[] }) {
  const popular=profiles.slice(0,5); const latest=profiles.slice(0,4); const spotlight=profiles[2] ?? profiles[0];
  return <section className={styles.section}><div className={`${styles.shell} ${styles.intelligence}`}>
    <section className={styles.rankings}><SectionHeader action="View all" href="#author-directory" title="Most read authors"/><ol>{popular.map((profile,index)=><li key={profile.author.id}><b>{String(index+1).padStart(2,"0")}</b><Link className={styles.rankPortrait} href={`/author/${profile.author.slug}`}><Art alt={profile.author.name} image={portraits[index]} sizes="44px" position="center 15%"/></Link><div><Link href={`/author/${profile.author.slug}`}>{profile.author.name}</Link><small>{128-index*12} Articles <i/> {4.2-index*.35}M Reads</small></div></li>)}</ol></section>
    <section className={styles.latest}><SectionHeader action="View all articles" href="/perspective" title="Latest from our authors"/><div>{latest.map((profile,index)=><article key={profile.author.id}><Link className={styles.latestImage} href={articleHref(profile.featuredArticle)}><Art image={profile.featuredArticle.heroImage} sizes="82px"/></Link><div><h3><Link href={articleHref(profile.featuredArticle)}>{profile.featuredArticle.title}</Link></h3><p>{profile.author.name}<i/>May {10-index}, 2026<i/>{profile.featuredArticle.readingMinutes} min read</p></div></article>)}</div></section>
    <aside className={styles.spotlight}><p>Author spotlight</p><div><span>In conversation with</span><h2>{spotlight.author.name}</h2><blockquote>On ideas, institutions and the future of responsible leadership.</blockquote><Link href={`/author/${spotlight.author.slug}`}>Read the interview<ArrowRight/></Link></div><span className={styles.spotlightPortrait}><Art alt={spotlight.author.name} image={portraits[2]} sizes="260px" position="center 15%"/></span></aside>
  </div></section>;
}

function ContributorBriefing() { return <section className={styles.section}><div className={`${styles.shell} ${styles.cta}`}><div className={styles.contribute}><Sparkles/><div><h2>Share Your Perspective. Inspire Millions.</h2><p>Join our community of writers and thought leaders. Contribute ideas that inform, influence and inspire.</p><Link href="/search?q=become+an+author">Become a contributor</Link></div></div><div className={styles.briefing}><div><h2>The Perspective Author Briefing</h2><p>Get the best essays, columns and author insights delivered to your inbox every week.</p></div><NewsletterForm buttonLabel="Subscribe" label="Weekly author briefing" theme="light"/></div></div></section>; }

export function AuthorsPage({ homepage, profiles }: { homepage: HomepageRedesignContent; profiles: readonly AuthorProfileData[] }) {
  if(!profiles.length) return null;
  return <div className={styles.page}><Breaking stories={homepage.breaking}/><AuthorsHero featured={profiles[0]}/><SeniorVoices profiles={profiles}/><Expertise/><FeaturedAuthors profiles={profiles}/><AuthorIntelligence profiles={profiles}/><ContributorBriefing/><div className={styles.archiveDivider} id="author-directory"><div className={styles.shell}><p className={styles.eyebrow}>The existing contributor experience</p><h2>Search the complete contributor archive</h2><p>The original author discovery and search experience continues below, with every current contributor profile preserved.</p></div></div></div>;
}
