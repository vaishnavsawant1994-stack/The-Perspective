# P4-R6-C1 — QUALIFIED CANDIDATE / OWNER ACCEPTANCE PENDING

PROJECT: The Perspective
RELEASE: Phase 4 / R6
STATUS: QUALIFIED CANDIDATE — NOT ACCEPTED — NOT MERGED
R7: LOCKED
CEILING: PROPOSAL_PREPARATION

## References
- Frozen G0 contract (program record): 730d2280…
- Accepted main (R1–R5): 2372418d80fa07f633a0e4adc99a21b1f7d8300a
- Implementation anchor: 54bc26221cc3c553f6031579ebd4e53e082c3b2b (#279)
- A01–A120 matrix: 6ba76113f3dbea5d180c251ff95d88dc9cb4b43a (#283)
- This package advances HEAD; requalify the resulting SHA before treating the package itself as exact-head-qualified.

## Checkpoints
- CRM / Communications / Commercial API (prior R6 checkpoints + #258 commercial hostile)
- UI/API binding: PHASE-4-R6-UI-API-BINDING-CHECKPOINT.md
- Concurrency: PHASE-4-R6-CONCURRENCY-ATOMICITY-CHECKPOINT.md
- Pre-A01 baseline: PHASE-4-R6-PRE-A01-BASELINE.md
- A01–A120: PHASE-4-R6-A01-A120-MATRIX.md + CHECKPOINT.md (gaps disclosed)
- R3/R4/R5: PHASE-4-R6-R3-R4-R5-CLOSURE.md

## What R6 implemented
CRM, Communications, Commercial through PROPOSAL_PREPARATION.
Qualified HTTP surfaces. List UI bound to those surfaces.
No UUID Team Workspace detail routes. Mock slugs unbound. R7 pages unbound.

## Explicit R7 exclusions
No production Proposal/Contract/Invoice/Payment/Subscription/Entitlement APIs or bindings.

## Known limitations (owner must see)
A01 has no standalone unauthenticated deals-list test.
No dedicated cross-pipeline stage-jump HTTP case.
A06/A07 session expiry are inherited R3 evidence.
A01–A120 is an evidence matrix over existing tests, not 120 new hostile files.

## Qualification runs (selected)
#243 Communications checkpoint era; #256 query restore; #258 commercial hostile;
#265/#271/#273/#274/#279 UI binding; #281 concurrency docs; #283 A01–A120 matrix.

## Decision required
OWNER ACCEPTANCE to authorize merge of the qualified R6 branch to main.
Do not start R7. Do not treat this document as merge authorization.
