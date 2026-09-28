# R6 Communications API permanent checkpoint

PROJECT: The Perspective
RELEASE: Phase 4 / R6
STEP: Communications HTTP/API
TRANCHE: human-owned Communications API
BRANCH: phase4/r6-crm-commercial-implementation-20260927
QUALIFIED IMPLEMENTATION HEAD: 3160f5e9829be035408ed88b0b31e96162e676fd
PARENT: 190ab7cb2a224873b2fbfc518ea70198a06a90d0
TREE: 73000b45da28be9abf1304a0cdedceb6cffb550c
LAST QUALIFICATION: R6 Implementation Qualification #242 — SUCCESS

## Evidence chain
- afffd7d436bd5523069bc24b7ff20cc20603beba — #238 SUCCESS; qualified Communications HTTP foundation.
- a1f26338ad5d8c565bf9137391ac57721e08c789 — human-owned route tranche; #239 failed only TypeScript reschedule-reason contract alignment after unit/live PostgreSQL success.
- 78e1106a58d7f3ff37d83062ef5fe1e1e3de1e8e — minimal reason-contract repair; #240 SUCCESS.
- 190ab7cb2a224873b2fbfc518ea70198a06a90d0 — strengthened browser/server ownership regression; #241 SUCCESS.
- 3160f5e9829be035408ed88b0b31e96162e676fd — whole Communications HTTP-surface falsification; #242 SUCCESS.

## Human/browser-owned routes
Sending accounts: list, detail, create, human configuration update.
Sequences: list, detail, create, immutable next-version creation.
Campaigns: list/create, detail, DRAFT-only update, already-qualified permitted transition and launch-intent routes.
Conversations: list, detail, assignment, INTERNAL-note creation.
Meetings: list, detail/create, reschedule; reschedule history is returned only through the authorized meeting projection.

All mutable existing-resource routes use canonical selected-team request resolution, trusted tenant-constrained resource loaders, canonical R6 authorization and submitted-field policies before invoking the qualified domain command.

## Server/worker/provider-owned boundary
No browser route exposes addCampaignRecipient, buildCampaignApprovalSnapshotInTransaction, computeCampaignApprovalSnapshot, evaluateDispatchSafety, recordDeliveryEvent, createConversation or generic recordMessage.
Browser routes do not manufacture providerThreadId/externalEventId/payloadHash, provider delivery state, SENT/DELIVERED truth, provider health/sync mutation, or direct recipient progression.
template.manage and proposal.* remain outside this tranche.

## Authorization and field protections
Canonical session/origin/selected-tenant resolution is reused from src/modules/r6/http.ts.
Existing-resource mutation uses trusted resource contexts loaded from canonical database state.
Strict request schemas reject unknown authority/provider fields.
Sequence version creation is row-version checked.
Campaign mutable fields are authorized and accepted only while the canonical campaign lifecycle is DRAFT; sequence changes pin the canonical current sequence version in the domain command.
Conversation assignment delegates assignee validation to the qualified tenant-membership domain invariant.
Internal-note route exposes only bodyText; direction/provider/external IDs are not browser fields.
Meeting reschedule uses row-version authorization and the qualified transactional immutable reschedule-history path.

## Falsification retained
communications-api-ownership-boundary.test.ts permanently rejects worker/provider command exposure.
communications-api-post-falsification.test.ts inventories the Communications route surface, enforces same-origin on mutations, canonical R6 request resolution, absence of browser-owned authority/provider truth, trusted loaders for existing-resource mutation, sequence/campaign version gates, and absence of meeting-history mutation routes.
Inherited domain/database attacks continue to cover sequence-version pinning, campaign lifecycle, DNC/suppression/contactability, conversation assignment, internal-message truth and immutable meeting history.

FAILURES: #239 TypeScript contract mismatch for nullable meeting reschedule reason.
PRODUCTION DEFECTS: none demonstrated by #240-#242.
TEST/HARNESS DEFECTS: none outstanding.
REPAIRS: aligned HTTP reschedule reason schema with qualified domain input.
REGRESSIONS RETAINED: browser/server ownership boundary and whole Communications HTTP-surface falsification.
LOCKED SCOPE: Commercial API, providers/workers, UI binding, final A01-A120, P4-R6-C1, merge, and R7 remain locked.
NEXT GATE: qualify this documentation-only checkpoint head. Only its exact green qualification unlocks Commercial API.

COMMUNICATIONS API TRANCHE — DEEPER-QUALIFIED AND PERMANENTLY CHECKPOINTED
