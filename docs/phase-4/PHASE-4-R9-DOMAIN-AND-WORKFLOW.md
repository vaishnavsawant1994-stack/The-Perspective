# R9 Domain and Workflow

Status: **FROZEN WITH P4-R9-G0 — IMPLEMENTATION NOT AUTHORIZED**
Contract: `PHASE-4-R9-G0-FREEZE.md`

## Aggregates

| Aggregate | Owns | Does not own |
|---|---|---|
| Publication | The tenant's public edition identity | A second magazine product, a subscription, or a distribution channel |
| Issue | Lifecycle, edition number, availability, cover, schedule pointer | R8 project state |
| Section | Ordered name inside one issue | A copy of an article |
| Page | Ordered reader position derived from cover, placements, and sponsored placements | A second body |
| Placement | One issue, one R8 draft version, one pin | A new editorial work |
| Cover | Headline, dek, alt text, and the placement it points at | A file the caller stores |
| Contributor | A credit already recorded in R8, projected onto the issue | A permission |
| Sponsored placement | Sponsor, headline, body, and the four rights flags | A sale, an invoice, or a checkout |
| Schedule | One pending run time for one issue | A published edition |
| Publication snapshot | Immutable issue edition, version ids, digests, actor membership, server time | Later draft edits |
| Personal shelf | A named shelf and a list of canonical article identities | A private copy of an article |

## Canonical path

```text
R8 editorial work
  → immutable draft version
  → issue placement
  → publication snapshot
  → public route
```

A placement stores `draft_version_id` from `production.draft_versions` in the same organization. It does not insert another editorial work and it does not copy the body into a second article row. The snapshot stores that same version id and the digest captured at publication. The public reader reads the snapshot.

One issue may place versions from more than one R8 project. R8 still has one editorial work per project. R9 does not break that rule to assemble a magazine.

## Frozen enumerations

Issue state: `ISSUE_DRAFT`, `ISSUE_ASSEMBLY`, `ISSUE_PREPARATION`, `ISSUE_READY`, `ISSUE_SCHEDULED`, `ISSUE_PUBLISHING`, `ISSUE_PUBLISHED`, `ISSUE_ARCHIVED`.

These tokens are not written by this freeze. They are the only tokens an implementation may later store. They are not the R8 project states and not the questionnaire states.

Availability: `PUBLIC`, `PREMIUM`. Premium is a mark. It is not `package.manage` and it does not require payment to exist in the catalogue.

Schedule status: `PENDING`, `COMPLETED`, `CANCELLED`, `FAILED`.

Sponsored-placement rights use the R8 four flags, independently: `present`, `approved`, `licensed`, `cleared`. `cleared` may be true only when `approved` and `licensed` are already true. None of the four implies another by itself.

## Inequalities

| Word | Means | Does not mean |
|---|---|---|
| Approved | An R8 `editorial_approvals` row, or an R8 `client_approvals` row, on one exact draft version | Cleared, prepared, ready, or published |
| Cleared | Every asset the placement uses, and the sponsored placement itself when one exists, has `cleared` | The issue is ready |
| Prepared | A server record that the exact version is client-approved, editorially approved, and cleared | The issue is ready |
| Ready | The issue passed the readiness function and is `ISSUE_READY` | A flag the browser set |
| Published | A snapshot exists and the issue is `ISSUE_PUBLISHED` | The R8 project marker `PUBLISHED` |

## Issue lifecycle

Forward transitions, and only these, are valid:

| From | To | Server condition |
|---|---|---|
| `ISSUE_DRAFT` | `ISSUE_ASSEMBLY` | `design.layout.manage` opened it. No section, placement, or cover is accepted before this |
| `ISSUE_ASSEMBLY` | `ISSUE_PREPARATION` | At least one section, one placement, and a complete cover exist |
| `ISSUE_PREPARATION` | `ISSUE_READY` | The readiness function passes |
| `ISSUE_READY` | `ISSUE_ASSEMBLY` | A placement, section, or cover edit invalidated readiness |
| `ISSUE_READY` | `ISSUE_SCHEDULED` | One pending schedule, run time still ahead, readiness still true |
| `ISSUE_SCHEDULED` | `ISSUE_READY` | The pending schedule was cancelled, or the worker refused it |
| `ISSUE_SCHEDULED` | `ISSUE_PUBLISHING` | Inside the publish transaction only, after a fresh readiness check |
| `ISSUE_READY` | `ISSUE_PUBLISHING` | Same rule, for publish-now |
| `ISSUE_PUBLISHING` | `ISSUE_PUBLISHED` | The snapshot insert committed |
| `ISSUE_PUBLISHED` | `ISSUE_ARCHIVED` | `publication.publish` archive command. History and the snapshot remain |

No other edge exists. `ISSUE_ARCHIVED` accepts no later transition. A caller cannot choose an arbitrary target. The command computes the next state.

`ISSUE_PUBLISHING` never appears as a successful response state. If the transaction rolls back, the issue is still scheduled or ready, and no snapshot exists.

Publication does not call `workflow.move` and does not update `production.projects.state`.

## Readiness

The readiness function fails closed unless every line is true:

- the publication is the tenant's single public edition
- the issue has title, slug, season, and theme, and the slug is unique in the publication
- the cover has headline, dek, alt text, and a story that is a placement on this issue
- at least one section and at least one placement exist
- every placement pins the current approved draft version, not an older or unapproved version
- every placed version has an editorial approval and a client approval on that same version id
- every asset used by a placement is `cleared` under the R8 rule
- every sponsored placement on the issue is `cleared` under the same four-flag rule
- placed articles have author, summary, alt text, and a non-empty body on the pinned version
- page order is contiguous from 1

Approval without clearance fails. Clearance without preparation fails. Preparation without this function failing closed is not readiness.

## Schedule and worker

A schedule is allowed only from `ISSUE_READY`, only when readiness still passes, and only for a time the server considers still ahead. One pending schedule exists per issue.

The same idempotency key and the same run time replay. The same key and a different run time conflict until the pending schedule is cancelled.

The worker, when implementation exists, loads due pending schedules and runs the publish command again. It re-checks readiness at run time. It does not trust the check made when the schedule was created. If readiness fails, the schedule becomes `FAILED`, the issue returns to `ISSUE_READY`, and nothing is published.

The snapshot actor is the organization membership that created the schedule, or the membership that called publish-now. It is not the worker's process name and not a name from the browser.

## Public projection

A public read returns an issue only when its state is `ISSUE_PUBLISHED` or `ISSUE_ARCHIVED`, and only the snapshot's version ids. Draft, assembly, preparation, ready, scheduled, and in-flight issues are not filtered after a query that already selected them. They are not selected.

Personal shelves resolve only snapshot article identities. If a featured article is not in a published or archived snapshot, the shelf omits it. The shelf does not fall back to the working draft.

Existing shelf identities Arjun Mehta, Sophia Reynolds, and Daniel Kim stay. Field Notes and The Ledger are qualification shelves for the same rule. This freeze does not delete or rename the existing three.

## Fixtures the later qualification must build

These are requirements for tests after implementation authorization. This freeze does not seed them.

### Issue 12 — The Measured Room

An issue already published on one exact draft version. The public homepage, current issue, contents, reader, pages, thumbnails, type size, fullscreen, keyboard arrows, article links, archive, author, search, and personal shelves render that version. A later draft version of the same editorial work does not change the public issue. The snapshot still names the published version number and digest.

### Meridian

Premium issue. While unpublished it is absent from premium, archive, search, sitemap, public listings, direct public URLs, and API projections, including as a count. The path is ready, then schedule, then published. Publish again returns the original snapshot and does not insert another. A second schedule time on the same key conflicts until the first schedule is cancelled.

### Winter Index

A placed story is editorially approved and not cleared. Harbor Press is a sponsored placement and not cleared. Mark ready is denied. After the story is cleared, Harbor Press is cleared, the story is prepared, and the issue is prepared, mark ready can succeed. Not before.

### The Unset Table

Starts `ISSUE_DRAFT`. Open assembly, add a section, place one existing canonical article, set the cover, prepare the story, and only then validate and mark ready. The public article URL stays unavailable until publication. The article count does not increase when it is placed.

## Activity versus audit

Desk reads must not return `audit.audit_events` as a public payload. Every mutation in the API matrix writes an audit event in the same transaction as the business row. The actor is the authenticated membership. A failed audit rolls the business write back.
