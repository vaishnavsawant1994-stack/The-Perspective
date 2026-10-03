# R12 security and qualification

## Hostile cases the implementation must fail closed

Anonymous client and member reads. Team cookie on a client route. Client A against client B in the same owner organization and the same client organization. Guessed project, approval, invoice, and entitlement ids. `clientAccountId` or `organizationId` in a client or member body. Forged `entitled`, `premium`, `amount`, or `currency`. Approval of a version that is not current. Replayed decision and changed-payload replay. Expired and revoked invites. Token reuse. Draft issue with an entitlement. Member A against member B. Checkout that tries to set a subscription active. Worker call without the bearer token. Direct runtime INSERT on `portal.access_grants`.

Concealment is not-found. Responses do not explain that another client owns the row.

## Database

PostgreSQL 16. Full migration chain. `r12_verified` true only from `verify.sql`. `runtime_bypass_rls` false. Drift none. Two-session approval produces one decision. Idempotency replay and conflict. A rejected command leaves no grant and no approval.

## Browser

`/client/desk`: anonymous redirect to `/client/login`, mobile and desktop overflow at most 1, keyboard focus, empty or real server counts, no fake project. `/my-perspective/library`: signed-out state has no library item; a member sees only server-returned issues; checkout control does not send a price.

## Inherited

R3 through R11 qualification workflows stay required on the product head. R1 and R2 have no separate current workflow.

## Not claimed

Hosted production beyond GitHub Actions. V1.0. A live payment provider. Activation of every `client.*` key.
