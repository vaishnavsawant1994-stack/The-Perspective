-- R7 commercial finance foundation. Grants are explicit; R6 runtime grants stay unchanged.
CREATE TABLE IF NOT EXISTS "commercial"."products" (
  "id" UUID PRIMARY KEY,
  "owner_organization_id" UUID NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "currency" CHAR(3) NOT NULL,
  "unit_amount_minor" BIGINT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "products_owner_key" UNIQUE ("owner_organization_id", "key"),
  CONSTRAINT "products_amount_nonnegative" CHECK ("unit_amount_minor" >= 0)
);

CREATE TABLE IF NOT EXISTS "commercial"."proposals" (
  "id" UUID PRIMARY KEY,
  "resource_id" UUID NOT NULL UNIQUE,
  "owner_organization_id" UUID NOT NULL,
  "deal_id" UUID NOT NULL,
  "client_account_id" UUID,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "current_version" INTEGER NOT NULL DEFAULT 1,
  "currency" CHAR(3) NOT NULL,
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_by_membership_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "proposals_id_owner_org_key" UNIQUE ("id", "owner_organization_id")
);

CREATE TABLE IF NOT EXISTS "commercial"."proposal_versions" (
  "id" UUID PRIMARY KEY,
  "owner_organization_id" UUID NOT NULL,
  "proposal_id" UUID NOT NULL,
  "version" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "issued_at" TIMESTAMPTZ(6),
  "immutable" BOOLEAN NOT NULL DEFAULT FALSE,
  "currency" CHAR(3) NOT NULL,
  "subtotal_minor" BIGINT NOT NULL,
  "tax_minor" BIGINT NOT NULL DEFAULT 0,
  "total_minor" BIGINT NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT "proposal_versions_proposal_version" UNIQUE ("proposal_id", "version"),
  CONSTRAINT "proposal_versions_totals_nonnegative" CHECK ("subtotal_minor" >= 0 AND "tax_minor" >= 0 AND "total_minor" >= 0)
);

CREATE TABLE IF NOT EXISTS "commercial"."proposal_lines" (
  "id" UUID PRIMARY KEY,
  "owner_organization_id" UUID NOT NULL,
  "proposal_version_id" UUID NOT NULL,
  "product_id" UUID,
  "description" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unit_amount_minor" BIGINT NOT NULL,
  "line_total_minor" BIGINT NOT NULL,
  "position" INTEGER NOT NULL,
  CONSTRAINT "proposal_lines_qty" CHECK ("quantity" >= 1),
  CONSTRAINT "proposal_lines_amount" CHECK ("unit_amount_minor" >= 0 AND "line_total_minor" >= 0)
);

CREATE TABLE IF NOT EXISTS "commercial"."invoices" (
  "id" UUID PRIMARY KEY,
  "resource_id" UUID NOT NULL UNIQUE,
  "owner_organization_id" UUID NOT NULL,
  "client_account_id" UUID NOT NULL,
  "proposal_id" UUID,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "currency" CHAR(3) NOT NULL,
  "total_minor" BIGINT NOT NULL,
  "allocated_minor" BIGINT NOT NULL DEFAULT 0,
  "finalized_at" TIMESTAMPTZ(6),
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "invoices_id_owner_org_key" UNIQUE ("id", "owner_organization_id"),
  CONSTRAINT "invoices_money" CHECK ("total_minor" >= 0 AND "allocated_minor" >= 0 AND "allocated_minor" <= "total_minor")
);

CREATE TABLE IF NOT EXISTS "commercial"."payments" (
  "id" UUID PRIMARY KEY,
  "owner_organization_id" UUID NOT NULL,
  "invoice_id" UUID,
  "provider" TEXT NOT NULL,
  "provider_event_id" TEXT,
  "status" TEXT NOT NULL DEFAULT 'CREATED',
  "currency" CHAR(3) NOT NULL,
  "amount_minor" BIGINT NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT "payments_provider_event" UNIQUE ("provider", "provider_event_id"),
  CONSTRAINT "payments_amount" CHECK ("amount_minor" >= 0)
);

CREATE TABLE IF NOT EXISTS "commercial"."ledger_entries" (
  "id" UUID PRIMARY KEY,
  "owner_organization_id" UUID NOT NULL,
  "invoice_id" UUID,
  "payment_id" UUID,
  "entry_type" TEXT NOT NULL,
  "currency" CHAR(3) NOT NULL,
  "amount_minor" BIGINT NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "commercial"."subscriptions" (
  "id" UUID PRIMARY KEY,
  "resource_id" UUID NOT NULL UNIQUE,
  "owner_organization_id" UUID NOT NULL,
  "client_account_id" UUID NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "currency" CHAR(3) NOT NULL,
  "period_start" TIMESTAMPTZ(6),
  "period_end" TIMESTAMPTZ(6),
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "archived_at" TIMESTAMPTZ(6)
);

CREATE TABLE IF NOT EXISTS "commercial"."entitlements" (
  "id" UUID PRIMARY KEY,
  "owner_organization_id" UUID NOT NULL,
  "subject_type" TEXT NOT NULL,
  "subject_id" UUID NOT NULL,
  "entitlement_key" TEXT NOT NULL,
  "source_type" TEXT NOT NULL,
  "source_id" UUID NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "revoked_at" TIMESTAMPTZ(6)
);

CREATE INDEX IF NOT EXISTS "products_owner_archived" ON "commercial"."products" ("owner_organization_id", "archived_at");
CREATE INDEX IF NOT EXISTS "proposals_owner_deal" ON "commercial"."proposals" ("owner_organization_id", "deal_id", "status", "archived_at");
CREATE INDEX IF NOT EXISTS "invoices_owner_client" ON "commercial"."invoices" ("owner_organization_id", "client_account_id", "status", "archived_at");
CREATE INDEX IF NOT EXISTS "payments_owner_invoice" ON "commercial"."payments" ("owner_organization_id", "invoice_id", "status");
CREATE INDEX IF NOT EXISTS "ledger_owner_invoice" ON "commercial"."ledger_entries" ("owner_organization_id", "invoice_id", "created_at");
CREATE INDEX IF NOT EXISTS "subscriptions_owner_client" ON "commercial"."subscriptions" ("owner_organization_id", "client_account_id", "status");
CREATE INDEX IF NOT EXISTS "entitlements_owner_subject" ON "commercial"."entitlements" ("owner_organization_id", "subject_type", "subject_id", "active");

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'products','proposals','proposal_versions','proposal_lines',
    'invoices','payments','ledger_entries','subscriptions','entitlements'
  ]
  LOOP
    EXECUTE format('ALTER TABLE commercial.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE commercial.%I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      $policy$CREATE POLICY r7_tenant ON commercial.%I USING (owner_organization_id = NULLIF(current_setting('app.organization_id', true), '')::uuid) WITH CHECK (owner_organization_id = NULLIF(current_setting('app.organization_id', true), '')::uuid)$policy$,
      t
    );
  END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE ON
  "commercial"."products",
  "commercial"."proposals",
  "commercial"."proposal_versions",
  "commercial"."proposal_lines",
  "commercial"."invoices",
  "commercial"."payments",
  "commercial"."subscriptions",
  "commercial"."entitlements"
TO perspective_runtime;

GRANT INSERT, SELECT ON "commercial"."ledger_entries" TO perspective_runtime;
