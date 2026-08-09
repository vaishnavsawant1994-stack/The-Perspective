"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import type { BillingFrequency, SubscriptionPlan } from "@/types";
import { formatSubscriptionPrice, getAnnualSavingsPercent, getPlanPriceCents } from "@/lib/subscription-pricing";
import { cn } from "@/lib/utils";

function PlanPrice({ plan, frequency, featured }: { plan: SubscriptionPlan; frequency: BillingFrequency; featured: boolean }) {
  const priceCents = getPlanPriceCents(plan, frequency);
  const displayPrice = formatSubscriptionPrice(priceCents, plan.currency);
  const period = priceCents === 0 ? "public access" : frequency === "annual" ? "per year" : "per month";
  const saving = getAnnualSavingsPercent(plan);
  return <div className="mt-8 min-h-24"><p><span aria-hidden="true" className="font-serif text-[clamp(2.8rem,6vw,4.5rem)] leading-none tracking-[-.05em]">{displayPrice}</span><span className="sr-only">{displayPrice} {period}</span>{priceCents > 0 ? <span aria-hidden="true" className={cn("ml-2 text-sm", featured ? "text-white/70" : "text-muted")}>/ {frequency === "annual" ? "year" : "month"}</span> : null}</p><p className={cn("type-meta mt-3", featured ? "text-white/70" : "text-muted")}>{priceCents === 0 ? "No subscription required" : frequency === "annual" ? `Billed annually · Save ${saving}%` : "Billed monthly"}</p></div>;
}

export function SubscriptionPlanSelector({ plans }: { plans: readonly SubscriptionPlan[] }) {
  const [frequency, setFrequency] = useState<BillingFrequency>("monthly");

  return <section aria-labelledby="subscription-plans-heading" id="plans">
    <header className="grid gap-7 border-t-2 border-foreground pt-5 lg:grid-cols-[.62fr_1.38fr] lg:items-end"><div><p className="eyebrow text-accent">Choose your experience</p><h2 className="type-display-lg mt-5" id="subscription-plans-heading">Three ways to read.</h2></div><div className="lg:justify-self-end"><fieldset><legend className="sr-only">Billing frequency</legend><div className="inline-flex rounded-full border border-foreground bg-surface p-1" role="radiogroup" aria-label="Billing frequency"><label className="relative cursor-pointer"><input checked={frequency === "monthly"} className="peer sr-only" name="billing-frequency" onChange={() => setFrequency("monthly")} type="radio" value="monthly" /><span className="flex min-h-11 items-center rounded-full px-5 text-sm font-bold peer-checked:bg-foreground peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus">Monthly</span></label><label className="relative cursor-pointer"><input checked={frequency === "annual"} className="peer sr-only" name="billing-frequency" onChange={() => setFrequency("annual")} type="radio" value="annual" /><span className="flex min-h-11 items-center rounded-full px-5 text-sm font-bold peer-checked:bg-foreground peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus">Annual <span className="ml-2 text-xs opacity-75">Save 17%</span></span></label></div></fieldset></div></header>
    <div className="mt-12 grid gap-7 lg:grid-cols-3">{plans.map((plan) => <article aria-labelledby={`${plan.id}-heading`} className={cn("flex min-h-full flex-col border-t-2 p-7 sm:p-9", plan.featured ? "border-[#a17a38] bg-[#171612] text-white" : "border-foreground bg-surface")} id={plan.id} key={plan.id}>
      <div className="flex min-h-6 items-center justify-between gap-4"><p className={cn("type-meta", plan.featured ? "text-[#e7c785]" : "text-accent")}>{plan.accessTier} access</p>{plan.label ? <p className="type-meta text-[#e7c785]">{plan.label}</p> : null}</div>
      <h3 className="mt-5 font-serif text-5xl leading-none tracking-[-.045em]" id={`${plan.id}-heading`}>{plan.name}</h3>
      <p className={cn("mt-5 min-h-20 text-sm leading-6", plan.featured ? "text-white/65" : "text-muted")}>{plan.description}</p>
      <PlanPrice featured={Boolean(plan.featured)} frequency={frequency} plan={plan} />
      <ul className={cn("mt-7", plan.featured ? "border-t border-white/20" : "border-t border-border")}>{plan.marketingBenefits.map((benefit) => <li className={cn("flex min-h-12 items-center gap-3 border-b py-3 text-sm", plan.featured ? "border-white/20 text-white/75" : "border-border text-muted")} key={benefit}><Check aria-hidden="true" className={cn("size-4 shrink-0", plan.featured ? "text-[#e7c785]" : "text-accent")} />{benefit}</li>)}</ul>
      <div className="mt-auto pt-8"><Link className={cn("inline-flex min-h-12 w-full items-center justify-center gap-2 px-5 text-sm font-bold", plan.featured ? "bg-white text-foreground hover:bg-[#f3e6d0]" : plan.slug === "reader" ? "border border-foreground hover:bg-foreground hover:text-white" : "bg-foreground text-white hover:bg-accent")} href={plan.ctaHref}>{plan.ctaLabel} <ArrowRight aria-hidden="true" className="size-4" /></Link>{plan.futureProductKey ? <p className={cn("mt-4 text-center text-xs", plan.featured ? "text-white/50" : "text-muted")}>Account and billing access will be enabled in the membership phase.</p> : <p className="mt-4 text-center text-xs text-muted">Continue with the public Perspective experience.</p>}</div>
    </article>)}</div>
  </section>;
}
