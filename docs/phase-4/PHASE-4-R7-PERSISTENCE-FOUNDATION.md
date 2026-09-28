# R7 persistence foundation

BRANCH: phase4/r7-g0-commercial-finance-freeze-20260928
MIGRATION: prisma/migrations/20260928213000_r7_finance_foundation/migration.sql
ADDENDUM: prisma/r7-models.prisma
CANONICAL SCHEMA: prisma/schema.prisma (R6 surface until addendum is appended)
HTTP: NOT STARTED
R8+: LOCKED

## Parity contract
SQL tables and Prisma @@map names:
products, proposals, proposal_versions, proposal_lines,
invoices, payments, ledger_entries, subscriptions, entitlements.

Money: BIGINT minor units + CHAR(3) currency. No Float.
RLS: r7_tenant on owner_organization_id = current_setting('app.organization_id').
Grants: explicit to perspective_runtime. Ledger insert+select only.

## Required append (not optional)
Prisma generate will not see R7 models until:

    cat prisma/r7-models.prisma >> prisma/schema.prisma
    npx prisma validate
    npx prisma generate

Do not add /api/v1/r7 before that commit exists on this branch.
