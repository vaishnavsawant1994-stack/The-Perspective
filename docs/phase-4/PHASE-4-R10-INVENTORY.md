# R10 inventory

STATUS: **PART OF THE R10 G0 FREEZE — NOT AN IMPLEMENTATION**

Baseline inspected: `main` `024e4ae7d3b317fa86fbedc865bf7a44884f5b98`. No R10 branch, commit, or pull request existed. R1–R9 acceptance records are on that main.

## What R10 inherits and does not reopen

| Area | Inherited authority | R10 use |
|---|---|---|
| Identity, session, MFA | R3 | Desk and launch use the existing session. Launch requires recent authentication and MFA |
| Tenant and RLS | R4 `perspective_runtime` `NOSUPERUSER` `NOBYPASSRLS` | New tables force RLS. Missing `app.organization_id` returns no rows |
| Authorization | R5 evaluator, existing registry | No second engine. No new key |
| CRM, commercial, payments | R6–R7 | Not a distribution provider and not a ticket checkout |
| Editorial production | R8 projects, drafts, versions | Not modified. A project `DISTRIBUTION` marker is not a campaign |
| Publication | R9 issues and snapshots | Launch reads a published snapshot. It does not publish |

R9 public routes, the magazine reader, and the publishing desk stay as they are.

## Dormant keys that look related

| Key | Stamp | R10 decision |
|---|---|---|
| `distribution.campaign.manage`, `distribution.campaign.view`, `distribution.dashboard.view`, `distribution.launch` | R10 | Activate for the frozen commands |
| `podcast.*`, `video.*`, `event.*` | R8/R9 | Activate for the frozen commands. R8 and R9 refused them |
| `analytics.distribution.view` | R11 | Dormant |
| `report.view`, `report.create`, `report.approve` | R11 | Dormant |
| `renewal.view`, `renewal.edit`, `renewal.manage` | R11 | Dormant |
| `publish.execute`, `magazine.reader.publish` | R9 dormant | Stay dormant |
| `client.*` | R12 | Dormant |

## Capability matrix

| Capability | R9 state | R10 state | Owner | Permission | Persistence | API | UI | Test |
|---|---|---|---|---|---|---|---|---|
| Issue publication | Included | Inherited unchanged | Server | `publication.publish` | R9 snapshot | `/api/v1/r9` | Publishing desk | Inherited R9 |
| Podcast show and episode | Absent | Included | Human request, server state | `podcast.episode.edit`, `podcast.review`, `podcast.schedule.manage` | `media.podcast_*` | `/api/v1/r10` | `/app/podcasts/desk` | Database, hostile, browser |
| Podcast guest | Absent | Included | Human request, server state | `podcast.guest.manage` | `media.podcast_guests` | `/api/v1/r10` | API only | Database |
| Video project through prepare | Absent | Included | Human request, server digest | `video.edit`, `video.review`, `video.schedule.manage`, `video.publish.prepare` | `media.video_projects` | `/api/v1/r10` | `/app/videos/desk` | Database, hostile, browser |
| Event, agenda, participant | Absent | Included | Human request, server state | `event.manage`, `event.agenda.manage`, `event.participant.manage` | `media.events` and children | `/api/v1/r10` | `/app/events/desk` | Database, browser |
| Team-recorded registration | Absent | Included | Human request, server state | `event.registration.manage` | `media.event_registrations` | `/api/v1/r10` | API only | Database |
| Member self-registration | Fixture route | Deferred to R12 | Later | None | None | None | Fixture stays | Not R10 |
| Campaign, target, item | Absent | Included | Human request, server state | `distribution.campaign.manage` | `distribution.campaign*` | `/api/v1/r10` | `/app/distribution/desk` | Database, hostile, browser |
| SITE live-URL verification | Absent | Included | Server | `distribution.launch` | `distribution.delivery_evidence` | launch command | API only | Two sessions, public read |
| External delivery | Absent | Prohibited without a provider | Provider, absent | `distribution.launch` fails closed | Target row only | launch returns `PROVIDER_UNCONFIGURED` | None | Hostile and database |
| Public verified URL | Absent | Included, read-only | Public | None | Evidence joined to a published issue | `GET /api/v1/r10/public/deliveries/{slug}` | None | Database and browser |
| Reconcile worker | Absent | Included, non-mutating | Worker | Worker token, not a permission | No write | `/api/v1/internal/r10/worker/reconcile` | None | Hostile |
| Analytics and reports | Dormant | Deferred to R11 | Later | R11 keys | None | None | Fixture pages stay | Not R10 |
| Recording, transcripts, tickets | Catalog only | Deferred to R13 | Later | None | None | None | None | Not R10 |

## Ownership

| Operation | Owner |
|---|---|
| Create, edit, review, schedule, guest, agenda, participant, registration, campaign, target, item, close | Human/browser request. Server decides the next state |
| Digest, URL, verifier, trusted flag, `CAMPAIGN_LAUNCHING` | Server-owned |
| Reconcile | Worker-owned. It cannot deliver |
| External completion | Provider-owned, and no provider is configured, so it is prohibited |
| Verified URL read | Public read-only |
| Analytics, renewal, member registration, portal, transcripts, tickets | Later-release/dormant |

## Gaps this release closes

Persistence, domain, workflow, authorization binding, HTTP, the four desks, the public delivery projection, the non-mutating worker, and the tests named above.

## Gaps this release refuses

External provider integration beyond the fail-closed target, checkout, and every R11+ row in the matrix.
