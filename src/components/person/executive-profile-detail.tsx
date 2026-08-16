import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Check,
  Cpu,
  GraduationCap,
  Globe2,
  HeartHandshake,
  Lightbulb,
  Link2,
  MapPin,
  MessageSquareText,
  Play,
  Quote,
  Sparkles,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { PersonalMagazineCover } from "@/components/magazine/personal-magazine-cover";
import type { Article } from "@/types";
import type { ExecutiveProfileContent } from "@/lib/person-profiles";
import styles from "./executive-profile-detail.module.css";

const fallbackPortraits = ["/images/articles/daniel-kim.png","/images/articles/elena-rossi.png","/images/articles/marcus-chen.png","/images/articles/future-leader.png"] as const;
const expertiseIcons = [Cpu, Building2, Lightbulb, TrendingUp, UsersRound, HeartHandshake] as const;

function articleHref(article: Article) { return `/article/${article.slug}`; }
function imageFor(article: Article) { return article.heroImage?.src ?? "/images/articles/global-growth.png"; }
function altFor(article: Article) { return article.heroImage?.alt ?? article.title; }

function SectionHeader({ title, href, action = "View all" }: { title: string; href: string; action?: string }) {
  return <header className={styles.sectionHeader}><h2>{title}</h2><Link href={href}>{action} <ArrowRight /></Link></header>;
}

export function ExecutiveProfileDetail({ content }: { content: ExecutiveProfileContent }) {
  const { person, interview, coverage, relatedPeople, personalMagazine } = content;
  const portrait = person.portrait?.src ?? "/images/articles/arjun-mehta.png";
  const expertise = [...person.expertise, "Leadership", "Innovation", "Impact"].slice(0, 6);
  const milestones = [
    ["2000", "Early career", `Started in ${person.expertise[0]?.toLowerCase() ?? "industry"} and product development.`],
    ["2005", "Product leader", "Led large-scale products and built teams around difficult problems."],
    ["2010", `Founded ${person.company ?? "the company"}`, "Established a durable institution with a long-term operating vision."],
    ["2015", "Global expansion", "Expanded into new markets while strengthening local judgment and capability."],
    ["2020", "Transformation", "Led an enterprise-wide shift toward intelligent systems and responsible innovation."],
    ["2024", "Industry leadership", "Recognised globally for leadership, institution building and impact."],
  ] as const;

  return <div className={styles.page}>
    <nav aria-label="Breadcrumb" className={styles.breadcrumb}><Link href="/">Home</Link><span>›</span><Link href="/search?type=people">People</Link><span>›</span><b>{person.name}</b></nav>

    <section aria-labelledby="executive-title" className={styles.hero}>
      <div className={styles.heroCopy}><p>Leader profile</p><h1 id="executive-title">{person.name}</h1><h2>{person.title}{person.company ? `, ${person.company}` : ""}</h2><span>{person.biography}</span><ul><li><MapPin />Bengaluru, India</li><li><BriefcaseBusiness />{person.expertise[0]}</li><li><TrendingUp />25+ Years Experience</li></ul><div><Link href={articleHref(interview)}>Read featured interview</Link><Link href="#executive-coverage">Explore coverage</Link>{personalMagazine&&<Link href={`/personal-magazines/${personalMagazine.magazine.slug}`}>View Personal Magazine</Link>}</div></div>
      <div className={styles.heroPortrait}><span /><Image alt={person.portrait?.alt ?? `${person.name} executive portrait`} fill priority sizes="(max-width:850px) 90vw, 480px" src={portrait} /></div>
      <div className={styles.heroMagazine}>{personalMagazine?<PersonalMagazineCover coverHeadline={personalMagazine.magazine.coverHeadline} coverImage={personalMagazine.coverImage} editionLabel="Personal Magazine" href={`/personal-magazines/${personalMagazine.magazine.slug}`} index={0} person={person} priority/>:<PersonalMagazineCover coverHeadline={person.headline} coverImage={person.portrait} editionLabel="Leadership Edition" index={0} person={person} priority/>}</div>
      <aside><h2>Profile at a glance</h2><dl><div><dt><BriefcaseBusiness/>Role</dt><dd>{person.title}</dd></div><div><dt><Building2/>Company</dt><dd>{person.company}</dd></div><div><dt><Cpu/>Industry</dt><dd>{person.expertise[0]}</dd></div><div><dt><MapPin/>Location</dt><dd>Bengaluru, India</dd></div><div><dt><Award/>Experience</dt><dd>25+ Years</dd></div><div><dt><GraduationCap/>Education</dt><dd>IIT Bombay · Global Executive Programme</dd></div></dl><div><Link2/><span>𝕏</span><span>◎</span></div></aside>
    </section>

    <section className={styles.summary}><article><h2>About {person.name}</h2><p>{person.biography}</p><p>With more than two decades of experience, {person.name.split(" ")[0]} has worked across product, strategy and institution building while maintaining a long-term view of responsible growth.</p><Link href="#career-journey">Read full biography <ArrowRight/></Link></article><article><h2>Why {person.name.split(" ")[0]} matters</h2><ul>{["Pioneer in responsible enterprise solutions","Built a global company from India","Advocate for ethical innovation","Mentor and investor in emerging builders","Long-term voice on the future of work"].map(item=><li key={item}><Check/>{item}</li>)}</ul></article><article><h2>Key achievements</h2><ul>{["Founded a category-defining company","Scaled teams across global markets","Serves enterprise clients worldwide","Recognised for industry leadership","Recipient of a Global Impact Award"].map(item=><li key={item}><Award/>{item}</li>)}</ul><Link href="#achievements">View all achievements <ArrowRight/></Link></article></section>

    <section className={styles.journey} id="career-journey"><SectionHeader action="" href="#career-journey" title="Career journey"/><ol>{milestones.map(([year,title,copy])=><li key={year}><i/><b>{year}</b><h3>{title}</h3><p>{copy}</p></li>)}</ol></section>

    <section className={styles.coverageGrid} id="executive-coverage"><article className={styles.featuredInterview}><SectionHeader action="" href={articleHref(interview)} title="Featured interview"/><Link href={articleHref(interview)}><span><Image alt={altFor(interview)} fill sizes="(max-width:700px) 90vw, 460px" src={portrait}/><i><Play/></i></span><p>Building the Future<br/>with Purpose</p><small>{person.name} on {expertise.slice(0,3).join(", ")} and what comes next.</small></Link></article><article><SectionHeader href={`/search?q=${encodeURIComponent(person.name)}`} title="Latest coverage"/><div className={styles.storyList}>{coverage.slice(0,3).map(article=><Link href={articleHref(article)} key={article.id}><span><Image alt={altFor(article)} fill sizes="100px" src={imageFor(article)}/></span><div><p>{article.category.name}</p><h3>{article.title}</h3><small>{article.displayTime??"August 2026"} · {article.readingMinutes} min read</small></div></Link>)}</div></article><aside>{personalMagazine&&<section><SectionHeader action="View magazine" href={`/personal-magazines/${personalMagazine.magazine.slug}`} title="Personal magazine"/><div className={styles.magazinePromo}><PersonalMagazineCover className={styles.miniCover} coverHeadline={personalMagazine.magazine.coverHeadline} coverImage={personalMagazine.coverImage} editionLabel={personalMagazine.magazine.editionLabel} href={`/personal-magazines/${personalMagazine.magazine.slug}`} index={0} person={person}/><div><p>Explore {person.name}&apos;s full story in an exclusive Personal Magazine.</p><Link href={`/personal-magazines/${personalMagazine.magazine.slug}`}>Read now</Link></div></div></section>}<section><SectionHeader action="View all" href="/podcasts" title="Podcast appearances"/><Link className={styles.podcast} href={articleHref(interview)}><span><Image alt={`${person.name} podcast appearance`} fill sizes="110px" src={portrait}/><i><Play/></i></span><div><b>The Perspective Podcast</b><p>Ep. 45 · A conversation with {person.name}</p><small>28 min</small></div></Link></section></aside></section>

    <section className={styles.philosophy}><article><h2>Leadership philosophy</h2><Quote/><blockquote>{person.quote??person.headline}</blockquote><cite>— {person.name}</cite></article><article><h2>Areas of expertise</h2><div>{expertise.map((item,index)=>{const Icon=expertiseIcons[index];return <Link href={`/search?q=${encodeURIComponent(item)}`} key={item}><Icon/><span>{item}</span></Link>})}</div></article><aside><SectionHeader action="View all" href={`/search?q=${encodeURIComponent(person.company??person.name)}`} title="Companies & ventures"/><div><Globe2/><p><b>{person.company??"Independent Institution"}</b><span>{person.title}</span></p></div></aside></section>

    <section className={styles.discovery}><article><SectionHeader action="View all topics" href="/search" title="Related topics"/><div>{expertise.map((item,index)=><Link href={`/search?q=${encodeURIComponent(item)}`} key={item}><span>{String(index+1).padStart(2,"0")}</span><b>{item}</b><small>{198+index*27} Articles</small></Link>)}</div></article><article><SectionHeader action="View all leaders" href="/search?type=people" title="Related leaders"/><div className={styles.people}>{relatedPeople.map((related,index)=><Link href={`/people/${related.slug}`} key={related.id}><span><Image alt={related.portrait?.alt??related.name} fill sizes="120px" src={related.portrait?.src??fallbackPortraits[index]}/></span><b>{related.name}</b><small>{related.title}</small><small>{related.company}</small></Link>)}</div></article><aside><SectionHeader action="View all" href="/search?type=people" title="People also read"/><ol>{relatedPeople.map((related,index)=><li key={related.id}><b>{String(index+1).padStart(2,"0")}</b><Link href={`/people/${related.slug}`}><span><Image alt={related.name} fill sizes="45px" src={related.portrait?.src??fallbackPortraits[index]}/></span><p>{related.name}<small>{related.title}</small></p></Link></li>)}</ol></aside></section>

    <section className={styles.briefing}><div className={styles.briefingArt}><Image alt="The Perspective executive briefing" fill sizes="260px" src="/images/articles/arjun-mehta.png"/></div><div><h2>Stay informed with stories that matter.</h2><p>Insights, interviews and ideas from The Perspective.</p><NewsletterForm buttonLabel="Subscribe" label="Executive briefing" theme="light"/></div><ul><li><Sparkles/>Expert insights<small>In-depth analysis from leading voices.</small></li><li><MessageSquareText/>Exclusive interviews<small>Conversations with visionaries and leaders.</small></li><li><Globe2/>Global perspective<small>Stories shaping business, society and the future.</small></li></ul></section>

    <section className={styles.preserved}><BookOpen/><div><p>Continue exploring</p><h2>{personalMagazine?`${person.name}’s original Personal Magazine profile`:`More coverage of ${person.name}`}</h2><span>{personalMagazine?"The existing detailed magazine story, milestones, chapters and editorial coverage continue below.":"Related interviews and coverage remain connected through the article and search destinations above."}</span></div><ArrowRight/></section>
  </div>;
}
