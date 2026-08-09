import type { Article, Author } from "./content";

export type AuthorTopic = {
  name: string;
  slug: string;
  description: string;
};

export type AuthorProfileConfig = {
  authorId: string;
  featuredArticleId: string;
  essentialArticleIds: readonly string[];
  mostReadArticleIds: readonly string[];
  topics: readonly AuthorTopic[];
};

export type AuthorProfileData = {
  author: Author;
  articles: readonly Article[];
  featuredArticle: Article;
  latestArticles: readonly Article[];
  essentialArticles: readonly Article[];
  mostReadArticles: readonly Article[];
  topics: readonly AuthorTopic[];
};
