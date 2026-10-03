# R12 database contract

Migration: `20261003090000_r12_client_member_platform`. It does not edit an R1–R11 migration.

PostgreSQL 16. New schemas `portal` and `member`. Runtime role stays NOSUPERUSER and NOBYPASSRLS. New tables are ENABLE and FORCE row level security. Runtime may SELECT them and EXECUTE the functions. Runtime may not INSERT, UPDATE, or DELETE them.

## portal.access_grants

Owner organization, client account, client organization, normalized email, token hash, state `INVITED | ACTIVE | REVOKED | EXPIRED`, optional user and membership, expiry, accept and revoke timestamps, row version, creator. One live grant per account and email. Token hash unique while invited.

## member.offers

Owner, code, currency, amount minor, interval `MONTH` or `YEAR`, entitlement key, state `OPEN` or `CLOSED`.

## member.checkout_attempts

Owner, user, offer, amount and currency copied from the offer, state `PROVIDER_UNAVAILABLE` only.

## member.profiles

User account, display name, row version.

## Entitlements

No new entitlement table. Partial unique index: one active row per owner, subject, and key.

## Functions

- `portal.r12_team` staff invite and revoke
- `portal.r12_client` projections and version-bound decision
- `portal.r12_member` profile, library, issue, checkout, cancel
- `portal.r12_worker` offer, grant, revoke

Idempotency receipts use scope `r12.<command>`. Unique violation returns CONFLICT and rolls the function body back. Audit rows carry the safe result, never a raw token.

`commercial.subscriptions` is not referenced by these functions.
