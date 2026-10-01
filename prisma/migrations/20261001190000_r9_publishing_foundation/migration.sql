-- R9 publishing and magazine engine.
-- Canonical state is PostgreSQL. Runtime cannot write these tables.
-- Public reads are a separate non-bypass role limited to published and archived rows.
-- Publishing does not call workflow.move and does not change production.projects.state.

CREATE SCHEMA IF NOT EXISTS production;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'perspective_public') THEN
    CREATE ROLE perspective_public NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
  ELSE
    ALTER ROLE perspective_public NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
  END IF;
END
$$;

GRANT perspective_public TO CURRENT_USER;
GRANT USAGE ON SCHEMA production TO perspective_runtime, perspective_public;

CREATE TABLE production.publications (
  id uuid PRIMARY KEY,
  resource_id uuid NOT NULL UNIQUE,
  owner_organization_id uuid NOT NULL UNIQUE,
  title text NOT NULL,
  slug text NOT NULL,
  row_version integer NOT NULL DEFAULT 1,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT publications_id_owner_key UNIQUE (id, owner_organization_id)
);

CREATE TABLE production.issues (
  id uuid PRIMARY KEY,
  resource_id uuid NOT NULL UNIQUE,
  owner_organization_id uuid NOT NULL,
  publication_id uuid NOT NULL,
  primary_project_id uuid,
  edition_number integer NOT NULL,
  slug text NOT NULL,
  title text NOT NULL,
  season text NOT NULL,
  theme text NOT NULL,
  state text NOT NULL,
  availability text NOT NULL,
  design_signed_off_at timestamptz(6),
  design_signed_off_by uuid,
  row_version integer NOT NULL DEFAULT 1,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT issues_id_owner_key UNIQUE (id, owner_organization_id),
  CONSTRAINT issues_publication_slug_key UNIQUE (publication_id, slug),
  CONSTRAINT issues_publication_edition_key UNIQUE (publication_id, edition_number),
  CONSTRAINT issues_state_check CHECK (state IN (
    'ISSUE_DRAFT','ISSUE_ASSEMBLY','ISSUE_PREPARATION','ISSUE_READY',
    'ISSUE_SCHEDULED','ISSUE_PUBLISHING','ISSUE_PUBLISHED','ISSUE_ARCHIVED'
  )),
  CONSTRAINT issues_availability_check CHECK (availability IN ('PUBLIC','PREMIUM')),
  CONSTRAINT issues_edition_check CHECK (edition_number > 0),
  CONSTRAINT issues_publication_fkey FOREIGN KEY (publication_id, owner_organization_id)
    REFERENCES production.publications (id, owner_organization_id) ON DELETE RESTRICT,
  CONSTRAINT issues_project_fkey FOREIGN KEY (primary_project_id, owner_organization_id)
    REFERENCES production.projects (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.issue_sections (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  issue_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  sort_order integer NOT NULL,
  CONSTRAINT issue_sections_id_owner_key UNIQUE (id, owner_organization_id),
  CONSTRAINT issue_sections_slug_key UNIQUE (issue_id, slug),
  CONSTRAINT issue_sections_order_key UNIQUE (issue_id, sort_order),
  CONSTRAINT issue_sections_issue_fkey FOREIGN KEY (issue_id, owner_organization_id)
    REFERENCES production.issues (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.issue_placements (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  issue_id uuid NOT NULL,
  section_id uuid NOT NULL,
  draft_version_id uuid NOT NULL,
  editorial_work_id uuid NOT NULL,
  sort_order integer NOT NULL,
  pinned_digest text NOT NULL,
  title text NOT NULL,
  article_slug text NOT NULL,
  author_name text NOT NULL,
  summary text NOT NULL,
  alt_text text NOT NULL,
  CONSTRAINT issue_placements_id_owner_key UNIQUE (id, owner_organization_id),
  CONSTRAINT issue_placements_version_key UNIQUE (issue_id, draft_version_id),
  CONSTRAINT issue_placements_work_key UNIQUE (issue_id, editorial_work_id),
  CONSTRAINT issue_placements_order_key UNIQUE (issue_id, sort_order),
  CONSTRAINT issue_placements_article_key UNIQUE (issue_id, article_slug),
  CONSTRAINT issue_placements_issue_fkey FOREIGN KEY (issue_id, owner_organization_id)
    REFERENCES production.issues (id, owner_organization_id) ON DELETE RESTRICT,
  CONSTRAINT issue_placements_section_fkey FOREIGN KEY (section_id, owner_organization_id)
    REFERENCES production.issue_sections (id, owner_organization_id) ON DELETE RESTRICT,
  CONSTRAINT issue_placements_version_fkey FOREIGN KEY (draft_version_id, owner_organization_id)
    REFERENCES production.draft_versions (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.placement_assets (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  placement_id uuid NOT NULL,
  asset_id uuid NOT NULL,
  CONSTRAINT placement_assets_key UNIQUE (placement_id, asset_id),
  CONSTRAINT placement_assets_placement_fkey FOREIGN KEY (placement_id, owner_organization_id)
    REFERENCES production.issue_placements (id, owner_organization_id) ON DELETE RESTRICT,
  CONSTRAINT placement_assets_asset_fkey FOREIGN KEY (asset_id, owner_organization_id)
    REFERENCES production.assets (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.issue_covers (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  issue_id uuid NOT NULL UNIQUE,
  headline text NOT NULL,
  dek text NOT NULL,
  alt_text text NOT NULL,
  story_draft_version_id uuid NOT NULL,
  CONSTRAINT issue_covers_issue_fkey FOREIGN KEY (issue_id, owner_organization_id)
    REFERENCES production.issues (id, owner_organization_id) ON DELETE RESTRICT,
  CONSTRAINT issue_covers_story_fkey FOREIGN KEY (story_draft_version_id, owner_organization_id)
    REFERENCES production.draft_versions (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.issue_pages (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  issue_id uuid NOT NULL,
  page_number integer NOT NULL,
  kind text NOT NULL,
  placement_id uuid,
  sponsored_id uuid,
  CONSTRAINT issue_pages_number_key UNIQUE (issue_id, page_number),
  CONSTRAINT issue_pages_kind_check CHECK (kind IN ('COVER','CONTENTS','ARTICLE','SPONSORED')),
  CONSTRAINT issue_pages_number_check CHECK (page_number >= 1),
  CONSTRAINT issue_pages_issue_fkey FOREIGN KEY (issue_id, owner_organization_id)
    REFERENCES production.issues (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.sponsored_placements (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  issue_id uuid NOT NULL,
  sponsor text NOT NULL,
  headline text NOT NULL,
  body text NOT NULL,
  sort_order integer NOT NULL,
  present boolean NOT NULL DEFAULT false,
  approved boolean NOT NULL DEFAULT false,
  licensed boolean NOT NULL DEFAULT false,
  cleared boolean NOT NULL DEFAULT false,
  row_version integer NOT NULL DEFAULT 1,
  CONSTRAINT sponsored_cleared_check CHECK (cleared = false OR (approved = true AND licensed = true)),
  CONSTRAINT sponsored_issue_fkey FOREIGN KEY (issue_id, owner_organization_id)
    REFERENCES production.issues (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.issue_schedules (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  issue_id uuid NOT NULL,
  run_at timestamptz(6) NOT NULL,
  status text NOT NULL,
  idempotency_key text NOT NULL,
  created_by uuid NOT NULL,
  row_version integer NOT NULL DEFAULT 1,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT issue_schedules_status_check CHECK (status IN ('PENDING','COMPLETED','CANCELLED','FAILED')),
  CONSTRAINT issue_schedules_issue_fkey FOREIGN KEY (issue_id, owner_organization_id)
    REFERENCES production.issues (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX issue_schedules_one_pending
  ON production.issue_schedules (issue_id)
  WHERE status = 'PENDING';

CREATE TABLE production.publication_snapshots (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  issue_id uuid NOT NULL,
  edition_number integer NOT NULL,
  actor_membership_id uuid NOT NULL,
  published_at timestamptz(6) NOT NULL,
  from_state text NOT NULL,
  CONSTRAINT publication_snapshots_id_owner_key UNIQUE (id, owner_organization_id),
  CONSTRAINT publication_snapshots_edition_key UNIQUE (issue_id, edition_number),
  CONSTRAINT publication_snapshots_issue_fkey FOREIGN KEY (issue_id, owner_organization_id)
    REFERENCES production.issues (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.publication_snapshot_items (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  snapshot_id uuid NOT NULL,
  placement_id uuid NOT NULL,
  draft_version_id uuid NOT NULL,
  digest text NOT NULL,
  title text NOT NULL,
  article_slug text NOT NULL,
  author_name text NOT NULL,
  summary text NOT NULL,
  alt_text text NOT NULL,
  sort_order integer NOT NULL,
  CONSTRAINT publication_snapshot_items_version_key UNIQUE (snapshot_id, draft_version_id),
  CONSTRAINT publication_snapshot_items_snapshot_fkey FOREIGN KEY (snapshot_id, owner_organization_id)
    REFERENCES production.publication_snapshots (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.story_preparations (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  draft_version_id uuid NOT NULL UNIQUE,
  actor_membership_id uuid NOT NULL,
  prepared_at timestamptz(6) NOT NULL,
  CONSTRAINT story_preparations_version_fkey FOREIGN KEY (draft_version_id, owner_organization_id)
    REFERENCES production.draft_versions (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.personal_shelves (
  id uuid PRIMARY KEY,
  resource_id uuid NOT NULL UNIQUE,
  owner_organization_id uuid NOT NULL,
  slug text NOT NULL,
  name text NOT NULL,
  editor_person_id uuid NOT NULL,
  principles text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT personal_shelves_id_owner_key UNIQUE (id, owner_organization_id),
  CONSTRAINT personal_shelves_slug_key UNIQUE (owner_organization_id, slug)
);

CREATE TABLE production.personal_shelf_items (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  shelf_id uuid NOT NULL,
  editorial_work_id uuid NOT NULL,
  sort_order integer NOT NULL,
  CONSTRAINT personal_shelf_items_work_key UNIQUE (shelf_id, editorial_work_id),
  CONSTRAINT personal_shelf_items_shelf_fkey FOREIGN KEY (shelf_id, owner_organization_id)
    REFERENCES production.personal_shelves (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.issue_transitions (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  issue_id uuid NOT NULL,
  from_state text NOT NULL,
  to_state text NOT NULL,
  actor_membership_id uuid NOT NULL,
  reason text,
  issue_row_version integer NOT NULL,
  occurred_at timestamptz(6) NOT NULL,
  CONSTRAINT issue_transitions_issue_fkey FOREIGN KEY (issue_id, owner_organization_id)
    REFERENCES production.issues (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE FUNCTION production.r9_slug(p_value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(trim(BOTH '-' FROM regexp_replace(lower(btrim(COALESCE(p_value, ''))), '[^a-z0-9]+', '-', 'g')), '');
$$;

CREATE FUNCTION production.r9_rebuild_pages(p_issue uuid, p_owner uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, production
AS $$
DECLARE
  v_page integer := 0;
  v_row record;
BEGIN
  DELETE FROM production.issue_pages
   WHERE issue_id = p_issue AND owner_organization_id = p_owner;

  IF EXISTS (
    SELECT 1 FROM production.issue_covers
     WHERE issue_id = p_issue AND owner_organization_id = p_owner
  ) THEN
    v_page := v_page + 1;
    INSERT INTO production.issue_pages (id, owner_organization_id, issue_id, page_number, kind)
    VALUES (gen_random_uuid(), p_owner, p_issue, v_page, 'COVER');
  END IF;

  IF EXISTS (
    SELECT 1 FROM production.issue_placements
     WHERE issue_id = p_issue AND owner_organization_id = p_owner
  ) THEN
    v_page := v_page + 1;
    INSERT INTO production.issue_pages (id, owner_organization_id, issue_id, page_number, kind)
    VALUES (gen_random_uuid(), p_owner, p_issue, v_page, 'CONTENTS');
  END IF;

  FOR v_row IN
    SELECT id FROM production.issue_placements
     WHERE issue_id = p_issue AND owner_organization_id = p_owner
     ORDER BY sort_order
  LOOP
    v_page := v_page + 1;
    INSERT INTO production.issue_pages (id, owner_organization_id, issue_id, page_number, kind, placement_id)
    VALUES (gen_random_uuid(), p_owner, p_issue, v_page, 'ARTICLE', v_row.id);
  END LOOP;

  FOR v_row IN
    SELECT id FROM production.sponsored_placements
     WHERE issue_id = p_issue AND owner_organization_id = p_owner
     ORDER BY sort_order
  LOOP
    v_page := v_page + 1;
    INSERT INTO production.issue_pages (id, owner_organization_id, issue_id, page_number, kind, sponsored_id)
    VALUES (gen_random_uuid(), p_owner, p_issue, v_page, 'SPONSORED', v_row.id);
  END LOOP;
END
$$;

CREATE FUNCTION production.r9_issue_is_ready(p_issue uuid, p_owner uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, production
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM production.issues AS issue
      JOIN production.publications AS publication
        ON publication.id = issue.publication_id
       AND publication.owner_organization_id = issue.owner_organization_id
     WHERE issue.id = p_issue
       AND issue.owner_organization_id = p_owner
       AND issue.title <> ''
       AND issue.slug <> ''
       AND issue.season <> ''
       AND issue.theme <> ''
       AND EXISTS (
         SELECT 1 FROM production.issue_covers AS cover
           JOIN production.issue_placements AS placed
             ON placed.issue_id = cover.issue_id
            AND placed.draft_version_id = cover.story_draft_version_id
          WHERE cover.issue_id = issue.id
            AND cover.headline <> ''
            AND cover.dek <> ''
            AND cover.alt_text <> ''
       )
       AND EXISTS (SELECT 1 FROM production.issue_sections AS section WHERE section.issue_id = issue.id)
       AND EXISTS (SELECT 1 FROM production.issue_placements AS placement WHERE placement.issue_id = issue.id)
       AND NOT EXISTS (
         SELECT 1
           FROM production.issue_placements AS placement
           JOIN production.draft_versions AS version ON version.id = placement.draft_version_id
           JOIN production.drafts AS draft ON draft.id = version.draft_id
          WHERE placement.issue_id = issue.id
            AND (
              version.version_number IS DISTINCT FROM (
                SELECT max(newer.version_number) FROM production.draft_versions AS newer WHERE newer.draft_id = draft.id
              )
              OR NOT EXISTS (
                SELECT 1 FROM production.editorial_approvals AS approval
                 WHERE approval.draft_version_id = version.id
              )
              OR NOT EXISTS (
                SELECT 1 FROM production.client_approvals AS approval
                 WHERE approval.draft_version_id = version.id
                   AND approval.decision = 'APPROVED'
              )
              OR NOT EXISTS (
                SELECT 1 FROM production.story_preparations AS prepared
                 WHERE prepared.draft_version_id = version.id
              )
              OR btrim(version.body) = ''
              OR btrim(placement.author_name) = ''
              OR btrim(placement.summary) = ''
              OR btrim(placement.alt_text) = ''
              OR EXISTS (
                SELECT 1
                  FROM production.placement_assets AS link
                  JOIN production.assets AS asset ON asset.id = link.asset_id
                 WHERE link.placement_id = placement.id
                   AND asset.cleared IS NOT TRUE
              )
            )
       )
       AND NOT EXISTS (
         SELECT 1 FROM production.sponsored_placements AS sponsor
          WHERE sponsor.issue_id = issue.id
            AND sponsor.cleared IS NOT TRUE
       )
       AND NOT EXISTS (
         SELECT 1 FROM production.issue_pages AS page
          WHERE page.issue_id = issue.id
          GROUP BY page.issue_id
         HAVING min(page.page_number) <> 1
             OR max(page.page_number) <> count(*)
             OR count(*) < 1
       )
       AND EXISTS (SELECT 1 FROM production.issue_pages AS page WHERE page.issue_id = issue.id)
  );
$$;
CREATE FUNCTION production.r9_publish_issue(
  p_owner uuid,
  p_issue uuid,
  p_actor uuid,
  p_now timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, production
AS $$
DECLARE
  v_issue production.issues%ROWTYPE;
  v_snapshot uuid;
  v_existing uuid;
BEGIN
  SELECT * INTO v_issue
    FROM production.issues
   WHERE id = p_issue
     AND owner_organization_id = p_owner
   FOR UPDATE;
  IF v_issue.id IS NULL THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
  END IF;

  SELECT id INTO v_existing
    FROM production.publication_snapshots
   WHERE issue_id = v_issue.id
     AND edition_number = v_issue.edition_number;
  IF v_issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED') OR v_existing IS NOT NULL THEN
    RETURN jsonb_build_object(
      'kind', 'ok',
      'snapshotId', v_existing,
      'editionNumber', v_issue.edition_number,
      'state', v_issue.state,
      'rowVersion', v_issue.row_version,
      'created', false
    );
  END IF;

  IF v_issue.state NOT IN ('ISSUE_READY', 'ISSUE_SCHEDULED') THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
  END IF;
  IF NOT production.r9_issue_is_ready(v_issue.id, p_owner) THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM iam.organization_memberships AS membership
     WHERE membership.id = p_actor
       AND membership.organization_id = p_owner
       AND membership.membership_type = 'STAFF'
       AND membership.status = 'ACTIVE'
       AND membership.ended_at IS NULL
  ) THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
  END IF;

  INSERT INTO production.issue_transitions (
    id, owner_organization_id, issue_id, from_state, to_state, actor_membership_id, reason, issue_row_version, occurred_at
  ) VALUES (
    gen_random_uuid(), p_owner, v_issue.id, v_issue.state, 'ISSUE_PUBLISHING', p_actor,
    'publish', v_issue.row_version, p_now
  );
  UPDATE production.issues
     SET state = 'ISSUE_PUBLISHING', updated_at = p_now
   WHERE id = v_issue.id;

  v_snapshot := gen_random_uuid();
  INSERT INTO production.publication_snapshots (
    id, owner_organization_id, issue_id, edition_number, actor_membership_id, published_at, from_state
  ) VALUES (
    v_snapshot, p_owner, v_issue.id, v_issue.edition_number, p_actor, p_now, v_issue.state
  );
  INSERT INTO production.publication_snapshot_items (
    id, owner_organization_id, snapshot_id, placement_id, draft_version_id, digest, title,
    article_slug, author_name, summary, alt_text, sort_order
  )
  SELECT gen_random_uuid(), p_owner, v_snapshot, placement.id, placement.draft_version_id,
         placement.pinned_digest, placement.title, placement.article_slug, placement.author_name,
         placement.summary, placement.alt_text, placement.sort_order
    FROM production.issue_placements AS placement
   WHERE placement.issue_id = v_issue.id
     AND placement.owner_organization_id = p_owner;

  UPDATE production.issues
     SET state = 'ISSUE_PUBLISHED',
         row_version = row_version + 1,
         updated_at = p_now
   WHERE id = v_issue.id;
  INSERT INTO production.issue_transitions (
    id, owner_organization_id, issue_id, from_state, to_state, actor_membership_id, reason, issue_row_version, occurred_at
  ) VALUES (
    gen_random_uuid(), p_owner, v_issue.id, 'ISSUE_PUBLISHING', 'ISSUE_PUBLISHED', p_actor,
    'publish', v_issue.row_version + 1, p_now
  );
  UPDATE production.issue_schedules
     SET status = 'COMPLETED', row_version = row_version + 1
   WHERE issue_id = v_issue.id
     AND status = 'PENDING';

  RETURN jsonb_build_object(
    'kind', 'ok',
    'snapshotId', v_snapshot,
    'editionNumber', v_issue.edition_number,
    'state', 'ISSUE_PUBLISHED',
    'rowVersion', v_issue.row_version + 1,
    'created', true
  );
END
$$;

CREATE FUNCTION production.r9_execute(
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
SET search_path = pg_catalog, production, platform, audit, iam
AS $$
DECLARE
  v_owner uuid;
  v_actor_user uuid;
  v_now timestamptz;
  v_existing_hash text;
  v_existing_state text;
  v_issue production.issues%ROWTYPE;
  v_result jsonb;
  v_id uuid;
  v_pub uuid;
  v_slug text;
  v_edition integer;
  v_order integer;
  v_version uuid;
  v_work uuid;
  v_digest text;
  v_body text;
  v_project uuid;
  v_section uuid;
  v_flag text;
  v_bool boolean;
  v_neighbor uuid;
  v_run timestamptz;
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
     OR p_idempotency_key !~ ('^r9:' || p_command || ':' || v_owner::text || ':[A-Za-z0-9._:-]{8,128}$')
     OR p_payload ?| ARRAY['publisher','actor','organizationId','status','ready','publishedVersion']
  THEN
    RAISE EXCEPTION 'invalid R9 command' USING ERRCODE = '22023';
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
     AND scope = 'publication.' || p_command
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
           AND event.action = 'r9.' || p_command
         LIMIT 1
      );
    END IF;
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
  END IF;

  IF p_command = 'create-issue' THEN
    IF p_payload->>'availability' NOT IN ('PUBLIC', 'PREMIUM')
       OR NULLIF(btrim(p_payload->>'title'), '') IS NULL
       OR NULLIF(btrim(p_payload->>'season'), '') IS NULL
       OR NULLIF(btrim(p_payload->>'theme'), '') IS NULL
    THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
    END IF;
    INSERT INTO production.publications (id, resource_id, owner_organization_id, title, slug)
    SELECT gen_random_uuid(), gen_random_uuid(), v_owner, 'The Perspective', 'the-perspective'
     WHERE NOT EXISTS (
       SELECT 1 FROM production.publications WHERE owner_organization_id = v_owner
     );
    SELECT id INTO v_pub FROM production.publications WHERE owner_organization_id = v_owner FOR UPDATE;
    UPDATE platform.resources
       SET title = title
     WHERE false;
    INSERT INTO platform.resources (id, resource_type, title, owner_organization_id, visibility, sensitivity, created_at)
    SELECT publication.resource_id, 'publication', publication.title, v_owner, 'INTERNAL', 'STANDARD', v_now
      FROM production.publications AS publication
     WHERE publication.id = v_pub
       AND NOT EXISTS (SELECT 1 FROM platform.resources AS resource WHERE resource.id = publication.resource_id);
    v_slug := production.r9_slug(p_payload->>'title');
    IF v_slug IS NULL THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
    END IF;
    v_edition := 1;
    WHILE EXISTS (
      SELECT 1 FROM production.issues
       WHERE publication_id = v_pub AND (slug = v_slug OR edition_number = v_edition)
    ) LOOP
      IF EXISTS (SELECT 1 FROM production.issues WHERE publication_id = v_pub AND slug = v_slug) THEN
        v_slug := production.r9_slug(p_payload->>'title') || '-' || v_edition::text;
      END IF;
      v_edition := v_edition + 1;
      EXIT WHEN v_edition > 1000;
    END LOOP;
    SELECT COALESCE(max(edition_number), 0) + 1 INTO v_edition
      FROM production.issues WHERE publication_id = v_pub;
    v_id := gen_random_uuid();
    INSERT INTO platform.resources (id, resource_type, title, owner_organization_id, visibility, sensitivity, created_at)
    VALUES (v_id, 'issue', left(btrim(p_payload->>'title'), 200), v_owner, 'INTERNAL', 'STANDARD', v_now);
    INSERT INTO production.issues (
      id, resource_id, owner_organization_id, publication_id, edition_number, slug, title, season, theme,
      state, availability, row_version, created_at, updated_at
    ) VALUES (
      v_id, v_id, v_owner, v_pub, v_edition, v_slug, left(btrim(p_payload->>'title'), 200),
      left(btrim(p_payload->>'season'), 80), left(btrim(p_payload->>'theme'), 200),
      'ISSUE_DRAFT', p_payload->>'availability', 1, v_now, v_now
    );
    INSERT INTO production.issue_transitions (
      id, owner_organization_id, issue_id, from_state, to_state, actor_membership_id, reason, issue_row_version, occurred_at
    ) VALUES (
      gen_random_uuid(), v_owner, v_id, 'ISSUE_DRAFT', 'ISSUE_DRAFT', p_actor_membership_id, 'create', 1, v_now
    );
    v_result := jsonb_build_object('issueId', v_id, 'state', 'ISSUE_DRAFT', 'slug', v_slug, 'editionNumber', v_edition, 'rowVersion', 1);
  ELSE
    SELECT * INTO v_issue
      FROM production.issues
     WHERE owner_organization_id = v_owner
       AND id = COALESCE(
         NULLIF(p_payload->>'issueId', '')::uuid,
         (SELECT section.issue_id FROM production.issue_sections AS section WHERE section.id = NULLIF(p_payload->>'sectionId', '')::uuid),
         (SELECT placement.issue_id FROM production.issue_placements AS placement WHERE placement.id = NULLIF(p_payload->>'placementId', '')::uuid),
         (SELECT sponsor.issue_id FROM production.sponsored_placements AS sponsor WHERE sponsor.id = NULLIF(p_payload->>'placementId', '')::uuid),
         (SELECT shelf.owner_organization_id FROM production.personal_shelves AS shelf WHERE shelf.id = NULLIF(p_payload->>'shelfId', '')::uuid AND shelf.owner_organization_id = v_owner LIMIT 0)
       )
     FOR UPDATE;
    IF p_command IN ('prepare-story', 'create-shelf', 'add-shelf-item') THEN
      NULL;
    ELSIF v_issue.id IS NULL THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
    ELSIF p_command <> 'set-sponsored-rights'
      AND p_payload ? 'expectedRowVersion'
      AND v_issue.row_version IS DISTINCT FROM (p_payload->>'expectedRowVersion')::integer THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE');
    END IF;

    IF p_command = 'open-assembly' THEN
      IF v_issue.state <> 'ISSUE_DRAFT' THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      UPDATE production.issues
         SET state = 'ISSUE_ASSEMBLY', row_version = row_version + 1, updated_at = v_now
       WHERE id = v_issue.id;
      v_result := jsonb_build_object('issueId', v_issue.id, 'state', 'ISSUE_ASSEMBLY', 'rowVersion', v_issue.row_version + 1);
    ELSIF p_command = 'add-section' THEN
      IF v_issue.state NOT IN ('ISSUE_ASSEMBLY', 'ISSUE_PREPARATION', 'ISSUE_READY')
         OR NULLIF(btrim(p_payload->>'name'), '') IS NULL
      THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      SELECT COALESCE(max(sort_order), 0) + 1 INTO v_order
        FROM production.issue_sections WHERE issue_id = v_issue.id;
      v_id := gen_random_uuid();
      v_slug := production.r9_slug(p_payload->>'name') || '-' || v_order::text;
      INSERT INTO production.issue_sections (id, owner_organization_id, issue_id, name, slug, sort_order)
      VALUES (v_id, v_owner, v_issue.id, left(btrim(p_payload->>'name'), 120), v_slug, v_order);
      UPDATE production.issues
         SET state = 'ISSUE_ASSEMBLY', design_signed_off_at = NULL, design_signed_off_by = NULL,
             row_version = row_version + 1, updated_at = v_now
       WHERE id = v_issue.id;
      PERFORM production.r9_rebuild_pages(v_issue.id, v_owner);
      v_result := jsonb_build_object('sectionId', v_id, 'issueId', v_issue.id, 'state', 'ISSUE_ASSEMBLY', 'rowVersion', v_issue.row_version + 1);
    ELSIF p_command = 'place-article' THEN
      IF v_issue.state NOT IN ('ISSUE_ASSEMBLY', 'ISSUE_PREPARATION', 'ISSUE_READY') THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      SELECT version.id, version.digest, version.body, work.id, work.project_id
        INTO v_version, v_digest, v_body, v_work, v_project
        FROM production.draft_versions AS version
        JOIN production.drafts AS draft ON draft.id = version.draft_id
        JOIN production.editorial_works AS work ON work.id = draft.work_id
       WHERE version.id = (p_payload->>'draftVersionId')::uuid
         AND version.owner_organization_id = v_owner;
      IF v_version IS NULL
         OR NULLIF(btrim(p_payload->>'title'), '') IS NULL
         OR NULLIF(btrim(p_payload->>'authorName'), '') IS NULL
         OR NULLIF(btrim(p_payload->>'summary'), '') IS NULL
         OR NULLIF(btrim(p_payload->>'altText'), '') IS NULL
         OR NOT EXISTS (
           SELECT 1 FROM production.issue_sections AS section
            WHERE section.id = (p_payload->>'sectionId')::uuid
              AND section.issue_id = v_issue.id
         )
      THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
      END IF;
      SELECT COALESCE(max(sort_order), 0) + 1 INTO v_order
        FROM production.issue_placements WHERE issue_id = v_issue.id;
      v_id := gen_random_uuid();
      v_slug := production.r9_slug(p_payload->>'title') || '-' || v_order::text;
      INSERT INTO production.issue_placements (
        id, owner_organization_id, issue_id, section_id, draft_version_id, editorial_work_id,
        sort_order, pinned_digest, title, article_slug, author_name, summary, alt_text
      ) VALUES (
        v_id, v_owner, v_issue.id, (p_payload->>'sectionId')::uuid, v_version, v_work,
        v_order, v_digest, left(btrim(p_payload->>'title'), 200), v_slug,
        left(btrim(p_payload->>'authorName'), 160), left(btrim(p_payload->>'summary'), 400),
        left(btrim(p_payload->>'altText'), 200)
      );
      UPDATE production.issues
         SET primary_project_id = COALESCE(primary_project_id, v_project),
             state = 'ISSUE_ASSEMBLY', design_signed_off_at = NULL, design_signed_off_by = NULL,
             row_version = row_version + 1, updated_at = v_now
       WHERE id = v_issue.id;
      PERFORM production.r9_rebuild_pages(v_issue.id, v_owner);
      v_result := jsonb_build_object('placementId', v_id, 'issueId', v_issue.id, 'state', 'ISSUE_ASSEMBLY', 'rowVersion', v_issue.row_version + 1, 'articleSlug', v_slug);
    ELSIF p_command = 'remove-placement' THEN
      IF v_issue.state NOT IN ('ISSUE_ASSEMBLY', 'ISSUE_PREPARATION', 'ISSUE_READY') THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      DELETE FROM production.placement_assets
       WHERE placement_id = (p_payload->>'placementId')::uuid
         AND owner_organization_id = v_owner;
      DELETE FROM production.issue_placements
       WHERE id = (p_payload->>'placementId')::uuid
         AND issue_id = v_issue.id;
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
      END IF;
      UPDATE production.issues
         SET state = 'ISSUE_ASSEMBLY', design_signed_off_at = NULL, design_signed_off_by = NULL,
             row_version = row_version + 1, updated_at = v_now
       WHERE id = v_issue.id;
      PERFORM production.r9_rebuild_pages(v_issue.id, v_owner);
      v_result := jsonb_build_object('issueId', v_issue.id, 'state', 'ISSUE_ASSEMBLY', 'rowVersion', v_issue.row_version + 1);
    ELSIF p_command = 'reorder-placement' THEN
      IF v_issue.state NOT IN ('ISSUE_ASSEMBLY', 'ISSUE_PREPARATION', 'ISSUE_READY')
         OR p_payload->>'direction' NOT IN ('UP', 'DOWN')
      THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      SELECT placement.sort_order INTO v_order
        FROM production.issue_placements AS placement
       WHERE placement.id = (p_payload->>'placementId')::uuid
         AND placement.issue_id = v_issue.id;
      IF v_order IS NULL THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
      END IF;
      SELECT placement.id INTO v_neighbor
        FROM production.issue_placements AS placement
       WHERE placement.issue_id = v_issue.id
         AND placement.sort_order = CASE WHEN p_payload->>'direction' = 'UP' THEN v_order - 1 ELSE v_order + 1 END;
      IF v_neighbor IS NULL THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      UPDATE production.issue_placements SET sort_order = 0 WHERE id = (p_payload->>'placementId')::uuid;
      UPDATE production.issue_placements SET sort_order = v_order WHERE id = v_neighbor;
      UPDATE production.issue_placements
         SET sort_order = CASE WHEN p_payload->>'direction' = 'UP' THEN v_order - 1 ELSE v_order + 1 END
       WHERE id = (p_payload->>'placementId')::uuid;
      UPDATE production.issues
         SET state = 'ISSUE_ASSEMBLY', row_version = row_version + 1, updated_at = v_now
       WHERE id = v_issue.id;
      PERFORM production.r9_rebuild_pages(v_issue.id, v_owner);
      v_result := jsonb_build_object('issueId', v_issue.id, 'state', 'ISSUE_ASSEMBLY', 'rowVersion', v_issue.row_version + 1);
    ELSIF p_command = 'set-cover' THEN
      IF v_issue.state NOT IN ('ISSUE_ASSEMBLY', 'ISSUE_PREPARATION', 'ISSUE_READY')
         OR NULLIF(btrim(p_payload->>'headline'), '') IS NULL
         OR NULLIF(btrim(p_payload->>'dek'), '') IS NULL
         OR NULLIF(btrim(p_payload->>'alt'), '') IS NULL
      THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM production.issue_placements
         WHERE issue_id = v_issue.id
           AND draft_version_id = (p_payload->>'storyDraftVersionId')::uuid
      ) THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      INSERT INTO production.issue_covers (
        id, owner_organization_id, issue_id, headline, dek, alt_text, story_draft_version_id
      ) VALUES (
        gen_random_uuid(), v_owner, v_issue.id, left(btrim(p_payload->>'headline'), 200),
        left(btrim(p_payload->>'dek'), 400), left(btrim(p_payload->>'alt'), 200),
        (p_payload->>'storyDraftVersionId')::uuid
      )
      ON CONFLICT (issue_id) DO UPDATE
        SET headline = EXCLUDED.headline,
            dek = EXCLUDED.dek,
            alt_text = EXCLUDED.alt_text,
            story_draft_version_id = EXCLUDED.story_draft_version_id;
      UPDATE production.issues
         SET state = 'ISSUE_ASSEMBLY', design_signed_off_at = NULL, design_signed_off_by = NULL,
             row_version = row_version + 1, updated_at = v_now
       WHERE id = v_issue.id;
      PERFORM production.r9_rebuild_pages(v_issue.id, v_owner);
      v_result := jsonb_build_object('issueId', v_issue.id, 'state', 'ISSUE_ASSEMBLY', 'rowVersion', v_issue.row_version + 1);
    ELSIF p_command = 'design-approval' THEN
      IF v_issue.state <> 'ISSUE_ASSEMBLY' THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      UPDATE production.issues
         SET design_signed_off_at = v_now, design_signed_off_by = p_actor_membership_id,
             row_version = row_version + 1, updated_at = v_now
       WHERE id = v_issue.id;
      v_result := jsonb_build_object('issueId', v_issue.id, 'state', v_issue.state, 'rowVersion', v_issue.row_version + 1, 'designSignedOff', true);
    ELSIF p_command = 'add-sponsored' THEN
      IF v_issue.state NOT IN ('ISSUE_ASSEMBLY', 'ISSUE_PREPARATION', 'ISSUE_READY')
         OR NULLIF(btrim(p_payload->>'sponsor'), '') IS NULL
         OR NULLIF(btrim(p_payload->>'headline'), '') IS NULL
         OR NULLIF(btrim(p_payload->>'body'), '') IS NULL
      THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      SELECT COALESCE(max(sort_order), 0) + 1 INTO v_order
        FROM production.sponsored_placements WHERE issue_id = v_issue.id;
      v_id := gen_random_uuid();
      INSERT INTO production.sponsored_placements (
        id, owner_organization_id, issue_id, sponsor, headline, body, sort_order
      ) VALUES (
        v_id, v_owner, v_issue.id, left(btrim(p_payload->>'sponsor'), 160),
        left(btrim(p_payload->>'headline'), 200), left(btrim(p_payload->>'body'), 2000), v_order
      );
      UPDATE production.issues
         SET state = 'ISSUE_ASSEMBLY', row_version = row_version + 1, updated_at = v_now
       WHERE id = v_issue.id;
      PERFORM production.r9_rebuild_pages(v_issue.id, v_owner);
      v_result := jsonb_build_object('placementId', v_id, 'issueId', v_issue.id, 'state', 'ISSUE_ASSEMBLY', 'rowVersion', v_issue.row_version + 1, 'cleared', false);
    ELSIF p_command = 'set-sponsored-rights' THEN
      v_flag := p_payload->>'flag';
      v_bool := (p_payload->>'value')::boolean;
      IF v_flag NOT IN ('present', 'approved', 'licensed', 'cleared') OR v_bool IS NULL THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
      END IF;
      IF v_flag = 'cleared' AND v_bool AND NOT EXISTS (
        SELECT 1 FROM production.sponsored_placements
         WHERE id = (p_payload->>'placementId')::uuid
           AND issue_id = v_issue.id
           AND approved = true
           AND licensed = true
           AND row_version = (p_payload->>'expectedRowVersion')::integer
      ) THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      UPDATE production.sponsored_placements
         SET present = CASE WHEN v_flag = 'present' THEN v_bool ELSE present END,
             approved = CASE WHEN v_flag = 'approved' THEN v_bool ELSE approved END,
             licensed = CASE WHEN v_flag = 'licensed' THEN v_bool ELSE licensed END,
             cleared = CASE WHEN v_flag = 'cleared' THEN v_bool ELSE cleared END,
             row_version = row_version + 1
       WHERE id = (p_payload->>'placementId')::uuid
         AND issue_id = v_issue.id
         AND row_version = (p_payload->>'expectedRowVersion')::integer
         AND (v_flag <> 'approved' OR v_bool OR cleared = false)
         AND (v_flag <> 'licensed' OR v_bool OR cleared = false)
      RETURNING row_version INTO v_order;
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE');
      END IF;
      v_result := jsonb_build_object('placementId', p_payload->>'placementId', 'flag', v_flag, 'value', v_bool, 'rowVersion', v_order);
    ELSIF p_command = 'attach-asset' THEN
      IF v_issue.state NOT IN ('ISSUE_ASSEMBLY', 'ISSUE_PREPARATION', 'ISSUE_READY') THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      INSERT INTO production.placement_assets (id, owner_organization_id, placement_id, asset_id)
      SELECT gen_random_uuid(), v_owner, placement.id, asset.id
        FROM production.issue_placements AS placement
        JOIN production.draft_versions AS version ON version.id = placement.draft_version_id
        JOIN production.drafts AS draft ON draft.id = version.draft_id
        JOIN production.editorial_works AS work ON work.id = draft.work_id
        JOIN production.assets AS asset
          ON asset.id = (p_payload->>'assetId')::uuid
         AND asset.owner_organization_id = v_owner
         AND asset.project_id = work.project_id
       WHERE placement.id = (p_payload->>'placementId')::uuid
         AND placement.issue_id = v_issue.id;
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
      END IF;
      UPDATE production.issues
         SET state = 'ISSUE_ASSEMBLY', row_version = row_version + 1, updated_at = v_now
       WHERE id = v_issue.id;
      v_result := jsonb_build_object('issueId', v_issue.id, 'state', 'ISSUE_ASSEMBLY', 'rowVersion', v_issue.row_version + 1);
    ELSIF p_command = 'prepare-story' THEN
      SELECT version.id INTO v_version
        FROM production.draft_versions AS version
       WHERE version.id = (p_payload->>'versionId')::uuid
         AND version.owner_organization_id = v_owner
         AND btrim(version.body) <> ''
         AND EXISTS (SELECT 1 FROM production.editorial_approvals AS approval WHERE approval.draft_version_id = version.id)
         AND EXISTS (
           SELECT 1 FROM production.client_approvals AS approval
            WHERE approval.draft_version_id = version.id AND approval.decision = 'APPROVED'
         )
         AND NOT EXISTS (
           SELECT 1
             FROM production.placement_assets AS link
             JOIN production.issue_placements AS placement ON placement.id = link.placement_id
             JOIN production.assets AS asset ON asset.id = link.asset_id
            WHERE placement.draft_version_id = version.id
              AND asset.cleared IS NOT TRUE
         );
      IF v_version IS NULL THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      INSERT INTO production.story_preparations (id, owner_organization_id, draft_version_id, actor_membership_id, prepared_at)
      VALUES (gen_random_uuid(), v_owner, v_version, p_actor_membership_id, v_now)
      ON CONFLICT (draft_version_id) DO NOTHING;
      v_result := jsonb_build_object('versionId', v_version, 'prepared', true);
    ELSIF p_command = 'prepare-issue' THEN
      IF v_issue.state <> 'ISSUE_ASSEMBLY' THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM production.issue_sections WHERE issue_id = v_issue.id)
         OR NOT EXISTS (SELECT 1 FROM production.issue_placements WHERE issue_id = v_issue.id)
         OR NOT EXISTS (SELECT 1 FROM production.issue_covers WHERE issue_id = v_issue.id)
      THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      UPDATE production.issues
         SET state = 'ISSUE_PREPARATION', row_version = row_version + 1, updated_at = v_now
       WHERE id = v_issue.id;
      v_result := jsonb_build_object('issueId', v_issue.id, 'state', 'ISSUE_PREPARATION', 'rowVersion', v_issue.row_version + 1);
    ELSIF p_command = 'mark-ready' THEN
      IF v_issue.state <> 'ISSUE_PREPARATION' OR NOT production.r9_issue_is_ready(v_issue.id, v_owner) THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      UPDATE production.issues
         SET state = 'ISSUE_READY', row_version = row_version + 1, updated_at = v_now
       WHERE id = v_issue.id;
      v_result := jsonb_build_object('issueId', v_issue.id, 'state', 'ISSUE_READY', 'rowVersion', v_issue.row_version + 1);
    ELSIF p_command = 'reopen-issue' THEN
      IF v_issue.state NOT IN ('ISSUE_PREPARATION', 'ISSUE_READY') THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      UPDATE production.issues
         SET state = 'ISSUE_ASSEMBLY', row_version = row_version + 1, updated_at = v_now
       WHERE id = v_issue.id;
      v_result := jsonb_build_object('issueId', v_issue.id, 'state', 'ISSUE_ASSEMBLY', 'rowVersion', v_issue.row_version + 1);
    ELSIF p_command = 'schedule-issue' THEN
      v_run := (p_payload->>'runAt')::timestamptz;
      IF EXISTS (
        SELECT 1 FROM production.issue_schedules
         WHERE issue_id = v_issue.id AND status = 'PENDING'
      ) THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
      END IF;
      IF v_issue.state <> 'ISSUE_READY'
         OR v_run IS NULL
         OR v_run <= v_now
         OR NOT production.r9_issue_is_ready(v_issue.id, v_owner)
      THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      v_id := gen_random_uuid();
      INSERT INTO production.issue_schedules (
        id, owner_organization_id, issue_id, run_at, status, idempotency_key, created_by
      ) VALUES (
        v_id, v_owner, v_issue.id, v_run, 'PENDING', p_idempotency_key, p_actor_membership_id
      );
      UPDATE production.issues
         SET state = 'ISSUE_SCHEDULED', row_version = row_version + 1, updated_at = v_now
       WHERE id = v_issue.id;
      v_result := jsonb_build_object('scheduleId', v_id, 'issueId', v_issue.id, 'state', 'ISSUE_SCHEDULED', 'rowVersion', v_issue.row_version + 1, 'runAt', v_run);
    ELSIF p_command = 'cancel-schedule' THEN
      IF v_issue.state <> 'ISSUE_SCHEDULED' THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      UPDATE production.issue_schedules
         SET status = 'CANCELLED', row_version = row_version + 1
       WHERE issue_id = v_issue.id
         AND status = 'PENDING';
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      UPDATE production.issues
         SET state = 'ISSUE_READY', row_version = row_version + 1, updated_at = v_now
       WHERE id = v_issue.id;
      v_result := jsonb_build_object('issueId', v_issue.id, 'state', 'ISSUE_READY', 'rowVersion', v_issue.row_version + 1);
    ELSIF p_command = 'publish-issue' THEN
      v_result := production.r9_publish_issue(v_owner, v_issue.id, p_actor_membership_id, v_now);
      IF v_result->>'kind' = 'error' THEN
        RETURN v_result;
      END IF;
      v_result := v_result - 'kind';
    ELSIF p_command = 'archive-issue' THEN
      IF v_issue.state <> 'ISSUE_PUBLISHED' THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      UPDATE production.issues
         SET state = 'ISSUE_ARCHIVED', row_version = row_version + 1, updated_at = v_now
       WHERE id = v_issue.id;
      INSERT INTO production.issue_transitions (
        id, owner_organization_id, issue_id, from_state, to_state, actor_membership_id, reason, issue_row_version, occurred_at
      ) VALUES (
        gen_random_uuid(), v_owner, v_issue.id, 'ISSUE_PUBLISHED', 'ISSUE_ARCHIVED', p_actor_membership_id,
        'archive', v_issue.row_version + 1, v_now
      );
      v_result := jsonb_build_object('issueId', v_issue.id, 'state', 'ISSUE_ARCHIVED', 'rowVersion', v_issue.row_version + 1);
    ELSIF p_command = 'create-shelf' THEN
      IF NULLIF(btrim(p_payload->>'name'), '') IS NULL THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM iam.people WHERE id = (p_payload->>'editorPersonId')::uuid) THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
      END IF;
      v_id := gen_random_uuid();
      v_slug := production.r9_slug(p_payload->>'name');
      INSERT INTO platform.resources (id, resource_type, title, owner_organization_id, visibility, sensitivity, created_at)
      VALUES (v_id, 'personal-shelf', left(btrim(p_payload->>'name'), 200), v_owner, 'INTERNAL', 'STANDARD', v_now);
      INSERT INTO production.personal_shelves (
        id, resource_id, owner_organization_id, slug, name, editor_person_id, principles, description
      ) VALUES (
        v_id, v_id, v_owner, v_slug, left(btrim(p_payload->>'name'), 200), (p_payload->>'editorPersonId')::uuid,
        left(COALESCE(p_payload->>'principles', ''), 2000), left(COALESCE(p_payload->>'description', ''), 2000)
      );
      v_result := jsonb_build_object('shelfId', v_id, 'slug', v_slug);
    ELSIF p_command = 'add-shelf-item' THEN
      IF NOT EXISTS (
        SELECT 1 FROM production.personal_shelves
         WHERE id = (p_payload->>'shelfId')::uuid AND owner_organization_id = v_owner
      ) OR NOT EXISTS (
        SELECT 1 FROM production.editorial_works
         WHERE id = (p_payload->>'editorialWorkId')::uuid AND owner_organization_id = v_owner
      ) THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
      END IF;
      SELECT COALESCE(max(sort_order), 0) + 1 INTO v_order
        FROM production.personal_shelf_items WHERE shelf_id = (p_payload->>'shelfId')::uuid;
      v_id := gen_random_uuid();
      INSERT INTO production.personal_shelf_items (id, owner_organization_id, shelf_id, editorial_work_id, sort_order)
      VALUES (v_id, v_owner, (p_payload->>'shelfId')::uuid, (p_payload->>'editorialWorkId')::uuid, v_order);
      v_result := jsonb_build_object('itemId', v_id, 'shelfId', p_payload->>'shelfId');
    ELSE
      RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
    END IF;
  END IF;

  IF v_issue.id IS NOT NULL AND p_command NOT IN ('prepare-story', 'create-shelf', 'add-shelf-item', 'set-sponsored-rights') THEN
    INSERT INTO production.issue_transitions (
      id, owner_organization_id, issue_id, from_state, to_state, actor_membership_id, reason, issue_row_version, occurred_at
    )
    SELECT gen_random_uuid(), v_owner, v_issue.id, v_issue.state, COALESCE(v_result->>'state', v_issue.state),
           p_actor_membership_id, p_command, COALESCE((v_result->>'rowVersion')::integer, v_issue.row_version), v_now
     WHERE p_command NOT IN ('create-issue', 'publish-issue', 'archive-issue')
       AND v_issue.state IS DISTINCT FROM COALESCE(v_result->>'state', v_issue.state);
  END IF;

  INSERT INTO platform.idempotency_receipts (
    id, owner_organization_id, scope, idempotency_key, request_hash,
    state, response_status, response_hash, created_at, completed_at, expires_at
  ) VALUES (
    p_receipt_id, v_owner, 'publication.' || p_command, p_idempotency_key, p_request_hash,
    'COMPLETED', 200, p_request_hash, v_now, v_now, v_now + interval '1 day'
  );
  SELECT membership.user_account_id INTO v_actor_user
    FROM iam.organization_memberships AS membership
   WHERE membership.id = p_actor_membership_id;
  INSERT INTO audit.audit_events (
    id, owner_organization_id, actor_type, actor_user_id, actor_membership_id, action, request_id,
    correlation_id, after_hash, redacted_diff, idempotency_key, occurred_at
  ) VALUES (
    p_audit_id, v_owner, 'USER', v_actor_user, p_actor_membership_id, 'r9.' || p_command,
    left(p_request_id, 200), p_idempotency_key, p_request_hash, v_result, p_idempotency_key, v_now
  );
  RETURN jsonb_build_object('kind', 'ok', 'code', 'CREATED') || v_result;
EXCEPTION
  WHEN unique_violation OR check_violation THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
END
$$;
CREATE FUNCTION production.r9_run_due()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, production
AS $$
DECLARE
  v_schedule production.issue_schedules%ROWTYPE;
  v_result jsonb;
  v_published integer := 0;
  v_failed integer := 0;
  v_now timestamptz := clock_timestamp();
BEGIN
  FOR v_schedule IN
    SELECT schedule.*
      FROM production.issue_schedules AS schedule
     WHERE schedule.status = 'PENDING'
       AND schedule.run_at <= v_now
     ORDER BY schedule.run_at
     FOR UPDATE SKIP LOCKED
  LOOP
    v_result := production.r9_publish_issue(
      v_schedule.owner_organization_id,
      v_schedule.issue_id,
      v_schedule.created_by,
      v_now
    );
    IF v_result->>'kind' = 'ok' AND COALESCE((v_result->>'created')::boolean, false) THEN
      v_published := v_published + 1;
    ELSIF v_result->>'kind' = 'ok' THEN
      UPDATE production.issue_schedules
         SET status = 'COMPLETED', row_version = row_version + 1
       WHERE id = v_schedule.id
         AND status = 'PENDING';
    ELSE
      UPDATE production.issue_schedules
         SET status = 'FAILED', row_version = row_version + 1
       WHERE id = v_schedule.id
         AND status = 'PENDING';
      UPDATE production.issues
         SET state = 'ISSUE_READY', row_version = row_version + 1, updated_at = v_now
       WHERE id = v_schedule.issue_id
         AND state = 'ISSUE_SCHEDULED';
      v_failed := v_failed + 1;
    END IF;
  END LOOP;
  RETURN jsonb_build_object('published', v_published, 'failed', v_failed);
END
$$;

CREATE FUNCTION production.r9_public_issue(p_slug text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, production
AS $$
  SELECT CASE WHEN count(*) = 1 THEN (jsonb_agg(payload))->0 END
    FROM (
      SELECT jsonb_build_object(
        'slug', issue.slug,
        'title', issue.title,
        'season', issue.season,
        'theme', issue.theme,
        'availability', issue.availability,
        'state', issue.state,
        'editionNumber', issue.edition_number,
        'publishedAt', snapshot.published_at,
        'cover', jsonb_build_object('headline', cover.headline, 'dek', cover.dek, 'alt', cover.alt_text),
        'articles', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'slug', item.article_slug,
            'title', item.title,
            'author', item.author_name,
            'summary', item.summary,
            'alt', item.alt_text,
            'digest', item.digest,
            'versionId', item.draft_version_id,
            'body', version.body,
            'sortOrder', item.sort_order
          ) ORDER BY item.sort_order)
            FROM production.publication_snapshot_items AS item
            JOIN production.draft_versions AS version ON version.id = item.draft_version_id
           WHERE item.snapshot_id = snapshot.id
        ), '[]'::jsonb)
      ) AS payload
        FROM production.issues AS issue
        JOIN production.publication_snapshots AS snapshot
          ON snapshot.issue_id = issue.id
         AND snapshot.edition_number = issue.edition_number
        LEFT JOIN production.issue_covers AS cover ON cover.issue_id = issue.id
       WHERE issue.slug = p_slug
         AND issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED')
    ) AS published;
$$;

CREATE FUNCTION production.r9_public_article(p_slug text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, production
AS $$
  SELECT jsonb_build_object(
    'slug', item.article_slug,
    'title', item.title,
    'author', item.author_name,
    'summary', item.summary,
    'alt', item.alt_text,
    'digest', item.digest,
    'versionId', item.draft_version_id,
    'body', version.body,
    'issueSlug', issue.slug,
    'issueTitle', issue.title
  )
    FROM production.publication_snapshot_items AS item
    JOIN production.publication_snapshots AS snapshot ON snapshot.id = item.snapshot_id
    JOIN production.issues AS issue
      ON issue.id = snapshot.issue_id
     AND issue.edition_number = snapshot.edition_number
    JOIN production.draft_versions AS version ON version.id = item.draft_version_id
   WHERE item.article_slug = p_slug
     AND issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED')
   ORDER BY snapshot.published_at DESC
   LIMIT 1;
$$;

CREATE FUNCTION production.r9_public_search(p_query text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, production
AS $$
  SELECT COALESCE(jsonb_agg(row_to_json(hit)), '[]'::jsonb)
    FROM (
      SELECT issue.slug, issue.title, 'issue' AS kind, snapshot.published_at AS "publishedAt", NULL::text AS author
        FROM production.issues AS issue
        JOIN production.publication_snapshots AS snapshot
          ON snapshot.issue_id = issue.id
         AND snapshot.edition_number = issue.edition_number
       WHERE issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED')
         AND issue.title ILIKE '%' || replace(COALESCE(p_query, ''), '%', '') || '%'
      UNION ALL
      SELECT item.article_slug, item.title, 'article', snapshot.published_at, item.author_name
        FROM production.publication_snapshot_items AS item
        JOIN production.publication_snapshots AS snapshot ON snapshot.id = item.snapshot_id
        JOIN production.issues AS issue ON issue.id = snapshot.issue_id AND issue.edition_number = snapshot.edition_number
       WHERE issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED')
         AND item.title ILIKE '%' || replace(COALESCE(p_query, ''), '%', '') || '%'
    ) AS hit;
$$;

CREATE FUNCTION production.r9_public_premium()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, production
AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'slug', issue.slug,
    'title', issue.title,
    'editionNumber', issue.edition_number
  )), '[]'::jsonb)
    FROM production.issues AS issue
   WHERE issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED')
     AND issue.availability = 'PREMIUM';
$$;

CREATE FUNCTION production.r9_public_sitemap()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, production
AS $$
  SELECT COALESCE(jsonb_agg(path), '[]'::jsonb)
    FROM (
      SELECT '/magazine/read/' || issue.slug AS path
        FROM production.issues AS issue
       WHERE issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED')
      UNION ALL
      SELECT '/article/' || item.article_slug
        FROM production.publication_snapshot_items AS item
        JOIN production.publication_snapshots AS snapshot ON snapshot.id = item.snapshot_id
        JOIN production.issues AS issue ON issue.id = snapshot.issue_id
       WHERE issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED')
    ) AS paths;
$$;

CREATE FUNCTION production.r9_public_shelves()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, production
AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object('slug', shelf.slug, 'name', shelf.name) ORDER BY shelf.name), '[]'::jsonb)
    FROM production.personal_shelves AS shelf
   WHERE EXISTS (
     SELECT 1
       FROM production.personal_shelf_items AS shelf_item
       JOIN production.drafts AS draft ON draft.work_id = shelf_item.editorial_work_id
       JOIN production.draft_versions AS version ON version.draft_id = draft.id
       JOIN production.publication_snapshot_items AS item ON item.draft_version_id = version.id
       JOIN production.publication_snapshots AS snapshot ON snapshot.id = item.snapshot_id
       JOIN production.issues AS issue
         ON issue.id = snapshot.issue_id
        AND issue.edition_number = snapshot.edition_number
      WHERE shelf_item.shelf_id = shelf.id
        AND issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED')
   );
$$;

CREATE FUNCTION production.r9_public_shelf(p_slug text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, production
AS $$
  SELECT jsonb_build_object(
    'slug', shelf.slug,
    'name', shelf.name,
    'principles', shelf.principles,
    'description', shelf.description,
    'stories', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('title', item.title, 'slug', item.article_slug) ORDER BY shelf_item.sort_order)
        FROM production.personal_shelf_items AS shelf_item
        JOIN production.publication_snapshot_items AS item
          ON item.draft_version_id IN (
            SELECT version.id
              FROM production.draft_versions AS version
              JOIN production.drafts AS draft ON draft.id = version.draft_id
             WHERE draft.work_id = shelf_item.editorial_work_id
          )
        JOIN production.publication_snapshots AS snapshot ON snapshot.id = item.snapshot_id
        JOIN production.issues AS issue
          ON issue.id = snapshot.issue_id
         AND issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED')
       WHERE shelf_item.shelf_id = shelf.id
    ), '[]'::jsonb)
  )
    FROM production.personal_shelves AS shelf
   WHERE shelf.slug = p_slug;
$$;

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'publications','issues','issue_sections','issue_placements','placement_assets','issue_covers',
    'issue_pages','sponsored_placements','issue_schedules','publication_snapshots',
    'publication_snapshot_items','story_preparations','personal_shelves','personal_shelf_items','issue_transitions'
  ]
  LOOP
    EXECUTE format('ALTER TABLE production.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('ALTER TABLE production.%I FORCE ROW LEVEL SECURITY', table_name);
    EXECUTE format(
      'CREATE POLICY r9_tenant ON production.%I FOR ALL TO perspective_runtime USING (owner_organization_id = platform.current_organization_id()) WITH CHECK (owner_organization_id = platform.current_organization_id())',
      table_name
    );
    EXECUTE format('REVOKE ALL ON production.%I FROM PUBLIC, perspective_runtime, perspective_public', table_name);
    EXECUTE format('GRANT SELECT ON production.%I TO perspective_runtime', table_name);
  END LOOP;
END
$$;

CREATE POLICY r9_published_issues ON production.issues
  FOR SELECT TO perspective_public
  USING (state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED'));

CREATE POLICY r9_published_child ON production.issue_sections
  FOR SELECT TO perspective_public
  USING (EXISTS (
    SELECT 1 FROM production.issues AS issue
     WHERE issue.id = issue_sections.issue_id
       AND issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED')
  ));

CREATE POLICY r9_published_placements ON production.issue_placements
  FOR SELECT TO perspective_public
  USING (EXISTS (
    SELECT 1 FROM production.issues AS issue
     WHERE issue.id = issue_placements.issue_id
       AND issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED')
  ));

CREATE POLICY r9_published_covers ON production.issue_covers
  FOR SELECT TO perspective_public
  USING (EXISTS (
    SELECT 1 FROM production.issues AS issue
     WHERE issue.id = issue_covers.issue_id
       AND issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED')
  ));

CREATE POLICY r9_published_pages ON production.issue_pages
  FOR SELECT TO perspective_public
  USING (EXISTS (
    SELECT 1 FROM production.issues AS issue
     WHERE issue.id = issue_pages.issue_id
       AND issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED')
  ));

CREATE POLICY r9_published_snapshots ON production.publication_snapshots
  FOR SELECT TO perspective_public
  USING (EXISTS (
    SELECT 1 FROM production.issues AS issue
     WHERE issue.id = publication_snapshots.issue_id
       AND issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED')
  ));

CREATE POLICY r9_published_items ON production.publication_snapshot_items
  FOR SELECT TO perspective_public
  USING (EXISTS (
    SELECT 1
      FROM production.publication_snapshots AS snapshot
      JOIN production.issues AS issue ON issue.id = snapshot.issue_id
     WHERE snapshot.id = publication_snapshot_items.snapshot_id
       AND issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED')
  ));

CREATE POLICY r9_published_versions ON production.draft_versions
  FOR SELECT TO perspective_public
  USING (EXISTS (
    SELECT 1
      FROM production.publication_snapshot_items AS item
      JOIN production.publication_snapshots AS snapshot ON snapshot.id = item.snapshot_id
      JOIN production.issues AS issue ON issue.id = snapshot.issue_id
     WHERE item.draft_version_id = draft_versions.id
       AND issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED')
  ));

CREATE POLICY r9_published_shelves ON production.personal_shelves
  FOR SELECT TO perspective_public
  USING (true);

CREATE POLICY r9_published_shelf_items ON production.personal_shelf_items
  FOR SELECT TO perspective_public
  USING (true);

CREATE POLICY r9_public_versions_boundary ON production.draft_versions
  AS RESTRICTIVE
  FOR SELECT
  TO perspective_public
  USING (EXISTS (
    SELECT 1
      FROM production.publication_snapshot_items AS item
      JOIN production.publication_snapshots AS snapshot ON snapshot.id = item.snapshot_id
      JOIN production.issues AS issue ON issue.id = snapshot.issue_id
     WHERE item.draft_version_id = draft_versions.id
       AND issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED')
  ));

GRANT SELECT ON production.issues, production.issue_sections, production.issue_placements,
  production.issue_covers, production.issue_pages, production.publication_snapshots,
  production.publication_snapshot_items, production.personal_shelves, production.personal_shelf_items,
  production.draft_versions
  TO perspective_public;

GRANT EXECUTE ON FUNCTION production.r9_execute(text, uuid, jsonb, uuid, uuid, text, text, text) TO perspective_runtime;
GRANT EXECUTE ON FUNCTION production.r9_run_due() TO perspective_runtime;
GRANT EXECUTE ON FUNCTION production.r9_public_issue(text) TO perspective_runtime, perspective_public;
GRANT EXECUTE ON FUNCTION production.r9_public_article(text) TO perspective_runtime, perspective_public;
GRANT EXECUTE ON FUNCTION production.r9_public_search(text) TO perspective_runtime, perspective_public;
GRANT EXECUTE ON FUNCTION production.r9_public_premium() TO perspective_runtime, perspective_public;
GRANT EXECUTE ON FUNCTION production.r9_public_sitemap() TO perspective_runtime, perspective_public;
GRANT EXECUTE ON FUNCTION production.r9_public_shelf(text) TO perspective_runtime, perspective_public;
GRANT EXECUTE ON FUNCTION production.r9_public_shelves() TO perspective_runtime, perspective_public;

REVOKE ALL ON FUNCTION production.r9_execute(text, uuid, jsonb, uuid, uuid, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION production.r9_publish_issue(uuid, uuid, uuid, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION production.r9_run_due() FROM PUBLIC;
REVOKE ALL ON FUNCTION production.r9_issue_is_ready(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION production.r9_rebuild_pages(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION production.r9_public_shelf(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION production.r9_public_shelves() FROM PUBLIC;
