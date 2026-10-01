# R7 Completion Record

Status: **AUTHORIZED ACTIVE SURFACE COMPLETE AND QUALIFIED**  
Release gate: **OWNER ACCEPTANCE RECORDED — MERGE PENDING**  
Date: 1 October 2026

This record freezes the final R7 implementation state. It does not add a command, activate a dormant permission, configure a provider, or unlock R8.

## Reviewed authority

| Fact | Value |
|---|---|
| Branch | `phase4/r7-g0-commercial-finance-freeze-20260928` |
| Exact remote HEAD at review | `fbd1bc3aea82ad8179d135a2d8de91881237430d` |
| Local HEAD at review | same SHA; working tree clean |
| Qualification | [R7 Implementation Qualification #113](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36840331864) — **SUCCESS** |
| Qualified commit subject | `docs(r7): record the qualified active R7 surface` |
| Implementation parent | `d799496010e5346bae953f951c7cc4c559347c17` — run #112 SUCCESS |
| Release base | `main` at review was `9df33ea18f0eb9c074bcfeb561cb8cf34bfb7ca5` |

No uncommitted or unqualified candidate is R7 authority. This documentation package advances HEAD past `fbd1bc3`. It is not itself the implementation qualification. Merge waits until this package passes its own exact-head qualification.

## Implemented and qualified active commands

| Surface | Boundary | Authority |
|---|---|---|
| Proposal list and detail | `proposal.view` | run #48, later whole-proposal #85 / #86 |
| Proposal create | `proposal.edit` | run #67 |
| Proposal edit | `proposal.edit` | run #76 |
| Proposal send | `proposal.send` | run #80. `delivery: QUEUED` is not sent email |
| Proposal acceptance | `proposal.accept` | run #83. Authenticated CLIENT membership only |
| Contract signature request | `contract.send` | run #99 at `418851257ad119642763502052a2215181500e36` |
| Signature reconciliation | server/provider only | same SHA. No browser route. Default adapter trusts nobody |
| Invoice list and detail | `invoice.view` | run #87 |
| Invoice draft | `invoice.edit` | run #101 domain, run #108 HTTP. Source is one SIGNED ContractVersion |
| Invoice issue | `invoice.issue` | run #108. DRAFT → FINALIZED only. No `invoice.finalize` |
| Invoice send | `invoice.send` | run #112. Outbox intent only. No money or status change |
| Payment reconciliation | server/provider only | run #110 at `4f8fec78a087d6960076980b7e206dfe7dba6599` |
| Payment list and detail | `payment.view` | run #112. No payment mutation route |

The active HTTP and domain chain is Proposal → signature request and verified reconciliation → Invoice draft, issue, and send → verified payment reconciliation and payment read.

## Intentionally dormant

These were named by G0 and then frozen out of the active implementation. This closure does not build them.

| Item | Boundary |
|---|---|
| `contract.edit`, `contract.view` | No contract preparation command and no contract read route. The browser cannot set SIGNED. |
| `payment.refund` | No refund command and no reversing ledger entry. |
| `package.manage` | Dormant. No package command. |
| `catalogue.manage` | Not a registry key. |
| `subscription.view`, `subscription.manage` | Not active. The subscription table is not a lifecycle. |
| `entitlement.view` | Not active. An entitlement row is not access control. |
| CreditNote | Named by G0 as the correction path for a finalized invoice. No credit-note command was authorized or built. |

## Provider capabilities that fail closed

No production signature provider is selected. No production payment provider is selected. The default resolvers trust nobody. There is no signature webhook route and no payment webhook route. Deterministic adapters exist only for tests. A missing production provider is not an implementation defect under the frozen fail-closed contract.

## Queued or deferred infrastructure

`proposal.send` and `invoice.send` write one idempotent outbox delivery intent. Neither sends email. `delivery: QUEUED` is not proof of delivery. There is no worker in this release that drains that outbox to a mailbox.

Browser `payment.reconcile` is intentionally absent. `SUCCEEDED` and `PAID` come only from verified, correlated provider evidence inside `reconcileVerifiedPaymentEvent`.

## Known non-goals

- No source-less invoice and no proposal-direct invoice. G0 names no transaction type that may skip a signed contract.
- No draft-field invoice edit, no invoice line mutation, and no `invoice.finalize` permission or route.
- No second payment allocation. Reconciliation is the only allocation path, and it cannot exceed the remaining finalized balance.
- No general ledger product beyond the append-only entry written for a succeeded payment.
- No checkout session and no browser command that marks an invoice paid.
- No catalogue versioning, subscription lifecycle, or entitlement enforcement.
- R6 routes are not expanded for these resources.

## R8 exclusions

R8 stays locked until this acceptance is merged. Projects, workflow, tasks, questionnaires, deliverables, editorial drafts, reviews, assets, client production, magazine publishing, media, search, and portal completion are outside R7. This record does not start them.

## Release gate

Owner acceptance of this qualified active surface is `PHASE-4-P4-R7-C1.md`. Merge into `main` is authorized only after the closure commit that contains that acceptance passes exact-head R7 qualification. Until that merge commit exists, R7 is accepted on this branch and not merged.
