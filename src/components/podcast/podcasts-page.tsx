import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CirclePlay,
  Cpu,
  Headphones,
  HeartHandshake,
  Lightbulb,
  Mic2,
  Rocket,
  Sparkles,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import type { HomepageRedesignContent } from "@/lib/homepage-redesign";
import type { ImageAsset } from "@/types";
import styles from "./podcasts-page.module.css";

type Episode = HomepageRedesignContent["podcastEpisodes"][number];

const featuredShows = [
  { slug: "the-leadership-dialogues", title: "The Leadership Dialogues", host: "With Ananya Mehta", image: "/images/articles/elena-rossi.png" },
  { slug: "the-founder-conversations", title: "The Founder Conversations", host: "With Vikram Oberoi", image: "/images/articles/marcus-chen.png" },
  { slug: "markets-decoded", title: "Markets Decoded", host: "With Raghav Bahl", image: "/images/articles/arjun-mehta.png" },
  { slug: "tech-frontiers", title: "Tech Frontiers", host: "With Devina Mehta", image: "/images/articles/future-leader.png" },
  { slug: "women-who-lead", title: "Women Who Lead", host: "With Nandini K.", image: "/images/articles/global-leadership.png" },
];

const episodeEditorial = [
  { title: "Building India’s Global Tech Future", guest: "Naveen Malhotra", role: "Co-founder & Chairman, Infinitas", date: "May 10, 2026" },
  { title: "The AI Advantage: Leading in the New Era", guest: "Falguni Nayar", role: "Founder & CEO, Nykaa", date: "May 08, 2026" },
  { title: "The Future of Capital and Investments", guest: "Rakesh Jhunjhunwala", role: "Chairman, Rare Enterprises", date: "May 06, 2026" },
  { title: "From Campus to Category Leader", guest: "Sridhar Vembu", role: "Founder & CEO, Zoho", date: "May 03, 2026" },
  { title: "Designing for Impact at Scale", guest: "Kirthiga Reddy", role: "Partner, SoftBank", date: "April 29, 2026" },
];

const topics = [
  ["Leadership", UsersRound], ["Business & Markets", TrendingUp], ["Technology & AI", Cpu],
  ["Startups", Rocket], ["Economy", Building2], ["Innovation", Lightbulb],
  ["Women Leaders", Sparkles], ["Policy & Impact", BriefcaseBusiness], ["Life & Mindset", HeartHandshake],
] as const;

const collections = [
  { title: "India @ 2047", description: "Conversations on India’s path to a $30 trillion economy", episodes: 12, image: "/images/articles/global-growth.png" },
  { title: "AI & The Future", description: "Exploring the impact of AI on business, society and humanity", episodes: 18, image: "/images/articles/ai-infrastructure.png" },
  { title: "Founder Stories", description: "Raw. Real. Relatable. Journeys of iconic founders", episodes: 24, image: "/images/articles/computing-infrastructure.png" },
  { title: "Sustainable Tomorrow", description: "Leaders on building a better, greener world", episodes: 15, image: "/images/articles/global-leadership.png" },
  { title: "Women Who Lead", description: "Inspiring conversations with women breaking barriers", episodes: 20, image: "/images/articles/future-leader.png" },
];

const hosts = [
  { name: "Ananya Mehta", image: "/images/articles/elena-rossi.png" },
  { name: "Vikram Oberoi", image: "/images/articles/marcus-chen.png" },
  { name: "Raghav Bahl", image: "/images/articles/arjun-mehta.png" },
  { name: "Devina Mehta", image: "/images/articles/future-leader.png" },
  { name: "Nandini K.", image: "/images/articles/global-leadership.png" },
  { name: "Arjun Desai", image: "/images/articles/daniel-kim.png" },
];

const upcoming = [
  { date: "May 14, 2026", name: "Harsh Mariwala", role: "Chairman, Marico", image: "/images/articles/arjun-mehta.png" },
  { date: "May 16, 2026", name: "Ghazal Alagh", role: "Co-founder, Mamaearth", image: "/images/articles/elena-rossi.png" },
  { date: "May 19, 2026", name: "Jay Chaudhry", role: "Founder, Zscaler", image: "/images/articles/marcus-chen.png" },
  { date: "May 21, 2026", name: "Naina Lal Kidwai", role: "Chairperson, Rothschild India", image: "/images/articles/global-leadership.png" },
];

function articleHref(episode: Episode) {
  return `/article/${episode.article.slug}`;
}

function CoverImage({ image, alt, sizes, priority = false, position = "center" }: { image?: ImageAsset | string; alt?: string; sizes: string; priority?: boolean; position?: string }) {
  const src = typeof image === "string" ? image : image?.src;
  const imageAlt = alt ?? (typeof image === "string" ? "The Perspective podcast artwork" : image?.alt ?? "The Perspective podcast artwork");
  if (!src) return <span aria-hidden="true" className={styles.imageFallback}><Mic2 /></span>;
  return <Image alt={imageAlt} fill priority={priority} sizes={sizes} src={src} style={{ objectPosition: position }} />;
}

function SectionHeader({ title, href, action }: { title: string; href: string; action: string }) {
  return <header className={styles.sectionHeader}><h2>{title}</h2><Link href={href}>{action}<ArrowRight aria-hidden="true" /></Link></header>;
}

function BreakingStrip({ stories }: { stories: HomepageRedesignContent["breaking"] }) {
  return <aside aria-label="Breaking news" className={styles.breaking}><div className={styles.shell}>
    <strong>Breaking</strong>
    <div className={styles.ticker}>{stories.map((story) => <Link href={`/article/${story.slug}`} key={story.id}>{story.title}</Link>)}</div>
    <span><i />Live</span>
  </div></aside>;
}

function PodcastHero() {
  return <section aria-labelledby="podcast-hero-heading" className={styles.hero}>
    <div className={`${styles.shell} ${styles.heroGrid}`}>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>The Perspective Podcasts</p>
        <h1 id="podcast-hero-heading">Conversations That<br />Shape What Comes Next</h1>
        <p className={styles.deck}>In-depth conversations with world leaders, innovators, founders and change makers.</p>
        <div className={styles.latestHeroEpisode}>
          <span className={styles.miniPortrait}><Image alt="Naveen Malhotra" fill sizes="48px" src="/images/articles/marcus-chen.png" /></span>
          <div><small>Latest episode</small><b>Building India’s Global Tech Future with Naveen Malhotra</b><p>Co-founder & Chairman, Infinitas</p><span><CirclePlay aria-hidden="true" />48 min <i /> May 10, 2026</span></div>
        </div>
        <div className={styles.heroActions}><Link className={styles.primaryButton} href="/article/human-purpose-ai-world"><CirclePlay aria-hidden="true" />Play episode</Link><Link className={styles.secondaryButton} href="#latest-episodes">View all episodes</Link></div>
      </div>
      <div className={styles.heroPortrait}>
        <Image alt="Naveen Malhotra in conversation at The Perspective podcast studio" fill priority sizes="(max-width: 767px) 88vw, (max-width: 1100px) 46vw, 550px" src="/images/podcasts/naveen-malhotra-hero-final.png" />
        <div aria-hidden="true" className={styles.soundwave}>{Array.from({ length: 42 }, (_, index) => <i key={index} style={{ height: `${18 + ((index * 17) % 62)}%` }} />)}</div>
      </div>
      <aside className={styles.conversation}>
        <h2>In this conversation</h2>
        <ul><li><Headphones />The next decade of technology in India</li><li><Headphones />Building for a billion users: lessons from Infosys</li><li><Headphones />AI, talent, and the future of work</li><li><Headphones />Advice for young entrepreneurs</li></ul>
        <Link href="/article/human-purpose-ai-world">Listen now<ArrowRight aria-hidden="true" /></Link>
      </aside>
    </div>
  </section>;
}

function FeaturedShows() {
  return <section className={styles.section}><div className={styles.shell}><SectionHeader action="View all shows" href="#podcast-archive" title="Featured shows" />
    <div className={styles.showScroller}>{featuredShows.map((show) => <Link className={styles.showCard} href={`/podcasts/${show.slug}`} key={show.title}>
      <CoverImage alt={`${show.title} podcast cover`} image={show.image} sizes="280px" />
      <span aria-hidden="true" className={styles.imageShade} />
      <div><h3>{show.title}</h3><p>{show.host}</p></div>
    </Link>)}</div>
  </div></section>;
}

function LatestEpisodes({ episodes }: { episodes: Episode[] }) {
  return <section className={styles.section} id="latest-episodes"><div className={styles.shell}><SectionHeader action="View all episodes" href="#podcast-archive" title="Latest episodes" />
    <div className={styles.episodeGrid}>{episodes.slice(0, 5).map((episode, index) => {
      const editorial = episodeEditorial[index] ?? episodeEditorial[0];
      return <article className={styles.episodeCard} key={episode.id}>
        <Link className={styles.episodeImage} href={articleHref(episode)}><CoverImage image={episode.article.heroImage} sizes="(max-width: 700px) 88vw, (max-width: 1100px) 33vw, 260px" /><span className={styles.playBadge}><CirclePlay aria-hidden="true" /></span><strong>{episode.duration}</strong></Link>
        <div className={styles.episodeBody}><time>{editorial.date}</time><h3><Link href={articleHref(episode)}>{editorial.title}</Link></h3><b>{editorial.guest}</b><p>{editorial.role}</p><footer><Link href={articleHref(episode)}><CirclePlay aria-hidden="true" />Play episode</Link><button aria-label={`Save ${editorial.title}`} type="button"><Bookmark aria-hidden="true" /></button></footer></div>
      </article>;
    })}</div>
  </div></section>;
}

function Topics() {
  return <section className={styles.section}><div className={styles.shell}><SectionHeader action="Explore all" href="/search?q=podcast" title="Browse podcasts by topic" />
    <div className={styles.topicGrid}>{topics.map(([title, Icon]) => <Link href={`/search?q=${encodeURIComponent(title)}+podcast`} key={title}><Icon aria-hidden="true" /><span>{title}</span></Link>)}</div>
  </div></section>;
}

function Collections() {
  return <section className={styles.section}><div className={styles.shell}><SectionHeader action="View all collections" href="/search?q=podcast+collection" title="Curated collections" />
    <div className={styles.collectionGrid}>{collections.map((collection) => <article className={styles.collectionCard} key={collection.title}><Link className={styles.collectionImage} href="/search?q=podcast"><CoverImage alt={collection.title} image={collection.image} sizes="(max-width: 700px) 88vw, (max-width: 1100px) 33vw, 260px" /></Link><div><h3><Link href="/search?q=podcast">{collection.title}</Link></h3><p>{collection.description}</p><b>{collection.episodes} episodes</b></div></article>)}</div>
  </div></section>;
}

function PodcastDiscovery({ episodes }: { episodes: Episode[] }) {
  return <section className={styles.section}><div className={`${styles.shell} ${styles.discoveryGrid}`}>
    <section className={styles.popular}><SectionHeader action="View all" href="#podcast-archive" title="Most popular episodes" /><ol>{episodes.slice(0, 5).map((episode, index) => <li key={episode.id}><span>{String(index + 1).padStart(2, "0")}</span><Link className={styles.popularImage} href={articleHref(episode)}><CoverImage image={episode.article.heroImage} sizes="72px" /></Link><div><Link href={articleHref(episode)}>{episode.article.title}</Link><small>{episode.article.authors[0]?.name ?? "The Perspective"}</small></div><em><CirclePlay />{125 - index * 13}K plays</em></li>)}</ol></section>
    <section className={styles.hosts}><SectionHeader action="View all hosts" href="/search?type=contributors" title="Our hosts" /><div>{hosts.map((host) => <Link href="/search?type=contributors" key={host.name}><span><CoverImage alt={host.name} image={host.image} sizes="120px" /></span><b>{host.name}</b></Link>)}</div></section>
    <aside className={styles.guestCard}><p>Share your story</p><h2>Be a Guest on<br />The Perspective</h2><span>Your insights can inspire millions. Join thought-provoking conversations with leaders and changemakers.</span><Link href="/search?q=podcast+guest">Apply to be a guest<ArrowRight aria-hidden="true" /></Link><Mic2 aria-hidden="true" /></aside>
  </div></section>;
}

function UpcomingEpisodes() {
  return <section className={styles.section}><div className={`${styles.shell} ${styles.upcoming}`}><div className={styles.upcomingLabel}><CalendarDays /><span><b>Upcoming episodes</b><small>New conversations, every week</small></span></div><div className={styles.upcomingList}>{upcoming.map((item) => <article key={item.name}><span><CoverImage alt={item.name} image={item.image} sizes="64px" /></span><div><time>{item.date}</time><b>{item.name}</b><small>{item.role}</small></div></article>)}</div><Link href="/search?q=podcast+schedule">View full schedule<ArrowRight /></Link></div></section>;
}

function PodcastNewsletter() {
  return <section className={styles.section}><div className={`${styles.shell} ${styles.newsletter}`}><div><p>Podcast briefing</p><h2>Never Miss an Episode</h2><span>Subscribe to our Podcast Briefing and get the best conversations, insights and ideas delivered every week.</span></div><div className={styles.newsletterForm}><NewsletterForm buttonLabel="Subscribe" label="Weekly podcast briefing" theme="light" /></div><div className={styles.newsletterArt}><Headphones /><Mic2 /></div></div></section>;
}

function ExistingPodcastArchive({ episodes }: { episodes: Episode[] }) {
  return <section aria-labelledby="podcast-archive-title" className={`${styles.section} ${styles.archive}`} id="podcast-archive"><div className={styles.shell}>
    <header className={styles.archiveIntro}><p className={styles.eyebrow}>The existing collection</p><h2 id="podcast-archive-title">The complete podcast archive</h2><p>Continue exploring every show and episode already available from The Perspective.</p></header>
    <div className={styles.archiveGrid}>{episodes.map((episode) => <article key={episode.id}><Link className={styles.archiveImage} href={articleHref(episode)}><CoverImage image={episode.article.heroImage} sizes="(max-width: 700px) 88vw, (max-width: 1100px) 40vw, 300px" /><span><CirclePlay />{episode.duration}</span></Link><p>{episode.episode}</p><h3><Link href={articleHref(episode)}>{episode.series}</Link></h3><b>{episode.article.title}</b><small>With {episode.article.authors[0]?.name ?? "The Perspective"}</small></article>)}</div>
  </div></section>;
}

export function PodcastsPage({ content, includeBreaking = true }: { content: HomepageRedesignContent; includeBreaking?: boolean }) {
  return <div className={styles.page}>
    {includeBreaking && <BreakingStrip stories={content.breaking} />}
    <PodcastHero />
    <FeaturedShows />
    <LatestEpisodes episodes={content.podcastEpisodes} />
    <Topics />
    <Collections />
    <PodcastDiscovery episodes={content.podcastEpisodes} />
    <UpcomingEpisodes />
    <PodcastNewsletter />
    <ExistingPodcastArchive episodes={content.podcastEpisodes} />
  </div>;
}
