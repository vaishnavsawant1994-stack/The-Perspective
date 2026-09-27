# Phase 4 — R5 Closure Package Candidate

## Authorization / RBAC / Resource Policy

**Closure record:** P4-R5-CLOSURE-01  
**Date:** September 27, 2026  
**Frozen substantive contract:** 2914e76b22468137630a4d444adb5431209fb5aa  
**Historical pre-falsification qualified checkpoint:** ccfdf61897106661439f2bee4626f8d065e718f3  
**Qualified post-falsification implementation candidate:** 8823c63c1a03281d91d5085bba07206186380f6c  
**Implementation branch:** phase4/r5-authorization-implementation-20260927  
**Closure-evidence branch:** phase4/r5-closure-evidence-20260927  
**P4-R5-C1:** OWNER-ACCEPTED — IMPLEMENTATION MERGED  
**Implementation merge:** COMPLETE — `748f6af4ce4c9868c2441125cd0480cf8abc34d4`  
**R6+:** LOCKED  
**Design 154:** NOT AUTHORIZED

## 1. Control-state summary

The authoritative transition is:

~~~text
2914e76b22468137630a4d444adb5431209fb5aa
  P4-R5-G0 frozen substantive contract
        ↓
ccfdf61897106661439f2bee4626f8d065e718f3
  historical qualified pre-falsification implementation checkpoint
        ↓
adversarial falsification
        ↓
demonstrated findings + controlled repairs
        ↓
1d6ccc8c3ddb52c539c268e10527378ddb2529a3
  qualified post-falsification production-code candidate
        ↓
closure falsification found Q01-Q07 executable-proof gaps
        ↓
test-only proof completion
  f78b667d...  Q01
  cfdbe350...  Q02/Q03/Q04/Q07
  8823c63c...  Q05/Q06
        ↓
8823c63c1a03281d91d5085bba07206186380f6c
  exact implementation head
  production delta from 1d6ccc8c...: NONE
  test-only delta: 3 files / 239 added lines
  Q01-Q07: CLOSED
  all four exact-head qualification workflows: SUCCESS
        ↓
P4-R5-C1 OWNER-ACCEPTED
  implementation merged at 748f6af4ce4c9868c2441125cd0480cf8abc34d4
  closure docs integration pending
  R6 LOCKED
~~~

`ccfdf61897106661439f2bee4626f8d065e718f3` remains permanently recorded as the historical pre-falsification qualified checkpoint. `1d6ccc8c3ddb52c539c268e10527378ddb2529a3` remains the qualified post-falsification production-code candidate before proof-only closure tests. The current exact implementation candidate `8823c63c1a03281d91d5085bba07206186380f6c` adds executable evidence only.

## 2. Frozen-contract traceability

R5 implementation authority is bounded by:

- P4-R5-G0 substantive contract at 2914e76b22468137630a4d444adb5431209fb5aa;
- PHASE-4-R5-AUTHORIZATION-THREAT-MODEL.md with A01–A60;
- owner-approved permission metadata and 170-key registry;
- owner-approved R01–R17 launch-role and delegation matrix;
- Gate-A owner governance decisions;
- Gate-B enhanced-qualification waiver;
- separate P4-R5-IMPLEMENTATION-AUTH-01 authorization record.

The implementation authorization explicitly permits R5 authorization/RBAC/resource-policy work only and does not authorize R6+, Design 154, or uncontrolled scope expansion.

## 3. Governance review state

Canonical review declaration:

~~~text
Independent external review: NOT PERFORMED
Independent-review requirement: OWNER-WAIVED under GOV-REVIEW-01
Replacement control: ENHANCED QUALIFICATION
~~~

This is not a claim that an independent review occurred.

GOV-REVIEW-01 preserves the following requirements despite the waiver:

- adversarial/falsification review;
- negative security tests;
- exact-head automated qualification;
- browser qualification where relevant;
- database/migration/tenant checks;
- documented findings closure;
- separate owner acceptance.

R14/V1.0 still requires genuine external independent review; the R1–R13 waiver cannot be reused to bypass R14 certification.

## 4. Falsification and repair chain

The post-ccfdf618… repair sequence contains 17 commits and is intentionally narrow.

| Commit | Purpose / finding |
|---|---|
| dd442fbbe8febe4e09c0308e8c1eda725e903551 | Regression: reject undeclared role aggregate projection. |
| abadf00ec7ba50b597a944fa26f5a086f3ee6a67 | Repair: keep role list inside declared field policy by removing undeclared aggregate output. |
| a3761bd3e4e7351098823f100f1570596a9e33c1 | Regression: generic READ authority must not authorize export. |
| 517b46bfbaa366e1039279004f94a1176542385d | Repair: export requires separate explicit authority; R5 generic export fails closed. |
| c1174e3a95d935a523175928ddcc0e0d8afcf967 | Regression: unenforced field-group constraints must fail closed. |
| ee19f751afb58219ef87809bac4d7fcdd1653ca2 | Interim repair: reject field-group constraints while trusted mapping was absent. |
| 2e482632a56224170d3fdc01f0294f2ab2f73195 | Regression: pin role-permission read projection. |
| 00773b068cedf663fb693c8c06d552ef58135322 | Repair: declare role-permission read projection. |
| a85be25d2601f1cbd87e38dbd26990c308794eb7 | Repair: authorize the complete explicit permission projection. |
| f674c1b8e9d1030885a46fb5714538a57c5669f9 | Regression: prevent permission/action laundering. |
| 6b839c0b43d05a16adf4896925838b22009ac163 | Repair: bind active R5 permission keys to allowed action families. |
| ee0ab6a089cbba639128d01da48a6fa89dbec24d | Regression: required field policy may not be omitted. |
| 46d76d05255c268609599df9131be574480418a8 | Repair: fail closed when required field policy is absent. |
| 635977515fd9862aa09fdc2f0af18e4650badcd3 | Test correction: provide explicit projection policies. |
| f02eef56e88e97b86eb42e264f914c85d1c691cd | DB-proof correction: keep database tests projection-explicit. |
| 70e94d0f32668d8ae9a16e10cfb42dd44b3f609b | Final field-group repair: enforce frozen allowed/denied groups through trusted server field-group maps and fail closed on unknown mapping. |
| 1d6ccc8c3ddb52c539c268e10527378ddb2529a3 | Repair + regression: default active stage set becomes R5 only; R5+ vocabulary such as workspace.search remains dormant unless explicitly server-activated. |
| f78b667d5f17c953bf75787e47e614966c973ff4 | Test-only proof: inactive role cannot supply otherwise-valid authority. |
| cfdbe3501fdf1b3bba1446ef334897a1dbe40cfd | Test-only proofs: ASN non-assignment, OWN non-ownership, NONE generic resource, and missing ResourceContext all fail closed. |
| 8823c63c1a03281d91d5085bba07206186380f6c | Test-only live PostgreSQL proofs: protected R01 self-revocation denied with grant preserved; duplicate live MembershipRole returns conflict with one live grant remaining. |

No production source, schema, migration, workflow, or runtime configuration changed after 1d6ccc8c3ddb52c539c268e10527378ddb2529a3. The three later commits are executable tests only.

## 5. Stage-activation falsification result

The post-repair production call graph was re-reviewed.

Current default:

~~~text
DEFAULT_ACTIVE_STAGES = {"R5"}
~~~

Authorization evaluates the permission definition's activationStage before reading grant paths, constraints, scope or action-policy evidence.

Current production callers in HTTP and authorization-admin paths do not pass activeStages overrides. Therefore:

- persisted custom-role grants do not activate future-stage authority;
- malformed constraints cannot activate a future permission;
- an alternative action string cannot activate a future permission;
- admin role/permission mutation does not by itself activate a future stage;
- a forged resource context cannot activate a future stage;
- coarse permission summaries are not consumed as the authorization decision.

Registered vocabulary is therefore distinct from active authority.

## 6. Exact-head qualification evidence

All four workflows executed against exact implementation SHA `8823c63c1a03281d91d5085bba07206186380f6c` and completed successfully.

| Gate | Run | Job | Result |
|---|---:|---:|---|
| R5 Implementation Qualification | 36306713541 / #104 | 108584694201 | SUCCESS |
| R5 Browser Qualification | 36306713535 / #33 | 108584825643 | SUCCESS |
| R4 Browser Qualification | 36306713578 / #67 | 108584697255 | SUCCESS |
| R3 Browser Qualification | 36306713539 / #69 | 108584724092 | SUCCESS |

The R5 implementation gate passed:

- npm ci;
- Prisma validation and generation;
- isolated PostgreSQL 16 shadow database creation;
- migration deployment;
- migration status;
- database verification;
- drift detection;
- unit tests, including Q01/Q02/Q03/Q04/Q07 executable attacks;
- deterministic fixture seed + seed assertion;
- live database tests, including Q05/Q06 executable attacks;
- lint;
- strict TypeScript;
- production Next.js build;
- production dependency audit at high severity.

No Q01–Q07 attack succeeded. No production-code repair was required.

## 7. Browser/regression evidence

### R5

Artifact:

- name: r5-browser-evidence
- artifact ID: 10927886289
- digest: sha256:dc1eadb34b596373c2e431c675278313121e927ae5c889cefb09497cbc4b42b2

The production Chromium harness remains green after proof completion and verifies direct authorization-admin attacks including anonymous denial, MFA-backed R01 authentication, forged organization rejection, legitimate audited role creation, foreign-role concealment, self-assignment denial, custom-role access-admin escalation denial, stale-write denial, and R02→R01 denial.

### R4 regression

Artifact:

- name: r4-browser-evidence
- artifact ID: 10928150203
- digest: sha256:9767b563bb093b2211554386efdcb5ec47c3980e412e456fc5e43708667db3a4

R4 tenancy browser qualification is green at the final R5 candidate.

### R3 regression

Artifact:

- name: r3-browser-evidence
- artifact ID: 10927129268
- digest: sha256:cfca95af1a05c6c7b546faf867f0ea04b60862a4491e94b51786ce645ed498c1

R3 authentication browser qualification is green at the final R5 candidate.

## 8. Database/security evidence

The exact-head R5 implementation workflow executes the full repository unit and database suites in disposable PostgreSQL 16.

Current R5 database attacks include:

- foreign role concealment and zero foreign mutation;
- self-assignment denial with no MembershipRole residue;
- R02→R01 denial with no elevated grant residue;
- protected access-admin permission denial on custom roles with unchanged edges;
- stale optimistic-concurrency denial with no mutation;
- stale preflight authority denial after revocation;
- foreign membership/role combination denial with zero residue;
- successful legitimate admin mutation with durable mutation and authorization evidence;
- explicit DENY beating ALLOW in persisted authority;
- next-resolution revocation behavior;
- Client organization-local authority;
- Client resource prefiltering.

Audit integrity inherits the R2 database trigger:

- audit.audit_events has an immutable BEFORE UPDATE OR DELETE trigger;
- migration verification checks the immutable-evidence trigger set;
- R5 audit tests verify high-risk denial evidence avoids protected payloads and completed sensitive-action evidence is persisted only after ALLOW.

R4 restricted runtime-role/RLS database tests remain part of the repository qualification and its browser regression is separately green.

## 9. Threat-matrix evidence

The full A01–A60 disposition is recorded in:

`PHASE-4-R5-IMPLEMENTATION-THREAT-COVERAGE.md`

The seven closure gaps discovered during final falsification are now closed:

| Finding | Threat | Exact executable proof | Status |
|---|---|---|---|
| Q01 | A09 | `resolver.test.ts` inactive-role attack | CLOSED |
| Q02 | A17 | `policy.test.ts` ASN non-assignment attack | CLOSED |
| Q03 | A18 | `policy.test.ts` OWN non-owner attack | CLOSED |
| Q04 | A20 | `policy.test.ts` NONE + generic-resource attack | CLOSED |
| Q05 | A32 | live DB protected administrator self-revocation attack | CLOSED |
| Q06 | A33 | live DB duplicate MembershipRole attack | CLOSED |
| Q07 | A60 | `policy.test.ts` missing-ResourceContext attack | CLOSED |

Final classification:

~~~text
production authorization defect demonstrated by Q01-Q07: NO
production code modified for Q01-Q07: NO
qualification / executable-proof gap remaining: NO
blocking/high R5 finding remaining from closure review: NO
final focused falsification: PASS
~~~

The proof-completion delta from `1d6ccc8c…` to `8823c63c…` modifies only:

- `src/modules/authorization/resolver.test.ts`;
- `src/modules/authorization/policy.test.ts`;
- `src/modules/authorization/r5-authorization-admin.database.test.ts`.

## 10. Remaining risks and deliberate deferrals

The following future-stage cases remain frozen but are not current R5 production surfaces:

- bulk domain updates / mixed authorization results;
- production domain pagination, count and aggregate behavior beyond current R5 admin listing;
- R11 search/index ranking/count/facet behavior;
- domain lifecycle semantics;
- concrete approval/version and separation-of-duty workflows;
- R13 signed file/media URLs and revocation TTL;
- background worker/domain side effects;
- webhook/provider identity handling;
- production Client/member domain workflows.

They are not waived. They must be attacked again when their owning production stage is implemented.

## 11. Required closure sequence

Technical closure prerequisites are now satisfied for the current candidate.

The next valid transition is:

~~~text
8823c63c... fully exact-head qualified
       ↓
Q01-Q07 CLOSED
       ↓
focused reattack PASS
       ↓
P4-R5-C1 READY FOR OWNER ACCEPTANCE
       ↓
explicit owner acceptance
       ↓
permanent P4-R5-C1 ACCEPTED control record
       ↓
controlled merge
       ↓
verify merged result / required regressions
       ↓
R6 separately authorized
~~~

No merge or R6 work is authorized by this record.

## 12. Proposed P4-R5-C1 acceptance record

The following text is still **proposed**, not active. The technical blockers are closed, but owner acceptance remains mandatory.

### Proposed checkpoint metadata

**Checkpoint:** P4-R5-C1  
**Stage:** R5 Authorization / RBAC / Resource Policy  
**Status:** READY FOR OWNER ACCEPTANCE — NOT ACCEPTED  
**Frozen contract:** 2914e76b22468137630a4d444adb5431209fb5aa  
**Accepted implementation SHA:** 8823c63c1a03281d91d5085bba07206186380f6c  
**Independent external review:** NOT PERFORMED  
**Independent-review requirement:** OWNER-WAIVED under GOV-REVIEW-01  
**Replacement control:** ENHANCED QUALIFICATION  
**Owner acceptance:** PENDING  
**Merge:** NOT AUTHORIZED  
**R6:** LOCKED

### Proposed acceptance statement

> P4-R5-C1 is accepted only for exact implementation SHA `8823c63c1a03281d91d5085bba07206186380f6c`. The accepted implementation conforms to frozen P4-R5-G0, preserves R3 authentication and R4 tenant isolation, resolves authority from current server-side database state, evaluates complete same-grant authorization paths, enforces explicit DENY, scope/resource/field/action/obligation policy, prevents access-administration self-escalation, records required immutable evidence, and keeps future-stage permission vocabulary dormant until separately activated by its owning accepted stage. Q01–Q07 are closed by executable negative proofs, and no production authorization repair was required during proof completion. Independent external review was not performed for R5; the requirement was owner-waived under GOV-REVIEW-01 and replaced by enhanced adversarial, database, browser and exact-head qualification. This acceptance does not authorize R6+, Design 154, or final production certification.

This statement becomes active only after explicit owner acceptance.

## 13. Current disposition

As of this closure package:

~~~text
P4-R5-G0: FROZEN
ccfdf618...: HISTORICAL QUALIFIED PRE-FALSIFICATION CHECKPOINT
1d6ccc8c...: QUALIFIED POST-FALSIFICATION PRODUCTION-CODE CANDIDATE
8823c63c...: FINAL TEST-EVIDENCED IMPLEMENTATION CANDIDATE
Q01-Q07: CLOSED
R5 IMPLEMENTATION #104: SUCCESS
R5 BROWSER #33: SUCCESS
R4 BROWSER #67: SUCCESS
R3 BROWSER #69: SUCCESS
FINAL FALSIFICATION: PASS
BLOCKING/HIGH R5 FINDINGS: NONE OPEN
P4-R5-C1: OWNER-ACCEPTED — IMPLEMENTATION MERGED
IMPLEMENTATION MERGE: COMPLETE — 748f6af4ce4c9868c2441125cd0480cf8abc34d4
R6+: LOCKED
~~~
