# Phase 4 — R5 Implementation Threat Coverage

**Record:** P4-R5-THREAT-COVERAGE-01  
**Date:** September 27, 2026  
**Frozen substantive contract:** 2914e76b22468137630a4d444adb5431209fb5aa  
**Qualified implementation candidate:** 1d6ccc8c3ddb52c539c268e10527378ddb2529a3  
**Historical pre-falsification qualified checkpoint:** ccfdf61897106661439f2bee4626f8d065e718f3  
**Review type:** enhanced authoring-agent falsification / closure evidence review — not independent  
**Independent external review:** NOT PERFORMED  
**Independent-review requirement:** OWNER-WAIVED under GOV-REVIEW-01  
**Replacement control:** ENHANCED QUALIFICATION  
**P4-R5-C1:** CANDIDATE — NOT ACCEPTED  
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
| A09 | **OPEN — evidence gap** | Resolver requires role status ACTIVE, but no executable R5 negative test was found that supplies an inactive role with otherwise valid authority. |
| A10 | PASS — R5 | Resolver/unit and live database evidence reject expired MembershipRole grants. |
| A11 | PASS — R5 | Resolver rejects cross-tenant roles; live DB/admin tests also preserve foreign rows/grants. |
| A12 | PASS — R5 | Complete same-grant path is preserved; Role.defaultScope cannot be borrowed to widen another permission. |
| A13 | PASS — R5 | Explicit applicable DENY is retained and wins over an applicable ALLOW. |
| A14 | PASS — R5 | Registry recognizes exact keys only; live DB test fails closed on inherited unknown permission keys. |
| A15 | PASS — R5 | Unknown/malformed constraint payloads fail closed; blocked-only permissions have no usable grant path. |
| A16 | PASS — R5 | DEPT policy requires trusted actor department and trusted resource department equality. |
| A17 | **OPEN — evidence gap** | ASN matching is implemented through server-owned assignedMembershipIds, and resolver preserves ASN scope, but no executable policy-negative proof for a non-assigned/forged-assignee case was found. |
| A18 | **OPEN — evidence gap** | OWN matching is implemented through trusted ownerMembershipId/ownerUserId, but no executable policy-negative proof for forged/non-owned access was found. |
| A19 | PASS — R5 | Active R5 permission keys are bound to explicit action families; view permission cannot authorize delete/mutation. |
| A20 | **OPEN — evidence gap** | NONE scope fails when a generic resource is present in policy code, but no explicit executable negative test for NONE + generic record access was found. |
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
| A32 | **OPEN — evidence gap** | Current revoke path uses the same fresh no-self/delegation ceiling and therefore appears compositional-safe, but no executable negative test directly attempts removal of the actor/last protected administrator. |
| A33 | **OPEN — evidence gap** | Application duplicate check and membership_roles_one_live_grant DB index exist, but no executable negative test was found that attempts a duplicate live MembershipRole grant. |
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
| A60 | **OPEN — evidence gap** | Policy resource scopes fail when ResourceContext is absent, but no explicit executable R5 negative test was found for protected permission + missing resource context. |

## 3. Open closure findings

| Finding | Threat IDs | Classification | Required closure |
|---|---|---|---|
| Q01 | A09 | Qualification evidence gap | Add negative test: otherwise-valid grant with inactive role must produce no authority/DENY. |
| Q02 | A17 | Qualification evidence gap | Add negative policy test for ASN where trusted assignedMembershipIds does not contain actor. |
| Q03 | A18 | Qualification evidence gap | Add negative policy test for OWN where trusted ownership does not match actor. |
| Q04 | A20 | Qualification evidence gap | Add negative policy test proving NONE cannot authorize generic resource access. |
| Q05 | A32 | Qualification evidence gap | Add direct revocation test proving actor/last protected admin cannot remove own protected grant and leaves no residue. |
| Q06 | A33 | Qualification evidence gap | Add duplicate-live MembershipRole attack test proving application/DB guard rejects duplicate without widening authority. |
| Q07 | A60 | Qualification evidence gap | Add explicit missing-ResourceContext negative test for a protected resource permission. |

These findings do **not** currently demonstrate an authorization bypass. They demonstrate that the frozen A01–A60 implementation-evidence requirement is not yet completely proven by executable negative tests.

## 4. Acceptance impact

The current production-code SHA 1d6ccc8c3ddb52c539c268e10527378ddb2529a3 remains:

- exact-head qualified by all four current workflows;
- the P4-R5-C1 implementation candidate;
- not accepted;
- not merge-authorized.

Because P4-R5-G0 requires applicable threat attacks to map to executable negative tests before P4-R5-C1, Q01–Q07 must be closed before owner acceptance is requested.

If Q01–Q07 require test-only commits and no production behavior changes, the resulting new implementation head still requires complete exact-head R5 Implementation, R5 Browser, R4 Browser and R3 Browser requalification before the closure package may advance.

Only a demonstrated production behavior defect warrants production-code repair. Test-only evidence repairs should remain narrowly scoped to the missing proofs.

## 5. Future-stage carry-forward

DEFERRED rows are not waived. They become mandatory implementation attacks when their production surface is authorized:

- R6+ domain bulk/lifecycle/workflow/resource behavior;
- R11 search/count/facet behavior;
- R12 production Client/member domain behavior;
- R13 provider-backed file/storage/signed URL behavior;
- later worker/integration stages.

R6 remains locked until P4-R5-C1 is accepted through the separate owner gate.
