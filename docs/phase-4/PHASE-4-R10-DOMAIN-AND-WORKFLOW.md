# R10 domain and workflow

STATUS: **PART OF THE R10 G0 FREEZE — NOT AN IMPLEMENTATION**

The browser may request a command. It may not name the resulting state. Illegal transitions return `INELIGIBLE` or `STALE_WRITE` and leave the stored state unchanged. Same idempotency key and same payload replay. Same key and a different payload conflict. A losing concurrent launch leaves one evidence set.

## Podcast episode

States: `EPISODE_DRAFT`, `EPISODE_REVIEW`, `EPISODE_SCHEDULED`, `EPISODE_ARCHIVED`.

| From | Command | Preconditions | Authority | To | Side effects |
|---|---|---|---|---|---|
| none | `create-show` | Title present | `podcast.episode.edit` | `SHOW_ACTIVE` | Show row, audit |
| `SHOW_ACTIVE` | `create-episode` | Show owned by the tenant | `podcast.episode.edit` | `EPISODE_DRAFT` | Episode row, audit |
| `EPISODE_DRAFT` | `edit-episode` | Expected version | `podcast.episode.edit` | `EPISODE_DRAFT` | Title changes, version increments |
| `EPISODE_DRAFT` or `EPISODE_REVIEW` | `add-guest` | Expected version, name present | `podcast.guest.manage` | unchanged | Guest row |
| `EPISODE_DRAFT` | `review-episode` | Expected version | `podcast.review` | `EPISODE_REVIEW` | Audit |
| `EPISODE_REVIEW` | `return-episode` | Expected version | `podcast.review` | `EPISODE_DRAFT` | Audit |
| `EPISODE_REVIEW` | `schedule-episode` | Expected version, `runAt` in the future | `podcast.schedule.manage` | `EPISODE_SCHEDULED` | Audit |
| draft, review, or scheduled | `archive-episode` | Expected version | `podcast.schedule.manage` | `EPISODE_ARCHIVED` | Audit |

Any other episode transition is illegal.

## Video project

States: `VIDEO_DRAFT`, `VIDEO_REVIEW`, `VIDEO_SCHEDULED`, `VIDEO_PREPARED`, `VIDEO_ARCHIVED`.

| From | Command | Preconditions | Authority | To | Side effects |
|---|---|---|---|---|---|
| none | `create-video` | Title present | `video.edit` | `VIDEO_DRAFT` | Row, audit |
| `VIDEO_DRAFT` | `edit-video` | Expected version | `video.edit` | `VIDEO_DRAFT` | Title, version |
| `VIDEO_DRAFT` | `review-video` | Expected version | `video.review` | `VIDEO_REVIEW` | Audit |
| `VIDEO_REVIEW` | `return-video` | Expected version | `video.review` | `VIDEO_DRAFT` | Audit |
| `VIDEO_REVIEW` | `schedule-video` | Expected version, future `runAt` | `video.schedule.manage` | `VIDEO_SCHEDULED` | Audit |
| `VIDEO_SCHEDULED` | `prepare-video` | Expected version | `video.publish.prepare` | `VIDEO_PREPARED` | Server digest. Not a delivery |
| draft, review, scheduled, or prepared | `archive-video` | Expected version | `video.schedule.manage` | `VIDEO_ARCHIVED` | Audit |

Prepare does not distribute. A second prepare is illegal.

## Event

States: `EVENT_DRAFT`, `EVENT_SCHEDULED`, `EVENT_OPEN`, `EVENT_CLOSED`, `EVENT_CANCELLED`.

| From | Command | Preconditions | Authority | To | Side effects |
|---|---|---|---|---|---|
| none | `create-event` | Title, future `startsAt` | `event.manage` | `EVENT_DRAFT` | Row, audit |
| `EVENT_DRAFT` | `schedule-event` | Expected version | `event.manage` | `EVENT_SCHEDULED` | Audit |
| `EVENT_SCHEDULED` | `open-event` | Expected version | `event.manage` | `EVENT_OPEN` | Audit |
| `EVENT_OPEN` | `close-event` | Expected version | `event.manage` | `EVENT_CLOSED` | Audit |
| draft, scheduled, or open | `cancel-event` | Expected version | `event.manage` | `EVENT_CANCELLED` | Audit |
| not closed or cancelled | `add-agenda` | Title | `event.agenda.manage` | unchanged | Agenda row |
| not closed or cancelled | `add-participant` | Name, kind `SPEAKER` or `PARTNER` | `event.participant.manage` | unchanged | Participant row |
| `EVENT_OPEN` | `record-registration` | Name | `event.registration.manage` | unchanged | `RECORDED` registration. No payment |
| `RECORDED` | `cancel-registration` | Registration id | `event.registration.manage` | `CANCELLED` | Audit |

A closed or cancelled event cannot take agenda, participants, or registrations. There is no ticket and no member self-registration.

## Distribution campaign

States: `CAMPAIGN_DRAFT`, `CAMPAIGN_LAUNCHING`, `CAMPAIGN_LAUNCHED`, `CAMPAIGN_CLOSED`.

`CAMPAIGN_LAUNCHING` is written only inside the launch transaction and is not a caller-visible resting state.

| From | Command | Preconditions | Authority | To | Side effects |
|---|---|---|---|---|---|
| none | `create-campaign` | Name | `distribution.campaign.manage` | `CAMPAIGN_DRAFT` | Row, audit |
| `CAMPAIGN_DRAFT` | `add-target` | Channel `SITE` or `EXTERNAL` | `distribution.campaign.manage` | unchanged | Server sets `trusted` true only for `SITE` |
| `CAMPAIGN_DRAFT` | `add-item` | Source kind and id owned by the tenant | `distribution.campaign.manage` | unchanged | `ITEM_PENDING` |
| `CAMPAIGN_DRAFT` | `launch-campaign` | Expected version, at least one SITE target, no EXTERNAL target, every item is a published or archived issue with a snapshot | `distribution.launch` | `CAMPAIGN_LAUNCHED` | One evidence row per item. URL and digest are server-owned |
| `CAMPAIGN_DRAFT` | `launch-campaign` | Any EXTERNAL target | `distribution.launch` | unchanged | `PROVIDER_UNCONFIGURED`. No evidence |
| `CAMPAIGN_LAUNCHED` | `close-campaign` | Expected version | `distribution.campaign.manage` | `CAMPAIGN_CLOSED` | Evidence remains |

A second launch key conflicts. Two concurrent launch sessions leave one evidence set. Launch does not change the issue or the project.

## Public read

`r10_public_delivery` returns slug, url, and verified time only when one SITE evidence URL matches `/magazine/read/{slug}` for a published or archived issue. Zero matches or two different URLs return null. Draft titles are absent.

## Rollback

The command, the evidence rows, the idempotency receipt, and the audit event commit together. A unique violation or a forced audit collision rolls the function back. No launched campaign remains without its receipt.
