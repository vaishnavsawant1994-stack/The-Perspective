# R13 G0 freeze

STATUS: **R13 G0 FROZEN — IMPLEMENTATION NOT AUTHORIZED**
DATE: 3 October 2026
BASELINE: `8717ad284ef65bbd8105bb5f5849184d9306896a`

This freeze is the R13 contract. It does not authorize implementation.

## In

- Activate `settings.manage` and `integration.manage` only. No new permission key. Registry length stays 131.
- Migration `20261003130000_r13_enterprise_operations`.
- Typed organization preferences and integration declarations as specified in the database and API contracts.
- UI only at `/app/operations/desk`.

## Out

Teams, departments, invitations, audit viewing, incidents, notifications, email delivery, storage uploads, AI, workers, backups, deployment, and V1.0 certification. Design 154 is not authorized. R14 is not started.

`PHASE-4-R13-AI-TRUST-BOUNDARY.md` is intentionally absent. AI is not in scope, so there is no AI contract to implement.

## R14 boundary

R14 remains production hardening and V1.0.0 certification. It requires genuine external independent review. The owner-approved enhanced qualification waiver cannot certify R14. This freeze does not waive that review and does not certify production readiness.
