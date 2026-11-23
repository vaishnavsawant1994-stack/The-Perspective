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
| PR #73 — Profile Network | Open, draft, unmerged; exact head `dad3f21a371d92be0d6ed7e09eb578abfbfadab3` |
| PR #73 qualification | 17/17 exact-head GitHub Actions workflows passed; Vercel status passed; R3 browser and 171-route UI control audit passed |
| Main protection | Active `Protect main` ruleset; pull requests, three required checks, up-to-date checks and resolved conversations required; approving reviews waived at owner direction |

Green PR checks qualify the code and test fixtures. They do not verify Hostinger's masked database connection, production authentication, tenant isolation, recovery, or release readiness. PR #73 remains isolated from both live Hostinger apps.

## Production and staging gates

1. **Database identity and privilege boundaries:** Hostinger masks `DATABASE_URL` on both websites, so neither live app is mapped to a verified Neon branch/login. The production candidate role has effective write access to 30 tables without RLS. The identified staging login `perspective_app` has `BYPASSRLS`, `CREATEDB`, `CREATEROLE`, membership in `neon_superuser`, and DML across all 146 application tables. Design a separate least-privilege runtime/migration path and qualify every affected authentication, administration, and tenant workflow before replacing credentials or grants.
2. **Staging schema and browser acceptance:** The identified Neon staging database has 24 applied migrations; PR #73 contains 28. The Hostinger staging URL runs `main`, and its actual database target is unverified. Do not migrate or create test data until the target and data provenance are confirmed and a least-privilege role is available.
3. **Production owner and tenancy:** Verify real owner login/MFA and both allowed and denied tenant journeys against the exact production source and runtime role.
4. **Recovery and operations:** Production Neon `perspective` branch protection is off; history retention is six hours; its automatic snapshot schedule is empty; the observed manual snapshot expires 2026-11-24. Complete and document a verified restore/cutover and rollback rehearsal, and test alert delivery plus human acknowledgement.
5. **V1.1 editorial acceptance:** Run the Company/People/Editor review, approval, publication, withdrawal, privacy, abuse-control, responsive, accessibility, and correction-request flows on isolated staging. Confirm the final target database and source before release consideration.

The owner waived independent external review for V1.0 in `GOV-REVIEW-02`; no independent review is claimed. This does not waive the technical, production, recovery, or V1.1 acceptance gates.

## Changes in this refresh

PR #73 fixes team login's protected-route navigation and removes a flaky global `networkidle` wait from its browser qualification. The exact PR head now passes all 17 GitHub Actions workflows, including R3 authenticated browser acceptance. The docs update records the verified current production deployment and the elevated staging-role finding. No production or staging settings, credentials, database rows, migrations, deployments, or DNS records were changed.

