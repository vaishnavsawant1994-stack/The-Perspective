# Phase 4 — R1 Checkpoint

## Repository Foundation, Route Contract & Fail-Closed Security Boundary

**Checkpoint:** P4-R1-C1  
**Date:** August 23, 2026  
**Status:** REVIEWED AND ACCEPTED  
**Authorized scope:** R1 only  
**R2 status:** NOT AUTHORIZED

R1 establishes the route, security, configuration, repository-boundary, and automated-test foundations required by later engineering stages. It does not implement business workflows, persistence, provider integrations, or a production authentication service. The frozen Designs 001–153 remain unchanged and no Design 154 was created.

## 1. Acceptance summary

| # | R1 acceptance criterion | Result | Evidence |
| --- | --- | --- | --- |
| 1 | Typed registry covers all 153 responsibilities and documents canonical, alias, and transitional paths | PASS | `audited-route-registry.ts`; registry test proves ordered IDs 001–153, count 153, and unique canonical ownership. Every record contains `canonicalPath`, `aliasPaths`, and `transitionalPaths`. |
| 2 | Five route collisions have unambiguous ownership | PASS | Five distinct canonical route pairs in Section 3; five independently buildable routes added; parameterized collision tests pass. |
| 3 | Representative unauthenticated `/app/*` and protected `/client/*` requests fail closed | PASS | Pure policy tests, Proxy tests, and live production HTTP checks return `307` to the correct sign-in surface before fixture content. |
| 4 | Arbitrary protected dynamic IDs cannot render known fixtures | PASS | Automated and live checks for arbitrary team lead IDs and client contract IDs return `307`; spoofed cookies do not bypass the boundary. |
| 5 | Public editorial routes remain public | PASS | `/` and `/magazine` return `200`; magazine reader validation remains covered by the Proxy suite. |
| 6 | Request context carries identity, session, organization/workspace, membership, authorization | PASS | Typed anonymous/authenticated contracts in `request-context.ts`. |
| 7 | Security configuration fails safely; secrets are not committed or serialized | PASS | Missing, invalid, and valid configuration tests; all outcomes remain `deny-all`. Server secret resolver contract is guarded by `server-only`; targeted secret scan found no values; no environment file is tracked. |
| 8 | Test harness covers route registry, boundaries, public routes, and arbitrary IDs | PASS | Vitest 4.1.11; 4 test files, 36 tests, all passing. |
| 9 | ESLint, strict TypeScript, production build, and R1 tests pass | PASS | All commands exit `0`; production build generates 420 routes and reports the Next.js Proxy. |
| 10 | Accepted production dependency graph is clean or formally constrained | PASS | Explicit `nanoid@3.3.18` override replaces vulnerable transitive `3.3.17`; `npm audit --omit=dev` reports 0 vulnerabilities. No broad `npm audit fix` was run. |
| 11 | Browser verification confirms protected denials, public availability, and retained visuals | PASS | Production server tested at `localhost:3100` in installed Microsoft Edge at 1440×1000. Protected `/app` rendered the existing public sign-in screen after redirect; client sign-in and public magazine pages rendered correctly. No visual component or stylesheet was changed by R1. |
| 12 | Checkpoint records files, evidence, risks, and rollback before R2 | PASS | This document. R2 remains explicitly locked. |

## 2. Route registry

The canonical registry is the implementation contract for all frozen responsibilities:

- **153 records:** one ordered record for each Design 001–153;
- **surfaces:** Team Workspace and Client Portal;
- **access:** protected team, protected client, or public client authentication;
- **path state:** canonical, alias, and transitional paths;
- **classification:** shell, screen, or reference;
- **public client routes:** Designs 075, 076, and 077 only;
- **dynamic contracts:** parameterized canonical routes retain concrete visual-fixture URLs as transitional paths where applicable.

The registry is infrastructure metadata. R1 does not turn its dynamic path templates into business-backed detail pages.

## 3. Five collision resolutions

| Frozen designs | Earlier collision | R1 canonical ownership |
| --- | --- | --- |
| 006 Operations Dashboard / 136 Operations Command Center | `/app/operations` | 006 → `/app/operations/dashboard`; 136 → `/app/operations` |
| 033 Client Reporting Workspace / 131 Reporting Library | `/app/reports` | 033 → `/app/reports/client-reporting`; 131 → `/app/reports` |
| 037 Roles & Permissions Management / 144 Role & Permission Administration | `/app/settings/roles` | 037 → `/app/settings/access-control`; 144 → `/app/settings/roles` |
| 038 Analytics Workspace / 135 Analytics Executive Dashboard | `/app/analytics` | 038 → `/app/analytics/explorer`; 135 → `/app/analytics` |
| 040 System / Organization Settings / 145 Workspace / Organization Administration | `/app/settings/organization` | 040 → `/app/settings/system-organization`; 145 → `/app/settings/organization` |

Each new route composes the already-existing frozen visual component. R1 introduced no redesign and did not invent aliases between distinct responsibilities.

## 4. Fail-closed security boundary

### Protected namespaces

- `/app` and every `/app/*` route → team sign-in at `/login`;
- `/client` and every `/client/*` route → client sign-in at `/client/login`;
- exceptions → `/client/login`, `/client/recover-access`, and `/client/activate/[token]`;
- unrelated editorial/public routes are outside the protected policy.

The current R1 boundary deliberately supports only `PERSPECTIVE_AUTH_BOUNDARY_MODE=deny-all`. Missing or invalid configuration also produces `deny-all`. No cookie is treated as verified identity. A later authorized identity stage must replace this interim denial with cryptographically verified server sessions and must enforce authorization again at the data/command boundary.

Return locations are restricted to same-origin relative paths before being placed in a sign-in URL, preventing an open-redirect handoff.

### Live production HTTP evidence

| Request | Result |
| --- | --- |
| `/app` | `307` → `/login?next=%2Fapp` |
| `/app/settings/roles` | `307` → team sign-in |
| `/app/sales/leads/arbitrary-id` | `307` → team sign-in |
| `/client` | `307` → `/client/login?next=%2Fclient` |
| `/client/contracts/arbitrary-id` | `307` → client sign-in |
| `/client/login` | `200` |
| `/client/activate/arbitrary-token` | `200` |
| `/client/recover-access` | `200` |
| `/` | `200` |
| `/magazine` | `200` |

## 5. Repository boundaries

`src/modules/README.md` locks this dependency direction:

```text
foundation
  → identity / session / tenancy / authorization
  → domain
  → application commands, queries and APIs
  → integrations and background workers
  → UI adapters and routes
```

Foundation code contains contracts and policies only. R1 adds no CRM, finance, project, publishing, distribution, reporting, automation, or integration behavior.

## 6. Dependency-security result

P4-R0 found transitive `nanoid@3.3.17`. R1 used a narrow package override to `3.3.18`, the patched release in the same line, rather than applying an uncontrolled dependency rewrite.

```text
next@16.3.0 → postcss@8.5.23 → nanoid@3.3.18 overridden
@tailwindcss/postcss@4.3.3 → postcss@8.5.26 → nanoid@3.3.18 overridden
npm audit --omit=dev → found 0 vulnerabilities
```

## 7. Validation evidence

| Command / check | Result |
| --- | --- |
| `npm test` | PASS — 4 files, 36 tests |
| `npm run lint` | PASS — exit 0 |
| `npm run typecheck` | PASS — strict TypeScript, exit 0 |
| `npm run build` | PASS — Next.js 16.3.0, 420 routes, Proxy present |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm ls nanoid --all` | PASS — all resolved instances are 3.3.18 |
| `git diff --check` | PASS for content; only existing Windows line-ending notices were emitted |
| Targeted secret-pattern scan | PASS — no findings in R1 source/configuration files |
| Live HTTP checks | PASS — protected redirect/public availability matrix above |
| Edge visual inspection | PASS — team sign-in redirect, client sign-in, and public magazine rendered without R1 visual changes |

## 8. Files changed by R1

### Runtime and dependency configuration

- `package.json`
- `package-lock.json`
- `src/proxy.ts`
- `vitest.config.mts`

### Foundation contracts

- `src/modules/README.md`
- `src/modules/foundation/index.ts`
- `src/modules/foundation/request-context.ts`
- `src/modules/foundation/config/security-boundary.ts`
- `src/modules/foundation/config/server-environment.ts`
- `src/modules/foundation/routing/access-policy.ts`
- `src/modules/foundation/routing/audited-route-registry.ts`

### Automated tests

- `src/proxy.test.ts`
- `src/modules/foundation/config/security-boundary.test.ts`
- `src/modules/foundation/routing/access-policy.test.ts`
- `src/modules/foundation/routing/audited-route-registry.test.ts`

### Collision routes

- `src/app/app/operations/dashboard/page.tsx`
- `src/app/app/reports/client-reporting/page.tsx`
- `src/app/app/settings/access-control/page.tsx`
- `src/app/app/analytics/explorer/page.tsx`
- `src/app/app/settings/system-organization/page.tsx`

### Checkpoint

- `docs/phase-4/PHASE-4-R1-CHECKPOINT.md`

## 9. Unresolved risks and deliberate deferrals

1. **No production identity provider or verified session exists.** The safe interim outcome is intentional denial of every protected route.
2. **No database, tenancy resolver, RBAC evaluator, or server data-access layer exists.** R1 defines request-context boundaries but does not implement later stages.
3. **Authentication screens are visual fixtures.** They do not yet establish sessions.
4. **Dynamic canonical team routes are contracts, not business-backed implementations.** Existing concrete visual fixtures remain transitional paths until their authorized workflow stage.
5. **Proxy is an initial request boundary, not the eventual sole authorization control.** Later server APIs, commands, and data access must independently enforce identity, membership, tenant, and permission checks.
6. **The wider repository remains a visual prototype.** R1 does not change the P4-R0 production-readiness conclusion.
7. **The worktree contained extensive pre-existing uncommitted design/audit work.** R1 intentionally avoided rewriting or deleting it, so a clean standalone R1 Git commit was not created automatically.

## 10. Rollback instructions

The safest rollback is a dedicated `git revert` after the owner records R1 as its own reviewed commit. Until then, do not use broad reset/checkout commands because the worktree contains unrelated user work.

For a surgical pre-commit rollback:

1. restore only `package.json`, `package-lock.json`, and `src/proxy.ts` to their pre-R1 versions;
2. remove only the five collision-route `page.tsx` files listed in Section 8;
3. remove only `vitest.config.mts`, the `src/modules/foundation` files, `src/modules/README.md`, the four R1 test files, and this checkpoint;
4. run `npm install` to reconcile installed dependencies with the restored lockfile;
5. rerun lint, strict TypeScript, and the production build;
6. do not modify any other dirty or untracked design/audit file during rollback.

Rollback removes the fail-closed protection and therefore reopens the P4-R0 critical security finding. It must not be used in a production deployment.

## 11. Review gate

P4-R1-C1 was reviewed and accepted on August 23, 2026. Its route registry remains the single source of truth for the frozen 153 responsibilities. Its request-context types remain contracts only and are not evidence that authentication or tenancy enforcement exists.

```text
P4-R0-G1 accepted
  → R1 implemented
  → P4-R1-C1 accepted
  → R2 explicitly authorized
  → R3 remains locked
```
