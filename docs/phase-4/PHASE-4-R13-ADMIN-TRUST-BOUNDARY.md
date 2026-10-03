# R13 admin trust boundary

STATUS: **G0**
DATE: 3 October 2026

Canonical actors already exist. R13 does not invent a super-admin.

| Actor | R13 operations |
|---|---|
| TEAM membership with `settings.manage` | read and update operational preferences for the selected organization |
| TEAM membership with `integration.manage` | list, declare, disable, and fail-closed verify for that organization |
| TEAM membership without those grants | denied |
| CLIENT session | denied. Client portal keys are not admin keys |
| Identity-only session with no membership | denied |
| System worker | no R13 route. Existing workers stay inside their own tokens |
| Platform migration owner | not a runtime actor. RLS qualification uses `perspective_runtime` |

The selected membership's organization is the tenant. A body cannot name another organization. A membership in organization A cannot read or write organization B.

R5 team, role, and department authority is not widened. R13 does not add self-promotion, role grant, or owner-removal commands, so it also does not weaken the R5 last-owner rules that those commands never gained.

Opening `/app/operations/desk` grants nothing.
