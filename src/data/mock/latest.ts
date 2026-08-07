import { articles, getArticleById } from "./articles";
import { homeContent } from "./homepage";
import { magazineIssues } from "./magazines";

export const latestFilterCategories = ["All", "Business", "Leadership", "Technology", "Finance", "Markets", "Culture", "Lifestyle", "Opinion"] as const;
export type LatestFilterCategory = (typeof latestFilterCategories)[number];

const latestEditionStart = "2026-08-05T00:00:00+05:30";
export const latestArticles = articles
  .filter((article) => (article.publishedAt ?? "") >= latestEditionStart)
  .sort((left, right) => (right.publishedAt ?? "").localeCompare(left.publishedAt ?? ""));
export const latestLeadIds = ["article-global-companies-reassess", "article-enterprise-ai-phase", "article-asian-markets-advance", "article-boards-succession"] as const;
export const latestLeadArticles = latestLeadIds.map(getArticleById).filter((article) => article !== undefined);
export const latestInDepth = getArticleById("article-forces-global-economy")!;
export const latestMostRead = homeContent.mostRead;
export const latestMagazineIssue = magazineIssues[0];
