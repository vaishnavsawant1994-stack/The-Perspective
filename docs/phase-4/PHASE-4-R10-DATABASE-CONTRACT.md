# R10 database contract

STATUS: **PART OF THE R10 G0 FREEZE — NOT AN IMPLEMENTATION**

PostgreSQL is the authority. The migration is new. Accepted R2–R9 migrations are not edited.

Runtime role remains `NOSUPERUSER` and `NOBYPASSRLS`. It receives `SELECT` on R10 tables and `EXECUTE` on the command functions. It does not receive `INSERT`, `UPDATE`, or `DELETE`. Mutations go through `media.r10_execute`, which is `SECURITY DEFINER` and re-reads `platform.current_organization_id()`.

Every tenant table has `id`, `owner_organization_id`, `row_version` where the row is mutable, `created_at`, and a resource id where the row is an aggregate. Child rows use `ON DELETE RESTRICT`. Slugs are unique per owner or per show. Campaign items are unique per campaign, source kind, and source id. Delivery evidence is unique per item.

| Table | Mutable | Immutable after write | Concurrency |
|---|---|---|---|
| `media.podcast_shows` | state, row version | id, owner, resource | row version |
| `media.podcast_episodes` | title, state, run time, row version | id, owner, show | expected row version |
| `media.podcast_guests` | none | name, role, episode | parent version |
| `media.video_projects` | title, state, run time, digest, row version | id, owner | expected row version. Digest is server-written |
| `media.events` | state, row version | id, owner, starts_at | expected row version |
| `media.event_agenda_items` | none | title, order | parent must be open to change |
| `media.event_participants` | none | name, kind | same |
| `media.event_registrations` | state | name | record only while the event is open |
| `distribution.campaigns` | state, launched time, actor, row version | id, owner, name | expected row version, row lock on launch |
| `distribution.campaign_targets` | none | channel, label, trusted | trusted is server-written |
| `distribution.campaign_items` | state, row version | source kind, source id | unique source |
| `distribution.delivery_evidence` | none | url, snapshot id, digest, verifier, verified time | one row per item |

Checks reject any state token outside the domain document. `CAMPAIGN_LAUNCHING` is a check-legal token so the launch transaction can use it, and a resting row must not remain there after commit.

RLS is enabled and forced. The policy is `owner_organization_id = platform.current_organization_id()` for `perspective_runtime`. `perspective_public` has no table privileges. `distribution.r10_public_delivery` is `SECURITY DEFINER` and returns only the published-issue projection.

Audit uses `audit.audit_events`. Idempotency uses `platform.idempotency_receipts` with scope `r10.{command}`. Both are written in the same function as the business change. There is no delete path.
