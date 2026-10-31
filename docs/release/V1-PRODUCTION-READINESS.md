# V1 production readiness

**STATUS: PRODUCTION DEPLOYED — V1.0 NOT CERTIFIED**

**Current source:** `main@28d5cc69c7534e401b03d8aa2c18a8a65f41bc3a`
**Current Vercel deployment:** `dpl_DTnagc9Sv7hT2XgJq7Fgjqfozgpw` (`READY`, production, Node.js 24; see reconciliation addendum)

This file is a concise entry point. The dated [current-state reconciliation](./CURRENT-STATE-RECONCILIATION-2026-10-31.md) preserves its original baseline and has a post-release addendum with current deployment evidence; that addendum supersedes earlier readiness snapshots below.

| Gate | Current state |
| --- | --- |
| Application host | Vercel production deployment exists and matches current `main` SHA |
| Database host | Neon PostgreSQL 16 project exists in Frankfurt; production readiness endpoint returned HTTP 200 |
| Domain and TLS | Production Vercel aliases are active; details are in the current reconciliation |
| Runtime parity | Production uses Node.js 24; current main CI is Node.js 20. PR #39 changes R3-R14 to Node 24 and passed all 16 workflows, but is not merged yet. |
| Public health | `/api/health/live` and `/api/health/ready` returned HTTP 200 on 31 October 2026 |
| Positive production authentication and tenancy | Not qualified; legitimate production identities and memberships are not present per the current handoff |
| Automatic backup schedule | Not configured; current Neon schedule query returned an empty schedule |
| Database backup and branch recovery | The Neon automatic snapshot schedule is empty; Neon branch protection/retention remains open. GitHub `main` now requires 23 checks, enforces admins, blocks force pushes/deletion, protects `v*` tags from update/deletion, and limits GitHub Production deployments to `main`. |
| Monitoring and paging | Runtime logs and hourly external health monitoring are recorded; tested human paging remains open |
| External providers | Email, payment, signature, object-storage, and external distribution providers are not connected in the V1 surface |
| Independent review | Not performed; mandatory before V1.0 certification |
| V1.0 release tag | Must not be created before all blockers close and the independent review record is accepted |

R14 technical qualification, successful deployment, or passing health endpoints alone do not equal production certification. Main CI uses Node.js 20 while production uses Node.js 24; PR #39 has qualified the Node.js 24 workflow changes but remains open, so runtime parity remains open.
