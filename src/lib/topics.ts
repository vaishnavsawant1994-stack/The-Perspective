import type { Article, Topic, TopicLandingContent } from "@/types";
import { getArticleTags } from "@/data/mock/article-details";
import { articles, getArticleById, getArticlesByAuthor } from "@/data/mock/articles";
import { getAuthorById } from "@/data/mock/authors";
import { getTopicBySlug } from "@/data/mock/topics";

const normalize = (value: string) => value
  .toLowerCase()
  .replace(/&/g, " and ")
  .replace(/[^a-z0-9]+/g, " ")
  .trim()
  .replace(/\s+/g, " ");

const containsPhrase = (source: string, phrase: string) => ` ${normalize(source)} `.includes(` ${normalize(phrase)} `);

function requireArticle(id: string) {
  const article = getArticleById(id);
  if (!article) throw new Error(`Topic article not found: ${id}`);
  return article;
}

function uniqueArticles(items: readonly Article[]) {
  const seen = new Set<string>();
  return items.filter((article) => {
    if (seen.has(article.id)) return false;
    seen.add(article.id);
    return true;
  });
}

function resolveArticles(ids: readonly string[], excluded = new Set<string>()) {
  return uniqueArticles(ids.map(requireArticle)).filter((article) => !excluded.has(article.id));
}

export function articleMatchesTopic(article: Article, topic: Topic) {
  const topicName = normalize(topic.name);
  const topicSlug = normalize(topic.slug);
  const keywords = topic.keywords.map(normalize);
  const tags = getArticleTags(article);

  if (tags.some((tag) => normalize(tag.name) === topicName || normalize(tag.slug) === topicSlug)) return true;
  if (tags.some((tag) => keywords.some((keyword) => containsPhrase(tag.name, keyword)))) return true;

  const classification = [article.category.name, article.category.slug, article.subcategory ?? ""];
  if (classification.some((value) => keywords.some((keyword) => containsPhrase(value, keyword)))) return true;

  const text = [article.title, article.dek ?? "", article.excerpt].join(" ");
  return keywords.some((keyword) => containsPhrase(text, keyword));
}

export function getArticlesForTopic(topic: Topic) {
  return articles.filter((article) => articleMatchesTopic(article, topic));
}

export function getLatestArticlesForTopic(topic: Topic, excludedIds: ReadonlySet<string>, limit = 8) {
  return getArticlesForTopic(topic)
    .filter((article) => article.articleType !== "opinion" && !excludedIds.has(article.id))
    .sort((left, right) => (right.publishedAt ?? right.updatedAt).localeCompare(left.publishedAt ?? left.updatedAt))
    .slice(0, limit);
}

export function getRelatedTopics(topic: Topic) {
  return topic.relatedTopicSlugs.map(getTopicBySlug).filter((candidate): candidate is Topic => candidate !== undefined);
}

export function resolveTopicLandingContent(topic: Topic): TopicLandingContent {
  const used = new Set<string>();
  const take = (ids: readonly string[]) => {
    const resolved = resolveArticles(ids, used);
    resolved.forEach((article) => used.add(article.id));
    return resolved;
  };

  const leadArticle = requireArticle(topic.leadArticleId);
  used.add(leadArticle.id);
  const topStories = take(topic.topStoryIds);
  const essential = take(topic.essentialArticleIds);
  const analysis = take(topic.analysisArticleIds);
  const opinions = take(topic.opinionArticleIds).filter((article) => article.articleType === "opinion");
  const latest = getLatestArticlesForTopic(topic, used);
  latest.forEach((article) => used.add(article.id));
  const mostRead = resolveArticles(topic.mostReadArticleIds).slice(0, 5);

  const contributors = topic.featuredAuthorIds.flatMap((authorId) => {
    const author = getAuthorById(authorId);
    if (!author) throw new Error(`Topic author not found: ${authorId}`);
    const authoredArticles = getArticlesByAuthor(authorId);
    const latestArticle = authoredArticles.find((article) => articleMatchesTopic(article, topic)) ?? authoredArticles[0];
    return latestArticle ? [{ author, latestArticle }] : [];
  });

  const matchingArticles = getArticlesForTopic(topic);
  const curatedArticles = uniqueArticles([leadArticle, ...topStories, ...essential, ...analysis, ...opinions, ...mostRead]);

  return {
    topic,
    leadArticle,
    topStories,
    latest,
    essential,
    analysis,
    opinions,
    contributors,
    mostRead,
    relatedTopics: getRelatedTopics(topic),
    coverageCount: uniqueArticles([...matchingArticles, ...curatedArticles]).length,
    structuredArticles: uniqueArticles([leadArticle, ...topStories, ...essential]).slice(0, 8),
  };
}
