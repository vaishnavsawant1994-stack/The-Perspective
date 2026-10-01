-- R8 editorial and client production. Runtime may read under RLS and may
-- execute the two definer functions. It cannot write these tables directly.
-- PUBLISHED and DISTRIBUTION are lifecycle markers, not publication or delivery.

CREATE SCHEMA IF NOT EXISTS production;

CREATE TABLE production.projects (
  id uuid PRIMARY KEY,
  resource_id uuid NOT NULL UNIQUE,
  owner_organization_id uuid NOT NULL,
  proposal_id uuid NOT NULL,
  proposal_version_id uuid NOT NULL,
  client_account_id uuid NOT NULL,
  client_organization_id uuid NOT NULL,
  title text NOT NULL,
  state text NOT NULL DEFAULT 'PROJECT_CREATED',
  row_version integer NOT NULL DEFAULT 1,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT projects_id_owner_org_key UNIQUE (id, owner_organization_id),
  CONSTRAINT projects_state_check CHECK (state IN (
    'PROJECT_CREATED','IQ_GENERATED','IQ_SENT','IQ_RECEIVED','DRAFT_GENERATED',
    'EDITORIAL_REVIEW','CLIENT_REVIEW','CLIENT_CHANGES_REQUESTED','CLIENT_APPROVAL',
    'ASSETS','DESIGN_STARTED','DESIGN_REVIEW','DESIGN_APPROVED','PUBLICATION_READY',
    'PUBLISHED','DISTRIBUTION','COMPLETED','CANCELLED'
  ))
);

CREATE UNIQUE INDEX projects_one_open_proposal
  ON production.projects (proposal_id)
  WHERE state <> 'CANCELLED';

CREATE TABLE production.project_members (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  project_id uuid NOT NULL,
  membership_id uuid NOT NULL,
  project_role text NOT NULL,
  row_version integer NOT NULL DEFAULT 1,
  ended_at timestamptz(6),
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT project_members_id_owner_key UNIQUE (id, owner_organization_id),
  CONSTRAINT project_members_role_check CHECK (project_role IN ('LEAD','EDITOR','PRODUCER','CONTRIBUTOR','CLIENT_CONTACT')),
  CONSTRAINT project_members_project_fkey FOREIGN KEY (project_id, owner_organization_id)
    REFERENCES production.projects (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX project_members_one_active
  ON production.project_members (project_id, membership_id)
  WHERE ended_at IS NULL;

CREATE TABLE production.project_transitions (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  project_id uuid NOT NULL,
  from_state text NOT NULL,
  to_state text NOT NULL,
  actor_membership_id uuid NOT NULL,
  reason text,
  project_row_version integer NOT NULL,
  occurred_at timestamptz(6) NOT NULL,
  CONSTRAINT project_transitions_project_fkey FOREIGN KEY (project_id, owner_organization_id)
    REFERENCES production.projects (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.milestones (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  project_id uuid NOT NULL,
  kind text NOT NULL,
  completed_at timestamptz(6),
  row_version integer NOT NULL DEFAULT 1,
  CONSTRAINT milestones_kind_check CHECK (kind IN (
    'INTERVIEW_COMPLETE','DRAFT_COMPLETE','EDITORIAL_REVIEW_COMPLETE','CLIENT_APPROVAL',
    'ASSETS_COMPLETE','DESIGN_COMPLETE','PUBLICATION_READY'
  )),
  CONSTRAINT milestones_project_kind UNIQUE (project_id, kind),
  CONSTRAINT milestones_project_fkey FOREIGN KEY (project_id, owner_organization_id)
    REFERENCES production.projects (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.questionnaires (
  id uuid PRIMARY KEY,
  resource_id uuid NOT NULL UNIQUE,
  owner_organization_id uuid NOT NULL,
  project_id uuid NOT NULL UNIQUE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT',
  row_version integer NOT NULL DEFAULT 1,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT questionnaires_status_check CHECK (status IN ('DRAFT','GENERATED','SENT','RECEIVED','LOCKED')),
  CONSTRAINT questionnaires_id_owner_key UNIQUE (id, owner_organization_id),
  CONSTRAINT questionnaires_project_fkey FOREIGN KEY (project_id, owner_organization_id)
    REFERENCES production.projects (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.questionnaire_versions (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  questionnaire_id uuid NOT NULL,
  version_number integer NOT NULL,
  body text NOT NULL,
  digest text NOT NULL,
  sent_at timestamptz(6),
  CONSTRAINT questionnaire_versions_number UNIQUE (questionnaire_id, version_number),
  CONSTRAINT questionnaire_versions_id_owner_key UNIQUE (id, owner_organization_id),
  CONSTRAINT questionnaire_versions_questionnaire_fkey FOREIGN KEY (questionnaire_id, owner_organization_id)
    REFERENCES production.questionnaires (id, owner_organization_id) ON DELETE RESTRICT
);

ALTER TABLE production.questionnaires
  ADD COLUMN current_version_id uuid,
  ADD CONSTRAINT questionnaires_current_version_fkey
    FOREIGN KEY (current_version_id) REFERENCES production.questionnaire_versions (id) ON DELETE RESTRICT;

CREATE TABLE production.editorial_works (
  id uuid PRIMARY KEY,
  resource_id uuid NOT NULL UNIQUE,
  owner_organization_id uuid NOT NULL,
  project_id uuid NOT NULL UNIQUE,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT editorial_works_id_owner_key UNIQUE (id, owner_organization_id),
  CONSTRAINT editorial_works_project_fkey FOREIGN KEY (project_id, owner_organization_id)
    REFERENCES production.projects (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.drafts (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  work_id uuid NOT NULL UNIQUE,
  body text NOT NULL DEFAULT '',
  row_version integer NOT NULL DEFAULT 1,
  CONSTRAINT drafts_id_owner_key UNIQUE (id, owner_organization_id),
  CONSTRAINT drafts_work_fkey FOREIGN KEY (work_id, owner_organization_id)
    REFERENCES production.editorial_works (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.questionnaire_responses (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  questionnaire_version_id uuid NOT NULL UNIQUE,
  client_organization_id uuid NOT NULL,
  body text NOT NULL,
  received_at timestamptz(6) NOT NULL,
  CONSTRAINT questionnaire_responses_version_fkey FOREIGN KEY (questionnaire_version_id, owner_organization_id)
    REFERENCES production.questionnaire_versions (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.draft_versions (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  draft_id uuid NOT NULL,
  version_number integer NOT NULL,
  body text NOT NULL,
  digest text NOT NULL,
  issued_at timestamptz(6) NOT NULL,
  CONSTRAINT draft_versions_number UNIQUE (draft_id, version_number),
  CONSTRAINT draft_versions_id_owner_key UNIQUE (id, owner_organization_id),
  CONSTRAINT draft_versions_draft_fkey FOREIGN KEY (draft_id, owner_organization_id)
    REFERENCES production.drafts (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.editorial_reviews (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  draft_version_id uuid NOT NULL,
  reviewer_membership_id uuid NOT NULL,
  state text NOT NULL DEFAULT 'OPEN',
  row_version integer NOT NULL DEFAULT 1,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT editorial_reviews_state_check CHECK (state IN ('OPEN','CHANGES_REQUESTED','RESOLVED')),
  CONSTRAINT editorial_reviews_id_owner_key UNIQUE (id, owner_organization_id),
  CONSTRAINT editorial_reviews_version_fkey FOREIGN KEY (draft_version_id, owner_organization_id)
    REFERENCES production.draft_versions (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX editorial_reviews_one_open
  ON production.editorial_reviews (draft_version_id)
  WHERE state = 'OPEN';

CREATE TABLE production.editorial_review_notes (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  review_id uuid NOT NULL,
  author_membership_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT editorial_review_notes_review_fkey FOREIGN KEY (review_id, owner_organization_id)
    REFERENCES production.editorial_reviews (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.editorial_approvals (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  draft_version_id uuid NOT NULL UNIQUE,
  actor_membership_id uuid NOT NULL,
  approved_at timestamptz(6) NOT NULL,
  CONSTRAINT editorial_approvals_version_fkey FOREIGN KEY (draft_version_id, owner_organization_id)
    REFERENCES production.draft_versions (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.client_approvals (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  draft_version_id uuid NOT NULL UNIQUE,
  actor_membership_id uuid NOT NULL,
  client_organization_id uuid NOT NULL,
  decision text NOT NULL,
  decided_at timestamptz(6) NOT NULL,
  CONSTRAINT client_approvals_decision_check CHECK (decision IN ('APPROVED','REJECTED')),
  CONSTRAINT client_approvals_version_fkey FOREIGN KEY (draft_version_id, owner_organization_id)
    REFERENCES production.draft_versions (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.assets (
  id uuid PRIMARY KEY,
  resource_id uuid NOT NULL UNIQUE,
  owner_organization_id uuid NOT NULL,
  project_id uuid NOT NULL,
  visibility text NOT NULL DEFAULT 'INTERNAL',
  present boolean NOT NULL DEFAULT false,
  approved boolean NOT NULL DEFAULT false,
  licensed boolean NOT NULL DEFAULT false,
  cleared boolean NOT NULL DEFAULT false,
  row_version integer NOT NULL DEFAULT 1,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT assets_visibility_check CHECK (visibility IN ('INTERNAL','CLIENT_VISIBLE')),
  CONSTRAINT assets_cleared_check CHECK (cleared = false OR (approved = true AND licensed = true)),
  CONSTRAINT assets_id_owner_key UNIQUE (id, owner_organization_id),
  CONSTRAINT assets_project_fkey FOREIGN KEY (project_id, owner_organization_id)
    REFERENCES production.projects (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.asset_versions (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  asset_id uuid NOT NULL,
  version_number integer NOT NULL,
  digest text NOT NULL,
  storage_key text NOT NULL,
  byte_size integer NOT NULL,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT asset_versions_number UNIQUE (asset_id, version_number),
  CONSTRAINT asset_versions_size_check CHECK (byte_size >= 0),
  CONSTRAINT asset_versions_asset_fkey FOREIGN KEY (asset_id, owner_organization_id)
    REFERENCES production.assets (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.deliverables (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  project_id uuid NOT NULL,
  kind text NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  completed_at timestamptz(6),
  row_version integer NOT NULL DEFAULT 1,
  CONSTRAINT deliverables_kind_check CHECK (kind IN (
    'QUESTIONNAIRE','DRAFT','EDITORIAL_REVIEW','CLIENT_APPROVAL','ASSET_SET','DESIGN','PUBLICATION_HANDOFF'
  )),
  CONSTRAINT deliverables_project_fkey FOREIGN KEY (project_id, owner_organization_id)
    REFERENCES production.projects (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.citations (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  draft_version_id uuid NOT NULL,
  source_label text NOT NULL,
  locator text NOT NULL,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT citations_version_fkey FOREIGN KEY (draft_version_id, owner_organization_id)
    REFERENCES production.draft_versions (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.fact_checks (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  draft_version_id uuid NOT NULL,
  status text NOT NULL,
  reviewer_membership_id uuid NOT NULL,
  note text NOT NULL DEFAULT '',
  recorded_at timestamptz(6) NOT NULL,
  CONSTRAINT fact_checks_status_check CHECK (status IN ('UNVERIFIED','VERIFIED','DISPUTED')),
  CONSTRAINT fact_checks_version_fkey FOREIGN KEY (draft_version_id, owner_organization_id)
    REFERENCES production.draft_versions (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.credits (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  project_id uuid NOT NULL,
  person_id uuid NOT NULL,
  credit_role text NOT NULL,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT credits_role_check CHECK (credit_role IN ('AUTHOR','EDITOR','PHOTOGRAPHER','DESIGNER','CONTRIBUTOR')),
  CONSTRAINT credits_once UNIQUE (project_id, person_id, credit_role),
  CONSTRAINT credits_person_fkey FOREIGN KEY (person_id) REFERENCES iam.people (id) ON DELETE RESTRICT,
  CONSTRAINT credits_project_fkey FOREIGN KEY (project_id, owner_organization_id)
    REFERENCES production.projects (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE production.tasks (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  project_id uuid NOT NULL,
  milestone_id uuid,
  assignee_membership_id uuid,
  title text NOT NULL,
  priority text NOT NULL DEFAULT 'NORMAL',
  due_date date,
  status text NOT NULL DEFAULT 'OPEN',
  row_version integer NOT NULL DEFAULT 1,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tasks_priority_check CHECK (priority IN ('LOW','NORMAL','HIGH')),
  CONSTRAINT tasks_status_check CHECK (status IN ('OPEN','BLOCKED','COMPLETED','CANCELLED')),
  CONSTRAINT tasks_id_owner_key UNIQUE (id, owner_organization_id),
  CONSTRAINT tasks_project_fkey FOREIGN KEY (project_id, owner_organization_id)
    REFERENCES production.projects (id, owner_organization_id) ON DELETE RESTRICT,
  CONSTRAINT tasks_milestone_fkey FOREIGN KEY (milestone_id) REFERENCES production.milestones (id) ON DELETE RESTRICT
);

CREATE TABLE production.task_dependencies (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  task_id uuid NOT NULL,
  blocker_task_id uuid NOT NULL,
  CONSTRAINT task_dependencies_not_self CHECK (task_id <> blocker_task_id),
  CONSTRAINT task_dependencies_once UNIQUE (task_id, blocker_task_id),
  CONSTRAINT task_dependencies_task_fkey FOREIGN KEY (task_id, owner_organization_id)
    REFERENCES production.tasks (id, owner_organization_id) ON DELETE RESTRICT,
  CONSTRAINT task_dependencies_blocker_fkey FOREIGN KEY (blocker_task_id, owner_organization_id)
    REFERENCES production.tasks (id, owner_organization_id) ON DELETE RESTRICT
);
CREATE FUNCTION production.reject_production_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'immutable production row' USING ERRCODE = '55000';
END
$$;

CREATE FUNCTION production.freeze_sent_questionnaire_version()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' OR OLD.sent_at IS NOT NULL THEN
    RAISE EXCEPTION 'immutable questionnaire version' USING ERRCODE = '55000';
  END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER draft_versions_immutable
  BEFORE UPDATE OR DELETE ON production.draft_versions
  FOR EACH ROW EXECUTE FUNCTION production.reject_production_mutation();

CREATE TRIGGER asset_versions_immutable
  BEFORE UPDATE OR DELETE ON production.asset_versions
  FOR EACH ROW EXECUTE FUNCTION production.reject_production_mutation();

CREATE TRIGGER project_transitions_immutable
  BEFORE UPDATE OR DELETE ON production.project_transitions
  FOR EACH ROW EXECUTE FUNCTION production.reject_production_mutation();

CREATE TRIGGER editorial_review_notes_immutable
  BEFORE UPDATE OR DELETE ON production.editorial_review_notes
  FOR EACH ROW EXECUTE FUNCTION production.reject_production_mutation();

CREATE TRIGGER citations_immutable
  BEFORE UPDATE OR DELETE ON production.citations
  FOR EACH ROW EXECUTE FUNCTION production.reject_production_mutation();

CREATE TRIGGER fact_checks_immutable
  BEFORE UPDATE OR DELETE ON production.fact_checks
  FOR EACH ROW EXECUTE FUNCTION production.reject_production_mutation();

CREATE TRIGGER editorial_approvals_immutable
  BEFORE UPDATE OR DELETE ON production.editorial_approvals
  FOR EACH ROW EXECUTE FUNCTION production.reject_production_mutation();

CREATE TRIGGER client_approvals_immutable
  BEFORE UPDATE OR DELETE ON production.client_approvals
  FOR EACH ROW EXECUTE FUNCTION production.reject_production_mutation();

CREATE TRIGGER questionnaire_responses_immutable
  BEFORE UPDATE OR DELETE ON production.questionnaire_responses
  FOR EACH ROW EXECUTE FUNCTION production.reject_production_mutation();

CREATE TRIGGER questionnaire_versions_freeze
  BEFORE UPDATE OR DELETE ON production.questionnaire_versions
  FOR EACH ROW EXECUTE FUNCTION production.freeze_sent_questionnaire_version();

CREATE FUNCTION production.r8_next_state(p_project_id uuid, p_owner uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_state text;
  v_status text;
  v_latest integer;
  v_approved integer;
  v_decision text;
  v_asset_count integer;
  v_present_count integer;
  v_cleared_count integer;
BEGIN
  SELECT state INTO v_state
    FROM production.projects
   WHERE id = p_project_id AND owner_organization_id = p_owner;
  SELECT status INTO v_status
    FROM production.questionnaires
   WHERE project_id = p_project_id AND owner_organization_id = p_owner;

  SELECT max(version.version_number) INTO v_latest
    FROM production.draft_versions AS version
    JOIN production.drafts AS draft ON draft.id = version.draft_id
    JOIN production.editorial_works AS work ON work.id = draft.work_id
   WHERE work.project_id = p_project_id AND work.owner_organization_id = p_owner;

  IF v_state = 'PROJECT_CREATED' AND v_status IN ('GENERATED', 'SENT', 'RECEIVED', 'LOCKED') THEN
    RETURN 'IQ_GENERATED';
  ELSIF v_state = 'IQ_GENERATED' AND v_status IN ('SENT', 'RECEIVED', 'LOCKED') THEN
    RETURN 'IQ_SENT';
  ELSIF v_state = 'IQ_SENT' AND v_status IN ('RECEIVED', 'LOCKED') THEN
    RETURN 'IQ_RECEIVED';
  ELSIF v_state = 'IQ_RECEIVED' AND v_latest IS NOT NULL THEN
    RETURN 'DRAFT_GENERATED';
  ELSIF v_state = 'DRAFT_GENERATED' AND EXISTS (
    SELECT 1
      FROM production.editorial_reviews AS review
      JOIN production.draft_versions AS version ON version.id = review.draft_version_id
      JOIN production.drafts AS draft ON draft.id = version.draft_id
      JOIN production.editorial_works AS work ON work.id = draft.work_id
     WHERE work.project_id = p_project_id
       AND review.state = 'OPEN'
       AND version.version_number = v_latest
  ) THEN
    RETURN 'EDITORIAL_REVIEW';
  ELSIF v_state = 'EDITORIAL_REVIEW' AND EXISTS (
    SELECT 1
      FROM production.editorial_approvals AS approval
      JOIN production.draft_versions AS version ON version.id = approval.draft_version_id
     WHERE version.version_number = v_latest
       AND approval.owner_organization_id = p_owner
  ) THEN
    RETURN 'CLIENT_REVIEW';
  ELSIF v_state = 'CLIENT_REVIEW' THEN
    SELECT approval.decision INTO v_decision
      FROM production.client_approvals AS approval
      JOIN production.draft_versions AS version ON version.id = approval.draft_version_id
     WHERE version.version_number = v_latest
       AND approval.owner_organization_id = p_owner;
    IF v_decision = 'APPROVED' THEN RETURN 'CLIENT_APPROVAL'; END IF;
    IF v_decision = 'REJECTED' THEN RETURN 'CLIENT_CHANGES_REQUESTED'; END IF;
  ELSIF v_state = 'CLIENT_CHANGES_REQUESTED' THEN
    SELECT version.version_number INTO v_approved
      FROM production.client_approvals AS approval
      JOIN production.draft_versions AS version ON version.id = approval.draft_version_id
     WHERE approval.decision = 'REJECTED'
       AND approval.owner_organization_id = p_owner
     ORDER BY version.version_number DESC
     LIMIT 1;
    IF v_latest IS NOT NULL AND v_approved IS NOT NULL AND v_latest > v_approved THEN
      RETURN 'DRAFT_GENERATED';
    END IF;
  ELSIF v_state = 'CLIENT_APPROVAL' AND NOT EXISTS (
    SELECT 1
      FROM production.draft_versions AS version
      JOIN production.drafts AS draft ON draft.id = version.draft_id
      JOIN production.editorial_works AS work ON work.id = draft.work_id
      JOIN production.client_approvals AS approval ON approval.draft_version_id = version.id
     WHERE work.project_id = p_project_id
       AND approval.decision = 'APPROVED'
       AND version.version_number < v_latest
  ) AND EXISTS (
    SELECT 1
      FROM production.client_approvals AS approval
      JOIN production.draft_versions AS version ON version.id = approval.draft_version_id
     WHERE version.version_number = v_latest AND approval.decision = 'APPROVED'
  ) THEN
    RETURN 'ASSETS';
  ELSIF v_state IN ('ASSETS', 'DESIGN_APPROVED') THEN
    SELECT count(*), count(*) FILTER (WHERE present), count(*) FILTER (WHERE cleared)
      INTO v_asset_count, v_present_count, v_cleared_count
      FROM production.assets
     WHERE project_id = p_project_id AND owner_organization_id = p_owner;
    IF v_state = 'ASSETS' AND v_asset_count > 0 AND v_asset_count = v_present_count THEN
      RETURN 'DESIGN_STARTED';
    ELSIF v_state = 'DESIGN_APPROVED' AND v_asset_count > 0 AND v_asset_count = v_cleared_count THEN
      RETURN 'PUBLICATION_READY';
    END IF;
  ELSIF v_state = 'DESIGN_STARTED' AND EXISTS (
    SELECT 1
      FROM production.deliverables AS deliverable
      JOIN production.draft_versions AS version ON version.id = deliverable.target_id
     WHERE deliverable.project_id = p_project_id
       AND deliverable.kind = 'DESIGN'
       AND deliverable.target_type = 'draft-version'
       AND version.version_number = v_latest
  ) THEN
    RETURN 'DESIGN_REVIEW';
  ELSIF v_state = 'DESIGN_REVIEW' AND EXISTS (
    SELECT 1
      FROM production.deliverables AS deliverable
     WHERE deliverable.project_id = p_project_id
       AND deliverable.kind = 'DESIGN'
       AND deliverable.completed_at IS NOT NULL
  ) THEN
    RETURN 'DESIGN_APPROVED';
  ELSIF v_state = 'PUBLICATION_READY' THEN
    RETURN 'PUBLISHED';
  ELSIF v_state = 'PUBLISHED' THEN
    RETURN 'DISTRIBUTION';
  ELSIF v_state = 'DISTRIBUTION' THEN
    RETURN 'COMPLETED';
  END IF;
  RETURN NULL;
END
$$;

CREATE FUNCTION production.r8_resolve_client_version(p_version_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, production, platform
AS $$
  SELECT jsonb_build_object(
    'ownerOrganizationId', project.owner_organization_id,
    'projectId', project.id,
    'title', project.title,
    'state', project.state,
    'versionId', version.id,
    'version', version.version_number,
    'body', version.body
  )
    FROM production.draft_versions AS version
    JOIN production.drafts AS draft ON draft.id = version.draft_id
    JOIN production.editorial_works AS work ON work.id = draft.work_id
    JOIN production.projects AS project ON project.id = work.project_id
   WHERE version.id = p_version_id
     AND project.client_organization_id = platform.current_client_organization_id();
$$;

CREATE FUNCTION production.r8_execute(
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
SET search_path = pg_catalog, production, platform, audit, commercial, iam
AS $$
DECLARE
  v_owner uuid;
  v_now timestamptz;
  v_existing_hash text;
  v_existing_state text;
  v_project production.projects%ROWTYPE;
  v_result jsonb;
  v_next text;
  v_id uuid;
  v_row integer;
  v_text text;
  v_uuid uuid;
  v_bool boolean;
  v_number integer;
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
     OR p_idempotency_key !~ ('^r8:' || p_command || ':' || v_owner::text || ':[A-Za-z0-9._:-]{8,128}$')
  THEN
    RAISE EXCEPTION 'invalid R8 command' USING ERRCODE = '22023';
  END IF;

  IF p_command = 'client-decision' THEN
    IF NOT EXISTS (
      SELECT 1 FROM iam.organization_memberships AS membership
       WHERE membership.id = p_actor_membership_id
         AND membership.organization_id = platform.current_client_organization_id()
         AND membership.membership_type = 'CLIENT'
         AND membership.status = 'ACTIVE'
         AND membership.ended_at IS NULL
    ) THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
    END IF;
  ELSIF NOT EXISTS (
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
     AND scope = 'production.' || p_command
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
           AND event.action = 'r8.' || p_command
         LIMIT 1
      );
    END IF;
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
  END IF;

  IF p_command = 'create-project' THEN
    SELECT proposal.id INTO v_uuid
      FROM commercial.proposals AS proposal
      JOIN commercial.proposal_versions AS version
        ON version.proposal_id = proposal.id
       AND version.version = proposal.current_version
       AND version.owner_organization_id = proposal.owner_organization_id
      JOIN commercial.proposal_acceptances AS acceptance
        ON acceptance.proposal_id = proposal.id
       AND acceptance.proposal_version_id = version.id
      JOIN commercial.client_accounts AS account
        ON account.id = proposal.client_account_id
       AND account.owner_organization_id = proposal.owner_organization_id
       AND account.archived_at IS NULL
     WHERE proposal.id = (p_payload->>'proposalId')::uuid
       AND proposal.owner_organization_id = v_owner
       AND proposal.status = 'ACCEPTED'
       AND version.status = 'ACCEPTED'
       AND proposal.archived_at IS NULL
       AND account.client_organization_id = acceptance.client_organization_id;
    IF v_uuid IS NULL THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
    END IF;
    IF EXISTS (
      SELECT 1 FROM production.projects
       WHERE proposal_id = v_uuid AND state <> 'CANCELLED'
    ) THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
    END IF;
    v_id := gen_random_uuid();
    INSERT INTO platform.resources (
      id, resource_type, title, owner_organization_id, client_organization_id,
      visibility, sensitivity, created_at
    )
    SELECT v_id, 'production-project', left(p_payload->>'title', 200), v_owner,
           acceptance.client_organization_id, 'INTERNAL', 'STANDARD', v_now
      FROM commercial.proposal_acceptances AS acceptance
     WHERE acceptance.proposal_id = v_uuid;
    INSERT INTO production.projects (
      id, resource_id, owner_organization_id, proposal_id, proposal_version_id,
      client_account_id, client_organization_id, title, state, row_version, created_at, updated_at
    )
    SELECT v_id, v_id, v_owner, proposal.id, version.id, account.id,
           acceptance.client_organization_id, left(btrim(p_payload->>'title'), 200),
           'PROJECT_CREATED', 1, v_now, v_now
      FROM commercial.proposals AS proposal
      JOIN commercial.proposal_versions AS version
        ON version.proposal_id = proposal.id AND version.version = proposal.current_version
      JOIN commercial.proposal_acceptances AS acceptance ON acceptance.proposal_id = proposal.id
      JOIN commercial.client_accounts AS account ON account.id = proposal.client_account_id
     WHERE proposal.id = v_uuid;
    v_result := jsonb_build_object('projectId', v_id, 'state', 'PROJECT_CREATED', 'rowVersion', 1);
  ELSE
    SELECT * INTO v_project
      FROM production.projects
     WHERE owner_organization_id = v_owner
       AND id = COALESCE(
         NULLIF(p_payload->>'projectId', '')::uuid,
         (
           SELECT questionnaire.project_id
             FROM production.questionnaires AS questionnaire
            WHERE questionnaire.id = NULLIF(p_payload->>'questionnaireId', '')::uuid
         ),
         (
           SELECT questionnaire.project_id
             FROM production.questionnaire_versions AS version
             JOIN production.questionnaires AS questionnaire
               ON questionnaire.id = version.questionnaire_id
            WHERE version.id = NULLIF(p_payload->>'versionId', '')::uuid
         ),
         (
           SELECT work.project_id
             FROM production.draft_versions AS version
             JOIN production.drafts AS draft ON draft.id = version.draft_id
             JOIN production.editorial_works AS work ON work.id = draft.work_id
            WHERE version.id = NULLIF(p_payload->>'versionId', '')::uuid
         ),
         (
           SELECT work.project_id
             FROM production.editorial_reviews AS review
             JOIN production.draft_versions AS version ON version.id = review.draft_version_id
             JOIN production.drafts AS draft ON draft.id = version.draft_id
             JOIN production.editorial_works AS work ON work.id = draft.work_id
            WHERE review.id = NULLIF(p_payload->>'reviewId', '')::uuid
         ),
         (
           SELECT work.project_id
             FROM production.drafts AS draft
             JOIN production.editorial_works AS work ON work.id = draft.work_id
            WHERE draft.id = NULLIF(p_payload->>'draftId', '')::uuid
         ),
         (SELECT task.project_id FROM production.tasks AS task WHERE task.id = NULLIF(p_payload->>'taskId', '')::uuid),
         (SELECT asset.project_id FROM production.assets AS asset WHERE asset.id = NULLIF(p_payload->>'assetId', '')::uuid),
         (SELECT milestone.project_id FROM production.milestones AS milestone WHERE milestone.id = NULLIF(p_payload->>'milestoneId', '')::uuid),
         (SELECT deliverable.project_id FROM production.deliverables AS deliverable WHERE deliverable.id = NULLIF(p_payload->>'deliverableId', '')::uuid)
       )
     FOR UPDATE;
    IF v_project.id IS NULL THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
    END IF;
    IF p_payload ? 'expectedRowVersion'
       AND (p_payload->>'expectedRowVersion')::integer <> v_project.row_version
       AND p_command IN ('edit-project', 'cancel-project', 'transition')
    THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE');
    END IF;

    IF p_command = 'edit-project' THEN
      IF v_project.state IN ('COMPLETED', 'CANCELLED') THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      UPDATE production.projects
         SET title = left(btrim(p_payload->>'title'), 200),
             row_version = row_version + 1,
             updated_at = v_now
       WHERE id = v_project.id;
      v_result := jsonb_build_object('projectId', v_project.id, 'state', v_project.state, 'rowVersion', v_project.row_version + 1);
    ELSIF p_command = 'cancel-project' THEN
      IF v_project.state IN ('COMPLETED', 'CANCELLED') OR NULLIF(btrim(p_payload->>'reason'), '') IS NULL THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      UPDATE production.projects
         SET state = 'CANCELLED', row_version = row_version + 1, updated_at = v_now
       WHERE id = v_project.id;
      INSERT INTO production.project_transitions (
        id, owner_organization_id, project_id, from_state, to_state,
        actor_membership_id, reason, project_row_version, occurred_at
      ) VALUES (
        gen_random_uuid(), v_owner, v_project.id, v_project.state, 'CANCELLED',
        p_actor_membership_id, left(p_payload->>'reason', 500), v_project.row_version, v_now
      );
      v_result := jsonb_build_object('projectId', v_project.id, 'state', 'CANCELLED', 'rowVersion', v_project.row_version + 1);
    ELSIF p_command = 'assign-member' THEN
      IF NOT EXISTS (
        SELECT 1 FROM iam.organization_memberships AS membership
         WHERE membership.id = (p_payload->>'membershipId')::uuid
           AND membership.organization_id = v_owner
           AND membership.status = 'ACTIVE'
           AND membership.ended_at IS NULL
      ) THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
      END IF;
      INSERT INTO production.project_members (
        id, owner_organization_id, project_id, membership_id, project_role, row_version, created_at
      ) VALUES (
        gen_random_uuid(), v_owner, v_project.id, (p_payload->>'membershipId')::uuid,
        p_payload->>'projectRole', 1, v_now
      );
      v_result := jsonb_build_object('projectId', v_project.id, 'state', v_project.state, 'rowVersion', v_project.row_version);
    ELSIF p_command = 'end-member' THEN
      UPDATE production.project_members
         SET ended_at = v_now, row_version = row_version + 1
       WHERE project_id = v_project.id
         AND membership_id = (p_payload->>'membershipId')::uuid
         AND ended_at IS NULL
         AND row_version = (p_payload->>'expectedRowVersion')::integer;
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE');
      END IF;
      v_result := jsonb_build_object('projectId', v_project.id, 'state', v_project.state, 'rowVersion', v_project.row_version);
    ELSIF p_command = 'transition' THEN
      IF p_payload ? 'expectedState' AND p_payload->>'expectedState' IS DISTINCT FROM v_project.state THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE');
      END IF;
      v_next := production.r8_next_state(v_project.id, v_owner);
      IF v_next IS NULL OR v_project.state IN ('COMPLETED', 'CANCELLED') THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      UPDATE production.projects
         SET state = v_next, row_version = row_version + 1, updated_at = v_now
       WHERE id = v_project.id;
      INSERT INTO production.project_transitions (
        id, owner_organization_id, project_id, from_state, to_state,
        actor_membership_id, reason, project_row_version, occurred_at
      ) VALUES (
        gen_random_uuid(), v_owner, v_project.id, v_project.state, v_next,
        p_actor_membership_id, NULL, v_project.row_version, v_now
      );
      v_result := jsonb_build_object('projectId', v_project.id, 'state', v_next, 'rowVersion', v_project.row_version + 1);
    ELSIF p_command = 'create-questionnaire' THEN
      v_id := gen_random_uuid();
      INSERT INTO platform.resources (
        id, resource_type, title, owner_organization_id, client_organization_id, visibility, sensitivity, created_at
      ) VALUES (
        v_id, 'production-questionnaire', left(p_payload->>'title', 200), v_owner,
        v_project.client_organization_id, 'INTERNAL', 'STANDARD', v_now
      );
      INSERT INTO production.questionnaires (
        id, resource_id, owner_organization_id, project_id, title, status, row_version, created_at
      ) VALUES (
        v_id, v_id, v_owner, v_project.id, left(btrim(p_payload->>'title'), 200), 'DRAFT', 1, v_now
      );
      v_result := jsonb_build_object('questionnaireId', v_id, 'projectId', v_project.id, 'status', 'DRAFT', 'rowVersion', 1);
    ELSIF p_command = 'generate-questionnaire' THEN
      UPDATE production.questionnaires
         SET status = 'GENERATED',
             row_version = row_version + 1
       WHERE project_id = v_project.id
         AND status IN ('DRAFT', 'GENERATED')
         AND row_version = (p_payload->>'expectedRowVersion')::integer
       RETURNING id, title, row_version INTO v_id, v_text, v_row;
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE');
      END IF;
      v_uuid := gen_random_uuid();
      SELECT coalesce(max(version_number), 0) + 1 INTO v_number
        FROM production.questionnaire_versions WHERE questionnaire_id = v_id;
      INSERT INTO production.questionnaire_versions (
        id, owner_organization_id, questionnaire_id, version_number, body, digest
      ) VALUES (
        v_uuid, v_owner, v_id, v_number, v_text,
        encode(platform.digest(convert_to(v_text, 'UTF8'), 'sha256'), 'hex')
      );
      UPDATE production.questionnaires SET current_version_id = v_uuid WHERE id = v_id;
      v_result := jsonb_build_object('questionnaireId', v_id, 'versionId', v_uuid, 'status', 'GENERATED', 'rowVersion', v_row);
    ELSIF p_command = 'send-questionnaire' THEN
      UPDATE production.questionnaire_versions
         SET sent_at = v_now
       WHERE id = (p_payload->>'versionId')::uuid
         AND owner_organization_id = v_owner
         AND sent_at IS NULL
         AND questionnaire_id = (
           SELECT id FROM production.questionnaires
            WHERE project_id = v_project.id
              AND current_version_id = (p_payload->>'versionId')::uuid
              AND row_version = (p_payload->>'expectedRowVersion')::integer
         );
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      UPDATE production.questionnaires
         SET status = 'SENT', row_version = row_version + 1
       WHERE project_id = v_project.id
       RETURNING id, row_version INTO v_id, v_row;
      INSERT INTO platform.outbox_events (
        id, owner_organization_id, aggregate_resource_id, event_type, schema_version,
        payload, idempotency_key, status, available_at, created_at
      ) VALUES (
        gen_random_uuid(), v_owner, NULL, 'r8.questionnaire.send', 1,
        jsonb_build_object('questionnaireId', v_id, 'delivery', 'QUEUED'),
        p_idempotency_key, 'PENDING', v_now, v_now
      );
      v_result := jsonb_build_object('questionnaireId', v_id, 'status', 'SENT', 'delivery', 'QUEUED', 'rowVersion', v_row);
    ELSIF p_command = 'receive-questionnaire' THEN
      INSERT INTO production.questionnaire_responses (
        id, owner_organization_id, questionnaire_version_id, client_organization_id, body, received_at
      )
      SELECT gen_random_uuid(), v_owner, version.id, v_project.client_organization_id,
             left(btrim(p_payload->>'body'), 8000), v_now
        FROM production.questionnaire_versions AS version
        JOIN production.questionnaires AS questionnaire ON questionnaire.current_version_id = version.id
       WHERE version.id = (p_payload->>'versionId')::uuid
         AND version.sent_at IS NOT NULL
         AND questionnaire.project_id = v_project.id
         AND questionnaire.status = 'SENT'
         AND questionnaire.row_version = (p_payload->>'expectedRowVersion')::integer;
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      UPDATE production.questionnaires
         SET status = 'RECEIVED', row_version = row_version + 1
       WHERE project_id = v_project.id
       RETURNING id, row_version INTO v_id, v_row;
      v_result := jsonb_build_object('questionnaireId', v_id, 'status', 'RECEIVED', 'rowVersion', v_row);
    ELSIF p_command = 'lock-questionnaire' THEN
      UPDATE production.questionnaires
         SET status = 'LOCKED', row_version = row_version + 1
       WHERE project_id = v_project.id
         AND status = 'RECEIVED'
         AND row_version = (p_payload->>'expectedRowVersion')::integer
       RETURNING id, row_version INTO v_id, v_row;
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      v_result := jsonb_build_object('questionnaireId', v_id, 'status', 'LOCKED', 'rowVersion', v_row);
    ELSIF p_command = 'create-draft' THEN
      v_id := gen_random_uuid();
      v_uuid := gen_random_uuid();
      INSERT INTO platform.resources (
        id, resource_type, title, owner_organization_id, client_organization_id, visibility, sensitivity, created_at
      ) VALUES (
        v_id, 'production-editorial-work', v_project.title, v_owner,
        v_project.client_organization_id, 'INTERNAL', 'STANDARD', v_now
      );
      INSERT INTO production.editorial_works (id, resource_id, owner_organization_id, project_id, created_at)
      VALUES (v_id, v_id, v_owner, v_project.id, v_now);
      INSERT INTO production.drafts (id, owner_organization_id, work_id, body, row_version)
      VALUES (v_uuid, v_owner, v_id, '', 1);
      v_result := jsonb_build_object('draftId', v_uuid, 'workId', v_id, 'projectId', v_project.id, 'rowVersion', 1);
    ELSIF p_command = 'edit-draft' THEN
      UPDATE production.drafts AS draft
         SET body = left(p_payload->>'body', 20000), row_version = draft.row_version + 1
        FROM production.editorial_works AS work
       WHERE draft.id = (p_payload->>'draftId')::uuid
         AND draft.work_id = work.id
         AND work.project_id = v_project.id
         AND draft.row_version = (p_payload->>'expectedRowVersion')::integer
       RETURNING draft.row_version INTO v_row;
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE');
      END IF;
      v_result := jsonb_build_object('draftId', p_payload->>'draftId', 'projectId', v_project.id, 'rowVersion', v_row);
    ELSIF p_command = 'issue-draft' THEN
      SELECT draft.body, draft.id INTO v_text, v_id
        FROM production.drafts AS draft
        JOIN production.editorial_works AS work ON work.id = draft.work_id
       WHERE draft.id = (p_payload->>'draftId')::uuid
         AND work.project_id = v_project.id
         AND draft.row_version = (p_payload->>'expectedRowVersion')::integer
       FOR UPDATE OF draft;
      IF v_id IS NULL OR btrim(v_text) = '' THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      SELECT coalesce(max(version_number), 0) + 1 INTO v_number
        FROM production.draft_versions WHERE draft_id = v_id;
      v_uuid := gen_random_uuid();
      INSERT INTO production.draft_versions (
        id, owner_organization_id, draft_id, version_number, body, digest, issued_at
      ) VALUES (
        v_uuid, v_owner, v_id, v_number, v_text,
        encode(platform.digest(convert_to(v_text, 'UTF8'), 'sha256'), 'hex'), v_now
      );
      UPDATE production.drafts SET row_version = row_version + 1 WHERE id = v_id RETURNING row_version INTO v_row;
      v_result := jsonb_build_object('draftId', v_id, 'versionId', v_uuid, 'version', v_number, 'rowVersion', v_row);
    ELSIF p_command = 'open-review' THEN
      INSERT INTO production.editorial_reviews (
        id, owner_organization_id, draft_version_id, reviewer_membership_id, state, row_version, created_at
      )
      SELECT gen_random_uuid(), v_owner, version.id, p_actor_membership_id, 'OPEN', 1, v_now
        FROM production.draft_versions AS version
        JOIN production.drafts AS draft ON draft.id = version.draft_id
        JOIN production.editorial_works AS work ON work.id = draft.work_id
       WHERE version.id = (p_payload->>'versionId')::uuid
         AND work.project_id = v_project.id
         AND version.version_number = (
           SELECT max(latest.version_number) FROM production.draft_versions AS latest WHERE latest.draft_id = draft.id
         )
      RETURNING id INTO v_id;
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      v_result := jsonb_build_object('reviewId', v_id, 'projectId', v_project.id, 'versionId', p_payload->>'versionId', 'state', 'OPEN', 'rowVersion', 1);
    ELSIF p_command = 'add-note' THEN
      INSERT INTO production.editorial_review_notes (
        id, owner_organization_id, review_id, author_membership_id, body, created_at
      )
      SELECT gen_random_uuid(), v_owner, review.id, p_actor_membership_id, left(btrim(p_payload->>'body'), 4000), v_now
        FROM production.editorial_reviews AS review
       WHERE review.id = (p_payload->>'reviewId')::uuid
         AND review.owner_organization_id = v_owner
         AND review.state <> 'RESOLVED';
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      v_result := jsonb_build_object('reviewId', p_payload->>'reviewId', 'projectId', v_project.id);
    ELSIF p_command = 'request-changes' THEN
      UPDATE production.editorial_reviews
         SET state = 'CHANGES_REQUESTED', row_version = row_version + 1
       WHERE id = (p_payload->>'reviewId')::uuid
         AND owner_organization_id = v_owner
         AND state = 'OPEN'
         AND row_version = (p_payload->>'expectedRowVersion')::integer;
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE');
      END IF;
      v_result := jsonb_build_object('reviewId', p_payload->>'reviewId', 'state', 'CHANGES_REQUESTED');
    ELSIF p_command = 'resolve-review' THEN
      UPDATE production.editorial_reviews
         SET state = 'RESOLVED', row_version = row_version + 1
       WHERE id = (p_payload->>'reviewId')::uuid
         AND owner_organization_id = v_owner
         AND state IN ('OPEN', 'CHANGES_REQUESTED')
         AND row_version = (p_payload->>'expectedRowVersion')::integer;
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE');
      END IF;
      v_result := jsonb_build_object('reviewId', p_payload->>'reviewId', 'state', 'RESOLVED');
    ELSIF p_command = 'editorial-approve' THEN
      INSERT INTO production.editorial_approvals (
        id, owner_organization_id, draft_version_id, actor_membership_id, approved_at
      )
      SELECT gen_random_uuid(), v_owner, version.id, p_actor_membership_id, v_now
        FROM production.draft_versions AS version
        JOIN production.drafts AS draft ON draft.id = version.draft_id
        JOIN production.editorial_works AS work ON work.id = draft.work_id
        JOIN production.editorial_reviews AS review ON review.draft_version_id = version.id
       WHERE version.id = (p_payload->>'versionId')::uuid
         AND work.project_id = v_project.id
         AND review.state = 'RESOLVED'
         AND version.version_number = (
           SELECT max(latest.version_number) FROM production.draft_versions AS latest WHERE latest.draft_id = draft.id
         );
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      v_result := jsonb_build_object('versionId', p_payload->>'versionId', 'projectId', v_project.id, 'approved', true);
    ELSIF p_command = 'client-decision' THEN
      INSERT INTO production.client_approvals (
        id, owner_organization_id, draft_version_id, actor_membership_id,
        client_organization_id, decision, decided_at
      )
      SELECT gen_random_uuid(), v_owner, version.id, p_actor_membership_id,
             v_project.client_organization_id, p_payload->>'decision', v_now
        FROM production.draft_versions AS version
        JOIN production.drafts AS draft ON draft.id = version.draft_id
        JOIN production.editorial_works AS work ON work.id = draft.work_id
        JOIN production.editorial_approvals AS approval ON approval.draft_version_id = version.id
       WHERE version.id = (p_payload->>'versionId')::uuid
         AND work.project_id = v_project.id
         AND v_project.state = 'CLIENT_REVIEW'
         AND v_project.client_organization_id = platform.current_client_organization_id()
         AND p_payload->>'decision' IN ('APPROVED', 'REJECTED')
         AND version.version_number = (
           SELECT max(latest.version_number) FROM production.draft_versions AS latest WHERE latest.draft_id = draft.id
         );
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      v_result := jsonb_build_object(
        'versionId', p_payload->>'versionId',
        'decision', p_payload->>'decision',
        'projectId', v_project.id
      );
    ELSIF p_command = 'upload-asset' THEN
      v_id := gen_random_uuid();
      v_uuid := gen_random_uuid();
      INSERT INTO platform.resources (
        id, resource_type, title, owner_organization_id, client_organization_id, visibility, sensitivity, created_at
      ) VALUES (
        v_id, 'production-asset', left(p_payload->>'filename', 200), v_owner,
        v_project.client_organization_id, 'INTERNAL', 'STANDARD', v_now
      );
      INSERT INTO production.assets (
        id, resource_id, owner_organization_id, project_id, visibility, present, row_version, created_at
      ) VALUES (
        v_id, v_id, v_owner, v_project.id, 'INTERNAL', true, 1, v_now
      );
      INSERT INTO production.asset_versions (
        id, owner_organization_id, asset_id, version_number, digest, storage_key, byte_size, created_at
      ) VALUES (
        v_uuid, v_owner, v_id, 1, p_payload->>'digest',
        'production/' || v_owner::text || '/' || v_id::text || '/1',
        (p_payload->>'byteSize')::integer, v_now
      );
      v_result := jsonb_build_object('assetId', v_id, 'versionId', v_uuid, 'present', true, 'rowVersion', 1);
    ELSIF p_command = 'set-rights' THEN
      v_text := p_payload->>'flag';
      v_bool := (p_payload->>'value')::boolean;
      IF v_text NOT IN ('approved', 'licensed', 'cleared') THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
      END IF;
      UPDATE production.assets
         SET approved = CASE WHEN v_text = 'approved' THEN v_bool ELSE approved END,
             licensed = CASE WHEN v_text = 'licensed' THEN v_bool ELSE licensed END,
             cleared = CASE WHEN v_text = 'cleared' THEN v_bool ELSE cleared END,
             row_version = row_version + 1
       WHERE id = (p_payload->>'assetId')::uuid
         AND project_id = v_project.id
         AND row_version = (p_payload->>'expectedRowVersion')::integer;
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE');
      END IF;
      v_result := jsonb_build_object('assetId', p_payload->>'assetId', 'flag', v_text, 'value', v_bool);
    ELSIF p_command = 'set-visibility' THEN
      UPDATE production.assets
         SET visibility = p_payload->>'visibility', row_version = row_version + 1
       WHERE id = (p_payload->>'assetId')::uuid
         AND project_id = v_project.id
         AND p_payload->>'visibility' IN ('INTERNAL', 'CLIENT_VISIBLE')
         AND row_version = (p_payload->>'expectedRowVersion')::integer;
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE');
      END IF;
      v_result := jsonb_build_object('assetId', p_payload->>'assetId', 'visibility', p_payload->>'visibility');
    ELSIF p_command = 'create-task' THEN
      IF p_payload ? 'blockerTaskId' AND NOT EXISTS (
        SELECT 1 FROM production.tasks
         WHERE id = (p_payload->>'blockerTaskId')::uuid AND project_id = v_project.id
      ) THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
      END IF;
      IF p_payload ? 'milestoneId' AND NOT EXISTS (
        SELECT 1 FROM production.milestones
         WHERE id = (p_payload->>'milestoneId')::uuid AND project_id = v_project.id
      ) THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
      END IF;
      v_id := gen_random_uuid();
      INSERT INTO production.tasks (
        id, owner_organization_id, project_id, milestone_id, title, priority, due_date, status, row_version, created_at
      ) VALUES (
        v_id, v_owner, v_project.id, NULLIF(p_payload->>'milestoneId', '')::uuid,
        left(btrim(p_payload->>'title'), 200), COALESCE(p_payload->>'priority', 'NORMAL'),
        NULLIF(p_payload->>'dueDate', '')::date,
        CASE WHEN p_payload ? 'blockerTaskId' THEN 'BLOCKED' ELSE 'OPEN' END,
        1, v_now
      );
      IF p_payload ? 'blockerTaskId' THEN
        INSERT INTO production.task_dependencies (id, owner_organization_id, task_id, blocker_task_id)
        VALUES (gen_random_uuid(), v_owner, v_id, (p_payload->>'blockerTaskId')::uuid);
      END IF;
      v_result := jsonb_build_object('taskId', v_id, 'projectId', v_project.id);
    ELSIF p_command = 'complete-task' THEN
      IF EXISTS (
        SELECT 1
          FROM production.task_dependencies AS dependency
          JOIN production.tasks AS blocker ON blocker.id = dependency.blocker_task_id
         WHERE dependency.task_id = (p_payload->>'taskId')::uuid
           AND blocker.status IN ('OPEN', 'BLOCKED')
      ) THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      UPDATE production.tasks
         SET status = 'COMPLETED', row_version = row_version + 1
       WHERE id = (p_payload->>'taskId')::uuid
         AND project_id = v_project.id
         AND status IN ('OPEN', 'BLOCKED')
         AND row_version = (p_payload->>'expectedRowVersion')::integer;
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE');
      END IF;
      v_result := jsonb_build_object('taskId', p_payload->>'taskId', 'status', 'COMPLETED');
    ELSIF p_command = 'edit-task' THEN
      UPDATE production.tasks
         SET title = left(btrim(p_payload->>'title'), 200),
             priority = p_payload->>'priority',
             due_date = NULLIF(p_payload->>'dueDate', '')::date,
             row_version = row_version + 1
       WHERE id = (p_payload->>'taskId')::uuid
         AND project_id = v_project.id
         AND status NOT IN ('COMPLETED', 'CANCELLED')
         AND p_payload->>'priority' IN ('LOW', 'NORMAL', 'HIGH')
         AND row_version = (p_payload->>'expectedRowVersion')::integer;
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE');
      END IF;
      v_result := jsonb_build_object('taskId', p_payload->>'taskId', 'projectId', v_project.id);
    ELSIF p_command = 'assign-task' THEN
      IF NOT EXISTS (
        SELECT 1 FROM production.project_members
         WHERE project_id = v_project.id
           AND membership_id = (p_payload->>'membershipId')::uuid
           AND ended_at IS NULL
      ) THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
      END IF;
      UPDATE production.tasks
         SET assignee_membership_id = (p_payload->>'membershipId')::uuid,
             row_version = row_version + 1
       WHERE id = (p_payload->>'taskId')::uuid
         AND project_id = v_project.id
         AND row_version = (p_payload->>'expectedRowVersion')::integer;
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE');
      END IF;
      v_result := jsonb_build_object('taskId', p_payload->>'taskId');
    ELSIF p_command = 'create-milestone' THEN
      v_id := gen_random_uuid();
      INSERT INTO production.milestones (id, owner_organization_id, project_id, kind, row_version)
      VALUES (v_id, v_owner, v_project.id, p_payload->>'kind', 1);
      v_result := jsonb_build_object('milestoneId', v_id, 'kind', p_payload->>'kind');
    ELSIF p_command = 'complete-milestone' THEN
      IF EXISTS (
        SELECT 1 FROM production.tasks
         WHERE milestone_id = (p_payload->>'milestoneId')::uuid
           AND project_id = v_project.id
           AND status IN ('OPEN', 'BLOCKED')
      ) THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      UPDATE production.milestones
         SET completed_at = v_now, row_version = row_version + 1
       WHERE id = (p_payload->>'milestoneId')::uuid
         AND project_id = v_project.id
         AND completed_at IS NULL
         AND row_version = (p_payload->>'expectedRowVersion')::integer;
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE');
      END IF;
      v_result := jsonb_build_object('milestoneId', p_payload->>'milestoneId', 'completed', true);
    ELSIF p_command = 'create-deliverable' THEN
      IF p_payload->>'targetType' = 'draft-version' AND NOT EXISTS (
        SELECT 1
          FROM production.draft_versions AS version
          JOIN production.drafts AS draft ON draft.id = version.draft_id
          JOIN production.editorial_works AS work ON work.id = draft.work_id
         WHERE version.id = (p_payload->>'targetId')::uuid
           AND work.project_id = v_project.id
      ) THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
      ELSIF p_payload->>'targetType' = 'asset' AND NOT EXISTS (
        SELECT 1 FROM production.assets
         WHERE id = (p_payload->>'targetId')::uuid AND project_id = v_project.id
      ) THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
      ELSIF p_payload->>'targetType' NOT IN ('draft-version', 'asset') THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
      END IF;
      v_id := gen_random_uuid();
      INSERT INTO production.deliverables (
        id, owner_organization_id, project_id, kind, target_type, target_id, row_version
      ) VALUES (
        v_id, v_owner, v_project.id, p_payload->>'kind', p_payload->>'targetType',
        (p_payload->>'targetId')::uuid, 1
      );
      v_result := jsonb_build_object('deliverableId', v_id, 'kind', p_payload->>'kind');
    ELSIF p_command = 'complete-deliverable' THEN
      UPDATE production.deliverables
         SET completed_at = v_now, row_version = row_version + 1
       WHERE id = (p_payload->>'deliverableId')::uuid
         AND project_id = v_project.id
         AND completed_at IS NULL
         AND row_version = (p_payload->>'expectedRowVersion')::integer;
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE');
      END IF;
      v_result := jsonb_build_object('deliverableId', p_payload->>'deliverableId', 'completed', true);
    ELSIF p_command = 'add-citation' THEN
      v_id := gen_random_uuid();
      INSERT INTO production.citations (id, owner_organization_id, draft_version_id, source_label, locator, created_at)
      SELECT v_id, v_owner, version.id, left(p_payload->>'sourceLabel', 300), left(p_payload->>'locator', 300), v_now
        FROM production.draft_versions AS version
        JOIN production.drafts AS draft ON draft.id = version.draft_id
        JOIN production.editorial_works AS work ON work.id = draft.work_id
       WHERE version.id = (p_payload->>'versionId')::uuid AND work.project_id = v_project.id;
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
      END IF;
      v_result := jsonb_build_object('citationId', v_id, 'versionId', p_payload->>'versionId');
    ELSIF p_command = 'record-fact-check' THEN
      v_id := gen_random_uuid();
      INSERT INTO production.fact_checks (
        id, owner_organization_id, draft_version_id, status, reviewer_membership_id, note, recorded_at
      )
      SELECT v_id, v_owner, version.id, p_payload->>'status', p_actor_membership_id,
             left(COALESCE(p_payload->>'note', ''), 2000), v_now
        FROM production.draft_versions AS version
        JOIN production.drafts AS draft ON draft.id = version.draft_id
        JOIN production.editorial_works AS work ON work.id = draft.work_id
       WHERE version.id = (p_payload->>'versionId')::uuid
         AND work.project_id = v_project.id
         AND p_payload->>'status' IN ('UNVERIFIED', 'VERIFIED', 'DISPUTED');
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      v_result := jsonb_build_object('factCheckId', v_id, 'status', p_payload->>'status');
    ELSIF p_command = 'add-credit' THEN
      v_id := gen_random_uuid();
      INSERT INTO production.credits (id, owner_organization_id, project_id, person_id, credit_role, created_at)
      SELECT v_id, v_owner, v_project.id, person.id, p_payload->>'creditRole', v_now
        FROM iam.people AS person
       WHERE person.id = (p_payload->>'personId')::uuid
         AND p_payload->>'creditRole' IN ('AUTHOR', 'EDITOR', 'PHOTOGRAPHER', 'DESIGNER', 'CONTRIBUTOR');
      IF NOT FOUND THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
      END IF;
      v_result := jsonb_build_object('creditId', v_id, 'projectId', v_project.id);
    ELSE
      RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
    END IF;
  END IF;

  INSERT INTO platform.idempotency_receipts (
    id, owner_organization_id, scope, idempotency_key, request_hash,
    state, response_status, response_hash, created_at, completed_at, expires_at
  ) VALUES (
    p_receipt_id, v_owner, 'production.' || p_command, p_idempotency_key, p_request_hash,
    'COMPLETED', 200, p_request_hash, v_now, v_now, v_now + interval '1 day'
  );
  INSERT INTO audit.audit_events (
    id, owner_organization_id, actor_type, actor_membership_id, action, request_id,
    correlation_id, after_hash, redacted_diff, idempotency_key, occurred_at
  ) VALUES (
    p_audit_id, v_owner, 'USER', p_actor_membership_id, 'r8.' || p_command,
    left(p_request_id, 200), p_idempotency_key, p_request_hash, v_result, p_idempotency_key, v_now
  );
  RETURN jsonb_build_object('kind', 'ok', 'code', 'CREATED') || v_result;
EXCEPTION
  WHEN check_violation OR unique_violation OR not_null_violation THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
END
$$;

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'projects','project_members','project_transitions','milestones','deliverables',
    'questionnaires','questionnaire_versions','questionnaire_responses','editorial_works',
    'drafts','draft_versions','editorial_reviews','editorial_review_notes','editorial_approvals',
    'client_approvals','assets','asset_versions','citations','fact_checks','credits','tasks','task_dependencies'
  ]
  LOOP
    EXECUTE format('ALTER TABLE production.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('ALTER TABLE production.%I FORCE ROW LEVEL SECURITY', table_name);
    EXECUTE format(
      'CREATE POLICY r8_tenant ON production.%I USING (owner_organization_id = platform.current_organization_id()) WITH CHECK (owner_organization_id = platform.current_organization_id())',
      table_name
    );
    EXECUTE format('REVOKE ALL ON production.%I FROM PUBLIC, perspective_runtime', table_name);
    EXECUTE format('GRANT SELECT ON production.%I TO perspective_runtime', table_name);
  END LOOP;
END
$$;

GRANT USAGE ON SCHEMA production TO perspective_runtime;
GRANT EXECUTE ON FUNCTION production.r8_execute(text, uuid, jsonb, uuid, uuid, text, text, text) TO perspective_runtime;
GRANT EXECUTE ON FUNCTION production.r8_resolve_client_version(uuid) TO perspective_runtime;
GRANT EXECUTE ON FUNCTION production.r8_next_state(uuid, uuid) TO perspective_runtime;
REVOKE ALL ON FUNCTION production.r8_execute(text, uuid, jsonb, uuid, uuid, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION production.r8_resolve_client_version(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION production.r8_next_state(uuid, uuid) FROM PUBLIC;
