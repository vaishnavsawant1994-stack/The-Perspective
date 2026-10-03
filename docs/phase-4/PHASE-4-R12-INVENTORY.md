# R12 inventory

STATUS: **INVENTORY — NOT A FREEZE**
BASELINE: `c6b928d4b159cc66eb768ad10be4a4ef9b1aea7a` (P4-R11-C1, pull request #20)
DATE: 3 October 2026

The bible names R12 as member-platform and client-portal production completion. This inventory records what the repository already owns so R12 does not invent a second commercial, finance, publishing, or identity system.

## Already canonical

| Concern | Where it lives | R12 rule |
|---|---|---|
| Staff and client identity | `iam.user_accounts`, sessions, CLIENT memberships | Reuse. No second password system. |
| Client account | `commercial.client_accounts` | Relationship flags do not provision a portal. R6 proved that. |
| Portal permission vocabulary | `client.portal.provision` (`invite`), `client.portal.manage` (`revoke-access`) | Already active at R6. R12 calls them. It does not add keys. |
| Projects | `production.projects` | Read a coarse client projection. Do not copy the project. |
| Client approval decision | `production.client_approvals` via `production.r8_execute('client-decision')` | Decisions stay APPROVED or REJECTED. Version-bound. |
| Invoices and contracts | `commercial.invoices`, `commercial.contracts` | Client reads a safe projection. No edit, refund, or reconcile. |
| Commercial subscription rows | `commercial.subscriptions` (client-account, R7) | Not member truth. R12 does not write them. |
| Entitlement rows | `commercial.entitlements` | The only entitlement store. |
| Published issues | `production.issues` | Unpublished stays invisible even if an entitlement row exists. |
| Personal Magazines | `production.personal_shelves` | Not the member library. |
| Payments provider | R7 reconciliation, no member checkout provider configured | Fail closed. Do not fake success. |
| Notifications, admin, storage, AI | R13 permission stamps and bible section R13 | Not R12. |

## Missing, and required for the R12 ceiling

- An account-scoped portal grant. Tenant RLS and client-organization membership are not enough when two accounts share an organization.
- Client-safe read models for dashboard, projects, approvals, invoices, and contracts.
- A member profile projection on the existing person.
- A server-priced offer catalogue and a checkout attempt that cannot become active.
- Manual entitlement grant and revoke through a worker token, because no frozen permission key means “grant entitlement”.
- A member library that is the published issues named by active entitlements.

## Explicitly not missing

No new permission key. The frozen registry length stays 131. `client.*` keys stamped R12 stay dormant unless this release activates a named subset.
