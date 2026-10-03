# R14 / V1 certification matrix

STATUS: **CRITERIA — NOT A CERTIFICATION**

Passing a row's existing evidence does not pass the row. V1.0 stays uncertified until every Status cell that says BLOCKER is closed by evidence, including independent review and a real production deployment if this contract still requires one.

| Area | Existing evidence | R14 requirement | Test / proof | Production proof | Independent review | Status |
|---|---|---|---|---|---|---|
| R1–R13 product | Merged at `087f0f5` | Do not reopen as new scope | Inherited workflows on the R14 SHA | Not production | Required before V1 | inherited |
| Authentication and sessions | R3 | Requalify on the candidate | R3 workflows plus hostile regressions | Production smoke later | Required | technical gate |
| Authorization | R5, registry length 131 | No new or accidentally activated key | Registry audit script plus R5 | Not production | Required | technical gate |
| Tenancy | R4 | Requalify | R4 workflows | Not production | Required | technical gate |
| Client isolation | R12 | Requalify | R12 hostile/database tests | Not production | Required | technical gate |
| Member isolation | R12 | Requalify | R12 tests | Not production | Required | technical gate |
| Commercial truth | R7 | Browser cannot set PAID/SIGNED | R7 tests | Not production | Required | technical gate |
| Publication of drafts | R9 | Unpublished content stays off public reader, sitemap, and search | R9 tests plus reader job | Not production | Required | technical gate |
| Payments | `PROVIDER_UNAVAILABLE` | Do not advertise charging | R12 checkout tests | No provider configured | Required | limitation, not a fake success |
| Email delivery | none | Do not claim delivery | Absence in registry and routes | None | Required | excluded |
| Integration verify | R13 | Stays `PROVIDER_UNAVAILABLE` | R13 tests | None | Required | limitation |
| RLS | verify scripts | Runtime role, not migration owner | `db:verify` and direct runtime mutation rejection | Production role later | Required | technical gate |
| Migrations | 24 applied | Clean database and drift none | `migrate deploy`, `db:drift` | Production migrate later | Required | technical gate |
| Idempotency and concurrency | R6–R13 tests | Re-run, do not replace | `test:db` | Not production | Required | technical gate |
| Rollback of a command | single SQL functions | No new half-write API | Inherited DB tests | Schema rollback is not trivial | Required | technical gate |
| Dependencies | production audit 0 | Re-run the production gate | `npm audit --omit=dev --audit-level=high` | Dev-tree findings are not this gate | Required | technical gate |
| Production build | prior builds | Exact production build | `npm run build` and `npm start` | Not a deploy | Required | technical gate |
| Browser smoke | per-release desks | Home, login, anonymous app denial, client/member/operations desks via inherited jobs plus an R14 public smoke | Playwright on production server | Production domain later | Required | technical gate |
| Accessibility | partial keyboard checks | Do not claim a full WCAG audit | Keyboard, landmark, overflow on the R14 smoke; inherited desks | Manual limitation stays recorded | Required | partial |
| Performance | none | Qualification ceilings, not a marketing SLO | Measured script | Production numbers do not exist | Required | technical gate |
| Backup and restore | none | Real dump, checksum, restore, migration count | `pg_dump` / `pg_restore` | No production backup | Required | technical gate on qualification DB only |
| Disaster recovery | none | Procedure matches the architecture that exists | Runbook plus qualification restore | No production DR drill | Required | procedure, not a drill |
| Health | none | Liveness without secrets; readiness is `SELECT 1` | HTTP checks | No monitor subscribed | Required | technical gate |
| Alerts | none | Do not claim an alert | No vendor is configured | BLOCKER until a host and alert channel exist | Required | BLOCKER |
| Logging secrecy | review | Do not add token logging | Secret scan plus code review of the new routes | Production logs do not exist | Required | technical gate |
| Secrets | CI test keys in workflows | No production secret in git | Scanner | Production secret store does not exist | Required | technical gate |
| Security headers | absent | Safe headers that do not break the site | Response header check | HSTS only when the origin is https | Required | technical gate |
| Production config | env validated loosely | Fail closed when production enforcement is on | Unit test | Real production env does not exist | Required | technical gate |
| Deployment | none | Document only | No fabricated host | BLOCKER: no owner host, credentials, or DNS | Required | BLOCKER |
| Independent review | not performed | Genuine external reviewer | A review record this agent did not write | Review covers the candidate SHA | This is the review | BLOCKER |
| V1 certification stamp | absent | Forbidden until every BLOCKER is closed | Claim scanner must reject a stamp | Deployed SHA must match | Required | NOT CERTIFIED |
| Open drafts #8 and #10 | open | Leave them | Disposition note | Not merged by this release | Not required | out of scope |

`r14_technical_verified: true` may be printed only by the R14 workflow after the technical rows pass. It is not `v1_certified: true`.
