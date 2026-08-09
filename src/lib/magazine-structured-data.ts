import type { Magazine, MagazineCategory, MagazineIssue } from "@/types";
import { siteConfig } from "@/config/site";

function createIssueList(issues: readonly MagazineIssue[], fallbackPath = "/magazine/archive") {
  return {
    "@type": "ItemList",
    numberOfItems: issues.length,
    itemListElement: issues.map((issue, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "PublicationIssue",
        name: issue.coverHeadline,
        description: issue.description,
        datePublished: issue.publicationDate,
        issueNumber: issue.issueNumber,
        url: issue.readerAvailable ? `${siteConfig.url}/magazine/read/${issue.slug}` : `${siteConfig.url}${fallbackPath}`,
        image: issue.coverImage ? new URL(issue.coverImage.src, siteConfig.url).href : undefined,
        isPartOf: { "@type": "Periodical", name: "The Perspective Magazine", url: `${siteConfig.url}/magazine` },
      },
    })),
  };
}

export function createMagazineStructuredData(magazine: Magazine, issues: readonly MagazineIssue[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${magazine.title} Magazine`,
    description: magazine.description,
    url: `${siteConfig.url}/magazine`,
    mainEntity: createIssueList(issues),
  };
}

export function createMagazineArchiveStructuredData(issues: readonly MagazineIssue[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Magazine Archive",
    description: "Browse past issues of The Perspective Magazine, including leadership, business, technology, Premium editions and digital issues.",
    url: `${siteConfig.url}/magazine/archive`,
    isPartOf: { "@type": "Periodical", name: "The Perspective Magazine", url: `${siteConfig.url}/magazine` },
    mainEntity: createIssueList(issues),
  };
}

export function createMagazinePremiumStructuredData(issues: readonly MagazineIssue[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Premium Magazine",
    description: "Explore Premium editions of The Perspective Magazine, featuring deeper interviews, long-form analysis, special issues and exclusive editorial packages.",
    url: `${siteConfig.url}/magazine/premium`,
    isPartOf: { "@type": "Periodical", name: "The Perspective Magazine", url: `${siteConfig.url}/magazine` },
    mainEntity: createIssueList(issues, "/magazine/premium"),
  };
}

export function createMagazineSubscriptionStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Subscribe to The Perspective Magazine",
    description: "Compare The Perspective Magazine subscription options for digital editions, archive access and Premium editorial experiences.",
    url: `${siteConfig.url}/magazine/subscribe`,
    isPartOf: { "@type": "Periodical", name: "The Perspective Magazine", url: `${siteConfig.url}/magazine` },
  };
}

export function createMagazineCategoryStructuredData(category: MagazineCategory, issues: readonly MagazineIssue[]) {
  const url = `${siteConfig.url}/magazine/category/${category.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} Magazine`,
    description: category.description,
    url,
    isPartOf: { "@type": "Periodical", name: "The Perspective Magazine", url: `${siteConfig.url}/magazine` },
    mainEntity: {
      ...createIssueList(issues),
      itemListElement: issues.map((issue, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "PublicationIssue",
          name: issue.coverHeadline,
          description: issue.description,
          datePublished: issue.publicationDate,
          issueNumber: issue.issueNumber,
          url: issue.readerAvailable ? `${siteConfig.url}/magazine/read/${issue.slug}` : url,
          image: issue.coverImage ? new URL(issue.coverImage.src, siteConfig.url).href : undefined,
          isPartOf: { "@type": "Periodical", name: "The Perspective Magazine", url: `${siteConfig.url}/magazine` },
        },
      })),
    },
  };
}
