import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, Bookmark, CalendarDays, Check, ChevronRight, Clock3, Headphones, Lightbulb,
  Mic2, Play, Quote, Radio, Search, Share2, Sparkles, Tag, Video,
} from "lucide-react";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import type { Article, ArticleDetail } from "@/types";
import type { PodcastEpisodeContent } from "@/lib/podcast-shows";
import { PodcastAudioPlayer } from "./podcast-audio-player";
import styles from "./podcast-episode-detail.module.css";

const title = "Building the Future: Arjun Mehta on Innovation, Leadership and Purpose";
const guestImage = "/images/personal-magazines/arjun-mehta-hero-v3.webp";
const hostImage = "/images/authors/ananya-mehta-featured.png";
const chapters = [
  ["00:00", "Introduction"], ["02:15", "Arjun’s early days and the spark of entrepreneurship"],
  ["08:40", "Building NextSphere: From idea to global platform"], ["18:22", "Leadership lessons from scaling across markets"],
  ["28:10", "AI and the future of enterprise"], ["36:05", "Building a culture of ownership and purpose"],
  ["43:18", "Advice for founders and young leaders"], ["50:10", "Final thoughts"],
] as const;
const takeaways = [
  "Great companies are built at the intersection of technology, talent and trust.",
  "Purpose is the compass that keeps you steady in uncertain times.",
  "AI will amplify human potential, not replace it.",
  "Empathy is the most underrated leadership superpower.",
  "The next decade belongs to builders who solve meaningful problems.",
] as const;
const transcript = [
  ["00:00:05", "Ananya Mehta", "Arjun, thank you so much for joining me today."],
  ["00:00:08", "Arjun Mehta", "Thank you, Ananya. Great to be here."],
  ["00:00:12", "Ananya Mehta", "Let’s start at the beginning. What sparked your interest in building companies?"],
  ["00:00:18", "Arjun Mehta", "I’ve always been fascinated by how technology can solve real-world problems and improve people’s lives."],
] as const;

function imageOf(article: Article) {
  return article.heroImage?.src ?? "/images/articles/global-leadership.png";
}

function SectionHeader({ title: sectionTitle, href, action = "View all" }: { title: string; href?: string; action?: string }) {
  return <header className={styles.sectionHeader}><h2>{sectionTitle}</h2>{href && <Link href={href}>{action}<ArrowRight /></Link>}</header>;
}

function Person({ type, name, role, image, href }: { type: string; name: string; role: string; image: string; href: string }) {
  return <Link className={styles.person} href={href}><span><Image alt={name} fill sizes="54px" src={image} /></span><div><small>{type}</small><b>{name}</b><p>{role}</p></div></Link>;
}

function EpisodeHero({ article, content }: { article: ArticleDetail; content: PodcastEpisodeContent }) {
  const { show } = content;
  return <>
    <nav aria-label="Breadcrumb" className={styles.breadcrumb}><Link href="/">Home</Link><ChevronRight /><Link href="/podcasts">Podcasts</Link><ChevronRight /><Link href={`/podcasts/${show.slug}`}>{show.title}</Link><ChevronRight /><b>Episode 48</b></nav>
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>{show.title} <i /> Episode 48</p>
        <h1>{title}</h1>
        <p className={styles.deck}>A conversation on building global companies, leading through uncertainty, AI transformation and staying true to purpose.</p>
        <div className={styles.people}><Person href="/personal-magazines/arjun-mehta" image={guestImage} name="Arjun Mehta" role="Founder & CEO, NextSphere Technologies" type="Guest" /><Person href="/authors" image={hostImage} name="Ananya Mehta" role="Editor-in-Chief, The Perspective" type="Host" /></div>
        <div className={styles.heroActions}><a className={styles.primary} href="#episode-player"><Play />Play episode</a><Link href="/videos"><Video />Watch video</Link><Link href="/search?q=saved"><Bookmark />Save</Link><a href={`mailto:?subject=${encodeURIComponent(title)}`}><Share2 />Share</a></div>
      </div>
      <div className={styles.heroImage}><Image alt={`${article.heroImage?.alt ?? "Arjun Mehta"} in The Perspective podcast studio`} fill priority sizes="(max-width:800px) 100vw, 720px" src={guestImage} /><span /></div>
    </section>
  </>;
}

function Player({ content }: { content: PodcastEpisodeContent }) {
  return <section className={styles.player} id="episode-player">
    <div className={styles.playerCover}><span>The</span><strong>Perspective</strong><small>Podcast</small><h2>The<br />Leadership<br />Dialogues</h2><Mic2 /></div>
    <PodcastAudioPlayer />
    <ul><li><CalendarDays />May 10, 2026</li><li><Clock3 />52 min</li><li><Video />Audio & Video</li><li><Radio />English</li><li><Headphones />Episode 48 of {content.show.episodes}</li><li><Sparkles />Released Weekly</li></ul>
  </section>;
}

function Overview({ content }: { content: PodcastEpisodeContent }) {
  return <section className={styles.overview}>
    <article><SectionHeader title="Episode summary" /><p>In this episode of {content.show.title}, Arjun Mehta shares his journey from a young engineer to building NextSphere Technologies into a global enterprise platform. We discuss leadership in uncertain times, the role of AI in enterprise transformation, building a strong culture, and advice for the next generation of entrepreneurs.</p><button type="button">Show more⌄</button></article>
    <article><SectionHeader title="In this conversation" /><ul>{["Building global companies from India", "Leading people through uncertainty", "The AI transformation of enterprises", "Creating a culture of purpose", "Advice for first-time founders"].map((item) => <li key={item}><Check />{item}</li>)}</ul></article>
  </section>;
}

function ChaptersAndTakeaways() {
  return <section className={styles.chapterGrid}>
    <article><SectionHeader title="Episode chapters" /><ol>{chapters.map(([time, item], index) => <li key={time}>{index === 0 ? <Play /> : <span /> }<time>{time}</time><p>{item}</p><Bookmark /></li>)}</ol><Link href="#full-transcript">View full chapters<ArrowRight /></Link></article>
    <article><SectionHeader title="Key takeaways" /><ul>{takeaways.map((item, index) => <li key={item}>{[Lightbulb, Sparkles, Headphones, Quote, Tag].map((Icon) => Icon)[index] && (() => { const Icon = [Lightbulb, Sparkles, Headphones, Quote, Tag][index]; return <Icon />; })()}<p>{item}</p></li>)}</ul><Link href="#full-transcript">View all takeaways<ArrowRight /></Link></article>
  </section>;
}

function Transcript() {
  return <section className={styles.transcript} id="full-transcript"><SectionHeader title="Transcript" /><div className={styles.transcriptTabs}><button type="button">Full transcript</button><button type="button">Transcript highlights</button><label><Search /><input aria-label="Search transcript" placeholder="Search in transcript" /></label></div><div className={styles.transcriptBody}><div>{transcript.map(([time, speaker, text]) => <p key={time}><time>{time}</time><span><b>{speaker}:</b> {text}</span></p>)}<Link href={`/article/${"business-interview-arjun-mehta"}`}>Read full transcript<ArrowRight /></Link></div><aside><Quote /><blockquote>Technology is just an enabler. Purpose is the differentiator. Leadership is what multiplies that impact.</blockquote><cite>— Arjun Mehta</cite></aside></div></section>;
}

function ProfileCard({ label, name, role, image, href }: { label: string; name: string; role: string; image: string; href: string }) {
  return <section className={styles.profileCard}><SectionHeader title={label} /><div><span><Image alt={name} fill sizes="80px" src={image} /></span><p><b>{name}</b><small>{role}</small></p></div><Link href={href}>View profile<ArrowRight /></Link></section>;
}

function SideRail({ article, content, related }: { article: ArticleDetail; content: PodcastEpisodeContent; related: readonly Article[] }) {
  const { show, episodes } = content;
  return <aside className={styles.sideRail}>
    <section className={styles.about}><SectionHeader title="About this episode" /><p>Arjun Mehta, Founder & CEO of NextSphere Technologies, joins Ananya Mehta for an in-depth conversation about building ventures that scale, leading with empathy, and how technology can be a force for good.</p><small>Topics</small><div>{["Leadership", "Innovation", "AI", "Strategy", "Entrepreneurship", "Purpose"].map((topic) => <Link href={`/search?q=${topic}`} key={topic}>{topic}</Link>)}</div></section>
    <ProfileCard href="/personal-magazines/arjun-mehta" image={guestImage} label="Guest" name="Arjun Mehta" role="Founder & CEO, NextSphere Technologies" />
    <ProfileCard href="/authors" image={hostImage} label="Host" name="Ananya Mehta" role="Editor-in-Chief, The Perspective" />
    <section><SectionHeader action="View all" href={`/search?q=${encodeURIComponent(article.title)}`} title="Related articles" /><div className={styles.sideStories}>{related.slice(0, 3).map((story) => <Link href={`/article/${story.slug}`} key={story.id}><span><Image alt={story.heroImage?.alt ?? story.title} fill sizes="76px" src={imageOf(story)} /></span><div><small>{story.category.name}</small><b>{story.title}</b><em>8 min read</em></div></Link>)}</div></section>
    <section><SectionHeader action="View all" href={`/podcasts/${show.slug}`} title="More from this podcast" /><div className={styles.sideStories}>{episodes.slice(1, 4).map((episode, index) => <Link href={`/podcasts/${show.slug}/${episode.article.slug}`} key={episode.id}><span><Image alt={episode.article.title} fill sizes="76px" src={imageOf(episode.article)} /><i><Play /></i></span><div><small>Ep. {47 - index}</small><b>{episode.article.title}</b><em>{episode.duration} min</em></div></Link>)}</div></section>
  </aside>;
}

function Clips({ article, related }: { article: ArticleDetail; related: readonly Article[] }) {
  const clips = [article, ...related].slice(0, 3);
  const labels = ["The biggest leadership lesson I learned the hard way", "Why India has the talent to build global companies", "AI will amplify human potential, not replace it"];
  return <section className={styles.clips}><SectionHeader action="View all clips" href="/videos" title="Featured clips" /><div>{clips.map((story, index) => <article key={story.id}><Link href={`/article/${story.slug}`}><span><Image alt={story.heroImage?.alt ?? story.title} fill sizes="230px" src={index === 0 ? guestImage : imageOf(story)} /><i><Play /></i><small>1:{32 - index * 14}</small></span><h3>{labels[index]}</h3><p>{2421 + index * 387} views</p></Link></article>)}</div></section>;
}

function RelatedPodcasts({ showSlug }: { showSlug: string }) {
  const shows = [["/podcasts", "The Global Briefing", "Weekly insights on global affairs", "42 Episodes"], ["/podcasts/tech-frontiers", "Tech Frontiers", "The future of technology", "37 Episodes"], ["/podcasts/women-who-lead", "Future of Work Conversations", "People, purpose and progress", "31 Episodes"], ["/podcasts/markets-decoded", "Capital Conversations", "Markets, investing and more", "28 Episodes"]];
  return <section className={styles.relatedPodcasts}><SectionHeader action="View all podcasts" href="/podcasts" title="Related podcasts" /><div>{shows.filter(([href]) => !href.endsWith(showSlug)).map(([href, name, deck, count], index) => <Link href={href} key={name}><span style={{ backgroundImage: `linear-gradient(135deg,rgba(4,13,20,.85),rgba(24,12,9,.92)),url(${index % 2 ? hostImage : guestImage})` }}>The Perspective<Mic2 /></span><h3>{name}</h3><p>{deck}</p><small>{count}</small></Link>)}</div></section>;
}

function EpisodeNewsletter() {
  return <section className={styles.newsletter}><div className={styles.newsletterImage}><Image alt="Podcast studio conversation" fill sizes="260px" src={guestImage} /></div><div><h2>Never miss an episode.</h2><p>Subscribe for new episode alerts, exclusive insights and show notes.</p></div><NewsletterForm buttonLabel="Subscribe" label="Podcast episode updates" theme="light" /><aside><Mic2 /><b>Interested in being a guest?</b><p>Share your story and insights with our global audience.</p><Link href="/search?q=podcast+guest">Apply now<ArrowRight /></Link></aside></section>;
}

export function PodcastEpisodeDetail({ article, content, related }: { article: ArticleDetail; content: PodcastEpisodeContent; related: readonly Article[] }) {
  return <main className={styles.page}>
    <EpisodeHero article={article} content={content} />
    <div className={styles.shell}>
      <div className={styles.mainGrid}><div><Player content={content} /><Overview content={content} /><ChaptersAndTakeaways /><Transcript /></div><SideRail article={article} content={content} related={related} /></div>
      <div className={styles.discovery}><Clips article={article} related={related} /><RelatedPodcasts showSlug={content.show.slug} /></div>
      <EpisodeNewsletter />
    </div>
  </main>;
}
