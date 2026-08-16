import type { Article, Author, PersonProfile } from "@/types";
import { getArticleById } from "@/data/mock/articles";
import { getAuthorById } from "@/data/mock/authors";
import { homepageRedesignConfig } from "@/data/mock/homepage-redesign";
import { magazineIssues } from "@/data/mock/magazines";
import { getPersonById } from "@/data/mock/people";
import { getResolvedPersonalMagazineSummaries } from "@/lib/personal-magazines";

const resolveArticles = (ids: readonly string[]) => ids.map(getArticleById).filter((article): article is Article => article !== undefined);
const resolveAuthors = (ids: readonly string[]) => ids.map(getAuthorById).filter((author): author is Author => author !== undefined);

export function getHomepageRedesignContent() {
  const heroSlides = homepageRedesignConfig.heroSlides.flatMap((slide) => {
    const article = getArticleById(slide.articleId);
    const person = getPersonById(slide.personId);
    return article && person ? [{ ...slide, article, person }] : [];
  });
  if (!heroSlides.length) return undefined;

  return {
    heroSlides,
    breaking: resolveArticles(homepageRedesignConfig.breakingArticleIds),
    dailyFeature: getArticleById(homepageRedesignConfig.dailyFeatureId),
    newsCategoryColumns: homepageRedesignConfig.newsCategoryColumns.map((column) => ({ ...column, articles: resolveArticles(column.articleIds) })),
    liveUpdates: homepageRedesignConfig.liveUpdates.flatMap((update) => {
      const article = getArticleById(update.articleId);
      return article ? [{ ...update, article }] : [];
    }),
    editorsPicks: resolveArticles(homepageRedesignConfig.editorsPickIds),
    latestStories: homepageRedesignConfig.latestStories.flatMap((story) => {
      const article = getArticleById(story.articleId);
      return article ? [{ ...story, article }] : [];
    }),
    magazineIssues: magazineIssues.slice(0, 12),
    personalMagazines: getResolvedPersonalMagazineSummaries(),
    podcastEpisodes: homepageRedesignConfig.podcastEpisodes.flatMap((episode) => {
      const article = getArticleById(episode.articleId);
      return article ? [{ ...episode, article }] : [];
    }),
    videos: resolveArticles(homepageRedesignConfig.videoArticleIds).map((article, index) => ({ article, duration: homepageRedesignConfig.videoDurations[index] ?? "08:00" })),
    shorts: resolveArticles(homepageRedesignConfig.shortArticleIds).map((article, index) => ({ article, duration: homepageRedesignConfig.shortDurations[index] ?? "00:45" })),
    editorBlogs: resolveArticles(homepageRedesignConfig.editorBlogIds),
    featuredAuthors: resolveAuthors(homepageRedesignConfig.featuredAuthorIds),
    trending: resolveArticles(homepageRedesignConfig.trendingArticleIds),
    reports: homepageRedesignConfig.reports.flatMap((report) => {
      const article = getArticleById(report.articleId);
      return article ? [{ ...report, article }] : [];
    }),
    events: homepageRedesignConfig.events,
    executiveInsights: resolveArticles(homepageRedesignConfig.executiveInsightIds),
    companySpotlights: resolveArticles(homepageRedesignConfig.companySpotlightIds),
    personalities: homepageRedesignConfig.personalities,
  };
}

export function validateHomepageRedesignData() {
  const errors: string[] = [];
  const content = getHomepageRedesignContent();
  if (!content) return ["Homepage hero slides could not be resolved."];

  const expectedCounts = [
    ["hero slides", content.heroSlides.length, homepageRedesignConfig.heroSlides.length],
    ["breaking stories", content.breaking.length, homepageRedesignConfig.breakingArticleIds.length],
    ["news category columns", content.newsCategoryColumns.length, homepageRedesignConfig.newsCategoryColumns.length],
    ["live updates", content.liveUpdates.length, homepageRedesignConfig.liveUpdates.length],
    ["editor picks", content.editorsPicks.length, homepageRedesignConfig.editorsPickIds.length],
    ["latest stories", content.latestStories.length, homepageRedesignConfig.latestStories.length],
    ["podcast episodes", content.podcastEpisodes.length, homepageRedesignConfig.podcastEpisodes.length],
    ["videos", content.videos.length, homepageRedesignConfig.videoArticleIds.length],
    ["shorts", content.shorts.length, homepageRedesignConfig.shortArticleIds.length],
    ["featured authors", content.featuredAuthors.length, homepageRedesignConfig.featuredAuthorIds.length],
    ["reports", content.reports.length, homepageRedesignConfig.reports.length],
    ["personalities", content.personalities.length, homepageRedesignConfig.personalities.length],
  ] as const;
  for (const [label, actual, expected] of expectedCounts) if (actual !== expected) errors.push(`Homepage expected ${expected} ${label}, received ${actual}.`);
  if (!content.dailyFeature) errors.push("Homepage daily feature could not be resolved.");
  for (const column of content.newsCategoryColumns) if (column.articles.length !== column.articleIds.length) errors.push(`Homepage ${column.title} news column has unresolved articles.`);
  if (content.personalMagazines.length < 3) errors.push("Homepage requires the three canonical Personal Magazines.");
  if (content.heroSlides.some((slide) => !slide.portrait.src.includes("cutout"))) errors.push("Every homepage hero slide must use a transparent cut-out asset.");
  return errors;
}

export type HomepageRedesignContent = NonNullable<ReturnType<typeof getHomepageRedesignContent>>;
export type HomepageHeroPerson = PersonProfile;
