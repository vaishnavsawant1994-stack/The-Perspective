# Phase 4 — R6 Gate-A Readiness

**Record:** P4-R6-GATE-A-READINESS-01  
**Date:** September 27, 2026  
**Planning baseline:** `main@2372418d80fa07f633a0e4adc99a21b1f7d8300a`  
**Planning branch:** `phase4/r6-crm-commercial-g0-20260927`  
**Status:** P4-R6-G0 FROZEN — OWNER ACCEPTED  
**R6 production implementation:** NOT AUTHORIZED

## 1. Gate-A authority state

The live Gate-A authority record is `P4-R6-GOV-01`.

Owner-approved decisions:

- D01: **Resolution A** — strict Master Completion Bible release-table precedence; Proposal production behavior belongs to R7; R6 Deal progression stops at `PROPOSAL_PREPARATION`;
- D02–D14: approved as recorded;
- D15: **Resolution A** — `template.manage` remains `R6+` and dormant; R6 may only reference/select already-approved immutable template versions and may not mutate them.

The approval authorizes completion, falsification and qualification of P4-R6-G0 contracts only.

It does not authorize R6 production implementation.

## 2. Technical G0 control added after Gate-A

D16 is a technical security prerequisite, not a new scope amendment:

- future R6 activation requires the approved 37-key active-permission allowlist;
- four historical `proposal.*` keys remain excluded/dormant despite frozen R6 stage metadata;
- every active R6 permission requires explicit action/resource binding;
- undeclared action/resource/permission => DENY;
- `template.manage` remains excluded because its stage is `R6+`.

D16 must be implemented and directly attacked only after a separate R6 implementation authorization.

## 3. Completed planning evidence

The G0 package now includes:

- owner planning authorization;
- repository-backed pre-design audit;
- owner-approved Gate-A scope;
- R6 authority/action matrix;
- trusted ResourceContext + field policy;
- table-by-table database tenancy/RLS matrix;
- lifecycle/guard matrix;
- 120-case threat model;
- one-to-one threat→qualification matrix;
- draft P4-R6-G0 implementation contract;
- planning-only machine verifier/workflow.

No R6 production implementation has been added.

## 4. Repository facts established

At the authorized baseline:

- Prisma has no `crm`, `comms` or `commercial` production models;
- current APIs contain no R6 CRM/comms/commercial business routes;
- R6-adjacent UI is primarily hard-coded/prototype presentation;
- 15/34 canonical screens 11–44 have exact canonical route files;
- 19/34 require future canonical route binding;
- the accepted registry contains 41 historical exact-`R6` permission keys;
- owner-approved D01 narrows four `proposal.*` keys to R7 ownership;
- candidate R6 active subset is therefore exactly 37 keys;
- `template.manage` remains `R6+`;
- R5 default active stage remains exactly `R5`;
- R6 remains dormant.

## 5. Gate-A decision state

| Decision | State |
|---|---|
| D01 Proposal ownership | OWNER-APPROVED — Resolution A |
| D02 Deal lifecycle ceiling | OWNER-APPROVED |
| D03 Client conversion semantics | OWNER-APPROVED |
| D04 Existing UI responsibility | OWNER-APPROVED |
| D05 Module architecture | OWNER-APPROVED |
| D06 Database schemas | OWNER-APPROVED |
| D07 Campaign launch authority | OWNER-APPROVED |
| D08 Provider integrations | OWNER-APPROVED |
| D09 Source/extraction/enrichment safety | OWNER-APPROVED |
| D10 Stage activation | OWNER-APPROVED |
| D11 R7 boundary | OWNER-APPROVED |
| D12 R11 boundary | OWNER-APPROVED |
| D13 Client Portal boundary | OWNER-APPROVED |
| D14 Acceptance semantics | OWNER-APPROVED |
| D15 Email-template mutation ownership | OWNER-APPROVED — Resolution A |
| D16 R6 action-family enforcement | REQUIRED TECHNICAL G0 CONTROL |

Gate A is complete.

## 6. Qualification state

A pre-final exact-head qualification checkpoint passed on:

- SHA: `730d2280fafe29c756ba7e0b09ff7e8e5c9496a6`
- workflow: R6 Contract Enhanced Qualification #35
- run: `36310947241`
- job: `108596615497`
- verifier: SUCCESS
- planning-only branch scope: SUCCESS

That SHA is a pre-final checkpoint because this readiness/candidate record is being added afterward.

The final owner-freeze candidate is valid only if the exact branch head carrying the completed candidate record and current verifier also passes the same enhanced qualification workflow.

## 7. Owner freeze

The owner explicitly accepted and froze P4-R6-G0 for exact contract candidate:

`730d2280fafe29c756ba7e0b09ff7e8e5c9496a6`

against planning baseline:

`main@2372418d80fa07f633a0e4adc99a21b1f7d8300a`

The permanent frozen record is:

`PHASE-4-R6-G0-FREEZE.md`

The exact contract candidate had already passed R6 Contract Enhanced Qualification #35.

The later owner-freeze candidate wrapper at `47aeb5249cd951892bcb356340dadb172ea7bd53` also passed R6 Contract Enhanced Qualification #38 before the owner freeze was recorded.

No post-candidate documentation commit changes the exact frozen contract SHA.

## 8. Implementation control

P4-R6-G0 freeze does **not** authorize production implementation.

The next legitimate R6 transition is a separate explicit owner authorization for implementation under the frozen contract.

Until that occurs:

- no R6 Prisma/domain schema or migration work;
- no CRM/comms/commercial production modules;
- no R6 production APIs;
- no R6 permission activation;
- no production UI binding;
- no provider/worker implementation;
- no implementation PR/merge claiming R6 completion.

R7+, Design 154 and V1.0 production certification remain unauthorized.

## 9. Current control state

~~~text
R1–R5                         ACCEPTED + MERGED
R6 planning                   COMPLETE
R6 repository audit           COMPLETE
Gate A D01–D15                OWNER-APPROVED
D01 Proposal ownership        FROZEN — Resolution A / R7
D15 Template ownership        FROZEN — Resolution A / R6+ dormant
Post-Gate action binding      FROZEN G0 REQUIREMENT
R6 threat model               120/120 PLANNED
R6 threat qualification map   120/120 PLANNED
P4-R6-G0 contract SHA         730d2280fafe29c756ba7e0b09ff7e8e5c9496a6
P4-R6-G0                      FROZEN — OWNER ACCEPTED
R6 production implementation NOT AUTHORIZED
R7+                           NOT AUTHORIZED
Design 154                    NOT AUTHORIZED
V1.0 certification            NOT AUTHORIZED
~~~
