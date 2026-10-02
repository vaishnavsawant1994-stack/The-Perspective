# R9 local qualification note

STATUS: **LOCAL DATABASE QUALIFICATION ONLY — NOT HOSTED**

This note records what was actually executed before the merge. It is not an owner acceptance of a deployed exact head. The later merge is [PHASE-4-R9-MERGED.md](./PHASE-4-R9-MERGED.md). Hosted exact-head evidence is [PHASE-4-R9-COMPLETION-RECORD.md](./PHASE-4-R9-COMPLETION-RECORD.md). Do not read this local note as that gate.

## What ran

- PostgreSQL 16.4, real server, two client sessions
- Migration `20261001190000_r9_publishing_foundation` applied with `prisma migrate deploy` on top of the R2–R8 chain
- `src/modules/r9/r9-publishing.database.test.ts`: 6 tests, 0 failures
- `src/modules/authorization/r9-policy.test.ts`: 4 tests, 0 failures
- `src/modules/authorization/r8-policy.test.ts`: 7 tests, 0 failures
- `tsc --noEmit --incremental false`: exit 0
- Non-database Vitest suite, with the session auth boundary configured: 69 files, 593 tests, 0 failures. That run includes the R6, R7, and R8 policy tests.

The database tests used `perspective_runtime` and `perspective_public`. Both are `NOSUPERUSER` and `NOBYPASSRLS`. A missing `app.organization_id` returned no desk rows. Unpublished titles were absent from `r9_public_issue`, `r9_public_article`, `r9_public_premium`, and `r9_public_shelf`.

Covered on that database:

- Issue assembly through publish, one snapshot, replay, and a second key that does not create a second edition
- A later draft version does not change the published snapshot body
- Publish does not change `production.projects.state`
- Winter Index stays ineligible until the asset is cleared, Harbor Press is cleared, and the story is prepared
- A second Meridian schedule conflicts until cancel
- Two concurrent `publish-issue` sessions leave one snapshot
- A due schedule whose clearance was removed fails, returns the issue to `ISSUE_READY`, and writes no snapshot
- The Unset Table is not on the public article surface before publication
- Opening the desk is not a publisher grant. `magazine.view` cannot call `publication.publish`
- A shelf with no published story is omitted from `r9_public_shelves`

The existing public routes read that projection. Published and archived snapshots are added in front of the designed pages. A database miss fails closed to the designed page, or to not-found when the slug is neither designed nor published. Unpublished titles are not added to the homepage, magazine, archive, category, premium, article, author, search, personal-magazine, or sitemap responses.

## What this note does not claim

- The full database regression suite for R1–R8 on this head
- GitHub Actions. Those results are on the merge record, not in this local run
- A hosted deployment of this commit
- Exact-head production verification
- Owner acceptance of a qualified deployment

R10 remains locked.
