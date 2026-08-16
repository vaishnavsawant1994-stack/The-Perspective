import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, BookOpen, BriefcaseBusiness, CheckCircle2, CircleUserRound,
  Globe2, Handshake, Laptop, Mail, PenLine, Quote, Share2,
  Smartphone, Sparkles, TrendingUp, UserRound,
} from "lucide-react";
import type { ResolvedPersonalMagazineSummary } from "@/types";
import styles from "./personal-magazines-redesign.module.css";

type Props = { editions: readonly ResolvedPersonalMagazineSummary[] };

const categoryCards = [
  { title: "Founders", description: "Visionaries building the future", Icon: BriefcaseBusiness, href: "/topic/founders" },
  { title: "CEOs", description: "Leading organizations to new heights", Icon: CircleUserRound, href: "/leadership" },
  { title: "Investors", description: "Backing ideas. Building impact.", Icon: TrendingUp, href: "/topic/global-markets" },
  { title: "Women Leaders", description: "Inspiring change. Breaking barriers.", Icon: UserRound, href: "/search?q=women+leaders" },
  { title: "Technology Leaders", description: "Shaping tomorrow with technology", Icon: Sparkles, href: "/technology" },
] as const;

const processSteps = [
  { title: "Discover", copy: "Tell us about your story and goals.", Icon: UserRound },
  { title: "Interview", copy: "We conduct in-depth interviews and research.", Icon: Handshake },
  { title: "Create", copy: "Our editors craft your magazine issue.", Icon: PenLine },
  { title: "Publish", copy: "Your magazine goes live in print and digital.", Icon: BookOpen },
] as const;

const included = ["In-depth interviews", "Print & digital editions", "Professional writing", "Global distribution", "Custom magazine design", "Marketing & promotion"] as const;

const reasons = [
  { title: "Premium Editorial", copy: "World-class storytelling and design.", Icon: Sparkles },
  { title: "Personal Branding", copy: "Build credibility and thought leadership.", Icon: UserRound },
  { title: "Wide Reach", copy: "Global audience of influential leaders.", Icon: Globe2 },
  { title: "Timeless Legacy", copy: "A lasting record of your journey and impact.", Icon: Share2 },
] as const;

const extraEditions = [
  { name: "Elena Rossi", title: "Redefining Leadership", image: "/images/articles/elena-rossi.png", href: "/search?q=Elena+Rossi", edition: "The Leadership Edition" },
  { name: "Marcus Chen", title: "Building With Conviction", image: "/images/articles/marcus-chen.png", href: "/search?q=Marcus+Chen", edition: "The Builder's Edition" },
] as const;

function MagazineCover({ edition, priority = false }: { edition: ResolvedPersonalMagazineSummary; priority?: boolean }) {
  const href = `/personal-magazines/${edition.magazine.slug}`;
  return <Link aria-label={`Read ${edition.person.name}'s Personal Magazine`} className={styles.cover} href={href}>
    {edition.coverImage && <Image alt={edition.coverImage.alt} fill priority={priority} sizes="(max-width: 700px) 70vw, 220px" src={edition.coverImage.src} />}
    <span className={styles.coverShade} />
    <span className={styles.coverBrand}>The Perspective</span>
    <span className={styles.coverEdition}>{edition.magazine.editionLabel}</span>
    <span className={styles.coverCopy}><b>{edition.person.name}</b><small>{edition.magazine.coverHeadline}</small></span>
  </Link>;
}

function DummyCover({ item }: { item: (typeof extraEditions)[number] }) {
  return <Link aria-label={`Explore stories about ${item.name}`} className={styles.cover} href={item.href}>
    <Image alt={`${item.name} editorial portrait`} fill sizes="(max-width: 700px) 70vw, 220px" src={item.image} />
    <span className={styles.coverShade} />
    <span className={styles.coverBrand}>The Perspective</span>
    <span className={styles.coverEdition}>{item.edition}</span>
    <span className={styles.coverCopy}><b>{item.name}</b><small>{item.title}</small></span>
  </Link>;
}

function Hero({ lead }: { lead?: ResolvedPersonalMagazineSummary }) {
  const portrait = "/images/personal-magazines/arjun-mehta-hero-v3.webp";
  return <section aria-labelledby="personal-v2-title" className={styles.hero}>
    <div className={styles.wrap}>
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Personal Magazines</p>
          <h1 aria-label="Your Story. Your Legacy. Your Magazine." id="personal-v2-title"><span>Your Story.</span>{" "}<span>Your Legacy.</span>{" "}<strong>Your Magazine.</strong></h1>
          <span aria-hidden="true" className={styles.signatureLine} />
          <p className={styles.heroDeck}>Premium editorial magazines for founders, executives, investors and leaders who want to inspire, influence, and leave a lasting legacy.</p>
          <div className={styles.actions}><Link className={styles.primaryButton} href="#personal-v2-editions">Explore Personal Magazines <ArrowRight aria-hidden="true" /></Link><Link className={styles.secondaryButton} href="/personal-magazines/create">Create Your Magazine</Link></div>
          <ul className={styles.heroBenefits}><li><BookOpen aria-hidden="true" /><span>Magazine-quality<br />storytelling</span></li><li><PenLine aria-hidden="true" /><span>Professional interviews<br />and editorial writing</span></li><li><Globe2 aria-hidden="true" /><span>Global distribution<br />and digital reach</span></li></ul>
        </div>
        <div className={styles.heroPortrait}><span aria-hidden="true" /><Image alt="Arjun Mehta photographed for The Perspective Personal Magazines" fill priority sizes="(max-width: 800px) 90vw, 520px" src={portrait} /></div>
        <aside className={styles.heroQuote}><Quote aria-hidden="true" /><blockquote>A magazine is more than a publication—it&apos;s a platform for your ideas, your journey, and your impact.</blockquote><p><b>{lead?.person.name ?? "Arjun Mehta"}</b><span>{lead?.person.title ?? "Founder & CEO"}</span><span>{lead?.person.company ?? "Meridian Industries"}</span></p></aside>
      </div>
    </div>
  </section>;
}

function EditionShowcase({ editions }: Props) {
  const [lead, ...remaining] = editions;
  if (!lead) return null;
  const recent = remaining.map((edition) => edition.person.slug === "sophia-reynolds" ? {
    ...edition,
    coverImage: { src: "/images/personal-magazines/sophia-reynolds-cover-v2.png", alt: "Sophia Reynolds photographed for her Personal Magazine", width: 1024, height: 1536 },
  } : edition);
  return <section aria-labelledby="personal-v2-editions-title" className={styles.editionShowcase} id="personal-v2-editions">
    <div className={`${styles.wrap} ${styles.editionGrid}`}>
      <article className={styles.spotlight}>
        <div><p className={styles.eyebrow}>Featured Spotlight</p><h2 id="personal-v2-editions-title">{lead.person.name}</h2><p className={styles.role}>{[lead.person.title, lead.person.company].filter(Boolean).join(", ")}</p><p>{lead.magazine.introduction}</p><Link href={`/personal-magazines/${lead.magazine.slug}`}>Read spotlight issue <ArrowRight aria-hidden="true" /></Link></div>
        <MagazineCover edition={lead} priority />
      </article>
      <div className={styles.recentEditions}><p className={styles.eyebrow}>Recent Personal Magazines</p><div>{recent.map((edition) => <MagazineCover edition={edition} key={edition.magazine.id} />)}{extraEditions.map((item) => <DummyCover item={item} key={item.name} />)}</div><Link href="#personal-magazine-collection">View all Personal Magazines <ArrowRight aria-hidden="true" /></Link></div>
    </div>
  </section>;
}

function Categories() {
  return <section aria-labelledby="personal-v2-categories" className={styles.categories}><div className={styles.wrap}><h2 id="personal-v2-categories">Explore by leader category</h2><div className={styles.categoryGrid}>{categoryCards.map(({ title, description, Icon, href }) => <Link href={href} key={title}><Icon aria-hidden="true" /><h3>{title}</h3><p>{description}</p></Link>)}</div><Link className={styles.centerLink} href="/search?type=contributors">View all categories <ArrowRight aria-hidden="true" /></Link></div></section>;
}

function Process() {
  return <section className={styles.processSection}><div className={`${styles.wrap} ${styles.processGrid}`}>
    <div><h2>How it works</h2><ol className={styles.processList}>{processSteps.map(({ title, copy, Icon }, index) => <li key={title}><b>{index + 1}</b><span><Icon aria-hidden="true" /></span><h3>{title}</h3><p>{copy}</p></li>)}</ol></div>
    <div><h2>What&apos;s included</h2><ul className={styles.includedList}>{included.map((item) => <li key={item}><CheckCircle2 aria-hidden="true" />{item}</li>)}</ul></div>
  </div></section>;
}

function DigitalPreview({ lead }: { lead?: ResolvedPersonalMagazineSummary }) {
  const portrait = lead?.coverImage?.src ?? "/images/articles/arjun-mehta.png";
  return <section aria-labelledby="personal-v2-digital" className={styles.digital}><div className={`${styles.wrap} ${styles.digitalGrid}`}>
    <div aria-label="Personal Magazine displayed on laptop and mobile" className={styles.deviceScene} role="img"><div className={styles.laptop}><div><div className={styles.readerCover}><Image alt="Digital Personal Magazine cover preview" fill sizes="240px" src={portrait} /><span><strong>The Perspective</strong><b>{lead?.person.name ?? "Arjun Mehta"}</b><small>{lead?.magazine.coverHeadline ?? "Building Beyond Borders"}</small></span></div><div className={styles.readerPage}><span>Personal Edition</span><b>{lead?.magazine.coverHeadline ?? "Building Beyond Borders"}</b><p>Ambition, disciplined growth and the work of building an institution designed to endure.</p><i>01 / 26</i></div></div></div><div className={styles.phone}><Image alt="Mobile Personal Magazine preview" fill sizes="110px" src={portrait} /><span>The Perspective</span></div></div>
    <div className={styles.digitalCopy}><p className={styles.eyebrow}>Digital edition preview</p><h2 id="personal-v2-digital">A beautifully crafted edition, everywhere.</h2><p>Experience your magazine in a focused, interactive digital format designed for immersive reading on every screen.</p><ul><li><Laptop aria-hidden="true" /><b>Editorial experience</b><span>Rich, page-inspired digital storytelling.</span></li><li><Share2 aria-hidden="true" /><b>Share anywhere</b><span>Share your story with the world.</span></li><li><Smartphone aria-hidden="true" /><b>Mobile optimized</b><span>Perfect reading on every device.</span></li></ul><Link className={styles.secondaryButton} href={lead ? `/personal-magazines/${lead.magazine.slug}` : "/personal-magazines"}>View sample edition <ArrowRight aria-hidden="true" /></Link></div>
  </div></section>;
}

function TrustAndTestimonial() {
  return <section className={styles.trust}><div className={`${styles.wrap} ${styles.trustGrid}`}>
    <div><h2>Why leaders choose The Perspective</h2><div className={styles.reasonGrid}>{reasons.map(({ title, copy, Icon }) => <article key={title}><Icon aria-hidden="true" /><h3>{title}</h3><p>{copy}</p></article>)}</div></div>
    <aside><h2>What leaders say</h2><Quote aria-hidden="true" /><blockquote>“The Perspective captured my journey with incredible depth and elegance. It&apos;s more than a magazine—it&apos;s my legacy in print.”</blockquote><div><Image alt="Sophia Reynolds portrait" height={54} src="/images/personal-magazines/sophia-reynolds-cover-v2.png" width={54} /><p><b>Sophia Reynolds</b><span>Managing Partner, Reynolds Capital</span></p></div><span aria-hidden="true" className={styles.dots}>● ○ ○</span></aside>
  </div></section>;
}

function CallToAction() {
  return <section aria-labelledby="personal-v2-cta" className={styles.cta} id="personal-v2-create"><div className={styles.wrap}><h2 id="personal-v2-cta">Ready to Share Your Story with the World?</h2><p>Create a premium personal magazine that reflects your journey, your values, and your vision.</p><div className={styles.actions}><Link className={styles.primaryButton} href="/personal-magazines/create">Create Your Magazine <ArrowRight aria-hidden="true" /></Link><Link className={styles.secondaryButton} href="/contact">Talk to Our Team</Link></div></div></section>;
}

function BriefingBar() {
  return <section aria-label="Personal Magazines newsletter" className={styles.briefing}><div className={`${styles.wrap} ${styles.briefingGrid}`}><Mail aria-hidden="true" /><div><h2>Stay Inspired</h2><p>Subscribe for leader stories, insights, and publication updates.</p></div><form action="/search" role="search"><label className="sr-only" htmlFor="personal-v2-email">Email address</label><input id="personal-v2-email" name="q" placeholder="Enter your email address" type="email" /><button type="submit">Subscribe</button></form></div></section>;
}

export function PersonalMagazinesRedesign({ editions }: Props) {
  const lead = editions[0];
  return <div className={styles.page} data-personal-magazines-v2>
    <Hero lead={lead} />
    <EditionShowcase editions={editions} />
    <Categories />
    <Process />
    <DigitalPreview lead={lead} />
    <TrustAndTestimonial />
    <CallToAction />
    <BriefingBar />
  </div>;
}
