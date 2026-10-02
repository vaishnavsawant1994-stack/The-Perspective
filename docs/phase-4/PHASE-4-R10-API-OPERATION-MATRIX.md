# R10 API operation matrix

STATUS: **PART OF THE R10 G0 FREEZE — NOT AN IMPLEMENTATION**

All mutations are `POST` under `/api/v1/r10`. They require a team session, same origin, an idempotency key, and the permission on that row. The body cannot carry actor, organization, status, state, url, delivered, verifier, trusted, or digest. Unknown paths return 400. Foreign ids return 404.

| Method and path | Command | Permission | Owner |
|---|---|---|---|
| `GET /shows` | list | `podcast.dashboard.view` | Human read |
| `POST /shows` | `create-show` | `podcast.episode.edit` | Human request |
| `POST /episodes` | `create-episode` | `podcast.episode.edit` | Human request |
| `POST /episodes/{id}/edit` | `edit-episode` | `podcast.episode.edit` | Human request |
| `POST /episodes/{id}/guests` | `add-guest` | `podcast.guest.manage` | Human request |
| `POST /episodes/{id}/review` | `review-episode` | `podcast.review` | Human request |
| `POST /episodes/{id}/return` | `return-episode` | `podcast.review` | Human request |
| `POST /episodes/{id}/schedule` | `schedule-episode` | `podcast.schedule.manage` | Human request |
| `POST /episodes/{id}/archive` | `archive-episode` | `podcast.schedule.manage` | Human request |
| `GET /videos` | list | `video.dashboard.view` | Human read |
| `POST /videos` | `create-video` | `video.edit` | Human request |
| `POST /videos/{id}/edit` | `edit-video` | `video.edit` | Human request |
| `POST /videos/{id}/review` | `review-video` | `video.review` | Human request |
| `POST /videos/{id}/return` | `return-video` | `video.review` | Human request |
| `POST /videos/{id}/schedule` | `schedule-video` | `video.schedule.manage` | Human request |
| `POST /videos/{id}/prepare` | `prepare-video` | `video.publish.prepare` | Human request, server digest |
| `POST /videos/{id}/archive` | `archive-video` | `video.schedule.manage` | Human request |
| `GET /events` | list | `event.dashboard.view` | Human read |
| `POST /events` | `create-event` | `event.manage` | Human request |
| `POST /events/{id}/schedule` | `schedule-event` | `event.manage` | Human request |
| `POST /events/{id}/open` | `open-event` | `event.manage` | Human request |
| `POST /events/{id}/close` | `close-event` | `event.manage` | Human request |
| `POST /events/{id}/cancel` | `cancel-event` | `event.manage` | Human request |
| `POST /events/{id}/agenda` | `add-agenda` | `event.agenda.manage` | Human request |
| `POST /events/{id}/participants` | `add-participant` | `event.participant.manage` | Human request |
| `POST /events/{id}/registrations` | `record-registration` | `event.registration.manage` | Human request |
| `POST /registrations/{id}/cancel` | `cancel-registration` | `event.registration.manage` | Human request |
| `GET /campaigns` | list | `distribution.dashboard.view` | Human read |
| `GET /campaigns/{id}` | read | `distribution.campaign.view` | Human read |
| `POST /campaigns` | `create-campaign` | `distribution.campaign.manage` | Human request |
| `POST /campaigns/{id}/targets` | `add-target` | `distribution.campaign.manage` | Human request, server trust bit |
| `POST /campaigns/{id}/items` | `add-item` | `distribution.campaign.manage` | Human request |
| `POST /campaigns/{id}/launch` | `launch-campaign` | `distribution.launch` | Human request, server evidence |
| `POST /campaigns/{id}/close` | `close-campaign` | `distribution.campaign.manage` | Human request |
| `GET /public/deliveries/{slug}` | public read | none | Public read-only |
| `POST /api/v1/internal/r10/worker/reconcile` | reconcile | worker token | Worker, no mutation |

Launch also requires the registry obligations on `distribution.launch`: reason, recent authentication, MFA, and exact version. The reason stored for the obligation is the command name, not a browser paragraph.

Desks call only create and list. Review, schedule, prepare, registration, and launch stay on the API.
