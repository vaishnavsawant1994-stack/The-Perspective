import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, Bookmark, CalendarDays, Check, ChevronRight, Clock3, Eye, HeartHandshake,
  Lightbulb, Play, Quote, Search, Share2, Sparkles, Target, Video, Volume2,
} from "lucide-react";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import type { Article, ArticleDetail } from "@/types";
import { getVideoSlug, type VideoDetailContent } from "@/lib/video-detail";
import { VideoPlayerControls } from "./video-player-controls";
import styles from "./video-detail-page.module.css";

const speakerImage = "/images/videos/naveen-malhotra-featured-interview.png";
const speakerAvatar = "/images/articles/marcus-chen.png";
const featuredTitle = "India’s Digital Decade: The Road Ahead";
const chapters = [["00:00", "Introduction"], ["02:45", "The Journey of Digital India"], ["08:30", "Digital Public Infrastructure: DPI"], ["16:20", "Building for a Billion Users"], ["24:10", "AI and the Future of Work"], ["31:40", "Entrepreneurship in India"], ["38:25", "Advice for Young Founders"], ["44:10", "Final Thoughts"]] as const;
const takeaways = ["Digital public infrastructure is India’s greatest multiplier for inclusive growth.", "Technology must be built on privacy, security and trust.", "AI will transform every industry, but human judgment remains irreplaceable.", "Solve real problems at scale and impact will follow.", "India’s best days are ahead if we build for impact and not just for scale."] as const;
const transcript = [["05:18", "Nandan Nilekani", "When we started UIDAI, the idea was simple — create a digital identity for every resident of India."], ["05:26", "Nandan Nilekani", "That identity became the foundation for so many services that changed how people live."], ["05:34", "Nandan Nilekani", "Today, India Stack is being used not just in India, but by countries around the world."], ["05:42", "Ananya Mehta", "What do you see as the biggest opportunity for India in the next decade?"], ["05:48", "Nandan Nilekani", "Our youth, our entrepreneurs, and our ability to solve for a billion people at scale."]] as const;

function imageOf(article: Article) { return article.heroImage?.src ?? "/images/articles/global-growth.png"; }
function hrefOf(article: Article) { return `/article/${article.slug}`; }
function videoHref(article: Article) { return `/videos/${getVideoSlug(article.slug)}`; }

function SectionHeader({ title, href, action = "View all" }: { title: string; href?: string; action?: string }) {
  return <header className={styles.sectionHeader}><h2>{title}</h2>{href && <Link href={href}>{action}<ArrowRight /></Link>}</header>;
}

function Intro({ article, slug }: { article: ArticleDetail; slug: string }) {
  const isFeatured = slug === "indias-digital-decade-road-ahead";
  return <>
    <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><ChevronRight /><Link href="/videos">Videos</Link><ChevronRight /><b>{isFeatured ? featuredTitle : article.title}</b></nav>
    <section className={styles.intro}>
      <div><p>The Perspective Videos</p><h1>{isFeatured ? featuredTitle : article.title}</h1><h2>{isFeatured ? "Nandan Nilekani on digital infrastructure, AI, entrepreneurship and India’s next growth chapter." : article.excerpt}</h2><div className={styles.meta}><span><CalendarDays />May 10, 2026</span><span><Clock3 />48:35 min</span><span><Eye />24.8K views</span><span><Video />{article.category.name}</span></div></div>
      <div className={styles.introActions}><Link href="/search?q=saved"><Bookmark />Save</Link><a href={`mailto:?subject=${encodeURIComponent(isFeatured ? featuredTitle : article.title)}`}><Share2 />Share</a><button aria-label="More video options" type="button">•••</button></div>
    </section>
  </>;
}

function Player() {
  return <section className={styles.player}>
    <div className={styles.playerImage}><Image alt="Nandan Nilekani in conversation for The Perspective Videos" fill priority sizes="(max-width:900px) 100vw, 950px" src={speakerImage} /><span /><div className={styles.playerBrand}><b>The</b><strong>Perspective.</strong><small>Conversations that matter.</small></div><div className={styles.speakerLabel}><b>Nandan Nilekani</b><span>Co-founder and Chairman, Infosys<br />Co-founder, UIDAI<br />Chairman, EkStep Foundation</span></div><button aria-label="Play video" type="button"><Play /></button></div>
    <VideoPlayerControls />
    <div className={styles.description}><p>In this wide-ranging conversation, Nandan Nilekani shares his vision for India’s digital future, the role of public digital infrastructure, the transformative potential of AI, and what it takes to build meaningful solutions that impact a billion lives.</p><button type="button">Show more⌄</button></div>
  </section>;
}

function ChaptersInsights() {
  return <section className={styles.chapterGrid}>
    <article><SectionHeader action="View full chapters" href="#video-transcript" title="Chapters" /><ol>{chapters.map(([time, title], index) => <li key={time}>{index === 0 ? <Play /> : <span /> }<time>{time}</time><p>{title}</p><Bookmark /></li>)}</ol></article>
    <article><SectionHeader title="Key takeaways" /><ul>{takeaways.map((item, index) => <li key={item}>{[Sparkles, HeartHandshake, Lightbulb, Target, Check].map((Icon) => Icon)[index] && (() => { const Icon = [Sparkles, HeartHandshake, Lightbulb, Target, Check][index]; return <Icon />; })()}<p>{item}</p></li>)}</ul></article>
  </section>;
}

function Transcript() {
  return <section className={styles.transcript} id="video-transcript"><SectionHeader title="Transcript" /><div className={styles.transcriptSearch}><label><Search /><input aria-label="Search transcript" placeholder="Search in transcript" /></label></div><div className={styles.transcriptBody}><div>{transcript.map(([time, speaker, text]) => <p key={time}><time>{time}</time><span><b>{speaker}:</b> {text}</span></p>)}<Link href="#original-video-content">Read full transcript<ArrowRight /></Link></div><aside><Quote /><h2>Memorable quote</h2><blockquote>Technology is a great leveller. When you build for a billion people, you build the best solutions in the world.</blockquote><cite>— Nandan Nilekani</cite></aside></div></section>;
}

function InVideo() { return <section><SectionHeader title="In this video" /><ul className={styles.inVideo}>{["Digital public infrastructure", "AI and the future of work", "Building for a billion users", "India’s next growth phase", "Advice for entrepreneurs"].map((item) => <li key={item}><Play />{item}</li>)}</ul><Link className={styles.fullButton} href="#video-transcript">View chapters ↓</Link></section>; }

function Speaker() { return <section className={styles.speaker}><SectionHeader title="Speaker" /><div><span><Image alt="Nandan Nilekani" fill sizes="75px" src={speakerAvatar} /></span><p><b>Nandan Nilekani</b><small>Co-founder and Chairman, Infosys<br />Co-founder, UIDAI<br />Chairman, EkStep Foundation</small></p></div><Link href="/search?q=Nandan+Nilekani">View profile<ArrowRight /></Link></section>; }

function StoryList({ title, stories, videos = false }: { title: string; stories: readonly Article[]; videos?: boolean }) {
  return <section><SectionHeader href={videos ? "/videos" : "/latest"} title={title} /><div className={styles.storyList}>{stories.slice(0, 4).map((story, index) => <Link href={videos ? videoHref(story) : hrefOf(story)} key={story.id}><span><Image alt={story.heroImage?.alt ?? story.title} fill sizes="76px" src={imageOf(story)} />{videos && <i><Play /></i>}</span><div><small>{videos ? `Ep. 0${index + 1}` : story.category.name}</small><b>{story.title}</b><em>{videos ? ["32:10", "45:20", "50:12", "42:18"][index] : `${story.readingMinutes} min read`}</em></div></Link>)}</div></section>;
}

function Shorts({ content }: { content: VideoDetailContent }) {
  return <section><SectionHeader href="/videos#shorts-archive" title="Short clips" /><div className={styles.shorts}>{content.shorts.slice(0, 3).map((story, index) => <Link href={videoHref(story.article)} key={story.article.id}><span><Image alt={story.article.title} fill sizes="110px" src={imageOf(story.article)} /><i><Play /></i></span><b>{["Digital India is the foundation", "AI will amplify human potential", "Build for impact, not just scale"][index]}</b></Link>)}</div></section>;
}

function RelatedVideos({ content }: { content: VideoDetailContent }) {
  const labels = ["The Future of AI in India", "India Stack: The Global Model", "Entrepreneurship at Scale", "The Next Wave of Innovation"];
  return <section className={styles.related}><SectionHeader href="/videos" title="You might also like" /><div>{content.videos.slice(0, 4).map((story, index) => <article key={story.article.id}><Link href={videoHref(story.article)}><span><Image alt={story.article.title} fill sizes="260px" src={imageOf(story.article)} /><i><Play /></i><small>{["42:18", "35:22", "40:15", "33:40"][index]}</small></span><h3>{labels[index]}</h3><p>{18.6 - index * 1.3}K views</p></Link></article>)}</div></section>;
}

function Newsletter() { return <section className={styles.newsletter}><SectionHeader title="Stay updated with our videos" /><p>Get new video releases, behind-the-scenes insights and exclusive conversations.</p><NewsletterForm buttonLabel="Subscribe" label="Video updates" theme="light" /><small>No spam. Unsubscribe anytime.</small></section>; }

function BottomCta() { return <section className={styles.bottomCta}><div className={styles.devices}><Video /></div><article><h2>Real conversations. Real impact.</h2><p>Watch more insightful conversations with leaders and changemakers on The Perspective.</p><Link href="/videos">Explore all videos</Link></article><article><h2>Be featured on The Perspective</h2><p>Are you a leader, innovator or changemaker? Share your story with our global audience.</p><Link href="/search?q=be+featured">Apply to be featured</Link></article><div className={styles.studio}><Volume2 /></div></section>; }

export function VideoDetailPage({ article, content, related, slug }: { article: ArticleDetail; content: VideoDetailContent; related: readonly Article[]; slug: string }) {
  const seriesStories = content.videos.map((story) => story.article).filter((item) => item.id !== article.id);
  return <main className={styles.page}><div className={styles.shell}><Intro article={article} slug={slug} /><div className={styles.mainGrid}><div><Player /><ChaptersInsights /><Transcript /></div><aside className={styles.sideRail}><InVideo /><Speaker /><StoryList stories={related} title="Related articles" /><StoryList stories={seriesStories} title="More from this series" videos /><Shorts content={content} /></aside></div><div className={styles.discovery}><RelatedVideos content={content} /><Newsletter /></div><BottomCta /></div></main>;
}
