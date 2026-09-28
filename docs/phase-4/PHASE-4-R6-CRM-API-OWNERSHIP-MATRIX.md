# Phase 4 R6 CRM API Ownership Matrix

Status: CRM API COMPLETENESS AUDIT — OWNERSHIP BOUNDARY FROZEN FOR STEP 6

Baseline: `ebb2bd201033fe59f54ef3bf87722e46056095c7`

This matrix classifies the 17 qualified CRM core commands by trusted entrypoint. It does not authorize new business functionality. Browser/API ownership means an authenticated TEAM route may invoke the command only through the canonical R3 identity/session → R4 tenant → R5/R6 authorization → server-owned ResourceContext → field/workflow policy → CRM command chain.

| CRM core command | Ownership | Browser route state | Security rationale |
| --- | --- | --- | --- |
| `createLeadSource` | browser/API-owned | present | `source.manage:create`; source approval/provider execution remains server policy |
| `createCompany` | browser/API-owned | present | `company.edit:create`; authority fields server-owned |
| `createContact` | browser/API-owned | present | `contact.edit:create`; PII/contactability/consent fields remain server-owned |
| `createLead` | browser/API-owned | present | `lead.edit:create`; source record identity remains server-owned |
| `createExtractionJob` | browser/API-owned request | present | `lead.extract.run:create`; browser queues intent, provider execution is separate |
| `stageExtractedRecord` | worker/provider-owned | intentionally absent | raw/normalized provider payload, provenance and confidence are provider evidence, not browser authority |
| `requestEnrichment` | browser/API-owned request | present | `lead.enrich:create`; request hash is server-derived |
| `recordEnrichmentFact` | worker/provider-owned | intentionally absent | provider value/provenance/confidence/observation evidence cannot be manufactured by browser input |
| `createLeadList` | browser/API-owned | present | `lead.list.manage:create`; member count is server-owned |
| `addLeadListMember` | browser/API-owned | present | `lead.list.manage:add`; trusted list ResourceContext and tenant constraints required |
| `removeLeadListMember` | browser/API-owned | present | `lead.list.manage:remove`; trusted list ResourceContext and tenant constraints required |
| `recordLeadScore` | internal/server-owned | intentionally absent | model version, score/components and calculation time are derived evidence |
| `transitionLeadLifecycle` | browser/API-owned command | present for qualified/nurture/disqualify | `lead.qualify` action plus canonical lifecycle and row-version checks |
| `recordQualification` | internal/server-owned evidence | intentionally absent | qualification score/disposition is not caller-authoritative; browser lifecycle command must not self-assert qualification evidence |
| `createDuplicateCandidate` | internal/server-owned | intentionally absent | duplicate confidence/reasons are derived review evidence |
| `createSuppressionEntry` | internal/server-owned evidence | intentionally absent | suppression identity/effective state is safety evidence and has no generic browser-write permission |
| `suppressLead` | shared, separate trusted entrypoints | intentionally absent from generic browser API | atomic DNC command may originate from trusted human/provider safety flows, but no frozen generic browser action authorizes caller-supplied suppression evidence |

## Frozen-contract capability gaps discovered by the audit

These are not export-parity gaps and MUST NOT be implemented as thin routes around missing domain commands.

1. The frozen contract authorizes staged-record `view/review/approve/reject` under `lead.import.review`, but the current CRM core has no qualified staged-record review/promotion command.
2. The frozen contract authorizes enrichment-fact `review/accept/reject` under `lead.enrich`, but the current CRM core has no qualified enrichment-fact review/acceptance command.
3. The frozen contract describes lead/company/contact update surfaces. The current 17-command CRM core does not provide generic update commands for those aggregates. Step 6 API work must not manufacture update semantics in route handlers.

These gaps require separately qualified domain commands before browser routes can exist.

## Boundary invariants

- Browser routes MUST NOT directly invoke `stageExtractedRecord`, `recordEnrichmentFact`, `recordLeadScore`, `recordQualification`, `createDuplicateCandidate`, `createSuppressionEntry`, or `suppressLead`.
- Provider/worker execution receives a separate authenticated boundary later in Step 6.
- Every browser mutation authorizes every submitted field. Create-only, mutable, server-owned and action-specific fields remain explicit.
- Cross-tenant identifiers fail closed; object operations use server-loaded ResourceContext.
- List/detail responses are projected through authorization field policy; raw provider/provenance, internal score components, suppression evidence and unauthorized PII are not browser projections.
- `proposal.*` and `template.manage` remain dormant. Commercial remains capped at `PROPOSAL_PREPARATION`.
- This matrix does not authorize Communications, provider/worker implementation, UI binding, Step 7, R7+, Design 154, or merge to `main`.
