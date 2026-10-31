# V1 production readiness

**STATUS: PRODUCTION DEPLOYED — V1.0 NOT CERTIFIED**

**Current source:** `main@9c266451fbc5c07788993ba453c5a9997e5453cf`
**Current Vercel deployment:** `dpl_5Rw3qraVtUBARXZtSRfRAPwKP69h` (`READY`, production, Node.js 24, `fra1`)

This file is a concise entry point. The dated [current-state reconciliation](./CURRENT-STATE-RECONCILIATION-2026-10-31.md) holds the exact current evidence and supersedes earlier readiness snapshots below.

| Gate | Current state |
| --- | --- |
| Application host | Vercel production deployment exists and matches current `main` SHA |
| Database host | Neon PostgreSQL 16 project exists in Frankfurt; production readiness endpoint returned HTTP 200 |
| Domain and TLS | Production Vercel aliases are active; details are in the current reconciliation |
| Runtime parity | Production uses Node.js 24; PR #34 was qualified on Node.js 24 |
| Public health | `/api/health/live` and `/api/health/ready` returned HTTP 200 on 31 October 2026 |
| Positive production authentication and tenancy | Not qualified; legitimate production identities and memberships are not present per the current handoff |
| Automatic backup schedule | Not configured; current Neon schedule query returned an empty schedule |
| Protected production branch | Not available under current Neon project capability; GitHub branch/ruleset controls also need administrator confirmation |
| Monitoring and paging | Runtime logs and hourly external health monitoring are recorded; tested human paging remains open |
| External providers | Email, payment, signature, object-storage, and external distribution providers are not connected in the V1 surface |
| Independent review | Not performed; mandatory before V1.0 certification |
| V1.0 release tag | Must not be created before all blockers close and the independent review record is accepted |

R14 technical qualification, successful deployment, or passing health endpoints alone do not equal production certification.
