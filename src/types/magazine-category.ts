import type { Article, MagazineIssue } from "./content";

export type MagazineCategoryCoverage = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
};

export type MagazineCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  supportingLine: string;
  metadataDescription: string;
  issueThemeKeywords: readonly string[];
  sectionKeywords: readonly string[];
  articleKeywords: readonly string[];
  articleCategorySlugs: readonly string[];
  featuredIssueIds: readonly string[];
  featuredArticleIds: readonly string[];
  relatedCategorySlugs: readonly string[];
  archiveThemeLabels: readonly string[];
  archiveQuery: string;
  currentCoverage: MagazineCategoryCoverage;
  includePremium?: boolean;
};

export type MagazineCategoryStory = {
  article: Article;
  issue: MagazineIssue;
  sectionLabel: string;
};

export type MagazineCategoryContent = {
  category: MagazineCategory;
  featuredIssue: MagazineIssue;
  featuredIssueStories: readonly MagazineCategoryStory[];
  featuredStories: readonly MagazineCategoryStory[];
  matchingIssues: readonly MagazineIssue[];
  archiveStories: readonly MagazineCategoryStory[];
  readerIssues: readonly MagazineIssue[];
  premiumIssues: readonly MagazineIssue[];
  historicalIssues: readonly MagazineIssue[];
  relatedCategories: readonly MagazineCategory[];
  storyCount: number;
};
