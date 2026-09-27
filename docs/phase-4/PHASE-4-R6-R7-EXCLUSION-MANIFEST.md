# Phase 4 — R6 Machine-Verifiable R7+ Exclusion Manifest

**Record:** P4-R6-EXCLUSION-01  
**Date:** September 27, 2026  
**Status:** G0 CANDIDATE — ENFORCED PLANNING BOUNDARY  
**Authority:** owner-approved Gate-A D01, D11, D12, D13, D15  
**R6 production implementation:** NOT AUTHORIZED

## 0. Purpose

R6 must not become a hidden R7/R8/R11/R12 implementation.

This manifest gives qualification tooling an explicit denylist and positive R6 boundary.

A future implementation candidate fails qualification if it introduces an excluded production surface without a separately approved scope amendment.

## 1. R6-owned production domains after future implementation authorization

Allowed owning module families:

- `src/modules/crm/**`
- `src/modules/communications/**`
- `src/modules/commercial/**` — R6 deal/client-account subset only
- `src/app/api/v1/workspace/**` — only endpoints explicitly listed in P4-R6-G0
- canonical R6 Team Workspace route wrappers/components needed to bind screens 11–44
- R6 migrations for the tables listed in P4-R6-DB-TENANCY-01

This allowlist does not itself authorize implementation.

## 2. R7 entity/table denylist

R6 must not add production persistence for:

- `commercial.products`
- `commercial.packages`
- `commercial.proposals`
- `commercial.proposal_versions`
- `commercial.proposal_acceptances`
- `commercial.contracts`
- `commercial.contract_versions`
- `commercial.contract_signers`
- `commercial.signature_events`
- `commercial.invoices`
- `commercial.invoice_lines`
- `commercial.credit_notes`
- `commercial.credit_note_lines`
- `commercial.payments`
- `commercial.payment_allocations`
- `commercial.refunds`
- `commercial.ledger_transactions`
- `commercial.ledger_entries`

Also excluded:

- member subscription production tables;
- entitlement production tables;
- provider billing/customer/subscription truth.

## 3. R7 production API denylist

R6 must not introduce production handlers for routes equivalent to:

- `/api/v1/workspace/products/**`
- `/api/v1/workspace/packages/**`
- `/api/v1/workspace/proposals/**`
- `/api/v1/workspace/contracts/**`
- `/api/v1/workspace/invoices/**`
- `/api/v1/workspace/payments/**`
- `/api/v1/workspace/subscriptions/**`
- `/api/v1/workspace/entitlements/**`

A visual prototype route is not production API authority.

## 4. R7 service/worker denylist

R6 must not implement:

- product/package lifecycle service;
- proposal version/send/acceptance service;
- contract/signature/envelope service;
- invoice issue/number/balance service;
- payment reconciliation/allocation/refund service;
- ledger posting;
- subscription billing service;
- entitlement enforcement;
- R7 provider workers/webhooks.

## 5. Deal stage ceiling

R6 commands may not create evidence or transition into R7-owned states.

The R6 ceiling is:

`PROPOSAL_PREPARATION`

R6 must deny active transition into:

- `PROPOSAL_SENT`
- R7-backed `NEGOTIATION`
- `VERBAL_CONFIRMATION`
- `CONTRACT_SENT`
- `CONTRACT_SIGNED`
- `PAYMENT_PENDING`
- `WON`

If later canonical compatibility stores those enum values, existence of the enum does not activate the transition.

## 6. Permission-stage exclusion

The accepted R5 permission registry remains authoritative.

During R6:

- `proposal.view` — remains dormant despite historical `activationStage: "R6"` because D01 assigns the owning production surface to R7;
- `proposal.edit` — dormant;
- `proposal.send` — dormant;
- `proposal.approve` — dormant;
- `template.manage` — remains exact activation stage `R6+`, dormant under approved D15;
- all R7/R8/R9/R10/R11/R12/R13/R14 permissions remain dormant.

R6 implementation must not globally enable every registry key whose metadata says R6 if Gate-A has narrowed the owning production surface.

The R6 activation mechanism therefore needs an explicit approved R6 active-permission subset in addition to stage metadata.

## 7. R6 active-permission subset

Candidate active subset is the accepted R6-stage registry **minus** the four proposal permissions.

Expected active permission count:

**37**

Excluded historical R6-stage keys:

- `proposal.view`
- `proposal.edit`
- `proposal.send`
- `proposal.approve`

All other R6 activation still requires the exact action/resource/field/workflow contracts.

## 8. D15 template exclusion

R6 may reference/select an already-approved immutable template version.

R6 may not:

- create template;
- edit template;
- create template version;
- approve/publish template;
- use `template.manage`.

If no suitable approved template version exists, campaign readiness fails closed.

## 9. R8+ exclusions

R6 must not implement:

- project/workflow/task production engine;
- questionnaire/deliverable/editorial production;
- assets/approval production completion beyond inherited foundation needed by accepted earlier stages;
- publishing/distribution engines;
- media/events engines.

Cross-domain IDs/events may be reserved without implementing the owning release.

## 10. R11 exclusions

R6 must not implement:

- production full-text/faceted search/indexing;
- reporting/analytics engine;
- renewal/upsell engine;
- broad automation-rule production completion.

R6 may emit versioned events/read-model inputs for later owners.

## 11. R12 exclusions

R6 client-account conversion does not equal Client Portal production completion.

R6 must not activate broad Client-surface permissions or claim R12 acceptance.

Team-side `client.view`, `client.contact.manage`, `client.portal.manage`, and `client.portal.provision` remain Team administrative capabilities governed by R5/R6; they do not grant a Client user access to Team CRM data.

## 12. Planning-branch exclusion

Before implementation authorization, the R6 G0 branch may change only:

- `docs/phase-4/PHASE-4-R6-*.md`
- `scripts/governance/verify-r6-contract.mjs`
- `.github/workflows/r6-contract-enhanced-qualification.yml`

No `src/**`, `prisma/**`, public asset, migration, package dependency, runtime config, or production workflow change is permitted.

## 13. Machine qualification assertions

The R6 G0 verifier must assert:

1. planning diff contains only the three allowed path classes above;
2. Prisma datasource/schema remains unchanged from the authorized baseline;
3. no R6 `crm/comms/commercial` production model has been added during planning;
4. no R7 table/model has been added;
5. no R7 production API route has been added;
6. R5 `DEFAULT_ACTIVE_STAGES` remains exactly `R5`;
7. `template.manage` remains `R6+`;
8. proposal permission keys remain registered but no production R6 activation path exists;
9. Gate-A records D01 Resolution A and D15 Resolution A as approved;
10. contract records the 37-key candidate active subset rule;
11. threat A86–A95 are deferred to R7, not waived;
12. R7+, Design 154 and V1.0 remain locked.

## 14. Future implementation qualification

When implementation is separately authorized, the R6 implementation verifier must compare the actual diff and runtime surface against this manifest.

A prohibited R7 production surface is a BLOCKING failure, not an allowed “future-ready” addition.
