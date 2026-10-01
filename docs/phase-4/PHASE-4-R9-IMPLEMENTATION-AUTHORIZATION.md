# P4-R9 — Implementation Authorization

STATUS: AUTHORIZED
PHASE: R9
G0 ACCEPTED: docs/phase-4/PHASE-4-R9-G0-ACCEPTED.md
CONTRACT SHA: ba0ebd914a8a95fefea7fe8aeabb536158f87705

The owner authorizes implementation of R9 against the accepted G0 contract.

Authorized scope:
- production publication, issue, assembly, placement, cover, sponsored-placement, schedule, snapshot and personal-shelf persistence;
- R9 commands and HTTP surface;
- activation only of the R9 permission slice explicitly authorized by the G0 contract;
- public projection binding to published/archived snapshots;
- hosted qualification, including RLS, idempotency, rollback, hostile authorization, and two-live-session concurrency;
- reader/mobile/accessibility qualification on the existing public routes.

Forbidden:
- R10 distribution;
- client portal;
- checkout, packages, subscriptions, entitlements;
- second authorization system, tenant model, database, or publishing application;
- activation of dormant R9 aliases `publish.execute` or `magazine.reader.publish`.

No R10 implementation begins as part of this authorization.
