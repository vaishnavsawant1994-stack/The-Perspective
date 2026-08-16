import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, BookOpen, CalendarDays, Clock3, Handshake, Headphones,
  LifeBuoy, Mail, MessageCircle, Newspaper, PenLine, PlayCircle, Search, ShieldCheck,
  Smartphone, UserRound,
} from "lucide-react";
import styles from "./help-center-page.module.css";

type Topic = { title: string; description: string; href: string; icon: LucideIcon };

const topics: Topic[] = [
  { title: "Subscriptions & Membership", description: "Manage your subscription, payment methods, invoices and membership benefits.", href: "/magazine/subscribe", icon: UserRound },
  { title: "Magazine & Digital Reader", description: "Access current and past issues, learn about features, troubleshooting and device support.", href: "/magazine", icon: BookOpen },
  { title: "Personal Magazines", description: "Everything about publishing your own magazine with The Perspective.", href: "/personal-magazines", icon: Smartphone },
  { title: "Newsletters", description: "Manage your email preferences, briefings, frequency and delivery settings.", href: "/newsletter", icon: Mail },
  { title: "Events & Summits", description: "Registration, tickets, schedules, attendee support and event information.", href: "/events", icon: CalendarDays },
  { title: "Podcasts & Videos", description: "Watch, listen and subscribe to our shows. Get help with playback and platforms.", href: "/podcasts", icon: PlayCircle },
  { title: "Contributors & Authors", description: "Guidelines, submissions, pitches, royalties and author account support.", href: "/authors", icon: PenLine },
  { title: "Advertising & Partnerships", description: "Media kit, collaboration opportunities and partnership support.", href: "/contact", icon: Handshake },
  { title: "General Support", description: "Account help, troubleshooting, technical issues and general inquiries.", href: "/contact", icon: LifeBuoy },
];

const questions = [
  ["How do I subscribe to The Perspective?", "Visit our subscription page, compare Reader, Digital and Premium plans, and choose the experience that fits how you read."],
  ["How do I access the Digital Magazine?", "Open any issue marked Digital Reader. Reader controls include page navigation, thumbnails, Text View and accessible zoom."],
  ["Where can I find previous magazine issues?", "The Magazine Archive lets you browse by year, theme, Reader availability and Premium status."],
  ["How do I create my Personal Magazine?", "Start from the Personal Magazine creation page. Our editorial team will guide discovery, interviews, writing, design and publication."],
  ["How do I update my newsletter preferences?", "Use the preference controls on the Newsletters & Briefings Hub to choose topics, cadence, and alerts."],
  ["How do I register for an event or summit?", "Open the event detail page and select Register Now. Event information includes dates, venue, schedule and attendee guidance."],
  ["How can I pitch a story or become a contributor?", "Contact Editorial with a concise premise, why it matters now, and your relevant experience or access."],
  ["How do I contact The Perspective for media or partnerships?", "Choose Advertising & Partnerships on our Contact page and the commercial team will route your enquiry."],
];

const guides = [
  { title: "Getting Started with The Perspective", description: "Everything you need to know to get started.", time: "5 min read", image: "/images/newsletter/briefings-hero.png", href: "/about" },
  { title: "How to Use the Digital Reader", description: "A step-by-step guide to reading on any device.", time: "4 min read", image: "/images/articles/computing-infrastructure.png", href: "/magazine/read/august-2026" },
  { title: "Publishing Your Personal Magazine", description: "From planning to publication and beyond.", time: "8 min read", image: "/images/personal-magazines/arjun-mehta-hero-v3.webp", href: "/personal-magazines/create" },
  { title: "Managing Newsletter Preferences", description: "Choose what you receive and how often.", time: "3 min read", image: "/images/help/help-center-hero.png", href: "/newsletter" },
];

function TopicCard({ topic }: { topic: Topic }) {
  const Icon = topic.icon;
  return <Link className={styles.topicCard} href={topic.href}><Icon aria-hidden="true" /><h3>{topic.title}</h3><p>{topic.description}</p><ArrowRight aria-hidden="true" /></Link>;
}

export function HelpCenterPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}><Link href="/">Home</Link><span>/</span><b>Help Center</b></nav>

        <section className={styles.hero}>
          <Image alt="The Perspective Help Center displayed on a laptop beside editorial magazines and a coffee mug" fill priority sizes="(max-width: 900px) 100vw, 1380px" src="/images/help/help-center-hero.png" />
          <div className={styles.heroShade} />
          <div className={styles.heroCopy}>
            <p>The Perspective Help Center</p><h1>How Can We Help?</h1>
            <span>Find answers, explore guides, manage common questions, or connect with the right team at The Perspective.</span>
            <form action="/search" role="search"><label className="sr-only" htmlFor="help-search">Search the Help Center</label><input id="help-search" name="q" placeholder="Search subscriptions, magazines, events, accounts…" /><button aria-label="Search Help Center" type="submit"><Search /></button></form>
            <div className={styles.popular}><b>Popular searches:</b>{["Subscribe","Digital Reader","Personal Magazine","Events","Newsletter"].map(item=><Link href={`/search?q=${encodeURIComponent(item)}`} key={item}>{item}</Link>)}</div>
          </div>
        </section>

        <section className={styles.topics}><header><p>Browse help topics</p><h2>Find the right answer faster</h2></header><div>{topics.map(topic=><TopicCard key={topic.title} topic={topic}/>)}</div></section>

        <section className={styles.questionsGuides}>
          <article className={styles.questions} id="popular-questions"><header><p>Popular questions</p><Link href="/search?q=faq">View all FAQs <ArrowRight/></Link></header>{questions.map(([question,answer])=><details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</article>
          <article className={styles.guides}><header><p>Helpful guides</p><Link href="/search?q=guide">View all guides <ArrowRight/></Link></header><div>{guides.map(guide=><Link href={guide.href} key={guide.title}><span><Image alt="" fill sizes="240px" src={guide.image}/></span><h3>{guide.title}</h3><p>{guide.description}</p><small><Clock3/> {guide.time}</small></Link>)}</div></article>
        </section>

        <section className={styles.supportResponse}>
          <article><p>Still need help?</p><h2>Our support team is here for you.</h2><div>
            <section><MessageCircle/><div><b>Live chat</b><span>Chat with our team in real time.<br/>Mon–Fri, 9:30 AM–6:30 PM</span></div><Link href="/contact?type=support">Start chat</Link></section>
            <section><Mail/><div><b>Email support</b><span>Send us an email and we’ll get back within 24 hours.</span></div><a href="mailto:hello@theperspective.com">Email us</a></section>
            <section><Headphones/><div><b>Call support</b><span>Speak with our team directly.<br/>Mon–Fri, 9:30 AM–6:30 PM</span></div><a href="tel:+911145678900">+91 11 4567 8900</a></section>
          </div></article>
          <aside><p>We aim to reply within</p><div><section><Mail/><b>24 Hours</b><span>Email support</span></section><section><Clock3/><b>2 Business Days</b><span>Complex enquiries</span></section><section><MessageCircle/><b>Instant</b><span>Live chat</span></section></div></aside>
        </section>

        <section className={styles.shortcuts}><b>Shortcuts</b><Link href="/contact?type=editorial"><Newspaper/><span>Contact Editorial<small>Pitch a story or editorial query</small></span></Link><Link href="/contact?type=pitch"><PenLine/><span>Submit a Story<small>Share your story ideas</small></span></Link><Link href="/contact?type=press"><BookOpen/><span>Press &amp; Media<small>Media kit and press resources</small></span></Link><Link href="/contact?type=support"><LifeBuoy/><span>Report an Issue<small>Let us know if something’s not right</small></span></Link></section>

        <section className={styles.promise}>
          <div><h2>Can’t find what you’re looking for?</h2><p>We’re here to help you personally. Our team will connect you with the right expert.</p><Link href="/contact?type=support">Contact support team <ArrowRight/></Link></div>
          <div className={styles.supportPortrait}><Image alt="A Perspective support specialist" fill sizes="280px" src="/images/home/elena-rossi-cutout.png"/></div>
          <div><h3>The Perspective Promise</h3><ul><li>Expert support from real people</li><li>Respectful, reliable and timely assistance</li><li>Your privacy and data are always protected</li><li>Committed to your experience</li></ul></div>
          <ShieldCheck aria-hidden="true" />
        </section>

        <section className={styles.archiveBridge}><div><p>Current help discovery</p><h2>Continue into every support article, FAQ and archived answer.</h2></div><a href="#current-help-experience">Browse help results <ArrowRight/></a></section>
      </div>
    </main>
  );
}
