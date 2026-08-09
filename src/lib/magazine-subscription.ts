import type { MagazineSubscriptionContent, SubscriptionEntitlementKey } from "@/types";
import { subscriptionAudiences, subscriptionComparisonKeys, subscriptionEntitlements, subscriptionFaqs, subscriptionPlans } from "@/data/mock/subscription-plans";
import { getReadableMagazineIssues, magazineIssues } from "@/data/mock/magazines";
import { getMagazineArchiveCounts, getMagazineIssues } from "@/lib/magazine-archive";
import { getMagazineReaderHref } from "@/lib/magazine-categories";
import { getPublishedPremiumMagazineIssues } from "@/lib/magazine-premium";

export function getMagazineSubscriptionContent(): MagazineSubscriptionContent {
  const issues = getMagazineIssues();
  const counts = getMagazineArchiveCounts(issues);
  const readerIssue = getReadableMagazineIssues().find((issue) => getMagazineReaderHref(issue) !== null);
  if (!readerIssue) throw new Error("Magazine subscription page requires a configured Reader issue.");
  const premiumIssues = getPublishedPremiumMagazineIssues();

  return {
    plans: subscriptionPlans,
    entitlements: subscriptionEntitlements,
    comparisonKeys: subscriptionComparisonKeys,
    audiences: subscriptionAudiences,
    faqs: subscriptionFaqs,
    readerIssue,
    premiumIssues,
    archiveIssueCount: issues.length,
    archiveYearCounts: counts.byYear,
    readerIssueCount: counts.reader,
    premiumIssueCount: counts.premium,
  };
}

function missingEntitlements(required: readonly SubscriptionEntitlementKey[], actual: readonly SubscriptionEntitlementKey[]) {
  const actualSet = new Set(actual);
  return required.filter((key) => !actualSet.has(key));
}

export function validateMagazineSubscriptionData() {
  const errors: string[] = [];
  const planIds = new Set<string>();
  const planSlugs = new Set<string>();
  const entitlementKeys = new Set<string>();
  const entitlementRegistry = new Set(subscriptionEntitlements.map((entitlement) => entitlement.key));

  for (const entitlement of subscriptionEntitlements) {
    if (entitlementKeys.has(entitlement.key)) errors.push(`Duplicate subscription entitlement: ${entitlement.key}.`);
    entitlementKeys.add(entitlement.key);
  }

  for (const plan of subscriptionPlans) {
    if (planIds.has(plan.id)) errors.push(`Duplicate subscription plan id: ${plan.id}.`);
    if (planSlugs.has(plan.slug)) errors.push(`Duplicate subscription plan slug: ${plan.slug}.`);
    if (plan.monthlyPriceCents < 0 || plan.annualPriceCents < 0) errors.push(`${plan.slug} contains a negative price.`);
    if (plan.slug === "reader" && (plan.monthlyPriceCents !== 0 || plan.annualPriceCents !== 0)) errors.push("Reader plan must remain zero-priced.");
    if (plan.slug !== "reader" && plan.annualPriceCents >= plan.monthlyPriceCents * 12) errors.push(`${plan.slug} annual pricing must be lower than twelve monthly payments.`);
    if (new Set(plan.entitlementKeys).size !== plan.entitlementKeys.length) errors.push(`${plan.slug} contains duplicate entitlements.`);
    for (const key of plan.entitlementKeys) if (!entitlementRegistry.has(key)) errors.push(`${plan.slug} references unknown entitlement ${key}.`);
    if (!plan.ctaHref.startsWith("/") && !plan.ctaHref.startsWith("#")) errors.push(`${plan.slug} has an invalid CTA route.`);
    planIds.add(plan.id);
    planSlugs.add(plan.slug);
  }

  const reader = subscriptionPlans.find((plan) => plan.slug === "reader");
  const digital = subscriptionPlans.find((plan) => plan.slug === "digital");
  const premium = subscriptionPlans.find((plan) => plan.slug === "premium");
  if (!reader || !digital || !premium) errors.push("Reader, Digital and Premium plans are all required.");
  if (reader && digital) for (const key of missingEntitlements(reader.entitlementKeys, digital.entitlementKeys)) errors.push(`Digital is missing Reader entitlement ${key}.`);
  if (digital && premium) for (const key of missingEntitlements(digital.entitlementKeys, premium.entitlementKeys)) errors.push(`Premium is missing Digital entitlement ${key}.`);
  for (const key of subscriptionComparisonKeys) if (!entitlementRegistry.has(key)) errors.push(`Comparison references unknown entitlement ${key}.`);
  if (magazineIssues.some((issue) => issue.readerAvailable && !getMagazineReaderHref(issue))) errors.push("A Reader-available issue lacks configured Reader content.");
  return errors;
}
