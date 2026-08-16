import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Check,
  CircleUserRound,
  Clock3,
  FileText,
  Globe2,
  Lightbulb,
  MessageSquareText,
  Newspaper,
  Palette,
  PenLine,
  Quote,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { PersonalMagazineCover } from "@/components/magazine/personal-magazine-cover";
import type { ImageAsset, PersonProfile, ResolvedPersonalMagazineSummary } from "@/types";
import { PersonalMagazineLeadForm } from "./personal-magazine-lead-form";
import styles from "./personal-magazine-create-page.module.css";

type Props = { editions: readonly ResolvedPersonalMagazineSummary[] };

const audiences = [
  { label: "Founders", Icon: Rocket },
  { label: "CEOs & Executives", Icon: BriefcaseBusiness },
  { label: "Investors", Icon: TrendingUp },
  { label: "Entrepreneurs", Icon: Lightbulb },
  { label: "Industry Leaders", Icon: Building2 },
  { label: "Professionals", Icon: CircleUserRound },
  { label: "Change Makers", Icon: Award },
] as const;

const reasons = [
  "Establish unmatched authority and credibility",
  "Share your story in your own authentic voice",
  "Strengthen your personal brand and positioning",
  "Inspire teams, partners, customers and investors",
  "Leave a lasting legacy for your family and industry",
  "Be featured on The Perspective platform",
] as const;

const deliverables = [
  { title: "Premium magazine cover", Icon: BookOpen },
  { title: "In-depth interview", Icon: MessageSquareText },
  { title: "6–12 editorial chapters", Icon: Newspaper },
  { title: "Professional design", Icon: Palette },
  { title: "Digital Reader edition", Icon: FileText },
  { title: "Print & digital distribution", Icon: Globe2 },
  { title: "Marketing & PR support", Icon: Sparkles },
] as const;

const process = [
  ["01", "Discover", "We understand your story, goals and the message you want to share.", Search],
  ["02", "Interview", "In-depth conversations capture your journey, insights and vision.", MessageSquareText],
  ["03", "Write", "Our editors shape your interviews into substantial editorial features.", PenLine],
  ["04", "Design", "We create the cover, visual system and complete magazine layout.", Palette],
  ["05", "Review", "You review the content and design; we refine it together.", ShieldCheck],
  ["06", "Publish", "Your magazine is released in digital and print formats.", BookOpen],
  ["07", "Amplify", "We help share the edition across your platforms and media.", TrendingUp],
] as const;

const faqs = [
  ["How long is the magazine?", "Most Personal Magazines contain 6–12 chapters and 60–100 designed pages, depending on the story and edition."],
  ["What does it cost to create a Personal Magazine?", "Every edition is scoped individually after an editorial consultation. Your proposal will clearly list writing, design, digital and optional print deliverables."],
  ["Do you help with PR and distribution?", "Yes. Every publication includes a digital launch plan, and expanded media, print and distribution support can be added to the edition."],
  ["Will I receive both digital and print versions?", "A responsive Digital Reader edition is standard. Print-ready files and physical copies are available with selected packages."],
  ["Can I review the content before publication?", "Yes. The process includes structured editorial and design review stages before the final publication is released."],
] as const;

const samplePeople: Array<{ person: PersonProfile; image: ImageAsset; headline: string; label: string }> = [
  ["neha-sharma", "Neha Sharma", "CEO, Globalian", "The Visionary Leader", "/images/articles/elena-rossi.png", "The Leadership Edition"],
  ["rohit-bansal", "Rohit Bansal", "Founder, Kairos Capital", "Built to Transform", "/images/articles/marcus-chen.png", "The Builder's Edition"],
  ["kavya-iyer", "Dr. Kavya Iyer", "Founder, BioNova Labs", "Innovating for Impact", "/images/authors/ananya-mehta-featured.png", "The Innovator's Edition"],
  ["vikram-menon", "Vikram Menon", "Chairman, Menon Group", "Investing in Tomorrow", "/images/articles/daniel-kim.png", "The Legacy Edition"],
  ["aditya-nanda", "Aditya Nanda", "CEO, CloudOrbit", "Leading with Purpose", "/images/articles/marcus-chen.png", "The Technology Edition"],
  ["meera-rao", "Meera Rao", "Founder, GreenOrbit", "Reimagining Possibilities", "/images/articles/elena-rossi.png", "The Impact Edition"],
].map(([slug, name, headline, coverHeadline, src, label]) => ({
  person: { id: `sample-${slug}`, slug, name, headline, biography: "", expertise: [], title: headline },
  image: { src, alt: `${name} Personal Magazine portrait`, width: 1024, height: 1536 },
  headline: coverHeadline,
  label,
}));

function SectionHeading({ eyebrow, title, copy }: { eyebrow?: string; title: string; copy?: string }) {
  return <header className={styles.sectionHeading}>{eyebrow && <p>{eyebrow}</p>}<h2>{title}</h2>{copy && <span>{copy}</span>}</header>;
}

function OpenSpread() {
  return <div aria-label="Sample Personal Magazine page spread" className={styles.openSpread}>
    <div><span>The Perspective</span><h3>Building the future with purpose</h3><p>Leadership is measured by the institutions and opportunities that remain after the spotlight moves on.</p></div>
    <div><Image alt="A global city representing purposeful growth" fill sizes="260px" src="/images/articles/global-growth.png" /></div>
  </div>;
}

export function PersonalMagazineCreatePage({ editions }: Props) {
  const lead = editions[0];
  const leadPerson = lead?.person ?? samplePeople[0].person;
  const featured = editions.slice(0, 3);

  return <div className={styles.page}>
    <nav aria-label="Breadcrumb" className={styles.breadcrumb}><Link href="/">Home</Link><span>/</span><Link href="/personal-magazines">Personal Magazines</Link><span>/</span><b>Create Your Magazine</b></nav>

    <section aria-labelledby="create-magazine-title" className={styles.hero}>
      <div className={styles.heroCopy}>
        <p>Create your Personal Magazine</p>
        <h1 id="create-magazine-title">Your Story Deserves<br />More Than a Profile.</h1>
        <span>We turn your journey, ideas, achievements and leadership into a professionally produced magazine that builds your authority, amplifies your impact and preserves your legacy.</span>
        <div><Link className={styles.primaryButton} href="#start-your-journey">Create your magazine</Link><Link className={styles.secondaryButton} href="/contact">Talk to our editorial team</Link></div>
        <Link className={styles.textLink} href="#sample-magazines">View sample magazines <ArrowRight aria-hidden="true" /></Link>
      </div>
      <div className={styles.heroArt}>
        <div className={styles.heroPortrait}><span /><Image alt={`${leadPerson.name} photographed for The Perspective`} fill priority sizes="(max-width: 900px) 80vw, 430px" src="/images/personal-magazines/arjun-mehta-hero-v3.webp" /></div>
        <div className={styles.heroCover}><PersonalMagazineCover coverHeadline="Leading Beyond Boundaries" coverImage={lead?.coverImage} editionLabel="Personal Magazine" index={0} person={leadPerson} priority /></div>
        <OpenSpread />
      </div>
    </section>

    <section aria-labelledby="audience-title" className={styles.audience}>
      <h2 id="audience-title">Who Personal Magazines are for</h2>
      <ul>{audiences.map(({ label, Icon }) => <li key={label}><Icon aria-hidden="true" /><span>{label}</span></li>)}</ul>
    </section>

    <div className={styles.contentWithForm}>
      <div>
        <section aria-labelledby="why-title" className={styles.whyCreate}>
          <div><SectionHeading title="Why create a Personal Magazine?" /><ul>{reasons.map((reason) => <li key={reason}><Check aria-hidden="true" />{reason}</li>)}</ul></div>
          <blockquote><Quote aria-hidden="true" /><p>A magazine is more than content. It is a statement of who you are and what you stand for.</p><cite>— The Perspective Editorial Team</cite></blockquote>
        </section>

        <section aria-labelledby="included-title" className={styles.included}>
          <SectionHeading title="What’s included" />
          <ul>{deliverables.map(({ title, Icon }) => <li key={title}><Icon aria-hidden="true" /><span>{title}</span></li>)}</ul>
        </section>
      </div>
      <aside id="start-your-journey"><PersonalMagazineLeadForm /></aside>
    </div>

    <section aria-labelledby="process-title" className={styles.process}>
      <SectionHeading title="Our editorial & publishing process" />
      <ol>{process.map(([number, title, copy, Icon]) => <li key={number}><div><Icon aria-hidden="true" /></div><small>{number}</small><h3>{title}</h3><p>{copy}</p></li>)}</ol>
    </section>

    <section aria-labelledby="samples-title" className={styles.samples} id="sample-magazines">
      <SectionHeading title="Sample magazine covers" />
      <div>{samplePeople.map(({ person, image, headline, label }, index) => <PersonalMagazineCover className={styles.sampleCover} coverHeadline={headline} coverImage={image} editionLabel={label} index={index} key={person.id} person={person} />)}</div>
    </section>

    <section aria-label="Personal Magazine benefits" className={styles.valueGrid}>
      <article className={styles.readerExperience}>
        <div className={styles.deviceScene}><div><Image alt="Personal Magazine Digital Reader preview" fill sizes="260px" src="/images/articles/arjun-mehta.png" /></div><span><Image alt="Mobile Personal Magazine preview" fill sizes="80px" src="/images/articles/arjun-mehta.png" /></span></div>
        <div><SectionHeading title="Digital Reader experience" /><p>Beautiful, interactive and immersive. Read anytime, anywhere, on any device.</p><ul><li><Check />Flipbook and accessible text view</li><li><Check />Search, share and offline access</li><li><Check />Optimised for every screen</li></ul><Link href="/magazine/read/august-2026">Explore Digital Reader <ArrowRight /></Link></div>
      </article>
      <article className={styles.authority}><SectionHeading title="Authority. Influence. Impact." /><p>A Personal Magazine opens doors and creates opportunities.</p><ul>{["Strengthen credibility", "Attract media and speaking opportunities", "Build trust with partners and investors", "Create a legacy that lasts"].map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul></article>
      <article className={styles.beforeAfter}><SectionHeading title="Before → After" /><div><span><b>Before</b><small>Limited visibility</small><small>Digital-only presence</small><small>Stories scattered</small></span><ArrowRight aria-hidden="true" /><span><b>After</b><small>Published authority</small><small>Premium positioning</small><small>Legacy preserved</small></span></div></article>
    </section>

    <section aria-label="Proof and timing" className={styles.proofGrid}>
      <article className={styles.testimonial}><SectionHeading title="What leaders say" /><Quote aria-hidden="true" /><blockquote>My magazine captured my journey in a way I could never have expressed. It has opened doors, built trust and created a legacy for my family and my team.</blockquote><div><Image alt="Arjun Mehta portrait" height={74} src="/images/articles/arjun-mehta.png" width={58} /><p><b>Arjun Mehta</b><span>Founder & CEO, Meridian Industries</span></p></div></article>
      <article className={styles.featuredPeople}><SectionHeading title="Featured Personal Magazines" /><div>{featured.map((edition) => <Link href={`/personal-magazines/${edition.magazine.slug}`} key={edition.magazine.id}><span><Image alt={edition.coverImage?.alt ?? `${edition.person.name} portrait`} fill sizes="100px" src={edition.coverImage?.src ?? "/images/articles/arjun-mehta.png"} /></span><b>{edition.person.name}</b><small>{edition.person.title}</small></Link>)}</div><Link className={styles.textLink} href="/personal-magazines">View all <ArrowRight /></Link></article>
      <article className={styles.timeline}><SectionHeading title="How long does it take?" /><Clock3 aria-hidden="true" /><p>Typically 6–10 weeks from interview to publication.</p><span>We handle everything, so you can focus on what matters most.</span><Link className={styles.textLink} href="#process-title">View timeline details <ArrowRight /></Link></article>
    </section>

    <section className={styles.faqCta}>
      <div><SectionHeading title="Frequently asked questions" />{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div>
      <article><div><p>Your story. Your legacy.</p><h2>Let’s create something extraordinary together.</h2><span>World-class editorial team. Premium design and production. Global reach and distribution.</span><Link href="#start-your-journey">Create your Personal Magazine <ArrowRight /></Link></div><div className={styles.ctaCovers}>{samplePeople.slice(3, 5).map(({ person, image, headline, label }, index) => <PersonalMagazineCover className={styles.ctaCover} coverHeadline={headline} coverImage={image} editionLabel={label} index={index} key={person.id} person={person} />)}</div></article>
    </section>

    <section className={styles.preservedIntro}><Sparkles aria-hidden="true" /><div><p>Continue exploring</p><h2>The original Personal Magazines experience</h2><span>The existing collection, featured editions and service information continue below.</span></div><ArrowRight aria-hidden="true" /></section>
  </div>;
}
