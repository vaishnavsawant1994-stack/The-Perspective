import type { MagazineIssue } from "./content";

export type BillingFrequency = "monthly" | "annual";
export type MagazineAccessTier = "public" | "digital" | "premium";

export type SubscriptionEntitlementKey =
  | "public_articles"
  | "news_analysis"
  | "perspective_essays"
  | "magazine_previews"
  | "newsletter_access"
  | "topic_author_discovery"
  | "digital_issues"
  | "digital_reader"
  | "text_reader"
  | "standard_archive"
  | "magazine_categories"
  | "issue_notifications"
  | "magazine_briefing"
  | "premium_editions"
  | "premium_archive"
  | "special_reports"
  | "exclusive_interviews"
  | "premium_packages"
  | "priority_special_editions";

export type SubscriptionEntitlement = {
  key: SubscriptionEntitlementKey;
  label: string;
  description: string;
};

export type SubscriptionPlan = {
  id: string;
  slug: "reader" | "digital" | "premium";
  name: string;
  description: string;
  monthlyPriceCents: number;
  annualPriceCents: number;
  currency: "USD";
  featured?: boolean;
  label?: string;
  accessTier: MagazineAccessTier;
  marketingBenefits: readonly string[];
  entitlementKeys: readonly SubscriptionEntitlementKey[];
  ctaLabel: string;
  ctaHref: string;
  futureProductKey?: string;
};

export type SubscriptionFaq = {
  id: string;
  question: string;
  answer: string;
};

export type SubscriptionAudience = {
  tier: MagazineAccessTier;
  name: string;
  description: string;
};

export type MagazineSubscriptionContent = {
  plans: readonly SubscriptionPlan[];
  entitlements: readonly SubscriptionEntitlement[];
  comparisonKeys: readonly SubscriptionEntitlementKey[];
  audiences: readonly SubscriptionAudience[];
  faqs: readonly SubscriptionFaq[];
  readerIssue: MagazineIssue;
  premiumIssues: readonly MagazineIssue[];
  archiveIssueCount: number;
  archiveYearCounts: Readonly<Record<number, number>>;
  readerIssueCount: number;
  premiumIssueCount: number;
};
