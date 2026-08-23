# Repository module boundaries

R1 establishes dependency direction without implementing business workflows.

```text
foundation contracts
  -> identity / session / tenancy / authorization
  -> domain modules
  -> application commands, queries and APIs
  -> integrations and background workers
  -> UI adapters and routed screens
```

Rules:

- `foundation` contains dependency-free contracts, route ownership, access policy, and secure configuration parsing.
- Identity, session, tenancy, and authorization code may depend on `foundation`; `foundation` must never depend on them.
- Domain modules may depend on `foundation` and verified identity/tenant contracts, but not UI components.
- APIs and application services orchestrate domain commands and queries; routed pages do not own persistence logic.
- Integrations and workers call application/domain interfaces and must preserve idempotency, retry, and audit boundaries.
- UI components consume server-projected data and commands. They must not bypass authorization or tenancy controls.
- Client code must not import server-only configuration, secrets, session verification, or persistence adapters.

Security configuration:

- `PERSPECTIVE_AUTH_BOUNDARY_MODE=deny-all` keeps every protected namespace closed without requiring secret material.
- R3 adds the explicit `sessions` mode, which is valid only with PostgreSQL, an approved public origin, and versioned 256-bit server key material.
- Missing or invalid security configuration always resolves to `deny-all`; it can never make a protected namespace public.
- Secret names and resolution live in `foundation/config/server-environment.ts`, which is guarded by `server-only`. Secret values must not appear in route registries, client props, logs, or committed environment files.

Later remediation stages may add modules inside these boundaries, but R1 does not add domain entities or business behavior.

R2 persistence boundary:

- `persistence` is server-only infrastructure and may depend on `foundation`; `foundation` must never import Prisma, PostgreSQL, or `persistence`.
- `persistence/client.ts` owns construction of the Prisma PostgreSQL adapter and generated client. Routed pages and client components must not construct or import database clients.
- `src/generated/prisma` is generated from the reviewed schema and is intentionally ignored by Git; it must be recreated with `npm run db:generate`.
- Migrations are forward-only, checked-in database contracts. Custom constraints, row-level security, and immutable-history triggers live in reviewed migration SQL rather than UI or route code.
- R2 provides storage contracts only. It does not make the R1 request-context interfaces authenticated, resolve active tenancy, evaluate permissions, or implement business behavior.

R3 authentication boundary:

- `authentication` owns password verification, opaque database sessions, TOTP MFA, explicit invitation acceptance, and credential recovery.
- Password credentials, authentication attempts, and encrypted authentication secrets are append-only evidence. Current credential references may advance, but prior versions remain immutable.
- Successful identity proof produces only an identity-authenticated request context and a minimum Team/Client surface membership. It does not select a tenant or evaluate permissions.
- HTTP mutations require same-origin JSON requests; raw passwords, session/invitation/recovery tokens, TOTP codes, and plaintext TOTP seeds must not enter logs, audit payloads, route props, or client storage.
- R4 tenant selection and R5 authorization remain separate, locked boundaries.
