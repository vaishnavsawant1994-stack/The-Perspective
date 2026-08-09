import type { SubscriptionAudience, SubscriptionEntitlement, SubscriptionEntitlementKey, SubscriptionFaq, SubscriptionPlan } from "@/types";

export const subscriptionEntitlements: readonly SubscriptionEntitlement[] = [
  { key: "public_articles", label: "Public articles", description: "Published reporting and features available across The Perspective." },
  { key: "news_analysis", label: "News & analysis", description: "Current coverage and analysis from the editorial desks." },
  { key: "perspective_essays", label: "The Perspective essays", description: "Arguments, essays and contributor-led ideas." },
  { key: "magazine_previews", label: "Magazine previews", description: "Covers, issue context and selected Magazine stories." },
  { key: "newsletter_access", label: "Newsletter access", description: "The Perspective's public editorial briefings." },
  { key: "topic_author_discovery", label: "Topic and author discovery", description: "Permanent subject and contributor archives." },
  { key: "digital_issues", label: "Digital issues", description: "Complete standard Magazine editions." },
  { key: "digital_reader", label: "Interactive Reader", description: "Page-by-page Magazine reading across devices." },
  { key: "text_reader", label: "Text Reader", description: "Accessible, linear reading for complete digital issues." },
  { key: "standard_archive", label: "Standard archive", description: "The standard Magazine issue record across available years." },
  { key: "magazine_categories", label: "Magazine categories", description: "Curated shelves across leadership, business, technology and ideas." },
  { key: "issue_notifications", label: "Issue notifications", description: "Future account notices when a new issue is published." },
  { key: "magazine_briefing", label: "Magazine Briefing", description: "New issues, interviews and special features." },
  { key: "premium_editions", label: "Premium editions", description: "The Perspective's deeper editorial editions." },
  { key: "premium_archive", label: "Premium archive", description: "The complete collection of Premium Magazine issues." },
  { key: "special_reports", label: "Special reports", description: "Focused reporting packages developed beyond the daily cycle." },
  { key: "exclusive_interviews", label: "Exclusive interviews", description: "Long-form conversations from Premium editions." },
  { key: "premium_packages", label: "Premium editorial packages", description: "Original collections built around consequential subjects." },
  { key: "priority_special_editions", label: "Future special-edition access", description: "Priority access when future special editions are released." },
];

const readerEntitlements: readonly SubscriptionEntitlementKey[] = [
  "public_articles", "news_analysis", "perspective_essays", "magazine_previews", "newsletter_access", "topic_author_discovery",
];

const digitalEntitlements: readonly SubscriptionEntitlementKey[] = [
  ...readerEntitlements, "digital_issues", "digital_reader", "text_reader", "standard_archive", "magazine_categories", "issue_notifications", "magazine_briefing",
];

const premiumEntitlements: readonly SubscriptionEntitlementKey[] = [
  ...digitalEntitlements, "premium_editions", "premium_archive", "special_reports", "exclusive_interviews", "premium_packages", "priority_special_editions",
];

export const subscriptionPlans: readonly SubscriptionPlan[] = [
  {
    id: "plan-reader", slug: "reader", name: "Reader", description: "For readers who want The Perspective's public reporting, ideas and Magazine previews.",
    monthlyPriceCents: 0, annualPriceCents: 0, currency: "USD", accessTier: "public",
    marketingBenefits: ["Public articles", "News and analysis", "The Perspective essays", "Magazine previews", "Newsletter access", "Topic and author discovery"],
    entitlementKeys: readerEntitlements, ctaLabel: "Continue Reading", ctaHref: "/",
  },
  {
    id: "plan-digital", slug: "digital", name: "Digital", description: "For readers who want complete digital Magazine editions and the standard archive.",
    monthlyPriceCents: 900, annualPriceCents: 9000, currency: "USD", accessTier: "digital",
    marketingBenefits: ["Everything in Reader", "Digital Magazine editions", "Interactive Magazine Reader", "Accessible Text View", "Standard Magazine archive", "Magazine categories", "Issue notifications", "Magazine Briefing"],
    entitlementKeys: digitalEntitlements, ctaLabel: "Choose Digital", ctaHref: "#subscription-status", futureProductKey: "magazine-digital",
  },
  {
    id: "plan-premium", slug: "premium", name: "Premium", description: "For readers who want The Perspective's deepest Magazine, archive and Premium editorial experience.",
    monthlyPriceCents: 1900, annualPriceCents: 19000, currency: "USD", accessTier: "premium", featured: true, label: "Most complete",
    marketingBenefits: ["Everything in Digital", "Premium editions", "Special reports", "Exclusive editorial packages", "Long-form Premium interviews", "Complete Premium archive", "Future members-only editorial experiences"],
    entitlementKeys: premiumEntitlements, ctaLabel: "Choose Premium", ctaHref: "#subscription-status", futureProductKey: "magazine-premium",
  },
];

export const subscriptionComparisonKeys: readonly SubscriptionEntitlementKey[] = [
  "public_articles", "news_analysis", "magazine_previews", "digital_issues", "digital_reader", "text_reader", "standard_archive", "magazine_categories", "premium_editions", "premium_archive", "special_reports", "exclusive_interviews", "magazine_briefing",
];

export const subscriptionAudiences: readonly SubscriptionAudience[] = [
  { tier: "public", name: "Reader", description: "For readers discovering The Perspective through public reporting, essays and Magazine previews." },
  { tier: "digital", name: "Digital", description: "For regular readers who want complete standard issues, the Reader and the Magazine archive." },
  { tier: "premium", name: "Premium", description: "For readers who want deeper editions, complete context and the publication's most substantial editorial packages." },
];

export const subscriptionFaqs: readonly SubscriptionFaq[] = [
  { id: "digital-includes", question: "What is included in the Digital plan?", answer: "Digital is designed to include everything in Reader plus complete standard Magazine editions, the interactive Reader, accessible Text View, standard archive access, Magazine categories, issue notifications and the Magazine Briefing." },
  { id: "premium-includes", question: "What is included in Premium?", answer: "Premium is designed to include every Digital feature plus Premium editions, special reports, deeper interviews, exclusive editorial packages and the complete Premium archive." },
  { id: "devices", question: "Can I read on my phone or tablet?", answer: "Yes. The Magazine Reader and Text View are designed for focused reading across desktop, tablet and mobile." },
  { id: "premium-digital", question: "Does Premium include all Digital features?", answer: "Yes. Premium inherits the complete Digital entitlement set before adding Premium editions and editorial packages." },
  { id: "older-issues", question: "Can I access older issues?", answer: "The plan architecture assigns the standard archive to Digital and the complete Premium archive to Premium. Existing public routes remain open until membership infrastructure is connected." },
  { id: "cancel", question: "Can I cancel anytime?", answer: "Once billing is enabled, subscriptions will be designed to allow plan management through a future member account area. No billing or account controls are active yet." },
  { id: "print", question: "Will print editions be included?", answer: "The current subscription architecture focuses on digital Magazine access. Print options may be introduced separately." },
  { id: "personal-magazines", question: "Are Personal Magazines included?", answer: "Personal Magazines are a separate editorial product and are not automatically included in reader subscriptions." },
  { id: "launch", question: "When will paid subscriptions launch?", answer: "Checkout, account access and entitlement enforcement will be introduced together in a future membership and billing phase." },
  { id: "switch", question: "Can I switch plans later?", answer: "The future account architecture is intended to support plan changes, but plan management will only become available when billing is connected." },
];
