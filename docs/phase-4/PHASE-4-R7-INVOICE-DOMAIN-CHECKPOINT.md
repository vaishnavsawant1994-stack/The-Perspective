# R7 Invoice Domain Qualification Checkpoint

Status: **QUALIFIED — domain and persistence only**  
Implementation HEAD: `3e14c41024b58cd059dc3a724803956756074d6c`  
Parent: `453ec29678b1bf14fe61e3c8758898ba055b4a9b`  
Exact-head qualification: [R7 Implementation Qualification #101](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36820392501) — **SUCCESS**  
Date: 1 October 2026

This checkpoint closes the Invoice draft and issue domain. It does not expose Invoice mutation HTTP, implement `invoice.send`, start Payment, activate `contract.edit` or `contract.view`, accept R7, or unlock R8. Contract/Signing remains closed at `453ec29678b1bf14fe61e3c8758898ba055b4a9b`.

## Command contract

`createInvoiceDraft` creates one draft from an exact immutable `SIGNED` ContractVersion. The caller supplies the contract id, version id, version number, and an idempotency key. The server copies currency, aggregate tax, and lines from that version. Line totals are recomputed. The line sum must equal the signed version subtotal. Proposal lines are used only because ContractVersion stores aggregate money and not a line table; they must belong to the ACCEPTED immutable proposal version pinned by that contract version. The invoice's only source relationship is the contract version. `proposal_id` is not set.

There is no source-less command and no proposal-direct command. G0 names no transaction type that may invoice from a proposal without a signed contract. `invoice.finalize` is not a permission or a function. `issueInvoice` is the `invoice.issue` command and moves only `DRAFT` → `FINALIZED`. It does not change money, lines, currency, or source.

An identical draft or issue retry does not create a second invoice, envelope, or finalization. A changed payload under the same key conflicts. A second key for the same contract version conflicts. `perspective_runtime` cannot insert or update invoice tables. Finalized financial values and lines cannot be rewritten.

## Hostile evidence

Real PostgreSQL tests cover signed-version copy including aggregate tax, replay, second-key conflict, idempotency mismatch, unsigned versions, foreign tenants, contract/version mismatch, mixed currency, line totals that do not match the signed subtotal, inconsistent line arithmetic, empty lines, duplicate positions, draft rollback with no residue, runtime insert/update denial, concurrent identical creates, and concurrent issue. Stale issue tokens return `STALE_WRITE`. A finalized invoice rejects another issue key. No test was weakened to obtain this result.

## Boundaries

Invoice list/detail HTTP remains the qualified read surface. Invoice create, edit, issue, and send routes are not implemented. Payment remains locked. `contract.edit` and `contract.view` remain dormant. This documentation HEAD requires its own exact-head qualification before Invoice mutation HTTP begins.
