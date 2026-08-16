import type { Metadata } from "next";
import { PersonalMagazineCreatePage } from "@/components/personal-magazine/personal-magazine-create-page";
import { PersonalMagazinesRedesign } from "@/components/personal-magazine/personal-magazines-redesign";
import { siteConfig } from "@/config/site";
import { getResolvedPersonalMagazineSummaries } from "@/lib/personal-magazines";

const title = "Create Your Personal Magazine | The Perspective";
const description = "Turn your leadership journey into a premium editorial Personal Magazine with professional interviews, writing, design and digital publication.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/personal-magazines/create" },
  openGraph: {
    title,
    description,
    type: "website",
    url: "/personal-magazines/create",
    siteName: siteConfig.name,
    images: [{
      url: "/images/personal-magazines/arjun-mehta-hero-v3.webp",
      width: 1024,
      height: 1536,
      alt: "Create a Personal Magazine with The Perspective",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/personal-magazines/arjun-mehta-hero-v3.webp"],
  },
};

export default function CreatePersonalMagazineRoute() {
  const editions = getResolvedPersonalMagazineSummaries();

  return <>
    <PersonalMagazineCreatePage editions={editions} />
    <section aria-label="The existing Personal Magazines presentation">
      <PersonalMagazinesRedesign editions={editions} />
    </section>
  </>;
}
