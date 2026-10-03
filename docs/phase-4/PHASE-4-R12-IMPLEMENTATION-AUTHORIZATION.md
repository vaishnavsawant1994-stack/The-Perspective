# R12 implementation authorization

STATUS: **IMPLEMENTATION AUTHORIZED**
DATE: 3 October 2026
ACCEPTED G0: `4a12adff04b49efd9d4ad91b6c80dd6ee3a21003`
FROZEN PACKAGE: `78a21b1e3be8554f1212b3f54e7dbc334cfeecff`

The accepted G0 at `4a12adff04b49efd9d4ad91b6c80dd6ee3a21003` authorizes only the following.

## Persistence

Migration `20261003090000_r12_client_member_platform`. Schemas `portal` and `member`. Tables `portal.access_grants`, `member.offers`, `member.checkout_attempts`, `member.profiles`. Partial unique index on active `commercial.entitlements`. Functions `portal.r12_team`, `portal.r12_client`, `portal.r12_member`, `portal.r12_worker`. No edit to an R1–R11 migration. No write to `commercial.subscriptions`.

## Permissions

Activate only: `client.dashboard.view`, `client.project.view`, `client.approval.view`, `client.billing.view`, `client.contract.view`.

Use, without restamping: `client.portal.provision`, `client.portal.manage`, `approval.client.decide`.

Leave dormant: every other `client.*` key, including `client.billing.pay`, `client.contract.sign`, `client.invite.accept`, messages, tasks, assets, notifications, and `client.org.manage`. Add no permission key.

## Commands and HTTP

The operation matrix in `PHASE-4-R12-API-OPERATION-MATRIX.md` is the route list. Worker token `PERSPECTIVE_R12_WORKER_TOKEN`. Checkout stays `PROVIDER_UNAVAILABLE`.

## UI

`/client/desk` and `/my-perspective/library` only. Do not replace fixture client or member screens.

## Qualification

`r12_verified`, forced RLS, runtime without bypass, same-account isolation, entitlement concealment, idempotency, one approval under concurrency, production build, and inherited R3–R11 workflows.

## Not authorized

R13. V1.0. A new payment provider. Design 154. Page 58. Bulk activation of `client.*`.
