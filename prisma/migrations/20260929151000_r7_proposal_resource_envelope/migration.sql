-- R7 proposals participate in the shared trusted resource and audit model.
-- Backfill rows created before resource-envelope registration was wired.
INSERT INTO platform.resources (
  id, resource_type, title, owner_organization_id, client_organization_id,
  visibility, sensitivity, created_at
)
SELECT proposal.resource_id, 'proposal', 'Proposal', proposal.owner_organization_id,
       account.client_organization_id, 'INTERNAL'::platform."Visibility",
       'FINANCIAL'::platform."Sensitivity", proposal.created_at
  FROM commercial.proposals AS proposal
  JOIN commercial.client_accounts AS account
    ON account.id = proposal.client_account_id
   AND account.owner_organization_id = proposal.owner_organization_id
 WHERE NOT EXISTS (
   SELECT 1 FROM platform.resources AS resource WHERE resource.id = proposal.resource_id
 );

ALTER TABLE commercial.proposals
  ADD CONSTRAINT proposals_resource_owner_fkey
  FOREIGN KEY (resource_id, owner_organization_id)
  REFERENCES platform.resources (id, owner_organization_id)
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION platform.register_r7_proposal_resource(
  p_resource_id uuid,
  p_deal_id uuid,
  p_client_account_id uuid,
  p_title text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform, commercial
AS $$
DECLARE
  owner_id uuid;
  client_organization_id uuid;
BEGIN
  owner_id := platform.current_organization_id();
  IF owner_id IS NULL OR p_resource_id IS NULL OR NULLIF(btrim(p_title), '') IS NULL THEN
    RAISE EXCEPTION 'invalid R7 proposal resource context' USING ERRCODE = '42501';
  END IF;

  SELECT account.client_organization_id INTO client_organization_id
    FROM commercial.deals AS deal
    JOIN commercial.deal_stages AS stage
      ON stage.id = deal.stage_id
     AND stage.pipeline_id = deal.pipeline_id
     AND stage.owner_organization_id = deal.owner_organization_id
    JOIN commercial.client_accounts AS account
      ON account.id = p_client_account_id
     AND account.owner_organization_id = deal.owner_organization_id
     AND account.client_organization_id = deal.client_organization_id
     AND account.archived_at IS NULL
   WHERE deal.id = p_deal_id
     AND deal.owner_organization_id = owner_id
     AND deal.archived_at IS NULL
     AND deal.client_organization_id IS NOT NULL
     AND stage.canonical_class = 'PROPOSAL_PREPARATION'
   FOR SHARE OF deal, stage, account;

  IF client_organization_id IS NULL THEN
    RAISE EXCEPTION 'proposal resource relationship is invalid' USING ERRCODE = '23503';
  END IF;

  INSERT INTO platform.resources (
    id, resource_type, title, owner_organization_id, client_organization_id,
    visibility, sensitivity, created_at
  ) VALUES (
    p_resource_id, 'proposal', btrim(p_title), owner_id, client_organization_id,
    'INTERNAL'::platform."Visibility", 'FINANCIAL'::platform."Sensitivity", CURRENT_TIMESTAMP
  );

  RETURN p_resource_id;
END;
$$;

REVOKE ALL ON FUNCTION platform.register_r7_proposal_resource(uuid,uuid,uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.register_r7_proposal_resource(uuid,uuid,uuid,text) TO perspective_runtime;
