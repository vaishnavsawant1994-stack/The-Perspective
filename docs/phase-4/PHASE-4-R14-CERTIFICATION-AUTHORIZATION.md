# R14 certification authorization

STATUS: **TECHNICAL WORK AUTHORIZED — V1.0 NOT CERTIFIED — PRODUCTION DEPLOYMENT NOT AUTHORIZED**
DATE: 3 October 2026
G0 ACCEPTANCE: `6e735d047031144ad0e8cb5b8b50d49c30825951`
G0 FREEZE: `0bae728f8ed3feb3d77f56cb6b1c619cbd76b6f7`

## Allowed

- `GET /api/health/live` and `GET /api/health/ready` as specified in the observability contract.
- Response headers named in the security contract. No untested Content-Security-Policy.
- `PERSPECTIVE_REQUIRE_PRODUCTION_CONFIG` fail-closed validation and a unit test.
- `scripts/certification/backup-restore.mjs`
- `scripts/certification/performance-smoke.mjs`
- `scripts/certification/inventory-surface.mjs`
- `scripts/certification/scan-secrets.mjs`
- `scripts/certification/verify-r14-claims.mjs`
- `scripts/certification/verify-r14-browser.mjs`
- `.github/workflows/r14-v1-certification.yml`
- Operations and release documents that state V1.0 is not certified and production is not deployed.
- A workflow log line `r14_technical_verified: true` only after that workflow's technical steps pass, together with `v1_certified: false`.

## Forbidden

- New permission keys, migrations, workers, providers, or product tables.
- A `v1.0.0` tag.
- A certification record that says V1.0 is certified.
- An independent-review file written by this agent.
- A production deploy, DNS change, or paid-host signup.
- Merging draft PRs #8 and #10.
- Treating this authorization as owner acceptance of V1.0.

## Release acceptance criteria (not met by this file)

Technical qualification green on the candidate SHA, a genuine independent review of that SHA, blocking findings closed and re-reviewed, and — because the production-readiness contract requires a real host — an owner-supplied production target before any production-ready or V1.0-certified wording.
