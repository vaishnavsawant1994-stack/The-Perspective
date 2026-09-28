# R3 / R4 / R5 closure records for R6

EVIDENCE: R6 Implementation Qualification workflow includes frozen-scope,
migrations, unit tests, live PostgreSQL, lint, typecheck, production build,
and dependency audit. Green runs: #256, #258, #265, #271, #273, #274, #279, #281, #283.

## R3 Authentication/session
R6 Team routes use resolveR6TeamRequest. Cross-origin mutations denied (commercial-http-hostile).
R6 does not add login/MFA/recovery routes. Invitation tokens are not commercial authority.
Known limitation: A06/A07 are inherited, not new R6 session-expiry cases.

## R4 Tenant isolation
listAuthorized* and loadR6*Resource filter ownerOrganizationId.
Missing/foreign deals and clients return AUTHZ_NOT_FOUND before domain commands.
Foreign conversion leaves no idempotency receipt (commercial database suite).
UI client strips organizationId. Mock slugs are not bound.

## R5 Authorization
Mutations call authorizeTrustedHttpOperation with deal.edit / deal.move / deal.manage /
client.contact.manage and concealResource on existing resources.
Commercial/CRM/Communications ownership tests keep server/provider commands off browser routes.
Proposal permissions and R7 route trees remain absent.
PROPOSAL_PREPARATION remains the pipeline create ceiling.

R6 did not expand the authorized permission surface in the UI/API binding tranche.
