import type { Article, PersonalMagazine, ResolvedPersonalMagazineProfile, ResolvedPersonalMagazineSummary } from "@/types";
import { articles, getArticleById } from "@/data/mock/articles";
import { getPersonalMagazineByPersonId, getPersonalMagazineBySlug, personalMagazines } from "@/data/mock/personal-magazines";
import { getPersonById } from "@/data/mock/people";

function resolveArticles(ids: readonly string[]) {
  return ids.map(getArticleById).filter((article): article is Article => article !== undefined);
}

function resolveSummary(magazine: PersonalMagazine): ResolvedPersonalMagazineSummary | undefined {
  const person = getPersonById(magazine.personId);
  if (!person) return undefined;
  const interview = magazine.interviewArticleId ? getArticleById(magazine.interviewArticleId) : undefined;
  const coverImage = person.portrait ?? interview?.heroImage ?? resolveArticles(magazine.featuredArticleIds)[0]?.heroImage;
  return { magazine, person, coverImage };
}

export function getResolvedPersonalMagazineBySlug(slug: string): ResolvedPersonalMagazineProfile | undefined {
  const magazine = getPersonalMagazineBySlug(slug);
  if (!magazine) return undefined;
  const summary = resolveSummary(magazine);
  if (!summary) return undefined;

  const interview = magazine.interviewArticleId ? getArticleById(magazine.interviewArticleId) : undefined;
  const featuredArticles = resolveArticles(magazine.featuredArticleIds);
  const relatedArticles = resolveArticles(magazine.relatedArticleIds);
  const gallery = magazine.gallery.flatMap((item) => {
    const article = getArticleById(item.articleId);
    return article?.heroImage ? [{ ...item, article, image: article.heroImage }] : [];
  });
  const relatedProfiles = personalMagazines
    .filter((candidate) => candidate.id !== magazine.id)
    .map(resolveSummary)
    .filter((candidate): candidate is ResolvedPersonalMagazineSummary => candidate !== undefined);

  return { ...summary, interview, featuredArticles, relatedArticles, gallery, relatedProfiles };
}

export function getResolvedPersonalMagazineByPersonId(personId: string) {
  const magazine = getPersonalMagazineByPersonId(personId);
  return magazine ? getResolvedPersonalMagazineBySlug(magazine.slug) : undefined;
}

export function getPersonalMagazineDescription(profile: ResolvedPersonalMagazineSummary) {
  const focus = profile.person.expertise.slice(0, 2).join(" and ").toLowerCase().replace(/\bai\b/g, "AI");
  const features = [profile.magazine.interviewArticleId ? "a defining interview" : undefined, focus].filter(Boolean).join(", ");
  const conjunction = profile.magazine.interviewArticleId ? ", and" : " and";
  return `Explore ${profile.person.name}'s Personal Magazine from The Perspective, featuring ${features}${conjunction} the story behind ${profile.magazine.coverHeadline}.`;
}

const duplicatesIn = (values: readonly string[]) => values.filter((value, index) => values.indexOf(value) !== index);

export function validatePersonalMagazineData() {
  const errors: string[] = [];
  const ids = personalMagazines.map((magazine) => magazine.id);
  const slugs = personalMagazines.map((magazine) => magazine.slug);
  const personIds = personalMagazines.map((magazine) => magazine.personId);

  for (const duplicate of duplicatesIn(ids)) errors.push(`Duplicate Personal Magazine ID: ${duplicate}.`);
  for (const duplicate of duplicatesIn(slugs)) errors.push(`Duplicate Personal Magazine slug: ${duplicate}.`);
  for (const duplicate of duplicatesIn(personIds)) errors.push(`Multiple Personal Magazines reference person: ${duplicate}.`);

  for (const magazine of personalMagazines) {
    const person = getPersonById(magazine.personId);
    if (!person) errors.push(`${magazine.id} references missing Person ${magazine.personId}.`);
    if (magazine.editorialNarrative.length < 3) errors.push(`${magazine.id} needs at least three Story paragraphs.`);
    if (magazine.themes.length < 5) errors.push(`${magazine.id} needs at least five themes.`);
    if (magazine.chapters.length < 4) errors.push(`${magazine.id} needs at least four chapters.`);
    if (magazine.milestones.length < 3) errors.push(`${magazine.id} needs at least three milestones.`);
    if (magazine.principles.length < 3) errors.push(`${magazine.id} needs at least three principles.`);
    if (magazine.gallery.length < 3) errors.push(`${magazine.id} needs at least three gallery references.`);
    if (magazine.featuredArticleIds.length < 3 || magazine.relatedArticleIds.length < 3) errors.push(`${magazine.id} needs at least three featured and related articles.`);

    const articleReferences = [
      ...(magazine.interviewArticleId ? [magazine.interviewArticleId] : []),
      ...magazine.featuredArticleIds,
      ...magazine.relatedArticleIds,
      ...magazine.chapters.flatMap((chapter) => chapter.articleId ? [chapter.articleId] : []),
      ...magazine.gallery.map((item) => item.articleId),
      ...(magazine.highlight.kind === "person-quote" && magazine.highlight.articleId ? [magazine.highlight.articleId] : []),
    ];
    for (const articleId of new Set(articleReferences)) {
      if (!getArticleById(articleId)) errors.push(`${magazine.id} references missing Article ${articleId}.`);
    }

    if (magazine.interviewArticleId) {
      const interview = getArticleById(magazine.interviewArticleId);
      if (interview && interview.articleType !== "interview") errors.push(`${magazine.id} interviewArticleId is not an interview.`);
      if (interview && person && !interview.title.includes(person.name) && !interview.excerpt.includes(person.name)) errors.push(`${magazine.id} interview does not identify ${person.name}.`);
      if (magazine.featuredArticleIds.includes(magazine.interviewArticleId) || magazine.relatedArticleIds.includes(magazine.interviewArticleId)) errors.push(`${magazine.id} repeats its interview in another story collection.`);
    }

    for (const [label, values] of [
      ["featured article", magazine.featuredArticleIds],
      ["related article", magazine.relatedArticleIds],
      ["chapter", magazine.chapters.map((chapter) => chapter.id)],
      ["milestone", magazine.milestones.map((milestone) => milestone.id)],
      ["principle", magazine.principles.map((principle) => principle.id)],
      ["theme", magazine.themes.map((theme) => theme.id)],
      ["gallery", magazine.gallery.map((item) => item.id)],
    ] as const) {
      for (const duplicate of duplicatesIn(values)) errors.push(`${magazine.id} has duplicate ${label} ID ${duplicate}.`);
    }

    for (const theme of magazine.themes) if (!theme.href.startsWith("/")) errors.push(`${magazine.id} theme ${theme.id} has an invalid destination.`);
    for (const galleryItem of magazine.gallery) {
      const article = getArticleById(galleryItem.articleId);
      if (article && !article.heroImage) errors.push(`${magazine.id} gallery reference ${galleryItem.id} has no image.`);
    }
    if (magazine.highlight.kind === "person-quote" && !person?.quote) errors.push(`${magazine.id} requests a canonical Person quote that does not exist.`);
  }

  if (personalMagazines.length !== 3) errors.push(`Expected three initial Personal Magazines, received ${personalMagazines.length}.`);
  if (articles.length === 0) errors.push("Canonical Article data is unavailable.");
  return errors;
}
