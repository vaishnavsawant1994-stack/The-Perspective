"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Accessibility,
  ArrowRight,
  Bell,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Download,
  FileText,
  Globe2,
  Headphones,
  HeartHandshake,
  Landmark,
  LockKeyhole,
  Mail,
  MessageCircleWarning,
  Newspaper,
  PenLine,
  PlayCircle,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  Video,
  Wrench,
} from "lucide-react";
import styles from "./utility-pages.module.css";

const stories = [
  { category: "Business", title: "India’s Manufacturing Momentum: The Next Global Shift", image: "/images/articles/global-growth.png", href: "/article/companies-growth-cycle" },
  { category: "Technology", title: "AI Infrastructure Race: The Next Trillion Dollar Layer", image: "/images/articles/ai-infrastructure.png", href: "/article/ai-infrastructure-race" },
  { category: "Leadership", title: "The New Rules of Leadership in an Uncertain World", image: "/images/articles/board-governance.png", href: "/article/new-executive-mandate" },
] as const;

const ranked = [
  "The Architects of Tomorrow: Building for a Better World",
  "Capital-Efficient Startups Are Winning in a Tough Market",
  "Engineering What Comes Next Requires Patience",
  "Global Outlook 2026: Risks, Realignments, Opportunities",
  "The Human Side of AI: Trust, Ethics and the Future",
];

function SearchBox({ compact = false }: { compact?: boolean }) {
  return <form action="/search" className={compact ? styles.searchCompact : styles.searchBox} role="search"><Search aria-hidden="true" /><label className="sr-only" htmlFor={compact ? "utility-search-small" : "utility-search"}>Search The Perspective</label><input id={compact ? "utility-search-small" : "utility-search"} name="q" placeholder="Search news, articles, authors, topics and more…" /><button aria-label="Search" type="submit"><Search aria-hidden="true" /></button></form>;
}

function StoryList() {
  return <div className={styles.storyList}>{stories.map((story) => <Link href={story.href} key={story.title}><Image alt="" height={68} src={story.image} width={104} /><span><b>{story.category}</b><strong>{story.title}</strong><small>10 min read</small></span></Link>)}</div>;
}

function RankedList() {
  return <ol className={styles.rankedList}>{ranked.map((item, index) => <li key={item}><span>{index + 1}</span><Link href="/latest">{item}</Link></li>)}</ol>;
}

export function ErrorStatePage({ kind = "404", onRetry }: { kind?: "404" | "500"; onRetry?: () => void }) {
  const missing = kind === "404";
  return <div className={styles.page} data-utility-page>
    <section className={styles.errorHero} style={{ "--hero-image": "url('/images/utility/error-editorial-hero.png')" } as React.CSSProperties}>
      <div className={styles.errorCopy}>
        <p className={styles.errorCode}>{kind.slice(0, 1)}<em>{kind.slice(1, 2)}</em>{kind.slice(2)}</p>
        <h1>{missing ? "This Story Has Gone Missing." : "Something Went Wrong."}</h1>
        <p>{missing ? "The page you’re looking for may have moved, expired, or never existed. Let’s help you find something worth reading." : "We hit an unexpected problem while loading this page. Our team has been notified and is working on it. Your account and saved content are safe."}</p>
        <div className={styles.buttonRow}>{missing ? <Link className={styles.primaryButton} href="/">Go to Homepage <ArrowRight /></Link> : <button className={styles.primaryButton} onClick={onRetry ?? (() => window.location.reload())} type="button">Try Again <RefreshCw /></button>}<Link className={styles.secondaryButton} href={missing ? "/search" : "/"}>{missing ? "Search The Perspective" : "Go to Homepage"} <ArrowRight /></Link></div>
        <Link className={styles.textLink} href="/latest">Browse Latest Stories <ArrowRight /></Link>
      </div>
    </section>

    <div className={styles.errorBody}>
      <section className={styles.recoveryStrip}>
        {missing ? <><div><h2>Search The Perspective</h2><SearchBox compact /></div><div className={styles.quickLinks}><h2>Quick Links</h2><nav>{[[Newspaper,"Latest News","/latest"],[BookOpen,"Magazine","/magazine"],[FileText,"Digital Reader","/magazine/read/august-2026"],[Headphones,"Podcasts","/podcasts"],[Video,"Videos","/videos"],[UserRound,"Authors","/authors"],[BriefcaseBusiness,"Events & Summits","/events"]].map(([Icon,label,href]) => <Link href={String(href)} key={String(label)}><Icon aria-hidden="true" />{String(label)}</Link>)}</nav></div></> : <><article><ShieldCheck /><div><h2>Your Data is Safe</h2><p>This is a temporary issue on our side. Your account, subscriptions and saved content are completely safe.</p></div></article><article><Clock3 /><div><h2>We’re On It</h2><p>Our technical team has been notified and is working hard to restore the page.</p></div></article><div><h2>Search The Perspective</h2><SearchBox compact /></div><article><Headphones /><div><h2>Need Assistance?</h2><p>Visit our Help Center or contact support.</p><Link href="/help">Visit Help Center <ArrowRight /></Link></div></article></>}
      </section>

      <section className={styles.discoveryGrid}>
        <article><h2>{missing ? "You Might Like" : "Top Stories Right Now"}</h2><StoryList /><Link className={styles.textLink} href="/latest">View All Latest News <ArrowRight /></Link></article>
        <article><h2>Most Read This Week</h2><RankedList /><Link className={styles.textLink} href="/latest">Explore More Articles <ArrowRight /></Link></article>
        <article><h2>{missing ? "Popular Topics" : "Explore More"}</h2>{missing ? <div className={styles.topicCloud}>{["Business","Technology","Leadership","Economy","Innovation","Startups","AI & Data","Markets","Policy","Sustainability","Global Affairs","Healthcare"].map((topic) => <Link href={`/search?q=${encodeURIComponent(topic)}`} key={topic}>{topic}</Link>)}</div> : <nav className={styles.exploreList}>{[[BookOpen,"Magazine","/magazine"],[FileText,"Digital Reader","/magazine/read/august-2026"],[Headphones,"Podcasts","/podcasts"],[PlayCircle,"Videos","/videos"],[UserRound,"Authors","/authors"]].map(([Icon,label,href]) => <Link href={String(href)} key={String(label)}><Icon /> <span><strong>{String(label)}</strong><small>Explore more from The Perspective</small></span></Link>)}</nav>}<Link className={styles.textLink} href="/search">Explore All Sections <ArrowRight /></Link></article>
        <article className={styles.magazineCard}><h2>{missing ? "Magazine & Archive" : "Editor’s Pick"}</h2><Image alt="The Perspective magazine issue" height={230} src="/images/articles/global-leadership.png" width={360} /><strong>The Architects of Tomorrow</strong><p>May 2026 · Volume 18 · Issue 05</p><Link className={styles.secondaryButton} href="/magazine">Explore Magazine <ArrowRight /></Link></article>
      </section>
      <section className={styles.supportStrip}><Headphones /><div><strong>Still can’t find what you’re looking for?</strong><span>Our support team is here to help you.</span></div><Link className={styles.secondaryButton} href="/help">Visit Help Center <ArrowRight /></Link></section>
    </div>
  </div>;
}

export function MaintenancePage() {
  return <div className={styles.page} data-utility-page>
    <section className={styles.maintenanceHero} style={{ "--hero-image": "url('/images/utility/maintenance-editorial-hero.png')" } as React.CSSProperties}>
      <div><p className={styles.eyebrow}>We’ll be back shortly</p><h1>The Perspective Is Taking<br />a Brief Editorial Pause.</h1><p>We’re performing scheduled maintenance to improve performance, reliability and your reading experience. Your account, saved stories, subscriptions and preferences remain safe.</p><div className={styles.maintenanceStatus}><article><strong>Scheduled Maintenance</strong><span>August 13, 2026</span><small>11:30 PM – 12:30 AM IST</small></article><article><strong>Estimated Downtime</strong><b>60 <small>Minutes</small></b><span>We appreciate your patience.</span></article></div><div className={styles.buttonRow}><button className={styles.primaryButton} type="button"><Bell /> Notify Me When We’re Back</button><Link className={styles.secondaryButton} href="/help">Check Live Status <ArrowRight /></Link></div><p className={styles.urgent}>Need urgent help? <Link href="/help">Contact Support <ArrowRight /></Link></p></div>
    </section>
    <div className={styles.errorBody}>
      <section className={styles.maintenanceCards}><article><Wrench /><div><h2>Maintenance Status</h2><strong>Scheduled Maintenance</strong><p>Everything is on track.</p><Link href="/help">Check Live Status <ArrowRight /></Link></div></article><article><h2>What We’re Improving</h2>{["Faster page loads & better performance","Enhanced security & reliability","Improved personalization features","Better digital reading experience"].map((item) => <p key={item}><CheckCircle2 />{item}</p>)}</article><article><ShieldCheck /><div><h2>Your Data Is Safe</h2><p>Your data, subscriptions and saved content are completely safe and secure. No action is needed.</p></div></article><article><h2>Stay Updated</h2><p>Get notified as soon as we’re back online.</p><form action="/newsletter"><input aria-label="Email address" placeholder="Enter your email address" type="email" /><button type="submit">Notify Me</button></form><label><input type="checkbox" /> I agree to receive updates.</label></article></section>
      <section className={styles.maintenanceBottom}><article><h2>Latest Update</h2><b>August 13, 2026, 11:42 PM IST</b><p>Database optimization and system upgrades are proceeding on schedule. All services will resume within the published maintenance window.</p><Link href="/help">View All Updates <ArrowRight /></Link></article><article><h2>Frequently Asked Questions</h2>{["Why is The Perspective unavailable?","Will I lose my data or saved content?","When will maintenance be completed?","How can I get updates?"].map((q) => <details key={q}><summary>{q}</summary><p>This is planned work. Your data and access remain secure.</p></details>)}</article><article><h2>Still Need Help?</h2><p><CircleHelp /> Visit Help Center</p><p><Mail /> support@theperspective.com</p><p><Headphones /> +91 22 6950 2050</p></article></section>
    </div>
  </div>;
}

type LegalKind = "privacy" | "terms" | "cookies" | "editorial" | "accessibility" | "community";

const legalData: Record<LegalKind, {
  eyebrow: string; title: string; description: string; updated: string; hero: string; actions: string[]; sections: string[]; glanceTitle: string; glance: { title: string; text: string }[];
}> = {
  privacy: { eyebrow: "Legal & Privacy", title: "Privacy Policy", description: "Your trust matters. This page explains what information The Perspective collects, how we use it, and the choices you have regarding your personal data.", updated: "Effective August 12, 2026", hero: "/images/utility/legal-editorial-hero.png", actions: ["Manage Privacy Settings","Cookie Preferences","Download Your Data"], glanceTitle: "Privacy at a Glance", glance: [{title:"Your Data Is Yours",text:"You own your data. We give you transparency and control."},{title:"We Use Data With Purpose",text:"To personalize your experience and improve our services."},{title:"We Don’t Sell Personal Data",text:"We do not sell your personal information to anyone."},{title:"You Stay in Control",text:"Access, update, export or delete your data anytime."}], sections: ["At a Glance","Information We Collect","How We Use Information","Cookies & Technologies","Account & Profile Data","Subscriptions & Payments","Newsletters & Communications","Saved Articles & Activity","Personalization","Event Registrations","Personal Magazine Enquiries","Contact & Support Data","Third-Party Services","Data Sharing & Disclosure","Data Retention","Security Practices","International Transfers","Children’s Privacy","Your Rights & Choices","Policy Updates","Contact Us"] },
  terms: { eyebrow: "Legal & Policies", title: "Terms of Use", description: "These terms explain the rules for using The Perspective, our editorial products, member services, magazines, events and digital experiences.", updated: "Effective August 12, 2026", hero: "/images/utility/legal-editorial-hero.png", actions: ["Download Terms (PDF)","Privacy Policy","Contact Legal Team"], glanceTitle: "Terms at a Glance", glance: [{title:"Use Responsibly",text:"Use the platform lawfully and respect other users."},{title:"Your Account",text:"You are responsible for account security and activity."},{title:"Content Is Protected",text:"Our journalism and designs are protected intellectual property."},{title:"Clear Subscription Terms",text:"Billing, renewals and refunds are clearly explained."}], sections: ["At a Glance","Eligibility & Account Requirements","Account Responsibilities","Subscriptions & Memberships","Payments, Renewal & Cancellation","Access & Use of Content","Digital Magazine & Reader","Personal Magazine Services","User Submissions","Intellectual Property","Permitted Use & Sharing","Prohibited Conduct","Third-Party Links & Services","Disclaimers","Limitation of Liability","Indemnification","Termination & Suspension","Governing Law & Jurisdiction","Dispute Resolution","Changes to These Terms","Contact Information"] },
  cookies: { eyebrow: "Legal & Privacy", title: "Cookie Policy", description: "This policy explains how The Perspective uses cookies and similar technologies to keep the site working, remember preferences, understand usage and personalize your experience.", updated: "Effective August 12, 2026", hero: "/images/utility/legal-editorial-hero.png", actions: ["Manage Cookie Preferences","Privacy Policy","Download Cookie Policy"], glanceTitle: "Cookies at a Glance", glance: [{title:"Essential",text:"Required for login, security and core site functionality."},{title:"Preferences",text:"Remember language, layout and reading settings."},{title:"Analytics",text:"Help us understand how readers use the site."},{title:"Personalization",text:"Personalize content, recommendations and experiences."}], sections: ["What Are Cookies","Why We Use Cookies","Cookies at a Glance","Essential Cookies","Functional Cookies","Analytics Cookies","Personalization Cookies","Advertising & Partner Cookies","Third-Party Cookies","Session vs Persistent Cookies","Browser & Device Identifiers","Your Consent & Choices","How to Manage Preferences","Browser Controls","Impact of Disabling Cookies","Cookie Retention","Third-Party Services We Use","Do Not Track Signals","Changes to This Policy","Contact Us"] },
  editorial: { eyebrow: "Trust & Editorial Standards", title: "Journalism Built on Accuracy, Independence and Accountability.", description: "The Perspective is committed to rigorous reporting, transparent editorial practices and a clear separation between journalism, opinion and commercial content.", updated: "Last updated August 12, 2026", hero: "/images/utility/legal-editorial-hero.png", actions: ["Submit a Correction","Contact Editorial Standards","Download Standards (PDF)"], glanceTitle: "Our Principles at a Glance", glance: [{title:"Accuracy First",text:"Verify before publishing and correct clearly when necessary."},{title:"Editorial Independence",text:"Commercial relationships never determine conclusions."},{title:"Transparent Sourcing",text:"Readers should understand where information comes from."},{title:"Clear Labels",text:"News, analysis, opinion and sponsored content are distinct."}], sections: ["Our Principles at a Glance","Accuracy & Verification","Sourcing Standards","Anonymous Sources","Fact-Checking Process","Corrections & Updates","Editorial Independence","Conflicts of Interest","Sponsored & Branded Content","Opinion vs. Reporting","AI & Editorial Integrity","Interviews & Quotations","Photography & Images","User Submissions","Plagiarism Policy","Attribution & Copyright","Diversity of Perspectives","Sensitive Topics","Public-Interest Reporting","Complaints & Corrections","Contact Our Team"] },
  accessibility: { eyebrow: "Accessibility", title: "The Perspective Should Be Accessible to Everyone.", description: "We are committed to creating an inclusive reading experience across our website, magazines, podcasts, videos, events and member services.", updated: "Last updated August 12, 2026", hero: "/images/utility/accessibility-sitemap-hero.png", actions: ["Report an Accessibility Issue","Contact Accessibility Team","Download Statement (PDF)"], glanceTitle: "Accessibility at a Glance", glance: [{title:"Keyboard Friendly",text:"Navigate core experiences without a mouse."},{title:"Screen Reader Ready",text:"Semantic landmarks, headings and meaningful labels."},{title:"Readable by Design",text:"Strong contrast, scalable type and controlled line lengths."},{title:"Multimedia Access",text:"Captions, transcripts and text alternatives."}], sections: ["Our Commitment","Standards & Conformance","Keyboard Navigation","Screen Reader Support","Semantic Structure","Focus Indicators","Text Size & Zoom","Color & Contrast","Reduced Motion","Images & Alt Text","Forms & Validation","Video Accessibility","Podcast Transcripts","Article Reader","Magazine Reader (Text View)","Accessible Newsletters","Events Accessibility","Mobile Accessibility","Third-Party Content","Known Limitations","Ongoing Improvements","Alternative Formats","Reporting Accessibility Issues","Response Commitment","Contact Us"] },
  community: { eyebrow: "Community & Conduct", title: "Better Conversations Start With Respect.", description: "The Perspective brings together readers, leaders, contributors and experts from different industries and viewpoints. These guidelines help keep that community thoughtful, constructive and safe.", updated: "Last updated August 12, 2026", hero: "/images/utility/legal-editorial-hero.png", actions: ["Report a Concern","Contact Community Team","View Editorial Standards"], glanceTitle: "Our Community Principles", glance: [{title:"Respect People",text:"Challenge ideas without attacking individuals."},{title:"Contribute With Purpose",text:"Keep discussion relevant, useful and constructive."},{title:"Be Authentic",text:"Do not impersonate others or misrepresent identity."},{title:"Protect Privacy",text:"Never share another person’s private information."}], sections: ["Our Community Principles","Respectful Participation","Constructive Discussion","Harassment & Bullying","Hate Speech & Discrimination","Threats & Violence","Misinformation & Impersonation","Spam & Manipulation","Self-Promotion","Intellectual Property","Privacy & Personal Information","User Submissions","Comments & Discussions","Contributor Behavior","Event & Community Conduct","Reporting Violations","Moderation & Enforcement","Enforcement Actions","Appeals Process","Protecting Vulnerable Users","Commercial Participation","Contact Community Team"] },
};

const glanceIcons = [ShieldCheck, Settings2, LockKeyhole, UserRound];

function legalHref(label: string) {
  const links: Record<string,string> = { "Privacy Policy":"/privacy", "Cookie Preferences":"/cookies", "View Editorial Standards":"/editorial-standards" };
  return links[label] ?? "/help";
}

export function LegalPage({ kind }: { kind: LegalKind }) {
  const data = legalData[kind];
  const isCookie = kind === "cookies";
  const isEditorial = kind === "editorial";
  const isCommunity = kind === "community";
  return <div className={styles.page} data-utility-page>
    <section className={styles.legalHero} style={{ "--hero-image": `url('${data.hero}')` } as React.CSSProperties}><div><nav aria-label="Breadcrumb"><Link href="/">Home</Link><span>›</span><Link href="/about">{isEditorial || kind === "accessibility" || isCommunity ? "About Us" : "Legal & Policies"}</Link><span>›</span><b>{data.title}</b></nav><p className={styles.eyebrow}>{data.eyebrow}</p><h1>{data.title}</h1><p>{data.description}</p><time>{data.updated}</time><div className={styles.heroActions}>{data.actions.map((action,index) => <Link className={index === 0 && (isEditorial || kind === "accessibility" || isCommunity) ? styles.primaryButton : styles.actionCard} href={legalHref(action)} key={action}>{index === 0 ? <Settings2 /> : index === 1 ? <ShieldCheck /> : <Download />}<span><strong>{action}</strong>{index !== 0 && <small>Open this resource</small>}</span><ArrowRight /></Link>)}</div></div></section>
    <div className={styles.legalLayout}>
      <aside className={styles.toc}><h2>Table of Contents</h2><ol>{data.sections.map((section,index) => <li className={index === 0 ? styles.activeToc : ""} key={section}><a href={`#section-${index + 1}`}><span>{index + 1}.</span>{section}</a></li>)}</ol><Link className={styles.downloadCard} href="/help"><Download /><span><strong>Download {isCommunity ? "Guidelines" : "Policy"} (PDF)</strong><small>PDF, 212 KB</small></span></Link></aside>
      <main className={styles.legalContent}>
        <section id="section-1"><h2>{data.glanceTitle}</h2><p>Key principles and practical guidance from The Perspective.</p><div className={styles.glanceGrid}>{data.glance.map((item,index) => { const Icon = glanceIcons[index]; return <article key={item.title}><Icon /><h3>{item.title}</h3><p>{item.text}</p></article>; })}</div><div className={styles.notice}><ShieldCheck />We are committed to transparency, clarity and protecting our readers at every step.</div></section>
        {data.sections.slice(1).map((section,index) => <details className={styles.policySection} id={`section-${index + 2}`} key={section} open={index === 0}><summary><span>{index + 2}.</span>{section}</summary><div><p>{policyParagraph(kind, section)}</p>{index === 0 && <ul><li>We use clear, proportionate practices that respect readers.</li><li>We collect or act only where there is a defined editorial or service purpose.</li><li>You can contact our team to ask questions or exercise available choices.</li></ul>}</div></details>)}
      </main>
      <aside className={styles.legalRail}>
        {isCookie ? <section><h2>Your Current Preferences</h2>{["Essential Cookies","Functional Cookies","Analytics Cookies","Personalization Cookies","Advertising Cookies"].map((item,index) => <div className={styles.preference} key={item}><span>{item}</span><b className={index === 4 ? styles.off : ""}>{index === 0 ? "Always Active" : index === 4 ? "Off" : "On"}</b></div>)}<button className={styles.primaryButton} type="button">Change Preferences</button></section> : isEditorial ? <section><h2>AI & Editorial Integrity</h2><div className={styles.aiBadge}>AI</div><p>AI tools may assist with limited research, transcription, translation or production workflows. Editorial judgment and final publication decisions are always made by human editors.</p><Link className={styles.secondaryButton} href="/editorial-standards">Read Our AI Policy <ArrowRight /></Link></section> : isCommunity ? <section><h2>Report a Community Issue</h2><p>Help us keep The Perspective community safe and constructive.</p>{["Harassment or Abuse","Spam or Scams","Impersonation","Dangerous Content","Privacy Violation","Other Concern"].map((item) => <Link className={styles.railLink} href="/help" key={item}>{item}<ArrowRight /></Link>)}<Link className={styles.primaryButton} href="/help">Submit Report</Link></section> : <section><h2>{kind === "accessibility" ? "Need Accessibility Help?" : kind === "terms" ? "Your Rights & Choices" : "Your Privacy Controls"}</h2>{["Access Your Information","Update Your Information","Download Your Data","Delete Your Data","Manage Preferences"].map((item) => <Link className={styles.railLink} href="/my-perspective/settings" key={item}>{item}<ArrowRight /></Link>)}</section>}
        <section><h2>Need Help?</h2><p><Mail /> {kind}@theperspective.com</p><p><Headphones /> +91 22 6950 2050</p><p><Clock3 /> Response within 2 business days</p><Link className={styles.textLink} href="/help">Visit Help Center <ArrowRight /></Link></section>
        <section><h2>Related Policies</h2>{[["Privacy Policy","/privacy"],["Terms of Use","/terms"],["Cookie Policy","/cookies"],["Editorial Standards","/editorial-standards"],["Accessibility Statement","/accessibility"],["Community Guidelines","/community-guidelines"]].filter(([label]) => label !== data.title).map(([label,href]) => <Link className={styles.railLink} href={href} key={label}>{label}<ArrowRight /></Link>)}</section>
      </aside>
    </div>
    {kind === "accessibility" && <section className={styles.wcag}><Accessibility /><p>We aim to meet or exceed the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA.</p><strong>WCAG 2.1<br />Level AA</strong></section>}
    {isEditorial && <section className={styles.valuesStrip}>{[[ShieldCheck,"Rigorous Standards"],[UsersRound,"Diverse Voices"],[BookOpen,"Serve the Public Interest"],[HeartHandshake,"Earn Your Trust"]].map(([Icon,label]) => <article key={String(label)}><Icon /><div><strong>{String(label)}</strong><p>Principled, accountable and reader-first.</p></div></article>)}</section>}
  </div>;
}

function policyParagraph(kind: LegalKind, section: string) {
  const lead = kind === "editorial" ? "Our newsroom applies this standard consistently across reporting, analysis, interviews, podcasts, video and magazine publishing." : kind === "accessibility" ? "We design, test and improve this experience with a wide range of readers, devices and assistive technologies in mind." : kind === "community" ? "This standard helps protect constructive participation while leaving room for disagreement, challenge and original thought." : "This section explains how The Perspective applies this policy across our website, memberships, publications, events and reader services.";
  return `${lead} ${section} is handled with clear notice, appropriate safeguards and practical choices wherever possible. Contact our team if you need an explanation or assistance.`;
}

const sitemapGroups = [
  ["News",Newspaper,[["Latest News","/latest"],["Top Stories","/news"],["News by Category","/business"],["In-Depth Analysis","/latest#in-depth"],["Newsletters","/newsletter"]]],
  ["Business",Building2,[["Business Home","/business"],["Markets","/search?q=markets"],["Economy","/search?q=economy"],["Startups","/search?q=startups"],["Global Business","/business"]]],
  ["Leadership",UserRound,[["Leadership Home","/leadership"],["Executive Interviews","/leadership"],["Leadership Strategies","/leadership"],["Women in Leadership","/search?q=women+leaders"],["Future Leaders","/leadership"]]],
  ["Technology",Bot,[["Technology Home","/technology"],["AI & Machine Learning","/topic/artificial-intelligence"],["Cloud & Infrastructure","/technology"],["Cybersecurity","/search?q=cybersecurity"],["Enterprise Tech","/technology"]]],
  ["Topics",Sparkles,[["All Topics","/search"],["Innovation","/search?q=innovation"],["Sustainability","/search?q=sustainability"],["Health & Wellness","/search?q=health"],["Policy & Governance","/search?q=policy"]]],
  ["Articles",FileText,[["All Articles","/latest"],["Editor’s Picks","/perspective"],["Trending Articles","/search?q=trending"],["Most Read","/latest"],["Long Reads","/search?q=long+read"]]],
  ["Authors",PenLine,[["All Authors","/authors"],["Contributors","/authors"],["Guest Writers","/authors"],["Editorial Team","/authors"],["Author Archive","/authors"]]],
  ["People & Leaders",UsersRound,[["All People","/search?type=people"],["Featured Leaders","/personal-magazines"],["Entrepreneurs","/search?q=entrepreneurs"],["Investors","/search?q=investors"],["Change Makers","/search?q=change+makers"]]],
  ["Magazine",BookOpen,[["Magazine Home","/magazine"],["Current Issue","/magazine/read/august-2026"],["Past Issues","/magazine/archive"],["Magazine Categories","/magazine/category/leadership"],["Subscribe","/magazine/subscribe"]]],
  ["Magazine Reader",FileText,[["Digital Flipbook","/magazine/read/august-2026"],["Text View","/magazine/read/august-2026"],["Download Issue","/magazine/read/august-2026"],["Reader Help","/help"]]],
  ["Premium Magazine",ShieldCheck,[["Premium Home","/magazine/premium"],["Premium Issues","/magazine/premium"],["Premium Benefits","/magazine/premium"],["Subscription Plans","/magazine/subscribe"]]],
  ["Personal Magazines",UserRound,[["Personal Magazines","/personal-magazines"],["Create Your Magazine","/personal-magazines/create"],["How It Works","/personal-magazines/create"],["Featured Profiles","/personal-magazines"],["FAQ","/help"]]],
  ["Podcasts",Headphones,[["All Podcasts","/podcasts"],["Featured Shows","/podcasts"],["Latest Episodes","/podcasts"],["Podcast Archive","/podcasts"]]],
  ["Videos",PlayCircle,[["All Videos","/videos"],["Featured Videos","/videos"],["Latest Videos","/videos"],["Video Archive","/videos"]]],
  ["Blogs",PenLine,[["All Blogs","/perspective"],["Editor’s Blog","/perspective"],["Guest Blogs","/perspective"],["Popular Blogs","/perspective"]]],
  ["Events & Summits",BriefcaseBusiness,[["All Events","/events"],["Upcoming Events","/events"],["Past Events","/events"],["Summits","/events"],["Event Archive","/events"]]],
  ["Newsletters",Mail,[["Subscribe","/newsletter"],["Daily Brief","/newsletter"],["Weekly Edition","/newsletter"],["Newsletter Archive","/newsletter"]]],
  ["About",CircleHelp,[["About The Perspective","/about"],["Our Mission","/about"],["Our Team","/authors"],["Careers","/search?q=careers"],["Press & Media","/contact"]]],
  ["Contact",MessageCircleWarning,[["Contact Us","/contact"],["Send Feedback","/contact"],["Advertise With Us","/contact"],["Media Inquiries","/contact"]]],
  ["Help Center",CircleHelp,[["Help Center Home","/help"],["FAQs","/help"],["Account Help","/my-perspective/support"],["Subscription Help","/help"],["Technical Support","/my-perspective/support"]]],
  ["My Perspective",UserRound,[["Dashboard","/my-perspective"],["Saved Articles","/my-perspective/saved"],["My Magazines","/my-perspective/magazines"],["My Events","/my-perspective/events"],["Account Settings","/my-perspective/settings"]]],
  ["Account",LockKeyhole,[["Profile","/my-perspective/settings"],["Email Preferences","/my-perspective/newsletters"],["Billing & Payments","/my-perspective/billing"],["Subscription Plans","/my-perspective/subscription"],["Security","/my-perspective/settings"]]],
  ["Legal & Policies",Landmark,[["Privacy Policy","/privacy"],["Terms of Use","/terms"],["Cookie Policy","/cookies"],["Editorial Standards","/editorial-standards"],["Accessibility Statement","/accessibility"],["Community Guidelines","/community-guidelines"]]],
  ["Utility",Settings2,[["Search","/search"],["Sitemap","/sitemap"],["Help Center","/help"],["Mobile App","/search?q=app"]]],
] as const;

export function SitemapPage() {
  return <div className={styles.page} data-utility-page>
    <section className={styles.sitemapHero} style={{ "--hero-image": "url('/images/utility/accessibility-sitemap-hero.png')" } as React.CSSProperties}><div><nav aria-label="Breadcrumb"><Link href="/">Home</Link><span>›</span><Link href="/about">About Us</Link><span>›</span><b>Sitemap</b></nav><p className={styles.eyebrow}>Explore The Perspective</p><h1>Sitemap</h1><p>Find everything on The Perspective, organized to help you explore news, insights, people, magazines, podcasts, videos, events and more.</p></div></section>
    <div className={styles.sitemapBody}><div className={styles.sitemapSearch}><SearchBox /><p><b>Tip:</b> Use search to find people, topics, articles, magazines and more.</p></div><section className={styles.sitemapGrid}>{sitemapGroups.map(([title,Icon,links]) => <article key={title}><h2><Icon />{title}</h2><nav>{links.map(([label,href]) => <Link href={href} key={label}>{label}<ArrowRight /></Link>)}</nav></article>)}</section><section className={styles.supportStrip}><Globe2 /><div><strong>Still can’t find what you’re looking for?</strong><span>Our search and help center can guide you to exactly what you need.</span></div><Link className={styles.secondaryButton} href="/help">Visit Help Center</Link><Link className={styles.primaryButton} href="/contact">Contact Us</Link></section></div>
  </div>;
}
