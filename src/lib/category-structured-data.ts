import { siteConfig } from "@/config/site";
import type { Article, CategoryLandingContent } from "@/types";

export function createCollectionStructuredData(name: string, path: string, description: string, articles: readonly Article[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: `${siteConfig.url}${path}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteConfig.url}/article/${article.slug}`,
        name: article.title,
      })),
    },
  };
}

export function createCategoryStructuredData(content: CategoryLandingContent, description: string) {
  const majorStories = [content.lead.primary, ...content.lead.supporting, ...content.topStories];
  return createCollectionStructuredData(`${content.label} | ${siteConfig.name}`, `/${content.slug}`, description, majorStories);
}
