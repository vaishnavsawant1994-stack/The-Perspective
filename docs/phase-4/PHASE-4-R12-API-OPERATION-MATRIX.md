# R12 API operation matrix

| Method | Path | Actor | Effect |
|---|---|---|---|
| POST | `/api/v1/r12/access/invitations` | team `client.portal.provision` | invite |
| POST | `/api/v1/r12/access/invitations/{id}/revoke` | team `client.portal.manage` | revoke |
| POST | `/api/v1/r12/access/accept` | client session | accept |
| GET | `/api/v1/r12/client/dashboard` | `client.dashboard.view` | counts |
| GET | `/api/v1/r12/client/projects` | `client.project.view` | list |
| GET | `/api/v1/r12/client/projects/{id}` | `client.project.view` | detail or not found |
| GET | `/api/v1/r12/client/approvals` | `client.approval.view` | list |
| POST | `/api/v1/r12/client/approvals/{versionId}` | `approval.client.decide` | decide |
| GET | `/api/v1/r12/client/invoices` | `client.billing.view` | projection |
| GET | `/api/v1/r12/client/contracts` | `client.contract.view` | projection |
| GET | `/api/v1/r12/member/library` | member session | entitled issues |
| GET | `/api/v1/r12/member/issues/{id}` | member session | one issue or not found |
| POST | `/api/v1/r12/member/profile` | member session | own display name |
| POST | `/api/v1/r12/member/checkout` | member session | provider unavailable |
| POST | `/api/v1/r12/member/entitlements/{id}/cancel` | member session | immediate revoke |
| POST | `/api/v1/internal/r12/worker/offers` | worker bearer | open offer |
| POST | `/api/v1/internal/r12/worker/grant` | worker bearer | manual entitlement |
| POST | `/api/v1/internal/r12/worker/revoke` | worker bearer | revoke |

Mutations require the existing same-origin check, except the worker, which requires `PERSPECTIVE_R12_WORKER_TOKEN` of at least 32 characters. Browser calls to the worker fail.

UI: `/client/desk` and `/my-perspective/library`. Neither grants authority by being opened.
