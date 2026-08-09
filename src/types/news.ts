import type { Article } from "./content";
import type { CategoryPromotion } from "./category";

export type NewsTopicCluster = {
  label: string;
  description: string;
  articles: readonly Article[];
  href: string;
};

export type NewsCoverageDestination = {
  label: string;
  description: string;
  href: string;
};

export type NewsDeskSection = {
  label: string;
  description: string;
  href: string;
  actionLabel: string;
  feature: Article;
  supporting: readonly Article[];
};

export type NewsLandingContent = {
  developing: readonly Article[];
  topStories: { lead: Article; supporting: readonly Article[]; headlines: readonly Article[] };
  topics: readonly NewsTopicCluster[];
  coverage: readonly NewsCoverageDestination[];
  business: NewsDeskSection;
  leadership: NewsDeskSection;
  technology: NewsDeskSection;
  markets: NewsDeskSection;
  globalAffairs: NewsDeskSection;
  trendingTopics: readonly { label: string; href: string }[];
  analysis: readonly Article[];
  mostRead: readonly Article[];
  latestUpdates: readonly Article[];
  promotion: CategoryPromotion;
};
