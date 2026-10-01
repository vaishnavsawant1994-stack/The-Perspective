# R7 Payment Reconciliation Qualification Checkpoint

Status: **QUALIFIED — provider reconciliation domain only**  
Implementation HEAD: `4f8fec78a087d6960076980b7e206dfe7dba6599`  
Parent: `e0b40ac3286de71ac25e64d20b3edcb2decd12de`  
Exact-head qualification: [R7 Implementation Qualification #110](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36835804193) — **SUCCESS**  
Date: 1 October 2026

This checkpoint closes server-owned reconciliation of a verified payment-provider event. It does not add Payment HTTP, `payment.view` routes, refunds, `invoice.send`, or a browser command that sets `PAID` or `SUCCEEDED`. `payment.refund` stays dormant. R7 is not accepted or merged. R8 stays locked.

## Command contract

`reconcileVerifiedPaymentEvent` accepts only an adapter-branded event. The default provider resolver returns nothing. A caller-supplied payload is `UNVERIFIED_EVENT` before any database call.

`PAYMENT_SUCCEEDED` allocates against one exact tenant invoice that is `FINALIZED` or `PARTIALLY_PAID`. Currency must match. The amount must be a positive integer minor unit and must not exceed the remaining balance. The invoice becomes `PARTIALLY_PAID` or `PAID` in the same transaction as the `SUCCEEDED` payment and one append-only `PAYMENT` ledger entry. `PAYMENT_FAILED` and `PAYMENT_CANCELED` record the provider outcome and do not move money.

The same provider and provider event id replays. A reused id with different evidence conflicts and does not change allocation. `perspective_runtime` may still insert a `CREATED` placeholder with no provider event. It cannot write `SUCCEEDED`, `FAILED`, `CANCELED`, invoice `PAID`, or ledger rows.

## Hostile evidence

Real PostgreSQL tests cover partial then exact allocation, replay, changed evidence, over-allocation, foreign-tenant concealment, draft rejection, currency mismatch, a failed event with no ledger entry, runtime denial, and concurrent delivery of the same succeeded event. No assertion was weakened.

## Boundaries

Payment list/detail HTTP is not implemented. There is no reconciliation route and no human `payment.reconcile` invocation in this slice. Provider truth is not browser input. Refunds and reversing ledger entries are not implemented. `invoice.send` remains unrouted. `contract.edit` and `contract.view` stay dormant.

This documentation HEAD requires its own exact-head qualification before any Payment HTTP or refund slice begins.
