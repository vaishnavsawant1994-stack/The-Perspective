# The Perspective

<!-- repository-profile:start -->
## Repository profile

**Purpose:** Premium editorial publication and digital magazine platform, including public news and opinion experiences, issue discovery/reading, Personal Magazines, and a governed publisher-business foundation.

**Core contents:** Next.js/TypeScript frontend, typed editorial content architecture, PostgreSQL/Prisma persistence, authentication/session and organization context foundations, tenant-isolation work, tests, scripts, and the V1 Master Completion Bible.

**Current status (1 November 2026):** R1–R13 were accepted and R14 technical qualification was merged. Current `main` at `060e0bcdf10293c50edd3acc5ccd51dbd0834e77` is deployed to Vercel as production deployment `dpl_GAMoYFogdsYr7ZDeHvXSzGZMJd95` (READY), on Node.js 24 with Neon PostgreSQL 16. PR #30 authenticated UI-control audit passed all 24 exact-head checks before merge. Production smoke returned HTTP 200 for the homepage, login, health endpoints, Personal Magazines discovery, and unauthenticated library route (which canonicalizes to login). Encrypted daily backups and an isolated restore are verified; their destination shares the Neon account/provider. V1.0 is not certified: independent review, positive production authentication and tenant checks, human paging, rollback rehearsal, and other R14 evidence remain open. See [the current-state reconciliation](docs/release/CURRENT-STATE-RECONCILIATION-2026-11-01.md).

**Recommended next milestone:** Keep the Master Completion Bible and exact accepted checkpoint authoritative; update this profile only when a later release is formally qualified and accepted.
<!-- repository-profile:end -->

> **V1 program source of truth:** [The Perspective V1.0 Master Completion Bible](./docs/THE-PERSPECTIVE-V1-MASTER-COMPLETION-BIBLE.md)
>
> Accepted product baseline: R1–R13, followed by R14 technical qualification and production hardening. R14 technical qualification, a live production deployment, successful health checks, and green workflows are not V1.0 certification. Mandatory independent review and other release gates remain open.

The production foundation for a premium editorial publication, structured digital reader, Personal Magazine platform, Client Portal, Team Workspace, and shared business platform. Accepted R1–R8 engineering work covers the route/security foundation, PostgreSQL/Prisma persistence, authentication and sessions, organization context, tenant isolation, authorization, CRM, communications, commercial work through payments and reconciliation, and editorial production. R9 adds the publishing and magazine engine accepted in `docs/phase-4/PHASE-4-R9-COMPLETION-RECORD.md`. R10 adds the media, events, and site-distribution surface accepted in `docs/phase-4/PHASE-4-R10-COMPLETION-RECORD.md`. R11 adds the growth, SEO, analytics, and automation surface accepted in `docs/phase-4/PHASE-4-R11-COMPLETION-RECORD.md`. R12 adds the client portal and member platform accepted in `docs/phase-4/PHASE-4-R12-COMPLETION-RECORD.md`. R13 adds the enterprise-operations preferences and integration declarations accepted in `docs/phase-4/PHASE-4-R13-COMPLETION-RECORD.md`. R14 technical qualification and production hosting do not certify V1.0. Independent review and production identity, durable recovery, repository controls, paging, and exact-head acceptance remain open.

## Requirements

- Node.js 24.x (CI and production runtime)
- npm 10 or newer

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). For a production check, run `npm run lint` followed by `npm run build`; serve the completed build with `npm start`.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the local Next.js development server |
| `npm run lint` | Run ESLint across the project |
| `npm run build` | Create an optimized production build |
| `npm start` | Serve the production build |

## Project conventions

The root route is the 1200px, light-theme master editorial homepage. It owns a dense four-tier news header, 440px skyline-led leadership cover story, live/news/market dashboard, fully populated magazine and media shelves, discovery modules, membership, newsletter, and compact publication footer. This shell is isolated to `/`, so completed discovery and reader routes retain the shared site header and footer.

`/personal-magazines` is the permanent server-rendered collection for the configured Personal Magazine editions. Its optional `q` parameter performs normalized URL-driven discovery across canonical Person identity and edition framing without client-side search. `/personal-magazines/[slug]` statically renders the Arjun Mehta, Sophia Reynolds, and Daniel Kim editions. The collection and profiles reuse canonical people, articles, and local imagery. Authentication and the shared database foundation are no longer deferred; they are accepted R2–R4 platform capabilities. Personal Magazine business workflows, CRM handoff, payments/entitlements, provider-backed media/storage, generated deliverables, and full data binding remain later controlled releases. The public frontend design milestone is complete; remaining work is governed by the V1 Master Completion Bible rather than by adding unplanned public pages.

Shared components live in `src/components`, domain types in `src/types`, site-wide content/configuration in `src/config`, and centralized temporary data in `src/data/mock`. Local visual assets belong below `public/images` in the appropriate editorial category. The root page is the master editorial homepage, `/latest` provides the filterable chronological newsroom feed, `/news` curates current stories and routes durable subjects into `/topic/[slug]`, `/business`, `/leadership`, and `/technology` remain first-class editorial desks, `/perspective` is the author-led Opinion and Ideas landing, `/magazine` is the issue-led publication front door, `/magazine/premium` is its canonical Premium-edition catalogue, `/magazine/subscribe` compares the future Reader, Digital, and Premium access levels, `/magazine/category/[slug]` provides statically generated theme shelves across canonical issues and stories, `/magazine/archive` provides URL-driven issue discovery, `/magazine/read/[slug]` provides structured visual and accessible issue reading, `/personal-magazines` provides person-led publication discovery, `/search` provides free-form local discovery, `/author/[slug]` provides the statically generated contributor archive, and `/article/[slug]` renders every editorial story—including magazine stories—through one typed reader architecture. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed decisions.
