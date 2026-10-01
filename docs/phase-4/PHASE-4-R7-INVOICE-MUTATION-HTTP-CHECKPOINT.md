# R7 Invoice Mutation HTTP Checkpoint

Status: **QUALIFIED — create draft and invoice.issue HTTP only**  
Implementation HEAD: `613e2dd5b53312cb30e6577a0e3b87f006b3eb26`  
Domain checkpoint parent: `fe49654c678b3f093d70dc633b8c359a2caa82c4` (run #102 SUCCESS)  
Domain implementation: `3e14c41024b58cd059dc3a724803956756074d6c` (run #101 SUCCESS)  
Exact-head qualification: [R7 Implementation Qualification #108](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36833739264) — **SUCCESS**  
Date: 1 October 2026

This checkpoint qualifies the HTTP boundary over the already-qualified Invoice domain. It does not implement `invoice.send`, start Payment, activate `contract.edit` or `contract.view`, accept R7, or unlock R8. Contract/Signing remains closed at `453ec29678b1bf14fe61e3c8758898ba055b4a9b`. The Invoice domain was not redesigned.

## Routes

| Route | Permission | Command |
|---|---|---|
| `POST /api/v1/r7/invoices` | `invoice.edit` action `create` | `createInvoiceDraft` |
| `POST /api/v1/r7/invoices/:invoiceId/issue` | `invoice.issue` action `issue` | `issueInvoice` |

There is no draft-field edit route. Field policy `mutableFields` is empty and `createOnlyFields` is only `contractId`, `expectedContractVersionId`, and `expectedContractVersion`. There is no line add, update, remove, or reorder route. Lines remain the immutable source snapshot. There is no `invoice.finalize` permission or route. `invoice.send` is not routed.

## Security chain

Same-origin is checked before the session, matching the other qualified R7 mutation routes. The body is strict Zod. `Idempotency-Key` is required. The caller may send only the contract-version correlation on create, or `expectedRowVersion` and a reason on issue. The server builds the ResourceContext. It does not accept caller organization, resource, status, currency, totals, lines, or obligation flags.

Create authorizes `invoice.edit` on a prospective invoice owned by the selected TEAM tenant, then calls the domain. The domain resolves the SIGNED ContractVersion. HTTP does not select contract rows. `perspective_runtime` still cannot read them.

Issue loads the invoice under the selected tenant, then authorizes `invoice.issue`. Financial evidence is the stored snapshot (source version, ISO currency, subtotal + tax = total, at least one line). Separation of duty is the selected TEAM membership of that owner. The qualified invoice has no creator membership, `proposal_id` stays null, and runtime cannot read contracts, so this checkpoint does not invent a second actor. Workflow is satisfied only while the row is `DRAFT`, except a retry whose stored issue idempotency key matches the request: that retry is allowed through to the domain so a committed issue can replay. A different key on a `FINALIZED` invoice remains a concealed denial. A stale draft version is `409` before the command. Missing `invoice.issue`, missing MFA, or a stale session is concealed as `404` and does not call the command.

## Repairs before qualification

No assertion was weakened.

- Hosted run #103 failed because the stale-session fixture set `mfa_verified_at` after `issued_at`, which violates `sessions_mfa_time_valid`. The fixture now uses one timestamp for both.
- Hosted run #104 failed because every graph reused one client organization. `client_accounts_live_client_org_key` allows one live account per client organization. Each graph now creates its own client organization, as the domain fixture already did.
- Hosted run #105 failed on the same-key issue replay. The first issue had committed `FINALIZED` at row version 2. The HTTP workflow gate then concealed the retry before `issueInvoice` could replay it. A matching stored issue key now reaches the domain. A different key on a finalized invoice stays concealed.

## Hostile evidence

Mocked HTTP tests cover origin, malformed keys and ids, protected-field injection, anonymous and unselected sessions, permission denial, foreign concealment, command arguments, conflicts, stale drafts, and missing evidence. Real PostgreSQL HTTP tests cover create with server totals, replay, a second key, forged money, anonymous and bad sessions, missing tenant, viewer denial, cross-origin, foreign contract concealment, idempotency mismatch with no second row, unsigned rollback with no row, editor denial, stale version, missing MFA, stale session, issue, replay, a new issue key, foreign issue, runtime update denial, and concurrent create and issue. The exact-head workflow passed unit tests, migrations, the full live PostgreSQL suite, lint, typecheck, and production build.

## What is not qualified

`invoice.send` is not started. Payment and reconciliation HTTP are not started. `contract.edit` and `contract.view` stay dormant. R7 is not ACCEPTED and not MERGED. R8 stays locked.

The next authorized R7 tranche is Payment. It is not started.

This documentation HEAD requires its own exact-head qualification before it is the documentation checkpoint.
