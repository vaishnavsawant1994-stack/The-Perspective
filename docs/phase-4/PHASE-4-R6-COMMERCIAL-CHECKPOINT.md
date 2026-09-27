# Phase 4 R6 Commercial Core — Deeper-Qualified Checkpoint

Status: STEP 4 COMPLETE AT THIS BOUNDARY — DEEPER-QUALIFIED COMMERCIAL CHECKPOINT

## Lineage

- Frozen P4-R6-G0 contract: `730d2280fafe29c756ba7e0b09ff7e8e5c9496a6`
- Authorized implementation baseline: `main@2372418d80fa07f633a0e4adc99a21b1f7d8300a`
- CRM deeper-qualified checkpoint: `6fb17b35696c41d866d885ee160b20c64f20687a`
- Communications deeper-qualified implementation checkpoint: `1b848b26fe42a4ea1c4afd619f5622402e641f06`
- Communications permanent checkpoint: `973e5832aebc654a48f1325cc14eeafa248a86bf`
- Normal Commercial green checkpoint: `79d83ba3892562b7a2cf02dd90b8c4eee50a05e0`
- Deeper Commercial attack head: `a24f26f1cc22c00cce0bc7977b814bafc9f1e992`
- Deeper-qualified Commercial implementation checkpoint: `7d0ae14554fb37f1b824568427e3a25e7a44101e`

## Implemented Step-4 scope

Only frozen R6 Commercial responsibilities are implemented:

- deal pipelines and R6-owned deal stages;
- deals and immutable stage history;
- atomic/idempotent lead-to-deal conversion;
- client-account and client-relationship foundation;
- atomic/idempotent deal-to-client conversion;
- lifecycle progression through the hard R6 ceiling `PROPOSAL_PREPARATION`;
- tenant-aware relationships, RLS/resource-envelope controls, optimistic concurrency,
  conversion idempotency, and rollback guarantees.

No R5→R6 permission activation is part of this checkpoint.

## Hard R6 ceiling

`PROPOSAL_PREPARATION` remains the maximum active R6 deal progression.

The Step-4 implementation does not create or activate Proposal records, proposal
versions/sending/acceptance, Products, Packages, Contracts, Signatures, Invoices,
Payments, Subscriptions, or Entitlements. Proposal production remains R7-owned.
`template.manage` remains dormant.

## Deeper falsification

The dedicated Commercial attack suite exercised, among other boundaries:

- cross-tenant pipeline/stage/deal/company/contact/lead/client relationships;
- resource-envelope rollback after rejected relationships;
- forged owner/client/account-manager authority inputs;
- R7-owned stage-class rejection;
- illegal/skipped/backward lifecycle movement;
- discovery and `PROPOSAL_PREPARATION` entry guards;
- stale writes and optimistic concurrency;
- lead-to-deal replay and concurrent conversion;
- client-account duplicate/concurrent conversion;
- foreign and archived targets;
- canonical CLIENT identity reuse;
- IAM/portal non-escalation;
- immutable deal-stage history;
- late transaction conflicts and zero partial conversion/evidence residue;
- physical absence of R7 Commercial truth.

### Demonstrated production defect

Qualification #105 on `a24f26f1cc22c00cce0bc7977b814bafc9f1e992`
demonstrated that the restricted runtime role could rewrite used deal-stage
semantics and pipeline version semantics after deals/history depended on them.

The minimal production repair added database guards that keep unused definitions
editable but make used stage semantics and used pipeline name/version semantics
immutable. The migration verifier asserts that both guards exist.

### Separate regression defect

After the Commercial repair passed the live database attacks, inherited CRM
suppression concurrency exposed a separate error-normalization gap: raw PostgreSQL
serialization/deadlock SQLSTATEs could escape rather than normalize to the
existing `CONFLICT` result. The minimal repair maps `40001` and `40P01` to
`CONFLICT` without changing suppression lifecycle semantics.

A typecheck-only test-helper issue involving a `string[]` PostgreSQL
`ANY(...)` parameter was also repaired and is classified as test/harness typing,
not a production security defect.

## Exact-head qualification

R6 Implementation Qualification #110:

- run: `36322868598`
- job: `108629948820`
- exact implementation SHA: `7d0ae14554fb37f1b824568427e3a25e7a44101e`
- conclusion: **SUCCESS**

The exact-head chain passed:

- frozen R6 scope verification;
- Prisma validation/generation;
- isolated R2-R6 migration replay and verification;
- unit tests;
- deterministic inherited seed;
- live PostgreSQL tests, including the deeper Commercial attacks and inherited
  CRM/Communications regressions;
- lint;
- typecheck;
- production build;
- production dependency audit.

## Control state

This record establishes the deeper-qualified Step-4 Commercial implementation
checkpoint. It does not authorize R7+, Design 154, V1.0 certification, merge, or
P4-R6-C1 acceptance.

Step 5 remains the separately sequenced R5→R6 authorization-integration tranche:
only the frozen 37-key active R6 subset may be activated, with explicit
action/resource/field/workflow bindings. The four Proposal permissions and
`template.manage` remain dormant.
