import type { Article, Author } from "./content";

export type TopicCoverageDestination = {
  label: string;
  description: string;
  href: string;
};

export type Topic = {
  id: string;
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  shortDescription: string;
  whatMatters: string;
  leadArticleId: string;
  topStoryIds: readonly string[];
  essentialArticleIds: readonly string[];
  analysisArticleIds: readonly string[];
  opinionArticleIds: readonly string[];
  featuredAuthorIds: readonly string[];
  mostReadArticleIds: readonly string[];
  relatedTopicSlugs: readonly string[];
  relatedCoverage: readonly TopicCoverageDestination[];
  keywords: readonly string[];
  briefingTitle?: string;
};

export type TopicContributor = {
  author: Author;
  latestArticle: Article;
};

export type TopicLandingContent = {
  topic: Topic;
  leadArticle: Article;
  topStories: readonly Article[];
  latest: readonly Article[];
  essential: readonly Article[];
  analysis: readonly Article[];
  opinions: readonly Article[];
  contributors: readonly TopicContributor[];
  mostRead: readonly Article[];
  relatedTopics: readonly Topic[];
  coverageCount: number;
  structuredArticles: readonly Article[];
};
