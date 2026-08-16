import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopicLandingPage } from "@/components/topic/topic-landing-page";
import { TopicDetailRedesign } from "@/components/topic/topic-detail-redesign";
import { siteConfig } from "@/config/site";
import { getAllTopics, getTopicBySlug } from "@/data/mock/topics";
import { createCollectionStructuredData } from "@/lib/category-structured-data";
import { resolveTopicLandingContent } from "@/lib/topics";

type TopicPageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllTopics().map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) notFound();

  const content = resolveTopicLandingContent(topic);
  const path = `/topic/${topic.slug}`;
  const image = content.leadArticle.heroImage;
  const images = image ? [{ url: image.src, width: image.width, height: image.height, alt: image.alt }] : undefined;

  return {
    title: topic.name,
    description: topic.description,
    alternates: { canonical: path },
    openGraph: { title: `${topic.name} | ${siteConfig.name}`, description: topic.description, type: "website", url: path, siteName: siteConfig.name, images },
    twitter: { card: "summary_large_image", title: `${topic.name} | ${siteConfig.name}`, description: topic.description, images: image ? [image.src] : undefined },
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) notFound();

  const content = resolveTopicLandingContent(topic);
  const structuredData = createCollectionStructuredData(`${topic.name} | ${siteConfig.name}`, `/topic/${topic.slug}`, topic.description, content.structuredArticles);

  return <>
    <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} type="application/ld+json" />
    <TopicDetailRedesign content={content} />
    <TopicLandingPage content={content} />
  </>;
}
