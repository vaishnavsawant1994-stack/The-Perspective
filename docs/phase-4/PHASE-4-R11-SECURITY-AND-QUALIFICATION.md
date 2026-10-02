# R11 security and qualification

Contract: `PHASE-4-R11-G0-FREEZE.md`

## Fail closed

Anonymous team routes are denied. A client membership is denied. A missing grant is denied. Cross-origin team and public mutations are denied. A browser field `views`, `count`, `conversionRate`, `actor`, `organizationId`, or `state` is invalid. A foreign contract, account, report, signal, or rule is not found. A draft slug creates no observation, no metadata, and no index row. An unknown campaign creates no attribution. A worker without the token is denied. A rule cannot name an action other than `CREATE_GROWTH_SIGNAL`.

## Separation

`report.approve` is allowed by policy only when the server has seen a different creator and the expected row version. SQL checks both again. Renewal and automation do not call a commercial command.

## Qualification

GitHub Actions, `ubuntu-latest`, `postgres:16`. The workflow `r11-implementation-qualification.yml` runs migrate, verify, drift, unit tests, database tests, lint, typecheck, production build, production audit, and a Chromium desk job. Inherited R3–R10 workflows must be green on the same head. RLS is proved with `perspective_runtime`, not a superuser.

The desk job checks anonymous redirect, mobile overflow, a content-report create, keyboard focus, desktop overflow, a missing public meta 404, and a forged observation 400.
