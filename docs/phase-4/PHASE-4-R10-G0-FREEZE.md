# P4-R10-G0 — Media, Events & Distribution Engine Freeze

STATUS: **DRAFT FOR OWNER FREEZE — IMPLEMENTATION NOT AUTHORIZED**
PHASE: R10
NAME: Media, Events & Distribution Engine
BASE: `main` `024e4ae7d3b317fa86fbedc865bf7a44884f5b98`
R9 RECORD: `docs/phase-4/PHASE-4-R9-COMPLETION-RECORD.md`
R9 PRODUCT MERGE: Pull request #15, `a54c0fb5c7ac02be6c5c6225af5529456369c291`
R9 RECORD MERGE: Pull request #16, `024e4ae7d3b317fa86fbedc865bf7a44884f5b98`
PLANNING AUTHORIZATION: the owner's R10 end-to-end directive after R9 acceptance. That directive authorizes this planning package and, after this freeze is accepted, the implementation that follows it. It does not authorize R11.
IMPLEMENTATION: **NOT AUTHORIZED BY THIS FILE ALONE**
R11–R14: **STILL LOCKED**
NO DESIGN 154
NO PAGE 58+

This file is the controlling R10 contract. These companions in the same commit are part of the freeze:

- `PHASE-4-R10-INVENTORY.md`
- `PHASE-4-R10-DOMAIN-AND-WORKFLOW.md`
- `PHASE-4-R10-API-OPERATION-MATRIX.md`
- `PHASE-4-R10-DATABASE-CONTRACT.md`
- `PHASE-4-R10-SECURITY-AND-QUALIFICATION.md`
- `PHASE-4-R10-PROVIDER-TRUST-BOUNDARY.md`

If a companion disagrees with this file, this file wins until an owner addendum says otherwise.

## Authority reconciliation

The documents do not use one sentence for R10.

| Source | What it says | How this freeze uses it |
|---|---|---|
| Master bible, R10 | Podcast/video production, event operations, channel/target integrations, distribution campaigns/items, live-URL verification, and delivery evidence | Product ceiling |
| Permission registry | `distribution.*` stamped R10. `podcast.*`, `video.*`, and `event.*` stamped `R8/R9` | Existing keys only. The `R8/R9` stamp is the earliest stage, not a grant. R8 and R9 left those keys dormant |
| R9 acceptance | R10 planning may open. R10 implementation was not authorized. Distribution is not publishing | This freeze is that planning gate |
| Phase-2 entity catalog | Recording sessions, transcripts, shoots, scripts, captions, tickets, check-in, and many more | Not this release. Those rows are R13 media operations or R12 member/portal work unless a key in this freeze names them |

The stricter boundary wins. R10 does not add a permission key. It does not activate `analytics.distribution.view`, `report.*`, `renewal.*`, `publish.execute`, or any `client.*` key.

## Objective

R10 takes work that already exists inside The Perspective and records how that work is operated as media, as an event, and as a distribution.

Publishing an issue stays an R9 command. R10 does not call `publication.publish` and does not change `production.projects.state`.

Distribution to the publication's own site is verification of an R9 snapshot that is already public. It is not a second publish. The verified URL is derived by the server as `/magazine/read/{slug}`. A browser-supplied URL is not evidence.

An external channel can be recorded. It cannot be completed. No trusted external provider is configured in this release. No configured trusted provider means fail closed. A test must not invent a delivered external item.

## Scope

R10 includes only:

- tenant-scoped podcast shows, episodes, guests, review, and schedule
- tenant-scoped video projects, review, schedule, and an exact-version prepare step
- tenant-scoped events, agenda items, participants, and team-recorded registrations
- distribution campaigns, site or external targets, and items that point at an issue, episode, video, or event
- one launch command that writes delivery evidence only for a published or archived R9 issue on the internal SITE channel
- a public read of that verified URL, and nothing else
- a worker that is not allowed to forge delivery
- team desks that can create and list. They do not grant authority by being opened

## Non-scope

R10 does not include:

- R11 search, SEO, analytics, reporting, automation, renewal, or `analytics.distribution.view`
- R12 member registration, client portal, or replacement of the fixture podcast, video, and event pages
- R13 recording sessions, transcripts, shoots, scripts, captions, thumbnails, tickets, check-in, stored provider secrets, or outbound email
- R14 production certification
- checkout, packages, subscriptions, or entitlements
- a new permission key or a second authorization system
- a change to an R8 project state or an R9 issue state
- Design 154 or a page 58+

## Permission freeze

No new key. An implementation may activate only these existing keys, and only for the commands in the API matrix:

| Key | Boundary |
|---|---|
| `podcast.dashboard.view`, `podcast.episode.view` | Show and episode reads |
| `podcast.episode.edit` | Create a show, create or edit a draft episode |
| `podcast.guest.manage` | Add a guest |
| `podcast.review` | Review or return an episode |
| `podcast.schedule.manage` | Schedule or archive an episode |
| `video.dashboard.view`, `video.view` | Video reads |
| `video.edit` | Create or edit a draft video |
| `video.review` | Review or return a video |
| `video.schedule.manage` | Schedule or archive a video |
| `video.publish.prepare` | Prepare one scheduled video. Not distribution |
| `event.dashboard.view`, `event.view` | Event reads |
| `event.manage` | Create, schedule, open, close, or cancel an event |
| `event.agenda.manage` | Add an agenda item |
| `event.participant.manage` | Add a participant |
| `event.registration.manage` | Record or cancel a team-entered registration |
| `distribution.dashboard.view`, `distribution.campaign.view` | Campaign reads |
| `distribution.campaign.manage` | Create a campaign, add a target, add an item, close a launched campaign |
| `distribution.launch` | Launch one draft campaign. Reason, recent authentication, MFA, and exact version are required |

These stay dormant: `analytics.distribution.view`, `report.*`, `renewal.*`, `publish.execute`, `magazine.reader.publish`, and every `client.*` key.

## Lifecycle

Stored tokens are defined in `PHASE-4-R10-DOMAIN-AND-WORKFLOW.md`. A caller cannot set a state by name. `CAMPAIGN_LAUNCHING` exists only inside the launch transaction.

```text
prepared ≠ launched ≠ delivered
published ≠ distributed
external target ≠ trusted provider
```

## Gate

This document is G0. Implementation starts only after an acceptance record names this freeze and a separate implementation authorization names that acceptance. Until then, no R10 table or route is authorized by this file.
