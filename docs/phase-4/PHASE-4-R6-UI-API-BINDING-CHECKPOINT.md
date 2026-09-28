# R6 UI/API binding checkpoint

PROJECT: The Perspective
RELEASE: Phase 4 / R6
STEP: Canonical UI/API binding (list tranche)
BRANCH: phase4/r6-crm-commercial-implementation-20260927
QUALIFIED HEAD: f515676e3d4d3e0ed70b9bb0e709a26a8cb59228
PARENT: 9ba77ce5654441b515a463d192f837820028ae0f
QUALIFICATION: R6 Implementation Qualification #273 SUCCESS
PRIOR LIST BINDING: ac8cdf236be448d26e60f851ad4905a5ee9ea822 — #271 SUCCESS

P4-R6-C1: NOT ACCEPTED
MERGE: NOT AUTHORIZED
R7: NOT AUTHORIZED

## Bound list screens
- /app/deals → GET /api/v1/r6/deals
- /app/sales/leads → GET /api/v1/r6/leads
- /app/inbox → GET /api/v1/r6/inbox/conversations
- /app/meetings → GET /api/v1/r6/meetings
- /app/outreach → GET /api/v1/r6/outreach/campaigns
- /app/outreach/sending-accounts → GET /api/v1/r6/outreach/sending-accounts

Binding path: page → r6-bound-lists → ui-client (same-origin, no tenant fields) → /api/v1/r6/* → session/selected org → authorization → qualified query.
No page or bound wrapper imports Prisma.

## Intentionally unbound
MOCK-ID: nextpay-*, technova-*, personal-magazine-q2, tech-leaders-q2.
R7+: proposals, contracts, invoices, payments, packages, subscriptions, entitlements.
NO CANONICAL API: outreach templates (template.manage dormant).
BINDABLE helpers without a list page: pipelines, clients, sequences.

## Mutations
Deal update/move/convert and client-relationship APIs exist.
No Team Workspace form submits a real UUID yet.
Those controls remain DISPLAY-ONLY.

## Hostile evidence retained
commercial-http-hostile-falsification.test.ts
commercial-api-ownership-boundary.test.ts
ui-api-binding.test.ts
ui-browser-hostile.test.ts

Proved at this tranche: mock slugs not sent to APIs; UI client strips ownerOrganizationId/organizationId/permissionKey/resourceContext; R7 HTTP paths absent from binding client; R7 pages remain unbound.
Server authorization remains the security boundary. ui-client stripping is defense-in-depth only.

## Not yet in this checkpoint
UUID detail binding, mutation form binding, concurrency/idempotency DB attacks, A01–A120, R3/R4/R5 regressions, P4-R6-C1.

NEXT GATE: concurrency/idempotency attacks against already-qualified Commercial/CRM/Communications APIs, then A01–A120. Do not invent UUID UI. Do not start R7.
