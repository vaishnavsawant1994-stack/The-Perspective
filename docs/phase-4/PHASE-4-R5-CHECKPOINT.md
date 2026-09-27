# Phase 4 — R5 Checkpoint

## Authorization / RBAC / Resource Policy

**Checkpoint:** P4-R5-C1  
**Date:** September 27, 2026  
**Status:** ACCEPTED — MERGED  
**Frozen substantive contract:** `2914e76b22468137630a4d444adb5431209fb5aa`  
**Accepted implementation SHA:** `8823c63c1a03281d91d5085bba07206186380f6c`  
**Historical pre-falsification checkpoint:** `ccfdf61897106661439f2bee4626f8d065e718f3`  
**Post-falsification production-code checkpoint:** `1d6ccc8c3ddb52c539c268e10527378ddb2529a3`  
**Independent external review:** NOT PERFORMED  
**Independent-review requirement:** OWNER-WAIVED under GOV-REVIEW-01  
**Replacement control:** ENHANCED QUALIFICATION  
**Owner acceptance:** EXPLICITLY GRANTED  
**Merge status:** COMPLETE  
**R6+:** NOT AUTHORIZED  
**Design 154:** NOT AUTHORIZED  
**V1.0 production certification:** NOT AUTHORIZED

## 1. Owner acceptance

The owner explicitly accepted this checkpoint with the following authorization:

> I accept P4-R5-C1 for exact implementation SHA 8823c63c1a03281d91d5085bba07206186380f6c. I authorize creation of the permanent R5 acceptance record and the controlled R5 merge. This acceptance applies only to R5 Authorization / RBAC / Resource Policy under frozen P4-R5-G0. It does not authorize R6+, Design 154, or V1.0 production certification.

This acceptance is bound to exact implementation SHA `8823c63c1a03281d91d5085bba07206186380f6c`.

It must not be interpreted as authorization for a later implementation SHA unless that SHA is separately qualified and explicitly accepted.

## 2. Accepted control chain

~~~text
2914e76b22468137630a4d444adb5431209fb5aa
  P4-R5-G0 frozen substantive contract
        ↓
ccfdf61897106661439f2bee4626f8d065e718f3
  historical qualified pre-falsification checkpoint
        ↓
adversarial falsification + controlled repairs
        ↓
1d6ccc8c3ddb52c539c268e10527378ddb2529a3
  qualified post-falsification production-code checkpoint
        ↓
Q01-Q07 proof completion — tests only
        ↓
8823c63c1a03281d91d5085bba07206186380f6c
  final proof-complete implementation candidate
  exact-head qualification complete
        ↓
OWNER ACCEPTANCE
        ↓
P4-R5-C1 ACCEPTED
        ↓
controlled merge authorized
~~~

The later Q01-Q07 proof-completion commits changed only:

- `src/modules/authorization/resolver.test.ts`;
- `src/modules/authorization/policy.test.ts`;
- `src/modules/authorization/r5-authorization-admin.database.test.ts`.

No production source, schema, migration, workflow, or runtime configuration changed between `1d6ccc8c…` and the accepted `8823c63c…`.

## 3. Closure findings

All seven final executable-proof blockers are closed:

| Finding | Threat | Closure |
|---|---|---|
| Q01 | A09 | Inactive role cannot supply authority. |
| Q02 | A17 | ASN denies an actor absent from trusted assignments. |
| Q03 | A18 | OWN denies an actor who is not the trusted owner. |
| Q04 | A20 | NONE cannot authorize a generic resource. |
| Q05 | A32 | Protected R01 self-revocation is denied and the live grant remains unchanged. |
| Q06 | A33 | Duplicate live MembershipRole assignment is rejected and exactly one live grant remains. |
| Q07 | A60 | Protected resource permission with missing ResourceContext fails closed. |

No Q01-Q07 attack succeeded against the existing production implementation.

Therefore:

~~~text
production authorization defect demonstrated by Q01-Q07: NO
production repair required for Q01-Q07: NO
qualification / executable-proof gap remaining: NO
BLOCKING/HIGH R5 closure finding remaining: NO
~~~

## 4. Exact-head qualification

All required qualification gates completed successfully on exact accepted SHA `8823c63c1a03281d91d5085bba07206186380f6c`.

| Gate | Workflow run | Job | Result |
|---|---:|---:|---|
| R5 Implementation Qualification #104 | 36306713541 | 108584694201 | SUCCESS |
| R5 Browser Qualification #33 | 36306713535 | 108584825643 | SUCCESS |
| R4 Browser Qualification #67 | 36306713578 | 108584697255 | SUCCESS |
| R3 Browser Qualification #69 | 36306713539 | 108584724092 | SUCCESS |

R5 Implementation Qualification passed migration deploy/status/verification/drift, unit tests, deterministic seed checks, live PostgreSQL database attacks, lint, strict TypeScript, production build, and production dependency audit.

## 5. Browser evidence

### R5

- artifact: `r5-browser-evidence`
- artifact ID: `10927886289`
- digest: `sha256:dc1eadb34b596373c2e431c675278313121e927ae5c889cefb09497cbc4b42b2`

### R4 regression

- artifact: `r4-browser-evidence`
- artifact ID: `10928150203`
- digest: `sha256:9767b563bb093b2211554386efdcb5ec47c3980e412e456fc5e43708667db3a4`

### R3 regression

- artifact: `r3-browser-evidence`
- artifact ID: `10927129268`
- digest: `sha256:cfca95af1a05c6c7b546faf867f0ea04b60862a4491e94b51786ce645ed498c1`

## 6. Accepted R5 boundary

P4-R5-C1 accepts the R5 authorization boundary only.

The accepted boundary includes:

- finite canonical permission vocabulary;
- R01–R17 launch-role governance;
- Team/Client/SELF authority separation;
- current-database authority resolution;
- complete same-grant authorization paths;
- explicit DENY precedence;
- scope/resource/action/constraint evaluation;
- trusted server ResourceContext;
- explicit field and Client-safe projection policy;
- authorization-admin delegation ceilings and no-self controls;
- optimistic concurrency and transactional authority revalidation;
- immutable/redacted authorization evidence;
- dormant future-stage vocabulary;
- current R5 browser/API/database attack coverage;
- inherited R3 authentication and R4 tenant-isolation regressions.

It does not accept or authorize unimplemented future domain workflows merely because their permission vocabulary exists in the registry.

## 7. Governance disposition

Canonical declaration:

~~~text
Independent external review: NOT PERFORMED
Independent-review requirement: OWNER-WAIVED under GOV-REVIEW-01
Replacement control: ENHANCED QUALIFICATION
~~~

This checkpoint does not claim that an independent review occurred.

R14/V1.0 production certification still requires genuine external independent review under GOV-REVIEW-01.

## 8. Merge control

The owner-authorized implementation merge has completed.

- Implementation PR: #6 — `feat(r5): accepted authorization RBAC and resource policy implementation`
- Accepted PR head: `8823c63c1a03281d91d5085bba07206186380f6c`
- Merge method: merge commit
- Main merge SHA: `748f6af4ce4c9868c2441125cd0480cf8abc34d4`
- Merge parents:
  - prior main: `1d4e387a9f9a6d43274bd0b05e175f49b8bf0718`
  - accepted implementation: `8823c63c1a03281d91d5085bba07206186380f6c`

The merge therefore preserves the exact accepted implementation SHA as a direct parent in repository history.

PR #6 prospective-merge qualification completed successfully for all applicable implementation/regression workflows:

- R5 Implementation Qualification #105 — SUCCESS;
- R5 Browser Qualification #34 — SUCCESS;
- R4 Tenancy Qualification #40 — SUCCESS;
- R4 Browser Qualification #68 — SUCCESS;
- R3 Review Qualification #69 — SUCCESS;
- R3 Browser Qualification #70 — SUCCESS.

`R5 Contract Enhanced Qualification #7` also triggered on PR #6 but is non-applicable to an implementation PR. Its log failed because the contract verifier intentionally rejects implementation files as out-of-scope for a contract-only branch. The frozen contract had already completed its own exact-head contract qualification before implementation authorization.

Closure/evidence documents were integrated as documentation-only changes by PR #7 at `6add999609736e788d9bdaf8ddc690445f6d36e7`. R6 remains locked and requires a separate owner authorization.

## 8A. Final merged-state verification

The R5 implementation and closure records are fully integrated.

### Implementation merge

- PR: #6
- accepted implementation parent: `8823c63c1a03281d91d5085bba07206186380f6c`
- merge SHA: `748f6af4ce4c9868c2441125cd0480cf8abc34d4`
- merge parents:
  - `1d4e387a9f9a6d43274bd0b05e175f49b8bf0718`
  - `8823c63c1a03281d91d5085bba07206186380f6c`

### Closure-documentation merge

- PR: #7
- closure head: `cb828b8bdbbc33611526b314693dbf9f0596bfe3`
- merge SHA: `6add999609736e788d9bdaf8ddc690445f6d36e7`
- prospective merge SHA tested by PR checks: `138aec9ee3237359fd4b1c9cfa011e0a51f357b9`
- prospective and actual merge tree: `26654067bbdd0c38747b0836215dfcfb16c14ffc`
- tree comparison: EXACT MATCH

Applicable PR #7 prospective-merge checks all succeeded:

- R5 Implementation Qualification #106 — SUCCESS;
- R5 Browser Qualification #35 — SUCCESS;
- R4 Tenancy Qualification #41 — SUCCESS;
- R4 Browser Qualification #69 — SUCCESS;
- R3 Review Qualification #70 — SUCCESS;
- R3 Browser Qualification #71 — SUCCESS.

`R5 Contract Enhanced Qualification #8` was non-applicable to this closure/status PR and failed only because `docs/phase-4/README.md` is outside the contract-only branch allowlist.

The actual closure merge has the same Git tree and same parents as the prospective merge tested by those applicable checks.

## 9. Current disposition

Final authoritative R5 disposition:

~~~text
P4-R5-G0: FROZEN
P4-R5-C1: ACCEPTED + MERGED
accepted implementation: 8823c63c1a03281d91d5085bba07206186380f6c
Q01-Q07: CLOSED
exact-head qualification: 4/4 SUCCESS
applicable prospective-merge qualification: 6/6 SUCCESS
blocking/high R5 findings: NONE OPEN
implementation merge: COMPLETE at 748f6af4ce4c9868c2441125cd0480cf8abc34d4
closure/evidence documentation merge: COMPLETE at 6add999609736e788d9bdaf8ddc690445f6d36e7
merged-result tree verification: EXACT MATCH
R6+: LOCKED
Design 154: LOCKED
V1.0 production certification: NOT AUTHORIZED
~~~
