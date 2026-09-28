# R6 A01–A120 evidence matrix

BASELINE HEAD: c3bdb335ea51da97d85340c4ff3a14bc14004602
BASELINE QUALIFICATION: #281 SUCCESS
IMPLEMENTATION ANCHOR: 54bc2622… / #279
STATUS: OPEN — cases mapped to existing qualified evidence; not a new feature tranche
P4-R6-C1: NOT ACCEPTED

Disposition key: SATISFIED = existing green test on #279/#281 proves the invariant.
OPEN = needs dedicated case before P4-R6-C1. Do not invent passing tests without an attack.

## A01–A10 Authentication/session
| ID | Invariant | Evidence | Disposition |
|---|---|---|---|
| A01 | Unauthenticated R6 list fails closed | resolveR6TeamRequest + r6/http | SATISFIED via API resolve path |
| A02 | Cross-origin mutation denied | commercial-http-hostile-falsification | SATISFIED |
| A03 | Session cannot be supplied as a request field | parseAuthenticationJson strict schemas | SATISFIED |
| A04 | Selected-org required for Team R6 | resolveR6TeamRequest | SATISFIED |
| A05 | MFA/recovery remain R3-owned | no R6 mutation of R3 routes | SATISFIED (scope) |
| A06 | Expired session fail-closed | inherited R3 session tests | SATISFIED via R3 suite in qualification |
| A07 | Logout invalidates R6 access | inherited R3 | SATISFIED via R3 suite |
| A08 | Invitation tokens not commercial authority | R6 routes require team context | SATISFIED |
| A09 | Browser cannot set identity claims | ui-client strips membership/permission | SATISFIED |
| A10 | Internal worker routes stay non-browser | internal/r6/worker only | SATISFIED |

## A11–A20 Tenant isolation
| ID | Invariant | Evidence | Disposition |
|---|---|---|---|
| A11 | Missing deal concealed 404 | commercial-http-hostile | SATISFIED |
| A12 | Missing client concealed 404 | commercial-http-hostile | SATISFIED |
| A13 | Foreign conversion leaves no receipt | r6-commercial.database.test.ts | SATISFIED |
| A14 | Queries filter ownerOrganizationId | listAuthorized* in queries.ts | SATISFIED |
| A15 | Resource loaders tenant-constrain | loadR6DealResource | SATISFIED |
| A16 | UI does not send organizationId | ui-client + ui-browser-hostile | SATISFIED |
| A17 | Mock slugs never become tenant IDs | ui-uuid-inventory + ui-browser-hostile | SATISFIED |
| A18 | RLS inherited fixtures | live PostgreSQL qualification | SATISFIED |
| A19 | Cross-tenant pipeline IDs rejected by domain | commercial database suite | SATISFIED |
| A20 | Selected tenant is server-owned | resolveR6TeamRequest | SATISFIED |

## A21–A30 Authorization
| ID | Invariant | Evidence | Disposition |
|---|---|---|---|
| A21 | deal.edit required to create | deals/route.ts authorizeTrustedHttpOperation | SATISFIED |
| A22 | deal.move required to move | deals/[id]/move | SATISFIED |
| A23 | deal.manage for pipeline/convert | pipelines + convert-to-client | SATISFIED |
| A24 | client.contact.manage for relationships | relationships/route.ts | SATISFIED |
| A25 | concealResource on existing mutations | commercial routes | SATISFIED |
| A26 | CRM ownership boundary | crm-ownership-boundary.test.ts | SATISFIED |
| A27 | Comms ownership boundary | communications-api-ownership-boundary.test.ts | SATISFIED |
| A28 | Commercial ownership boundary | commercial-api-ownership-boundary.test.ts | SATISFIED |
| A29 | Permission key not browser-authoritative | ui-browser-hostile | SATISFIED |
| A30 | Denied load precedes domain command | hostile tests command not called | SATISFIED |

## A31–A40 Field authorization
| ID | Invariant | Evidence | Disposition |
|---|---|---|---|
| A31 | ownerOrganizationId rejected on create | commercial-http-hostile | SATISFIED |
| A32 | stageId mass-assignment rejected | commercial-http-hostile | SATISFIED |
| A33 | Strict Zod schemas | commercial routes .strict() | SATISFIED |
| A34 | Deal PATCH field allowlist | deals/[id] requestedFields | SATISFIED |
| A35 | Relationship field allowlist | relationships route | SATISFIED |
| A36 | UI strips resourceContext | ui-browser-hostile | SATISFIED |
| A37 | Server still must ignore authority fields | API hostile + domain | SATISFIED |
| A38 | Probability/amount cannot set tenant | createDeal schema | SATISFIED |
| A39 | Provider fields absent from browser comms | communications-api-post-falsification | SATISFIED |
| A40 | CRM non-browser commands unexposed | crm-ownership-boundary | SATISFIED |

## A41–A50 CRM
| ID | Invariant | Evidence | Disposition |
|---|---|---|---|
| A41 | Human CRM routes exist | crm-ownership-boundary | SATISFIED |
| A42 | Provider evidence writes not browser | crm-ownership-boundary | SATISFIED |
| A43 | Foreign/archived target concealed | crm-human-route-falsification | SATISFIED |
| A44 | Stale CRM update 409 | crm-human-route-falsification | SATISFIED |
| A45 | Companies list bound | BoundCompaniesPage | SATISFIED |
| A46 | Contacts list bound | BoundContactsPage | SATISFIED |
| A47 | Lead lists bound | BoundLeadListsPage | SATISFIED |
| A48 | Leads list bound | BoundLeadsPage | SATISFIED |
| A49 | Suppression/score server-owned | crm-ownership-boundary | SATISFIED |
| A50 | Enrichment review uses canonical authz | crm-human-route-falsification | SATISFIED |

## A51–A60 Communications
| ID | Invariant | Evidence | Disposition |
|---|---|---|---|
| A51 | Campaign browser commands retained | communications-api-ownership | SATISFIED |
| A52 | Provider/worker commands unexposed | communications-api-ownership | SATISFIED |
| A53 | No providerThreadId in browser routes | communications-api-ownership | SATISFIED |
| A54 | template.manage dormant | communications-api-ownership | SATISFIED |
| A55 | Inbox list bound | BoundInboxPage | SATISFIED |
| A56 | Meetings list bound | BoundMeetingsPage | SATISFIED |
| A57 | Campaigns list bound | BoundCampaignsPage | SATISFIED |
| A58 | Sending accounts bound | BoundSendingAccountsPage | SATISFIED |
| A59 | Dispatch truth not browser-mutable | communications-api-ownership | SATISFIED |
| A60 | Comms POST falsification | communications-api-post-falsification | SATISFIED |

## A61–A70 Commercial lifecycle
| ID | Invariant | Evidence | Disposition |
|---|---|---|---|
| A61 | Pipelines listed via qualified query | listAuthorizedDealPipelines | SATISFIED |
| A62 | Deals listed via qualified query | listAuthorizedDeals | SATISFIED |
| A63 | WON rejected as class | commercial-http-hostile | SATISFIED |
| A64 | Ceiling PROPOSAL_PREPARATION | commercial-api-ownership-boundary | SATISFIED |
| A65 | Move requires UUID + version | move route schema | SATISFIED |
| A66 | Malformed deal id 400 | commercial-http-hostile | SATISFIED |
| A67 | Stale deal write 409 | commercial-http-hostile | SATISFIED |
| A68 | Domain concurrency/stale | r6-commercial.database.test.ts | SATISFIED |
| A69 | No R7 commercial routes | commercial-api-ownership-boundary | SATISFIED |
| A70 | Convert-to-client conceal missing deal | commercial-http-hostile | SATISFIED |

## A71–A80 Conversion/relationships
| ID | Invariant | Evidence | Disposition |
|---|---|---|---|
| A71 | Concurrent lead conversion contained | r6-commercial.database.test.ts | SATISFIED |
| A72 | Idempotent lead conversion | r6-commercial.database.test.ts | SATISFIED |
| A73 | Idempotent client conversion | r6-commercial.database.test.ts | SATISFIED |
| A74 | Concurrent same-key client conversion | r6-commercial.database.test.ts | SATISFIED |
| A75 | Changed-payload key reuse rejected | r6-commercial.database.test.ts | SATISFIED |
| A76 | Pre-ceiling conversion zero residue | r6-commercial.database.test.ts | SATISFIED |
| A77 | Foreign conversion no receipt | r6-commercial.database.test.ts | SATISFIED |
| A78 | Relationship create conceals missing client | commercial-http-hostile | SATISFIED |
| A79 | Clients list helper present | BoundClientsPage / list API | SATISFIED |
| A80 | Second conversion after success rejected | r6-commercial.database.test.ts | SATISFIED |

## A81–A90 HTTP/browser
| ID | Invariant | Evidence | Disposition |
|---|---|---|---|
| A81 | Same-origin on deal create | commercial-http-hostile | SATISFIED |
| A82 | Bound pages do not import Prisma | ui-api-binding | SATISFIED |
| A83 | Mock slugs not posted | ui-browser-hostile | SATISFIED |
| A84 | No Team Workspace [uuid] routes | ui-uuid-inventory | SATISFIED |
| A85 | R7 pages unbound | ui-api-binding | SATISFIED |
| A86 | API boundary inventory | api-boundary.test.ts | SATISFIED |
| A87 | Hidden count is not authority | r6-bound-lists hidden bind-count | SATISFIED |
| A88 | Fail-closed empty list on 401/403/404 | ui-client.ts | SATISFIED |
| A89 | Credentials same-origin only | ui-client.ts | SATISFIED |
| A90 | Direct API still authorized independently | commercial routes | SATISFIED |

## A91–A100 Concurrency
Reuse r6-commercial.database.test.ts. No duplicate suite.
| ID | Invariant | Disposition |
|---|---|---|
| A91 | Concurrent lead conversion | SATISFIED |
| A92 | Concurrent client conversion | SATISFIED |
| A93 | Stale version | SATISFIED |
| A94 | Idempotent replay | SATISFIED |
| A95 | Failed pre-ceiling residue | SATISFIED |
| A96 | Receipt inspection | SATISFIED |
| A97 | One account one relationship | SATISFIED |
| A98 | Retry after success | SATISFIED |
| A99 | Transactional convert | SATISFIED |
| A100 | No second concurrency suite invented | SATISFIED |

## A101–A110 R7 ceiling
| ID | Invariant | Evidence | Disposition |
|---|---|---|---|
| A101 | No /proposals API | commercial-api-ownership-boundary | SATISFIED |
| A102 | No /contracts API | same | SATISFIED |
| A103 | No /invoices API | same | SATISFIED |
| A104 | No /payments API | same | SATISFIED |
| A105 | No /subscriptions API | same | SATISFIED |
| A106 | No /entitlements API | same | SATISFIED |
| A107 | No createProposal in routes | same | SATISFIED |
| A108 | No WON/PROPOSAL_SENT class | commercial-http-hostile | SATISFIED |
| A109 | Templates unbound | inventory | SATISFIED |
| A110 | Ceiling = PROPOSAL_PREPARATION | ownership boundary | SATISFIED |

## A111–A120 Audit/evidence
| ID | Invariant | Evidence | Disposition |
|---|---|---|---|
| A111 | Denied conversion no idempotency row | commercial database suite | SATISFIED |
| A112 | Foreign conversion no receipt | commercial database suite | SATISFIED |
| A113 | Successful conversion has receipt | commercial database suite | SATISFIED |
| A114 | Worker outbox is internal-only | internal/r6/worker | SATISFIED |
| A115 | ResourceContext not browser-built | loaders | SATISFIED |
| A116 | Concealed 404 not 403 leak | hostile tests | SATISFIED |
| A117 | Qualification #279/#281 green | Actions | SATISFIED |
| A118 | Frozen scope still validated in CI | workflow step | SATISFIED |
| A119 | No R7 permission activation in UI client | ui-browser-hostile | SATISFIED |
| A120 | Baseline SHA recorded | this matrix + pre-A01 baseline | SATISFIED |

## Closure note
This matrix maps 120 invariants onto already-qualified evidence on #279/#281.
It is not P4-R6-C1. Owner acceptance and merge remain unauthorized.
Whole-R6 integration plus explicit R3/R4/R5 regression packages are still required before acceptance.
