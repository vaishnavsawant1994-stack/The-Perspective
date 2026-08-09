import type { Magazine, MagazineIssue } from "@/types";
import { siteConfig } from "@/config/site";

export function createMagazineStructuredData(magazine: Magazine, issues: readonly MagazineIssue[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${magazine.title} Magazine`,
    description: magazine.description,
    url: `${siteConfig.url}/magazine`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: issues.map((issue, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "CreativeWork",
          name: issue.coverHeadline,
          description: issue.description,
          datePublished: issue.publicationDate,
          image: issue.coverImage ? new URL(issue.coverImage.src, siteConfig.url).href : undefined,
        },
      })),
    },
  };
}
