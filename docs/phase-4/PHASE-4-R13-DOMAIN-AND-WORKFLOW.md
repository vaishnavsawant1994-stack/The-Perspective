# R13 domain and workflow

STATUS: **G0**
DATE: 3 October 2026

## Authority

A TEAM session, selected membership, server tenant, and an ALLOW grant. Browser fields `isAdmin`, `isOwner`, `role`, `organizationId`, `permissions`, `verified`, `status`, `secret`, `token`, `apiKey`, `delivered`, and `ready` are rejected.

`settings.manage` and `integration.manage` require audit, a reason, recent authentication, and MFA. Those obligations are taken from the session and the reason text, not from an authority flag.

## Settings

One typed row per owner organization.

- `timezone`: `UTC`, `Asia/Kolkata`, `America/New_York`, or `Europe/London`
- `weekStartsOn`: `MONDAY` or `SUNDAY`
- `supportLabel`: 1–80 characters, no control characters

Update requires `expectedVersion`. A missing row starts at version 0 and the first write uses version 0. The read before any write returns UTC, MONDAY, null label, and `configured: false`.

`iam.organizations.settings` stays `{}`. R13 does not write that blob.

## Integrations

Types: `EMAIL`, `STORAGE`, `PAYMENT`. These name boundaries the product already refuses to fake. A row is `DECLARED` or `DISABLED`. There is no `VERIFIED` state.

Verify on a `DECLARED` row inserts one attempt whose only legal result is `PROVIDER_UNAVAILABLE` and leaves the declaration `DECLARED`. Disabled or missing declarations are not verified. No secret column exists.

## Explicitly not workflows

No team invite, role change, notification send, file upload, incident transition, AI call, or worker claim is an R13 command.
