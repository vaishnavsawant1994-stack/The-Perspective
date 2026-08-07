import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleReader } from "@/components/article/article-reader";
import { siteConfig } from "@/config/site";
import { getArticleDetailBySlug, getRelatedArticles } from "@/data/mock/article-details";
import { articles } from "@/data/mock/articles";
import { homeContent } from "@/data/mock/homepage";
import { magazineIssues } from "@/data/mock/magazines";

type ArticlePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params; const article = getArticleDetailBySlug(slug); if (!article) notFound();
  const description = article.dek ?? article.excerpt; const path = `/article/${article.slug}`;
  const images = article.heroImage ? [{ url: article.heroImage.src, width: article.heroImage.width, height: article.heroImage.height, alt: article.heroImage.alt }] : undefined;
  return { title: article.title, description, alternates: { canonical: path }, openGraph: { title: `${article.title} | ${siteConfig.name}`, description, type: "article", url: path, siteName: siteConfig.name, publishedTime: article.publishedAt, modifiedTime: article.updatedAt, authors: article.authors.map((author) => author.name), section: article.category.name, images }, twitter: { card: "summary_large_image", title: `${article.title} | ${siteConfig.name}`, description, images: article.heroImage ? [article.heroImage.src] : undefined } };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params; const article = getArticleDetailBySlug(slug); if (!article) notFound();
  const relatedStories = getRelatedArticles(article); const author = article.authors[0]; const canonicalUrl = `${siteConfig.url}/article/${article.slug}`;
  const structuredData = { "@context": "https://schema.org", "@type": article.articleType === "news" ? "NewsArticle" : "Article", headline: article.title, description: article.dek ?? article.excerpt, datePublished: article.publishedAt, dateModified: article.updatedAt, mainEntityOfPage: canonicalUrl, articleSection: article.category.name, author: author ? { "@type": "Person", name: author.name, url: `${siteConfig.url}/author/${author.slug}` } : undefined, image: article.heroImage ? [new URL(article.heroImage.src, siteConfig.url).href] : undefined, publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url } };
  return <><script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} type="application/ld+json" /><ArticleReader article={article} magazineIssue={magazineIssues[0]} mostRead={homeContent.mostRead} relatedStories={relatedStories} /></>;
}
