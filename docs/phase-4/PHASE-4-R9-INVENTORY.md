# R9 Inventory

Status: **PLANNING INPUT TO P4-R9-G0 — IMPLEMENTATION NOT AUTHORIZED**
Base: `main` `55d7f48581e7b4cd273b2685e4c4a6c8b3587c55`
Contract: `PHASE-4-R9-G0-FREEZE.md`

This inventory records what already exists and what R9 must add. It grants nothing. It does not bind a public page.

## What R1–R8 already provide

| Existing piece | Reuse in R9 | Must not be reused as |
|---|---|---|
| Organization, membership, role, permission, session | The only identity and tenant authority | A byline, a first-login grant, or a browser-supplied publisher name |
| R5 evaluator | The only authorization path | A second publishing policy engine |
| `platform.resources` | One resource row per publication aggregate | An Issue by itself |
| `platform.idempotency_receipts` | Claim, payload hash, replay, and conflict | A second receipt store, or a browser receipt |
| `audit.audit_events` | Security and business evidence in the same transaction | A client-visible activity feed |
| R8 `production` schema | Draft versions, approvals, assets, four rights flags, credits, projects | A public article table that copies the draft |
| R8 project state `PUBLICATION_READY` | A precondition the server re-reads | An Issue, and not something the browser can assert |
| R8 project states `PUBLISHED` and `DISTRIBUTION` | Unchanged markers owned by `workflow.move` | Publication or delivery |
| `editorial.approve` and `approval.client.decide` | Evidence R9 reads | Commands R9 re-implements |
| Public Next.js routes in the repository README | The only public surface a later implementation may bind | A second site, and not production data during G0 |
| `src/modules/r8` | The module and `/api/v1` convention | A place to hide R9 commands |
| Personal Magazine editions Arjun Mehta, Sophia Reynolds, and Daniel Kim | Existing public identities | Records to delete or replace in this freeze |

There is no publication, issue, section, page, placement, cover, sponsored-placement, schedule, or publication-snapshot table in the operational schema. Mock magazine pages are not records. `src/modules` has no `r9` module.

## Public routes already in the product

These routes exist and stay unbound in G0:

- `/`, `/latest`, `/news`, `/business`, `/leadership`, `/technology`, `/perspective`
- `/magazine`, `/magazine/premium`, `/magazine/subscribe`, `/magazine/category/[slug]`, `/magazine/archive`, `/magazine/read/[slug]`
- `/personal-magazines`, `/personal-magazines/[slug]`
- `/search`, `/author/[slug]`, `/article/[slug]`

`/magazine/read/[slug]` is the reader that later qualification must prove for page turns, thumbnails, type size, fullscreen, and keyboard arrows. G0 does not change that route.

## Identity split

```text
Authenticated User
  → Organization Membership
  → Membership Role
  → Role permission
  → Publishing command
  → Audit actor
```

A Person named on a credit is not that chain. Helena Marlow is not that chain unless a future fixture creates the user, the membership, and the grant on purpose.

## Registry keys already stamped for this stage

The R5 inventory already contains `magazine.view`, `magazine.dashboard.view`, `magazine.proof.review`, `magazine.reader.publish`, `design.cover.view`, `design.cover.edit`, `design.layout.manage`, `design.approve`, `publish.dashboard.view`, `publish.queue.view`, `publish.schedule`, `publish.execute`, and `publication.publish`. They are dormant while the active stage set does not include R9. This inventory does not change that set.

`magazine.reader.publish` and `publish.execute` are listed so they are not forgotten. The G0 permission freeze refuses to activate them.

## Reference preview

The preview that showed The Measured Room, Meridian, Winter Index, The Unset Table, and Harbor Press is not a module of this repository. Its behaviors are inputs to the fixtures in the domain document. Its authority model is not an input.

## What R9 must define before any code

The domain document defines the entities and the fixtures. The API matrix defines each command. The database contract defines tables, uniqueness, and RLS. The security document defines the attacks those commands must fail, including a non-bypass RLS role and two live publication attempts.

No route, migration, registry edit, or permission activation is part of this inventory.
