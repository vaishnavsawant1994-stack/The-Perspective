import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, BellRing, BookmarkPlus, Building2, Camera,
  CirclePlay, Clapperboard, Cpu, Film, Globe2, GraduationCap, Leaf,
  Lightbulb, MonitorPlay, Rocket, Sparkles, TrendingUp,
  UserRound, UsersRound,
} from "lucide-react";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import type { HomepageRedesignContent } from "@/lib/homepage-redesign";
import type { ImageAsset } from "@/types";
import { getVideoSlug } from "@/lib/video-detail";
import styles from "./videos-page.module.css";

type VideoStory = HomepageRedesignContent["videos"][number];
type ShortStory = HomepageRedesignContent["shorts"][number];

const latestDetails = [
  { category: "Business", title: "Markets Today: Global Cues and What Investors Should Watch", date: "May 10, 2026", views: "18K views" },
  { category: "Technology", title: "AI in Action: Transforming Industries Faster Than Ever", date: "May 9, 2026", views: "24K views" },
  { category: "Leadership", title: "Leadership in a Hybrid World: Lessons from the Frontline", date: "May 8, 2026", views: "16K views" },
  { category: "Startups", title: "Inside the Mind of a Founder: Building for the Long Term", date: "May 7, 2026", views: "22K views" },
  { category: "Sustainability", title: "The Green Transition: Building a Sustainable Future", date: "May 6, 2026", views: "14K views" },
];

const categories = [
  ["All Videos", MonitorPlay], ["Business & Markets", TrendingUp], ["Leadership", UsersRound],
  ["Technology & AI", Cpu], ["Economy", Building2], ["Startups", Rocket],
  ["Sustainability", Leaf], ["Lifestyle", Sparkles], ["Explainers", GraduationCap], ["Documentaries", Film],
] as const;

const series = [
  { title: "The Executive Dialogues", copy: "Conversations with visionary leaders", count: 12, image: "/images/videos/naveen-malhotra-featured-interview.png" },
  { title: "Founders Unfiltered", copy: "Raw. Real. Relatable. Stories from founders", count: 22, image: "/images/articles/marcus-chen.png" },
  { title: "Markets Decoded", copy: "Simplifying markets, economy & investing", count: 18, image: "/images/articles/ai-infrastructure.png" },
  { title: "Future Forward", copy: "Exploring tomorrow’s technology today", count: 16, image: "/images/articles/global-growth.png" },
];

const playlists = [
  { title: "CEO Interviews", count: 20, image: "/images/articles/daniel-kim.png" },
  { title: "Women Who Lead", count: 18, image: "/images/articles/elena-rossi.png" },
  { title: "Tech Talk", count: 25, image: "/images/articles/marcus-chen.png" },
  { title: "Global Perspective", count: 22, image: "/images/articles/global-leadership.png" },
  { title: "Policy & Impact", count: 16, image: "/images/articles/board-governance.png" },
  { title: "In Focus", count: 30, image: "/images/articles/cybersecurity-operations.png" },
];

const premieres = [
  { day: "14", month: "May", title: "The Future of Money with RBI Governor", date: "May 14, 2026 · 7:00 PM IST", image: "/images/articles/daniel-kim.png" },
  { day: "16", month: "May", title: "DeepTech Founders: Building from India", date: "May 16, 2026 · 7:00 PM IST", image: "/images/articles/marcus-chen.png" },
  { day: "19", month: "May", title: "Energy Transition: Global Perspectives", date: "May 19, 2026 · 7:00 PM IST", image: "/images/articles/global-leadership.png" },
];

function storyHref(story: VideoStory | ShortStory) { return `/videos/${getVideoSlug(story.article.slug)}`; }

function Art({ image, alt, sizes, priority = false, position = "center" }: { image?: ImageAsset | string; alt?: string; sizes: string; priority?: boolean; position?: string }) {
  const src = typeof image === "string" ? image : image?.src;
  const imageAlt = alt ?? (typeof image === "string" ? "The Perspective video" : image?.alt ?? "The Perspective video");
  if (!src) return <span className={styles.fallback}><Clapperboard aria-hidden="true" /></span>;
  return <Image alt={imageAlt} fill priority={priority} sizes={sizes} src={src} style={{ objectPosition: position }} />;
}

function SectionHeader({ title, href, action }: { title: string; href: string; action: string }) {
  return <header className={styles.sectionHeader}><h2>{title}</h2><Link href={href}>{action}<ArrowRight aria-hidden="true" /></Link></header>;
}

function BreakingStrip({ stories }: { stories: HomepageRedesignContent["breaking"] }) {
  return <aside aria-label="Breaking news" className={styles.breaking}><div className={styles.shell}><strong>Breaking</strong><div>{stories.map((story) => <Link href={`/article/${story.slug}`} key={story.id}>{story.title}</Link>)}</div><span><i />Live</span></div></aside>;
}

function VideoHero() {
  return <section aria-labelledby="videos-heading" className={styles.hero}><div className={`${styles.shell} ${styles.heroGrid}`}>
    <div className={styles.heroCopy}><p className={styles.eyebrow}>The Perspective Videos</p><h1 id="videos-heading">Stories Worth Watching.<br />Ideas Worth Understanding.</h1><p className={styles.deck}>In-depth conversations, exclusive interviews and documentaries with the world’s most influential leaders and changemakers.</p>
      <div className={styles.featureCopy}><small>Featured video</small><h2>India’s Next Decade: Opportunities, Risks &amp; The Road Ahead</h2><div><span className={styles.avatar}><Image alt="Naveen Malhotra" fill sizes="48px" src="/images/articles/marcus-chen.png" /></span><p><b>Naveen Malhotra</b><span>Co-founder &amp; Chairman, Infinitas</span><em>48:35 <i /> May 10, 2026 <i /> 125K views</em></p></div></div>
      <div className={styles.heroActions}><Link className={styles.primary} href="/videos/indias-digital-decade-road-ahead"><CirclePlay />Watch now</Link><Link className={styles.secondary} href="/search?q=saved"><BookmarkPlus />Save for later</Link></div>
    </div>
    <Link aria-label="Watch India’s Next Decade" className={styles.heroVideo} href="/videos/indias-digital-decade-road-ahead"><Art alt="Naveen Malhotra discussing India’s technology future" image="/images/videos/naveen-malhotra-featured-interview.png" priority sizes="(max-width: 800px) 94vw, (max-width: 1200px) 55vw, 610px" /><span className={styles.heroPlay}><CirclePlay /></span><b>48:35</b></Link>
    <aside className={styles.inVideo}><h2>In this video</h2><ul><li><Globe2 />India’s growth outlook for the next decade</li><li><Building2 />The rise of digital public infrastructure</li><li><Lightbulb />AI, jobs and the future of work</li><li><TrendingUp />Building globally competitive companies</li><li><UserRound />Advice for India’s young entrepreneurs</li></ul></aside>
  </div></section>;
}

function LatestVideos({ videos }: { videos: VideoStory[] }) {
  return <section className={styles.section} id="latest-videos"><div className={styles.shell}><SectionHeader action="View all videos" href="#video-archive" title="Latest videos" /><div className={styles.latestGrid}>{videos.slice(0, 5).map((story, index) => { const detail = latestDetails[index] ?? latestDetails[0]; return <article className={styles.videoCard} key={story.article.id}><Link className={styles.videoThumb} href={storyHref(story)}><Art image={story.article.heroImage} sizes="(max-width:700px) 92vw, (max-width:1100px) 31vw, 260px" /><span><CirclePlay /></span><b>{story.duration}</b></Link><div><p>{detail.category}</p><h3><Link href={storyHref(story)}>{detail.title}</Link></h3><small>{detail.date}<i />{detail.views}</small></div></article>; })}</div></div></section>;
}

function Categories() { return <section className={styles.section}><div className={styles.shell}><SectionHeader action="Browse all" href="/search?q=video" title="Browse by category" /><div className={styles.categories}>{categories.map(([name, Icon]) => <Link href={`/search?q=${encodeURIComponent(name)}+video`} key={name}><Icon /><span>{name}</span></Link>)}</div></div></section>; }

function PopularSeries() { return <section className={styles.section}><div className={styles.shell}><SectionHeader action="View all series" href="/search?q=video+series" title="Popular series" /><div className={styles.seriesGrid}>{series.map((item) => <Link className={styles.seriesCard} href="#video-archive" key={item.title}><Art alt={item.title} image={item.image} sizes="330px" /><span /><div><h3>{item.title}</h3><p>{item.copy}</p><b>{item.count} episodes</b></div></Link>)}</div></div></section>; }

function Playlists() { return <section className={styles.section}><div className={styles.shell}><SectionHeader action="View all playlists" href="/search?q=video+playlist" title="Curated playlists" /><div className={styles.playlistGrid}>{playlists.map((item) => <article key={item.title}><Link href="#video-archive"><span className={styles.playlistArt}><Art alt={item.title} image={item.image} sizes="220px" /><b><CirclePlay />{item.count}</b></span><h3>{item.title}</h3><p>{item.count} videos</p></Link></article>)}</div></div></section>; }

function Discovery({ videos, shorts }: { videos: VideoStory[]; shorts: ShortStory[] }) {
  return <section className={styles.section}><div className={`${styles.shell} ${styles.discovery}`}>
    <section className={styles.mostWatched}><SectionHeader action="View all" href="#video-archive" title="Most watched" /><ol>{videos.slice(0, 5).map((story, index) => <li key={story.article.id}><span>{String(index + 1).padStart(2, "0")}</span><Link className={styles.rankArt} href={storyHref(story)}><Art image={story.article.heroImage} sizes="74px" /><b><CirclePlay /></b></Link><div><Link href={storyHref(story)}>{latestDetails[index]?.title ?? story.article.title}</Link><small>{125 - index * 14}K views</small></div></li>)}</ol></section>
    <section className={styles.premieres}><SectionHeader action="View calendar" href="/search?q=video+premiere" title="Upcoming premieres" /><div>{premieres.map((item) => <article key={item.title}><time><b>{item.month}</b><strong>{item.day}</strong></time><span className={styles.premiereArt}><Art alt={item.title} image={item.image} sizes="58px" /></span><div><h3>{item.title}</h3><p>Premieres {item.date}</p><button type="button"><BellRing />Remind me</button></div></article>)}</div></section>
    <section className={styles.shorts}><SectionHeader action="View all shorts" href="#shorts-archive" title="Shorts" /><div>{shorts.slice(0, 3).map((story, index) => <article key={story.article.id}><Link className={styles.shortArt} href={storyHref(story)}><Art image={story.article.heroImage} position="center 18%" sizes="160px" /><b><CirclePlay />{story.duration}</b></Link><h3><Link href={storyHref(story)}>{["3 Leadership Habits That Make a Difference", "AI Tools You Should Be Using in 2026", "Market Update in 60 Seconds"][index]}</Link></h3><p>{12 - index * 2}K views</p></article>)}</div></section>
  </div></section>;
}

function CreatorBriefing() { return <section className={styles.section}><div className={`${styles.shell} ${styles.ctaBand}`}><div className={styles.creator}><div><p>Share your story. Inspire millions.</p><span>Join The Perspective Videos and tell your story to a global audience of leaders, innovators and changemakers.</span><Link href="/search?q=be+featured">Apply to be featured</Link></div><Camera /></div><div className={styles.briefing}><div><h2>Stay Updated with Our Video Briefing</h2><p>Get the best conversations and insights, delivered to your inbox every week.</p></div><NewsletterForm buttonLabel="Subscribe" label="Video briefing" theme="light" /></div></div></section>; }

function VideoArchive({ videos, shorts }: { videos: VideoStory[]; shorts: ShortStory[] }) {
  return <section className={`${styles.section} ${styles.archive}`} id="video-archive"><div className={styles.shell}><header className={styles.archiveIntro}><p className={styles.eyebrow}>The existing collection</p><h2>The complete video archive</h2><p>All current Perspective videos and shorts remain available below the new editorial experience.</p></header><div className={styles.archiveGrid}>{videos.map((story) => <article key={story.article.id}><Link className={styles.archiveArt} href={storyHref(story)}><Art image={story.article.heroImage} sizes="(max-width:700px) 92vw, (max-width:1100px) 42vw, 320px" /><span><CirclePlay />{story.duration}</span></Link><p>{story.article.category.name}</p><h3><Link href={storyHref(story)}>{story.article.title}</Link></h3><small>{story.article.displayTime ?? "August 7, 2026"}<i />{story.article.readingMinutes} min read</small></article>)}</div>
    <div className={styles.shortsArchive} id="shorts-archive"><SectionHeader action="Explore shorts" href="/search?q=shorts" title="All shorts" /><div>{shorts.map((story) => <article key={story.article.id}><Link className={styles.archiveShortArt} href={storyHref(story)}><Art image={story.article.heroImage} position="center 15%" sizes="180px" /><span><CirclePlay />{story.duration}</span></Link><h3><Link href={storyHref(story)}>{story.article.title}</Link></h3><small>{story.article.category.name}</small></article>)}</div></div>
  </div></section>;
}

export function VideosPage({ content }: { content: HomepageRedesignContent }) {
  return <div className={styles.page}><BreakingStrip stories={content.breaking} /><VideoHero /><LatestVideos videos={content.videos} /><Categories /><PopularSeries /><Playlists /><Discovery shorts={content.shorts} videos={content.videos} /><CreatorBriefing /><VideoArchive shorts={content.shorts} videos={content.videos} /></div>;
}
