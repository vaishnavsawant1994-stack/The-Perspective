import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthorProfilePage } from "@/components/author/author-profile-page";
import { AuthorProfileDetailRedesign } from "@/components/author/author-profile-detail-redesign";
import { PublishedAuthorView } from "@/components/magazine/published/published-projection";
import { siteConfig } from "@/config/site";
import { getAuthorProfileBySlug, getPublicAuthors } from "@/data/mock/author-profiles";
import { publicSlug, publishedCatalogue, type PublishedArticleCard } from "@/modules/r9/projection";

type AuthorPageProps = { params: Promise<{ slug: string }> };

const profileDescription = (name: string, biography: string) => `Read essays, reporting and analysis from ${name}. ${biography}`;

export const dynamic = "force-dynamic";
export const dynamicParams = true;

async function publishedByAuthor(slug: string) {
  const issues = await publishedCatalogue();
  const articles: PublishedArticleCard[] = [];
  for (const issue of issues) {
    for (const article of issue.articles) {
      if (article.author && publicSlug(article.author) === slug) articles.push(article);
    }
  }
  return articles;
}

export function generateStaticParams() {
  return getPublicAuthors().map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = getAuthorProfileBySlug(slug);
  const published = await publishedByAuthor(slug);
  if (!profile && published.length === 0) return { title: "Not found", robots: { index: false, follow: false } };
  if (!profile) {
    const name = published[0]?.author ?? slug;
    const description = `Published stories by ${name}.`;
    return {
      title: name,
      description,
      alternates: { canonical: `/author/${slug}` },
      openGraph: { title: `${name} | ${siteConfig.name}`, description, type: "profile", url: `/author/${slug}`, siteName: siteConfig.name },
    };
  }

  const { author } = profile;
  const description = profileDescription(author.name, author.biography);
  const path = `/author/${author.slug}`;
  const title = `${author.name} | ${author.role ? `${author.role} & Contributor` : "Contributor"}`;
  const images = author.avatar ? [{
    url: author.avatar.src,
    width: author.avatar.width,
    height: author.avatar.height,
    alt: author.avatar.alt,
  }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      type: "profile",
      url: path,
      siteName: siteConfig.name,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: `${title} | ${siteConfig.name}`,
      description,
      images: author.avatar ? [author.avatar.src] : undefined,
    },
  };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const profile = getAuthorProfileBySlug(slug);
  const published = await publishedByAuthor(slug);
  if (!profile && published.length === 0) notFound();
  if (!profile) return <PublishedAuthorView articles={published} name={published[0]?.author ?? slug} />;

  const { author } = profile;
  const canonicalUrl = `${siteConfig.url}/author/${author.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${author.name} contributor profile`,
    description: profileDescription(author.name, author.biography),
    url: canonicalUrl,
    mainEntity: {
      "@type": "Person",
      name: author.name,
      description: author.biography,
      jobTitle: author.role,
      url: canonicalUrl,
      image: author.avatar ? new URL(author.avatar.src, siteConfig.url).href : undefined,
      knowsAbout: author.expertise,
      sameAs: author.socials?.map((social) => social.url),
    },
  };

  return <>
    <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} type="application/ld+json" />
    {published.length > 0 ? <PublishedAuthorView articles={published} name={author.name} /> : null}
    <AuthorProfileDetailRedesign profile={profile} />
    <AuthorProfilePage profile={profile} />
  </>;
}
