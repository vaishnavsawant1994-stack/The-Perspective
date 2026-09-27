# Phase 4 — R6 Contract Adversarial Audit

**Record:** P4-R6-CONTRACT-AUDIT-01  
**Date:** September 27, 2026  
**Planning baseline:** `main@2372418d80fa07f633a0e4adc99a21b1f7d8300a`  
**Planning branch:** `phase4/r6-crm-commercial-g0-20260927`  
**Review type:** authoring-agent adversarial review / enhanced qualification preparation  
**Independent external review: NOT PERFORMED**  
**Production implementation: NOT AUTHORIZED**  
**P4-R6-G0:** NOT FROZEN

## 0. Objective

Attack the R6 planning package before any owner G0 freeze.

The review attempts to prove that the contract package could:

- silently widen R6 into R7+;
- activate permission vocabulary that the owner excluded;
- infer unapproved governance decisions;
- omit ResourceContext/field/RLS controls;
- leave lifecycle status as generic CRUD;
- omit threat coverage;
- qualify a branch containing production code;
- claim implementation readiness without exact-head machine evidence.

A finding is closed only by a concrete contract/tooling repair.

## 1. Evidence reviewed

The review used:

- V1 Master Completion Bible;
- accepted P4-R1-C1 through P4-R5-C1;
- frozen Phase-2C/2D/2E/2F sources;
- current Prisma schema;
- current R5 permission registry/action policy;
- R6 planning authorization;
- pre-design audit;
- Gate-A D01–D15 owner decision;
- action/resource matrix;
- ResourceContext/field policy;
- database tenancy/RLS matrix;
- lifecycle/guard matrix;
- 120-case threat model;
- 120-case threat qualification mapping;
- R7+ exclusion manifest;
- draft implementation contract;
- G0 verifier/workflow;
- branch diff against exact planning baseline.

## 2. Findings and repair trail

| ID | Severity | Attack / finding | Disposition |
|---|---|---|---|
| F01 | HIGH | Gate-A document retained a duplicated pre-approval D15 plus an unapproved D16 decision block after owner approval | CLOSED — stale duplicate removed; action-family enforcement retained only as a post-Gate security prerequisite, not fabricated owner approval |
| F02 | HIGH | Gate-A readiness still said D01/D15 OPEN and Gate A NOT OWNER-APPROVED | CLOSED — readiness rewritten to Gate-A complete while G0 remains unqualified/unfrozen |
| F03 | HIGH | Action matrix still described Proposal actions as conditional after D01 was resolved | CLOSED — proposal permissions explicitly map to R7/inactive with NONE IN R6 |
| F04 | HIGH | Historical `activationStage: "R6"` on four proposal permissions could make stage-only activation wider than the owner-approved R6 scope | CLOSED AT CONTRACT LEVEL — explicit 37-key R6 active-permission allowlist required in addition to stage activation |
| F05 | MEDIUM | Pre-design audit still listed Proposal as a possible R6 resource after D01 | CLOSED — Proposal removed from active R6 resource ownership |
| F06 | HIGH | D15 left ambiguity over template persistence when `template.manage` is dormant | CLOSED — template persistence, if materialized in R6, is read/reference-only for pre-approved immutable versions; zero templates is valid and campaign readiness fails closed |
| F07 | HIGH | Original G0 verifier expected D01/D15 to remain open and Gate A not approved, so it could not qualify the owner-approved state | CLOSED — verifier rewritten for explicit Gate-A approval |
| F08 | HIGH | Original verifier did not require lifecycle matrix, 120/120 threat mapping, R7 exclusion manifest, or adversarial audit | CLOSED — all are mandatory verifier inputs |
| F09 | HIGH | Original verifier counted 41 R6-stage keys but did not prove the four proposal keys are excluded from active R6 production authority | CLOSED — verifies proposal NONE IN R6 + 37-key active subset |
| F10 | HIGH | A86–A95 could disappear when Proposal moved to R7 | CLOSED — IDs remain in threat ledger as DEFERRED TO R7, NOT WAIVED; R6 proves absence/dormancy |
| F11 | HIGH | R6 could accidentally create R7 tables/APIs while still describing itself as “future-ready” | CLOSED AT G0 CONTRACT LEVEL — machine-verifiable R7+ exclusion manifest + planning diff allowlist |
| F12 | HIGH | Generic status PATCH could bypass Phase-2D lifecycle guards | CLOSED AT CONTRACT LEVEL — lifecycle matrix makes status command-only and pins R6 deal ceiling |
| F13 | HIGH | DNC/unsubscribe/positive-reply races could be missed by happy-path campaign design | CLOSED AT CONTRACT LEVEL — dispatch-time recheck and race attacks A37–A54 required |
| F14 | HIGH | Cross-tenant child/evidence tables could be treated as “tenant neutral” | CLOSED AT CONTRACT LEVEL — every R6 table classified DIRECT RLS, PARENT RLS + FK, or EVIDENCE/SYSTEM RESTRICTED |
| F15 | HIGH | Client conversion could implicitly create portal/admin/R7/R8 authority | CLOSED AT CONTRACT LEVEL — conversion is idempotent identity/account linkage only; IAM provisioning, project, proposal, finance remain separate |
| F16 | MEDIUM | Existing hard-coded UI values could be promoted as production truth | CLOSED AT CONTRACT LEVEL — prototype-to-production rule prohibits this; browser qualification must prove server-backed canonical records |
| F17 | HIGH | Planning branch could contain production code while docs claim “planning only” | CLOSED BY QUALIFICATION DESIGN — exact baseline diff permits only R6 planning docs + governance verifier + R6 qualification workflow |
| F18 | HIGH | Missing/duplicate threat IDs could evade review | CLOSED BY QUALIFICATION DESIGN — exact A01–A120 set required in both model and mapping |
| F19 | HIGH | Missing R6 action-family binding could be bypassed by merely adding R6 to activeStages | CLOSED AT CONTRACT LEVEL — action/resource binding + explicit 37-key allowlist required before activation |
| F20 | HIGH | `calendar.view` could be activated early to make meeting UI convenient | CLOSED AT CONTRACT LEVEL — general calendar permission remains R8; R6 meetings use meeting-specific authority only |

## 3. Cross-document consistency falsification

The final manual/machine-assisted consistency scan checked:

- Gate-A owner approval is present;
- no Gate-A OPEN/BLOCKING decision remains;
- no unapproved D16 decision exists;
- D01 Resolution A appears consistently;
- D15 Resolution A appears consistently;
- Proposal is not an active R6 resource/API/table/action;
- four proposal keys remain historical registry entries but inactive in R6;
- R6 candidate active subset is exactly 37;
- `template.manage` remains exact stage `R6+`;
- R5 `DEFAULT_ACTIVE_STAGES` remains exactly `R5`;
- ResourceContext/field policy exists for active R6 resources;
- RLS/table matrix covers candidate R6 tables;
- lifecycle matrix blocks generic status mutation and R7 stage transitions;
- threat model contains exactly A01–A120;
- qualification matrix contains exactly A01–A120;
- A86–A95 remain R7-deferred, not waived;
- R7+ exclusion manifest is present;
- baseline diff contains zero `src/**`, `prisma/**`, `public/**`, package/dependency production changes.

Result of the final cross-document scan before this record:

~~~text
findings: 0
production changes: 0
unexpected planning-scope files: 0
threat cases: 120
mapped threat cases: 120
historical R6-stage permissions: 41
candidate active R6 permissions: 37
~~~

## 4. Scope falsification

### Attempt: pull Proposal into R6 because screens/permissions exist

**FAILED.**

Highest-precedence release table + owner D01 Resolution A keeps Proposal production in R7.

### Attempt: treat R6 stage metadata as sufficient to activate Proposal

**FAILED.**

G0 requires the 37-key active allowlist in addition to stage activation.

### Attempt: treat `R6+` as R6 for template mutation

**FAILED.**

Exact stage ownership preserved; D15 keeps mutation dormant.

### Attempt: reach WON by creating placeholder proposal/contract/payment flags

**FAILED.**

Deal commands stop at `PROPOSAL_PREPARATION`; R7 evidence cannot be manufactured.

### Attempt: make Client Portal part of R6 because client accounts/access exist

**FAILED.**

R6 owns Team-side conversion/access foundation only; R12 remains locked.

## 5. Security falsification

The contract has explicit planned proof for:

- cross-tenant UUID reads/writes;
- ASN/OWN forgery;
- field/list/count leakage;
- SSRF/source redirect escape;
- provenance/enrichment trust;
- DNC/unsubscribe normalization/races;
- campaign approval invalidation;
- duplicate/replayed sends;
- webhook signature/replay/order;
- internal-note/client-message separation;
- meeting authorization/history;
- deal stage/pipeline/version/concurrency;
- duplicate client conversion;
- transaction/outbox/audit rollback;
- runtime-role RLS attacks;
- bulk/import authority injection;
- prototype data accidentally treated as durable truth.

No applicable attack is omitted from the A01–A120 ledger.

## 6. Governance integrity

The audit does **not**:

- claim independent review;
- freeze P4-R6-G0;
- authorize R6 implementation;
- authorize R7+;
- authorize Design 154;
- certify V1.0.

Gate-A owner approval is real and limited to D01–D15.

P4-R6-G0 still requires exact-head enhanced qualification and then a separate owner freeze/acceptance.

## 7. Final adversarial disposition

~~~text
Gate-A decisions: APPROVED D01-D15
contract falsification: PASS
BLOCKING/HIGH findings remaining: NONE OPEN
MEDIUM findings requiring G0 stop: NONE OPEN
production implementation: NOT AUTHORIZED
R7+: LOCKED
Design 154: LOCKED
V1.0 certification: NOT AUTHORIZED
P4-R6-G0: NOT FROZEN
next gate: exact-head enhanced G0 qualification
~~~
