# P4-R12-C1 — R12 OWNER ACCEPTANCE

PROJECT: The Perspective
RELEASE: Phase 4 / R12
STATUS: **OWNER ACCEPTED. NOT MERGED.**
DATE: 3 October 2026
R13: **LOCKED. G0 PLANNING IS NOT OPEN UNTIL THIS ACCEPTANCE IS MERGED.**

## Decision

The owner directed R12 from the accepted R1–R11 baseline through exact-head qualification. This document accepts that surface after the gates in `docs/phase-4/PHASE-4-R12-COMPLETION-RECORD.md` passed. It does not accept dormant client keys, a payment provider, R13, or V1.0 certification.

## Reviewed state

- Branch: `phase4/r12-g0-client-member-platform-20261003`
- Pull request: #21
- Previous main: `c6b928d4b159cc66eb768ad10be4a4ef9b1aea7a`
- G0 freeze: `78a21b1e3be8554f1212b3f54e7dbc334cfeecff`
- G0 acceptance: `4a12adff04b49efd9d4ad91b6c80dd6ee3a21003`
- Implementation authorization: `docs/phase-4/PHASE-4-R12-IMPLEMENTATION-AUTHORIZATION.md`
- Qualification head: `e71a11fd3f96ce657781c7ff2d6dd78e5d460013`
- Qualification: [R12 Implementation Qualification](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37102654136) — SUCCESS, `qualify` and `desk`
- Checkpoint: `docs/phase-4/PHASE-4-R12-COMPLETION-RECORD.md`

## Accepted surface

Client-safe portal projections, same-owner client isolation, version-bound approval decisions, member library entitlements, and checkout that fails closed when no trusted provider is configured.

## Left closed

Dormant `client.*` keys, including payment and signing. No new permission key. No write to `commercial.subscriptions` as member truth. No R13 implementation.

## Merge

Not merged. R13 G0 planning opens only after pull request #21 is merged. R13 implementation is not authorized by this file.
