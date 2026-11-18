-- V1.1 PN-02: source-backed people and editor editorial profiles.
-- No CRM, IAM or client account identity is imported or automatically linked.
CREATE TABLE profiles.person_profiles (
  id uuid PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  kind text NOT NULL,
  state text NOT NULL DEFAULT 'DRAFT',
  published_version_id uuid,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT person_profiles_slug_check CHECK (char_length(slug) BETWEEN 2 AND 100 AND slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT person_profiles_kind_check CHECK (kind IN ('PROFESSIONAL','EDITOR')),
  CONSTRAINT person_profiles_state_check CHECK (state IN ('DRAFT','PUBLISHED','WITHDRAWN'))
);
CREATE INDEX person_profiles_kind_state_slug_idx ON profiles.person_profiles (kind, state, slug);

CREATE TABLE profiles.person_versions (
  id uuid PRIMARY KEY,
  person_profile_id uuid NOT NULL,
  version integer NOT NULL,
  name text NOT NULL,
  headline text,
  summary text NOT NULL,
  biography text,
  organization_name text,
  website_url text,
  disclosure_kind text NOT NULL DEFAULT 'NONE',
  disclosure_text text,
  sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  coverage jsonb NOT NULL DEFAULT '[]'::jsonb,
  approved_at timestamptz(6),
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT person_versions_person_fkey FOREIGN KEY (person_profile_id) REFERENCES profiles.person_profiles (id) ON DELETE RESTRICT,
  CONSTRAINT person_versions_person_version_key UNIQUE (person_profile_id,version),
  CONSTRAINT person_versions_version_check CHECK (version > 0),
  CONSTRAINT person_versions_name_check CHECK (char_length(name) BETWEEN 2 AND 180),
  CONSTRAINT person_versions_summary_check CHECK (char_length(summary) BETWEEN 12 AND 800),
  CONSTRAINT person_versions_sources_array_check CHECK (jsonb_typeof(sources) = 'array'),
  CONSTRAINT person_versions_coverage_array_check CHECK (jsonb_typeof(coverage) = 'array'),
  CONSTRAINT person_versions_disclosure_check CHECK (disclosure_kind IN ('NONE','SPONSORED','COMMISSIONED')),
  CONSTRAINT person_versions_disclosure_text_check CHECK (
    disclosure_kind = 'NONE' OR char_length(coalesce(disclosure_text,'')) BETWEEN 10 AND 1000
  ),
  CONSTRAINT person_versions_url_check CHECK (website_url IS NULL OR website_url ~ '^https://[^[:space:]]+$')
);
CREATE INDEX person_versions_person_profile_id_approved_at_idx ON profiles.person_versions (person_profile_id, approved_at);
ALTER TABLE profiles.person_profiles ADD CONSTRAINT person_profiles_published_version_id_fkey
  FOREIGN KEY (published_version_id) REFERENCES profiles.person_versions (id) ON DELETE RESTRICT;

CREATE FUNCTION profiles.pn02_publication_guard() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, profiles
AS $guard$
BEGIN
  IF NEW.state = 'PUBLISHED' THEN
    IF NEW.published_version_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM profiles.person_versions AS v
       WHERE v.id = NEW.published_version_id AND v.person_profile_id = NEW.id
         AND v.approved_at IS NOT NULL
         AND jsonb_typeof(v.sources) = 'array'
         AND jsonb_array_length(v.sources) > 0
    ) THEN
      RAISE EXCEPTION 'publication requires an approved sourced version for this person' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END
$guard$;

CREATE TRIGGER pn02_publication_guard
  BEFORE INSERT OR UPDATE ON profiles.person_profiles
  FOR EACH ROW EXECUTE FUNCTION profiles.pn02_publication_guard();

CREATE TRIGGER pn02_immutable_version
  BEFORE UPDATE OR DELETE ON profiles.person_versions
  FOR EACH ROW EXECUTE FUNCTION profiles.pn01_immutable_version();

CREATE TABLE profiles.public_relationships (
  id uuid PRIMARY KEY,
  person_profile_id uuid NOT NULL,
  company_profile_id uuid NOT NULL,
  role text NOT NULL,
  source_url text NOT NULL,
  reviewed_at timestamptz(6) NOT NULL,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT public_relationships_person_fkey FOREIGN KEY (person_profile_id) REFERENCES profiles.person_profiles (id) ON DELETE RESTRICT,
  CONSTRAINT public_relationships_company_fkey FOREIGN KEY (company_profile_id) REFERENCES profiles.company_profiles (id) ON DELETE RESTRICT,
  CONSTRAINT public_relationships_key UNIQUE (person_profile_id,company_profile_id,role),
  CONSTRAINT public_relationships_role_check CHECK (char_length(role) BETWEEN 2 AND 160),
  CONSTRAINT public_relationships_source_check CHECK (source_url ~ '^https://[^[:space:]]+$')
);

CREATE TRIGGER pn02_immutable_relationship
  BEFORE UPDATE OR DELETE ON profiles.public_relationships
  FOR EACH ROW EXECUTE FUNCTION profiles.pn01_immutable_version();

REVOKE ALL ON ALL TABLES IN SCHEMA profiles FROM PUBLIC, perspective_public, perspective_runtime;
REVOKE ALL ON FUNCTION profiles.pn02_publication_guard() FROM PUBLIC, perspective_public, perspective_runtime;

CREATE FUNCTION profiles.pn02_public_person(p_kind text, p_slug text) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, profiles
AS $read$
  SELECT jsonb_build_object(
    'slug', person.slug,
    'kind', person.kind,
    'name', version.name,
    'headline', version.headline,
    'summary', version.summary,
    'biography', version.biography,
    'organizationName', version.organization_name,
    'websiteUrl', version.website_url,
    'disclosureKind', version.disclosure_kind,
    'disclosureText', version.disclosure_text,
    'sources', version.sources,
    'coverage', version.coverage,
    'approvedAt', version.approved_at
  )
  FROM profiles.person_profiles AS person
  JOIN profiles.person_versions AS version
    ON version.id = person.published_version_id
    AND version.person_profile_id = person.id
  WHERE person.state = 'PUBLISHED'
    AND person.kind = p_kind
    AND person.kind IN ('PROFESSIONAL','EDITOR')
    AND person.slug = p_slug
    AND p_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    AND version.approved_at IS NOT NULL
    AND jsonb_typeof(version.sources) = 'array'
    AND jsonb_array_length(version.sources) > 0
  LIMIT 1
$read$;

CREATE FUNCTION profiles.pn02_public_person_directory(p_kind text,p_query text DEFAULT '') RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, profiles
AS $directory$
  SELECT COALESCE(jsonb_agg(selected.item ORDER BY selected.sort_name, selected.slug), '[]'::jsonb)
  FROM (
    SELECT lower(version.name) AS sort_name, person.slug,
      jsonb_build_object(
        'slug', person.slug,
        'kind', person.kind,
        'name', version.name,
        'headline', version.headline,
        'summary', version.summary,
        'organizationName', version.organization_name,
        'disclosureKind', version.disclosure_kind
      ) AS item
    FROM profiles.person_profiles AS person
    JOIN profiles.person_versions AS version
      ON version.id = person.published_version_id
      AND version.person_profile_id = person.id
    WHERE person.state = 'PUBLISHED'
      AND person.kind = p_kind
      AND person.kind IN ('PROFESSIONAL','EDITOR')
      AND version.approved_at IS NOT NULL
      AND jsonb_typeof(version.sources) = 'array'
      AND jsonb_array_length(version.sources) > 0
      AND char_length(coalesce(p_query,'')) <= 80
      AND (
        btrim(coalesce(p_query,'')) = ''
        OR version.name ILIKE '%' || btrim(p_query) || '%'
        OR coalesce(version.organization_name,'') ILIKE '%' || btrim(p_query) || '%'
      )
    ORDER BY version.name, person.slug LIMIT 30
  ) AS selected
$directory$;

CREATE FUNCTION profiles.pn02_public_relationships(p_kind text, p_slug text) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, profiles
AS $relationships$
  SELECT COALESCE(jsonb_agg(selected.item ORDER BY selected.company_name,selected.role), '[]'::jsonb)
  FROM (
    SELECT cv.name AS company_name, link.role,
      jsonb_build_object(
        'companySlug', company.slug, 'companyName', cv.name,
        'role', link.role, 'sourceUrl', link.source_url, 'reviewedAt', link.reviewed_at
      ) AS item
    FROM profiles.public_relationships AS link
    JOIN profiles.person_profiles AS person
      ON person.id = link.person_profile_id
    JOIN profiles.person_versions AS pv
      ON pv.id = person.published_version_id AND pv.person_profile_id = person.id
    JOIN profiles.company_profiles AS company
      ON company.id = link.company_profile_id
    JOIN profiles.company_versions AS cv
      ON cv.id = company.published_version_id AND cv.company_profile_id = company.id
    WHERE person.kind = p_kind AND person.slug = p_slug AND person.state = 'PUBLISHED'
      AND person.kind IN ('PROFESSIONAL','EDITOR')
      AND company.state = 'PUBLISHED'
      AND pv.approved_at IS NOT NULL AND cv.approved_at IS NOT NULL
      AND jsonb_typeof(pv.sources) = 'array' AND jsonb_array_length(pv.sources) > 0
      AND jsonb_typeof(cv.sources) = 'array' AND jsonb_array_length(cv.sources) > 0
    ORDER BY cv.name, link.role LIMIT 30
  ) AS selected
$relationships$;

REVOKE ALL ON FUNCTION profiles.pn02_public_person(text,text),
  profiles.pn02_public_person_directory(text,text),
  profiles.pn02_public_relationships(text,text)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION profiles.pn02_public_person(text,text),
  profiles.pn02_public_person_directory(text,text),
  profiles.pn02_public_relationships(text,text)
  TO perspective_public;
