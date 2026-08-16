import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, BriefcaseBusiness, CalendarDays, Clock3,
  Heart, Lightbulb, Mail, Mic2, Play, Radio, Share2, Sparkles, UsersRound,
} from "lucide-react";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { getPodcastEpisodeSlug, type PodcastShowContent } from "@/lib/podcast-shows";
import styles from "./podcast-show-detail.module.css";

type Episode = PodcastShowContent["episodes"][number];

const guestImages = [
  "/images/personal-magazines/arjun-mehta-hero-v3.webp",
  "/images/articles/elena-rossi.png",
  "/images/articles/daniel-kim.png",
  "/images/articles/global-leadership.png",
  "/images/articles/arjun-mehta.png",
];

const platforms = [
  ["Apple Podcasts", "◉", "#9b4de4"], ["Spotify", "●", "#1db954"], ["YouTube", "▶", "#ef2929"],
  ["Google Podcasts", "✣", "#4285f4"], ["Amazon Music", "⌁", "#1793d1"],
] as const;

function imageSrc(episode: Episode) {
  return episode.article.heroImage?.src ?? "/images/articles/global-leadership.png";
}

function episodeHref(showSlug: string, episode: Episode, index: number) {
  return `/podcasts/${showSlug}/${getPodcastEpisodeSlug(showSlug, episode.article.slug, index)}`;
}

function episodeTitle(episode: Episode, index: number) {
  const guests = ["Arjun Mehta", "Priya Iyer", "Dr. Daniel Kim", "Neha Sharma", "Rohit Bansal"];
  const endings = [
    "on Innovation, Leadership and Purpose",
    "on Culture and the Future of Organizations",
    "on Ethics, Regulation and Responsibility",
    "on Investing in an Uncertain World",
    "on People, Performance and Purpose",
  ];
  return `${guests[index] ?? episode.article.authors[0]?.name ?? "A Perspective leader"} ${endings[index] ?? "on Building What Comes Next"}`;
}

function SectionHeader({ title, href, action = "View all" }: { title: string; href: string; action?: string }) {
  return <header className={styles.sectionHeader}><h2>{title}</h2><Link href={href}>{action}<ArrowRight /></Link></header>;
}

function ShowCover({ title, tone }: { title: string; tone: string }) {
  return <div className={styles.showCover} style={{ "--cover-tone": tone } as React.CSSProperties}>
    <span>The</span><strong>Perspective</strong><small>Podcast</small>
    <div className={styles.coverRule} />
    <h2>{title}</h2><Mic2 aria-hidden="true" />
    <p>Conversations<br />that shape tomorrow.</p>
  </div>;
}

function ShowHero({ content }: { content: PodcastShowContent }) {
  const { show } = content;
  return <>
    <nav aria-label="Breadcrumb" className={styles.breadcrumb}><Link href="/">Home</Link><span>/</span><Link href="/podcasts">Podcasts</Link><span>/</span><b>{show.title}</b></nav>
    <section className={styles.hero}>
      <ShowCover title={show.title} tone={show.coverTone} />
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>The Perspective Podcast</p>
        <h1>{show.title}</h1>
        <p>{show.strapline}</p>
        <div className={styles.hosted}><span>Hosted by</span><strong>{show.host}</strong><small>{show.hostRole}</small></div>
        <div className={styles.heroMeta}><span><Radio />{show.episodes} episodes</span><span><Clock3 />{show.duration}</span><span><CalendarDays />{show.cadence}</span><span><BriefcaseBusiness />Business · Leadership</span></div>
        <div className={styles.heroActions}><Link className={styles.goldButton} href="#latest-show-episode"><Play />Play latest episode</Link><Link className={styles.darkButton} href="#all-show-episodes">Browse all episodes</Link><button type="button"><Heart />Follow show</button></div>
      </div>
      <div className={styles.heroPortrait}><Image alt={`${show.host}, host of ${show.title}`} fill priority sizes="(max-width: 860px) 90vw, 500px" src={show.heroImage} /></div>
      <aside className={styles.aboutShow}><h2>About the show</h2><ul>{show.topics.slice(0, 6).map((topic, index) => <li key={topic}>{[UsersRound, BriefcaseBusiness, Sparkles, Clock3, Lightbulb, Share2].map((Icon) => Icon)[index] && (() => { const Icon = [UsersRound, BriefcaseBusiness, Sparkles, Clock3, Lightbulb, Share2][index]; return <Icon />; })()}{topic}</li>)}</ul><p>{show.description}</p><Link href="#about-show">Show more<ArrowRight /></Link></aside>
    </section>
  </>;
}

function LatestEpisode({ episode, showSlug }: { episode: Episode; showSlug: string }) {
  const href = episodeHref(showSlug, episode, 0);
  return <section className={styles.latest} id="latest-show-episode">
    <SectionHeader action="View episode" href={href} title="Latest episode" />
    <div className={styles.latestBody}>
      <Link className={styles.latestImage} href={href}><Image alt={episode.article.heroImage?.alt ?? episode.article.title} fill sizes="320px" src={imageSrc(episode)} /><i><Play /></i></Link>
      <div><p>Episode 48</p><h2><Link href={href}>Building the Future: Arjun Mehta on Innovation, Leadership and Purpose</Link></h2><span>Arjun Mehta, Founder & CEO of NextSphere Technologies, on building AI-powered platforms, scaling globally and creating a lasting impact.</span><small><Clock3 />May 10, 2026 <i />52 min</small></div>
    </div>
  </section>;
}

function ListeningPlatforms() {
  return <section className={styles.platforms}><h2>Subscribe & listen on</h2><div>{platforms.map(([name, mark, color]) => <Link href={`/search?q=${encodeURIComponent(name)}`} key={name}><i style={{ color }}>{mark}</i><span>{name}</span></Link>)}</div></section>;
}

function EpisodeArchive({ episodes, showSlug }: { episodes: Episode[]; showSlug: string }) {
  return <section className={styles.episodes} id="all-show-episodes"><SectionHeader action="View all episodes" href="/podcasts#podcast-archive" title="All episodes" />
    <div className={styles.filters}><button type="button">All seasons⌄</button><button type="button">Newest first⌄</button></div>
    <div className={styles.episodeList}>{episodes.map((episode, index) => <article key={episode.id}>
      <Link className={styles.episodeThumb} href={episodeHref(showSlug, episode, index)}><Image alt={episode.article.heroImage?.alt ?? episode.article.title} fill sizes="180px" src={imageSrc(episode)} /><i><Play /></i></Link>
      <div><p>Episode {48 - index}</p><h3><Link href={episodeHref(showSlug, episode, index)}>{episodeTitle(episode, index)}</Link></h3><span>{episode.article.authors[0]?.name ?? "The Perspective"} <i /> {index === 0 ? "Founder & CEO, NextSphere Technologies" : episode.article.category.name}</span><small><CalendarDays />{index === 0 ? "May 10, 2026" : `May ${3 - index * 4}, 2026`} <i /> {episode.duration.replace(":", " min ")} sec</small></div>
      <Link aria-label={`Play ${episode.article.title}`} className={styles.rowPlay} href={episodeHref(showSlug, episode, index)}><Play /><small>{episode.duration}</small></Link>
    </article>)}</div>
  </section>;
}

function ShowSidebar({ content }: { content: PodcastShowContent }) {
  const { show, episodes } = content;
  return <aside className={styles.sidebar}>
    <section><SectionHeader action="View all guests" href="/search?type=people" title="Featured guests" /><div className={styles.guests}>{show.guestNames.map((name, index) => <Link href={`/search?q=${encodeURIComponent(name)}`} key={name}><span><Image alt={name} fill sizes="72px" src={guestImages[index] ?? guestImages[0]} /></span><b>{name}</b></Link>)}</div></section>
    <section><SectionHeader href="/podcasts#podcast-archive" title="Popular episodes" /><ol className={styles.popular}>{episodes.map((episode, index) => <li key={episode.id}><b>{String(index + 1).padStart(2, "0")}</b><span><Image alt={episode.article.title} fill sizes="58px" src={imageSrc(episode)} /></span><div><Link href={episodeHref(show.slug, episode, index)}>{episode.article.title}</Link><small>{index === 0 ? "Feb 15, 2026" : `Mar ${8 - index}, 2026`} · {49 - index} min</small></div></li>)}</ol></section>
    <section><SectionHeader action="View all topics" href="/search?q=podcast+topics" title="Topics we cover" /><div className={styles.topicPills}>{show.topics.map((topic) => <Link href={`/search?q=${encodeURIComponent(topic)}`} key={topic}>{topic}</Link>)}</div></section>
  </aside>;
}

function UtilityCards({ content }: { content: PodcastShowContent }) {
  const { show, episodes } = content;
  return <section className={styles.utilities} id="about-show">
    <article><h2>About the host</h2><div className={styles.hostCard}><span><Image alt={show.host} fill sizes="84px" src={show.hostImage} /></span><div><b>{show.host}</b><small>{show.hostRole}</small></div></div><p>An award-winning journalist and editor with over 18 years of experience covering business, leadership, technology and global affairs.</p><Link href="/authors">View full profile<ArrowRight /></Link></article>
    <article><h2>Watch the podcast</h2><Link className={styles.utilityImage} href="/videos"><Image alt={`${show.title} video podcast`} fill sizes="250px" src={show.hostImage} /><i><Play /></i></Link><p>Full video episodes on YouTube.</p><Link href="/videos">Watch now<ArrowRight /></Link></article>
    <article><h2>Be a guest</h2><Link className={styles.utilityImage} href="/search?q=podcast+guest"><Image alt="Podcast microphones" fill sizes="250px" src={imageSrc(episodes[2] ?? episodes[0])} /><i><Mic2 /></i></Link><p>Interested in being on {show.title}?</p><Link href="/search?q=podcast+guest">Apply to be a guest<ArrowRight /></Link></article>
    <article className={styles.stayUpdated}><h2>Stay updated</h2><Mail /><p>Get episode alerts, exclusive insights and show notes.</p><NewsletterForm buttonLabel="Subscribe" label={`${show.title} email alerts`} theme="light" /><small>No spam. Unsubscribe anytime.</small></article>
    <article className={styles.shareCard}><h2>Share the show</h2><Share2 /><p>Know someone who would love these conversations?</p><Link href={`/podcasts/${show.slug}`}>Share podcast<ArrowRight /></Link></article>
  </section>;
}

function RelatedShows({ currentSlug }: { currentSlug: string }) {
  const shows = [
    ["the-global-briefing", "The Global Briefing", "Weekly insights on global affairs", "42 episodes"],
    ["tech-frontiers", "Tech Frontiers", "The future of technology", "37 episodes"],
    ["women-who-lead", "Future of Work Conversations", "People, purpose and progress", "31 episodes"],
    ["markets-decoded", "Capital Conversations", "Markets, investing and more", "28 episodes"],
  ];
  return <section className={styles.related}><SectionHeader action="View all podcasts" href="/podcasts" title="You might also like" /><div>{shows.filter(([slug]) => slug !== currentSlug).map(([slug, title, deck, count], index) => <Link href={slug === "the-global-briefing" ? "/podcasts" : `/podcasts/${slug}`} key={slug}><div className={styles.relatedArt} style={{ "--related-image": `url(${guestImages[index]})` } as React.CSSProperties}><Mic2 /><span>The Perspective</span></div><h3>{title}</h3><p>{deck}</p><small>{count}</small></Link>)}</div></section>;
}

export function PodcastShowDetail({ content }: { content: PodcastShowContent }) {
  return <main className={styles.page}>
    <ShowHero content={content} />
    <section className={styles.shell}>
      <div className={styles.introGrid}><LatestEpisode episode={content.episodes[0]} showSlug={content.show.slug} /><ListeningPlatforms /></div>
      <div className={styles.contentGrid}><EpisodeArchive episodes={content.episodes} showSlug={content.show.slug} /><ShowSidebar content={content} /></div>
      <UtilityCards content={content} />
      <RelatedShows currentSlug={content.show.slug} />
    </section>
  </main>;
}
