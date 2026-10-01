# R9 Database Contract

Status: **FROZEN WITH P4-R9-G0 — NO MIGRATION IS AUTHORIZED**
Contract: `PHASE-4-R9-G0-FREEZE.md`

## Placement

R9 tables go in the existing PostgreSQL schema `production`, in the existing database. They do not go in a second database and they do not copy `production.draft_versions` into a new article table.

Each aggregate root has:

- `id uuid`
- `resource_id uuid` unique, referencing `platform.resources`
- `owner_organization_id uuid`
- `row_version integer` not null, starting at 1, on mutable roots
- `created_at timestamptz`
- unique `(id, owner_organization_id)`

Child rows carry `owner_organization_id` and a foreign key that includes the owner's id, so a child cannot point at another tenant's parent.

The runtime role must not have direct insert, update, or delete on these tables. Mutations go through `SECURITY DEFINER` functions in `production`, the same pattern as R8. Reads used by the desk go through tenant-scoped functions. Public reads go through a separate function that selects only `ISSUE_PUBLISHED` and `ISSUE_ARCHIVED` and does not accept a state argument.

RLS is enabled and forced on every table in this contract, including tables the public function reads. The public function is the only path that may return a row without a desk membership, and it may return only snapshot-backed published or archived rows.

## Tables

`production.publications`

- one row per organization in this release
- unique `(owner_organization_id)`
- title and slug
- no subscription columns

`production.issues`

- publication id, optional primary project id, edition number, slug, title, season, theme, state, availability, row version
- unique `(publication_id, slug)` and unique `(publication_id, edition_number)`
- check that `state` is one of the frozen issue tokens
- check that `availability` is `PUBLIC` or `PREMIUM`
- check that a primary project, when set, is in the same organization

`production.issue_sections`

- issue id, name, slug, sort order
- unique `(issue_id, slug)` and unique `(issue_id, sort_order)`

`production.issue_placements`

- issue id, section id, `draft_version_id` referencing `production.draft_versions`, sort order, pinned digest
- unique `(issue_id, draft_version_id)` so the same version is not copied into a second placement
- unique `(issue_id, sort_order)`
- the draft version's organization must match. The command checks that. A composite foreign key includes `owner_organization_id`

`production.issue_covers`

- issue id unique, headline, dek, alt text, story `draft_version_id`
- the story version must also be a placement on that issue. The command checks that

`production.issue_pages`

- issue id, page number, kind in `COVER`, `CONTENTS`, `ARTICLE`, `SPONSORED`
- unique `(issue_id, page_number)`
- article pages reference a placement. They do not store a second body

`production.sponsored_placements`

- issue id, sponsor, headline, body, `present`, `approved`, `licensed`, `cleared`, row version
- check: `cleared` implies `approved` and `licensed`
- this is an editorial record. No price, no payment, no product id

`production.issue_schedules`

- issue id, run_at, status, idempotency key, created_by membership id, row version
- partial unique index on `issue_id` where `status = 'PENDING'`
- status in `PENDING`, `COMPLETED`, `CANCELLED`, `FAILED`

`production.publication_snapshots`

- issue id, edition number, actor membership id, published_at, from_state
- unique `(issue_id, edition_number)`
- no update and no delete grant to the application role
- the publish function inserts this row in the same transaction that moves the issue to `ISSUE_PUBLISHED`

`production.publication_snapshot_items`

- snapshot id, placement id, `draft_version_id`, digest, title as it was at publication
- unique `(snapshot_id, draft_version_id)`
- append-only
- the title and digest are copies of the version at commit time so a later draft cannot change the public edition. They are not a new editorial work

`production.personal_shelves`

- slug, name, editor person id, principles and description
- unique `(owner_organization_id, slug)`
- no article body column

`production.personal_shelf_items`

- shelf id, editorial work id, sort order
- unique `(shelf_id, editorial_work_id)`
- the public function resolves the item only through a snapshot item for that work

`production.issue_transitions`

- issue id, from state, to state, actor membership id, reason, issue row version, occurred_at
- append-only
- the command function inserts this row in the same transaction as the state change

## RLS

Every table has `ENABLE` and `FORCE ROW LEVEL SECURITY`.

The policy expression matches `owner_organization_id` to the transaction setting `app.organization_id`, the same setting R7 and R8 use. A missing setting matches no desk row.

The application role used by HTTP and by workers must be `NOSUPERUSER` and must not have `BYPASSRLS`. Table owners and superusers bypass RLS even when it is forced. A qualification connection that uses those roles does not satisfy this contract.

Definer functions set the organization and still re-check the row's organization inside the function. A function that mutates must not update `commercial` rows and must not update `production.projects.state`.

Public functions run as the same non-bypass role. They do not disable RLS. They are granted execute only, and their SQL predicates include the published-or-archived check so a policy mistake cannot widen them to drafts.

## Uniqueness that backs the commands

- one publication per organization
- one pending schedule per issue
- one snapshot per issue edition
- one placement per draft version per issue
- publish of an issue that already has a snapshot for that edition inserts nothing

## Migration rule

The implementation authorization, when it exists, adds one migration chain from the then-current head. `prisma migrate diff` must report no drift. Existing R2 through R8 migrations are not edited. Rollback of a failed command leaves no snapshot, no transition, no state change, and no completed receipt.

This document does not add a migration.
