import { getHomepageRedesignContent } from "@/lib/homepage-redesign";
import { getPodcastShowBySlug, podcastShows } from "@/data/mock/podcast-shows";

export function getPodcastShowContent(slug: string) {
  const show = getPodcastShowBySlug(slug);
  const homepage = getHomepageRedesignContent();
  if (!show || !homepage) return undefined;

  const episodes = show.episodeIds.flatMap((id) => {
    const episode = homepage.podcastEpisodes.find((item) => item.id === id);
    return episode ? [episode] : [];
  });
  if (!episodes.length) return undefined;

  return { show, episodes, homepage };
}

export function getPodcastEpisodeSlug(showSlug: string, articleSlug: string, index: number) {
  if (showSlug === "the-leadership-dialogues" && index === 0) return "building-the-future-arjun-mehta";
  return articleSlug;
}

export function getPodcastEpisodeContent(showSlug: string, episodeSlug: string) {
  const showContent = getPodcastShowContent(showSlug);
  if (!showContent) return undefined;
  const episodeIndex = showContent.episodes.findIndex((episode, index) => getPodcastEpisodeSlug(showSlug, episode.article.slug, index) === episodeSlug);
  if (episodeIndex < 0) return undefined;
  const episode = showContent.episodes[episodeIndex];
  return { ...showContent, episode, episodeIndex };
}

export function getPodcastEpisodeParams() {
  return podcastShows.flatMap((show) => {
    const content = getPodcastShowContent(show.slug);
    return content?.episodes.map((episode, index) => ({ slug: show.slug, episodeSlug: getPodcastEpisodeSlug(show.slug, episode.article.slug, index) })) ?? [];
  });
}

export function validatePodcastShowData() {
  return podcastShows.flatMap((show) => {
    const content = getPodcastShowContent(show.slug);
    if (!content) return [`Podcast show ${show.slug} could not be resolved.`];
    if (content.episodes.length !== show.episodeIds.length) return [`Podcast show ${show.slug} has unresolved episodes.`];
    return [];
  });
}

export type PodcastShowContent = NonNullable<ReturnType<typeof getPodcastShowContent>>;
export type PodcastEpisodeContent = NonNullable<ReturnType<typeof getPodcastEpisodeContent>>;
