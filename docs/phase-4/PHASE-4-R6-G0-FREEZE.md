# Phase 4 — R6 G0 Frozen Contract Record

**Control gate:** P4-R6-G0  
**Date:** September 27, 2026  
**Status:** FROZEN — OWNER ACCEPTED  
**Authorized planning baseline:** `main@2372418d80fa07f633a0e4adc99a21b1f7d8300a`  
**Exact frozen contract candidate:** `730d2280fafe29c756ba7e0b09ff7e8e5c9496a6`  
**Planning branch:** `phase4/r6-crm-commercial-g0-20260927`  
**R6 production implementation:** NOT AUTHORIZED  
**R7+:** NOT AUTHORIZED  
**Design 154:** NOT AUTHORIZED  
**V1.0 production certification:** NOT AUTHORIZED

## 1. Owner freeze authorization

The owner explicitly stated:

> I accept and freeze P4-R6-G0 for exact contract candidate SHA 730d2280fafe29c756ba7e0b09ff7e8e5c9496a6.
>
> This acceptance freezes the R6 CRM & Commercial Engine implementation contract and its qualified companion planning records against the authorized baseline main@2372418d80fa07f633a0e4adc99a21b1f7d8300a.
>
> This does not authorize R6 production implementation. R6 implementation requires a separate explicit authorization after the frozen G0 record is established.
>
> R7+, Design 154, and V1.0 production certification remain unauthorized.

This statement is the authoritative owner action for P4-R6-G0.

No later documentation-only commit changes the exact frozen contract candidate.

## 2. Exact-candidate qualification evidence

The exact frozen contract candidate `730d2280fafe29c756ba7e0b09ff7e8e5c9496a6` passed:

- workflow: **R6 Contract Enhanced Qualification #35**
- run: `36310947241`
- job: `108596615497`
- result: **SUCCESS**
- contract verifier: **SUCCESS**
- planning-only branch-scope verifier: **SUCCESS**

The candidate was:

- 54 commits ahead / 0 behind the authorized baseline;
- planning/contract/qualification only;
- free of `src/**`, `prisma/**`, `public/**`, dependency, migration, and production implementation changes.

## 3. Freeze-record preparation evidence

After the frozen contract candidate was qualified, documentation-only freeze-candidate preparation was added without modifying the frozen contract candidate.

The pre-freeze wrapper head:

`47aeb5249cd951892bcb356340dadb172ea7bd53`

passed:

- workflow: **R6 Contract Enhanced Qualification #38**
- run: `36311108714`
- job: `108597086946`
- result: **SUCCESS**

Those post-candidate commits are governance/evidence records only.

They are not a replacement contract candidate and do not move the freeze away from `730d2280fafe29c756ba7e0b09ff7e8e5c9496a6`.

## 4. Frozen R6 scope

P4-R6-G0 freezes the R6 planning contract for:

- CRM sources, extraction, staged review, enrichment and provenance;
- canonical companies, contacts and leads;
- lead scoring/history, lists, qualification, dedupe and suppression;
- outreach campaigns, sequences, recipients and provider-neutral delivery evidence;
- conversations/messages and meeting foundations;
- deal pipeline/deal lifecycle through the approved R6 release ceiling;
- client-account conversion and client relationships;
- accepted R1–R5 tenancy, authorization, field/resource policy and audit inheritance;
- explicit R6 permission/action/resource binding;
- approved 37-key R6 active-permission subset;
- table-by-table RLS/tenancy requirements;
- idempotency/outbox/provider safety;
- canonical Team Workspace route binding;
- A01–A120 falsification/qualification obligations.

## 5. Frozen Gate-A resolutions

### D01 — Proposal ownership

**Resolution A is frozen.**

Proposal persistence, versioning, sending and acceptance are R7-owned.

The historical permission registry may retain:

- `proposal.view`
- `proposal.edit`
- `proposal.send`
- `proposal.approve`

with historical exact `R6` metadata, but those four keys are not members of the frozen R6 active-permission subset.

Frozen R6 active subset:

**37 keys**

The R6 Deal command ceiling is:

`PROPOSAL_PREPARATION`

R6 must not manufacture Proposal/Product/Package/Contract/Invoice/Payment truth to move beyond that ceiling.

### D15 — Email-template mutation ownership

**Resolution A is frozen.**

`template.manage` remains exact activation stage `R6+`.

It remains dormant in R6.

R6 may reference only an explicitly approved immutable template version according to the frozen contract and may not create/edit/version/archive/publish templates through `template.manage`.

## 6. Security and qualification floor

The frozen contract requires:

- 41 historical exact-R6 permission keys remain preserved as historical registry metadata;
- 37-key approved R6 active allowlist;
- Proposal keys explicitly excluded from R6 activation;
- `template.manage` remains dormant;
- default planning/runtime stage remains R5 until authorized implementation introduces the controlled R6 activation path;
- explicit R6 permission→action/resource/field/workflow binding;
- missing/undeclared action, resource context or field policy fails closed;
- tenant isolation and forced-RLS qualification for every future R6 tenant table;
- exact server-owned ResourceContext;
- DNC/suppression/contactability dispatch-time enforcement;
- lifecycle commands instead of generic status mutation;
- idempotent conversion/send/provider operations;
- atomic business/history/resource/outbox/audit behavior;
- R7+ production surfaces excluded;
- all A01–A120 threats retained in the program ledger;
- A86–A95 deferred to R7 behaviorally, not waived, with R6 absence/dormancy proof.

## 7. Accepted architecture preservation

P4-R6-G0 does not reopen or weaken:

- P4-R1-C1;
- P4-R2-C1;
- P4-R3-C1;
- P4-R4-C1;
- P4-R5-C1.

The implementation must extend the accepted `src/modules` architecture and existing PostgreSQL/Prisma security model.

No parallel CRM/server architecture is authorized.

## 8. Production implementation lock

This freeze is **not** R6 implementation authorization.

The following remain prohibited until a separate explicit owner authorization:

- R6 Prisma/domain schema changes;
- R6 migrations/RLS policies;
- R6 production CRM/comms/commercial modules;
- R6 production API routes;
- R6 permission activation;
- production UI data binding;
- extraction/enrichment/send/calendar providers;
- workers/webhooks;
- production seed/import of the immutable template reference catalog;
- R6 implementation PR/merge claiming product completion.

## 9. Later-release locks

This freeze does not authorize:

- R7 Proposal/Product/Package/Contract/Invoice/Payment/Subscription/Entitlement production work;
- R8+ production work;
- R11 search/analytics/renewal implementation;
- R12 Client Portal completion;
- Design 154;
- V1.0 production certification.

## 10. Control state

~~~text
R1–R5                         ACCEPTED + MERGED
main planning baseline        2372418d80fa07f633a0e4adc99a21b1f7d8300a

P4-R6-G0 frozen contract      730d2280fafe29c756ba7e0b09ff7e8e5c9496a6
candidate qualification #35  SUCCESS
owner freeze                  ACCEPTED
P4-R6-G0                      FROZEN

R6 production implementation NOT AUTHORIZED
R7+                           NOT AUTHORIZED
Design 154                    NOT AUTHORIZED
V1.0 certification            NOT AUTHORIZED
~~~

## 11. Next legitimate transition

The only next R6 transition is a **separate explicit owner authorization for R6 production implementation under this frozen P4-R6-G0 contract**.

No implementation authority may be inferred from this freeze.
