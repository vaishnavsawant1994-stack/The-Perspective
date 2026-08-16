import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleReader } from "@/components/article/article-reader";
import { VideoDetailPage } from "@/components/video/video-detail-page";
import { siteConfig } from "@/config/site";
import { getArticleDetailBySlug, getRelatedArticles } from "@/data/mock/article-details";
import { homeContent } from "@/data/mock/homepage";
import { magazineIssues } from "@/data/mock/magazines";
import { getVideoDetailContent, getVideoDetailParams } from "@/lib/video-detail";

type RouteProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getVideoDetailParams();
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const content = getVideoDetailContent(slug);
  if (!content) return {};
  const featured = slug === "indias-digital-decade-road-ahead";
  const title = featured ? "India’s Digital Decade: The Road Ahead" : content.story.article.title;
  const description = featured ? "Nandan Nilekani on digital public infrastructure, AI, entrepreneurship and India’s next growth chapter." : content.story.article.excerpt;
  const url = `/videos/${slug}`;
  return { title: { absolute: `${title} | The Perspective Videos` }, description, alternates: { canonical: url }, openGraph: { title, description, type: "video.other", url, siteName: siteConfig.name, images: content.story.article.heroImage ? [{ url: content.story.article.heroImage.src, alt: title }] : undefined }, twitter: { card: "summary_large_image", title, description, images: content.story.article.heroImage ? [content.story.article.heroImage.src] : undefined } };
}

export default async function VideoDetailRoute({ params }: RouteProps) {
  const { slug } = await params;
  const content = getVideoDetailContent(slug);
  if (!content) notFound();
  const article = getArticleDetailBySlug(content.story.article.slug);
  if (!article) notFound();
  const related = getRelatedArticles(article);
  return <>
    <VideoDetailPage article={article} content={content} related={related} slug={slug} />
    <section aria-labelledby="existing-video-content" style={{ borderTop: "1px solid #e5ddd3", marginTop: "48px", paddingTop: "44px" }}>
      <div style={{ margin: "0 auto 30px", maxWidth: "1440px", padding: "0 clamp(20px,4vw,64px)" }}><p style={{ color: "#a75c13", fontSize: "12px", fontWeight: 800, letterSpacing: ".1em", margin: "0 0 8px", textTransform: "uppercase" }}>Original editorial experience</p><h2 id="existing-video-content" style={{ fontFamily: "Georgia,serif", fontSize: "clamp(30px,4vw,52px)", margin: 0 }}>Continue with the complete long-form story</h2></div>
      <ArticleReader article={article} magazineIssue={magazineIssues[0]} mostRead={homeContent.mostRead} relatedStories={related} />
    </section>
  </>;
}
