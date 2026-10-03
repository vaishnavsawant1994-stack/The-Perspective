# R13 API operation matrix

STATUS: **G0**
DATE: 3 October 2026

All mutations require a TEAM session, same origin, idempotency key, reason, recent authentication, and MFA. Reads require the same session obligations. Reason on a read is the server constant `view`, not a browser role.

| Method | Route | Permission | Action | Resource | Idempotency |
|---|---|---|---|---|---|
| GET | `/api/v1/r13/settings` | `settings.manage` | view | `organization-settings` | no |
| POST | `/api/v1/r13/settings` | `settings.manage` | update | `organization-settings` | yes |
| GET | `/api/v1/r13/integrations` | `integration.manage` | list | `integration-declaration` | no |
| POST | `/api/v1/r13/integrations` | `integration.manage` | declare | `integration-declaration` | yes |
| POST | `/api/v1/r13/integrations/{type}/disable` | `integration.manage` | disable | `integration-declaration` | yes |
| POST | `/api/v1/r13/integrations/{type}/verify` | `integration.manage` | verify | `integration-declaration` | yes |

Field policy, settings: `timezone`, `weekStartsOn`, `supportLabel`, `expectedVersion`, `configured`.
Field policy, integrations: `integrationType`, `state`, `result`.

No internal worker route. Unknown paths are invalid. Foreign and missing resources are concealed as not available where the authorization layer already conceals, and as `NOT_FOUND` from the command when the caller is allowed to attempt the command.

UI route: `/app/operations/desk`. It is not a new design system page and not Design 154.
