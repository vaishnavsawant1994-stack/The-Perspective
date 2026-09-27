# Phase 4 — R5 Closure Package Candidate

## Authorization / RBAC / Resource Policy

**Closure record:** P4-R5-CLOSURE-01  
**Date:** September 27, 2026  
**Frozen substantive contract:** 2914e76b22468137630a4d444adb5431209fb5aa  
**Historical pre-falsification qualified checkpoint:** ccfdf61897106661439f2bee4626f8d065e718f3  
**Qualified post-falsification implementation candidate:** 1d6ccc8c3ddb52c539c268e10527378ddb2529a3  
**Implementation branch:** phase4/r5-authorization-implementation-20260927  
**Closure-evidence branch:** phase4/r5-closure-evidence-20260927  
**P4-R5-C1:** CANDIDATE — NOT ACCEPTED  
**Merge authorization:** NOT AUTHORIZED  
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
demonstrated findings + narrow repair/test commits
        ↓
1d6ccc8c3ddb52c539c268e10527378ddb2529a3
  exact post-falsification implementation candidate
  all four exact-head qualification workflows green
        ↓
closure evidence review
        ↓
Q01-Q07 qualification-evidence gaps remain open
        ↓
P4-R5-C1 CANDIDATE — NOT ACCEPTED
~~~

ccfdf61897106661439f2bee4626f8d065e718f3 remains permanently recorded as the historical pre-falsification qualified checkpoint. Later findings do not rewrite the fact that it passed the qualification gates that existed at that time.

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

No production commit has been added after 1d6ccc8c3ddb52c539c268e10527378ddb2529a3.

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

All four workflows executed against exact implementation SHA 1d6ccc8c3ddb52c539c268e10527378ddb2529a3 and completed successfully.

| Gate | Run | Job | Result |
|---|---:|---:|---|
| R5 Implementation Qualification | 36305317140 / #101 | 108580712959 | SUCCESS |
| R5 Browser Qualification | 36305317106 / #30 | 108580721433 | SUCCESS |
| R4 Browser Qualification | 36305317107 / #64 | 108580720247 | SUCCESS |
| R3 Browser Qualification | 36305317109 / #66 | 108580721623 | SUCCESS |

The R5 implementation gate passed:

- npm ci;
- Prisma validation and generation;
- isolated PostgreSQL 16 shadow database creation;
- migration deployment;
- migration status;
- database verification;
- drift detection;
- unit tests;
- deterministic fixture seed + seed assertion;
- live database tests;
- lint;
- strict TypeScript;
- production Next.js build;
- production dependency audit at high severity.

## 7. Browser/regression evidence

### R5

Artifact:

- name: r5-browser-evidence
- artifact ID: 10926962822
- digest: sha256:b4602aa3b0a0f4c1bcd2be56152d5f983cc2bf77e7fe0315b97416cf01dcf405

The production Chromium harness verifies, through direct API/browser execution:

- anonymous role-admin denial;
- MFA-backed R01 authentication;
- forged organization field rejection;
- legitimate audited custom-role creation;
- foreign-role ID concealment;
- self-assignment denial;
- custom-role access-admin escalation denial with unchanged permission hash;
- stale write denial with unchanged role;
- R02→R01 assignment denial.

### R4 regression

Artifact:

- name: r4-browser-evidence
- artifact ID: 10927515523
- digest: sha256:4d1b7317148f31280f5f67f85bae2f6a57873ccd356373ca091ae75580e44535

R4 tenancy browser qualification is green at the R5 candidate, preserving selected-organization context and tenant isolation behavior.

### R3 regression

Artifact:

- name: r3-browser-evidence
- artifact ID: 10926768533
- digest: sha256:169a8c35d8a480cf47f3f2537cba48deed07dad0c74e937c5117ff654b69804c

R3 authentication browser qualification is green at the R5 candidate, preserving password/session/MFA and protected-route behavior.

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

PHASE-4-R5-IMPLEMENTATION-THREAT-COVERAGE.md

The closure review found no newly demonstrated production authorization bypass after the existing repair sequence.

However, seven applicable R5 attack cases do not yet have sufficiently exact executable negative coverage:

| Finding | Threat case | Current control | Missing proof |
|---|---|---|---|
| Q01 | A09 inactive role | Resolver requires ACTIVE role | Negative test with inactive role and otherwise-valid grant. |
| Q02 | A17 ASN forged assignment | Policy uses trusted assignedMembershipIds | Negative policy attack where actor is not in trusted assignment set. |
| Q03 | A18 OWN forged owner | Policy uses trusted owner membership/user | Negative policy attack where trusted owner differs from actor. |
| Q04 | A20 NONE generic resource | NONE only matches absence of resource | Explicit NONE + generic resource DENY test. |
| Q05 | A32 protected last admin | Revoke uses fresh no-self + delegation ceiling | Direct protected-admin self/last-revocation attack test with zero residue. |
| Q06 | A33 duplicate MembershipRole | App duplicate check + partial unique DB index | Executable duplicate-live-grant attack test. |
| Q07 | A60 missing resource context | Resource scopes fail without resource | Explicit protected permission + undefined ResourceContext DENY test. |

Classification of Q01–Q07:

~~~text
production authorization defect demonstrated: NO
qualification / executable-proof gap demonstrated: YES
P4-R5-C1 acceptance blocker: YES
~~~

These gaps were discovered during closure falsification, not during feature development.

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

The correct next control sequence is:

~~~text
1d6ccc8c... qualified implementation candidate
       ↓
close Q01-Q07 with narrowly scoped executable negative proofs
       ↓
if any proof exposes a production defect:
    minimal production repair + regression
else:
    test/evidence-only repair
       ↓
full exact-head requalification
    R5 Implementation
    R5 Browser
    R4 Browser
    R3 Browser
       ↓
reattack affected boundaries
       ↓
update this closure package with new exact head and run/artifact IDs
       ↓
owner acceptance decision
       ↓
P4-R5-C1 ACCEPTED
       ↓
controlled merge
       ↓
R6 separately authorized
~~~

No R6 work is authorized by this record.

## 12. Proposed P4-R5-C1 acceptance record

The following text is deliberately **not yet active**. It is the proposed checkpoint language after Q01–Q07 are closed and the resulting exact head is fully green.

### Proposed checkpoint metadata

**Checkpoint:** P4-R5-C1  
**Stage:** R5 Authorization / RBAC / Resource Policy  
**Status:** PROPOSED — BLOCKED PENDING Q01–Q07  
**Frozen contract:** 2914e76b22468137630a4d444adb5431209fb5aa  
**Accepted implementation SHA:** PENDING  
**Independent external review:** NOT PERFORMED  
**Independent-review requirement:** OWNER-WAIVED under GOV-REVIEW-01  
**Replacement control:** ENHANCED QUALIFICATION  
**Owner acceptance:** PENDING  
**Merge:** NOT AUTHORIZED  
**R6:** LOCKED

### Proposed acceptance statement after blockers close

> P4-R5-C1 is accepted only for the exact implementation SHA recorded in this checkpoint. The accepted implementation conforms to frozen P4-R5-G0, preserves R3 authentication and R4 tenant isolation, resolves authority from current server-side database state, evaluates complete same-grant authorization paths, enforces explicit DENY, scope/resource/field/action/obligation policy, prevents access-administration self-escalation, records required immutable evidence, and keeps future-stage permission vocabulary dormant until separately activated by its owning accepted stage. Independent external review was not performed for R5; the requirement was owner-waived under GOV-REVIEW-01 and replaced by enhanced adversarial, database, browser and exact-head qualification. This acceptance does not authorize R6+, Design 154, or final production certification.

This statement must not be changed to ACCEPTED until:

1. Q01–Q07 are closed;
2. all affected negative tests pass;
3. all four exact-head workflow gates are green on the resulting implementation SHA;
4. the affected repaired surfaces are reattacked;
5. the owner explicitly accepts P4-R5-C1.

## 13. Current disposition

As of this closure package:

~~~text
P4-R5-G0: FROZEN
ccfdf618...: HISTORICAL QUALIFIED PRE-FALSIFICATION CHECKPOINT
1d6ccc8c...: QUALIFIED POST-FALSIFICATION IMPLEMENTATION CANDIDATE
P4-R5-C1: CANDIDATE — NOT ACCEPTED
Q01-Q07: OPEN QUALIFICATION-EVIDENCE BLOCKERS
MERGE: NOT AUTHORIZED
R6+: LOCKED
~~~
