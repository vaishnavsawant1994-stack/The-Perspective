# Phase 4 — R6 Gate-A / G0 Readiness

**Record:** P4-R6-GATE-A-READINESS-01  
**Date:** September 27, 2026  
**Planning baseline:** `main@2372418d80fa07f633a0e4adc99a21b1f7d8300a`  
**Planning branch:** `phase4/r6-crm-commercial-g0-20260927`  
**Status:** GATE-A COMPLETE — P4-R6-G0 NOT YET QUALIFIED/FROZEN  
**R6 production implementation:** NOT AUTHORIZED

## 1. Gate-A owner decision

Gate A is owner-approved for D01–D15.

### D01

Resolution A approved:

- Proposal production ownership remains R7;
- R6 proposal persistence/version/send/acceptance is dormant;
- R6 deal ceiling is `PROPOSAL_PREPARATION`;
- R6 cannot manufacture product/package/proposal/contract/invoice/payment truth.

### D15

Resolution A approved:

- `template.manage` remains exact activation stage `R6+`;
- R6 does not activate it;
- R6 may reference/select already-approved immutable template versions;
- R6 may not create/edit/version templates through `template.manage`.

D02–D14 are approved exactly as recorded in `PHASE-4-R6-GATE-A-DECISIONS.md`.

## 2. Completed G0 planning artifacts

The package now contains:

- planning authorization;
- repository pre-design audit;
- Gate-A decisions;
- authority/action/resource matrix;
- trusted ResourceContext + field policy;
- database tenancy/RLS matrix;
- lifecycle/guard matrix;
- 120-case threat model;
- one-to-one 120-case threat qualification matrix;
- machine-verifiable R7+ exclusion manifest;
- draft P4-R6-G0 implementation contract;
- enhanced contract qualification workflow/verifier.

No R6 production implementation has been authorized or added.

## 3. Repository facts

At the authorized baseline:

- Prisma has no `crm`, `comms`, or `commercial` production models;
- there are zero CRM/comms/commercial production API routes;
- R6-looking workspace screens are prototype/static presentation rather than durable business behavior;
- 15/34 canonical screens 11–44 have exact canonical route files;
- 19/34 require canonical binding during a future authorized implementation;
- accepted R5 registry contains 41 historical `activationStage: "R6"` keys;
- four proposal keys are owner-narrowed to R7 production ownership;
- candidate R6 active subset is therefore 37 keys;
- `template.manage` remains `R6+`;
- R5 default active stage remains exactly `R5`;
- R6 production authority is currently dormant.

## 4. Closed governance findings

| Finding | Disposition |
|---|---|
| R6-G01 Proposal release ownership | CLOSED — D01 Resolution A |
| R6-G02 Template mutation stage ownership | CLOSED — D15 Resolution A |
| R6-G04 Historical proposal R6 metadata vs narrowed R7 ownership | CLOSED AT CONTRACT LEVEL — explicit 37-key active allowlist required |

R6-G03 is an implementation prerequisite, not a current vulnerability:

- R5 action binding is R5-only;
- R6 remains dormant;
- future R6 activation must implement/test explicit action/resource binding for the approved 37-key active subset.

## 5. R7+ exclusion state

R6 explicitly excludes production:

- products/packages;
- proposals;
- contracts/signatures;
- invoices/payments/refunds/ledger;
- subscriptions/entitlements;
- R8 project/editorial production;
- R11 search/analytics/renewal engine;
- R12 Client Portal production completion.

A86–A95 remain R7 behavioral threats and are **deferred, not waived**.

## 6. Remaining work before owner G0 freeze

Only contract-control work remains:

1. adversarially review the complete G0 package;
2. close any BLOCKING/HIGH planning findings;
3. update machine verifier to the approved Gate-A state;
4. run enhanced qualification on one exact candidate SHA;
5. verify branch scope is planning-only;
6. record exact workflow/job evidence;
7. classify the exact SHA as **P4-R6-G0 READY FOR OWNER FREEZE**.

This document does not itself perform step 7.

## 7. Control state

~~~text
R1–R5                         ACCEPTED
R6 planning                   AUTHORIZED
Gate A D01–D15                OWNER-APPROVED
R6 pre-design audit           COMPLETE
R6 resource/field policy      COMPLETE CANDIDATE
R6 tenancy/RLS matrix         COMPLETE CANDIDATE
R6 lifecycle/guard matrix     COMPLETE CANDIDATE
R6 threat model               120 CASES
R6 threat qualification map   120/120 MAPPED
R7+ exclusion manifest        COMPLETE CANDIDATE
R6 contract                   DRAFT G0 CANDIDATE
adversarial contract audit    PENDING
enhanced exact-head qual      PENDING
P4-R6-G0                      NOT FROZEN
R6 implementation             NOT AUTHORIZED
R7+                           LOCKED
Design 154                    LOCKED
V1.0 certification            NOT AUTHORIZED
~~~
