# R12 member and entitlement contract

## Identity

Member identity is `iam.user_accounts`. There is no member password table and no `MEMBER` authentication surface. A session that resolves to a user is the member. Tenant staff authority is not member authority.

## What is not a member subscription

`commercial.subscriptions` remains the R7 client-account table. R12 does not insert, update, or reinterpret it.

No trusted member payment provider is configured. Checkout therefore cannot make a subscription active. `PROVIDER_UNAVAILABLE` is the only checkout outcome for an open offer. Closed or unknown offers are not found. Forged provider success does not exist as a route.

## Entitlement

Table: `commercial.entitlements`.

| Field | Rule |
|---|---|
| subject_type | `USER` |
| subject_id | user account id |
| entitlement_key | published issue id |
| source_type | `MANUAL` |
| source_id | worker audit id |
| active / revoked_at | revoke clears access immediately |

The browser cannot submit `entitled` or `premium`. The worker token is the only grant path. The member may cancel only their own active manual entitlement.

Order for a read: resolve the user, require a published or archived issue, require a live entitlement, then return slug and title. A draft with an entitlement row is still not found.

## Library

The library is that read. It is not `production.personal_shelves` and it does not list public issues the member has not been granted.

## Profile

Display name is the person’s display name. The command updates only the authenticated user. It does not change email, password, or membership.
