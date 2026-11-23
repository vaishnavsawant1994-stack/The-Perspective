# The Perspective — Current Completion Status

**Evidence checked:** 2026-11-23 UTC  
**V1.0:** NOT CERTIFIED  
**V1.1:** NOT RELEASED

This is the current release-status pointer. The detailed, evidence-based audit is in [MASTER-FUNCTIONAL-AUDIT.md](../qa/MASTER-FUNCTIONAL-AUDIT.md). Earlier status files are historical snapshots.

## Source and qualification

| Item | Current state |
| --- | --- |
| Production `main` | `ce7c1513bb61e45cb0f9081bf672befa2a4e6804` |
| Hostinger production and secondary app | Both run Node 24 from `main@ce7c1513bb61e45cb0f9081bf672befa2a4e6804`; homepage/readiness checks returned HTTP 200 |
| PR #73 — Profile Network | Open and draft; product-code checkpoint tested in this refresh: `e7bcd7e37843bc5040013208f9784153b0d83e79`; use the live PR for the current branch head |
| PR #73 qualification | Product-code checkpoint `e7bcd7e` passed; documentation head `a907f11dca206c6da9267f338cc9c443f1c83a56` passed 17/17 workflows and Vercel; V1 UI artifact retained through 2026-12-07 |
| PR #76 — AWS migration preparation | Open and draft at `4af5a3e8464c10beed79b74ea76acba2f1043b64`; 18/18 workflows and Vercel passed; no AWS migration or cutover performed |
| Main protection | Active `Protect main` ruleset; pull requests, three required checks, up-to-date checks and resolved conversations required; approving reviews waived at owner direction |

Green PR checks qualify the code and test fixtures. They do not verify Hostinger's masked database connection, production authentication, tenant isolation, recovery, or release readiness. PR #73 remains isolated from both live Hostinger apps.

## Local requalification on the exact PR head

- Unit tests: **679/679 across 92 files passed**.
- TypeScript and Prisma schema validation passed.
- ESLint completed with **0 errors and 3 warnings** (two unused fixture identifiers in `r6-communications.database.test.ts`; one unused type import in `r7/commands.ts`).
- Production build passed and generated **470 pages**.
- Local HTTP smoke returned 200 for the homepage, login routes, company/professional/editor directories, Personal Magazine discovery, and liveness. The database readiness route returned 503 because the smoke server used an intentionally invalid loopback-only database URL. An unknown company detail returned 500 under that same unavailable-database condition; this is not a valid not-found acceptance result.
- A separate, fresh disposable PostgreSQL 17 cluster on loopback applied all **28 migrations**. The guarded synthetic seed and assertions, database contract verifier, migration status, and Prisma schema drift check passed; **266 database tests across 40 files passed**. The separate existing PostgreSQL service at port 5432 required credentials and was left untouched.
- With the disposable database connected, readiness returned 200 and unknown Company, Professional, and Editor slugs returned 404. A Playwright check confirmed Company profiles title/H1, labeled search, search submission and Clear search behavior; browser console had zero errors and CSS preload warnings. The database and browser checks used only synthetic local records.

The full route-by-route evidence and exact limitations are in [the master functional audit](../qa/MASTER-FUNCTIONAL-AUDIT.md#local-exact-head-requalification--2026-11-23).

## Production and staging gates

1. **Database identity and privilege boundaries:** Hostinger masks `DATABASE_URL` on both websites, so neither live app is mapped to a verified Neon branch/login. The production candidate role has effective write access to 30 tables without RLS. The identified staging login `perspective_app` has `BYPASSRLS`, `CREATEDB`, `CREATEROLE`, membership in `neon_superuser`, and DML across all 146 application tables. Design a separate least-privilege runtime/migration path and qualify every affected authentication, administration, and tenant workflow before replacing credentials or grants.
2. **Staging schema and browser acceptance:** The identified Neon staging database has 24 applied migrations; PR #73 contains 28. The Hostinger staging URL runs `main`, and its actual database target is unverified. Do not migrate or create test data until the target and data provenance are confirmed and a least-privilege role is available.
3. **Production owner and tenancy:** Verify real owner login/MFA and both allowed and denied tenant journeys against the exact production source and runtime role.
4. **Recovery and operations:** Production Neon `perspective` branch protection is off; history retention is six hours; its automatic snapshot schedule is empty; the observed manual snapshot expires 2026-11-24. The scheduled encrypted backup/isolated restore-verification run #23 succeeded on 2026-11-22, and the backup code is unchanged through current `main`. Production cutover/rollback rehearsal and tested alert delivery with human acknowledgement remain incomplete.
5. **V1.1 editorial acceptance:** Run the Company/People/Editor review, approval, publication, withdrawal, privacy, abuse-control, responsive, accessibility, and correction-request flows on isolated staging. Confirm the final target database and source before release consideration.

The owner waived independent external review for V1.0 in `GOV-REVIEW-02`; no independent review is claimed. This does not waive the technical, production, recovery, or V1.1 acceptance gates.

## Changes in this refresh

PR #73 fixes team login's protected-route navigation and removes a flaky global `networkidle` wait from its browser qualification. The exact PR head now passes all 17 GitHub Actions workflows, including R3 authenticated browser acceptance. The docs update records the verified current production deployment and the elevated staging-role finding. No production or staging settings, credentials, database rows, migrations, deployments, or DNS records were changed.

The latest live checks confirm Hostinger production and secondary builds still run `main@ce7c151`; Hostinger's vulnerability scanner reports zero findings, while `/companies`, `/professionals`, and `/editors` remain 404 on production because PR #73 is unmerged. The nightly encrypted-backup/isolated restore-verification workflow has a successful Nov 22 run; production Neon point-in-time snapshots remain unscheduled. These confirmations do not certify V1.0 or release V1.1.

