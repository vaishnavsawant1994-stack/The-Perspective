import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExecutiveProfileDetail } from "@/components/person/executive-profile-detail";
import { PersonalMagazineProfilePage } from "@/components/personal-magazine/personal-magazine-profile-page";
import { siteConfig } from "@/config/site";
import { getPersonBySlug, people } from "@/data/mock/people";
import { getExecutiveProfileContent } from "@/lib/person-profiles";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return people.map((person) => ({ slug: person.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const person = getPersonBySlug(slug);
  if (!person) notFound();
  const title = `${person.name} | Executive Profile`;
  const description = `${person.biography} Explore interviews, career milestones, expertise and coverage from The Perspective.`;
  const images = person.portrait ? [{ url: person.portrait.src, width: person.portrait.width, height: person.portrait.height, alt: person.portrait.alt }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: `/people/${person.slug}` },
    openGraph: { title: `${title} | ${siteConfig.name}`, description, type: "profile", url: `/people/${person.slug}`, siteName: siteConfig.name, images },
    twitter: { card: images ? "summary_large_image" : "summary", title, description, images: images?.map((image) => image.url) },
  };
}

export default async function ExecutiveProfileRoute({ params }: Props) {
  const { slug } = await params;
  const person = getPersonBySlug(slug);
  if (!person) notFound();
  const content = getExecutiveProfileContent(person);
  const canonicalUrl = `${siteConfig.url}/people/${person.slug}`;
  const structuredData = { "@context": "https://schema.org", "@type": "ProfilePage", name: `${person.name} executive profile`, url: canonicalUrl, mainEntity: { "@type": "Person", name: person.name, description: person.biography, jobTitle: person.title, worksFor: person.company ? { "@type": "Organization", name: person.company } : undefined, image: person.portrait ? new URL(person.portrait.src, siteConfig.url).href : undefined, knowsAbout: person.expertise } };
  return <>
    <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} type="application/ld+json" />
    <ExecutiveProfileDetail content={content} />
    {content.personalMagazine ? <section aria-label={`${person.name} existing Personal Magazine profile`}><PersonalMagazineProfilePage profile={content.personalMagazine} /></section> : null}
  </>;
}
