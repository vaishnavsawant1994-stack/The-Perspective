# Phase 4 — R6 Gate-A Readiness

**Record:** P4-R6-GATE-A-READINESS-01  
**Date:** September 27, 2026  
**Planning baseline:** `main@2372418d80fa07f633a0e4adc99a21b1f7d8300a`  
**Planning branch:** `phase4/r6-crm-commercial-g0-20260927`  
**Status:** NOT READY FOR P4-R6-G0 FREEZE  
**R6 production implementation:** NOT AUTHORIZED

## 1. Completed planning evidence

The current planning package includes:

- explicit owner planning authorization;
- repository-backed pre-design audit;
- recovered Phase-2C CRM/comms/commercial data architecture;
- recovered Phase-2D lifecycle/transition rules;
- recovered Phase-2E screens 11–44 responsibility map;
- recovered Phase-2F service/API expectations;
- current Prisma/API/UI implementation inventory;
- R5 R6-stage permission inventory;
- R6 permission/action/resource matrix;
- R6 trusted resource/field policy;
- R6 table-by-table tenancy/RLS matrix;
- 120-case adversarial threat model;
- Gate-A governance decision record;
- draft P4-R6-G0 implementation contract.

No R6 production implementation has been added.

## 2. Repository facts established

At authorized baseline:

- Prisma contains no `crm`, `comms` or `commercial` production models;
- `src/app/api/v1` contains no CRM/comms/commercial business APIs;
- relevant operational UI is primarily hard-coded/prototype presentation;
- 15 of 34 canonical screens 11–44 have exact canonical route files;
- 19 of 34 require canonical route binding in a future authorized implementation;
- 41 permission keys are frozen with exact `activationStage: "R6"`;
- R5 default active stages remain exactly `R5`;
- R6 permissions are therefore dormant;
- current action-family enforcement is R5-specific and must be extended before R6 activation.

## 3. Closed design direction

The candidate package has a concrete, fail-closed direction for:

- preserving R1–R5;
- extending `src/modules` rather than creating a parallel server stack;
- logical `crm`, `comms`, `commercial` schemas;
- resource registration;
- RLS inventory;
- field projections;
- idempotency;
- outbox/worker behavior;
- extraction/enrichment provenance;
- suppression/DNC safety;
- campaign launch authority;
- conversation/message visibility;
- deal/client conversion;
- provider evidence;
- canonical route binding;
- R7+ exclusions;
- executable security qualification.

## 4. Open blocking governance decisions

### D01 / R6-G01 — Proposal release ownership

Retained sources conflict between:

- Master Bible R7 release text assigning proposals to R7; and
- Phase-2C/2D + accepted R5 permission activation placing proposal behavior in the R6-adjacent domain.

**Status:** OPEN / BLOCKING.

Default planning posture: strict Master Bible release-table precedence; keep Proposal production behavior R7 until owner explicitly decides otherwise.

### D15 / R6-G02 — Email Template mutation ownership

Frozen screen 27 expects template mutation, but `template.manage` is activation stage `R6+`, not `R6`.

**Status:** OPEN / BLOCKING.

Default planning posture: keep template mutation dormant until owner explicitly assigns it to R6 or a later release.

## 5. Security implementation prerequisite

### D16 / R6-G03 — R6 action-family binding

This is not an owner-scope ambiguity and not a current vulnerability.

R6 is dormant today.

Before future activation, implementation must add and test explicit R6 permission→allowed-action/resource binding.

The candidate matrix is recorded in:

`PHASE-4-R6-AUTHORITY-ACTION-MATRIX.md`

**Status:** CONTRACTED REQUIREMENT / BLOCKS ACTIVATION UNTIL IMPLEMENTED.

## 6. Gate-A decision state

| Decision | State |
|---|---|
| D01 Proposal ownership | OPEN — owner decision required |
| D02 Deal lifecycle ceiling | candidate APPROVE |
| D03 Client conversion semantics | candidate APPROVE |
| D04 Preserve existing UI responsibility | candidate APPROVE |
| D05 Use accepted `src/modules` architecture | candidate APPROVE |
| D06 CRM/comms/commercial schema ownership | candidate APPROVE |
| D07 Campaign launch authority | candidate APPROVE |
| D08 Provider contract | candidate APPROVE |
| D09 Source/extraction/enrichment safety | candidate APPROVE |
| D10 Stage activation | candidate APPROVE |
| D11 R7 boundary | candidate APPROVE |
| D12 R11 boundary | candidate APPROVE |
| D13 Client Portal boundary | candidate APPROVE |
| D14 Acceptance semantics | candidate APPROVE |
| D15 Email template mutation ownership | OPEN — owner decision required |
| D16 R6 action-family enforcement | candidate APPROVE |

Gate A cannot be recorded as owner-approved while D01 and D15 remain unresolved.

## 7. Required next transition

~~~text
current R6 planning package
       ↓
machine contract qualification
       ↓
resolve D01
resolve D15
       ↓
owner approve Gate-A decisions
       ↓
repair any falsification findings
       ↓
enhanced requalification
       ↓
exact P4-R6-G0 candidate
       ↓
explicit owner freeze/acceptance
       ↓
separate implementation authorization
       ↓
ONLY THEN R6 production implementation
~~~

## 8. Current control state

~~~text
R1–R5                         ACCEPTED
R6 planning                   AUTHORIZED
R6 repository audit           COMPLETE
R6 threat model               DRAFTED
R6 G0 contract                DRAFT CANDIDATE
D01 Proposal ownership        OPEN / BLOCKING
D15 Template ownership        OPEN / BLOCKING
Gate A                        NOT OWNER-APPROVED
P4-R6-G0                      NOT FROZEN
R6 production implementation NOT AUTHORIZED
R7+                           LOCKED
Design 154                    LOCKED
V1.0 certification            NOT AUTHORIZED
~~~
