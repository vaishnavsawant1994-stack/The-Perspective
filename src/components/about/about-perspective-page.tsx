import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  CirclePlay,
  FileText,
  Globe2,
  Handshake,
  Headphones,
  Lightbulb,
  Mail,
  Newspaper,
  PenLine,
  Podcast,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import styles from "./about-perspective-page.module.css";

const coverage = [
  { title: "Business", description: "Companies, markets and strategies shaping global economies.", image: "/images/articles/global-growth.png", href: "/business" },
  { title: "Leadership", description: "Conversations with leaders redefining institutions and industries.", image: "/images/articles/board-governance.png", href: "/leadership" },
  { title: "Technology", description: "The systems, startups and innovations transforming our future.", image: "/images/articles/ai-infrastructure.png", href: "/technology" },
  { title: "Markets", description: "Financial markets, trends and insights that shape capital.", image: "/images/articles/computing-infrastructure.png", href: "/search?q=markets" },
  { title: "Culture", description: "Arts, books, lifestyle and the ideas shaping contemporary culture.", image: "/images/articles/global-leadership.png", href: "/search?q=culture" },
  { title: "Opinion", description: "Thought-provoking arguments from experts, writers and changemakers.", image: "/images/articles/elena-rossi.png", href: "/perspective" },
] as const;

const ecosystem = [
  { icon: BookOpen, title: "Magazine", copy: "In-depth print and digital editions that reward the long view.", href: "/magazine" },
  { icon: Newspaper, title: "Personal Magazines", copy: "Premium stories created with leaders and institutions.", href: "/personal-magazines" },
  { icon: Podcast, title: "Podcasts", copy: "Conversations with the people shaping what comes next.", href: "/podcasts" },
  { icon: CirclePlay, title: "Videos", copy: "Long-form interviews, explainers and documentary insight.", href: "/videos" },
  { icon: UsersRound, title: "Events & Summits", copy: "Global gatherings built around consequential exchange.", href: "/events" },
  { icon: FileText, title: "News & Blogs", copy: "Timely reporting and independent analysis across topics.", href: "/latest" },
] as const;

const milestones = [
  { year: "2017", title: "The first edition", copy: "The Perspective began with a commitment to useful, independent long-form journalism.", image: "/images/home/editorial-skyline.png" },
  { year: "2019", title: "A global newsroom", copy: "Our reporting network expanded across markets, companies and public institutions.", image: "/images/articles/global-growth.png" },
  { year: "2021", title: "Ideas in every format", copy: "Podcasts and film brought our interviews and analysis to new audiences.", image: "/images/podcasts/naveen-malhotra-hero-final.png" },
  { year: "2023", title: "Personal Magazines", copy: "A new editorial service began preserving the defining stories of leaders and builders.", image: "/images/personal-magazines/arjun-mehta-hero-v3.webp" },
  { year: "2026", title: "One Perspective", copy: "Today, news, magazines, podcasts, video and events operate as one connected publication.", image: "/images/events/leadership-summit-hero.png" },
] as const;

const leaders = [
  { name: "Ananya Mehta", role: "Editor-in-Chief", copy: "Leads our editorial vision and standards across every platform.", image: "/images/authors/ananya-mehta-featured.png", href: "/author/ava-morgan" },
  { name: "Julian Cross", role: "Business Editor", copy: "Reports on companies, capital and the choices behind durable growth.", image: "/images/home/arjun-mehta-cutout.png", href: "/author/julian-cross" },
  { name: "Noor Rahman", role: "Technology Editor", copy: "Explores infrastructure, innovation and responsible technological change.", image: "/images/articles/daniel-kim.png", href: "/author/noor-rahman" },
  { name: "Ava Morgan", role: "Editor at Large", copy: "Writes about leadership, institutions and the future of work.", image: "/images/home/elena-rossi-cutout.png", href: "/author/ava-morgan" },
  { name: "David Owusu", role: "Markets Correspondent", copy: "Connects market movements with their deeper economic consequences.", image: "/images/articles/marcus-chen.png", href: "/author/david-owusu" },
] as const;

function SectionHeading({ eyebrow, title, description, id }: { eyebrow?: string; title: string; description?: string; id: string }) {
  return <header className={styles.sectionHeading}>{eyebrow ? <p>{eyebrow}</p> : null}<h2 id={id}>{title}</h2>{description ? <span>{description}</span> : null}</header>;
}

function Hero() {
  return <section className={styles.hero}>
    <div className={styles.shell}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}><Link href="/">Home</Link><span>/</span><b>About The Perspective</b></nav>
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}><p>About The Perspective</p><h1>Journalism for People Who Want to Understand What Comes Next.</h1><span>The Perspective is a premium editorial platform covering the leaders, companies, technologies and ideas shaping business and society.</span><Link href="#our-story">Our Story <ArrowRight /></Link></div>
        <div className={styles.heroVisual}>
          <Image alt="Editors collaborating in The Perspective newsroom" fill priority sizes="(max-width: 850px) 100vw, 67vw" src="/images/about/newsroom-hero.png" />
          <div className={styles.heroBrand}><small>The</small><strong>Perspective.</strong></div>
          <div className={styles.publicationStack} aria-label="The Perspective publication ecosystem">
            <div className={styles.cover}><span>The</span><b>Perspective.</b><i>The Architects<br />of Tomorrow</i><small>Ideas worth keeping</small></div>
            <div className={styles.device}><span>The</span><b>Perspective.</b><i>Leadership<br />in focus</i></div>
          </div>
        </div>
      </div>
      <dl className={styles.heroStats}><div><dt>150+</dt><dd>Global contributors</dd></div><div><dt>20+</dt><dd>Countries covered</dd></div><div><dt>500+</dt><dd>Long-form stories</dd></div><div><dt>One Platform</dt><dd>Magazine · Podcasts · Video · Events</dd></div></dl>
    </div>
  </section>;
}

function Mission() {
  const principles = [
    { icon: ShieldCheck, title: "Independent, Always", copy: "Editorial judgment is never for sale and never shaped by influence." },
    { icon: PenLine, title: "Deep & Rigorous", copy: "Every story is built on research, context and original thinking." },
    { icon: Globe2, title: "Globally Relevant", copy: "A worldwide lens, grounded in the places where change is lived." },
    { icon: Lightbulb, title: "Ideas With Impact", copy: "We spotlight arguments and innovations that move the world." },
  ];
  return <section aria-labelledby="mission-title" className={styles.section}><div className={styles.shell}><div className={styles.mission}>
    <div className={styles.missionIntro}><p>Our Mission</p><h2 id="mission-title">To illuminate what matters.<br />To elevate the conversation.<br />To shape a better tomorrow.</h2><span>We go beyond the headlines to bring you deep insight, independent perspective and journalism that helps you see the world with greater clarity.</span><Link href="/search?q=editorial+philosophy">Our Editorial Philosophy <ArrowRight /></Link></div>
    {principles.map(({ icon: Icon, title, copy }) => <article key={title}><Icon /><h3>{title}</h3><p>{copy}</p></article>)}
  </div></div></section>;
}

function Coverage() {
  return <section aria-labelledby="coverage-title" className={styles.section}><div className={styles.shell}><SectionHeading id="coverage-title" title="What We Cover"/><div className={styles.coverage}>{coverage.map((item) => <Link href={item.href} key={item.title}><span><Image alt="" fill sizes="240px" src={item.image}/></span><h3>{item.title}</h3><p>{item.description}</p></Link>)}</div></div></section>;
}

function Ecosystem() {
  return <section aria-labelledby="ecosystem-title" className={styles.section}><div className={styles.shell}><SectionHeading description="Stories across formats. Conversations across platforms. Impact across audiences." id="ecosystem-title" title="The Perspective Ecosystem"/><div className={styles.ecosystem}>{ecosystem.map(({ icon: Icon, title, copy, href }) => <Link href={href} key={title}><Icon/><div><h3>{title}</h3><p>{copy}</p></div></Link>)}</div></div></section>;
}

function Story() {
  return <section aria-labelledby="story-title" className={styles.section} id="our-story"><div className={styles.shell}><div className={styles.story}>
    <div className={styles.storyIntro}><p>Our Story</p><h2 id="story-title">Why The Perspective Exists</h2><span>The Perspective was founded on a simple belief: quality journalism can create clarity in a complex world.</span><span>We exist to inform, inspire and empower people who want to understand the forces shaping the future—and the leaders shaping it.</span><Link href="/search?q=our+story">Read Our Full Story <ArrowRight/></Link></div>
    <div className={styles.timeline}>{milestones.map((item) => <article key={item.year}><time>{item.year}</time><h3>{item.title}</h3><p>{item.copy}</p><span><Image alt="" fill sizes="180px" src={item.image}/></span></article>)}</div>
  </div></div></section>;
}

function Leadership() {
  return <section aria-labelledby="leadership-title" className={styles.section}><div className={styles.shell}><SectionHeading id="leadership-title" title="Editorial Leadership"/><div className={styles.leadershipGrid}>
    <div className={styles.leaders}>{leaders.map((leader) => <Link href={leader.href} key={leader.name}><span><Image alt={`${leader.name}, ${leader.role}`} fill sizes="180px" src={leader.image}/></span><h3>{leader.name}</h3><b>{leader.role}</b><p>{leader.copy}</p></Link>)}<Link className={styles.joinCard} href="/search?q=careers"><UsersRound/><h3>Join Our Team</h3><p>We are always looking for curious minds and exacting storytellers.</p><b>View Careers <ArrowRight/></b></Link></div>
    <aside className={styles.trust}><ShieldCheck/><h2>Our Commitment to Trust</h2><ul>{["Fact-first journalism","No paid news","Transparent corrections","Diverse perspectives","Respectful conversations"].map((item)=><li key={item}><Check/>{item}</li>)}</ul><Link href="/search?q=editorial+standards">Our Editorial Standards <ArrowRight/></Link></aside>
  </div></div></section>;
}

function Impact() {
  const metrics = [{icon:Newspaper,value:"12M+",label:"Monthly readers"},{icon:BookOpen,value:"3M+",label:"Magazine readers"},{icon:Headphones,value:"1M+",label:"Podcast listeners"},{icon:Camera,value:"2M+",label:"Monthly video views"},{icon:UsersRound,value:"150+",label:"Global contributors"}];
  return <section aria-labelledby="impact-title" className={styles.section}><div className={styles.shell}><div className={styles.impactGrid}><div><SectionHeading id="impact-title" title="Our Impact & Reach"/><dl className={styles.impact}>{metrics.map(({icon:Icon,value,label})=><div key={label}><Icon/><dt>{value}</dt><dd>{label}</dd></div>)}</dl></div><aside className={styles.briefing}><Mail/><div><h2>Stay informed</h2><p>Get our editor’s briefing, magazine highlights and exclusive analysis.</p><form action="/search" method="get"><input aria-label="Email address" name="q" placeholder="Enter your email address" type="email"/><button>Subscribe</button></form><span>No spam. Unsubscribe anytime.</span></div></aside></div></div></section>;
}

function Community() {
  return <section className={styles.community}><div className={styles.shell}><div><Sparkles/><span><h2>Be Part of the Perspective Community</h2><p>Join readers, leaders and changemakers who rely on The Perspective for intelligent ideas and useful context.</p></span><Link href="/magazine/subscribe">Subscribe Now</Link></div><div><Handshake/><span><h2>Media & Partnership Enquiries</h2><p>Looking to collaborate, partner or feature with us? We would like to hear from you.</p></span><Link href="/contact">Contact Us <ArrowRight/></Link></div></div></section>;
}

export function AboutPerspectivePage() {
  return <div className={styles.page} data-about-page><Hero/><Mission/><Coverage/><Ecosystem/><Story/><Leadership/><Impact/><Community/><section className={styles.archiveBridge}><div className={styles.shell}><p>Continue exploring</p><h2>The current About discovery experience remains below.</h2><span>Browse matching stories, people, publications and topics from across The Perspective.</span></div></section></div>;
}
