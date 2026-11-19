# Defect Register

This register records reproducible defects and their verification evidence. An entry is not considered closed until the repair is committed and the relevant checks pass on that commit.

## QA-R7-001 — Proposal timestamps shifted outside UTC

| Field | Evidence |
| --- | --- |
| Severity | High — valid proposal sends failed in a PostgreSQL session using a non-UTC timezone. |
| Affected workflow | Team sends a proposal; idempotent replay returns its original sent timestamp. |
| Cause | JavaScript `Date` values were passed as raw PostgreSQL `timestamptz` parameters. In the local PostgreSQL 17 acceptance environment (`Asia/Calcutta`), the Prisma PostgreSQL adapter bound the wall-clock value with the local offset, shifting the instant. The database audit function rejected the mismatch between the JSON audit timestamp and the bound timestamp. |
| Repair | Bind UTC ISO-8601 strings for every proposal-send timestamp parameter. Read replay timestamps as PostgreSQL text and normalize them to ISO UTC. Read persisted timestamps as text in integration assertions so the test compares instants independently of the machine timezone. |
| Regression evidence | Focused proposal-send and proposal-acceptance database cases: 2/2 passed. Clean seeded isolated database suite: 40/40 files, 266/266 tests passed. |
| Additional qualification | Unit tests: 85/85 files, 647/647 tests passed; production build completed; standalone TypeScript check passed; lint had zero errors and three pre-existing warnings; `db:migrate:status`, `db:drift` with a fresh shadow database, and `db:verify` passed. |
| Environment boundary | Tests used a disposable PostgreSQL 17 cluster on loopback. No production or Neon database was used for test writes. |
| Status | Repair prepared on `fix/v1-r7-utc-timestamps`; close after the exact commit's CI qualification passes. |
