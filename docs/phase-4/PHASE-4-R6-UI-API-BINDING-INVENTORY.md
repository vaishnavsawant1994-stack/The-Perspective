# R6 UI/API binding inventory

BRANCH: phase4/r6-crm-commercial-implementation-20260927
CANDIDATE: ac8cdf236be448d26e60f851ad4905a5ee9ea822
QUALIFICATION: #271 SUCCESS
P4-R6-C1: NOT ACCEPTED
MERGE: NOT AUTHORIZED
R7: LOCKED

## Classification

| Screen | Class | Endpoint / note |
|---|---|---|
| /app/deals | BOUND | GET /api/v1/r6/deals |
| /app/sales/leads | BOUND | GET /api/v1/r6/leads |
| /app/inbox | BOUND | GET /api/v1/r6/inbox/conversations |
| /app/meetings | BOUND | GET /api/v1/r6/meetings |
| /app/outreach | BOUND | GET /api/v1/r6/outreach/campaigns |
| /app/outreach/sending-accounts | BOUND | GET /api/v1/r6/outreach/sending-accounts |
| Pipelines list helper | BINDABLE | GET /api/v1/r6/commercial/pipelines — no dedicated list page |
| Clients list helper | BINDABLE | GET /api/v1/r6/clients — no dedicated list page |
| Sequences list helper | BINDABLE | GET /api/v1/r6/outreach/sequences — no dedicated list page |
| /app/deals/[slug] | MOCK-ID | nextpay-personal-magazine-q2, technova-* |
| /app/clients/nextpay-technologies | MOCK-ID | do not bind |
| /app/outreach/sequences/personal-magazine-q2 | MOCK-ID | do not bind |
| /app/outreach/campaigns/tech-leaders-q2 | MOCK-ID | do not bind |
| /app/deals/proposals | R7+ | unbound |
| /app/commercial/contracts | R7+ | unbound |
| /app/commercial/invoices | R7+ | unbound |
| /app/commercial/payments | R7+ | unbound |
| /app/commercial/packages | R7+ | unbound |
| /app/outreach/templates | NO CANONICAL API | template.manage dormant |

## Hard rule
No real UUID in the route → no production binding.
No new APIs for NO CANONICAL API screens.

## Mutations
Authorized APIs exist for deal update/move/convert and client relationships.
No bound Team Workspace form currently submits a real UUID.
Those controls stay DISPLAY-ONLY until a UUID-backed detail surface exists.
