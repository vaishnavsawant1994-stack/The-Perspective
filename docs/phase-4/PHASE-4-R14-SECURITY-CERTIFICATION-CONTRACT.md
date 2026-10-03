# R14 security certification contract

STATUS: **CONTRACT — NOT A COMPLETED REVIEW**

## What must be re-proven on the candidate SHA

Inherited workflows R3 through R13, including browser jobs, on that exact SHA. Plus:

- `scripts/certification/inventory-surface.mjs` reports registry length 131, zero keys at stage R14, and no `it.only` / `describe.only` / `test.only`.
- `scripts/certification/scan-secrets.mjs` fails on private-key blocks, `AKIA`, `sk_live_`, and `ghp_` tokens. It does not fail on the committed qualification password `perspective` inside GitHub workflow files.
- Direct runtime `INSERT` remains rejected on the tenant tables already covered by R4–R13 verifier scripts. RLS evidence must use `perspective_runtime`, not the migration owner.
- New health responses must not echo `DATABASE_URL`, cookies, or the auth data key.
- Response headers from the production server must include `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, and `Permissions-Policy`. `Strict-Transport-Security` is sent only when `PERSPECTIVE_PUBLIC_APP_ORIGIN` is `https://` at build time. A strict Content-Security-Policy is not required: the editorial UI was not qualified against one, and this contract does not break the site to collect another header.
- `PERSPECTIVE_REQUIRE_PRODUCTION_CONFIG=true` must refuse to boot when the auth mode is not `sessions`, the public origin is missing or contains `*`, the data key is not 32 bytes, or the key version is missing. Qualification servers that do not set the flag keep today's behavior so existing jobs do not change meaning.

## What this contract refuses

- A new permission, role, or worker.
- Treating a dormant key as active.
- A waiver under GOV-REVIEW-01. Section 4 forbids that waiver for R14/V1.0.
- An authoring-agent document titled as independent review.
- A claim that GitHub Actions, localhost, or a preview is production.

## Hostile scope already in the inherited suites

Anonymous denial, cross-tenant reads, same-owner client isolation, member isolation, field laundering (`organizationId`, `isAdmin`, `verified`, `paid`, `signed`, `entitled`, `published`), worker-token routes, and provider failure closed as `PROVIDER_UNAVAILABLE`. R14 does not replace those tests with a weaker smoke.

## Certification rule

Security tests can support `r14_technical_verified`. They cannot by themselves support `v1_certified`.
