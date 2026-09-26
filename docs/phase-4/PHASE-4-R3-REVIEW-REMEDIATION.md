# Phase 4 — R3 Review Remediation

**Date:** September 26, 2026  
**Branch:** `review/r3-auth-contract-repair-20260926`  
**Baseline:** `8cb1792a8e5575c4b8f03a04684dda65288ddae1`  
**Status:** REMEDIATION UNDER REVIEW  
**R3 acceptance:** NOT YET GRANTED  
**R4 status:** NOT AUTHORIZED

## Review findings

A source-level review of P4-R3-C1 found four authentication-flow defects that were not represented by the earlier automated qualification evidence:

1. The proxy correctly generated a validated `next=` return location, but Team sign-in always redirected to `/app` after authentication.
2. Client sign-in likewise discarded the protected `next=` location and always redirected to `/client`.
3. Client invitation activation fetched safe invitation metadata but ignored it, continuing to show hard-coded fictional organization, email, inviter, role, expiry, and invitation-ID values.
4. Existing-account invitation activation could lead an existing Team account to Client sign-in even though the Client membership does not exist until invitation acceptance. The R3 service already supports accepting a Client invitation from an authenticated Team session, so the UI needed an explicit return-to-invitation handoff.

A related public-auth UX problem was also found: the shared client authentication support link targeted protected `/client/support`, which could redirect unauthenticated users back to Client sign-in.

## Remediation

- Added surface-scoped post-auth return validation:
  - Team protected returns are limited to `/app` and `/app/*`.
  - Client protected returns are limited to protected `/client` paths.
  - Cross-surface and public-auth returns are rejected.
  - The explicit `/client/activate/[token]` invitation handoff is allowed after either Team or Client authentication so an existing identity can return to the pending invitation.
- Team and Client sign-in pages now validate `next` server-side and pass only the accepted destination into their client forms.
- Successful sign-in returns to the validated destination, falling back to `/app` or `/client`.
- Invitation activation now renders the API-provided safe organization, role, surface, and expiry metadata instead of unrelated fixture identity values.
- Existing-account activation exposes Team and Client sign-in handoffs that preserve the invitation return location.
- Public client-auth support links now use public `/help` instead of protected `/client/support`.

## Qualification

A GitHub Actions workflow, `.github/workflows/r3-review-qualification.yml`, was added on this review branch to make R3 qualification reproducible in GitHub using PostgreSQL 16.

The first run applied both R2 and R3 migrations and passed database verification, but drift checking failed because `prisma.config.ts` intentionally defaults `SHADOW_DATABASE_URL` to an unreachable fail-closed placeholder when no shadow database is supplied. The workflow was repaired to provision an isolated `perspective_shadow` database and explicitly set `SHADOW_DATABASE_URL`.

The current review must not be marked accepted until the repaired qualification run is green and the remaining interactive/browser review requirement is resolved or explicitly reviewed as a documented environment limitation.

## Scope guard

This remediation changes only R3 authentication/navigation presentation and qualification infrastructure. It does not implement R4 tenancy resolution, authorization policy, domain workflows, integrations, or new visual-design responsibilities.

```text
P4-R2-C1 accepted
  → R3 implemented
  → P4-R3-C1 review found defects
  → R3 remediation branch
  → automated requalification
  → interactive/browser review
  → independent acceptance decision
  → only then may R4 be authorized
```
