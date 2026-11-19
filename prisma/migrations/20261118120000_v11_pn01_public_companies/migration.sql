-- V1.1 PN-01: manually curated public company profiles, isolated from private CRM.
-- No records are seeded. No application write route or runtime role table access.
CREATE SCHEMA IF NOT EXISTS profiles;
REVOKE ALL ON SCHEMA profiles FROM PUBLIC;
GRANT USAGE ON SCHEMA profiles TO perspective_public;

CREATE TABLE profiles.company_profiles (
  id uuid PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  state text NOT NULL DEFAULT 'DRAFT',
  published_version_id uuid,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT company_profiles_slug_check CHECK (char_length(slug) BETWEEN 2 AND 100 AND slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT company_profiles_state_check CHECK (state IN ('DRAFT','PUBLISHED','WITHDRAWN'))
);
CREATE INDEX company_profiles_state_slug_idx ON profiles.company_profiles (state,slug);

CREATE TABLE profiles.company_versions (
  id uuid PRIMARY KEY,
  company_profile_id uuid NOT NULL,
  version integer NOT NULL,
  name text NOT NULL,
  summary text NOT NULL,
  industry text,
  headquarters text,
  website_url text,
  overview text,
  disclosure_kind text NOT NULL DEFAULT 'NONE',
  disclosure_text text,
  sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  approved_at timestamptz(6),
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT company_versions_company_profile_id_fkey FOREIGN KEY (company_profile_id)
    REFERENCES profiles.company_profiles (id) ON DELETE RESTRICT,
  CONSTRAINT company_versions_company_profile_id_version_key UNIQUE (company_profile_id,version),
  CONSTRAINT company_versions_version_check CHECK (version > 0),
  CONSTRAINT company_versions_name_check CHECK (char_length(name) BETWEEN 2 AND 180),
  CONSTRAINT company_versions_summary_check CHECK (char_length(summary) BETWEEN 12 AND 800),
  CONSTRAINT company_versions_disclosure_check CHECK (disclosure_kind IN ('NONE','SPONSORED','COMMISSIONED')),
  CONSTRAINT company_versions_disclosure_text_check CHECK (
    disclosure_kind = 'NONE' OR char_length(coalesce(disclosure_text,'')) BETWEEN 10 AND 1000
  ),
  CONSTRAINT company_versions_sources_array_check CHECK (jsonb_typeof(sources) = 'array'),
  CONSTRAINT company_versions_url_check CHECK (website_url IS NULL OR website_url ~ '^https://[^[:space:]]+$')
);
CREATE INDEX company_versions_company_profile_id_approved_at_idx ON profiles.company_versions (company_profile_id, approved_at);
ALTER TABLE profiles.company_profiles ADD CONSTRAINT company_profiles_published_version_id_fkey
  FOREIGN KEY (published_version_id) REFERENCES profiles.company_versions (id) ON DELETE RESTRICT;

-- Every public pointer is checked against the same company and an approved
-- source-backed immutable version, even if a privileged maintenance tool writes SQL.
CREATE FUNCTION profiles.pn01_publication_guard() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, profiles
AS $guard$
BEGIN
  IF NEW.state = 'PUBLISHED' THEN
    IF NEW.published_version_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM profiles.company_versions AS version
       WHERE version.id = NEW.published_version_id
         AND version.company_profile_id = NEW.id
         AND version.approved_at IS NOT NULL
         AND jsonb_typeof(version.sources) = 'array'
         AND jsonb_array_length(version.sources) > 0
    ) THEN
      RAISE EXCEPTION 'publication requires a source-backed editorially approved version for this company'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END
$guard$;
CREATE TRIGGER pn01_publication_guard
  BEFORE INSERT OR UPDATE ON profiles.company_profiles
  FOR EACH ROW EXECUTE FUNCTION profiles.pn01_publication_guard();

-- Published versions are append-only; fixes require a new approved snapshot.
CREATE FUNCTION profiles.pn01_immutable_version() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, profiles
AS $immutable$
BEGIN
  RAISE EXCEPTION 'profile versions are immutable' USING ERRCODE = '23514';
END
$immutable$;
CREATE TRIGGER pn01_immutable_version
  BEFORE UPDATE OR DELETE ON profiles.company_versions
  FOR EACH ROW EXECUTE FUNCTION profiles.pn01_immutable_version();

-- Tables are not directly readable or writable by the public and runtime roles.
REVOKE ALL ON ALL TABLES IN SCHEMA profiles FROM PUBLIC, perspective_public, perspective_runtime;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA profiles FROM PUBLIC, perspective_public, perspective_runtime;

-- These allowlisted functions return only explicitly curated public fields.
-- Do not join CRM, account, memberships, contacts, billing, or research work queues.
CREATE FUNCTION profiles.pn01_public_company(p_slug text) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, profiles
AS $public$
  SELECT jsonb_build_object(
    'slug', company.slug,
    'name', version.name,
    'summary', version.summary,
    'industry', version.industry,
    'headquarters', version.headquarters,
    'websiteUrl', version.website_url,
    'overview', version.overview,
    'disclosureKind', version.disclosure_kind,
    'disclosureText', version.disclosure_text,
    'sources', version.sources,
    'approvedAt', version.approved_at
  )
  FROM profiles.company_profiles AS company
  JOIN profiles.company_versions AS version
    ON version.id = company.published_version_id
   AND version.company_profile_id = company.id
  WHERE company.state = 'PUBLISHED'
    AND version.approved_at IS NOT NULL
    AND jsonb_typeof(version.sources) = 'array'
    AND jsonb_array_length(version.sources) > 0
    AND company.slug = p_slug
    AND p_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  LIMIT 1
$public$;

CREATE FUNCTION profiles.pn01_public_directory(p_query text DEFAULT '') RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, profiles
AS $directory$
  SELECT COALESCE(jsonb_agg(selected.item ORDER BY selected.sort_name), '[]'::jsonb)
  FROM (
    SELECT lower(version.name) AS sort_name,
      jsonb_build_object(
        'slug', company.slug,
        'name', version.name,
        'summary', version.summary,
        'industry', version.industry,
        'headquarters', version.headquarters,
        'disclosureKind', version.disclosure_kind
      ) AS item
    FROM profiles.company_profiles AS company
    JOIN profiles.company_versions AS version
      ON version.id = company.published_version_id
     AND version.company_profile_id = company.id
    WHERE company.state = 'PUBLISHED'
      AND version.approved_at IS NOT NULL
      AND jsonb_typeof(version.sources) = 'array'
      AND jsonb_array_length(version.sources) > 0
      AND char_length(coalesce(p_query,'')) <= 80
      AND (
        btrim(coalesce(p_query,'')) = ''
        OR version.name ILIKE '%' || btrim(p_query) || '%'
        OR coalesce(version.industry,'') ILIKE '%' || btrim(p_query) || '%'
      )
    ORDER BY version.name, company.slug
    LIMIT 30
  ) AS selected
$directory$;

REVOKE ALL ON FUNCTION profiles.pn01_public_company(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION profiles.pn01_public_directory(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION profiles.pn01_public_company(text), profiles.pn01_public_directory(text) TO perspective_public;
