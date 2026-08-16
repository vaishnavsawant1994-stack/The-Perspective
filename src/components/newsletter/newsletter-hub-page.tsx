import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, BarChart3, BellRing, BookOpen, BriefcaseBusiness, CalendarDays,
  Cpu, FileText, Globe2, Headphones, HelpCircle, Mail, Newspaper, ShieldCheck,
  Smartphone, Sparkles, Sun, UserRound, UsersRound,
} from "lucide-react";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { BriefingPreferences } from "./briefing-preferences";
import { BriefingSubscribeButton } from "./briefing-subscribe-button";
import styles from "./newsletter-hub-page.module.css";

type Briefing = {
  title: string; frequency: string; description: string; subscribers: string; icon: LucideIcon;
  previewTitle: string; previewStory: string; image?: string; featured?: boolean; alert?: boolean;
};

const briefings: Briefing[] = [
  { title: "Daily Briefing", frequency: "Every weekday", description: "Start your day with the top stories, expert analysis and must-know insights.", subscribers: "8,542", icon: Sun, previewTitle: "Today’s Top Stories", previewStory: "India’s Growth Momentum: What the Latest Data Signals", image: "/images/articles/global-growth.png", featured: true },
  { title: "Magazine Briefing", frequency: "Weekly · Every Friday", description: "Highlights from our latest magazine issue, editor’s picks and long reads.", subscribers: "8,213", icon: BookOpen, previewTitle: "The Magazine Briefing", previewStory: "Inside The Architects of Tomorrow", image: "/images/articles/future-leader.png" },
  { title: "Business Briefing", frequency: "Twice a week", description: "Strategy, leadership, companies and economic trends shaping business.", subscribers: "7,125", icon: BriefcaseBusiness, previewTitle: "Business Briefing", previewStory: "Leadership Moves and the Week Ahead", image: "/images/articles/board-governance.png" },
  { title: "Technology Briefing", frequency: "Twice a week", description: "Emerging tech, innovation, startups, AI and the future of industries.", subscribers: "7,987", icon: Cpu, previewTitle: "Technology Briefing", previewStory: "The AI Infrastructure Race Heats Up", image: "/images/articles/ai-infrastructure.png" },
  { title: "Leadership Briefing", frequency: "Weekly · Every Monday", description: "Leadership lessons, interviews and ideas from top executives and thinkers.", subscribers: "5,214", icon: UserRound, previewTitle: "Leadership Briefing", previewStory: "Building Future-Ready Organizations", image: "/images/articles/elena-rossi.png" },
  { title: "Markets Briefing", frequency: "Twice a week", description: "Market moves, investment insights, policy and global economic updates.", subscribers: "5,876", icon: BarChart3, previewTitle: "Markets Briefing", previewStory: "Markets Rally as Rate-Cut Optimism Returns", image: "/images/articles/global-growth.png" },
  { title: "Events Briefing", frequency: "Weekly", description: "Upcoming events, summits, webinars and exclusive invitations.", subscribers: "4,128", icon: CalendarDays, previewTitle: "Events Briefing", previewStory: "Leadership Summit 2026: Registration Opens", image: "/images/events/leadership-summit-hero.png" },
  { title: "Podcast Updates", frequency: "Weekly", description: "New episodes, guest highlights and key takeaways from our podcasts.", subscribers: "3,942", icon: Headphones, previewTitle: "Podcast Update", previewStory: "Rethinking Growth in a Changing World", image: "/images/podcasts/naveen-malhotra-hero-clean.webp" },
  { title: "Personal Magazine Updates", frequency: "As needed", description: "Tips, features and success stories from our Personal Magazine platform.", subscribers: "3,341", icon: Sparkles, previewTitle: "Personal Magazine", previewStory: "Your Story. Your Legacy.", image: "/images/personal-magazines/arjun-mehta-hero-v3.webp" },
  { title: "Topic Alerts", frequency: "Custom frequency", description: "Create your own alerts for topics, companies, authors and industries.", subscribers: "Build your own", icon: BellRing, previewTitle: "Topic Alert", previewStory: "Sustainability, Policy & Regulation", image: "/images/articles/cybersecurity-operations.png", alert: true },
];

const faqs = [
  ["How often will I receive these emails?", "Each briefing clearly states its frequency. Topic Alerts can be adjusted to daily, weekly or important updates only."],
  ["How can I update my email preferences?", "Use the preference panel on this page. Your selections can be changed whenever your reading habits change."],
  ["Are The Perspective briefings free?", "Yes. Our core briefings are free. Premium members may also receive exclusive edition notes and advance reports."],
  ["Will you share my email address?", "No. We use your address only to deliver the briefings and account notices you choose."],
  ["Can I subscribe to more than one briefing?", "Yes. Subscribe to any combination and manage every briefing from one preference center."],
  ["How do I unsubscribe?", "Every email includes an unsubscribe link, and individual briefings can be paused without leaving the others."],
];

function BriefingPreview({ briefing }: { briefing: Briefing }) {
  return (
    <div className={styles.miniPreview}>
      <div><span>The Perspective.</span><small>{briefing.previewTitle}</small></div>
      {briefing.image && <span className={styles.miniImage}><Image alt="" fill sizes="220px" src={briefing.image} /></span>}
      <b>{briefing.previewStory}</b>
      <i aria-hidden="true" /><i aria-hidden="true" />
    </div>
  );
}

function BriefingCard({ briefing }: { briefing: Briefing }) {
  const Icon = briefing.icon;
  return (
    <article className={styles.briefingCard}>
      {briefing.featured && <span className={styles.featured}>Featured</span>}
      <header><Icon aria-hidden="true" /><div><h3>{briefing.title}</h3><p>{briefing.frequency}</p></div></header>
      <p>{briefing.description}</p>
      <BriefingPreview briefing={briefing} />
      <footer><small>{briefing.subscribers}{briefing.alert ? "" : " subscribers"}</small><BriefingSubscribeButton alert={briefing.alert} name={briefing.title} /></footer>
    </article>
  );
}

export function NewsletterHubPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}><Link href="/">Home</Link><span>/</span><b>Newsletters &amp; Briefings</b></nav>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>The Perspective Briefings</p>
            <h1>The Stories That Matter,<br />Delivered With Context.</h1>
            <p>Curated reporting, analysis, magazine highlights, interviews and event updates from The Perspective.</p>
            <div className={styles.actions}><a href="#briefings">Explore briefings <ArrowRight aria-hidden="true" /></a><a href="#daily-briefing">Subscribe to Daily Briefing</a></div>
          </div>
          <div className={styles.heroImage}><Image alt="A premium newsletter displayed across laptop and mobile devices beside a Perspective coffee mug" fill priority sizes="(max-width: 900px) 100vw, 62vw" src="/images/newsletter/briefings-hero.png" /></div>
          <ul className={styles.values}><li><ShieldCheck />Independent.</li><li><UsersRound />Insightful.</li><li><FileText />In-depth.</li><li><Globe2 />Relevant.</li></ul>
        </section>

        <section aria-labelledby="briefings-heading" className={styles.briefings} id="briefings">
          <header className={styles.sectionHeading}><div><p className={styles.eyebrow}>Choose your coverage</p><h2 id="briefings-heading">The briefings that matter to you</h2><span>Expert analysis and the stories shaping business, markets, technology and society.</span></div><Link href="/search?q=briefing">Explore the archive <ArrowRight /></Link></header>
          <div className={styles.briefingGrid}>{briefings.map((briefing, index) => <div id={index === 0 ? "daily-briefing" : undefined} key={briefing.title}><BriefingCard briefing={briefing} /></div>)}</div>
        </section>

        <section className={styles.previewSection}>
          <article className={styles.sample}>
            <p className={styles.eyebrow}>Sample issue preview</p>
            <div className={styles.samplePaper}>
              <header><b>The Perspective.</b><small>Daily Briefing<br />May 12, 2026</small></header>
              <h2>Today’s Top Stories</h2>
              <span><Image alt="A city skyline illustrating the Daily Briefing lead story" fill sizes="330px" src="/images/articles/global-growth.png" /></span>
              <h3>India’s Growth Momentum: What the Latest Data Signals</h3>
              <p>A closer look at GDP, sector performance and what it means for businesses and investors.</p>
              <ul><li>Global Markets Extend Rally as Inflation Cools</li><li>Exclusive Interview: Building Digital Public Infrastructure</li></ul>
            </div>
            <Link href="/latest">Read full briefing <ArrowRight /></Link>
          </article>

          <article className={styles.whySubscribe}>
            <p className={styles.eyebrow}>Why subscribe?</p><h2>Designed for curious minds and busy leaders.</h2>
            <ul>
              <li><Sparkles /><div><b>Curated by editors</b><span>Handpicked stories, not algorithms.</span></div></li>
              <li><Newspaper /><div><b>In-depth &amp; original</b><span>Context, analysis and expert perspectives.</span></div></li>
              <li><BarChart3 /><div><b>Actionable insights</b><span>Ideas you can use in work and life.</span></div></li>
              <li><Smartphone /><div><b>Multiple formats</b><span>Email, web and mobile friendly.</span></div></li>
              <li><ShieldCheck /><div><b>No noise. Just signal.</b><span>We respect your inbox.</span></div></li>
            </ul>
          </article>

          <aside className={styles.preferenceColumn}>
            <section className={styles.preferences}><BriefingPreferences /></section>
            <section className={styles.apps}><div><p className={styles.eyebrow}>Stay informed, everywhere</p><h2>All briefings. Any device.</h2><div><Link href="/search?q=app"> App Store</Link><Link href="/search?q=app">▶ Google Play</Link></div></div><Smartphone aria-hidden="true" /></section>
          </aside>
        </section>

        <section className={styles.faqSection}>
          <div><p className={styles.eyebrow}>Frequently asked questions</p><h2>Everything you need to know</h2></div>
          <div className={styles.faqGrid}>{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div>
          <aside><HelpCircle /><h3>Have more questions?</h3><p>Visit our Help Center or contact our support team.</p><Link href="/help">Visit Help Center <ArrowRight /></Link></aside>
        </section>

        <section className={styles.darkCta}>
          <div><Mail /><h2>Knowledge that keeps you ahead.</h2><p>Join thousands of readers who trust The Perspective for independent, in-depth and insightful reporting.</p></div>
          <NewsletterForm buttonLabel="Subscribe now" label="Join the Perspective Briefing" theme="dark" />
          <div className={styles.ctaArt}><BookOpen /><span>P.</span></div>
        </section>

        <section className={styles.archiveBridge}><div><p className={styles.eyebrow}>The existing newsletter experience</p><h2>Continue into every newsletter story, update and archive result.</h2></div><a href="#current-newsletter-experience">Browse all results <ArrowRight /></a></section>
      </div>
    </main>
  );
}
