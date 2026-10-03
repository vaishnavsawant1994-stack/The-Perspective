# R12 capability matrix

| Capability | Existing source | R12 change | Permission | Persistence | API | UI |
|---|---|---|---|---|---|---|
| Client invitation | R6 `client.portal.provision` | New grant, hashed one-time token | `client.portal.provision` invite | `portal.access_grants` | team invite | none |
| Client revocation | R6 `client.portal.manage` | Revoke grant | `client.portal.manage` revoke-access | grant state | team revoke | none |
| Client dashboard | projects, approvals, invoices | Safe counts only | `client.dashboard.view` | projection | client read | `/client/desk` |
| Client projects | `production.projects` | Coarse status | `client.project.view` | projection | client read | desk |
| Client approval | `production.client_approvals` | Account check, then R8 decision | `client.approval.view` plus `approval.client.decide` | existing table | client decide | desk |
| Client billing view | `commercial.invoices` | Issued invoices only | `client.billing.view` | projection | client read | desk |
| Client contract view | `commercial.contracts` | Status and version only | `client.contract.view` | projection | client read | desk |
| Member profile | `iam.people` | Own display name | none (identity) | person row | member profile | library page |
| Member offer | none | Server price, worker-published | worker token | `member.offers` | worker | none |
| Checkout | no provider | Fail closed | none | `member.checkout_attempts` | member checkout | library page |
| Entitlement | `commercial.entitlements` | Manual grant/revoke only | worker token | existing table | worker, member cancel | library |
| Member library | published issues | Entitled published issues | none | projection | member read | `/my-perspective/library` |
| Commercial subscription | `commercial.subscriptions` | untouched | dormant | none | none | none |
| Messages, tasks, questionnaires, assets, notifications, support, org admin | fixtures / later stamps | dormant | not activated | none | none | fixtures remain |
| R13 operations | bible R13 | deferred | `integration.manage`, `settings.manage`, others | none | none | none |

Classification: the first thirteen rows are the R12 ceiling. Fixture client screens outside `/client/desk` stay fixtures. Personal Magazines stay R9.
