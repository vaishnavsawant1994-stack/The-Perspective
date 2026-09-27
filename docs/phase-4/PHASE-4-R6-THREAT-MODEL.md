# Phase 4 — R6 CRM & Commercial Engine Threat Model

**Record:** P4-R6-THREAT-01  
**Date:** September 27, 2026  
**Planning baseline:** `main@2372418d80fa07f633a0e4adc99a21b1f7d8300a`  
**Status:** G0 THREAT-MODEL CANDIDATE  
**Implementation:** NOT AUTHORIZED

## 0. Rule

Every applicable attack in this document must map to executable negative proof before P4-R6-C1 acceptance.

A denied attack is not proven unless the test also verifies, as applicable:

- zero unauthorized row mutation;
- zero cross-tenant row disclosure;
- zero unauthorized field disclosure;
- zero duplicated side effect;
- zero provider dispatch;
- zero outbox residue for rejected commands;
- correct immutable denial/audit evidence for sensitive actions.

## 1. Tenant / identity / authorization attacks

| ID | Attack | Required proof |
|---|---|---|
| A01 | Actor supplies foreign owner organization ID when creating CRM record | Server ignores/rejects caller tenant; no foreign row |
| A02 | Actor reads lead/company/contact by known foreign UUID | concealed/denied; no field/count leak |
| A03 | Actor mutates foreign campaign/deal/client by UUID | denied; unchanged row/history |
| A04 | Actor uses stale authorized context after R5 role revocation | in-transaction reauthorization denies |
| A05 | Browser asserts role/scope/owner/assignment fields | trusted DB/resource context wins |
| A06 | ORG-scoped grant crosses selected organization | denied |
| A07 | DEPT-scoped grant accesses another department record | denied |
| A08 | ASN-scoped grant forges assignment | denied against trusted assignment set |
| A09 | OWN-scoped grant forges owner ID | denied against trusted owner |
| A10 | Client membership accesses internal CRM prospect data | denied/client-safe projection only |
| A11 | Staff actor uses Client-surface permission path to widen Team authority | denied |
| A12 | Multiple roles combine fragments into synthetic authority | no cross-grant synthesis |
| A13 | R6 permission used while R6 stage inactive | denied |
| A14 | R7+ permission/route activated from R6 code | denied / qualification failure |
| A15 | Unknown permission/action/resource type reaches domain mutation | fail closed |

## 2. Resource / field / list attacks

| ID | Attack | Required proof |
|---|---|---|
| A16 | Domain row exists without matching trusted resource envelope | command/read fails closed or repair invariant prevents state |
| A17 | Resource envelope owner differs from domain row owner | fail closed; security evidence |
| A18 | List query omits tenant predicate but per-record policy exists | repository/RLS prevents cross-tenant rows |
| A19 | Pagination cursor from another organization is replayed | no cross-tenant data/count metadata |
| A20 | Aggregate/count endpoint leaks existence of concealed records | authorized count only |
| A21 | Export/bulk read launders ordinary view authority | explicit export/bulk authority required or unavailable |
| A22 | Internal enrichment/source fields leak to Client projection | field policy strips/denies |
| A23 | Raw extraction payload exposes secrets/PII beyond reviewer authority | restricted projection |
| A24 | Deal margin/internal cost leaks through CRM/client screen | denied unless later authorized internal field policy |
| A25 | Search/filter accepts unauthorized owner/client IDs to infer records | safe filtering; no existence oracle |

## 3. Lead source / extraction / enrichment attacks

| ID | Attack | Required proof |
|---|---|---|
| A26 | Caller marks arbitrary URL/provider as approved source | only server-owned source policy accepted |
| A27 | Extraction URL targets localhost/LAN/cloud metadata | network/SSRF policy blocks |
| A28 | Redirect chain escapes source/network allow policy | final destination revalidated |
| A29 | Provider/raw payload injects tenant/owner/permission fields | normalized payload cannot grant authority |
| A30 | Duplicate source records create duplicate active canonical leads | dedupe/review uniqueness prevents silent multiplication |
| A31 | Retry overwrites prior extraction evidence | attempt/history preserved |
| A32 | Enrichment provider value silently overwrites accepted canonical field | fact remains candidate until controlled acceptance |
| A33 | Low-confidence enrichment accepted without reviewer/policy | denied or review required |
| A34 | Cross-tenant enrichment job targets foreign resource | denied/concealed |
| A35 | Forged provenance/source URL is written as verified evidence | provenance status remains unverified/rejected |
| A36 | Failed/partial job is promoted as complete | lifecycle guard prevents |

## 4. Suppression / consent / contactability attacks

| ID | Attack | Required proof |
|---|---|---|
| A37 | Suppressed destination is added to campaign audience | excluded/denied |
| A38 | Suppression is created after audience freeze but before send | dispatch-time recheck stops send |
| A39 | DNC event races with queued future sequence steps | queued sends become stopped/cancelled |
| A40 | Alternate formatting/case bypasses suppression hash | normalized destination matches |
| A41 | Expired/nonexistent legal basis is asserted by client input | trusted current policy required |
| A42 | User unsubscribes after first send but next step is queued | next dispatch denied |
| A43 | Positive reply arrives concurrently with scheduled step | reply-stop wins; no unsafe duplicate send |
| A44 | Suppression entry deletion/expiry is manipulated without authority | sensitive mutation denied/audited |

## 5. Campaign / sequence / sender attacks

| ID | Attack | Required proof |
|---|---|---|
| A45 | Actor with campaign.manage but no outreach.launch launches campaign | denied |
| A46 | Approved campaign audience changes after approval | approval invalidated |
| A47 | Sequence/template/sender changes after approval | approval invalidated |
| A48 | Sender health becomes invalid after scheduling | dispatch-time check stops send |
| A49 | Campaign recipient is duplicated via retry/race | unique/idempotent recipient state |
| A50 | Same send command retried with same idempotency key | one provider dispatch |
| A51 | Same idempotency key reused with different payload | conflict; no dispatch |
| A52 | Rate/schedule limit bypass via parallel workers | transactional/lease control prevents |
| A53 | Paused/cancelled campaign still dispatches queued job | worker rechecks state |
| A54 | Client-side success state marks message sent without provider evidence | impossible; server/provider evidence authoritative |

## 6. Inbound message / webhook / conversation attacks

| ID | Attack | Required proof |
|---|---|---|
| A55 | Forged provider webhook accepted | signature/authentication failure denies |
| A56 | Valid webhook replayed | provider event dedupe prevents duplicate state |
| A57 | Out-of-order delivery/reply event regresses terminal state | chronology/state rules prevent unsafe regression |
| A58 | Inbound message linked to foreign organization conversation | tenant/provider connection ownership check denies |
| A59 | External message body injects privileged structured fields | body treated as untrusted content only |
| A60 | Conversation manually linked to unauthorized lead/deal/client | resource authorization denies |
| A61 | Internal note becomes client-visible message | visibility/projection prevents |
| A62 | Archived/resolved thread mutation skips reopen command | workflow guard denies |

## 7. Meeting attacks

| ID | Attack | Required proof |
|---|---|---|
| A63 | Actor schedules meeting against foreign deal/client | denied |
| A64 | Non-attendee/non-owner accesses restricted meeting notes | denied |
| A65 | Reschedule overwrites prior schedule without history | immutable change/history retained |
| A66 | Provider calendar event ID collision crosses organization | provider key scoped to connection/org |
| A67 | Completed/cancelled meeting is silently returned to scheduled | invalid transition denied |

## 8. Deal / pipeline attacks

| ID | Attack | Required proof |
|---|---|---|
| A68 | Lead converted to multiple deals via retry/race | idempotent conversion; one canonical result |
| A69 | Deal created from foreign lead/company/contact | denied |
| A70 | Actor moves deal to arbitrary stage key from another pipeline/version | denied |
| A71 | Pipeline config changes reinterpret already-recorded stage history | frozen/versioned pipeline semantics |
| A72 | Backward move omits required reason | denied |
| A73 | Actor skips required discovery/qualification guards | denied |
| A74 | Actor moves beyond R6 stage ceiling into R7 evidence states | denied while later stage inactive |
| A75 | Browser supplies amount/currency/status to bypass domain command | guarded fields/command policy |
| A76 | Stale deal version overwrites newer owner/stage/value | optimistic concurrency failure |
| A77 | Deal stage update succeeds but history/outbox/audit partially fails | transaction rolls back |
| A78 | Lost/disqualified deal is reopened without authorized transition/history | denied or explicit new transition |

## 9. Client-account conversion attacks

| ID | Attack | Required proof |
|---|---|---|
| A79 | Same deal conversion retried creates duplicate CLIENT organizations/accounts | idempotent single result |
| A80 | Existing canonical client company is converted into second tenant identity | dedupe/link guard prevents |
| A81 | Conversion links wrong/foreign organization by caller-supplied ID | trusted lookup/authority required |
| A82 | Conversion grants portal/admin membership implicitly | separate accepted provisioning command required |
| A83 | Client account exposes prospect-only internal CRM history to Client Portal | client-safe projection only |
| A84 | Staff converts unqualified/disallowed lead/deal | lifecycle/permission guard denies |
| A85 | Client relationship flags create unauthorized approver/admin capability | IAM/R5 capability provisioning remains separate |

## 10. Proposal attacks — conditional on Gate-A D01

These become R6-applicable only if the owner explicitly assigns proposal implementation to R6.

| ID | Attack | Required proof |
|---|---|---|
| A86 | Actor edits an already-sent/accepted proposal version | immutable version; successor required |
| A87 | Approval/acceptance applies to superseded version | exact-version denial |
| A88 | Proposal send uses unapproved version | denied |
| A89 | Proposal totals/terms mutate after send | immutable snapshot |
| A90 | Proposal from foreign deal/client is read/sent | tenant/resource denial |
| A91 | Self-approval violates SoD | denied |
| A92 | Expired/withdrawn proposal accepted | denied |
| A93 | Client acceptance is forged by staff/browser claim | client/system evidence required |
| A94 | R6 proposal implementation creates shadow products/packages | contract qualification failure |
| A95 | Proposal command crosses into contract/invoice/payment creation | R7 stage denial |

If Gate-A D01 resolves to strict R7 proposal ownership, A86–A95 are marked **DEFERRED TO R7**, not waived.

## 11. Transaction / event / audit attacks

| ID | Attack | Required proof |
|---|---|---|
| A96 | Business mutation commits without required outbox event | atomicity invariant/rollback |
| A97 | Outbox event commits for rejected/rolled-back mutation | no residue |
| A98 | Worker processes event twice | idempotent consumer |
| A99 | Worker acts after actor/resource state becomes unauthorized/invalid | execution-time business guard where required |
| A100 | Sensitive mutation completes without durable audit evidence | transaction/evidence requirement |
| A101 | Audit/history row update/delete attempted | DB immutability rejects |
| A102 | Audit payload stores raw PII/token/provider secret | redaction test |
| A103 | Request reason/audit data is caller-controlled authority | never used to grant |
| A104 | Database error after partial domain writes | full transactional rollback |

## 12. Database / RLS attacks

| ID | Attack | Required proof |
|---|---|---|
| A105 | Runtime DB role directly selects foreign R6 rows | RLS denies |
| A106 | New R6 table omitted from required tenant policy inventory | migration verifier fails |
| A107 | SECURITY DEFINER/helper bypasses tenant policy | explicit audit/test rejects unsafe path |
| A108 | Foreign-key relationship links cross-tenant domain rows | DB/app invariant rejects |
| A109 | Duplicate live uniqueness race bypasses application check | DB unique/constraint catches |
| A110 | Domain row survives when resource registration fails | transaction rollback |
| A111 | Archived/deleted parent leaves active unsafe child authority | lifecycle/constraint prevents |
| A112 | Migration downgrade/repair silently drops evidence constraints | drift/verify qualification fails |

## 13. Bulk / operational attacks

| ID | Attack | Required proof |
|---|---|---|
| A113 | Bulk assign/move bypasses per-record R5 resource policy | every record authorized or whole command safely rejects |
| A114 | CSV/import row injects organization/owner/stage authority | server-owned fields ignored/rejected |
| A115 | Partial bulk failure leaves mixed unauthorized residue | explicit atomic/partial contract with safe evidence |
| A116 | Large filters/pagination cause tenant side-channel counts | authorized aggregates only |
| A117 | Concurrent workers double-process extraction/send/conversion | lease/idempotency constraints |
| A118 | Retry after timeout cannot distinguish committed result | idempotency receipt returns prior result |
| A119 | Error response reveals concealed foreign entity identifiers | safe problem details |
| A120 | Prototype/hard-coded demo record is accidentally treated as persisted truth | production route test requires repository-backed record |

## 14. G0 acceptance rule

Before P4-R6-G0 may be frozen:

- D01 must be resolved;
- every applicable threat must map to a planned executable test surface;
- no BLOCKING/HIGH design finding may remain open;
- R7+ attacks remain explicitly deferred, never silently omitted;
- the contract verifier must prove R6 planning changes contain no production implementation.
