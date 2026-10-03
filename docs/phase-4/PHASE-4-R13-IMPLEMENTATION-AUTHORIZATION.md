# R13 implementation authorization

STATUS: **R13 IMPLEMENTATION AUTHORIZED**
DATE: 3 October 2026
ACCEPTED G0: `560937214f293ae798011a26862cf321ebf84c1f`
FROZEN PACKAGE: `cdc4e8518a34a4787ac5268b9f7798fe25d1d25a`

Implementation may begin only for the accepted G0 contract.

- Migration `20261003130000_r13_enterprise_operations`
- Activate `settings.manage` and `integration.manage`. Do not add a permission key.
- APIs under `/api/v1/r13` listed in `PHASE-4-R13-API-OPERATION-MATRIX.md`
- UI only at `/app/operations/desk`
- No worker token, no provider success, no secret storage
- No team, notification, storage, incident, or AI implementation
- No R14 work and no V1.0 certification

Qualification is the R13 workflow plus the inherited R3–R12 workflows on the same product head.
