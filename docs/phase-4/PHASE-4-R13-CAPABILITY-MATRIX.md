# R13 capability matrix

STATUS: **G0 MATRIX — NO AMBIGUOUS ROW**
DATE: 3 October 2026

| Capability | Existing foundation | R13 work | Owner | Permission | Persistence | API | UI | Worker/provider | Class |
|---|---|---|---|---|---|---|---|---|---|
| Team membership administration | R5 policy | none | R5 | `team.manage`, `team.view` | iam | none new | none new | none | inherited unchanged |
| Departments, roles, permission sets | R5 | none | R5 | `department.manage`, `role.manage`, `permission.manage` | iam | none new | none new | none | inherited unchanged |
| Invitations | R3 | none | R3 | authentication | iam.invitations | none new | none new | none | inherited unchanged |
| Audit records | R2/R5 | none | R5 | `audit.view` | audit.audit_events | none new | none new | none | inherited unchanged |
| Incidents | R2 tables | none | R2 | none | platform.incidents | none | none | none | inherited unchanged |
| Files / storage objects | R8 stamps | none | — | `file.view`, `file.version` dormant for this release | none | none | none | none | deferred |
| Notification engine / email delivery | comms + dormant keys | none | — | `notification.read.own`, `emailaccount.manage` | none new | none | none | no provider | deferred |
| AI assistance | none | none | — | no key | none | none | none | no provider | prohibited |
| Operational preferences | unused organization JSON | typed row, not the JSON blob | R13 | `settings.manage` | `ops.organization_settings` | GET/POST `/api/v1/r13/settings` | `/app/operations/desk` | none | activated |
| Integration declaration | none | declare, disable, fail-closed verify | R13 | `integration.manage` | `ops.integration_declarations`, `ops.integration_attempts` | `/api/v1/r13/integrations` | same desk | no provider; verify cannot return VERIFIED | activated |
| Universal admin or worker | none | none | — | — | — | — | — | — | prohibited |
| V1.0 certification, backup, production deploy | R14 | none | R14 | — | — | — | — | — | deferred to R14 |

No other capability is activated.
