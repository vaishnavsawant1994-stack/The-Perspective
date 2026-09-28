# R6 Commercial API permanent checkpoint

PROJECT: The Perspective
RELEASE: Phase 4 / R6
STEP: Commercial HTTP/API
TRANCHE: human-owned Commercial API
BRANCH: phase4/r6-crm-commercial-implementation-20260927
QUALIFIED IMPLEMENTATION HEAD: 5b49cbc5c189cee41a9e04bda5dc01a6af92125b
PARENT: b34d6e0a7e48d1e81af04329a81ff1a1a26bd59e
QUERY-SURFACE RECOVERY HEAD: 38d2a8ce1b0b062830121a65afcb3e2401b152de
LAST QUALIFICATION: R6 Implementation Qualification #258 — SUCCESS

## Evidence chain
- 38d2a8ce1b0b062830121a65afcb3e2401b152de — restored full queries.ts without CommercialDealStage archivedAt; #256 SUCCESS.
- b34d6e0a7e48d1e81af04329a81ff1a1a26bd59e — Commercial ownership/R7-ceiling inventory tests.
- 5b49cbc5c189cee41a9e04bda5dc01a6af92125b — Commercial HTTP hostile falsification; #258 SUCCESS.

## Human/browser-owned routes
Pipelines: GET/POST `/api/v1/r6/commercial/pipelines`.
Deals: GET/POST `/api/v1/r6/deals`, GET/PATCH `/api/v1/r6/deals/[dealId]`, POST move, POST convert-to-client.
Clients: GET `/api/v1/r6/clients`, GET `/api/v1/r6/clients/[clientAccountId]`, GET/POST relationships.

Mutations use same-origin enforcement, selected-team request resolution, trusted tenant-constrained resource loaders, and canonical authorization before the domain command.

## Ownership matrix
Browser-owned commands: createDealPipeline, createDeal, updateDealFields, moveDeal, convertDealToClient, addClientRelationship, plus authorized list/get projections.
Server-owned: ResourceContext construction, tenant claims, pipeline/stage membership, row versions, conversion idempotency.
Dormant/R7/prohibited: createProposal, sendProposal, approveProposal, createContract, createInvoice, createPayment, createSubscription, createEntitlement, proposal.* keys, WON/PROPOSAL_SENT/CONTRACT_SIGNED canonical classes.

## Ceiling
Latest forward commercial class on pipeline create remains PROPOSAL_PREPARATION.
No proposal/contract/invoice/payment/subscription/entitlement route trees exist under src/app/api/v1/r6.

## Hostile cases retained
cross-origin deal create denied before domain mutation;
missing deal concealed before move and convert-to-client;
missing client concealed before relationship create;
stale deal field write mapped to 409;
ownerOrganizationId/ownerMembershipId/stageId mass-assignment rejected;
malformed deal IDs rejected before resource load;
WON rejected as a pipeline canonical class.

FAILURES: none on #258.
PRODUCTION DEFECTS: none demonstrated by the Commercial hostile suite.
LOCKED SCOPE: remaining canonical UI/API binding, A01-A120 whole-R6 falsification, P4-R6-C1, merge, and R7 remain locked.
NEXT GATE: remaining R6 canonical UI/API binding against this checkpoint head. Green CI is evidence, not R6 acceptance.

COMMERCIAL API TRANCHE — HOSTILE-FALSIFIED AND PERMANENTLY CHECKPOINTED
P4-R6-C1: NOT ACCEPTED
MERGE: NOT AUTHORIZED
R7: NOT AUTHORIZED
