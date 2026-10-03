# R12 client trust boundary

Internal organization state is not client-visible until a client-safe projection says so.

The server builds every client response. React does not hide fields of an internal object.

## Projection allow-list

| Resource | Allowed | Forbidden |
|---|---|---|
| Dashboard | project, approval, and invoice counts | health, manager, margin, notes |
| Project | id, title, coarse status, two milestone kinds | internal state name, proposal id, transition reasons |
| Approval | project id, title, version id, version number, decision | review notes, staff comments |
| Invoice | id, status, currency, total, payment state | draft, provider, allocation, cost |
| Contract | id, status, version | document snapshot, totals, signers’ secrets |

Coarse project status is `OPEN`, `AWAITING_YOU`, `COMPLETE`, or `CANCELLED`.

## Isolation

Filter is owner organization AND client account AND active grant for the authenticated membership.

Same owner organization, two accounts, including two accounts that share one client organization: client A receives not-found for client B’s project, approval, invoice, and contract. The error does not say that the other row exists.

Anonymous, team session on a client route, revoked grant, expired invite, and guessed ids fail closed.

## Invitation token

High entropy, stored as a hash, seven-day expiry, single successful accept, no raw value in audit or logs.
