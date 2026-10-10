import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PersonalMagazineProfilePage } from "@/components/personal-magazine/personal-magazine-profile-page";
import { PersonalMagazineProfileRedesign } from "@/components/personal-magazine/personal-magazine-profile-redesign";
import { PublishedShelfView } from "@/components/magazine/published/published-projection";
import { siteConfig } from "@/config/site";
import { personalMagazines } from "@/data/mock/personal-magazines";
import { createPersonalMagazineStructuredData } from "@/lib/personal-magazine-structured-data";
import { getPersonalMagazineDescription, getResolvedPersonalMagazineBySlug, validatePersonalMagazineData } from "@/lib/personal-magazines";
import { publishedShelf } from "@/modules/r9/projection";

type PersonalMagazineRouteProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export function generateStaticParams() {
  return personalMagazines.map((magazine) => ({ slug: magazine.slug }));
}

export async function generateMetadata({ params }: PersonalMagazineRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = getResolvedPersonalMagazineBySlug(slug);
  const shelf = await publishedShelf(slug);
  if (!profile && !shelf) notFound();
  if (!profile && shelf) {
    const description = shelf.description || `Published stories from ${shelf.name}.`;
    return {
      title: { absolute: `${shelf.name} — Personal Magazine | The Perspective` },
      description,
      alternates: { canonical: `/personal-magazines/${shelf.slug}` },
      openGraph: { title: shelf.name, description, type: "website", url: `/personal-magazines/${shelf.slug}`, siteName: siteConfig.name },
    };
  }
  if (!profile) notFound();
  const title = `${profile.person.name} — Personal Magazine | The Perspective`;
  const description = getPersonalMagazineDescription(profile);
  const images = profile.coverImage ? [{ url: profile.coverImage.src, width: profile.coverImage.width, height: profile.coverImage.height, alt: `${profile.person.name} Personal Magazine` }] : undefined;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/personal-magazines/${profile.magazine.slug}` },
    openGraph: { title, description, type: "website", url: `/personal-magazines/${profile.magazine.slug}`, siteName: siteConfig.name, images },
    twitter: { card: "summary_large_image", title, description, images: images?.map((image) => image.url) },
  };
}

export default async function PersonalMagazineRoute({ params }: PersonalMagazineRouteProps) {
  const validationErrors = validatePersonalMagazineData();
  if (validationErrors.length > 0) throw new Error(`Invalid Personal Magazine data:\n${validationErrors.join("\n")}`);
  const { slug } = await params;
  const profile = getResolvedPersonalMagazineBySlug(slug);
  const shelf = await publishedShelf(slug);
  if (!profile && !shelf) notFound();
  if (!profile && shelf) return <PublishedShelfView shelf={shelf} />;
  if (!profile) notFound();
  const structuredData = createPersonalMagazineStructuredData(profile);
  return <>
    <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} type="application/ld+json" />
    {shelf ? <PublishedShelfView shelf={shelf} /> : null}
    <PersonalMagazineProfileRedesign profile={profile} />
    <PersonalMagazineProfilePage profile={profile} />
  </>;
}
