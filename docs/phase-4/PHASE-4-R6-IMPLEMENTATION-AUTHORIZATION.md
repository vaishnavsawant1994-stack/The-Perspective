# Phase 4 — R6 CRM & Commercial Engine Production Implementation Authorization

**Record:** P4-R6-AUTH-IMPLEMENTATION-01  
**Date:** September 27, 2026  
**Authorized implementation baseline:** `main@2372418d80fa07f633a0e4adc99a21b1f7d8300a`  
**Frozen implementation contract:** `P4-R6-G0@730d2280fafe29c756ba7e0b09ff7e8e5c9496a6`  
**Implementation branch:** `phase4/r6-crm-commercial-implementation-20260927`  
**P4-R6-G0:** FROZEN — OWNER ACCEPTED  
**P4-R6-C1:** NOT ACCEPTED  
**Merge:** NOT AUTHORIZED  
**R7+:** NOT AUTHORIZED  
**Design 154:** NOT AUTHORIZED  
**V1.0 certification:** NOT AUTHORIZED

## 1. Owner authorization

The owner explicitly authorized:

> I authorize R6 CRM & Commercial Engine production implementation against frozen P4-R6-G0 at exact contract SHA 730d2280fafe29c756ba7e0b09ff7e8e5c9496a6, using main@2372418d80fa07f633a0e4adc99a21b1f7d8300a as the authorized implementation baseline. Preserve all accepted R1–R5 architecture, behavior, security and qualification requirements and implement only the frozen R6 scope. Follow the frozen implementation sequence, A01–A120 threat obligations, 37-key active R6 permission subset, RLS/resource/field/action/workflow controls, and exact-head qualification requirements. Proposal production remains R7-owned; template.manage remains dormant. Do not implement R7+, Design 154, or V1.0 certification. Do not merge or declare P4-R6-C1 accepted without separate owner acceptance after full falsification and qualification.

This is the authoritative production implementation authorization for R6.

## 2. Immutable contract boundary

Implementation MUST conform to frozen contract SHA:

`730d2280fafe29c756ba7e0b09ff7e8e5c9496a6`

Later G0 governance/status commits do not redefine this implementation contract.

## 3. Authorized sequence

1. R6-owned schema/migrations + tenant/RLS/resource contracts;
2. repository primitives + CRM core;
3. communications;
4. commercial R6 core through `PROPOSAL_PREPARATION`;
5. R5→R6 authorization integration for exactly 37 active R6 keys;
6. APIs, provider/worker boundaries, canonical UI data binding;
7. A01–A120 falsification + R3–R5 regressions + exact-head qualification;
8. assemble P4-R6-C1 evidence only;
9. stop for separate owner acceptance;
10. merge only after separate owner acceptance/merge authorization.

## 4. Hard exclusions

R6 MUST NOT implement:

- Proposal production persistence/version/send/acceptance;
- products/packages;
- contracts/signatures;
- invoices/credit notes;
- payments/allocations/refunds/ledger;
- subscriptions/entitlements;
- R7+ production behavior;
- Design 154;
- V1.0 certification.

`template.manage` remains dormant at exact stage `R6+`.

Historical `proposal.*` permission metadata remains preserved but all four proposal keys are excluded from the active R6 subset.

## 5. Current control state

~~~text
P4-R6-G0                      FROZEN
Frozen contract               730d2280fafe29c756ba7e0b09ff7e8e5c9496a6
Implementation baseline       2372418d80fa07f633a0e4adc99a21b1f7d8300a
R6 implementation             AUTHORIZED
P4-R6-C1                      NOT ACCEPTED
Merge                         NOT AUTHORIZED
R7+                           NOT AUTHORIZED
Design 154                    NOT AUTHORIZED
V1.0 certification            NOT AUTHORIZED
~~~
