# Phase 4 — R6 Gate-A Governance Decisions

**Record:** P4-R6-GOV-01  
**Date:** September 27, 2026  
**Planning baseline:** `main@2372418d80fa07f633a0e4adc99a21b1f7d8300a`  
**Status:** GATE-A OWNER-APPROVED — G0 CONTRACT COMPLETION AUTHORIZED  
**R6 implementation:** NOT AUTHORIZED

This document isolates decisions that must not be hidden inside implementation code.

## D01 — Proposal release ownership

**Status:** APPROVED — RESOLUTION A

Retained sources conflict:

- Master Bible §23 includes Proposal/Negotiation in the CRM/commercial progression;
- Phase-2C owns proposal records in `commercial`;
- Phase-2D screens 38–40 and deal flow include proposal behavior in the Deals & Client CRM operational range;
- R5 marks `proposal.view/edit/send/approve` as R6 activation-stage permissions;
- Master Bible release table R7 explicitly says “products/packages, proposals, contracts/signatures, invoices…”

### Candidate resolution A — strict release-table precedence

R6 implements:

- deals/pipeline through an R6 stage ceiling;
- proposal screens remain visual/prototype responsibility only;
- proposal persistence/versions/send/acceptance remain dormant until R7;
- proposal R6 permission vocabulary remains dormant;
- R7 activates proposal + product/package + contract/finance behavior.

Under this resolution, the canonical Deal enum may contain later states, but R6 commands must deny transitions past `PROPOSAL_PREPARATION` because the required R7 aggregate/evidence is unavailable.

**Default planning posture:** A, because the Master Bible release table has highest scope precedence.

### Candidate resolution B — explicit owner amendment

The owner may explicitly amend release ownership so R6 includes proposal persistence/version/send/acceptance while R7 retains products/packages, contracts/signatures, invoices/payments/subscriptions.

If B is selected, the owner must also resolve how R6 proposal line/term snapshots relate to R7-owned product/package records without creating a parallel package model.

No implementation may infer B from UI existence.

## D02 — Deal lifecycle stage ceiling

**Status:** APPROVED

R6 persists the canonical deal state vocabulary but only authorizes transitions whose required evidence belongs to accepted stages.

With D01=A, R6 transition ceiling is:

`QUALIFIED → INTERESTED → DISCOVERY_SCHEDULED → DISCOVERY_COMPLETED → PROPOSAL_PREPARATION`

plus valid exits:

- LOST;
- ON_HOLD;
- FOLLOW_UP_LATER;
- DISQUALIFIED.

Later states fail closed with a stable “stage not active”/workflow denial until their owning release exists.

R6 must never manufacture contract/payment evidence to reach WON.

## D03 — Client conversion semantics

**Status:** APPROVED

R6 owns idempotent lead/deal → client-account conversion because the Master Bible explicitly assigns client-account conversion to R6.

Conversion must:

1. resolve or create the canonical CLIENT `Organization`;
2. preserve company/contact identity links;
3. create at most one active `commercial.client_account` for the client organization;
4. create controlled client relationships;
5. preserve source lead/deal provenance;
6. be idempotent under retry;
7. never create a second tenant identity for the same accepted conversion;
8. not create R8 project records or R7 billing truth.

Portal membership/provisioning may be prepared only through accepted R3/R4/R5 identity/tenant controls.

## D04 — Existing UI responsibility

**Status:** APPROVED

R6 must preserve the existing 151-screen design responsibility.

Production implementation binds existing R6 screens to server-projected canonical data and commands.

It must not redesign the product or create a second CRM screen family as a substitute.

Missing canonical dynamic/list routes may be added as wrappers around the existing presentation responsibility.

Hard-coded demonstration routes may remain only as controlled aliases/test fixtures, not as canonical business identifiers.

## D05 — Module architecture

**Status:** APPROVED

Use accepted `src/modules` architecture.

R6 domain ownership:

- `src/modules/crm`
- `src/modules/communications`
- `src/modules/commercial`

Do not introduce a competing `src/server/domains` architecture from older illustrative prose.

## D06 — Database schemas

**Status:** APPROVED

Extend the existing PostgreSQL/Prisma datasource with logical schemas:

- `crm`
- `comms`
- `commercial`

Only R6-owned tables may be introduced.

R7-owned tables remain absent/dormant until R7 authorization.

Every tenant-scoped aggregate uses explicit organization ownership and the accepted resource/authorization envelope.

## D07 — Campaign approval / launch authority

**Status:** APPROVED

Campaign drafting/configuration uses `campaign.manage` / `outreach.prepare`.

The transition into approved/launchable execution and actual launch requires the CRITICAL `outreach.launch` authority.

At launch/relaunch the service must revalidate:

- current authority;
- exact campaign/audience/sequence version;
- sender health;
- suppression/DNC;
- consent/legal basis;
- schedule/rate policy;
- recipient eligibility.

Editing protected launch inputs invalidates prior launch approval.

## D08 — Provider integrations

**Status:** APPROVED

R6 owns provider-neutral business contracts and outbox dispatch boundaries for extraction, enrichment, sending and message ingestion.

No provider may be represented as successful without verifiable provider/test-adapter evidence.

Production provider credentials remain in the accepted secret/integration boundary.

A missing provider configuration must fail closed rather than simulate success.

## D09 — Extraction / enrichment source safety

**Status:** APPROVED

Lead discovery/extraction may operate only on permitted public sources or explicitly authorized connected sources.

Required controls:

- source allow/policy record;
- provenance URL/provider identity;
- SSRF/network destination policy;
- rate/compliance constraints;
- raw payload classification;
- dedupe review;
- no browser-supplied “approved source” authority;
- no enrichment fact becomes canonical merely because a provider returned it.

## D10 — R5 stage activation

**Status:** APPROVED

The R5 default active stage remains `R5` during planning.

When R6 implementation is separately authorized, R6 application/domain entrypoints may activate `R6` through trusted server-owned policy options only after resource/action/field policy exists.

Do not globally activate R6 merely by editing one default stage set before the whole owning surface is qualified.

R7+ activation remains absent.

## D11 — R7 boundary

**Status:** APPROVED

Regardless of D01, R6 must not implement:

- contract/signature lifecycle;
- invoice issuance/balance truth;
- payment/reconciliation/refund/ledger;
- member subscriptions;
- entitlements;
- R7 finance provider truth.

Products/packages also remain R7 under the current Master Bible release table unless a separate explicit scope amendment says otherwise.

## D12 — Search/analytics/renewal boundary

**Status:** APPROVED

R6 may emit events/read models needed later, but must not absorb:

- R11 production search/indexing;
- R11 analytics/reporting;
- R11 renewal/upsell engine;
- later broad automation systems.

## D13 — Client Portal boundary

**Status:** APPROVED

R6 may establish canonical client account/contact/access relationships required by conversion.

It must not claim R12 Client Portal production completion.

Client-facing screens remain projections governed by their owning later release and R5 client-safe field policy.

## D14 — Acceptance semantics

**Status:** APPROVED

Completing R6 planning, Gate A, enhanced qualification, or a G0 candidate does not authorize implementation.

Required controls remain:

1. all BLOCKING/HIGH contract findings closed;
2. D01 explicitly resolved;
3. exact P4-R6-G0 candidate SHA qualified;
4. explicit owner freeze/acceptance of P4-R6-G0;
5. separate explicit owner authorization for R6 implementation.


## D15 — Email-template permission stage ownership

**Status:** APPROVED — RESOLUTION A

Frozen operational screen 27 (`/app/outreach/templates`) belongs to the R6 outreach responsibility and expects template create/edit/version behavior.

Accepted P4-R5-C1 permission metadata contains:

- `template.manage`
- activation stage: `R6+`

Because stage activation is exact, activating R6 does not activate `R6+`.

This is a retained governance/registry-stage mismatch, not a current security defect.

### Candidate resolution A — preserve frozen permission-stage ownership

- keep `template.manage` dormant during R6;
- R6 Email Templates screen remains read-only/readiness or can select already-approved template versions only;
- R6 sequence/campaign code may reference an existing frozen template version but cannot create/edit/version templates through `template.manage`;
- a later explicitly authorized release owns template mutation.

**Default planning posture:** A, because it preserves the accepted R5 registry without silently widening R6.

### Candidate resolution B — explicit owner amendment

The owner may explicitly amend `template.manage` activation ownership from `R6+` to `R6`.

If B is selected, the implementation must update the accepted permission metadata through a controlled amendment and re-prove stage dormancy/action binding before activation.

No implementation may silently relabel or bypass the stage.

## Gate-A owner approval

The owner explicitly approved D01–D15.

### D01 approved resolution

Resolution A is authoritative:

- strict Master Completion Bible release-table precedence;
- proposal persistence, versioning, sending and acceptance remain R7-owned;
- proposal production behavior remains dormant during R6;
- R6 deal progression is capped at `PROPOSAL_PREPARATION`;
- R6 must not manufacture product/package, proposal, contract, invoice or payment truth.

### D15 approved resolution

Resolution A is authoritative:

- `template.manage` remains activation stage `R6+`;
- it remains dormant during R6;
- R6 may reference/select already-approved immutable template versions where required;
- R6 may not create/edit/version templates through `template.manage`;
- implementation may not relabel or implicitly activate `R6+`.

### D02–D14

Approved exactly as recorded in this document.

### Scope of approval

The approval authorizes only:

- completion of P4-R6-G0 contracts;
- trusted ResourceContext and field-policy definition;
- RLS/table inventory;
- lifecycle/guard mapping;
- mapping of all 120 threats to executable qualification;
- machine-verifiable R7+ exclusions;
- adversarial contract review;
- enhanced exact-head G0 qualification.

It does not authorize R6 production implementation.

R7+, Design 154 and V1.0 production certification remain locked.

## Gate-A completion condition

Gate A is complete.

The next control sequence is:

1. complete the remaining G0 companion contracts;
2. adversarially review/falsify the planning package;
3. close all BLOCKING/HIGH contract findings;
4. run exact-head enhanced G0 qualification;
5. classify one exact SHA as P4-R6-G0 READY FOR OWNER FREEZE;
6. obtain separate owner freeze/acceptance;
7. obtain separate R6 implementation authorization.


## D16 — R6 action-family enforcement

**Status:** REQUIRED G0 SECURITY CONTROL — NO SEPARATE SCOPE AMENDMENT

Accepted R5 policy action binding currently applies only when `activationStage === "R5"`.

Before any R6 permission can be activated, R6 implementation must add explicit permission→action/resource binding matching `PHASE-4-R6-AUTHORITY-ACTION-MATRIX.md` and the approved 37-key R6 active-permission allowlist.

Requirements:

- undeclared R6 permission action => DENY;
- permission absent from the approved 37-key R6 allowlist => DENY even if historical metadata says `R6`;
- wrong resource type => DENY;
- generic edit/manage may not launder lifecycle/launch authority;
- proposal permissions remain dormant under approved D01 Resolution A;
- `template.manage` remains dormant under approved D15 Resolution A;
- R7+ remains dormant;
- direct executable negative tests cover action laundering and dormant-key attempts.

This is a technical G0 control required to implement the already approved scope safely. It does not amend the owner-approved D01–D15 scope and does not authorize implementation.
