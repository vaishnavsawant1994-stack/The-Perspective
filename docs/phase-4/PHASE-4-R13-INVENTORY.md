# R13 inventory

STATUS: **G0 INVENTORY — NOT IMPLEMENTATION**
DATE: 3 October 2026
BASELINE: `8717ad284ef65bbd8105bb5f5849184d9306896a`

The bible names R13 as enterprise operations. The frozen permission registry is narrower. Only two keys are stamped `activationStage: "R13"`: `settings.manage` and `integration.manage`. This inventory does not promote every bible heading into a new product.

| Capability | Owner today | Persistence | Permission | API / UI | R13 relevance |
|---|---|---|---|---|---|
| Team and department administration | R5 | `iam` memberships, departments, roles | `team.manage`, `team.view`, `department.manage`, `role.manage`, `permission.manage` | Authorization only; no second admin product | Inherited unchanged |
| Staff invitations | R3 | `iam.invitations` | R3 authentication | Existing accept/revoke | Inherited unchanged. Not a new invite engine |
| Audit viewer | R5 | `audit.audit_events`, append-only | `audit.view` | No R13 viewer | Inherited. Ordinary users cannot edit audit rows |
| Incidents and reconciliation rows | R2 | `platform.incidents`, `incident_events`, `reconciliation_runs` | No incident permission | No API | Inherited tables. No new incident tool |
| Files | R8 stamp | No blob store | `file.view`, `file.version` | Not an R8 active key | Deferred. No second filesystem |
| Notifications and email | R5+/R6 | Communications domain | `notification.read.own` (`R5+`), `emailaccount.manage` (`R6`) | No delivery provider | Deferred. No notification engine |
| Organization settings blob | R2 | `iam.organizations.settings` JSON, unused | none on the blob | none | Do not turn the blob into an arbitrary store |
| Settings authority | Registry R13 | none yet | `settings.manage` | none | R13 activates a typed preference row |
| Integration authority | Registry R13 | none yet | `integration.manage` | none | R13 activates a declaration that cannot become verified |
| AI | none | none | no key | none | Prohibited. No provider, no key |
| Workers | R6–R12 | per-release tokens | scoped | existing workers stay scoped | R13 adds no worker and no universal token |
| V1.0 / backup / deploy | R14 | none | none | none | Prohibited in R13 |

Fixture team, settings, and integration screens elsewhere in the app stay fixtures. R13 adds one operations desk bound to the two keys.
