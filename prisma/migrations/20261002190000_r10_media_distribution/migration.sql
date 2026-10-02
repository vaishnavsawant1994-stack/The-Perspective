-- R10 media, events, and distribution. Does not edit an accepted migration.
-- Runtime remains NOSUPERUSER NOBYPASSRLS. Mutations go through media.r10_execute.

CREATE SCHEMA IF NOT EXISTS media;
CREATE SCHEMA IF NOT EXISTS distribution;
GRANT USAGE ON SCHEMA media, distribution TO perspective_runtime, perspective_public;

CREATE FUNCTION media.r10_slug(p_value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(left(trim(both '-' FROM regexp_replace(lower(btrim(COALESCE(p_value, ''))), '[^a-z0-9]+', '-', 'g')), 80), '');
$$;

CREATE TABLE media.podcast_shows (
  id uuid PRIMARY KEY,
  resource_id uuid NOT NULL UNIQUE,
  owner_organization_id uuid NOT NULL,
  slug text NOT NULL,
  title text NOT NULL,
  state text NOT NULL,
  row_version integer NOT NULL DEFAULT 1,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT podcast_shows_owner_slug_key UNIQUE (owner_organization_id, slug),
  CONSTRAINT podcast_shows_id_owner_key UNIQUE (id, owner_organization_id),
  CONSTRAINT podcast_shows_state_check CHECK (state IN ('SHOW_DRAFT', 'SHOW_ACTIVE', 'SHOW_ARCHIVED'))
);

CREATE TABLE media.podcast_episodes (
  id uuid PRIMARY KEY,
  resource_id uuid NOT NULL UNIQUE,
  owner_organization_id uuid NOT NULL,
  show_id uuid NOT NULL,
  slug text NOT NULL,
  title text NOT NULL,
  state text NOT NULL,
  run_at timestamptz(6),
  row_version integer NOT NULL DEFAULT 1,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT podcast_episodes_show_slug_key UNIQUE (show_id, slug),
  CONSTRAINT podcast_episodes_id_owner_key UNIQUE (id, owner_organization_id),
  CONSTRAINT podcast_episodes_state_check CHECK (state IN ('EPISODE_DRAFT', 'EPISODE_REVIEW', 'EPISODE_SCHEDULED', 'EPISODE_ARCHIVED')),
  CONSTRAINT podcast_episodes_show_fkey FOREIGN KEY (show_id, owner_organization_id)
    REFERENCES media.podcast_shows (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE media.podcast_guests (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  episode_id uuid NOT NULL,
  name text NOT NULL,
  guest_role text NOT NULL,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT podcast_guests_episode_fkey FOREIGN KEY (episode_id, owner_organization_id)
    REFERENCES media.podcast_episodes (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE media.video_projects (
  id uuid PRIMARY KEY,
  resource_id uuid NOT NULL UNIQUE,
  owner_organization_id uuid NOT NULL,
  slug text NOT NULL,
  title text NOT NULL,
  state text NOT NULL,
  run_at timestamptz(6),
  digest text,
  row_version integer NOT NULL DEFAULT 1,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT video_projects_owner_slug_key UNIQUE (owner_organization_id, slug),
  CONSTRAINT video_projects_state_check CHECK (state IN ('VIDEO_DRAFT', 'VIDEO_REVIEW', 'VIDEO_SCHEDULED', 'VIDEO_PREPARED', 'VIDEO_ARCHIVED'))
);

CREATE TABLE media.events (
  id uuid PRIMARY KEY,
  resource_id uuid NOT NULL UNIQUE,
  owner_organization_id uuid NOT NULL,
  slug text NOT NULL,
  title text NOT NULL,
  starts_at timestamptz(6) NOT NULL,
  state text NOT NULL,
  row_version integer NOT NULL DEFAULT 1,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT events_owner_slug_key UNIQUE (owner_organization_id, slug),
  CONSTRAINT events_id_owner_key UNIQUE (id, owner_organization_id),
  CONSTRAINT events_state_check CHECK (state IN ('EVENT_DRAFT', 'EVENT_SCHEDULED', 'EVENT_OPEN', 'EVENT_CLOSED', 'EVENT_CANCELLED'))
);

CREATE TABLE media.event_agenda_items (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  event_id uuid NOT NULL,
  title text NOT NULL,
  sort_order integer NOT NULL,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT event_agenda_event_fkey FOREIGN KEY (event_id, owner_organization_id)
    REFERENCES media.events (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE media.event_participants (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  event_id uuid NOT NULL,
  name text NOT NULL,
  kind text NOT NULL,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT event_participants_kind_check CHECK (kind IN ('SPEAKER', 'PARTNER')),
  CONSTRAINT event_participants_event_fkey FOREIGN KEY (event_id, owner_organization_id)
    REFERENCES media.events (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE media.event_registrations (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  event_id uuid NOT NULL,
  registrant_name text NOT NULL,
  state text NOT NULL,
  row_version integer NOT NULL DEFAULT 1,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT event_registrations_state_check CHECK (state IN ('RECORDED', 'CANCELLED')),
  CONSTRAINT event_registrations_event_fkey FOREIGN KEY (event_id, owner_organization_id)
    REFERENCES media.events (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE distribution.campaigns (
  id uuid PRIMARY KEY,
  resource_id uuid NOT NULL UNIQUE,
  owner_organization_id uuid NOT NULL,
  name text NOT NULL,
  state text NOT NULL,
  row_version integer NOT NULL DEFAULT 1,
  launched_at timestamptz(6),
  actor_membership_id uuid,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT campaigns_state_check CHECK (state IN ('CAMPAIGN_DRAFT', 'CAMPAIGN_LAUNCHING', 'CAMPAIGN_LAUNCHED', 'CAMPAIGN_CLOSED'))
);
CREATE UNIQUE INDEX campaigns_id_owner_key ON distribution.campaigns (id, owner_organization_id);

CREATE TABLE distribution.campaign_targets (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  campaign_id uuid NOT NULL,
  channel text NOT NULL,
  label text NOT NULL,
  trusted boolean NOT NULL,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT campaign_targets_channel_check CHECK (channel IN ('SITE', 'EXTERNAL')),
  CONSTRAINT campaign_targets_trust_check CHECK ((channel = 'SITE' AND trusted) OR (channel = 'EXTERNAL' AND NOT trusted)),
  CONSTRAINT campaign_targets_unique UNIQUE (campaign_id, channel, label),
  CONSTRAINT campaign_targets_campaign_fkey FOREIGN KEY (campaign_id, owner_organization_id)
    REFERENCES distribution.campaigns (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE distribution.campaign_items (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  campaign_id uuid NOT NULL,
  source_kind text NOT NULL,
  source_id uuid NOT NULL,
  state text NOT NULL,
  row_version integer NOT NULL DEFAULT 1,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT campaign_items_kind_check CHECK (source_kind IN ('ISSUE', 'PODCAST_EPISODE', 'VIDEO_PROJECT', 'EVENT')),
  CONSTRAINT campaign_items_state_check CHECK (state IN ('ITEM_PENDING', 'ITEM_DELIVERED')),
  CONSTRAINT campaign_items_id_owner_key UNIQUE (id, owner_organization_id),
  CONSTRAINT campaign_items_unique UNIQUE (campaign_id, source_kind, source_id),
  CONSTRAINT campaign_items_campaign_fkey FOREIGN KEY (campaign_id, owner_organization_id)
    REFERENCES distribution.campaigns (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE distribution.delivery_evidence (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  item_id uuid NOT NULL UNIQUE,
  url text NOT NULL,
  snapshot_id uuid NOT NULL,
  digest text NOT NULL,
  verifier text NOT NULL,
  verified_at timestamptz(6) NOT NULL,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT delivery_evidence_verifier_check CHECK (verifier = 'SITE_PUBLICATION'),
  CONSTRAINT delivery_evidence_url_check CHECK (url ~ '^/magazine/read/[a-z0-9-]{1,80}$'),
  CONSTRAINT delivery_evidence_item_fkey FOREIGN KEY (item_id, owner_organization_id)
    REFERENCES distribution.campaign_items (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE INDEX podcast_episodes_owner_idx ON media.podcast_episodes (owner_organization_id);
CREATE INDEX video_projects_owner_idx ON media.video_projects (owner_organization_id);
CREATE INDEX events_owner_idx ON media.events (owner_organization_id);
CREATE INDEX campaigns_owner_idx ON distribution.campaigns (owner_organization_id);

CREATE FUNCTION media.r10_execute(
  p_command text,
  p_actor_membership_id uuid,
  p_payload jsonb,
  p_receipt_id uuid,
  p_audit_id uuid,
  p_idempotency_key text,
  p_request_hash text,
  p_request_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, media, distribution, production, platform, audit, iam
AS $r10$
DECLARE
  v_owner uuid;
  v_actor_user uuid;
  v_now timestamptz;
  v_existing_hash text;
  v_existing_state text;
  v_result jsonb;
  v_id uuid;
  v_slug text;
  v_n integer;
  v_version integer;
  v_state text;
  v_show uuid;
  v_run timestamptz;
  v_campaign uuid;
  v_item record;
  v_issue production.issues%ROWTYPE;
  v_snapshot uuid;
  v_digest text;
  v_url text;
BEGIN
  v_owner := platform.current_organization_id();
  v_now := clock_timestamp();
  IF v_owner IS NULL
     OR p_actor_membership_id IS NULL
     OR p_receipt_id IS NULL
     OR p_audit_id IS NULL
     OR p_payload IS NULL
     OR NULLIF(btrim(p_request_id), '') IS NULL
     OR p_request_hash !~ '^[0-9a-f]{64}$'
     OR p_command !~ '^[a-z-]{3,40}$'
     OR p_idempotency_key !~ ('^r10:' || p_command || ':' || v_owner::text || ':[A-Za-z0-9._:-]{8,128}$')
     OR p_payload ?| ARRAY['actor','organizationId','status','state','url','delivered','verifier','trusted','digest','ready','publisher','membershipId']
  THEN
    RAISE EXCEPTION 'invalid R10 command' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM iam.organization_memberships AS membership
     WHERE membership.id = p_actor_membership_id
       AND membership.organization_id = v_owner
       AND membership.membership_type = 'STAFF'
       AND membership.status = 'ACTIVE'
       AND membership.ended_at IS NULL
  ) THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
  END IF;

  SELECT request_hash, state
    INTO v_existing_hash, v_existing_state
    FROM platform.idempotency_receipts
   WHERE owner_organization_id = v_owner
     AND scope = 'r10.' || p_command
     AND idempotency_key = p_idempotency_key
   FOR UPDATE;
  IF FOUND THEN
    IF v_existing_hash IS DISTINCT FROM p_request_hash THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'IDEMPOTENCY_CONFLICT');
    END IF;
    IF v_existing_state = 'COMPLETED' THEN
      RETURN (
        SELECT jsonb_build_object('kind', 'ok', 'code', 'REPLAY') || event.redacted_diff
          FROM audit.audit_events AS event
         WHERE event.owner_organization_id = v_owner
           AND event.idempotency_key = p_idempotency_key
           AND event.action = 'r10.' || p_command
         LIMIT 1
      );
    END IF;
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
  END IF;

  IF p_command = 'create-show' THEN
    v_slug := media.r10_slug(p_payload->>'title');
    IF v_slug IS NULL THEN RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID'); END IF;
    v_n := 1;
    WHILE EXISTS (SELECT 1 FROM media.podcast_shows WHERE owner_organization_id = v_owner AND slug = v_slug) LOOP
      v_n := v_n + 1;
      v_slug := left(media.r10_slug(p_payload->>'title') || '-' || v_n::text, 80);
      EXIT WHEN v_n > 50;
    END LOOP;
    v_id := gen_random_uuid();
    INSERT INTO platform.resources (id, resource_type, title, owner_organization_id, visibility, sensitivity, created_at)
    VALUES (v_id, 'podcast-show', left(btrim(p_payload->>'title'), 200), v_owner, 'INTERNAL', 'STANDARD', v_now);
    INSERT INTO media.podcast_shows (id, resource_id, owner_organization_id, slug, title, state, row_version, created_at, updated_at)
    VALUES (v_id, v_id, v_owner, v_slug, left(btrim(p_payload->>'title'), 200), 'SHOW_ACTIVE', 1, v_now, v_now);
    v_result := jsonb_build_object('showId', v_id, 'slug', v_slug, 'state', 'SHOW_ACTIVE', 'rowVersion', 1);

  ELSIF p_command = 'create-episode' THEN
    SELECT id, state INTO v_show, v_state FROM media.podcast_shows
     WHERE id = (p_payload->>'showId')::uuid AND owner_organization_id = v_owner FOR UPDATE;
    IF NOT FOUND OR v_state <> 'SHOW_ACTIVE' THEN RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND'); END IF;
    v_slug := media.r10_slug(p_payload->>'title');
    IF v_slug IS NULL THEN RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID'); END IF;
    v_n := 1;
    WHILE EXISTS (SELECT 1 FROM media.podcast_episodes WHERE show_id = v_show AND slug = v_slug) LOOP
      v_n := v_n + 1;
      v_slug := left(media.r10_slug(p_payload->>'title') || '-' || v_n::text, 80);
      EXIT WHEN v_n > 50;
    END LOOP;
    v_id := gen_random_uuid();
    INSERT INTO platform.resources (id, resource_type, title, owner_organization_id, visibility, sensitivity, created_at)
    VALUES (v_id, 'podcast-episode', left(btrim(p_payload->>'title'), 200), v_owner, 'INTERNAL', 'STANDARD', v_now);
    INSERT INTO media.podcast_episodes (id, resource_id, owner_organization_id, show_id, slug, title, state, row_version, created_at, updated_at)
    VALUES (v_id, v_id, v_owner, v_show, v_slug, left(btrim(p_payload->>'title'), 200), 'EPISODE_DRAFT', 1, v_now, v_now);
    v_result := jsonb_build_object('episodeId', v_id, 'showId', v_show, 'slug', v_slug, 'state', 'EPISODE_DRAFT', 'rowVersion', 1);

  ELSIF p_command IN ('edit-episode', 'review-episode', 'return-episode', 'schedule-episode', 'archive-episode', 'add-guest') THEN
    IF COALESCE(p_payload->>'expectedRowVersion', '') !~ '^[0-9]+$' THEN RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID'); END IF;
    SELECT row_version, state, id INTO v_version, v_state, v_id FROM media.podcast_episodes
     WHERE id = (p_payload->>'episodeId')::uuid AND owner_organization_id = v_owner FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND'); END IF;
    IF v_version <> (p_payload->>'expectedRowVersion')::integer THEN RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE'); END IF;
    IF p_command = 'add-guest' THEN
      IF v_state NOT IN ('EPISODE_DRAFT', 'EPISODE_REVIEW') OR NULLIF(btrim(p_payload->>'name'), '') IS NULL OR NULLIF(btrim(p_payload->>'role'), '') IS NULL THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      INSERT INTO media.podcast_guests (id, owner_organization_id, episode_id, name, guest_role)
      VALUES (gen_random_uuid(), v_owner, v_id, left(btrim(p_payload->>'name'), 200), left(btrim(p_payload->>'role'), 80));
      UPDATE media.podcast_episodes SET row_version = row_version + 1, updated_at = v_now WHERE id = v_id;
      v_result := jsonb_build_object('episodeId', v_id, 'state', v_state, 'rowVersion', v_version + 1);
    ELSIF p_command = 'edit-episode' THEN
      IF v_state <> 'EPISODE_DRAFT' OR NULLIF(btrim(p_payload->>'title'), '') IS NULL THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      UPDATE media.podcast_episodes SET title = left(btrim(p_payload->>'title'), 200), row_version = row_version + 1, updated_at = v_now WHERE id = v_id;
      v_result := jsonb_build_object('episodeId', v_id, 'state', v_state, 'rowVersion', v_version + 1);
    ELSIF p_command = 'review-episode' AND v_state = 'EPISODE_DRAFT' THEN
      UPDATE media.podcast_episodes SET state = 'EPISODE_REVIEW', row_version = row_version + 1, updated_at = v_now WHERE id = v_id;
      v_result := jsonb_build_object('episodeId', v_id, 'state', 'EPISODE_REVIEW', 'rowVersion', v_version + 1);
    ELSIF p_command = 'return-episode' AND v_state = 'EPISODE_REVIEW' THEN
      UPDATE media.podcast_episodes SET state = 'EPISODE_DRAFT', row_version = row_version + 1, updated_at = v_now WHERE id = v_id;
      v_result := jsonb_build_object('episodeId', v_id, 'state', 'EPISODE_DRAFT', 'rowVersion', v_version + 1);
    ELSIF p_command = 'schedule-episode' AND v_state = 'EPISODE_REVIEW' THEN
      v_run := (p_payload->>'runAt')::timestamptz;
      IF v_run IS NULL OR v_run <= v_now THEN RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE'); END IF;
      UPDATE media.podcast_episodes SET state = 'EPISODE_SCHEDULED', run_at = v_run, row_version = row_version + 1, updated_at = v_now WHERE id = v_id;
      v_result := jsonb_build_object('episodeId', v_id, 'state', 'EPISODE_SCHEDULED', 'rowVersion', v_version + 1);
    ELSIF p_command = 'archive-episode' AND v_state IN ('EPISODE_DRAFT', 'EPISODE_REVIEW', 'EPISODE_SCHEDULED') THEN
      UPDATE media.podcast_episodes SET state = 'EPISODE_ARCHIVED', row_version = row_version + 1, updated_at = v_now WHERE id = v_id;
      v_result := jsonb_build_object('episodeId', v_id, 'state', 'EPISODE_ARCHIVED', 'rowVersion', v_version + 1);
    ELSE
      RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
    END IF;

  ELSIF p_command = 'create-video' THEN
    v_slug := media.r10_slug(p_payload->>'title');
    IF v_slug IS NULL THEN RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID'); END IF;
    v_n := 1;
    WHILE EXISTS (SELECT 1 FROM media.video_projects WHERE owner_organization_id = v_owner AND slug = v_slug) LOOP
      v_n := v_n + 1;
      v_slug := left(media.r10_slug(p_payload->>'title') || '-' || v_n::text, 80);
      EXIT WHEN v_n > 50;
    END LOOP;
    v_id := gen_random_uuid();
    INSERT INTO platform.resources (id, resource_type, title, owner_organization_id, visibility, sensitivity, created_at)
    VALUES (v_id, 'video-project', left(btrim(p_payload->>'title'), 200), v_owner, 'INTERNAL', 'STANDARD', v_now);
    INSERT INTO media.video_projects (id, resource_id, owner_organization_id, slug, title, state, row_version, created_at, updated_at)
    VALUES (v_id, v_id, v_owner, v_slug, left(btrim(p_payload->>'title'), 200), 'VIDEO_DRAFT', 1, v_now, v_now);
    v_result := jsonb_build_object('videoId', v_id, 'slug', v_slug, 'state', 'VIDEO_DRAFT', 'rowVersion', 1);

  ELSIF p_command IN ('edit-video', 'review-video', 'return-video', 'schedule-video', 'prepare-video', 'archive-video') THEN
    IF COALESCE(p_payload->>'expectedRowVersion', '') !~ '^[0-9]+$' THEN RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID'); END IF;
    SELECT row_version, state, id, title INTO v_version, v_state, v_id, v_slug FROM media.video_projects
     WHERE id = (p_payload->>'videoId')::uuid AND owner_organization_id = v_owner FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND'); END IF;
    IF v_version <> (p_payload->>'expectedRowVersion')::integer THEN RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE'); END IF;
    IF p_command = 'edit-video' AND v_state = 'VIDEO_DRAFT' AND NULLIF(btrim(p_payload->>'title'), '') IS NOT NULL THEN
      UPDATE media.video_projects SET title = left(btrim(p_payload->>'title'), 200), row_version = row_version + 1, updated_at = v_now WHERE id = v_id;
      v_result := jsonb_build_object('videoId', v_id, 'state', 'VIDEO_DRAFT', 'rowVersion', v_version + 1);
    ELSIF p_command = 'review-video' AND v_state = 'VIDEO_DRAFT' THEN
      UPDATE media.video_projects SET state = 'VIDEO_REVIEW', row_version = row_version + 1, updated_at = v_now WHERE id = v_id;
      v_result := jsonb_build_object('videoId', v_id, 'state', 'VIDEO_REVIEW', 'rowVersion', v_version + 1);
    ELSIF p_command = 'return-video' AND v_state = 'VIDEO_REVIEW' THEN
      UPDATE media.video_projects SET state = 'VIDEO_DRAFT', row_version = row_version + 1, updated_at = v_now WHERE id = v_id;
      v_result := jsonb_build_object('videoId', v_id, 'state', 'VIDEO_DRAFT', 'rowVersion', v_version + 1);
    ELSIF p_command = 'schedule-video' AND v_state = 'VIDEO_REVIEW' THEN
      v_run := (p_payload->>'runAt')::timestamptz;
      IF v_run IS NULL OR v_run <= v_now THEN RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE'); END IF;
      UPDATE media.video_projects SET state = 'VIDEO_SCHEDULED', run_at = v_run, row_version = row_version + 1, updated_at = v_now WHERE id = v_id;
      v_result := jsonb_build_object('videoId', v_id, 'state', 'VIDEO_SCHEDULED', 'rowVersion', v_version + 1);
    ELSIF p_command = 'prepare-video' AND v_state = 'VIDEO_SCHEDULED' THEN
      v_digest := md5(v_id::text || ':' || v_version::text || ':' || v_slug);
      UPDATE media.video_projects SET state = 'VIDEO_PREPARED', digest = v_digest, row_version = row_version + 1, updated_at = v_now WHERE id = v_id;
      v_result := jsonb_build_object('videoId', v_id, 'state', 'VIDEO_PREPARED', 'digest', v_digest, 'rowVersion', v_version + 1);
    ELSIF p_command = 'archive-video' AND v_state IN ('VIDEO_DRAFT', 'VIDEO_REVIEW', 'VIDEO_SCHEDULED', 'VIDEO_PREPARED') THEN
      UPDATE media.video_projects SET state = 'VIDEO_ARCHIVED', row_version = row_version + 1, updated_at = v_now WHERE id = v_id;
      v_result := jsonb_build_object('videoId', v_id, 'state', 'VIDEO_ARCHIVED', 'rowVersion', v_version + 1);
    ELSE
      RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
    END IF;

  ELSIF p_command = 'create-event' THEN
    v_slug := media.r10_slug(p_payload->>'title');
    v_run := (p_payload->>'startsAt')::timestamptz;
    IF v_slug IS NULL OR v_run IS NULL OR v_run <= v_now THEN RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID'); END IF;
    v_n := 1;
    WHILE EXISTS (SELECT 1 FROM media.events WHERE owner_organization_id = v_owner AND slug = v_slug) LOOP
      v_n := v_n + 1;
      v_slug := left(media.r10_slug(p_payload->>'title') || '-' || v_n::text, 80);
      EXIT WHEN v_n > 50;
    END LOOP;
    v_id := gen_random_uuid();
    INSERT INTO platform.resources (id, resource_type, title, owner_organization_id, visibility, sensitivity, created_at)
    VALUES (v_id, 'event', left(btrim(p_payload->>'title'), 200), v_owner, 'INTERNAL', 'STANDARD', v_now);
    INSERT INTO media.events (id, resource_id, owner_organization_id, slug, title, starts_at, state, row_version, created_at, updated_at)
    VALUES (v_id, v_id, v_owner, v_slug, left(btrim(p_payload->>'title'), 200), v_run, 'EVENT_DRAFT', 1, v_now, v_now);
    v_result := jsonb_build_object('eventId', v_id, 'slug', v_slug, 'state', 'EVENT_DRAFT', 'rowVersion', 1);

  ELSIF p_command IN ('schedule-event', 'open-event', 'close-event', 'cancel-event', 'add-agenda', 'add-participant', 'record-registration') THEN
    IF COALESCE(p_payload->>'expectedRowVersion', '') !~ '^[0-9]+$' THEN RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID'); END IF;
    SELECT row_version, state, id INTO v_version, v_state, v_id FROM media.events
     WHERE id = (p_payload->>'eventId')::uuid AND owner_organization_id = v_owner FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND'); END IF;
    IF v_version <> (p_payload->>'expectedRowVersion')::integer THEN RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE'); END IF;
    IF p_command = 'schedule-event' AND v_state = 'EVENT_DRAFT' THEN
      UPDATE media.events SET state = 'EVENT_SCHEDULED', row_version = row_version + 1, updated_at = v_now WHERE id = v_id;
      v_result := jsonb_build_object('eventId', v_id, 'state', 'EVENT_SCHEDULED', 'rowVersion', v_version + 1);
    ELSIF p_command = 'open-event' AND v_state = 'EVENT_SCHEDULED' THEN
      UPDATE media.events SET state = 'EVENT_OPEN', row_version = row_version + 1, updated_at = v_now WHERE id = v_id;
      v_result := jsonb_build_object('eventId', v_id, 'state', 'EVENT_OPEN', 'rowVersion', v_version + 1);
    ELSIF p_command = 'close-event' AND v_state = 'EVENT_OPEN' THEN
      UPDATE media.events SET state = 'EVENT_CLOSED', row_version = row_version + 1, updated_at = v_now WHERE id = v_id;
      v_result := jsonb_build_object('eventId', v_id, 'state', 'EVENT_CLOSED', 'rowVersion', v_version + 1);
    ELSIF p_command = 'cancel-event' AND v_state IN ('EVENT_DRAFT', 'EVENT_SCHEDULED', 'EVENT_OPEN') THEN
      UPDATE media.events SET state = 'EVENT_CANCELLED', row_version = row_version + 1, updated_at = v_now WHERE id = v_id;
      v_result := jsonb_build_object('eventId', v_id, 'state', 'EVENT_CANCELLED', 'rowVersion', v_version + 1);
    ELSIF p_command = 'add-agenda' AND v_state NOT IN ('EVENT_CLOSED', 'EVENT_CANCELLED') AND NULLIF(btrim(p_payload->>'title'), '') IS NOT NULL THEN
      SELECT COALESCE(max(sort_order), 0) + 1 INTO v_n FROM media.event_agenda_items WHERE event_id = v_id;
      INSERT INTO media.event_agenda_items (id, owner_organization_id, event_id, title, sort_order)
      VALUES (gen_random_uuid(), v_owner, v_id, left(btrim(p_payload->>'title'), 200), v_n);
      UPDATE media.events SET row_version = row_version + 1, updated_at = v_now WHERE id = v_id;
      v_result := jsonb_build_object('eventId', v_id, 'state', v_state, 'rowVersion', v_version + 1);
    ELSIF p_command = 'add-participant' AND v_state NOT IN ('EVENT_CLOSED', 'EVENT_CANCELLED')
          AND NULLIF(btrim(p_payload->>'name'), '') IS NOT NULL AND p_payload->>'kind' IN ('SPEAKER', 'PARTNER') THEN
      INSERT INTO media.event_participants (id, owner_organization_id, event_id, name, kind)
      VALUES (gen_random_uuid(), v_owner, v_id, left(btrim(p_payload->>'name'), 200), p_payload->>'kind');
      UPDATE media.events SET row_version = row_version + 1, updated_at = v_now WHERE id = v_id;
      v_result := jsonb_build_object('eventId', v_id, 'state', v_state, 'rowVersion', v_version + 1);
    ELSIF p_command = 'record-registration' AND v_state = 'EVENT_OPEN' AND NULLIF(btrim(p_payload->>'name'), '') IS NOT NULL THEN
      v_show := gen_random_uuid();
      INSERT INTO media.event_registrations (id, owner_organization_id, event_id, registrant_name, state)
      VALUES (v_show, v_owner, v_id, left(btrim(p_payload->>'name'), 200), 'RECORDED');
      UPDATE media.events SET row_version = row_version + 1, updated_at = v_now WHERE id = v_id;
      v_result := jsonb_build_object('eventId', v_id, 'registrationId', v_show, 'state', 'RECORDED', 'rowVersion', v_version + 1);
    ELSE
      RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
    END IF;

  ELSIF p_command = 'cancel-registration' THEN
    SELECT state, id, event_id INTO v_state, v_id, v_show FROM media.event_registrations
     WHERE id = (p_payload->>'registrationId')::uuid AND owner_organization_id = v_owner FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND'); END IF;
    IF v_state <> 'RECORDED' THEN RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE'); END IF;
    UPDATE media.event_registrations SET state = 'CANCELLED', row_version = row_version + 1 WHERE id = v_id;
    v_result := jsonb_build_object('registrationId', v_id, 'eventId', v_show, 'state', 'CANCELLED');

  ELSIF p_command = 'create-campaign' THEN
    IF NULLIF(btrim(p_payload->>'name'), '') IS NULL THEN RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID'); END IF;
    v_id := gen_random_uuid();
    INSERT INTO platform.resources (id, resource_type, title, owner_organization_id, visibility, sensitivity, created_at)
    VALUES (v_id, 'distribution-campaign', left(btrim(p_payload->>'name'), 200), v_owner, 'INTERNAL', 'STANDARD', v_now);
    INSERT INTO distribution.campaigns (id, resource_id, owner_organization_id, name, state, row_version, created_at, updated_at)
    VALUES (v_id, v_id, v_owner, left(btrim(p_payload->>'name'), 200), 'CAMPAIGN_DRAFT', 1, v_now, v_now);
    v_result := jsonb_build_object('campaignId', v_id, 'state', 'CAMPAIGN_DRAFT', 'rowVersion', 1);

  ELSIF p_command IN ('add-target', 'add-item', 'close-campaign') THEN
    IF COALESCE(p_payload->>'expectedRowVersion', '') !~ '^[0-9]+$' THEN RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID'); END IF;
    SELECT row_version, state, id INTO v_version, v_state, v_campaign FROM distribution.campaigns
     WHERE id = (p_payload->>'campaignId')::uuid AND owner_organization_id = v_owner FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND'); END IF;
    IF v_version <> (p_payload->>'expectedRowVersion')::integer THEN RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE'); END IF;
    IF p_command = 'add-target' AND v_state = 'CAMPAIGN_DRAFT' AND p_payload->>'channel' IN ('SITE', 'EXTERNAL') AND NULLIF(btrim(p_payload->>'label'), '') IS NOT NULL THEN
      INSERT INTO distribution.campaign_targets (id, owner_organization_id, campaign_id, channel, label, trusted)
      VALUES (gen_random_uuid(), v_owner, v_campaign, p_payload->>'channel', left(btrim(p_payload->>'label'), 200), p_payload->>'channel' = 'SITE');
      UPDATE distribution.campaigns SET row_version = row_version + 1, updated_at = v_now WHERE id = v_campaign;
      v_result := jsonb_build_object('campaignId', v_campaign, 'state', v_state, 'rowVersion', v_version + 1, 'trusted', p_payload->>'channel' = 'SITE');
    ELSIF p_command = 'add-item' AND v_state = 'CAMPAIGN_DRAFT' AND p_payload->>'sourceKind' IN ('ISSUE', 'PODCAST_EPISODE', 'VIDEO_PROJECT', 'EVENT') THEN
      IF p_payload->>'sourceKind' = 'ISSUE' AND NOT EXISTS (SELECT 1 FROM production.issues WHERE id = (p_payload->>'sourceId')::uuid AND owner_organization_id = v_owner) THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
      ELSIF p_payload->>'sourceKind' = 'PODCAST_EPISODE' AND NOT EXISTS (SELECT 1 FROM media.podcast_episodes WHERE id = (p_payload->>'sourceId')::uuid AND owner_organization_id = v_owner) THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
      ELSIF p_payload->>'sourceKind' = 'VIDEO_PROJECT' AND NOT EXISTS (SELECT 1 FROM media.video_projects WHERE id = (p_payload->>'sourceId')::uuid AND owner_organization_id = v_owner) THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
      ELSIF p_payload->>'sourceKind' = 'EVENT' AND NOT EXISTS (SELECT 1 FROM media.events WHERE id = (p_payload->>'sourceId')::uuid AND owner_organization_id = v_owner) THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
      END IF;
      INSERT INTO distribution.campaign_items (id, owner_organization_id, campaign_id, source_kind, source_id, state)
      VALUES (gen_random_uuid(), v_owner, v_campaign, p_payload->>'sourceKind', (p_payload->>'sourceId')::uuid, 'ITEM_PENDING');
      UPDATE distribution.campaigns SET row_version = row_version + 1, updated_at = v_now WHERE id = v_campaign;
      v_result := jsonb_build_object('campaignId', v_campaign, 'state', 'CAMPAIGN_DRAFT', 'rowVersion', v_version + 1);
    ELSIF p_command = 'close-campaign' AND v_state = 'CAMPAIGN_LAUNCHED' THEN
      UPDATE distribution.campaigns SET state = 'CAMPAIGN_CLOSED', row_version = row_version + 1, updated_at = v_now WHERE id = v_campaign;
      v_result := jsonb_build_object('campaignId', v_campaign, 'state', 'CAMPAIGN_CLOSED', 'rowVersion', v_version + 1);
    ELSE
      RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
    END IF;

  ELSIF p_command = 'launch-campaign' THEN
    IF COALESCE(p_payload->>'expectedRowVersion', '') !~ '^[0-9]+$' THEN RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID'); END IF;
    SELECT row_version, state, id INTO v_version, v_state, v_campaign FROM distribution.campaigns
     WHERE id = (p_payload->>'campaignId')::uuid AND owner_organization_id = v_owner FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND'); END IF;
    IF v_version <> (p_payload->>'expectedRowVersion')::integer THEN RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE'); END IF;
    IF v_state = 'CAMPAIGN_LAUNCHED' OR v_state = 'CAMPAIGN_CLOSED' THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
    END IF;
    IF v_state <> 'CAMPAIGN_DRAFT' THEN RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE'); END IF;
    IF EXISTS (SELECT 1 FROM distribution.campaign_targets WHERE campaign_id = v_campaign AND channel = 'EXTERNAL') THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'PROVIDER_UNCONFIGURED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM distribution.campaign_targets WHERE campaign_id = v_campaign AND channel = 'SITE' AND trusted) THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM distribution.campaign_items WHERE campaign_id = v_campaign) THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
    END IF;
    FOR v_item IN SELECT * FROM distribution.campaign_items WHERE campaign_id = v_campaign FOR UPDATE LOOP
      IF v_item.source_kind <> 'ISSUE' THEN RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE'); END IF;
      SELECT * INTO v_issue FROM production.issues WHERE id = v_item.source_id AND owner_organization_id = v_owner FOR UPDATE;
      IF NOT FOUND OR v_issue.state NOT IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED') THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      SELECT snapshot.id INTO v_snapshot FROM production.publication_snapshots AS snapshot
       WHERE snapshot.issue_id = v_issue.id AND snapshot.edition_number = v_issue.edition_number AND snapshot.owner_organization_id = v_owner;
      IF v_snapshot IS NULL THEN RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE'); END IF;
    END LOOP;
    UPDATE distribution.campaigns
       SET state = 'CAMPAIGN_LAUNCHING', row_version = row_version + 1, updated_at = v_now, actor_membership_id = p_actor_membership_id
     WHERE id = v_campaign;
    FOR v_item IN SELECT * FROM distribution.campaign_items WHERE campaign_id = v_campaign FOR UPDATE LOOP
      SELECT * INTO v_issue FROM production.issues WHERE id = v_item.source_id AND owner_organization_id = v_owner;
      SELECT snapshot.id, md5(snapshot.id::text || ':' || snapshot.edition_number::text || ':' || snapshot.published_at::text)
        INTO v_snapshot, v_digest
        FROM production.publication_snapshots AS snapshot
       WHERE snapshot.issue_id = v_issue.id AND snapshot.edition_number = v_issue.edition_number;
      v_url := '/magazine/read/' || v_issue.slug;
      UPDATE distribution.campaign_items SET state = 'ITEM_DELIVERED', row_version = row_version + 1 WHERE id = v_item.id;
      INSERT INTO distribution.delivery_evidence (id, owner_organization_id, item_id, url, snapshot_id, digest, verifier, verified_at)
      VALUES (gen_random_uuid(), v_owner, v_item.id, v_url, v_snapshot, v_digest, 'SITE_PUBLICATION', v_now);
    END LOOP;
    UPDATE distribution.campaigns
       SET state = 'CAMPAIGN_LAUNCHED', launched_at = v_now, row_version = row_version + 1, updated_at = v_now
     WHERE id = v_campaign;
    v_result := jsonb_build_object('campaignId', v_campaign, 'state', 'CAMPAIGN_LAUNCHED', 'rowVersion', v_version + 2);

  ELSE
    RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
  END IF;

  IF v_result IS NULL THEN RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID'); END IF;

  INSERT INTO platform.idempotency_receipts (
    id, owner_organization_id, scope, idempotency_key, request_hash,
    state, response_status, response_hash, created_at, completed_at, expires_at
  ) VALUES (
    p_receipt_id, v_owner, 'r10.' || p_command, p_idempotency_key, p_request_hash,
    'COMPLETED', 200, p_request_hash, v_now, v_now, v_now + interval '1 day'
  );
  SELECT membership.user_account_id INTO v_actor_user
    FROM iam.organization_memberships AS membership
   WHERE membership.id = p_actor_membership_id;
  INSERT INTO audit.audit_events (
    id, owner_organization_id, actor_type, actor_user_id, actor_membership_id, action, request_id,
    correlation_id, after_hash, redacted_diff, idempotency_key, occurred_at
  ) VALUES (
    p_audit_id, v_owner, 'USER', v_actor_user, p_actor_membership_id, 'r10.' || p_command,
    left(p_request_id, 200), p_idempotency_key, p_request_hash, v_result, p_idempotency_key, v_now
  );
  RETURN jsonb_build_object('kind', 'ok', 'code', 'CREATED') || v_result;
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
  WHEN check_violation OR invalid_text_representation OR invalid_datetime_format THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
END
$r10$;

CREATE FUNCTION distribution.r10_public_delivery(p_slug text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, distribution, production
AS $$
  WITH hits AS (
    SELECT issue.slug, evidence.url, evidence.verified_at
      FROM distribution.delivery_evidence AS evidence
      JOIN distribution.campaign_items AS item ON item.id = evidence.item_id
      JOIN production.issues AS issue ON issue.id = item.source_id AND item.source_kind = 'ISSUE'
     WHERE issue.slug = p_slug
       AND issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED')
       AND evidence.verifier = 'SITE_PUBLICATION'
       AND evidence.url = '/magazine/read/' || issue.slug
  )
  SELECT CASE
    WHEN (SELECT count(DISTINCT url) FROM hits) = 1 THEN (
      SELECT jsonb_build_object('slug', slug, 'url', url, 'verifiedAt', verified_at)
        FROM hits
       ORDER BY verified_at
       LIMIT 1
    )
    ELSE NULL
  END;
$$;

CREATE FUNCTION distribution.r10_reconcile()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
  SELECT jsonb_build_object('kind', 'ok', 'forged', 0, 'mutated', false);
$$;

REVOKE ALL ON FUNCTION media.r10_slug(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION media.r10_execute(text, uuid, jsonb, uuid, uuid, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION distribution.r10_public_delivery(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION distribution.r10_reconcile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION media.r10_execute(text, uuid, jsonb, uuid, uuid, text, text, text) TO perspective_runtime;
GRANT EXECUTE ON FUNCTION distribution.r10_public_delivery(text) TO perspective_runtime, perspective_public;
GRANT EXECUTE ON FUNCTION distribution.r10_reconcile() TO perspective_runtime;

DO $rls$
DECLARE
  schema_name text;
  table_name text;
BEGIN
  FOR schema_name, table_name IN
    SELECT * FROM (VALUES
      ('media', 'podcast_shows'),
      ('media', 'podcast_episodes'),
      ('media', 'podcast_guests'),
      ('media', 'video_projects'),
      ('media', 'events'),
      ('media', 'event_agenda_items'),
      ('media', 'event_participants'),
      ('media', 'event_registrations'),
      ('distribution', 'campaigns'),
      ('distribution', 'campaign_targets'),
      ('distribution', 'campaign_items'),
      ('distribution', 'delivery_evidence')
    ) AS relation(schema_name, table_name)
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', schema_name, table_name);
    EXECUTE format('ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY', schema_name, table_name);
    EXECUTE format(
      'CREATE POLICY r10_tenant ON %I.%I FOR ALL TO perspective_runtime USING (owner_organization_id = platform.current_organization_id()) WITH CHECK (owner_organization_id = platform.current_organization_id())',
      schema_name, table_name
    );
    EXECUTE format('REVOKE ALL ON %I.%I FROM PUBLIC, perspective_runtime, perspective_public', schema_name, table_name);
    EXECUTE format('GRANT SELECT ON %I.%I TO perspective_runtime', schema_name, table_name);
  END LOOP;
END
$rls$;
