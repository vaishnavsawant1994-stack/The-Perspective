# Phase 4 R6 Authorization Activation — Post-Falsification Checkpoint

Status: STEP 5 COMPLETE AT THIS BOUNDARY — DEEPER-QUALIFIED AUTHORIZATION CHECKPOINT

## Lineage

- Authorized implementation baseline: `main@2372418d80fa07f633a0e4adc99a21b1f7d8300a`
- Commercial permanent checkpoint: `f17f79fc54b29aa8facbeddd7a2fde71ca1e1855`
- Frozen authorization bindings: `4471d505...`
- Frozen 37-key activation implementation: `cbab5f8adefc72bd18a1c35c1b6c0e0c68e1ead0`
- Initial authorization falsification head: `0e0479df90de26b2d24c82b8f5b14857ea02dd91`
- Deeper authorization falsification head: `0454578838bab0963fcd42f8ac5c971ad60c4468`
- Deeper-qualified authorization implementation checkpoint: `5d59ff0ef08479b834a9ee3f37a99039761f7c2c`

## Frozen activation boundary

Exactly 37 R6 permission keys are active. The four Proposal permission keys remain dormant:

- `proposal.view`
- `proposal.edit`
- `proposal.send`
- `proposal.approve`

`template.manage` remains dormant. No R7+, Design 154, Proposal production, or Step-6 API/provider/UI implementation is authorized by this checkpoint.

## Falsification and repair record

Qualification #114 on `0e0479df90de26b2d24c82b8f5b14857ea02dd91` passed the authorization unit and live PostgreSQL attacks but failed typecheck because production `policy.ts` accessed optional `workflowActions` through a narrower inferred binding union. The binding accessor was normalized to the declared `R6PermissionBinding` interface without weakening authorization behavior.

The subsequent deeper authorization attack head `0454578838bab0963fcd42f8ac5c971ad60c4468` added attacks around forged surfaces and scope laundering. Qualification #116 failed during unit tests, demonstrating real production authorization defects.

The minimal production repair at `5d59ff0ef08479b834a9ee3f37a99039761f7c2c`:

- rejects R6 evaluation when the permission definition is not TEAM / TEAM_ROLE;
- rejects forged non-TEAM membership or tenant surfaces;
- rejects an R6 grant set containing scopes outside the permission definition's permitted scopes;
- preserves the frozen 37-key allowlist and dormant permissions.

## Exact-head qualification

R6 Implementation Qualification #117:

- run: `36325000107`
- job: `108635958746`
- exact implementation SHA: `5d59ff0ef08479b834a9ee3f37a99039761f7c2c`
- conclusion: **SUCCESS**

The exact-head qualification passed:

- frozen R6 scope verification;
- Prisma validation/generation;
- isolated R2-R6 migration replay and verification;
- unit tests, including deeper authorization falsification;
- deterministic inherited fixtures;
- live PostgreSQL tests;
- lint;
- typecheck;
- production build;
- production dependency audit.

## Control state

This checkpoint closes Step 5 at the tested boundary. It does not accept P4-R6-C1, authorize merge to `main`, or authorize R7+.

The next separately sequenced work is Step 6: APIs, authenticated provider/worker boundaries, and binding the approved existing UI to real R6 data. Step 6 must preserve the authorization checkpoint and must not activate Proposal permissions or `template.manage`.
