import { siteConfig } from "@/config/site";
import type { CategoryLandingContent } from "@/types";

export function createCategoryStructuredData(content: CategoryLandingContent, description: string) {
  const majorStories = [content.lead.primary, ...content.lead.supporting, ...content.topStories];

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${content.label} | ${siteConfig.name}`,
    description,
    url: `${siteConfig.url}/${content.slug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: majorStories.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteConfig.url}/article/${article.slug}`,
        name: article.title,
      })),
    },
  };
}
