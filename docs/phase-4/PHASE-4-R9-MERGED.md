# R9 merged

STATUS: **MERGED TO `main`.** This is not a hosted production certification, not V1.0, and not R10.

| Record | Value |
|---|---|
| Merge | Pull request #13 |
| Merge commit | `7cd38065610f7bac0d91c93eb75feff69b20e865` |
| Pre-merge head | `1effd8b2a144015ccfc621e4ba6cb5a13a984be7` |
| Previous `main` | `573fe0aded1023b567a302a04e3d2c6a8b51dfc2` (R8 merge, pull request #12) |
| G0 freeze | `ba0ebd914a8a95fefea7fe8aeabb536158f87705` |
| Merged | 1 October 2026, after the owner instructed the open pull request to be merged |

`main` is 7 commits ahead of the R8 merge and 0 behind it. R8 remains in the history.

## What a later worker should read first

1. This file, for where the work stopped.
2. [PHASE-4-R9-G0-FREEZE.md](./PHASE-4-R9-G0-FREEZE.md), the contract that was implemented.
3. [PHASE-4-R9-DOMAIN-AND-WORKFLOW.md](./PHASE-4-R9-DOMAIN-AND-WORKFLOW.md), [PHASE-4-R9-API-OPERATION-MATRIX.md](./PHASE-4-R9-API-OPERATION-MATRIX.md), [PHASE-4-R9-DATABASE-CONTRACT.md](./PHASE-4-R9-DATABASE-CONTRACT.md), and [PHASE-4-R9-SECURITY-AND-QUALIFICATION.md](./PHASE-4-R9-SECURITY-AND-QUALIFICATION.md).
4. The code: `src/modules/r9`, `src/app/api/v1/r9`, `src/app/api/v1/internal/r9/worker/publish-due`, and `prisma/migrations/20261001190000_r9_publishing_foundation`.

[PHASE-4-R9-IMPLEMENTATION-AUTHORIZATION.md](./PHASE-4-R9-IMPLEMENTATION-AUTHORIZATION.md) is the authority to build. It was written before the merge and still says "not merged" as of that moment. [PHASE-4-R9-LOCAL-QUALIFICATION.md](./PHASE-4-R9-LOCAL-QUALIFICATION.md) is the local database evidence, also written before the merge. This file is the current repository state.

## What was built

R9 takes a qualified R8 editorial draft version and makes one canonical edition on The Perspective's own site.

- One publication per organization. Issue states are `ISSUE_*`. They are not R8 project states.
- Assembly pins a draft version and its digest. It does not copy the article body into the issue.
- Approved, cleared, prepared, ready, and published stay different steps.
- `publication.publish` writes one immutable snapshot and does not call `workflow.move` or change `production.projects.state`.
- A second publish key returns the original snapshot. Two concurrent publish sessions were tested locally and left one snapshot.
- The actor is the membership that scheduled or published. A browser string is not an actor. Opening the desk does not grant publisher.
- `magazine.reader.publish` and `publish.execute` stay dormant. No new permission key was added.
- Public routes show published and archived snapshots only. The designed mock magazine stays. A database miss does not reveal a draft.
- Personal shelves omit stories that are not in a published or archived snapshot.
- R10 distribution was not implemented. Nothing is sent to another network, inbox, podcast, video host, or event system.

## Checks that passed before the merge

On pre-merge head `1effd8b2a144015ccfc621e4ba6cb5a13a984be7`, all eight pull-request workflows completed with success:

- R3 Review Qualification
- R3 Browser Qualification
- R4 Tenancy Qualification
- R4 Browser Qualification
- R5 Contract Enhanced Qualification
- R5 Implementation Qualification
- R5 Browser Qualification
- R6 Implementation Qualification

The R7 and R8 qualification workflows do not run on pull requests, so they were not re-run on this head.

Local evidence, recorded before the merge: PostgreSQL 16.4, migration applied on the R2–R8 chain, 6 R9 database tests, 4 R9 policy tests, 593 non-database tests, and `tsc --noEmit` exit 0.

## What this merge does not mean

These statements describe pull request #13 only. They are not deleted by later qualification.

- No hosted deployment of `7cd3806` was verified as this merge.
- No exact-head production server outside GitHub Actions was checked for this merge.
- V1.0 is not certified.
- R10 has not been authorized and has not been started.

Later qualification of the post-merge repository is recorded in [PHASE-4-R9-COMPLETION-RECORD.md](./PHASE-4-R9-COMPLETION-RECORD.md). That file does not change what #13 itself proved.

Do not treat the browser preview that existed outside this repository as part of R9. It was not pushed. Do not treat local Postgres data files as part of the product. The schema is the migration above.
