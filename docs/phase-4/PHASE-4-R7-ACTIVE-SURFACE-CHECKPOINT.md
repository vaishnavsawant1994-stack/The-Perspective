# R7 Active Surface Checkpoint

Status: **QUALIFIED — active R7 commands and reads only**  
Implementation HEAD: `d799496010e5346bae953f951c7cc4c559347c17`  
Parent: `6e911df82283575116666fd777e5066046ea6a08`  
Exact-head qualification: [R7 Implementation Qualification #112](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36839853912) — **SUCCESS**  
Date: 1 October 2026

This checkpoint closes the remaining active R7 HTTP surface. It does not accept R7, merge it, activate a dormant permission, or unlock R8.

## What this SHA adds

`POST /api/v1/r7/invoices/:invoiceId/send` calls `sendInvoice` under `invoice.send`. The body may contain only `expectedRowVersion`. A `FINALIZED`, `PARTIALLY_PAID`, or `PAID` invoice gets one outbox delivery intent. The same key replays. A changed payload conflicts. The command does not change status, money, source, or row version. Draft, void, and credited invoices are not deliverable. `delivery: QUEUED` is not proof that email was sent.

`GET /api/v1/r7/payments` and `GET /api/v1/r7/payments/:paymentId` project `id`, `status`, `currency`, `amountMinor`, and `provider` for `payment.view`. Missing, foreign, and unauthorized payments are concealed. There is no payment mutation route.

## Active surface already qualified before this SHA

Proposal list, create, edit, send, and customer acceptance. Contract signature request and verified reconciliation, with no production signature adapter. Invoice list, draft creation, and `invoice.issue`. Provider payment reconciliation, with no production payment adapter and no browser command that sets `SUCCEEDED` or `PAID`.

## Still closed

`contract.edit` and `contract.view` stay dormant. `payment.refund` stays dormant: no refund command and no reversing ledger entry. `package.manage` stays dormant. `subscription.view`, `subscription.manage`, `entitlement.view`, and `catalogue.manage` are not registry keys and are not implemented. There is no payment or signature webhook HTTP route. Production provider resolution still fails closed.

R7 is not ACCEPTED and not MERGED. R8 stays locked.

This documentation HEAD requires its own exact-head qualification.
