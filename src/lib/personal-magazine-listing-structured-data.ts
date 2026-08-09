import type { ResolvedPersonalMagazineSummary } from "@/types";
import { siteConfig } from "@/config/site";

export function createPersonalMagazineListingStructuredData(items: readonly ResolvedPersonalMagazineSummary[], description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Personal Magazines | The Perspective",
    description,
    url: `${siteConfig.url}/personal-magazines`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map(({ magazine, person }, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteConfig.url}/personal-magazines/${magazine.slug}`,
        name: `${person.name}: ${magazine.coverHeadline}`,
      })),
    },
  };
}
