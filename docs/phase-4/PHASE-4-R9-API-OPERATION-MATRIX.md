# R9 API Operation Matrix

Status: **FROZEN WITH P4-R9-G0 — NO ROUTE IS IMPLEMENTED**
Contract: `PHASE-4-R9-G0-FREEZE.md`

Routes below are the future `/api/v1/r9` surface. This document does not create them. Generic PATCH, PUT, and DELETE of lifecycle or status are forbidden. Each mutation is one named command.

Shared rules for every desk mutation:

- same-origin POST
- authenticated selected organization
- server-built resource context
- permission from the table, not from the body
- tenant taken from the session
- actor taken from the membership, never from the body
- expected row version where the row is mutable
- idempotency key on every create, transition, schedule, publish, and archive
- same key and same payload replays
- same key and different payload conflicts
- audit in the same transaction
- unknown or foreign ids are concealed

Public GET routes are not desk routes. They do not take a permission key and they do not take a status, a tenant, or an actor. They read published and archived snapshots only.

## Desk reads

| Operation | Method and path | Permission | Input the caller may send | Server owns | Denied |
|---|---|---|---|---|---|
| Publication | `GET /publication` | `magazine.view` | none | the tenant's one publication | another tenant |
| Issue list | `GET /issues` | `magazine.dashboard.view` | limit | every state, desk fields only | public callers |
| Issue detail | `GET /issues/:issueId` | `magazine.view` | id | canonical issue, including drafts | missing or foreign id |
| Schedule ledger | `GET /issues/:issueId/schedules` | `publish.queue.view` | id | schedule rows | a public response |
| Snapshot read | `GET /issues/:issueId/snapshot` | `publish.dashboard.view` | id | the immutable snapshot when one exists | a guess of an unpublished body |

## Assembly

| Operation | Method and path | Permission | Input the caller may send | Server owns | Denied |
|---|---|---|---|---|---|
| Create issue | `POST /issues` | `design.layout.manage` | title, season, theme, availability | slug, `ISSUE_DRAFT`, edition | a state, a tenant, a published flag |
| Open assembly | `POST /issues/:issueId/open-assembly` | `design.layout.manage` | expected row version | `ISSUE_ASSEMBLY` | open from any state but `ISSUE_DRAFT` |
| Add section | `POST /issues/:issueId/sections` | `design.layout.manage` | name, expected issue row version | order and slug | a section on a draft that was not opened, or on a published issue |
| Place article | `POST /issues/:issueId/placements` | `design.layout.manage` | draft version id, section id, expected issue row version | pin to that version, order | a second placement of the same editorial work, a version from another tenant, a copy |
| Remove placement | `POST /placements/:placementId/remove` | `design.layout.manage` | expected issue row version | rebuild page order | remove after schedule or publication |
| Reorder | `POST /placements/:placementId/reorder` | `design.layout.manage` | direction, expected issue row version | contiguous order | a caller-supplied order array that skips |
| Set cover | `POST /issues/:issueId/cover` | `design.cover.edit` | headline, dek, alt, story draft version id, expected issue row version | cover row | a story that is not placed on this issue |
| Design sign-off | `POST /issues/:issueId/design-approval` | `design.approve` | expected issue row version | design evidence | readiness, publication, or a project transition |

An edit to sections, placements, or cover on `ISSUE_READY` returns the issue to `ISSUE_ASSEMBLY`.

## Clearance, preparation, readiness

| Operation | Method and path | Permission | Input the caller may send | Server owns | Denied |
|---|---|---|---|---|---|
| Set asset rights | existing R8 `file.version` command | `file.version` | which flag and true or false | the R8 four-flag check | a single status string, a cleared asset that is not approved and licensed |
| Set sponsored rights | `POST /sponsored-placements/:placementId/rights` | `file.version` | which flag and true or false, expected row version | the same four-flag check | Harbor Press, or any sponsor, cleared while unapproved or unlicensed |
| Prepare story | `POST /draft-versions/:versionId/prepare` | `magazine.proof.review` | expected version | preparation evidence | a version that lacks editorial approval, client approval, or clearance |
| Prepare issue | `POST /issues/:issueId/prepare` | `magazine.proof.review` | expected issue row version | `ISSUE_PREPARATION` when assembly is complete | a draft that was not opened |
| Mark ready | `POST /issues/:issueId/ready` | `magazine.proof.review` | expected issue row version | `ISSUE_READY` only when the readiness function passes | a body field `ready: true`, a draft, an uncleared story, an uncleared sponsor |
| Return to assembly | `POST /issues/:issueId/reopen` | `magazine.proof.review` | expected issue row version | `ISSUE_ASSEMBLY` | reopen of a scheduled, published, or archived issue |

## Schedule, publish, archive

| Operation | Method and path | Permission | Input the caller may send | Server owns | Denied |
|---|---|---|---|---|---|
| Schedule | `POST /issues/:issueId/schedule` | `publish.schedule` | run time, idempotency key, expected issue row version | pending row, `ISSUE_SCHEDULED`, actor membership | a past time, a second pending time, a different payload on the same key |
| Cancel schedule | `POST /issues/:issueId/schedule/cancel` | `publish.schedule` | expected issue row version | `CANCELLED`, issue back to `ISSUE_READY` | cancel when nothing is pending |
| Publish | `POST /issues/:issueId/publish` | `publication.publish` | idempotency key, expected issue row version | readiness re-check, snapshot, `ISSUE_PUBLISHED`, actor membership | publish from draft, assembly, or preparation; a second snapshot; a body actor |
| Archive | `POST /issues/:issueId/archive` | `publication.publish` | expected issue row version | `ISSUE_ARCHIVED` | archive of an unpublished issue, deletion of the snapshot |

`publish.execute` and `magazine.reader.publish` have no row in this matrix. They are not aliases.

There is no command whose body contains `publisher`, `actor`, `organizationId`, `status`, or `publishedVersion`.

## Public projection

| Operation | Method and path | Permission | Returns | Never returns |
|---|---|---|---|---|
| Public issue | `GET /public/issues/:slug` | none | published or archived snapshot | drafts, schedules, audit, readiness notes |
| Public article | `GET /public/articles/:slug` | none | the snapshot version, or concealment | the working draft or an unpublished placement |
| Public search | `GET /public/search` | none | published titles only | unpublished titles, deks, or bodies |
| Premium catalogue | `GET /public/premium` | none | published issues with availability `PREMIUM` | unpublished premium names or a count of them |
| Sitemap data | `GET /public/sitemap` | none | published and archived public paths | unpublished slugs |

The existing site routes stay the pages. These GET handlers are the data those pages may later call. G0 does not add either.

A direct request for an unpublished slug is concealed the same way as an unknown slug. It does not say the issue exists.

## Concurrency and idempotency

| Case | Required result |
|---|---|
| Two live sessions publish one issue | one snapshot, one `ISSUE_PUBLISHED`, the other receives the defined conflict or the idempotent original |
| Two live sessions schedule one issue at different times | one pending schedule, the other conflicts |
| Publish replay, same key and same payload | the original snapshot id, no second row |
| Publish again after success, even with a new key | the original snapshot, no second edition |
| Schedule replay, same key and same time | the original schedule |
| Schedule, same key and a different time | conflict until cancel |
| Worker runs after clearance was removed | no snapshot, schedule `FAILED`, issue `ISSUE_READY` |
| Stale row version | conflict, no silent overwrite |
| Failed audit or failed constraint | no snapshot, no state change, no completed receipt |

Idempotency uses `platform.idempotency_receipts`. Scope is the command name plus the tenant. The unique snapshot constraint is the backstop when two sessions present two different keys.
