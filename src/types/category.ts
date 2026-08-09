import type { Article, MagazineIssue, PersonProfile } from "./content";

export type CategorySubnavItem = {
  label: string;
  href: string;
  active?: boolean;
};

export type CategorySectionLayout = "feature-list" | "analysis" | "people" | "regional";

export type CategoryEditorialSection = {
  id: string;
  title: string;
  description?: string;
  eyebrow?: string;
  href?: string;
  actionLabel?: string;
  links?: readonly CategorySubnavItem[];
  layout: CategorySectionLayout;
  feature: Article;
  supporting: readonly Article[];
};

export type CategoryPersonStory = {
  person: PersonProfile;
  href: string;
  label?: string;
};

export type CategoryPeopleFeatureContent = {
  id: string;
  title: string;
  description?: string;
  featured: CategoryPersonStory;
  supporting: readonly CategoryPersonStory[];
};

export type CategoryPromotion =
  | { kind: "magazine"; issue: MagazineIssue }
  | { kind: "personal-magazines"; people: readonly PersonProfile[] }
  | {
      kind: "premium";
      eyebrow: string;
      title: string;
      description: string;
      primaryAction: { label: string; href: string };
      secondaryAction: { label: string; href: string };
    };

export type CategoryLandingContent = {
  slug: string;
  label: string;
  title: string;
  description: string;
  supportingLine?: string;
  subcategories: readonly CategorySubnavItem[];
  lead: { primary: Article; supporting: readonly Article[] };
  topStoriesTitle?: string;
  topStories: readonly Article[];
  peopleFeature?: CategoryPeopleFeatureContent;
  editorialSections: readonly CategoryEditorialSection[];
  inDepth: Article;
  interview: PersonProfile;
  interviewHref: string;
  mostRead: readonly Article[];
  latest: readonly Article[];
  newsletter: { eyebrow: string; title: string; description: string };
  promotion: CategoryPromotion;
};
