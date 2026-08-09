import type { ResolvedPersonalMagazineSummary } from "@/types";
import { siteConfig } from "@/config/site";
import { getPersonalMagazineDescription } from "@/lib/personal-magazines";

export function createPersonalMagazineStructuredData(profile: ResolvedPersonalMagazineSummary) {
  const url = `${siteConfig.url}/personal-magazines/${profile.magazine.slug}`;
  const image = profile.coverImage ? new URL(profile.coverImage.src, siteConfig.url).href : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${profile.person.name} — Personal Magazine`,
    description: getPersonalMagazineDescription(profile),
    url,
    mainEntity: {
      "@type": "Person",
      name: profile.person.name,
      jobTitle: profile.person.title,
      description: profile.person.biography,
      image,
      worksFor: profile.person.company ? { "@type": "Organization", name: profile.person.company } : undefined,
    },
  };
}
