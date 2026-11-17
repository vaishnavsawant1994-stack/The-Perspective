# The Perspective — Editorial and Publisher Platform Handbook

> **Repository:** `vaishnavsawant1994-stack/The-Perspective` · **Reviewed:** 15 November 2026  
> **Purpose:** Publish editorial content and digital magazines while building governed publisher, commercial, client and operating workflows.

## Users and jobs to be done

**Public readers** discover and read news, features, opinion, digital magazine issues and Personal Magazines. **Editorial teams** manage content and its publication lifecycle. **Business/operations teams** coordinate leads, subscriptions, commercial contracts, clients, finance, services and organization settings. **Administrators** enforce tenant isolation, authorization, account boundaries, integration permissions and accountable operations.

## Functional product areas

1. Public editorial experiences: news, articles, archives, magazine issues, reader interactions and metadata.
2. Publisher backend: typed content, source/media organization, publication workflows and editorial control.
3. Organization / client isolation: signed-in user membership, tenant-scoped records, role/permission checks and member/client boundary.
4. Commercial operations: CRM, contracts, finance, subscription and service-management foundations.
5. Growth: search/SEO/analytics, automation and reporting systems.
6. Administration: settings, integrations, auditing, release and security operations.

These areas are not a claim that every route or provider is presently production-complete.

## Engineering architecture and repository map

Next.js, React and TypeScript source under `src/`, with PostgreSQL and Prisma under `prisma/`, scripts under `scripts/`, documented requirements, governed release evidence and test suites in `docs/` and source tests. Root `package.json` exposes `npm run typecheck`, `npm run test`, `npm run test:db`, `npm run db:validate`, `npm run db:drift`, `npm run db:migrate:status` and deployment/seed checks.

## Current release status — exact evidence only

The main README records dated acceptance of R1–R13 and technical work on R14. The distinction between **technical qualification** and **full V1.0 certification** is critical: the latter requires any still-outstanding independent exact-SHA review, production smoke and security proof, alert testing, backup/restore evidence and formal release/tag decisions. The last observed state was not a new production certification. Compare the README's historical deployment SHA with current GitHub and hosting evidence before stating that the latest source is live.

Source code, staged migrations, provider packages, test files and issue comments do not independently establish live integration, cross-tenant safety or correct production deployment.

## Developer environment and validation

Use protected environment variables and a disposable database. Install Node dependencies with `npm install`, generate Prisma clients as instructed, and start `npm run dev`. Run typecheck, unit tests, database tests (isolated PostgreSQL), schema validation, migration drift tests and reproducible smoke tests at a pinned commit. Do not apply `db:migrate:deploy` or real seeds to a shared/production DB without backup and approval.

## Data, editorial and security safeguards

- Preserve strict tenant separation and client/member authorization in database queries and APIs.
- Maintain editorial provenance, copyright, factual corrections and transparent publication dates.
- Protect private client, financial, contract and subscription data.
- Require explicit integration permissions and log administrative changes.
- Verify backups and restore, migration rollback plans, dependency scans and operational alert delivery.

## Outstanding engineering milestones

1. Reconcile source/README dates with current exact SHA, CI, Vercel target and latest production logs.
2. Obtain independent security/governance review and close outstanding R14 release gate items.
3. Prove real production smoke, alert/monitoring and backup/restore scenarios.
4. Audit client/organization permissions against negative isolation tests and data portability requirements.
5. Publish a signed release evidence manifest and create the V1.0 tag only after acceptance.

## References

- [README](../README.md)
- [Project docs](../docs/)
- [Prisma schema and migrations](../prisma/)
- [Repository scripts](../scripts/)
- [package.json](../package.json)

**Source-of-truth rule:** exact-head gated evidence outranks historical README statements or feature-planning prose. This document is a structured overview, not an independent release certification.