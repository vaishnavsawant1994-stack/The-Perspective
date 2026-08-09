import type { BillingFrequency, SubscriptionEntitlementKey, SubscriptionPlan } from "@/types";

export function formatSubscriptionPrice(priceCents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: priceCents % 100 === 0 ? 0 : 2 }).format(priceCents / 100);
}

export function getPlanPriceCents(plan: SubscriptionPlan, frequency: BillingFrequency) {
  return frequency === "annual" ? plan.annualPriceCents : plan.monthlyPriceCents;
}

export function getAnnualSavingsPercent(plan: SubscriptionPlan) {
  const monthlyAnnualized = plan.monthlyPriceCents * 12;
  if (monthlyAnnualized <= 0 || plan.annualPriceCents >= monthlyAnnualized) return 0;
  return Math.round(((monthlyAnnualized - plan.annualPriceCents) / monthlyAnnualized) * 100);
}

export function planIncludesEntitlement(plan: SubscriptionPlan, key: SubscriptionEntitlementKey) {
  return plan.entitlementKeys.includes(key);
}
