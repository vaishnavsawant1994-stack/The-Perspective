# R13 security and qualification

STATUS: **G0**
DATE: 3 October 2026

## Falsification answers

| Question | Answer in this contract |
|---|---|
| Can a user self-promote? | No R13 role command exists |
| Can an admin cross tenants? | Tenant comes from the session. Body organization id is rejected |
| Can a client enter admin? | TEAM surface required |
| Can browser data mark an integration verified? | `VERIFIED` is not a stored state. `verified` is a forbidden field |
| Can browser data mark email delivered? | No delivery command |
| Can a storage key escape? | No storage key |
| Can audit records be edited? | No new audit mutation privilege |
| Can a worker gain universal authority? | No R13 worker |
| Can duplicate workers double-execute? | No worker. Declare is unique per type |
| Can AI gain authority? | AI is out of scope |
| Can secrets appear? | No secret column or response field |
| Can provider failure leave a verified row? | Verify does not change state |
| Can R13 claim V1.0? | No |

## Qualification

GitHub Actions, `ubuntu-latest`, `postgres:16`. Workflow `r13-implementation-qualification.yml` runs migrate, `db:verify` including `r13_verified`, drift, unit tests, seed, `test:db`, lint, typecheck, production build, and `npm audit --omit=dev --audit-level=high`, plus an operations desk job on `npm start`. This is hosted qualification, not a production deployment.

Hostile tests cover anonymous access, client session, cross-origin, forbidden authority fields, missing MFA, foreign organization behavior through the session tenant, idempotency conflict, stale version, and runtime INSERT denial.
