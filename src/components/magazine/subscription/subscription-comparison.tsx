import type { SubscriptionEntitlement, SubscriptionEntitlementKey, SubscriptionPlan } from "@/types";
import { planIncludesEntitlement } from "@/lib/subscription-pricing";

export function SubscriptionComparison({ plans, entitlements, comparisonKeys }: { plans: readonly SubscriptionPlan[]; entitlements: readonly SubscriptionEntitlement[]; comparisonKeys: readonly SubscriptionEntitlementKey[] }) {
  const entitlementMap = new Map(entitlements.map((entitlement) => [entitlement.key, entitlement]));
  return <section aria-labelledby="subscription-comparison-heading">
    <header className="grid gap-6 border-t-2 border-foreground pt-5 lg:grid-cols-[.62fr_1.38fr]"><div><p className="eyebrow text-accent">Compare plans</p><h2 className="type-display-lg mt-5" id="subscription-comparison-heading">What each plan includes.</h2></div><p className="type-deck max-w-3xl text-muted">One cumulative entitlement model powers this comparison: Digital contains Reader access, and Premium contains the complete Digital experience.</p></header>
    <div className="mt-12 overflow-x-auto border-y border-border" tabIndex={0}><table className="w-full min-w-[48rem] border-collapse text-left"><caption className="sr-only">Comparison of Reader, Digital and Premium Magazine subscription plans</caption><thead><tr><th className="sticky left-0 z-10 w-[40%] bg-surface px-4 py-5 font-serif text-2xl" scope="col">Experience</th>{plans.map((plan) => <th className="px-4 py-5 text-center font-serif text-2xl" key={plan.id} scope="col">{plan.name}</th>)}</tr></thead><tbody>{comparisonKeys.map((key) => {
      const entitlement = entitlementMap.get(key);
      if (!entitlement) return null;
      return <tr className="border-t border-border" key={key}><th className="sticky left-0 z-10 bg-surface px-4 py-4 font-medium" scope="row"><span>{entitlement.label}</span><span className="mt-1 block text-xs font-normal leading-5 text-muted">{entitlement.description}</span></th>{plans.map((plan) => {
        const included = planIncludesEntitlement(plan, key);
        return <td className="px-4 py-4 text-center text-sm" key={plan.id}><span aria-hidden="true" className={included ? "font-bold text-[#76531b]" : "text-muted"}>{included ? "Included" : "Not included"}</span><span className="sr-only">{entitlement.label} is {included ? "included" : "not included"} in {plan.name}</span></td>;
      })}</tr>;
    })}</tbody></table></div>
  </section>;
}
