import type { Article, ResolvedPersonalMagazineSummary } from "@/types";
import { getArticleById } from "@/data/mock/articles";
import { personalMagazineListing } from "@/data/mock/personal-magazine-listing";
import { personalMagazines } from "@/data/mock/personal-magazines";
import { getResolvedPersonalMagazineSummaries } from "@/lib/personal-magazines";

const duplicatesIn = (values: readonly string[]) => values.filter((value, index) => values.indexOf(value) !== index);

export function getFeaturedPersonalMagazines() {
  const summaries = getResolvedPersonalMagazineSummaries();
  return personalMagazineListing.featuredSlugs
    .map((slug) => summaries.find((summary) => summary.magazine.slug === slug))
    .filter((summary): summary is ResolvedPersonalMagazineSummary => summary !== undefined);
}

export function getSelectedPersonalMagazineStories() {
  return personalMagazineListing.selectedArticleIds
    .map(getArticleById)
    .filter((article): article is Article => article !== undefined);
}

export function validatePersonalMagazineListing() {
  const errors: string[] = [];
  const collections = [
    ["benefit", personalMagazineListing.benefits],
    ["content item", personalMagazineListing.contents],
    ["process step", personalMagazineListing.process],
    ["theme", personalMagazineListing.themes],
    ["audience", personalMagazineListing.audiences],
    ["principle", personalMagazineListing.principles],
    ["FAQ", personalMagazineListing.faqs],
  ] as const;

  for (const [label, items] of collections) {
    for (const duplicate of duplicatesIn(items.map((item) => item.id))) errors.push(`Duplicate listing ${label} ID: ${duplicate}.`);
  }
  for (const duplicate of duplicatesIn(personalMagazineListing.featuredSlugs)) errors.push(`Duplicate featured Personal Magazine slug: ${duplicate}.`);
  for (const duplicate of duplicatesIn(personalMagazineListing.selectedArticleIds)) errors.push(`Duplicate selected story ID: ${duplicate}.`);
  for (const slug of personalMagazineListing.featuredSlugs) if (!personalMagazines.some((magazine) => magazine.slug === slug)) errors.push(`Featured Personal Magazine slug does not exist: ${slug}.`);
  for (const articleId of personalMagazineListing.selectedArticleIds) if (!getArticleById(articleId)) errors.push(`Selected Personal Magazine story does not exist: ${articleId}.`);
  for (const theme of personalMagazineListing.themes) if (!theme.href.startsWith("/")) errors.push(`Listing theme ${theme.id} has an invalid destination.`);
  if (getResolvedPersonalMagazineSummaries().length !== personalMagazines.length) errors.push("Not every Personal Magazine resolves to a canonical Person.");
  if (personalMagazineListing.faqs.length < 8 || personalMagazineListing.faqs.length > 10) errors.push("The listing needs between eight and ten FAQs.");
  return errors;
}
