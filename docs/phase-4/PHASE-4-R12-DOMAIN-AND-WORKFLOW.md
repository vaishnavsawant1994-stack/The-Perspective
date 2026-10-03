# R12 domain and workflow

## Personas

| Persona | Identity | Must not be confused with |
|---|---|---|
| Internal team user | STAFF membership on the owner organization | a client |
| Client user | CLIENT membership plus one ACTIVE portal grant for one client account | a staff user or a member |
| Member | authenticated user account | a client account |
| Anonymous | no session | a member |

A client is not an organization member of the publishing team. A member is not a client. A payment is not a subscription. A commercial.subscriptions row is a client-account commercial record and is not a member subscription. An entitlement is not a subscription.

## Client access

Team invite creates `INVITED` with a hash of a high-entropy token, the canonical account, the account’s client organization, and a seven-day expiry. The raw token is returned once to the inviter and is not stored or audited.

Accept requires an authenticated CLIENT membership whose person email matches the grant, the token hash, and an unexpired INVITED row. It becomes ACTIVE and binds that membership. A second accept fails. Revoke makes the grant unusable.

Reads and decisions resolve the grant from the membership. The browser cannot supply `clientAccountId`, `organizationId`, or `membershipId` as authority.

## Approval

The repository decision set is `APPROVED` and `REJECTED`. R12 does not add `CHANGES_REQUESTED`.

A decision is allowed only when the grant’s client account owns the project, the project is `CLIENT_REVIEW`, the version id is the latest draft version, `expectedVersion` matches that number, and an editorial approval already exists. The write is `production.r8_execute('client-decision')`. A later version does not inherit the decision. A wrong account is not found.

## Billing projection

Included for invoices in `FINALIZED`, `PARTIALLY_PAID`, `PAID`, `VOID`, `CREDITED`: id, status, currency, total minor units, derived payment state.

Excluded: drafts, notes, margins, provider ids, allocation internals, proposal ids, contract document snapshots.

Contracts in `READY_FOR_SIGNATURE`, `OUT_FOR_SIGNATURE`, or `SIGNED` expose id, status, and current version only.

R12 billing mutations are view-only. `client.billing.pay` and `client.contract.sign` stay dormant. Refunds, credit notes, and invoice edits stay in finance.

## Member and entitlement

Profile edits the authenticated user’s own display name.

Offers are created by the worker. Price, currency, and entitlement key are columns, never request fields.

Checkout creates a `PROVIDER_UNAVAILABLE` attempt copied from the offer. It never writes `commercial.subscriptions`, never sets an entitlement active, and never accepts browser price, currency, `entitled`, or `premium`.

The only entitlement source in R12 is `MANUAL`, written by the worker for a published or archived issue. Cancellation by the member revokes that entitlement immediately (`active` false, `revoked_at` set). There is no period-end provider cancellation because no provider is configured.

Library and issue reads require the issue state `ISSUE_PUBLISHED` or `ISSUE_ARCHIVED` and an active entitlement whose key is that issue id. Drafts are not found. Another member’s rows are not found.

## Login precedence

Team sessions stay on `/app`. Client sessions use `/client`. A member page does not send a staff user into the client portal and does not send a client into `/app`. Opening a desk grants nothing.

## R13 exclusion

Not in R12: teams and departments administration, settings and integrations, notification delivery, email engine, storage operations, audit tooling, incidents, AI, backup, deployment, and V1.0 certification. Fixture routes for messages, tasks, questionnaires, assets, support, and notifications are not replaced.
