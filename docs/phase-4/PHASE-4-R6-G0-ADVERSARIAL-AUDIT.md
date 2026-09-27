# Phase 4 — R6 G0 Adversarial / Falsification Audit

**Record:** P4-R6-G0-AUDIT-01  
**Date:** September 27, 2026  
**Planning baseline:** `main@2372418d80fa07f633a0e4adc99a21b1f7d8300a`  
**Planning branch:** `phase4/r6-crm-commercial-g0-20260927`  
**Review type:** enhanced adversarial planning-contract falsification — not independent external review  
**R6 implementation:** NOT AUTHORIZED  
**P4-R6-G0:** NOT FROZEN

## 0. Purpose

This review attempts to break the R6 planning package before implementation exists.

It tests for:

- scope contradiction;
- hidden R7 expansion;
- permission-stage laundering;
- lifecycle evidence fabrication;
- duplicate/parallel architecture;
- fake prototype-to-production assumptions;
- tenant/RLS ambiguity;
- field/resource-policy gaps;
- idempotency/outbox ambiguity;
- provider fake-success behavior;
- missing threat coverage;
- governance wording that could accidentally authorize implementation.

A finding is not a production vulnerability when the affected production surface does not yet exist.

## 1. Findings and repairs

| ID | Severity | Finding | Disposition |
|---|---|---|---|
| F01 | BLOCKING governance | Proposal was simultaneously R6-adjacent in Phase-2C/2D/R5 metadata and explicitly R7-owned in the Master Bible release table | CLOSED — owner-approved D01 Resolution A; Proposal persistence/versioning/send/acceptance is R7 |
| F02 | BLOCKING governance | Screen 27 implied template mutation while `template.manage` is exact stage `R6+`, not R6 | CLOSED — owner-approved D15 Resolution A; mutation remains dormant at R6+ |
| F03 | HIGH authorization design | Four `proposal.*` permissions retain historical `activationStage: "R6"`; stage activation alone would not preserve the owner-approved R7 narrowing | CLOSED AT CONTRACT LEVEL — explicit 37-key R6 active-permission allowlist excludes all four proposal keys; implementation proof mandatory |
| F04 | HIGH authorization design | Accepted policy action-family enforcement is R5-specific; naïvely adding R6 to active stages could skip explicit action binding | CLOSED AT CONTRACT LEVEL — D16 requires R6 permission→action/resource binding and denial for undeclared/absent keys |
| F05 | HIGH governance wording | Draft G0 contract said production implementation remained prohibited “until item 12” although separate implementation authorization is item 13 | CLOSED — corrected to item 13 in contract repair `c76444b9b5079d7ac2a9dfadf60e8dd4e2cba948` |
| F06 | HIGH template-control design | D15 allowed “existing approved immutable template versions” but initial draft did not define a trustworthy source when no R6 production template system exists at baseline | CLOSED — R6 reference catalog may use only an explicitly reviewed immutable baseline seed/import manifest; no runtime mutation; missing approved version fails readiness |
| F07 | MEDIUM control consistency | Parallel planning work left Gate-A readiness stale after live owner approval | CLOSED — readiness reconciled to Gate-A-approved/not-frozen state at `19dee054f810c752d5cf212643328c3e6e6dae7d` |
| F08 | MEDIUM control consistency | Earlier authority matrix still represented Proposal as conditionally actionable after D01 Resolution A | CLOSED — Proposal rows are explicitly R7/inactive with **NONE IN R6**; 37 active keys remain |
| F09 | MEDIUM release boundary | Canonical Deal enum contains post-R6 Proposal/Contract/Payment states, creating temptation to treat enum presence as stage authority | CLOSED AT CONTRACT LEVEL — lifecycle guard and R7 exclusion manifest cap R6 at `PROPOSAL_PREPARATION` |
| F10 | MEDIUM prototype risk | Existing screens contain hard-coded business-looking data and routes that could be mistaken for production records | CLOSED AT CONTRACT LEVEL — prototype-to-production rule + A120 requires server-backed canonical record proof |
| F11 | MEDIUM architecture drift | Older Phase-2F illustrates `src/server/domains` while accepted R1–R5 use `src/modules` | CLOSED — G0 requires `src/modules/crm`, `communications`, `commercial`; parallel server stack prohibited |
| F12 | MEDIUM tenant defense | R6 introduces many future tables but baseline RLS protects only existing accepted surfaces; a new table could be omitted from tenant-policy inventory | CLOSED AT CONTRACT LEVEL — table-by-table tenancy matrix + A105–A112 + migration verifier requirement |
| F13 | LOW/coverage | Proposal threats A86–A95 become non-R6 behavioral surfaces under D01 and could have been silently dropped | CLOSED — explicitly DEFERRED TO R7, NOT WAIVED; R6 must prove absence/dormancy |
| F14 | LOW/coverage | Threat model could list attacks without one-to-one qualification ownership | CLOSED — threat source and qualification matrix each contain exactly A01–A120 once |

## 2. Permission falsification result

Accepted R5 registry contains:

- **41** historical exact-`R6` permission keys;
- four Proposal keys narrowed by D01 to R7 production ownership.

Approved R6 active subset:

- **37** keys.

Explicitly dormant despite historical R6 metadata:

- `proposal.view`
- `proposal.edit`
- `proposal.send`
- `proposal.approve`

Also dormant:

- `template.manage` — exact stage `R6+`;
- all R7/R8/R9/R10/R11/R12/R13/R14 vocabulary.

R6 future activation must require both:

1. owning stage active; and
2. permission present in the explicit approved R6 active-permission allowlist.

Every active key then requires declared action/resource/field/workflow policy.

## 3. Threat qualification completeness

Machine count during this audit:

~~~text
Threat source rows:           120
Threat source unique IDs:     120
Threat source duplicates:     0
Threat source missing IDs:    0

Qualification rows:           120
Qualification unique IDs:     120
Qualification duplicates:     0
Qualification missing IDs:    0
~~~

A86–A95 are R7 behavioral threats and remain in the program ledger.

R6 qualification responsibility for them is scope exclusion/dormancy proof.

## 4. R7+ exclusion result

The G0 package has an explicit machine-verifiable exclusion manifest covering:

- product/package;
- Proposal;
- contract/signature;
- invoice/credit;
- payment/allocation/refund/ledger;
- subscriptions/entitlements;
- R8+ delivery/editorial/media/event production;
- R11 search/analytics/renewal;
- R12 Client Portal completion.

No planning artifact authorizes those production surfaces.

## 5. Tenant/resource/field falsification result

The package now requires:

- explicit owner organization on or through every R6 tenant aggregate;
- DIRECT RLS or reviewed parent/evidence classification for every candidate table;
- forced RLS + restricted runtime-role qualification where applicable;
- domain/resource-envelope agreement;
- transactional resource registration;
- server-loaded owner/assignment/department/lifecycle/version;
- explicit Team field groups;
- explicit minimal client-safe projections;
- no browser-owned tenant/scope/owner/suppression/provider authority;
- missing context/field policy/resource type => DENY.

No unclassified R6 candidate table remains in the tenancy matrix.

## 6. Lifecycle falsification result

The lifecycle matrix makes state changes command-driven.

It rejects:

- generic `PATCH status=...`;
- lead conversion without qualification/guards;
- send after suppression/DNC;
- campaign launch without `outreach.launch`;
- stale audience/sequence/sender approval;
- reply races that continue automation;
- meeting history overwrite;
- arbitrary deal-stage key injection;
- deal movement beyond the R6 ceiling;
- client conversion that fabricates R7/R8 truth.

Proposal production transitions remain R7-owned.

## 7. Template D15 closure

D15 Resolution A is implementable without hidden mutation authority:

- `template.manage` stays `R6+`;
- no R6 runtime template create/edit/version/archive/publish API exists;
- R6 may reference an immutable approved version only;
- any production baseline version must be supplied by an explicitly reviewed immutable seed/import manifest in the future implementation candidate;
- missing approved version => campaign/sequence readiness DENY;
- hidden admin/browser mutation is prohibited.

## 8. Planning-branch scope falsification

The authorized G0 planning branch may change only:

- `docs/phase-4/PHASE-4-R6-*.md`
- `scripts/governance/verify-r6-contract.mjs`
- `.github/workflows/r6-contract-enhanced-qualification.yml`

Any `src/**`, `prisma/**`, `public/**`, dependency, runtime configuration, migration, or production workflow change is a blocking qualification failure.

## 9. Remaining risk / future proof

The following are not closed as implementation evidence because implementation is not authorized yet:

- actual R6 RLS policies;
- actual 37-key active allowlist;
- actual R6 action-family code;
- actual domain transitions;
- actual idempotency/outbox/provider behavior;
- actual canonical API/route binding;
- actual browser and live-PostgreSQL attacks.

They are implementation obligations, not missing G0 product code.

P4-R6-C1 cannot later accept implementation without direct executable evidence for every applicable A01–A120 attack.

## 10. Final G0 audit classification

~~~text
production R6 vulnerability demonstrated: NOT APPLICABLE — R6 production surface does not exist
production code modified during G0 planning: NO
BLOCKING G0 contract findings open: 0
HIGH G0 contract findings open: 0
Gate-A D01–D15: OWNER-APPROVED
D16 technical action-binding control: REQUIRED
threat IDs: 120/120
qualification mappings: 120/120
R7+ exclusions: EXPLICIT
P4-R6-G0: NOT FROZEN
R6 implementation: NOT AUTHORIZED
~~~

The planning package is eligible for exact-head enhanced G0 machine qualification.

A green machine qualification may establish **P4-R6-G0 READY FOR OWNER FREEZE**; it does not itself freeze G0 and does not authorize implementation.
