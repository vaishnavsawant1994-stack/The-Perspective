-- V1.1 PN-04: privacy-bounded corrections/removals/identity-claim intake.
-- A request never changes profile content, identity verification, or publication authority.
CREATE TABLE profiles.profile_requests (
  id uuid PRIMARY KEY,
  request_kind text NOT NULL,
  subject_kind text NOT NULL,
  subject_slug text NOT NULL,
  description text NOT NULL,
  source_url text,
  contact_email text,
  rate_key text NOT NULL,
  state text NOT NULL DEFAULT 'PENDING',
  reviewed_by_membership_id uuid,
  decision_note text,
  submitted_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at timestamptz(6),
  expires_at timestamptz(6) NOT NULL,
  CONSTRAINT profile_request_kind_check CHECK (request_kind IN ('CORRECTION','REMOVAL','CLAIM')),
  CONSTRAINT profile_request_subject_kind_check CHECK (subject_kind IN ('COMPANY','PROFESSIONAL','EDITOR')),
  CONSTRAINT profile_request_slug_check CHECK (char_length(subject_slug) BETWEEN 2 AND 100 AND subject_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT profile_request_description_check CHECK (char_length(description) BETWEEN 30 AND 2000),
  CONSTRAINT profile_request_url_check CHECK (source_url IS NULL OR source_url ~ '^https://[^[:space:]@/]+'),
  CONSTRAINT profile_request_email_check CHECK (contact_email IS NULL OR
    (char_length(contact_email) BETWEEN 5 AND 254 AND contact_email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$')),
  CONSTRAINT profile_request_claim_email_check CHECK (request_kind <> 'CLAIM' OR contact_email IS NOT NULL),
  CONSTRAINT profile_request_rate_key_check CHECK (rate_key ~ '^[0-9a-f]{64}$'),
  CONSTRAINT profile_request_state_check CHECK (state IN ('PENDING','NEEDS_EVIDENCE','CLOSED','DECLINED')),
  CONSTRAINT profile_request_review_shape_check CHECK (
    (state='PENDING' AND reviewed_at IS NULL) OR
    (state<>'PENDING' AND reviewed_at IS NOT NULL AND char_length(coalesce(decision_note,'')) BETWEEN 8 AND 400)
  )
);
CREATE INDEX profile_requests_state_submitted_at_idx ON profiles.profile_requests(state,submitted_at DESC);
CREATE INDEX profile_requests_rate_key_submitted_at_idx ON profiles.profile_requests(rate_key,submitted_at DESC);

CREATE FUNCTION profiles.pn04_public_submit(
  p_kind text,p_subject_kind text,p_slug text,p_description text,
  p_source_url text,p_email text,p_rate_key text,p_honeypot text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, profiles
AS $request$
DECLARE v_id uuid;
BEGIN
  -- Return an opaque acknowledgment for invalid/private/abusive requests.
  IF p_honeypot IS DISTINCT FROM '' OR p_rate_key !~ '^[0-9a-f]{64}$'
    OR p_kind NOT IN ('CORRECTION','REMOVAL','CLAIM')
    OR p_subject_kind NOT IN ('COMPANY','PROFESSIONAL','EDITOR')
    OR p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    OR char_length(p_slug) NOT BETWEEN 2 AND 100
    OR char_length(coalesce(p_description,'')) NOT BETWEEN 30 AND 2000
    OR (p_source_url IS NOT NULL AND p_source_url !~ '^https://[^[:space:]@/]+')
    OR (p_email IS NOT NULL AND
      (char_length(p_email) NOT BETWEEN 5 AND 254 OR p_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'))
    OR (p_kind='CLAIM' AND p_email IS NULL)
  THEN RETURN NULL; END IF;
  IF p_subject_kind='COMPANY' THEN
    IF profiles.pn01_public_company(p_slug) IS NULL THEN RETURN NULL; END IF;
  ELSE
    IF profiles.pn02_public_person(p_subject_kind,p_slug) IS NULL THEN RETURN NULL; END IF;
  END IF;
  IF (SELECT count(*) FROM profiles.profile_requests
    WHERE rate_key=p_rate_key AND submitted_at > clock_timestamp()-interval '1 day') >= 3
  THEN RETURN NULL; END IF;
  v_id := gen_random_uuid();
  INSERT INTO profiles.profile_requests(
    id,request_kind,subject_kind,subject_slug,description,source_url,contact_email,
    rate_key,expires_at
  ) VALUES(
    v_id,p_kind,p_subject_kind,p_slug,p_description,p_source_url,p_email,
    p_rate_key,clock_timestamp()+interval '90 days'
  );
  RETURN v_id;
END
$request$;

CREATE FUNCTION profiles.pn04_team_queue(p_actor uuid) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, profiles
AS $team$
DECLARE v_owner uuid; v_result jsonb;
BEGIN
  v_owner:=profiles.pn03_platform_owner(p_actor);
  IF v_owner IS NULL THEN RETURN NULL; END IF;
  SELECT COALESCE(jsonb_agg(item.row ORDER BY item.submitted_at DESC),'[]'::jsonb)
  INTO v_result FROM (
    SELECT r.submitted_at, jsonb_build_object(
      'id',r.id,'kind',r.request_kind,'subjectKind',r.subject_kind,
      'subjectSlug',r.subject_slug,'description',r.description,
      'sourceUrl',r.source_url,'contactEmail',r.contact_email,
      'state',r.state,'submittedAt',r.submitted_at,'expiresAt',r.expires_at,
      'reviewedAt',r.reviewed_at,'decisionNote',r.decision_note
    ) AS row
    FROM profiles.profile_requests r
    WHERE r.expires_at>clock_timestamp()
    ORDER BY r.submitted_at DESC LIMIT 100
  ) item;
  RETURN v_result;
END
$team$;

CREATE FUNCTION profiles.pn04_decide(
  p_actor uuid,p_request uuid,p_decision text,p_reason text,p_key text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, profiles
AS $decide$
DECLARE
  v_owner uuid;
  v_request profiles.profile_requests%ROWTYPE;
  v_hash text;
  v_replay jsonb;
  v_result jsonb;
BEGIN
  v_owner := profiles.pn03_platform_owner(p_actor);
  IF v_owner IS NULL THEN RETURN jsonb_build_object('kind','error','code','TEAM_REQUIRED'); END IF;
  IF p_key !~ '^[A-Za-z0-9._:-]{8,128}$'
    OR p_decision NOT IN ('NEEDS_EVIDENCE','CLOSED','DECLINED')
    OR char_length(coalesce(p_reason,'')) NOT BETWEEN 8 AND 400
  THEN RETURN jsonb_build_object('kind','error','code','INVALID'); END IF;
  v_hash := md5(p_request::text || ':' || p_decision || ':' || p_reason);
  v_replay := profiles.pn03_replay(v_owner,p_actor,p_key,v_hash);
  IF v_replay IS NOT NULL THEN RETURN v_replay; END IF;
  SELECT * INTO v_request FROM profiles.profile_requests
    WHERE id=p_request AND expires_at>clock_timestamp() FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('kind','error','code','NOT_FOUND'); END IF;
  IF v_request.state IN ('CLOSED','DECLINED') THEN
    RETURN jsonb_build_object('kind','error','code','CONFLICT');
  END IF;
  UPDATE profiles.profile_requests
    SET state=p_decision,decision_note=p_reason,
      reviewed_by_membership_id=p_actor,reviewed_at=clock_timestamp()
    WHERE id=p_request;
  v_result:=jsonb_build_object('kind','ok','requestId',p_request,'state',p_decision,'replayed',false);
  INSERT INTO profiles.profile_audit_events(
    id,owner_organization_id,profile_submission_id,actor_membership_id,action,reason,
    idempotency_key,request_hash,result
  ) VALUES(gen_random_uuid(),v_owner,NULL,p_actor,'REQUEST_' || p_decision,p_reason,p_key,v_hash,v_result);
  RETURN v_result;
END
$decide$;

-- Only platform staff may explicitly purge expired requests, not anonymous users.
CREATE FUNCTION profiles.pn04_purge_expired(p_actor uuid) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, profiles
AS $purge$
DECLARE v_owner uuid; v_deleted integer;
BEGIN
  v_owner := profiles.pn03_platform_owner(p_actor);
  IF v_owner IS NULL THEN RAISE EXCEPTION 'platform authority required' USING ERRCODE='42501'; END IF;
  DELETE FROM profiles.profile_requests WHERE expires_at <= clock_timestamp();
  GET DIAGNOSTICS v_deleted=ROW_COUNT;
  RETURN v_deleted;
END
$purge$;

REVOKE ALL ON ALL TABLES IN SCHEMA profiles FROM PUBLIC,perspective_public,perspective_runtime;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA profiles FROM PUBLIC,perspective_public,perspective_runtime;
GRANT EXECUTE ON FUNCTION
  profiles.pn01_public_company(text),profiles.pn01_public_directory(text),
  profiles.pn02_public_person(text,text),profiles.pn02_public_person_directory(text,text),
  profiles.pn02_public_relationships(text,text),
  profiles.pn04_public_submit(text,text,text,text,text,text,text,text)
  TO perspective_public;
GRANT EXECUTE ON FUNCTION
  profiles.pn03_submit(uuid,text,text,jsonb,text),
  profiles.pn03_review(uuid,uuid,text,text,text),
  profiles.pn03_publish(uuid,uuid,text,text,text),
  profiles.pn03_team_queue(uuid),
  profiles.pn04_team_queue(uuid),
  profiles.pn04_decide(uuid,uuid,text,text,text),
  profiles.pn04_purge_expired(uuid)
  TO perspective_runtime;
