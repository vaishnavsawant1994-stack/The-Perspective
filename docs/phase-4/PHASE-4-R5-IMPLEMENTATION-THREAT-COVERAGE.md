# Phase 4 — R5 Implementation Threat Coverage

**Record:** P4-R5-THREAT-COVERAGE-01  
**Date:** September 27, 2026  
**Frozen substantive contract:** 2914e76b22468137630a4d444adb5431209fb5aa  
**Qualified implementation candidate:** 8823c63c1a03281d91d5085bba07206186380f6c  
**Historical pre-falsification qualified checkpoint:** ccfdf61897106661439f2bee4626f8d065e718f3  
**Review type:** enhanced authoring-agent falsification / closure evidence review — not independent  
**Independent external review:** NOT PERFORMED  
**Independent-review requirement:** OWNER-WAIVED under GOV-REVIEW-01  
**Replacement control:** ENHANCED QUALIFICATION  
**P4-R5-C1:** ACCEPTED — MERGED  
**R6+:** LOCKED

## 1. Classification rule

This record distinguishes four states:

- **PASS — R5:** executable proof exists on the current R5 implementation or on an inherited R3/R4 control that is still executed by the R5 qualification.
- **PASS — compositional:** the attack is prevented by a tested shared primitive plus the exact current call path; no contradictory path was found.
- **DEFERRED — future surface:** R5 freezes the control, but the production route/provider/workflow does not exist until the named later stage. Dormant-stage enforcement prevents that vocabulary from becoming current authority.
- **OPEN — evidence gap:** production review found no demonstrated bypass, but the frozen R5 threat contract calls for executable negative proof and the exact proof is missing. These items block P4-R5-C1 acceptance until closed and requalified.

An OPEN item in this document is not a claim that the current implementation is exploitable. It is a qualification-contract finding.

## 2. A01–A60 implementation disposition

| ID | Disposition | R5 evidence / ownership |
|---|---|---|
| A01 | PASS — R5 | Foreign role/resource IDs are tenant-filtered and concealed; database tests verify foreign rows remain untouched; R4 forced-RLS regression remains green. |
| A02 | PASS — R5 | Chromium attack submits forged organizationId to role creation; strict request schema rejects it and no role is created. |
| A03 | PASS — compositional | HTTP/admin schemas do not accept browser role/admin/permission authority claims; resolver rebuilds authority from current DB state. |
| A04 | PASS — R5 | R5 browser qualification drives the authorization-admin APIs directly, including denied escalation attempts. |
| A05 | PASS — R5 | HTTP surface mismatch denies before promotion; resolver test blocks Team permissions on a CLIENT membership surface. |
| A06 | PASS — compositional | Team/Client authority classes are separated by registry, resolver and trusted resource context; later Client business routes remain future-stage. |
| A07 | PASS — R5 | Client authority is organization-local; Client resource loader prefilters own client organization plus CLIENT_SHARED before exposure. |
| A08 | PASS — inherited + R5 | R3 database tests deny suspended/ended membership contexts; R5 re-reads current membership and HTTP fails closed when membership authority no longer resolves. |
| A09 | PASS — R5 | `resolver.test.ts` now executes an otherwise-valid grant with a SUSPENDED role and proves zero permission/grant paths plus `ROLE_NOT_ACTIVE`. |
| A10 | PASS — R5 | Resolver/unit and live database evidence reject expired MembershipRole grants. |
| A11 | PASS — R5 | Resolver rejects cross-tenant roles; live DB/admin tests also preserve foreign rows/grants. |
| A12 | PASS — R5 | Complete same-grant path is preserved; Role.defaultScope cannot be borrowed to widen another permission. |
| A13 | PASS — R5 | Explicit applicable DENY is retained and wins over an applicable ALLOW. |
| A14 | PASS — R5 | Registry recognizes exact keys only; live DB test fails closed on inherited unknown permission keys. |
| A15 | PASS — R5 | Unknown/malformed constraint payloads fail closed; blocked-only permissions have no usable grant path. |
| A16 | PASS — R5 | DEPT policy requires trusted actor department and trusted resource department equality. |
| A17 | PASS — R5 | `policy.test.ts` proves ASN ALLOW only when trusted `assignedMembershipIds` contains the actor and `SCOPE_DENIED` when it does not. |
| A18 | PASS — R5 | `policy.test.ts` proves OWN ALLOW for trusted actor ownership and `SCOPE_DENIED` when trusted owner membership/user belongs to another actor. |
| A19 | PASS — R5 | Active R5 permission keys are bound to explicit action families; view permission cannot authorize delete/mutation. |
| A20 | PASS — R5 | `policy.test.ts` explicitly supplies a generic resource to a `NONE`-scoped grant and proves `SCOPE_DENIED`. |
| A21 | PASS — R5 | Mutation schemas are explicit/strict; forbidden/undeclared fields are rejected; field-policy checks are mandatory where metadata requires them. |
| A22 | PASS — R5 | Requested fields outside the server readable policy deny; role-permission projection is explicitly declared. |
| A23 | PASS — R5 | Client-safe projection is mandatory; Client IAM fields are unavailable and non-client-shared resources are refused. |
| A24 | DEFERRED — future surface | R5 exposes no production bulk domain-update API. Atomic authorization requirement remains frozen for the owning later domain stage. |
| A25 | PASS — current R5 / future carry | R5 role listing is tenant-bound and the discovered undeclared aggregate projection was removed; future paginated domain lists must preserve pre-count filtering. |
| A26 | PASS — R5 | Generic READ authority is explicitly denied for export; no R5 export permission exists. |
| A27 | DEFERRED — R11 | Production search/count/facet surface is R11; workspace.search and other future-stage vocabulary remain dormant by default. |
| A28 | PASS — R5 | Membership-role revocation removes authority on the next resolution; live DB tests prove stale preflight authority fails. |
| A29 | PASS — R5 | No cross-request authorization cache is used; revocation tests demonstrate current-DB authority resolution. |
| A30 | PASS — R5 | Sensitive admin mutations re-resolve authority inside a Serializable transaction; stale/revoked authority is denied before mutation. |
| A31 | PASS — R5 | Self-assignment is denied with zero residue; R02→R01 escalation is denied; custom roles cannot receive protected access-admin permissions. |
| A32 | PASS — R5 | Live PostgreSQL attack calls protected R01 self-revocation through the real revoke service and proves DENY, unchanged `validUntil`, and durable denial evidence. Because protected administration requires R01/R02 and self-revocation is denied, the final administering actor cannot remove its own protected authority through this path. |
| A33 | PASS — R5 | Live PostgreSQL attack creates one legitimate grant, retries the same live assignment, receives `CONFLICT`, and proves exactly one live MembershipRole remains. |
| A34 | PASS — R5 | Unknown scopeOverride constraint fails closed and is exercised in unit/live DB authority tests. |
| A35 | PASS — inherited + R5 | R4 browser regression proves current selected context switching; R5 reloads trusted resource/tenant context rather than reusing URL authority. |
| A36 | DEFERRED — domain binding | Generic lifecycle constraint support is present; production archived/inactive domain semantics belong to the owning R6+ resource stage. |
| A37 | DEFERRED — future workflow | Exact-version obligation primitive exists; concrete approval/version workflow is future-stage. |
| A38 | DEFERRED — future workflow | SoD obligation primitive exists; writer/designer approval workflow is future-stage. |
| A39 | PASS — R5 | Admin policy requires structured reason, recent authentication and MFA for protected administration; negative obligation tests are present. |
| A40 | PASS — R5 | R5 action-family binding prevents ordinary view/edit authority from authorizing unrelated command actions; future command permissions are dormant. |
| A41 | PASS — R5 | Resource-level denials can collapse to generic 404; foreign role browser attack is concealed as not-found. |
| A42 | PASS — current R5 / future carry | Current admin/client projections explicitly enumerate returned relation fields; nested future domain relations inherit the same projection rule. |
| A43 | PASS — R5 | Falsification found an undeclared role-list _count projection; regression dd442fbb… and repair abadf00e… remove it and keep listing inside declared field policy. |
| A44 | DEFERRED — R13 | Provider-backed signed asset URLs are not implemented in R5; authorization-before-signing is frozen for R13. |
| A45 | DEFERRED — R13 | Signed-URL TTL/revocation behavior belongs to provider-backed storage implementation. |
| A46 | DEFERRED — future workers | R5 defines server authority boundaries; production background-job domain execution is later-stage. |
| A47 | DEFERRED — future workers | Canonical tenant/resource reload before consequential worker side effects is carried to the owning worker/domain stage. |
| A48 | DEFERRED — future integrations | Webhook/provider payload authority is not a current R5 production surface. |
| A49 | PASS — inherited R4 | R4 restricted runtime role/forced RLS derives tenant state from verified server context, not request body; R4 DB/browser regressions are green. |
| A50 | PASS — inherited/current boundary | R4 tests prove restricted runtime role is non-login/non-bypass with bounded privileges; R5 admin access remains explicitly tenant-filtered and separately authorized. |
| A51 | PASS — inherited DB integrity | audit.audit_events has an immutable UPDATE/DELETE trigger and migration verification checks the immutable evidence trigger set. |
| A52 | PASS — R5 | Denial telemetry uses structured codes and audit tests verify high-risk denial evidence omits protected payloads. |
| A53 | PASS — R5 | Browser and live DB tests reject stale optimistic-concurrency writes with no mutation. |
| A54 | PASS — R5 | Authorization is recomputed in-transaction; test proves a preflight R01 context cannot mutate after the actor grant is revoked. |
| A55 | PASS — R5 | Requested forbidden fields deny and Client projection excludes internal authority/sensitivity fields. |
| A56 | PASS — current boundary / future carry | Client projection is a separate explicit policy surface rather than a Team serializer with hidden fields. |
| A57 | PASS — R5 | Custom Team roles reject protected role.manage/permission.manage and Client/SELF permissions; existing edges remain unchanged on denial. |
| A58 | PASS — R5 | R01 remains organization-bound; foreign role/resource operations are concealed/denied and R4 tenant isolation remains enforced. |
| A59 | PASS — R5 absence boundary | R5 defines no support/impersonation bypass for R01; no current production path grants such authority. |
| A60 | PASS — R5 | `policy.test.ts` evaluates a protected `team.view` permission with no ResourceContext and proves fail-closed `SCOPE_DENIED`. |

## 3. Closed closure findings

Q01–Q07 were closed by test-only proof commits on the R5 implementation line. No production authorization repair was required.

| Finding | Threat ID | Exact executable proof | Status |
|---|---|---|---|
| Q01 | A09 | `resolver.test.ts` — "rejects an inactive role even when its grant would otherwise be valid" | CLOSED |
| Q02 | A17 | `policy.test.ts` — "denies ASN authority when the actor is absent from trusted assignments" | CLOSED |
| Q03 | A18 | `policy.test.ts` — "denies OWN authority when trusted ownership belongs to another actor" | CLOSED |
| Q04 | A20 | `policy.test.ts` — "does not let NONE scope authorize a generic resource" | CLOSED |
| Q05 | A32 | `r5-authorization-admin.database.test.ts` — "denies protected administrator self-revocation and preserves the live grant" | CLOSED |
| Q06 | A33 | `r5-authorization-admin.database.test.ts` — "rejects a duplicate live MembershipRole without widening authority" | CLOSED |
| Q07 | A60 | `policy.test.ts` — "fails closed when a protected resource permission has no ResourceContext" | CLOSED |

Proof-only implementation commits:

- `f78b667d5f17c953bf75787e47e614966c973ff4` — inactive-role proof;
- `cfdbe3501fdf1b3bba1446ef334897a1dbe40cfd` — ASN/OWN/NONE/missing-resource policy proofs;
- `8823c63c1a03281d91d5085bba07206186380f6c` — protected-revocation and duplicate-grant live PostgreSQL proofs.

The delta from the previously qualified production candidate `1d6ccc8c3ddb52c539c268e10527378ddb2529a3` to `8823c63c1a03281d91d5085bba07206186380f6c` changes only three test files. No production source, schema, migration, workflow, or runtime configuration changed.

## 4. Acceptance impact

The current implementation SHA `8823c63c1a03281d91d5085bba07206186380f6c` is fully exact-head qualified:

- R5 Implementation Qualification #104 — SUCCESS;
- R5 Browser Qualification #33 — SUCCESS;
- R4 Browser Qualification #67 — SUCCESS;
- R3 Browser Qualification #69 — SUCCESS.

All seven closure evidence gaps Q01–Q07 are now closed by executable negative proofs. None of those attacks succeeded against the existing production implementation, so no production-code repair was required.

Current technical disposition:

```text
production authorization defect demonstrated by Q01-Q07: NO
qualification / executable-proof gap remaining: NO
blocking/high R5 finding remaining from this closure pass: NO
P4-R5-C1: ACCEPTED + MERGED
implementation merge: COMPLETE — 748f6af4ce4c9868c2441125cd0480cf8abc34d4
closure-documentation merge: COMPLETE — 6add999609736e788d9bdaf8ddc690445f6d36e7
R6+: LOCKED
```

Owner acceptance was explicitly granted for exact SHA `8823c63c1a03281d91d5085bba07206186380f6c`; implementation and closure-documentation merges are complete.

## 5. Future-stage carry-forward

DEFERRED rows are not waived. They become mandatory implementation attacks when their production surface is authorized:

- R6+ domain bulk/lifecycle/workflow/resource behavior;
- R11 search/count/facet behavior;
- R12 production Client/member domain behavior;
- R13 provider-backed file/storage/signed URL behavior;
- later worker/integration stages.

R6 remains locked after P4-R5-C1 acceptance and merge; R6 requires a separate owner authorization.
