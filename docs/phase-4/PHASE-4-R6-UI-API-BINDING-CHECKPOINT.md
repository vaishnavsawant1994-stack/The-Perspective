# R6 UI/API binding checkpoint (final list tranche)

PROJECT: The Perspective
RELEASE: Phase 4 / R6
STEP: Canonical UI/API binding
BRANCH: phase4/r6-crm-commercial-implementation-20260927
QUALIFIED IMPLEMENTATION HEAD: 54bc26221cc3c553f6031579ebd4e53e082c3b2b
QUALIFICATION: R6 Implementation Qualification #279 SUCCESS
PRIOR CHECKPOINT HEAD: 98f6e35e7039131ceebdca1c58f1a23b8e433269 — #274 SUCCESS
PRIOR LIST+HOSTILE HEAD: f515676e3d4d3e0ed70b9bb0e709a26a8cb59228 — #273 SUCCESS

P4-R6-C1: NOT ACCEPTED
MERGE: NOT AUTHORIZED
R7: NOT AUTHORIZED

## Final disposition

| Surface | Disposition |
|---|---|
| Deals | BOUND list GET /api/v1/r6/deals |
| Leads | BOUND list GET /api/v1/r6/leads |
| Companies | BOUND list GET /api/v1/r6/crm/companies |
| Contacts | BOUND list GET /api/v1/r6/crm/contacts |
| Lead lists | BOUND list GET /api/v1/r6/crm/lead-lists |
| Inbox/conversations | BOUND list GET /api/v1/r6/inbox/conversations |
| Meetings | BOUND list GET /api/v1/r6/meetings |
| Outreach/campaigns | BOUND list GET /api/v1/r6/outreach/campaigns |
| Sending accounts | BOUND list GET /api/v1/r6/outreach/sending-accounts |
| UUID detail pages | NONE EXIST — do not invent |
| Mock-slug details | Intentionally unbound |
| Mutations/forms | DISPLAY-ONLY; no UUID-backed form |
| Templates | NO R6 API; unbound |
| Proposals/contracts/invoices/payments/packages | R7; unbound |

## Permanent regressions
- src/modules/r6/ui-uuid-inventory.test.ts — no [id] routes under src/app/app
- src/modules/r6/ui-api-binding.test.ts — bound lists, no Prisma, R7 unbound
- src/modules/r6/ui-browser-hostile.test.ts — mock IDs not submitted; authority fields stripped
- src/app/api/v1/r6/commercial-api-ownership-boundary.test.ts
- src/app/api/v1/r6/commercial-http-hostile-falsification.test.ts

## Architectural conclusion
Canonical R6 UI binding is complete for the UI surface that actually exists.
UUID detail/mutation UI is not a pending implementation requirement.
Leaving mock slugs and display-only controls unbound is the correct R6 result.

NEXT GATE: API/domain/DB concurrency and atomicity falsification. Then A01–A120. Not R7.
