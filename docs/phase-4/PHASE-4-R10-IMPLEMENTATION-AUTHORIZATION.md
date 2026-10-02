# R10 implementation authorization

STATUS: **IMPLEMENTATION AUTHORIZED — NOT ACCEPTED, NOT MERGED**
DATE: 2 October 2026
ACCEPTED G0: `2538ebb394787217e1150a1fe0cf0b3a0a8358f0`
FREEZE SHA: `ea29ee99d7dfa4fc0bdfa16cea58862688831724`
ACCEPTANCE RECORD: `docs/phase-4/PHASE-4-R10-G0-ACCEPTED.md`

The owner's R10 end-to-end directive authorizes implementation of the accepted freeze. It does not accept the result in advance, it does not merge it, and it does not authorize R11.

## Allowed

The commands, tables, permissions, desks, public delivery read, and non-mutating worker in the freeze. Migration `20261002190000_r10_media_distribution` may be added. It may not edit an accepted migration.

Active keys are only the R10 rows in the freeze's permission table. `podcast.*`, `video.*`, and `event.*` stay stamped `R8/R9` in the registry. Activation is an allow-list in the existing evaluator, and only while stage R10 is active.

## Forbidden

R11 search, SEO, analytics, reporting, automation, and renewal. R12 portal and member registration. R13 transcripts, tickets, and provider secrets. R14 certification. New permission keys. External delivery marked successful. A browser-supplied URL, actor, tenant, or state. Changes to R8 project state or R9 issue state.

## Required proof before acceptance

PostgreSQL RLS under `perspective_runtime`, two-session launch, idempotency, rollback, hostile HTTP, Chromium on the four desks, inherited R3–R9 workflows, lint, typecheck, production build, and the production dependency audit. The hosted environment is GitHub Actions with `postgres:16`. That is not a production deployment.

## Ceiling

R10 ends at verified SITE delivery of an already published issue and at fail-closed external targets. R11 implementation is not authorized.
