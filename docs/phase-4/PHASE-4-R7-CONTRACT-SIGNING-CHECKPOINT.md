# R7 Contract/Signing Qualification Checkpoint

Status: **QUALIFIED — signing lifecycle only**  
Implementation HEAD: `418851257ad119642763502052a2215181500e36`  
Parent: `c3d9b5bb708782b5ed8e8546e4aba4e978fc4ecb`  
Exact-head qualification: [R7 Implementation Qualification #99](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36747447664) — **SUCCESS**  
Date: 30 September 2026

This checkpoint closes the Contract signing lifecycle: an authorized `contract.send`, one exact immutable ContractVersion, a trusted provider adapter, one canonical SignatureRequest, and server-owned reconciliation to `SIGNED`. It does not implement contract preparation or contract read, select a production signature vendor, qualify Invoice mutation, or accept R7. R8 remains locked.

## Ancestry

Signature reconciliation was reconstructed and qualified at `8ba5b5d0abe1a574aefbe0fb1f76cbb2c6b5ccbc` by [run #97](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36710343493) **SUCCESS**. Outbound `contract.send` was qualified at `c3d9b5bb708782b5ed8e8546e4aba4e978fc4ecb` by [run #98](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36745633997) **SUCCESS**. Run #99 qualifies the integrated path and the terminal-retry repair on top of that outbound SHA. The lost local object `3971bf1fedc72330d73f9f3cab331eae788e19e1` is not an ancestor and is not evidence.

## Command contract

`POST /api/v1/r7/contracts/:contractId/send` is an authenticated TEAM command requiring `contract.send`. The body accepts only the exact version id, version number, row version, and document digest. The idempotency key is a header. The route builds trusted contract resource context from the server. Browser input cannot set tenant, provider identity, provider request id, signer keys, lifecycle, or `SIGNED`.

The default outbound provider resolver returns no adapter. An unconfigured provider fails before any signature row is written. A test adapter is passed only by tests. `contract.edit` and `contract.view` stay dormant. Reconciliation is not a human permission and has no browser route. `SIGNED` is written only inside `platform.reconcile_r7_signature_event`, and only from `OUT_FOR_SIGNATURE` after every required signer has verified completion evidence.

An identical retry while the request is `SENT` does not create a second envelope. The same key with a different payload conflicts. A second key for a version that already has a request conflicts. `REQUESTED` with no provider request id stays `PROVIDER_AMBIGUOUS` and is not sent again. A definite provider rejection records `FAILED` and leaves the version `READY_FOR_SIGNATURE`. After the request is `COMPLETED`, `VOID`, or `EXPIRED`, repeating its key returns `INELIGIBLE` and does not call the provider.

## Defect repaired in this HEAD

Run #98 left a fall-through: a repeated send of a `COMPLETED`, `VOID`, or `EXPIRED` request was reported as `PROVIDER_AMBIGUOUS`. That claimed an unknown delivery after the lifecycle was already terminal. Migration `20260930160000_r7_signature_request_terminal_retry` returns `INELIGIBLE` for those statuses. `REQUESTED` without a provider request id remains the only ambiguous result. The hostile tests that exposed the wrong code were kept.

## Hostile evidence

Permanent HTTP tests cover origin, idempotency-key shape, strict rejection of provider, signer, status, and tenant fields, missing-contract concealment, denied `contract.send`, ineligible `DRAFT`, and a happy path that forwards only exact identifiers.

Real PostgreSQL tests, using the send command rather than a hand-seeded `OUT_FOR_SIGNATURE` row, cover:

- one envelope, replay, then both required signers reaching `SIGNED`;
- digest, foreign version, stale row, foreign tenant, empty signer set, and `DRAFT` denied with no envelope;
- definite provider failure and ambiguous outcome, including a later completion event that cannot sign;
- reserve rollback and runtime denial of direct signature and `SIGNED` writes;
- one envelope under concurrent identical sends;
- unbranded events, provider substitution, unknown signers, optional signers that do not complete the set, void, expiry, changed-evidence conflict, and a post-terminal send;
- concurrent completion of both required signers producing one `SIGNED` version.

Inherited reconciliation tests still cover direct attacks on the SQL function. Run #99 executed the unit suite, deterministic seed, isolated R7 finance test, full live PostgreSQL suite, lint, typecheck, and production build on a clean database.

## Boundaries

`contract.edit` preparation commands and `contract.view` reads are not implemented. No production provider is configured, so production send stays fail-closed. Invoice create, edit, issue, and send remain unimplemented. Payment remains locked. This checkpoint does not accept or merge R7 and does not unlock R8.

This file is a documentation HEAD. It requires its own exact-head qualification before Invoice mutation implementation begins.
