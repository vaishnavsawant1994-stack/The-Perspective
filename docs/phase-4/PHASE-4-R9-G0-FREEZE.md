# P4-R9-G0 — Publishing & Magazine Engine Freeze

STATUS: **DRAFT FOR OWNER FREEZE — IMPLEMENTATION NOT AUTHORIZED**
PHASE: R9
NAME: Publishing & Magazine Engine
BASE: `main` `55d7f48581e7b4cd273b2685e4c4a6c8b3587c55`
R8 RECORD: `docs/phase-4/PHASE-4-R8-ACCEPTED-MERGED.md`
R8 MERGE: Pull Request #12, merge commit `573fe0aded1023b567a302a04e3d2c6a8b51dfc2`
PLANNING AUTHORIZATION: 1 October 2026 program instruction. The R8 acceptance record says R9 planning may start and R9 implementation is not authorized.
IMPLEMENTATION: **NOT AUTHORIZED**
R10–R14: **STILL LOCKED**
NO DESIGN 154
NO PAGE 58+

This file is the controlling R9 contract. The companion documents in this same commit are part of the freeze:

- `PHASE-4-R9-INVENTORY.md`
- `PHASE-4-R9-DOMAIN-AND-WORKFLOW.md`
- `PHASE-4-R9-API-OPERATION-MATRIX.md`
- `PHASE-4-R9-DATABASE-CONTRACT.md`
- `PHASE-4-R9-SECURITY-AND-QUALIFICATION.md`

If those documents disagree with this file, this file wins until an owner addendum says otherwise.

This package is not owner acceptance. It creates no table, migration, route, permission activation, fixture row, or production behavior.

## Two authorizations

Authorization A is this planning package. It allows the inventory, the domain contract, the workflow, the API matrix, the database contract, the security contract, and this freeze.

Authorization B is a later, separate message. Only that message may authorize implementation, and only against this frozen package after the owner has accepted the freeze. No R9 code, migration, registry edit, or route may start in the gap between the two.

## Objective

R9 is the publication system that takes qualified R8 editorial production and makes one canonical public edition of The Perspective.

The order is:

R8 editorial production → R9 publication → R10 distribution.

R9 does not become R10. Publishing means the edition is readable on The Perspective's own public site. It does not send the edition to another network, inbox, podcast, video host, or event system.

"The edition stays on this device" is not a storage rule. It does not mean browser storage, a phone, or a local file. The canonical state is PostgreSQL. The public site reads that state. External distribution remains R10.

## What this freeze refuses from the reference preview

A separate preview application demonstrated reader, assembly, scheduling, and draft-hiding behavior. That preview is a reference for the fixtures below. It is not this repository, not this schema, and not an acceptance.

The following preview behaviors are forbidden here:

- The first account to open a desk becomes publisher.
- A browser string, including the name Helena Marlow, is the publishing actor.
- The edition lives only in browser storage.
- A database session that bypasses row-level security counts as a security qualification.
- A single-connection stale-write check counts as the concurrency qualification.
- Publishing Meridian in that preview is an R9 acceptance action.

## Scope freeze

R9 includes only:

- one tenant-scoped Publication for The Perspective public edition
- Issues assembled from sections, pages, placements, a cover, contributors, and sponsored placements
- placements that point at an existing R8 draft version and do not copy the article
- clearance and preparation that are distinct from editorial approval and from client approval
- scheduling, publication, idempotency, and an immutable publication snapshot
- audit of those commands in the existing audit store
- a public projection of published and archived snapshots only
- the existing public routes, reader behavior, archive, authors, search, premium catalogue, personal-magazine shelves, and SEO metadata, bound later to that projection
- mobile and keyboard reader behavior on the existing reader route

## Non-scope freeze

R9 does not include:

- R10 distribution, or any `distribution.*`, `podcast.*`, `video.*`, or `event.*` command
- R11 search-product, analytics, or automation beyond fail-closed behavior of the existing `/search` route
- R12 client-portal pages or any `client.*` key, including `client.publication.view`
- R13 enterprise administration and R14 production certification
- a second authorization system, a second tenant model, or a second database
- a second application imported from the reference preview
- catalogue checkout, packages, subscriptions, entitlements, or `package.manage`
- changing R8 project state. `workflow.move` remains the only command that sets the project marker `PUBLISHED` or `DISTRIBUTION`
- email or outbox delivery of an issue
- new public routes. The routes already named in the repository README stay the projection surface

## Reuse, not a new stack

R9 uses the current PostgreSQL database, the Prisma migration chain, `platform.resources`, `platform.idempotency_receipts`, and `audit.audit_events`. Future commands, when authorized, live under `src/modules/r9` and `/api/v1/r9`, following `src/modules/r8`. Authorization continues through the R5 evaluator. This freeze does not change the active stage set and does not edit the registry.

R8 `production.projects.state = PUBLISHED` is a production marker. It is not an Issue and it is not a public edition. R9 must not treat that marker as publication.

Person, User Account, Organization Membership, and permission stay distinct. A byline is not a permission. A project membership is not a publishing grant.

## Permission freeze

No new permission key is created by this freeze. No existing key is activated by this freeze.

These existing keys are the only keys an implementation authorization may activate, and only for the commands in the API matrix:

| Key | Surface | R9 command boundary |
|---|---|---|
| `magazine.view` | TEAM | Publication, issue, section, page, placement, and snapshot reads on the desk |
| `magazine.dashboard.view` | TEAM | Desk list projection only |
| `magazine.proof.review` | TEAM | Prepare a story, prepare an issue, mark ready, return to assembly |
| `design.cover.view` | TEAM | Cover read |
| `design.cover.edit` | TEAM | Set the cover on an issue still in assembly |
| `design.layout.manage` | TEAM | Open assembly, sections, placements, page order, personal-shelf curation |
| `design.approve` | TEAM | Design sign-off of a layout. Not readiness and not publication |
| `file.version` | TEAM | Asset and sponsored-placement rights flags, using the R8 four-flag rule |
| `publish.dashboard.view` | TEAM | Publication desk summary |
| `publish.queue.view` | TEAM | Schedule ledger read |
| `publish.schedule` | TEAM | Create, replay, or cancel one schedule |
| `publication.publish` | TEAM | Publish one ready or scheduled issue, and archive one published issue |

These keys stay dormant:

| Key | Why it stays dormant |
|---|---|
| `magazine.reader.publish` | A second publish command. The reader is a projection |
| `publish.execute` | A second publish command. `publication.publish` is the only one |
| `package.manage` | Premium is a mark on an issue, not a product or a checkout |
| `distribution.*` | R10 |
| `podcast.*`, `video.*`, `event.*` | Not R9 |
| `client.*` | R12. The public site is not the client portal |
| `workflow.template.manage` | One issue machine. No template product |
| `approval.decide`, `approval.override` | Not a substitute for R8 client approval or for publication |

`editorial.approve` and `approval.client.decide` stay R8 commands. R9 may read their evidence. It must not re-implement them.

Helena Marlow may appear in a later qualification fixture only as a real User Account with an Organization Membership and an explicit grant of the keys a scenario needs. The browser must never choose her, and opening a desk must never create that grant.

## Lifecycle freeze

Issue states are issue states. They are not R8 project states, not questionnaire states, and not draft-version states. The stored tokens, if an implementation authorization ever creates them, are:

`ISSUE_DRAFT`, `ISSUE_ASSEMBLY`, `ISSUE_PREPARATION`, `ISSUE_READY`, `ISSUE_SCHEDULED`, `ISSUE_PUBLISHING`, `ISSUE_PUBLISHED`, `ISSUE_ARCHIVED`.

The concepts those tokens protect are:

```text
approved ≠ cleared ≠ prepared ≠ ready ≠ published
```

`ISSUE_PUBLISHING` is a server-only step inside the publish transaction. A caller cannot set it. A caller cannot set any issue state by name except through the one command that is allowed to leave the current state.

Valid transitions and the fail-closed rules are in `PHASE-4-R9-DOMAIN-AND-WORKFLOW.md`.

## Public boundary

Before an issue is `ISSUE_PUBLISHED` or `ISSUE_ARCHIVED`, its title, slug, dek, cover, schedule, placements, and article bodies are absent from every public response. Hiding them in a stylesheet is not compliance. The absence is required on:

- the homepage and the existing desk landings
- `/magazine`, `/magazine/archive`, `/magazine/premium`, `/magazine/category/[slug]`, `/magazine/read/[slug]`
- `/article/[slug]`, `/author/[slug]`, `/search`
- `/personal-magazines` and `/personal-magazines/[slug]`
- sitemap and structured metadata
- authenticated API responses that are not desk reads

An unpublished premium issue is omitted entirely. A count of unpublished premium issues is also an omission failure.

`/magazine/subscribe` stays a comparison of future access levels. R9 does not turn it into checkout.

## Snapshot rule

A publication snapshot names the issue, the edition, each placed draft version id, that version's digest, the actor membership, and the server time. A later draft version does not change the snapshot. The public reader renders the snapshot, not "whatever the working draft says now."

## Database, security, and acceptance

RLS, the non-bypass qualification role, two-session concurrency, idempotency, and the hostile matrix are frozen in the companion documents. A superuser connection is not a passing RLS test. One connection pretending to race is not a passing concurrency test.

Qualification is exact-head and hosted. A local build is not qualification. Owner acceptance of an implementation is a later gate. R10 stays locked until that acceptance is merged.

## Gate

This document is G0. Implementation starts only after the owner freezes this contract and sends a separate implementation authorization. Until then, every key above remains dormant and no `/api/v1/r9` route exists.
