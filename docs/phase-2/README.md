# The Perspective Phase 2 Architecture

## Frozen inputs

- Phase 2A: 151 Admin + Employee + Client screens and routes.
- Phase 2B: 17 launch roles, module visibility, critical actions, scopes, and client isolation.

## Phase 2C deliverables

1. [Master Database & Entity Relationship Architecture](./PHASE-2C-MASTER-DATABASE-ENTITY-ARCHITECTURE.md)
2. [Entity Catalog](./PHASE-2C-ENTITY-CATALOG.md)
3. [Field and Primary/Foreign Key Specification](./PHASE-2C-FIELD-AND-KEY-SPECIFICATION.md)
4. [151-Screen Entity Read/Write Map](./PHASE-2C-SCREEN-ENTITY-MAP.md)
5. [PostgreSQL, Prisma, Seed, and Migration Architecture](./PHASE-2C-POSTGRES-PRISMA-SEED-MIGRATION.md)

These documents jointly define the Phase 2C source of truth for schema migrations, backend authorization, API contracts, asynchronous events, Team Workspace data, Client Portal projections, and public publishing integrations.

## Phase 2C requirement traceability

| Required deliverable | Authoritative location |
|---|---|
| 1. Master Entity List | Entity Catalog |
| 2. Complete ER Diagram | Master Architecture, section 20 |
| 3. Entity to field specification | Field and Key Specification |
| 4. Primary/Foreign key map | Field and Key Specification |
| 5. Tenant/organization isolation | Master Architecture, sections 4–6 and 12 |
| 6. Client visibility | Master Architecture, sections 9 and 12 |
| 7. Ownership and assignment | Master Architecture, sections 4–6; Entity Catalog IAM |
| 8. Versioning | Master Architecture, section 10; field profile `IV` |
| 9. Soft-delete/archive | Master Architecture, section 16; PostgreSQL guide |
| 10. Audit history | Master Architecture, section 10; `audit.audit_event` |
| 11. Indexing/search | Master Architecture, sections 13 and 15; PostgreSQL guide |
| 12. Data retention | Master Architecture, section 16; PostgreSQL guide |
| 13. PostgreSQL/Prisma structure | PostgreSQL, Prisma, Seed, and Migration Architecture |
| 14. Seed/demo data | PostgreSQL, Prisma, Seed, and Migration Architecture |
| 15. Migration strategy | PostgreSQL, Prisma, Seed, and Migration Architecture |
| Phase 2A screen read/write mapping | 151-Screen Entity Read/Write Map |

## Architecture coverage

| Input | Expected | Covered |
|---|---:|---:|
| Team Workspace screens | 120 | 120 |
| Client Portal screens | 31 | 31 |
| Total Phase 2A screens | 151 | 151 |
| Phase 2B roles | 17 | 17 |
| Phase 2B visibility modules | 35 | 35 |

The Client Portal uses the same canonical records through client-safe projections. It does not introduce duplicate business entities.

## Phase 2D deliverables — frozen

1. [Master Workflow & State Machines](./PHASE-2D-MASTER-WORKFLOW-STATE-MACHINES.md)
2. [Transition Rules](./PHASE-2D-TRANSITION-RULES.md)
3. [Automation Event Catalog](./PHASE-2D-AUTOMATION-EVENT-CATALOG.md)
4. [SLA & Escalation Matrix](./PHASE-2D-SLA-ESCALATION-MATRIX.md)
5. [151-Screen Workflow Map](./PHASE-2D-SCREEN-WORKFLOW-MAP.md)
6. [Workflow Diagrams](./PHASE-2D-WORKFLOW-DIAGRAMS.md)

Together these documents define the canonical lifecycle vocabulary, authorized commands, guards, side effects, immutable version/decision requirements, automation events, configurable SLA policy and workflow coverage for every frozen Phase 2A route.

## Phase 2D requirement traceability

| Acceptance requirement | Authoritative location |
|---|---|
| One canonical machine per major lifecycle | Master Workflow, sections 3–23 and registry |
| Actor, permission, guard, fields, blockers and side effects | Transition Rules |
| Impossible transition rejection | Transition Rules, rejected command contract |
| Standard domain events and automations | Automation Event Catalog |
| Configurable deadlines, reminders and escalation | SLA & Escalation Matrix |
| Internal/client review separation | Master Workflow and Transition Rules |
| Approved/signed/published version immutability | Master Workflow global invariants |
| Append-only finance evidence | Master Workflow and Transition Rules finance sections |
| 151 operational screens mapped | 151-Screen Workflow Map (151/151) |
| Human-readable end-to-end flows | Workflow Diagrams |

Phase 2D is frozen. UI implementation was intentionally not started during Phase 2D.

## Phase 2E deliverable — frozen

1. [Master Admin, Employee & Client UI Design Sequence](./PHASE-2E-MASTER-UI-DESIGN-SEQUENCE.md)

The Phase 2E source of truth maps all **151 frozen operational routes** to **35 reusable design families**, sequences **35 anchor designs** before **118 route variants**, and defines desktop, tablet, mobile, empty, loading, error and permission-reduced behavior for every screen.

Phase 2E planning is frozen. No Admin, Employee or Client Portal UI implementation was started in this phase. The next visual execution item is **Design 001 — TeamShell**, followed by **Design 002 — ClientShell** and then the exact routed sequence in the master document.

### Phase 2E visual execution checkpoint

Frontend visual execution is tracked separately from the frozen planning document in the [Phase 2E Implementation Tracker](./PHASE-2E-IMPLEMENTATION-TRACKER.md). The current local checkpoint is **153 / 153 designs completed**, **0 pending** (**100%**). The latest completed reference batch is **Design 141–153**, covering automation monitoring, alerting, access administration, organization configuration, developer access, health, data transfer, shared states, responsive systems, and the final design system.

The completed **Design 031–153** range uses the shared visual system for consistent shell sizing, navigation, route access, responsive behavior, realistic prototype content, and client-safe visibility treatment.

## Phase 2F deliverable — frozen

1. [Master API & Service Architecture](./PHASE-2F-MASTER-API-AND-SERVICE-ARCHITECTURE.md)

Phase 2F defines the versioned Team Workspace, Client Portal, public, file, webhook, and worker contracts; modular domain-service ownership; query and command boundaries; organization/client authorization; endpoint catalog; idempotency and concurrency; transactional events; provider integration; caching; search; reporting provenance; observability; testing; and implementation sequence.

The initial backend remains a modular monolith with explicit domain boundaries. Phase 2G may sequence implementation or justify later service extraction, but it must preserve the canonical IDs, commands, events, authorization rules, immutable evidence, and API behavior frozen here.
