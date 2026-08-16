import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleReader } from "@/components/article/article-reader";
import { PodcastEpisodeDetail } from "@/components/podcast/podcast-episode-detail";
import { siteConfig } from "@/config/site";
import { getArticleDetailBySlug, getRelatedArticles } from "@/data/mock/article-details";
import { homeContent } from "@/data/mock/homepage";
import { magazineIssues } from "@/data/mock/magazines";
import { getPodcastEpisodeContent, getPodcastEpisodeParams } from "@/lib/podcast-shows";

type RouteProps = { params: Promise<{ slug: string; episodeSlug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getPodcastEpisodeParams();
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug, episodeSlug } = await params;
  const content = getPodcastEpisodeContent(slug, episodeSlug);
  if (!content) return {};
  const special = content.episodeIndex === 0 && slug === "the-leadership-dialogues";
  const title = special ? "Building the Future: Arjun Mehta on Innovation, Leadership and Purpose" : content.episode.article.title;
  const description = special ? "Arjun Mehta joins Ananya Mehta for a conversation about innovation, leadership, AI transformation and purpose." : content.episode.article.excerpt;
  const url = `/podcasts/${slug}/${episodeSlug}`;
  return { title: { absolute: `${title} | The Perspective Podcast` }, description, alternates: { canonical: url }, openGraph: { title, description, type: "website", siteName: siteConfig.name, url, images: content.episode.article.heroImage ? [{ url: content.episode.article.heroImage.src, alt: title }] : undefined }, twitter: { card: "summary_large_image", title, description, images: content.episode.article.heroImage ? [content.episode.article.heroImage.src] : undefined } };
}

export default async function PodcastEpisodeRoute({ params }: RouteProps) {
  const { slug, episodeSlug } = await params;
  const content = getPodcastEpisodeContent(slug, episodeSlug);
  if (!content) notFound();
  const article = getArticleDetailBySlug(content.episode.article.slug);
  if (!article) notFound();
  const related = getRelatedArticles(article);
  return <>
    <PodcastEpisodeDetail article={article} content={content} related={related} />
    <section aria-labelledby="original-episode-story" style={{ borderTop: "1px solid #e6dfd5", marginTop: "48px", paddingTop: "44px" }}>
      <div style={{ margin: "0 auto 30px", maxWidth: "1440px", padding: "0 clamp(20px, 4vw, 64px)" }}><p style={{ color: "#a75c13", fontSize: "12px", fontWeight: 800, letterSpacing: ".1em", margin: "0 0 8px", textTransform: "uppercase" }}>Original editorial experience</p><h2 id="original-episode-story" style={{ fontFamily: "Georgia, serif", fontSize: "clamp(30px,4vw,52px)", margin: 0 }}>Continue with the complete long-form story</h2></div>
      <ArticleReader article={article} magazineIssue={magazineIssues[0]} mostRead={homeContent.mostRead} relatedStories={related} />
    </section>
  </>;
}
