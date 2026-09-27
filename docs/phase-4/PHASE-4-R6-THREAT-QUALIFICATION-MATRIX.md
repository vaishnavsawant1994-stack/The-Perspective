# Phase 4 — R6 Threat-to-Qualification Matrix

**Record:** P4-R6-QUAL-MAP-01  
**Date:** September 27, 2026  
**Status:** G0 CANDIDATE — EXECUTABLE PLAN, IMPLEMENTATION NOT AUTHORIZED  
**Threat source:** P4-R6-THREAT-01  
**Total threat IDs:** 120

## 0. Rule

Every threat ID is dispositioned exactly once.

- **R6 executable** means the first implementation qualification must contain a direct executable negative proof.
- **R7 deferred** means R6 must machine-prove the prohibited surface is absent/dormant; the behavioral attack remains mandatory for R7.
- No threat is waived by this matrix.
- A denied attack must also assert no unauthorized mutation/leak/provider dispatch/outbox residue and required audit evidence.

## 1. One-to-one mapping

| Threat | Qualification layer | Planned suite | Attack | Required executable assertion |
|---|---|---|---|---|
| A01 | AUTH/API/DB | `r6-authorization-negative` | Actor supplies foreign owner organization ID when creating CRM record | authorization/resource denial; zero leak/mutation; Server ignores/rejects caller tenant; no foreign row |
| A02 | AUTH/API/DB | `r6-authorization-negative` | Actor reads lead/company/contact by known foreign UUID | authorization/resource denial; zero leak/mutation; concealed/denied; no field/count leak |
| A03 | AUTH/API/DB | `r6-authorization-negative` | Actor mutates foreign campaign/deal/client by UUID | authorization/resource denial; zero leak/mutation; denied; unchanged row/history |
| A04 | AUTH/API/DB | `r6-authorization-negative` | Actor uses stale authorized context after R5 role revocation | authorization/resource denial; zero leak/mutation; in-transaction reauthorization denies |
| A05 | AUTH/API/DB | `r6-authorization-negative` | Browser asserts role/scope/owner/assignment fields | authorization/resource denial; zero leak/mutation; trusted DB/resource context wins |
| A06 | AUTH/API/DB | `r6-authorization-negative` | ORG-scoped grant crosses selected organization | authorization/resource denial; zero leak/mutation; denied |
| A07 | AUTH/API/DB | `r6-authorization-negative` | DEPT-scoped grant accesses another department record | authorization/resource denial; zero leak/mutation; denied |
| A08 | AUTH/API/DB | `r6-authorization-negative` | ASN-scoped grant forges assignment | authorization/resource denial; zero leak/mutation; denied against trusted assignment set |
| A09 | AUTH/API/DB | `r6-authorization-negative` | OWN-scoped grant forges owner ID | authorization/resource denial; zero leak/mutation; denied against trusted owner |
| A10 | AUTH/API/DB | `r6-authorization-negative` | Client membership accesses internal CRM prospect data | authorization/resource denial; zero leak/mutation; denied/client-safe projection only |
| A11 | AUTH/API/DB | `r6-authorization-negative` | Staff actor uses Client-surface permission path to widen Team authority | authorization/resource denial; zero leak/mutation; denied |
| A12 | AUTH/API/DB | `r6-authorization-negative` | Multiple roles combine fragments into synthetic authority | authorization/resource denial; zero leak/mutation; no cross-grant synthesis |
| A13 | AUTH/API/DB | `r6-authorization-negative` | R6 permission used while R6 stage inactive | authorization/resource denial; zero leak/mutation; denied |
| A14 | AUTH/API/DB | `r6-authorization-negative` | R7+ permission/route activated from R6 code | authorization/resource denial; zero leak/mutation; denied / qualification failure |
| A15 | AUTH/API/DB | `r6-authorization-negative` | Unknown permission/action/resource type reaches domain mutation | authorization/resource denial; zero leak/mutation; fail closed |
| A16 | RESOURCE/FIELD/API | `r6-resource-field-negative` | Domain row exists without matching trusted resource envelope | trusted context + explicit field/list projection; command/read fails closed or repair invariant prevents state |
| A17 | RESOURCE/FIELD/API | `r6-resource-field-negative` | Resource envelope owner differs from domain row owner | trusted context + explicit field/list projection; fail closed; security evidence |
| A18 | RESOURCE/FIELD/API | `r6-resource-field-negative` | List query omits tenant predicate but per-record policy exists | trusted context + explicit field/list projection; repository/RLS prevents cross-tenant rows |
| A19 | RESOURCE/FIELD/API | `r6-resource-field-negative` | Pagination cursor from another organization is replayed | trusted context + explicit field/list projection; no cross-tenant data/count metadata |
| A20 | RESOURCE/FIELD/API | `r6-resource-field-negative` | Aggregate/count endpoint leaks existence of concealed records | trusted context + explicit field/list projection; authorized count only |
| A21 | RESOURCE/FIELD/API | `r6-resource-field-negative` | Export/bulk read launders ordinary view authority | trusted context + explicit field/list projection; explicit export/bulk authority required or unavailable |
| A22 | RESOURCE/FIELD/API | `r6-resource-field-negative` | Internal enrichment/source fields leak to Client projection | trusted context + explicit field/list projection; field policy strips/denies |
| A23 | RESOURCE/FIELD/API | `r6-resource-field-negative` | Raw extraction payload exposes secrets/PII beyond reviewer authority | trusted context + explicit field/list projection; restricted projection |
| A24 | RESOURCE/FIELD/API | `r6-resource-field-negative` | Deal margin/internal cost leaks through CRM/client screen | trusted context + explicit field/list projection; denied unless later authorized internal field policy |
| A25 | RESOURCE/FIELD/API | `r6-resource-field-negative` | Search/filter accepts unauthorized owner/client IDs to infer records | trusted context + explicit field/list projection; safe filtering; no existence oracle |
| A26 | CRM DOMAIN/PROVIDER | `r6-crm-intelligence-negative` | Caller marks arbitrary URL/provider as approved source | source/provenance/dedupe/enrichment evidence; only server-owned source policy accepted |
| A27 | CRM DOMAIN/PROVIDER | `r6-crm-intelligence-negative` | Extraction URL targets localhost/LAN/cloud metadata | source/provenance/dedupe/enrichment evidence; network/SSRF policy blocks |
| A28 | CRM DOMAIN/PROVIDER | `r6-crm-intelligence-negative` | Redirect chain escapes source/network allow policy | source/provenance/dedupe/enrichment evidence; final destination revalidated |
| A29 | CRM DOMAIN/PROVIDER | `r6-crm-intelligence-negative` | Provider/raw payload injects tenant/owner/permission fields | source/provenance/dedupe/enrichment evidence; normalized payload cannot grant authority |
| A30 | CRM DOMAIN/PROVIDER | `r6-crm-intelligence-negative` | Duplicate source records create duplicate active canonical leads | source/provenance/dedupe/enrichment evidence; dedupe/review uniqueness prevents silent multiplication |
| A31 | CRM DOMAIN/PROVIDER | `r6-crm-intelligence-negative` | Retry overwrites prior extraction evidence | source/provenance/dedupe/enrichment evidence; attempt/history preserved |
| A32 | CRM DOMAIN/PROVIDER | `r6-crm-intelligence-negative` | Enrichment provider value silently overwrites accepted canonical field | source/provenance/dedupe/enrichment evidence; fact remains candidate until controlled acceptance |
| A33 | CRM DOMAIN/PROVIDER | `r6-crm-intelligence-negative` | Low-confidence enrichment accepted without reviewer/policy | source/provenance/dedupe/enrichment evidence; denied or review required |
| A34 | CRM DOMAIN/PROVIDER | `r6-crm-intelligence-negative` | Cross-tenant enrichment job targets foreign resource | source/provenance/dedupe/enrichment evidence; denied/concealed |
| A35 | CRM DOMAIN/PROVIDER | `r6-crm-intelligence-negative` | Forged provenance/source URL is written as verified evidence | source/provenance/dedupe/enrichment evidence; provenance status remains unverified/rejected |
| A36 | CRM DOMAIN/PROVIDER | `r6-crm-intelligence-negative` | Failed/partial job is promoted as complete | source/provenance/dedupe/enrichment evidence; lifecycle guard prevents |
| A37 | CRM/WORKER RACE | `r6-contactability-race` | Suppressed destination is added to campaign audience | suppression/DNC normalized dispatch-time recheck; excluded/denied |
| A38 | CRM/WORKER RACE | `r6-contactability-race` | Suppression is created after audience freeze but before send | suppression/DNC normalized dispatch-time recheck; dispatch-time recheck stops send |
| A39 | CRM/WORKER RACE | `r6-contactability-race` | DNC event races with queued future sequence steps | suppression/DNC normalized dispatch-time recheck; queued sends become stopped/cancelled |
| A40 | CRM/WORKER RACE | `r6-contactability-race` | Alternate formatting/case bypasses suppression hash | suppression/DNC normalized dispatch-time recheck; normalized destination matches |
| A41 | CRM/WORKER RACE | `r6-contactability-race` | Expired/nonexistent legal basis is asserted by client input | suppression/DNC normalized dispatch-time recheck; trusted current policy required |
| A42 | CRM/WORKER RACE | `r6-contactability-race` | User unsubscribes after first send but next step is queued | suppression/DNC normalized dispatch-time recheck; next dispatch denied |
| A43 | CRM/WORKER RACE | `r6-contactability-race` | Positive reply arrives concurrently with scheduled step | suppression/DNC normalized dispatch-time recheck; reply-stop wins; no unsafe duplicate send |
| A44 | CRM/WORKER RACE | `r6-contactability-race` | Suppression entry deletion/expiry is manipulated without authority | suppression/DNC normalized dispatch-time recheck; sensitive mutation denied/audited |
| A45 | COMMS/WORKER | `r6-campaign-dispatch-negative` | Actor with campaign.manage but no outreach.launch launches campaign | version/idempotency/sender/dispatch safety; denied |
| A46 | COMMS/WORKER | `r6-campaign-dispatch-negative` | Approved campaign audience changes after approval | version/idempotency/sender/dispatch safety; approval invalidated |
| A47 | COMMS/WORKER | `r6-campaign-dispatch-negative` | Sequence/template/sender changes after approval | version/idempotency/sender/dispatch safety; approval invalidated |
| A48 | COMMS/WORKER | `r6-campaign-dispatch-negative` | Sender health becomes invalid after scheduling | version/idempotency/sender/dispatch safety; dispatch-time check stops send |
| A49 | COMMS/WORKER | `r6-campaign-dispatch-negative` | Campaign recipient is duplicated via retry/race | version/idempotency/sender/dispatch safety; unique/idempotent recipient state |
| A50 | COMMS/WORKER | `r6-campaign-dispatch-negative` | Same send command retried with same idempotency key | version/idempotency/sender/dispatch safety; one provider dispatch |
| A51 | COMMS/WORKER | `r6-campaign-dispatch-negative` | Same idempotency key reused with different payload | version/idempotency/sender/dispatch safety; conflict; no dispatch |
| A52 | COMMS/WORKER | `r6-campaign-dispatch-negative` | Rate/schedule limit bypass via parallel workers | version/idempotency/sender/dispatch safety; transactional/lease control prevents |
| A53 | COMMS/WORKER | `r6-campaign-dispatch-negative` | Paused/cancelled campaign still dispatches queued job | version/idempotency/sender/dispatch safety; worker rechecks state |
| A54 | COMMS/WORKER | `r6-campaign-dispatch-negative` | Client-side success state marks message sent without provider evidence | version/idempotency/sender/dispatch safety; impossible; server/provider evidence authoritative |
| A55 | WEBHOOK/COMMS | `r6-inbound-conversation-negative` | Forged provider webhook accepted | signature/dedupe/order/visibility/link authorization; signature/authentication failure denies |
| A56 | WEBHOOK/COMMS | `r6-inbound-conversation-negative` | Valid webhook replayed | signature/dedupe/order/visibility/link authorization; provider event dedupe prevents duplicate state |
| A57 | WEBHOOK/COMMS | `r6-inbound-conversation-negative` | Out-of-order delivery/reply event regresses terminal state | signature/dedupe/order/visibility/link authorization; chronology/state rules prevent unsafe regression |
| A58 | WEBHOOK/COMMS | `r6-inbound-conversation-negative` | Inbound message linked to foreign organization conversation | signature/dedupe/order/visibility/link authorization; tenant/provider connection ownership check denies |
| A59 | WEBHOOK/COMMS | `r6-inbound-conversation-negative` | External message body injects privileged structured fields | signature/dedupe/order/visibility/link authorization; body treated as untrusted content only |
| A60 | WEBHOOK/COMMS | `r6-inbound-conversation-negative` | Conversation manually linked to unauthorized lead/deal/client | signature/dedupe/order/visibility/link authorization; resource authorization denies |
| A61 | WEBHOOK/COMMS | `r6-inbound-conversation-negative` | Internal note becomes client-visible message | signature/dedupe/order/visibility/link authorization; visibility/projection prevents |
| A62 | WEBHOOK/COMMS | `r6-inbound-conversation-negative` | Archived/resolved thread mutation skips reopen command | signature/dedupe/order/visibility/link authorization; workflow guard denies |
| A63 | MEETING DOMAIN/API | `r6-meeting-lifecycle-negative` | Actor schedules meeting against foreign deal/client | scope + immutable schedule history; denied |
| A64 | MEETING DOMAIN/API | `r6-meeting-lifecycle-negative` | Non-attendee/non-owner accesses restricted meeting notes | scope + immutable schedule history; denied |
| A65 | MEETING DOMAIN/API | `r6-meeting-lifecycle-negative` | Reschedule overwrites prior schedule without history | scope + immutable schedule history; immutable change/history retained |
| A66 | MEETING DOMAIN/API | `r6-meeting-lifecycle-negative` | Provider calendar event ID collision crosses organization | scope + immutable schedule history; provider key scoped to connection/org |
| A67 | MEETING DOMAIN/API | `r6-meeting-lifecycle-negative` | Completed/cancelled meeting is silently returned to scheduled | scope + immutable schedule history; invalid transition denied |
| A68 | COMMERCIAL DOMAIN/DB | `r6-deal-lifecycle-negative` | Lead converted to multiple deals via retry/race | pipeline/version/ceiling/concurrency/atomicity; idempotent conversion; one canonical result |
| A69 | COMMERCIAL DOMAIN/DB | `r6-deal-lifecycle-negative` | Deal created from foreign lead/company/contact | pipeline/version/ceiling/concurrency/atomicity; denied |
| A70 | COMMERCIAL DOMAIN/DB | `r6-deal-lifecycle-negative` | Actor moves deal to arbitrary stage key from another pipeline/version | pipeline/version/ceiling/concurrency/atomicity; denied |
| A71 | COMMERCIAL DOMAIN/DB | `r6-deal-lifecycle-negative` | Pipeline config changes reinterpret already-recorded stage history | pipeline/version/ceiling/concurrency/atomicity; frozen/versioned pipeline semantics |
| A72 | COMMERCIAL DOMAIN/DB | `r6-deal-lifecycle-negative` | Backward move omits required reason | pipeline/version/ceiling/concurrency/atomicity; denied |
| A73 | COMMERCIAL DOMAIN/DB | `r6-deal-lifecycle-negative` | Actor skips required discovery/qualification guards | pipeline/version/ceiling/concurrency/atomicity; denied |
| A74 | COMMERCIAL DOMAIN/DB | `r6-deal-lifecycle-negative` | Actor moves beyond R6 stage ceiling into R7 evidence states | pipeline/version/ceiling/concurrency/atomicity; denied while later stage inactive |
| A75 | COMMERCIAL DOMAIN/DB | `r6-deal-lifecycle-negative` | Browser supplies amount/currency/status to bypass domain command | pipeline/version/ceiling/concurrency/atomicity; guarded fields/command policy |
| A76 | COMMERCIAL DOMAIN/DB | `r6-deal-lifecycle-negative` | Stale deal version overwrites newer owner/stage/value | pipeline/version/ceiling/concurrency/atomicity; optimistic concurrency failure |
| A77 | COMMERCIAL DOMAIN/DB | `r6-deal-lifecycle-negative` | Deal stage update succeeds but history/outbox/audit partially fails | pipeline/version/ceiling/concurrency/atomicity; transaction rolls back |
| A78 | COMMERCIAL DOMAIN/DB | `r6-deal-lifecycle-negative` | Lost/disqualified deal is reopened without authorized transition/history | pipeline/version/ceiling/concurrency/atomicity; denied or explicit new transition |
| A79 | CONVERSION DOMAIN/DB | `r6-client-conversion-negative` | Same deal conversion retried creates duplicate CLIENT organizations/accounts | idempotent tenant-safe conversion; no implicit IAM/R7/R8; idempotent single result |
| A80 | CONVERSION DOMAIN/DB | `r6-client-conversion-negative` | Existing canonical client company is converted into second tenant identity | idempotent tenant-safe conversion; no implicit IAM/R7/R8; dedupe/link guard prevents |
| A81 | CONVERSION DOMAIN/DB | `r6-client-conversion-negative` | Conversion links wrong/foreign organization by caller-supplied ID | idempotent tenant-safe conversion; no implicit IAM/R7/R8; trusted lookup/authority required |
| A82 | CONVERSION DOMAIN/DB | `r6-client-conversion-negative` | Conversion grants portal/admin membership implicitly | idempotent tenant-safe conversion; no implicit IAM/R7/R8; separate accepted provisioning command required |
| A83 | CONVERSION DOMAIN/DB | `r6-client-conversion-negative` | Client account exposes prospect-only internal CRM history to Client Portal | idempotent tenant-safe conversion; no implicit IAM/R7/R8; client-safe projection only |
| A84 | CONVERSION DOMAIN/DB | `r6-client-conversion-negative` | Staff converts unqualified/disallowed lead/deal | idempotent tenant-safe conversion; no implicit IAM/R7/R8; lifecycle/permission guard denies |
| A85 | CONVERSION DOMAIN/DB | `r6-client-conversion-negative` | Client relationship flags create unauthorized approver/admin capability | idempotent tenant-safe conversion; no implicit IAM/R7/R8; IAM/R5 capability provisioning remains separate |
| A86 | G0 SCOPE EXCLUSION + R7 FUTURE | `r6-r7-exclusion` | Actor edits an already-sent/accepted proposal version | prove production surface absent/dormant now; retain ID for R7 behavioral attack; immutable version; successor required |
| A87 | G0 SCOPE EXCLUSION + R7 FUTURE | `r6-r7-exclusion` | Approval/acceptance applies to superseded version | prove production surface absent/dormant now; retain ID for R7 behavioral attack; exact-version denial |
| A88 | G0 SCOPE EXCLUSION + R7 FUTURE | `r6-r7-exclusion` | Proposal send uses unapproved version | prove production surface absent/dormant now; retain ID for R7 behavioral attack; denied |
| A89 | G0 SCOPE EXCLUSION + R7 FUTURE | `r6-r7-exclusion` | Proposal totals/terms mutate after send | prove production surface absent/dormant now; retain ID for R7 behavioral attack; immutable snapshot |
| A90 | G0 SCOPE EXCLUSION + R7 FUTURE | `r6-r7-exclusion` | Proposal from foreign deal/client is read/sent | prove production surface absent/dormant now; retain ID for R7 behavioral attack; tenant/resource denial |
| A91 | G0 SCOPE EXCLUSION + R7 FUTURE | `r6-r7-exclusion` | Self-approval violates SoD | prove production surface absent/dormant now; retain ID for R7 behavioral attack; denied |
| A92 | G0 SCOPE EXCLUSION + R7 FUTURE | `r6-r7-exclusion` | Expired/withdrawn proposal accepted | prove production surface absent/dormant now; retain ID for R7 behavioral attack; denied |
| A93 | G0 SCOPE EXCLUSION + R7 FUTURE | `r6-r7-exclusion` | Client acceptance is forged by staff/browser claim | prove production surface absent/dormant now; retain ID for R7 behavioral attack; client/system evidence required |
| A94 | G0 SCOPE EXCLUSION + R7 FUTURE | `r6-r7-exclusion` | R6 proposal implementation creates shadow products/packages | prove production surface absent/dormant now; retain ID for R7 behavioral attack; contract qualification failure |
| A95 | G0 SCOPE EXCLUSION + R7 FUTURE | `r6-r7-exclusion` | Proposal command crosses into contract/invoice/payment creation | prove production surface absent/dormant now; retain ID for R7 behavioral attack; R7 stage denial |
| A96 | TRANSACTION/OUTBOX/AUDIT | `r6-atomicity-evidence-negative` | Business mutation commits without required outbox event | rollback/no residue/idempotent worker/immutable redacted evidence; atomicity invariant/rollback |
| A97 | TRANSACTION/OUTBOX/AUDIT | `r6-atomicity-evidence-negative` | Outbox event commits for rejected/rolled-back mutation | rollback/no residue/idempotent worker/immutable redacted evidence; no residue |
| A98 | TRANSACTION/OUTBOX/AUDIT | `r6-atomicity-evidence-negative` | Worker processes event twice | rollback/no residue/idempotent worker/immutable redacted evidence; idempotent consumer |
| A99 | TRANSACTION/OUTBOX/AUDIT | `r6-atomicity-evidence-negative` | Worker acts after actor/resource state becomes unauthorized/invalid | rollback/no residue/idempotent worker/immutable redacted evidence; execution-time business guard where required |
| A100 | TRANSACTION/OUTBOX/AUDIT | `r6-atomicity-evidence-negative` | Sensitive mutation completes without durable audit evidence | rollback/no residue/idempotent worker/immutable redacted evidence; transaction/evidence requirement |
| A101 | TRANSACTION/OUTBOX/AUDIT | `r6-atomicity-evidence-negative` | Audit/history row update/delete attempted | rollback/no residue/idempotent worker/immutable redacted evidence; DB immutability rejects |
| A102 | TRANSACTION/OUTBOX/AUDIT | `r6-atomicity-evidence-negative` | Audit payload stores raw PII/token/provider secret | rollback/no residue/idempotent worker/immutable redacted evidence; redaction test |
| A103 | TRANSACTION/OUTBOX/AUDIT | `r6-atomicity-evidence-negative` | Request reason/audit data is caller-controlled authority | rollback/no residue/idempotent worker/immutable redacted evidence; never used to grant |
| A104 | TRANSACTION/OUTBOX/AUDIT | `r6-atomicity-evidence-negative` | Database error after partial domain writes | rollback/no residue/idempotent worker/immutable redacted evidence; full transactional rollback |
| A105 | LIVE POSTGRESQL/RLS | `r6-database-tenancy-negative` | Runtime DB role directly selects foreign R6 rows | runtime-role direct SQL + migration verifier; RLS denies |
| A106 | LIVE POSTGRESQL/RLS | `r6-database-tenancy-negative` | New R6 table omitted from required tenant policy inventory | runtime-role direct SQL + migration verifier; migration verifier fails |
| A107 | LIVE POSTGRESQL/RLS | `r6-database-tenancy-negative` | SECURITY DEFINER/helper bypasses tenant policy | runtime-role direct SQL + migration verifier; explicit audit/test rejects unsafe path |
| A108 | LIVE POSTGRESQL/RLS | `r6-database-tenancy-negative` | Foreign-key relationship links cross-tenant domain rows | runtime-role direct SQL + migration verifier; DB/app invariant rejects |
| A109 | LIVE POSTGRESQL/RLS | `r6-database-tenancy-negative` | Duplicate live uniqueness race bypasses application check | runtime-role direct SQL + migration verifier; DB unique/constraint catches |
| A110 | LIVE POSTGRESQL/RLS | `r6-database-tenancy-negative` | Domain row survives when resource registration fails | runtime-role direct SQL + migration verifier; transaction rollback |
| A111 | LIVE POSTGRESQL/RLS | `r6-database-tenancy-negative` | Archived/deleted parent leaves active unsafe child authority | runtime-role direct SQL + migration verifier; lifecycle/constraint prevents |
| A112 | LIVE POSTGRESQL/RLS | `r6-database-tenancy-negative` | Migration downgrade/repair silently drops evidence constraints | runtime-role direct SQL + migration verifier; drift/verify qualification fails |
| A113 | BULK/OPERATIONAL | `r6-bulk-operational-negative` | Bulk assign/move bypasses per-record R5 resource policy | per-record auth/idempotency/safe partial semantics/no fixture truth; every record authorized or whole command safely rejects |
| A114 | BULK/OPERATIONAL | `r6-bulk-operational-negative` | CSV/import row injects organization/owner/stage authority | per-record auth/idempotency/safe partial semantics/no fixture truth; server-owned fields ignored/rejected |
| A115 | BULK/OPERATIONAL | `r6-bulk-operational-negative` | Partial bulk failure leaves mixed unauthorized residue | per-record auth/idempotency/safe partial semantics/no fixture truth; explicit atomic/partial contract with safe evidence |
| A116 | BULK/OPERATIONAL | `r6-bulk-operational-negative` | Large filters/pagination cause tenant side-channel counts | per-record auth/idempotency/safe partial semantics/no fixture truth; authorized aggregates only |
| A117 | BULK/OPERATIONAL | `r6-bulk-operational-negative` | Concurrent workers double-process extraction/send/conversion | per-record auth/idempotency/safe partial semantics/no fixture truth; lease/idempotency constraints |
| A118 | BULK/OPERATIONAL | `r6-bulk-operational-negative` | Retry after timeout cannot distinguish committed result | per-record auth/idempotency/safe partial semantics/no fixture truth; idempotency receipt returns prior result |
| A119 | BULK/OPERATIONAL | `r6-bulk-operational-negative` | Error response reveals concealed foreign entity identifiers | per-record auth/idempotency/safe partial semantics/no fixture truth; safe problem details |
| A120 | BULK/OPERATIONAL | `r6-bulk-operational-negative` | Prototype/hard-coded demo record is accidentally treated as persisted truth | per-record auth/idempotency/safe partial semantics/no fixture truth; production route test requires repository-backed record |

## 2. Required executable suite families

The future R6 implementation qualification must contain executable suites corresponding to:

1. `r6-authorization-negative`
2. `r6-resource-field-negative`
3. `r6-crm-intelligence-negative`
4. `r6-contactability-race`
5. `r6-campaign-dispatch-negative`
6. `r6-inbound-conversation-negative`
7. `r6-meeting-lifecycle-negative`
8. `r6-deal-lifecycle-negative`
9. `r6-client-conversion-negative`
10. `r6-atomicity-evidence-negative`
11. `r6-database-tenancy-negative`
12. `r6-bulk-operational-negative`

The planning/G0 qualification does not pretend these implementation tests already exist. It proves that every threat has an owning future executable suite and that R7-deferred surfaces are excluded from R6.

## 3. R7-deferred disposition

A86–A95 are R7 behavioral threats under approved D01.

R6 G0 qualification must prove:

- no R6 proposal Prisma models/migrations;
- no R6 proposal production API routes;
- no R6 proposal domain service;
- no R6 proposal worker/provider dispatch;
- proposal permissions remain dormant;
- R6 deal commands stop at `PROPOSAL_PREPARATION`.

These threat IDs remain in the program ledger for R7.

## 4. G0 machine checks

The G0 verifier must fail if:

- the threat source does not contain exactly A01–A120;
- this matrix does not contain exactly A01–A120;
- an ID is duplicated;
- an ID is missing;
- A86–A95 are described as waived/pass instead of deferred;
- R7 exclusion rules are absent;
- the implementation contract claims implementation authorization.

## 5. Acceptance semantics

This document is a qualification plan, not evidence that future domain attacks have already passed.

P4-R6-G0 may be frozen only when the planning contract itself passes adversarial and machine qualification. P4-R6-C1 later requires the implementation-time executable suites to pass on the exact implementation candidate SHA.
