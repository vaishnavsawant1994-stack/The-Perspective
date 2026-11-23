# The Perspective — Project Completion Status

> **Superseded current-status snapshot.** The authoritative status as of 2026-11-23 is [PROJECT-COMPLETION-STATUS-2026-11-23.md](./PROJECT-COMPLETION-STATUS-2026-11-23.md). This file is retained as historical evidence; its tables below reflect the 2026-11-19 checkpoint.

**Evidence checked:** 2026-11-19 Asia/Kolkata (2026-11-18 UTC)
**Decision at that checkpoint:** V1.0 was **NOT CERTIFIED**. V1.1 was **NOT RELEASED**.

At the 2026-11-19 checkpoint, detailed route/control counts, live HTTP probes, limitations, and acceptance gates were recorded in [the functional audit snapshot](../qa/MASTER-FUNCTIONAL-AUDIT.md). Historical release reports remain historical evidence.

## GitHub

| Item | Current evidence | Status |
| --- | --- | --- |
| `main` | `3fa80397963761d29d4e972fadf4f098e50e8c75` | Production code baseline |
| PR #73 — Profile Network | Head `9fd5ba19faec91a421b9345e420d9eee33949287`; open, draft, unmerged; 17/17 exact-head Actions runs passed | CI-qualified code only; not accepted or released; no review submitted |
| PR #74 — R7 UTC timestamp repair | At the start of this route-audit update, head `2fde70fb80fee7ccc3c35ee59d3ab12a099027e1`; open, ready, unmerged; 17/17 exact-head Actions runs passed | This documentation-only route audit requires fresh checks; required human approval remains outstanding; no review submitted |
| PR #75 — broken public route repair | Head `1c9ced0c11209bc1841abd6ef7df4bb8a7b3187c`; open, ready, unmerged; 17/17 exact-head Actions runs passed | Production route repair not deployed; no review submitted |

## Production and staging

| Area | Current evidence | Status |
| --- | --- | --- |
| Production homepage, liveness, readiness | All returned HTTP 200 on 2026-11-19 Asia/Kolkata | Endpoint health only; authenticated acceptance remains open |
| Dynamic public route reachability | On `main@3fa80397963761d29d4e972fadf4f098e50e8c75`, 44 homepage-linked URLs and 213 source-defined dynamic targets returned 200; all 213 had a title and H1, and 16/16 unique image URLs returned 200; 18 invalid probes produced content 404s, Client login redirects, and token-shell/API rejection | Reachability and SSR markup only; no complete client-side hydration, visual acceptance, content-authenticity, or protected workflow acceptance |
| Hostinger staging homepage/readiness | Both returned HTTP 200 | Endpoint health only |
| Staging Profile Network routes | `/companies`, `/professionals`, `/editors` returned HTTP 404 | V1.1 preview acceptance blocked |
| Hostinger deployments | hPanel shows both `daily-limegreen-woodcock-36` and `expansive-darkslategray-raccoon-18` on `main@3fa8039…`, Node 24; public domain returns Hostinger/HCDN headers | Exact custom-domain-to-app mapping, production `DATABASE_URL`, and runtime logs remain unverified |
| Neon production and staging branches | Both ready; `protected=false` on 2026-11-19 Asia/Kolkata | Production protection gate open; no branch protection setting changed |
| Production application database login | Read-only catalog check on 2026-11-19: `perspective_hostinger_runtime` has full DML on 30 tables without RLS (18 IAM, 11 platform, 1 audit); only `platform.resources` among 31 inspected tables has forced RLS | **High-severity release gate**; no breach established, no production table contents or table-level grants changed; restricted-role membership was added |
| Production tenant runtime role switch | `perspective_hostinger_runtime` can now `SET ROLE perspective_runtime` without inheriting privileges; read-only transaction confirmed the restricted role and denied direct resource INSERT | Database prerequisite repaired; Hostinger deployment mapping and authenticated workflow verification remain open |
| Staging application login | Neon readback: `perspective_app` has `CREATEDB`, `CREATEROLE`, `BYPASSRLS`, owns all 619 catalog relations in non-system schemas (146 tables and 473 indexes), and is a member of `neon_superuser`; staging data provenance remains unknown | **High-severity staging gate**; no role, grant, or data changes made |

## Qualification completed locally for PR #74 patch

The code repair commit is `2c7ae7252b8a102de43bbdebbd6e1e069db26c68`. The last fully qualified source/audit head is `6c77fcda5451b55f412c1e8cf062b50ff25ea33b`, with 17/17 workflows passed. The UI Control Qualification on that head inspected 167 authenticated routes and 12,185 visible controls; 12,153 accepted focus and there were zero scanner failures. It is not a click-through test of every business workflow. Later branch commits are documentation-only; consult PR #74 for exact latest-head checks. The PR still requires a human approval under the repository rules.

- Unit: 647/647 across 85 files.
- Database integration: 266/266 across 40 files on a clean, migrated, guarded synthetic PostgreSQL 17 database.
- TypeScript: passed.
- Production build: passed; 470 static pages generated.
- Lint: zero errors, three existing warnings.
- Migration status: up to date (28 migrations in the V1.1 worktree).
- Drift check: no difference with a fresh empty shadow database.
- Database contract verification: passed, including RLS assertions and `runtime_bypass_rls=false`.

These tests did not write to Neon or production. The disposable local server has been stopped.

## Open release gates

- Map the live custom domain to the correct Hostinger app and verify its production `DATABASE_URL`, deployment ID, and runtime logs. Both visible hPanel app entries currently deploy `main@3fa8039…` on Node 24.
- Establish a least-privilege staging application login. The current staging `perspective_app` login is a Neon admin/owner role with RLS bypass; preserve data and validate all required auth and tenant workflows before replacing it.
- Map the production runtime's direct database grants to legitimate application/migration operations, review the least-privilege boundary, then requalify authentication, MFA, tenancy, and application workflows.
- Merge the public category route fix only after the required human approval; production still returns 404 for `/travel`, `/books`, `/strategy`, `/opinion`, and `/design`.
- Run authenticated owner/MFA and positive/negative tenant-isolation acceptance against the exact deployed candidate.
- Run a safe alert and observe human acknowledgement.
- The daily encrypted dump pipeline and retention tests passed on 2026-11-18 UTC (run [44283445934](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/44283445934)); it verified the private remote object and restored 146 application tables in an isolated PostgreSQL service. Rehearse manual restore/cutover and rollback in verified nonproduction, document recovery objectives, and add a second-provider copy if cross-provider disaster recovery is required. Neon PITR is six hours and the current manual snapshot expires 2026-11-24.
- Resolve production Neon branch protection without removing protection elsewhere or making an unapproved paid upgrade.
- GitHub PR approvals remain required by the active ruleset; GOV-REVIEW-02 waives independent review for R14/V1.0 but does not itself edit or disable GitHub's approval rule.
- A review request to `omgaj` was rejected because GitHub reports that account is not a repository collaborator; `omgaj` currently has read-only access. No collaborator invitation or permission change was made.
- Complete V1.1 editorial/publication, dynamic-route, responsive and accessibility acceptance before considering PR #73 for merge.
- Make a V1.0 certification decision only after its production gates are evidenced. No release tag or certification is authorized by passing CI alone.
