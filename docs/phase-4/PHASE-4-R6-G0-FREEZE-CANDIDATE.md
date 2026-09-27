# Phase 4 — R6 G0 Owner-Freeze Candidate

**Record:** P4-R6-G0-CANDIDATE  
**Date:** September 27, 2026  
**Planning baseline:** `main@2372418d80fa07f633a0e4adc99a21b1f7d8300a`  
**Branch:** `phase4/r6-crm-commercial-g0-20260927`  
**Status:** OWNER-FREEZE CANDIDATE — NOT FROZEN  
**R6 production implementation:** NOT AUTHORIZED  
**R7+:** LOCKED  
**Design 154:** NOT AUTHORIZED  
**V1.0 certification:** NOT AUTHORIZED

## 1. Candidate scope

This candidate contains planning/contract/qualification work only.

It preserves accepted P4-R1-C1 through P4-R5-C1.

No R6 production schema, migration, API, domain service, worker, UI data binding, permission activation, provider integration, or runtime business behavior is authorized by this record.

## 2. Gate-A state

Owner-approved decisions:

- D01–D15: APPROVED;
- D01 Resolution A: Proposal persistence/versioning/send/acceptance remain R7-owned;
- D15 Resolution A: `template.manage` remains exact stage `R6+` and dormant during R6.

Technical G0 prerequisite:

- future R6 activation requires the approved 37-key active-permission allowlist plus explicit action/resource/field/workflow policy.

## 3. Contract package

The candidate includes:

- planning authorization;
- repository pre-design audit;
- Gate-A decisions/readiness;
- authority/action matrix;
- trusted ResourceContext + field policy;
- database tenancy/RLS matrix;
- lifecycle/guard matrix;
- 120-case threat model;
- 120/120 threat qualification map;
- machine-verifiable R7+ exclusion manifest;
- adversarial contract audit;
- draft P4-R6-G0 implementation contract;
- enhanced machine verifier/workflow.

## 4. Security disposition

~~~text
historical R6-stage permission keys: 41
candidate active R6 permission subset: 37
proposal permissions active in R6: 0
template.manage stage: R6+
default active stage during planning: R5
threat cases: 120
mapped threat cases: 120
A86-A95: DEFERRED TO R7, NOT WAIVED
BLOCKING/HIGH planning findings open: 0
production changes on planning branch: 0
~~~

## 5. Release ceiling

R6 deal progression is capped at:

`PROPOSAL_PREPARATION`

R6 may not manufacture or persist R7 Proposal/Product/Package/Contract/Invoice/Payment truth to move beyond that ceiling.

## 6. Qualification rule

A pre-final qualification checkpoint passed at:

- `730d2280fafe29c756ba7e0b09ff7e8e5c9496a6`
- R6 Contract Enhanced Qualification #35
- run `36310947241`
- job `108596615497`
- result SUCCESS

Because this candidate record is added after that checkpoint, the final owner-freeze candidate is **not** established by the prior run alone.

The exact branch head containing this record and the current verifier must itself pass R6 Contract Enhanced Qualification.

Only that exact green head may be presented to the owner for P4-R6-G0 freeze.

## 7. Owner control boundary

This record does not freeze G0.

Required next transition:

~~~text
exact-head enhanced qualification SUCCESS
        ↓
P4-R6-G0 READY FOR OWNER FREEZE
        ↓
explicit owner freeze/acceptance of exact SHA
        ↓
R6 implementation STILL LOCKED
        ↓
separate owner implementation authorization
        ↓
ONLY THEN production implementation
~~~

No owner freeze or implementation authorization may be inferred from CI.
