-- V1.1 PN-03: private platform-editor submission, independent review, publication and audit.
-- No automatic CRM import, no public submission endpoint and no production seed.
GRANT USAGE ON SCHEMA profiles TO perspective_runtime;

CREATE TABLE profiles.profile_submissions (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  kind text NOT NULL,
  slug text NOT NULL,
  payload jsonb NOT NULL,
  state text NOT NULL DEFAULT 'SUBMITTED',
  submitted_by_membership_id uuid NOT NULL,
  reviewed_by_membership_id uuid,
  review_reason text,
  approved_version_id uuid,
  submitted_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at timestamptz(6),
  CONSTRAINT profile_submission_kind_check CHECK (kind IN ('COMPANY','PROFESSIONAL','EDITOR')),
  CONSTRAINT profile_submission_state_check CHECK (state IN ('SUBMITTED','APPROVED','REJECTED')),
  CONSTRAINT profile_submission_slug_check CHECK (char_length(slug) BETWEEN 2 AND 100 AND slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT profile_submission_payload_check CHECK (jsonb_typeof(payload) = 'object' AND pg_column_size(payload) < 14000),
  CONSTRAINT profile_submission_approval_check CHECK (
    (state = 'SUBMITTED' AND reviewed_at IS NULL AND approved_version_id IS NULL)
    OR (state = 'REJECTED' AND reviewed_at IS NOT NULL AND approved_version_id IS NULL)
    OR (state = 'APPROVED' AND reviewed_at IS NOT NULL AND approved_version_id IS NOT NULL)
  )
);
CREATE INDEX profile_submissions_owner_organization_id_state_submitted_at_idx
  ON profiles.profile_submissions(owner_organization_id, state, submitted_at DESC);

CREATE TABLE profiles.profile_audit_events (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  profile_submission_id uuid,
  actor_membership_id uuid NOT NULL,
  action text NOT NULL,
  reason text NOT NULL,
  idempotency_key text NOT NULL,
  request_hash text NOT NULL,
  result jsonb NOT NULL,
  occurred_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT profile_audit_submission_fkey FOREIGN KEY(profile_submission_id)
    REFERENCES profiles.profile_submissions(id) ON DELETE RESTRICT,
  CONSTRAINT profile_audit_key UNIQUE (owner_organization_id,actor_membership_id,idempotency_key),
  CONSTRAINT profile_audit_request_hash_check CHECK (request_hash ~ '^[0-9a-f]{32}$')
);
CREATE INDEX profile_audit_events_owner_org_submission_idx
  ON profiles.profile_audit_events(owner_organization_id,profile_submission_id,occurred_at DESC);

ALTER TABLE profiles.profile_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles.profile_submissions FORCE ROW LEVEL SECURITY;
ALTER TABLE profiles.profile_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles.profile_audit_events FORCE ROW LEVEL SECURITY;

CREATE POLICY pn03_submission_owner ON profiles.profile_submissions
  USING (owner_organization_id = platform.current_organization_id())
  WITH CHECK (owner_organization_id = platform.current_organization_id());
CREATE POLICY pn03_audit_owner ON profiles.profile_audit_events
  USING (owner_organization_id = platform.current_organization_id())
  WITH CHECK (owner_organization_id = platform.current_organization_id());
CREATE TRIGGER pn03_audit_immutable
  BEFORE UPDATE OR DELETE ON profiles.profile_audit_events
  FOR EACH ROW EXECUTE FUNCTION profiles.pn01_immutable_version();

-- All command entrypoints verify that the selected tenant is the platform itself
-- and the actor is its active STAFF member; a CLIENT/PARTNER team cannot publish.
CREATE FUNCTION profiles.pn03_platform_owner(p_actor uuid) RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, profiles, iam, platform
AS $owner$
  SELECT org.id
  FROM iam.organizations AS org
  JOIN iam.organization_memberships AS member
    ON member.organization_id = org.id
  WHERE org.id = platform.current_organization_id()
    AND org.organization_type = 'PLATFORM'
    AND org.status = 'ACTIVE'
    AND member.id = p_actor
    AND member.membership_type = 'STAFF'
    AND member.status = 'ACTIVE'
    AND member.ended_at IS NULL
  LIMIT 1
$owner$;

CREATE FUNCTION profiles.pn03_validate_payload(p_payload jsonb) RETURNS boolean
LANGUAGE sql IMMUTABLE
SET search_path = pg_catalog
AS $validate$
  SELECT p_payload IS NOT NULL
    AND jsonb_typeof(p_payload) = 'object'
    AND char_length(coalesce(p_payload->>'name','')) BETWEEN 2 AND 180
    AND char_length(coalesce(p_payload->>'summary','')) BETWEEN 12 AND 800
    AND coalesce(p_payload->>'disclosureKind','NONE') IN ('NONE','SPONSORED','COMMISSIONED')
    AND (
      coalesce(p_payload->>'disclosureKind','NONE') = 'NONE'
      OR char_length(coalesce(p_payload->>'disclosureText','')) BETWEEN 10 AND 1000
    )
    AND (p_payload->>'websiteUrl' IS NULL OR p_payload->>'websiteUrl' ~ '^https://[^[:space:]@/]+')
    AND jsonb_typeof(p_payload->'sources') = 'array'
    AND jsonb_typeof(coalesce(p_payload->'coverage','[]'::jsonb)) = 'array'
    AND pg_column_size(p_payload) < 14000
$validate$;

CREATE FUNCTION profiles.pn03_sources_valid(p_sources jsonb) RETURNS boolean
LANGUAGE sql IMMUTABLE
SET search_path = pg_catalog
AS $sources$
  SELECT jsonb_typeof(p_sources) = 'array'
    AND jsonb_array_length(p_sources) BETWEEN 1 AND 40
    AND NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(p_sources) AS src(item)
      WHERE jsonb_typeof(src.item) <> 'object'
        OR char_length(coalesce(src.item->>'label','')) NOT BETWEEN 2 AND 180
        OR coalesce(src.item->>'url','') !~ '^https://[^[:space:]@/]+'
        OR coalesce(src.item->>'capturedAt','') !~ '^\\d{4}-\\d{2}-\\d{2}T'
    )
$sources$;

CREATE FUNCTION profiles.pn03_replay(p_owner uuid, p_actor uuid, p_key text, p_hash text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, profiles
AS $replay$
DECLARE v_previous profiles.profile_audit_events%ROWTYPE;
BEGIN
  SELECT * INTO v_previous FROM profiles.profile_audit_events
   WHERE owner_organization_id=p_owner AND actor_membership_id=p_actor AND idempotency_key=p_key;
  IF NOT FOUND THEN RETURN NULL; END IF;
  IF v_previous.request_hash <> p_hash THEN
    RETURN jsonb_build_object('kind','error','code','IDEMPOTENCY_CONFLICT');
  END IF;
  RETURN v_previous.result || jsonb_build_object('replayed',true);
END
$replay$;

CREATE FUNCTION profiles.pn03_submit(
  p_actor uuid, p_kind text, p_slug text, p_payload jsonb, p_key text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, profiles, iam, platform
AS $submit$
DECLARE
  v_owner uuid;
  v_id uuid;
  v_hash text;
  v_replay jsonb;
  v_result jsonb;
BEGIN
  v_owner := profiles.pn03_platform_owner(p_actor);
  IF v_owner IS NULL THEN RETURN jsonb_build_object('kind','error','code','TEAM_REQUIRED'); END IF;
  IF p_key !~ '^[A-Za-z0-9._:-]{8,128}$'
    OR p_kind NOT IN ('COMPANY','PROFESSIONAL','EDITOR')
    OR p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    OR char_length(p_slug) NOT BETWEEN 2 AND 100
    OR NOT profiles.pn03_validate_payload(p_payload)
  THEN RETURN jsonb_build_object('kind','error','code','INVALID'); END IF;
  v_hash := md5(p_kind || ':' || p_slug || ':' || p_payload::text);
  v_replay := profiles.pn03_replay(v_owner,p_actor,p_key,v_hash);
  IF v_replay IS NOT NULL THEN RETURN v_replay; END IF;
  v_id := gen_random_uuid();
  INSERT INTO profiles.profile_submissions(
    id,owner_organization_id,kind,slug,payload,state,submitted_by_membership_id
  ) VALUES (v_id,v_owner,p_kind,p_slug,p_payload,'SUBMITTED',p_actor);
  v_result := jsonb_build_object('kind','ok','submissionId',v_id,'state','SUBMITTED','replayed',false);
  INSERT INTO profiles.profile_audit_events(
    id,owner_organization_id,profile_submission_id,actor_membership_id,action,reason,
    idempotency_key,request_hash,result
  ) VALUES(gen_random_uuid(),v_owner,v_id,p_actor,'SUBMIT','Submitted for independent editorial review',p_key,v_hash,v_result);
  RETURN v_result;
END
$submit$;

CREATE FUNCTION profiles.pn03_review(
  p_actor uuid, p_submission uuid, p_decision text, p_reason text, p_key text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, profiles, iam, platform
AS $review$
DECLARE
  v_owner uuid;
  v_submission profiles.profile_submissions%ROWTYPE;
  v_company uuid;
  v_person uuid;
  v_kind text;
  v_version_id uuid;
  v_version integer;
  v_hash text;
  v_replay jsonb;
  v_result jsonb;
BEGIN
  v_owner := profiles.pn03_platform_owner(p_actor);
  IF v_owner IS NULL THEN RETURN jsonb_build_object('kind','error','code','TEAM_REQUIRED'); END IF;
  IF p_key !~ '^[A-Za-z0-9._:-]{8,128}$'
    OR p_decision NOT IN ('APPROVE','REJECT')
    OR char_length(coalesce(p_reason,'')) NOT BETWEEN 8 AND 400
  THEN RETURN jsonb_build_object('kind','error','code','INVALID'); END IF;
  v_hash := md5(p_submission::text || ':' || p_decision || ':' || p_reason);
  v_replay := profiles.pn03_replay(v_owner,p_actor,p_key,v_hash);
  IF v_replay IS NOT NULL THEN RETURN v_replay; END IF;
  SELECT * INTO v_submission FROM profiles.profile_submissions
    WHERE id=p_submission AND owner_organization_id=v_owner FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('kind','error','code','NOT_FOUND'); END IF;
  IF v_submission.submitted_by_membership_id = p_actor THEN
    RETURN jsonb_build_object('kind','error','code','SEPARATION_REQUIRED');
  END IF;
  IF v_submission.state <> 'SUBMITTED' THEN
    RETURN jsonb_build_object('kind','error','code','CONFLICT');
  END IF;
  IF p_decision='APPROVE' THEN
    IF NOT profiles.pn03_sources_valid(v_submission.payload->'sources') THEN
      RETURN jsonb_build_object('kind','error','code','INELIGIBLE');
    END IF;
    v_version_id := gen_random_uuid();
    IF v_submission.kind='COMPANY' THEN
      SELECT id INTO v_company FROM profiles.company_profiles WHERE slug=v_submission.slug FOR UPDATE;
      IF v_company IS NULL THEN
        v_company := gen_random_uuid();
        INSERT INTO profiles.company_profiles(id,slug) VALUES(v_company,v_submission.slug);
      END IF;
      SELECT COALESCE(MAX(version),0)+1 INTO v_version
        FROM profiles.company_versions WHERE company_profile_id=v_company;
      INSERT INTO profiles.company_versions(
        id,company_profile_id,version,name,summary,industry,headquarters,website_url,
        overview,disclosure_kind,disclosure_text,sources,approved_at
      ) VALUES(
        v_version_id,v_company,v_version,
        v_submission.payload->>'name',
        v_submission.payload->>'summary',
        v_submission.payload->>'industry',
        v_submission.payload->>'headquarters',
        v_submission.payload->>'websiteUrl',
        v_submission.payload->>'overview',
        coalesce(v_submission.payload->>'disclosureKind','NONE'),
        v_submission.payload->>'disclosureText',
        v_submission.payload->'sources',clock_timestamp()
      );
    ELSE
      SELECT id,kind INTO v_person,v_kind FROM profiles.person_profiles WHERE slug=v_submission.slug FOR UPDATE;
      IF v_person IS NULL THEN
        v_person := gen_random_uuid();
        INSERT INTO profiles.person_profiles(id,slug,kind) VALUES(v_person,v_submission.slug,v_submission.kind);
      ELSIF v_kind <> v_submission.kind THEN
        RETURN jsonb_build_object('kind','error','code','CONFLICT');
      END IF;
      SELECT COALESCE(MAX(version),0)+1 INTO v_version
        FROM profiles.person_versions WHERE person_profile_id=v_person;
      INSERT INTO profiles.person_versions(
        id,person_profile_id,version,name,headline,summary,biography,organization_name,
        website_url,disclosure_kind,disclosure_text,sources,coverage,approved_at
      ) VALUES(
        v_version_id,v_person,v_version,
        v_submission.payload->>'name',
        v_submission.payload->>'headline',
        v_submission.payload->>'summary',
        v_submission.payload->>'biography',
        v_submission.payload->>'organizationName',
        v_submission.payload->>'websiteUrl',
        coalesce(v_submission.payload->>'disclosureKind','NONE'),
        v_submission.payload->>'disclosureText',
        v_submission.payload->'sources',
        coalesce(v_submission.payload->'coverage','[]'::jsonb),
        clock_timestamp()
      );
    END IF;
  END IF;
  UPDATE profiles.profile_submissions
    SET state = CASE WHEN p_decision='APPROVE' THEN 'APPROVED' ELSE 'REJECTED' END,
        approved_version_id=v_version_id,
        reviewed_by_membership_id=p_actor,review_reason=p_reason,reviewed_at=clock_timestamp()
    WHERE id=p_submission;
  v_result := jsonb_build_object(
    'kind','ok','submissionId',p_submission,'state',
    CASE WHEN p_decision='APPROVE' THEN 'APPROVED' ELSE 'REJECTED' END,
    'approvedVersionId',v_version_id,'replayed',false
  );
  INSERT INTO profiles.profile_audit_events(
    id,owner_organization_id,profile_submission_id,actor_membership_id,action,reason,idempotency_key,request_hash,result
  ) VALUES(gen_random_uuid(),v_owner,p_submission,p_actor,p_decision,p_reason,p_key,v_hash,v_result);
  RETURN v_result;
END
$review$;

CREATE FUNCTION profiles.pn03_publish(
  p_actor uuid, p_submission uuid, p_action text, p_reason text, p_key text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, profiles, iam, platform
AS $publish$
DECLARE
  v_owner uuid;
  v_submission profiles.profile_submissions%ROWTYPE;
  v_hash text;
  v_replay jsonb;
  v_result jsonb;
  v_affected integer;
BEGIN
  v_owner := profiles.pn03_platform_owner(p_actor);
  IF v_owner IS NULL THEN RETURN jsonb_build_object('kind','error','code','TEAM_REQUIRED'); END IF;
  IF p_key !~ '^[A-Za-z0-9._:-]{8,128}$'
    OR p_action NOT IN ('PUBLISH','WITHDRAW')
    OR char_length(coalesce(p_reason,'')) NOT BETWEEN 8 AND 400
  THEN RETURN jsonb_build_object('kind','error','code','INVALID'); END IF;
  v_hash := md5(p_submission::text || ':' || p_action || ':' || p_reason);
  v_replay := profiles.pn03_replay(v_owner,p_actor,p_key,v_hash);
  IF v_replay IS NOT NULL THEN RETURN v_replay; END IF;
  SELECT * INTO v_submission FROM profiles.profile_submissions
    WHERE id=p_submission AND owner_organization_id=v_owner FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('kind','error','code','NOT_FOUND'); END IF;
  IF v_submission.submitted_by_membership_id=p_actor THEN
    RETURN jsonb_build_object('kind','error','code','SEPARATION_REQUIRED');
  END IF;
  IF v_submission.state <> 'APPROVED' OR v_submission.approved_version_id IS NULL THEN
    RETURN jsonb_build_object('kind','error','code','INELIGIBLE');
  END IF;
  IF v_submission.kind='COMPANY' THEN
    UPDATE profiles.company_profiles SET
      state=CASE WHEN p_action='PUBLISH' THEN 'PUBLISHED' ELSE 'WITHDRAWN' END,
      published_version_id=CASE WHEN p_action='PUBLISH' THEN v_submission.approved_version_id ELSE published_version_id END,
      updated_at=clock_timestamp()
    WHERE slug=v_submission.slug
      AND EXISTS (SELECT 1 FROM profiles.company_versions v
        WHERE v.id=v_submission.approved_version_id AND v.company_profile_id=company_profiles.id);
  ELSE
    UPDATE profiles.person_profiles SET
      state=CASE WHEN p_action='PUBLISH' THEN 'PUBLISHED' ELSE 'WITHDRAWN' END,
      published_version_id=CASE WHEN p_action='PUBLISH' THEN v_submission.approved_version_id ELSE published_version_id END,
      updated_at=clock_timestamp()
    WHERE slug=v_submission.slug AND kind=v_submission.kind
      AND EXISTS (SELECT 1 FROM profiles.person_versions v
        WHERE v.id=v_submission.approved_version_id AND v.person_profile_id=person_profiles.id);
  END IF;
  GET DIAGNOSTICS v_affected = ROW_COUNT;
  IF v_affected <> 1 THEN RETURN jsonb_build_object('kind','error','code','INELIGIBLE'); END IF;
  v_result := jsonb_build_object('kind','ok','submissionId',p_submission,
    'state',CASE WHEN p_action='PUBLISH' THEN 'PUBLISHED' ELSE 'WITHDRAWN' END,'replayed',false);
  INSERT INTO profiles.profile_audit_events(
    id,owner_organization_id,profile_submission_id,actor_membership_id,action,reason,idempotency_key,request_hash,result
  ) VALUES(gen_random_uuid(),v_owner,p_submission,p_actor,p_action,p_reason,p_key,v_hash,v_result);
  RETURN v_result;
END
$publish$;

CREATE FUNCTION profiles.pn03_team_queue(p_actor uuid) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, profiles, iam, platform
AS $queue$
DECLARE v_owner uuid; v_results jsonb;
BEGIN
  v_owner := profiles.pn03_platform_owner(p_actor);
  IF v_owner IS NULL THEN RETURN NULL; END IF;
  SELECT coalesce(jsonb_agg(item.record ORDER BY item.submitted_at DESC), '[]'::jsonb) INTO v_results
  FROM (
    SELECT s.submitted_at, jsonb_build_object(
      'submissionId',s.id,'kind',s.kind,'slug',s.slug,'payload',s.payload,
      'state',s.state,'submittedByMembershipId',s.submitted_by_membership_id,
      'reviewedByMembershipId',s.reviewed_by_membership_id,
      'reviewReason',s.review_reason,'approvedVersionId',s.approved_version_id,
      'submittedAt',s.submitted_at,'reviewedAt',s.reviewed_at
    ) AS record
    FROM profiles.profile_submissions AS s
    WHERE s.owner_organization_id=v_owner
    ORDER BY s.submitted_at DESC
    LIMIT 100
  ) AS item;
  RETURN v_results;
END
$queue$;

REVOKE ALL ON ALL TABLES IN SCHEMA profiles FROM PUBLIC,perspective_public,perspective_runtime;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA profiles FROM PUBLIC,perspective_runtime,perspective_public;
GRANT EXECUTE ON FUNCTION
  profiles.pn01_public_company(text),profiles.pn01_public_directory(text),
  profiles.pn02_public_person(text,text),profiles.pn02_public_person_directory(text,text),
  profiles.pn02_public_relationships(text,text)
  TO perspective_public;
GRANT EXECUTE ON FUNCTION
  profiles.pn03_submit(uuid,text,text,jsonb,text),
  profiles.pn03_review(uuid,uuid,text,text,text),
  profiles.pn03_publish(uuid,uuid,text,text,text),
  profiles.pn03_team_queue(uuid)
  TO perspective_runtime;
