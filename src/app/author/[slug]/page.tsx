import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthorProfilePage } from "@/components/author/author-profile-page";
import { siteConfig } from "@/config/site";
import { getAuthorProfileBySlug, getPublicAuthors } from "@/data/mock/author-profiles";

type AuthorPageProps = { params: Promise<{ slug: string }> };

const profileDescription = (name: string, biography: string) => `Read essays, reporting and analysis from ${name}. ${biography}`;

export const dynamicParams = false;

export function generateStaticParams() {
  return getPublicAuthors().map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = getAuthorProfileBySlug(slug);
  if (!profile) notFound();

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
  if (!profile) notFound();

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
    <AuthorProfilePage profile={profile} />
  </>;
}
