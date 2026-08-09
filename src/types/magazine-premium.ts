import type { Article, MagazineIssue } from "./content";

export type MagazinePremiumBenefit = {
  id: string;
  title: string;
  description: string;
};

export type MagazinePremiumThemeLink = {
  id: string;
  label: string;
  description: string;
  href: string;
};

export type MagazinePremiumComparison = {
  standard: readonly string[];
  premium: readonly string[];
};

export type MagazinePremiumPageConfig = {
  heroIssueId: string;
  featuredArticleIds: readonly string[];
  voiceArticleIds: readonly string[];
  benefits: readonly MagazinePremiumBenefit[];
  themeLinks: readonly MagazinePremiumThemeLink[];
  comparison: MagazinePremiumComparison;
};

export type MagazinePremiumStory = {
  article: Article;
  issue: MagazineIssue;
  sectionLabel: string;
};

export type MagazinePremiumPageContent = {
  heroIssue: MagazineIssue;
  heroStories: readonly MagazinePremiumStory[];
  premiumIssues: readonly MagazineIssue[];
  featuredStories: readonly MagazinePremiumStory[];
  voiceStories: readonly MagazinePremiumStory[];
  readerIssues: readonly MagazineIssue[];
  archiveIssues: readonly MagazineIssue[];
  benefits: readonly MagazinePremiumBenefit[];
  themeLinks: readonly MagazinePremiumThemeLink[];
  comparison: MagazinePremiumComparison;
  digitalReaderHref: string;
  storyCount: number;
};
