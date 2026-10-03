# R13 G0 acceptance

STATUS: **P4-R13-G0 ACCEPTED**
DATE: 3 October 2026
FROZEN PACKAGE: `cdc4e8518a34a4787ac5268b9f7798fe25d1d25a`
BASELINE: `8717ad284ef65bbd8105bb5f5849184d9306896a`

The frozen package in `docs/phase-4/PHASE-4-R13-G0-FREEZE.md` at `cdc4e8518a34a4787ac5268b9f7798fe25d1d25a` is the accepted R13 contract.

Activated permissions, if a later authorization says so: `settings.manage` and `integration.manage` only. Migration name: `20261003130000_r13_enterprise_operations`. Routes: the six `/api/v1/r13` operations in the API matrix, and `/app/operations/desk`. No worker. No provider. No AI file.

This acceptance does not authorize implementation. It does not certify V1.0, production readiness, backup, or external review. R14 stays locked.

Excluded: teams, notifications, storage operations, incident tooling, and AI.
