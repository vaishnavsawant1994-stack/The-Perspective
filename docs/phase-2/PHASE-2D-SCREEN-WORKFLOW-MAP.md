# Phase 2D — 151-Screen Workflow Map

**Status:** Frozen  
**Authority:** Phase 2A routes + Phase 2B authorization + Phase 2C entities + Phase 2D canonical machines  
**Coverage:** 151/151 operational screens

## 1. Interpretation rules

- A screen is a view and command surface; it never owns or invents persisted workflow state.
- “Displays” names the authoritative machine projections rendered by the screen.
- “Commands / transitions” describes intent. Every command still passes the guards in the transition rules.
- Dashboards, search, calendars, analytics, and list pages are projections. Mutation is delegated to the owning aggregate.
- Client routes receive only `CLIENT_SHARED` records for the authenticated client organization and project membership.
- Empty-state, loading, error, mobile, and permission-reduced variants use the same machine and route entry.

## 2. Complete screen map

| # | Screen | Exact route | Displays authoritative machine(s) | Commands / transition surface | Authorization / visibility |
|---:|---|---|---|---|---|
| 1 | Staff Sign In | `/app/login` | `identity.access` | Authenticate, verify, activate, recover, or deny | Public auth command or authenticated self; no domain mutation on denial |
| 2 | Multi-Factor Authentication | `/app/mfa` | `identity.access` | Authenticate, verify, activate, recover, or deny | Public auth command or authenticated self; no domain mutation on denial |
| 3 | Accept Staff Invite | `/app/invite/[token]` | `identity.access` | Authenticate, verify, activate, recover, or deny | Public auth command or authenticated self; no domain mutation on denial |
| 4 | Staff Profile Setup | `/app/onboarding/profile` | `identity.access` | Authenticate, verify, activate, recover, or deny | Public auth command or authenticated self; no domain mutation on denial |
| 5 | Staff Access Recovery | `/app/recover-access` | `identity.access` | Authenticate, verify, activate, recover, or deny | Public auth command or authenticated self; no domain mutation on denial |
| 6 | Access Denied / Permission Required | `/app/access-denied` | `identity.access` | Authenticate, verify, activate, recover, or deny | Public auth command or authenticated self; no domain mutation on denial |
| 7 | Executive Dashboard | `/app` | `portfolio projection: lead, deal, client onboarding, project, finance, approval, publishing, renewal` | Read projections; drill down; assign only through target aggregate command | Executive scope; dashboard never owns state |
| 8 | My Work | `/app/my-work` | `task.lifecycle, approval.lifecycle, meeting.lifecycle, deal, project.lifecycle` | Start/complete/reopen assigned task; decide eligible approval; open linked work | Assignment and scoped permissions |
| 9 | Global Workspace Search | `/app/search?q={query}` | `all indexed lifecycle projections` | Search/open only; commands execute on destination screen | Permission-filtered results |
| 10 | Staff Notifications | `/app/notifications` | `notification.delivery` | Mark read/unread; open target; update own delivery preferences | Own notifications only |
| 11 | Lead Finder | `/app/sales/lead-finder` | `lead.lifecycle, extraction.job, enrichment.job` | Discover/extract/retry/review/enrich/qualify/assign/convert according to screen | Research/Sales scope; DNC and provenance gates |
| 12 | Data Sources | `/app/sales/data-sources` | `lead.lifecycle, extraction.job, enrichment.job` | Discover/extract/retry/review/enrich/qualify/assign/convert according to screen | Research/Sales scope; DNC and provenance gates |
| 13 | Extraction Jobs | `/app/sales/extractions` | `lead.lifecycle, extraction.job, enrichment.job` | Discover/extract/retry/review/enrich/qualify/assign/convert according to screen | Research/Sales scope; DNC and provenance gates |
| 14 | Extraction Review / Staging | `/app/sales/extractions/[jobId]` | `lead.lifecycle, extraction.job, enrichment.job` | Discover/extract/retry/review/enrich/qualify/assign/convert according to screen | Research/Sales scope; DNC and provenance gates |
| 15 | Enrichment Queue | `/app/sales/enrichment` | `lead.lifecycle, extraction.job, enrichment.job` | Discover/extract/retry/review/enrich/qualify/assign/convert according to screen | Research/Sales scope; DNC and provenance gates |
| 16 | Leads | `/app/sales/leads` | `lead.lifecycle, extraction.job, enrichment.job` | Discover/extract/retry/review/enrich/qualify/assign/convert according to screen | Research/Sales scope; DNC and provenance gates |
| 17 | Lead Detail | `/app/sales/leads/[leadId]` | `lead.lifecycle, extraction.job, enrichment.job` | Discover/extract/retry/review/enrich/qualify/assign/convert according to screen | Research/Sales scope; DNC and provenance gates |
| 18 | Companies | `/app/sales/companies` | `lead.lifecycle, deal, client onboarding (linked projections)` | Maintain company/contact/list; add eligible leads to frozen audience | Scoped CRM commands; entity merge is audited |
| 19 | Company Detail | `/app/sales/companies/[companyId]` | `lead.lifecycle, deal, client onboarding (linked projections)` | Maintain company/contact/list; add eligible leads to frozen audience | Scoped CRM commands; entity merge is audited |
| 20 | Contacts | `/app/sales/contacts` | `lead.lifecycle, deal, client onboarding (linked projections)` | Maintain company/contact/list; add eligible leads to frozen audience | Scoped CRM commands; entity merge is audited |
| 21 | Contact Detail | `/app/sales/contacts/[contactId]` | `lead.lifecycle, deal, client onboarding (linked projections)` | Maintain company/contact/list; add eligible leads to frozen audience | Scoped CRM commands; entity merge is audited |
| 22 | Lead Lists & Segments | `/app/sales/lists` | `lead.lifecycle, deal, client onboarding (linked projections)` | Maintain company/contact/list; add eligible leads to frozen audience | Scoped CRM commands; entity merge is audited |
| 23 | Outreach Dashboard | `/app/outreach` | `outreach.campaign, outreach.recipient` | Create/edit/approve/schedule/run/pause/cancel campaign; version sequence/template | Launch restricted to R01/R02/R03 |
| 24 | Campaigns | `/app/outreach/campaigns` | `outreach.campaign, outreach.recipient` | Create/edit/approve/schedule/run/pause/cancel campaign; version sequence/template | Launch restricted to R01/R02/R03 |
| 25 | Campaign Detail | `/app/outreach/campaigns/[campaignId]` | `outreach.campaign, outreach.recipient` | Create/edit/approve/schedule/run/pause/cancel campaign; version sequence/template | Launch restricted to R01/R02/R03 |
| 26 | Sequence Builder | `/app/outreach/sequences/[sequenceId]` | `outreach.campaign, outreach.recipient` | Create/edit/approve/schedule/run/pause/cancel campaign; version sequence/template | Launch restricted to R01/R02/R03 |
| 27 | Email Templates | `/app/outreach/templates` | `outreach.campaign, outreach.recipient` | Create/edit/approve/schedule/run/pause/cancel campaign; version sequence/template | Launch restricted to R01/R02/R03 |
| 28 | Sending Accounts | `/app/outreach/sending-accounts` | `outreach.campaign, outreach.recipient` | Create/edit/approve/schedule/run/pause/cancel campaign; version sequence/template | Launch restricted to R01/R02/R03 |
| 29 | Replies / Response Queue | `/app/outreach/replies` | `outreach.recipient, lead.lifecycle, conversation.lifecycle, deal` | Classify reply; stop sequence; reply; create follow-up/deal | Assigned Sales; positive reply stops automation |
| 30 | Reply Detail | `/app/outreach/replies/[replyId]` | `outreach.recipient, lead.lifecycle, conversation.lifecycle, deal` | Classify reply; stop sequence; reply; create follow-up/deal | Assigned Sales; positive reply stops automation |
| 31 | Inbox | `/app/inbox` | `conversation.lifecycle` | Assign/reply/archive/resolve/reopen; link authorized entity | Mailbox and record scope |
| 32 | Conversation Detail | `/app/inbox/thread/[threadId]` | `conversation.lifecycle` | Assign/reply/archive/resolve/reopen; link authorized entity | Mailbox and record scope |
| 33 | Meetings & Calls | `/app/communications/meetings` | `meeting.lifecycle` | Propose/schedule/confirm/reschedule/complete/cancel/no-show | Attendee/owner scope; immutable reschedule history |
| 34 | Meeting Detail | `/app/communications/meetings/[meetingId]` | `meeting.lifecycle` | Propose/schedule/confirm/reschedule/complete/cancel/no-show | Attendee/owner scope; immutable reschedule history |
| 35 | Deal Pipeline | `/app/deals/pipeline` | `sales.deal` | Advance/backtrack/hold/win/lose/disqualify; assign owner | Stage guards and commercial gate required |
| 36 | Deal Detail | `/app/deals/[dealId]` | `sales.deal` | Advance/backtrack/hold/win/lose/disqualify; assign owner | Stage guards and commercial gate required |
| 37 | Deals List | `/app/deals` | `sales.deal` | Advance/backtrack/hold/win/lose/disqualify; assign owner | Stage guards and commercial gate required |
| 38 | Proposals | `/app/deals/proposals` | `sales.proposal, approval.lifecycle` | Version proposal; request/decide review; send/view/accept/decline/expire | Send R01/R02/R03/R04/R06; discounts R01/R02/R03/R15 |
| 39 | Proposal Detail / Builder | `/app/deals/proposals/[proposalId]` | `sales.proposal, approval.lifecycle` | Version proposal; request/decide review; send/view/accept/decline/expire | Send R01/R02/R03/R04/R06; discounts R01/R02/R03/R15 |
| 40 | Proposal Preview & Approval | `/app/deals/proposals/[proposalId]/review` | `sales.proposal, approval.lifecycle` | Version proposal; request/decide review; send/view/accept/decline/expire | Send R01/R02/R03/R04/R06; discounts R01/R02/R03/R15 |
| 41 | Clients | `/app/clients` | `client.onboarding, portal.invitation, project.lifecycle (summary)` | Convert/link client; assign AM; invite/revoke portal; advance onboarding dependencies | Own/assigned clients; portal provisioning R01/R02/R06/R16 |
| 42 | Client 360 | `/app/clients/[clientId]` | `client.onboarding, portal.invitation, project.lifecycle (summary)` | Convert/link client; assign AM; invite/revoke portal; advance onboarding dependencies | Own/assigned clients; portal provisioning R01/R02/R06/R16 |
| 43 | Client Contacts | `/app/clients/[clientId]/contacts` | `client.onboarding, portal.invitation, project.lifecycle (summary)` | Convert/link client; assign AM; invite/revoke portal; advance onboarding dependencies | Own/assigned clients; portal provisioning R01/R02/R06/R16 |
| 44 | Client Portal Access | `/app/clients/[clientId]/portal-access` | `client.onboarding, portal.invitation, project.lifecycle (summary)` | Convert/link client; assign AM; invite/revoke portal; advance onboarding dependencies | Own/assigned clients; portal provisioning R01/R02/R06/R16 |
| 45 | Contracts | `/app/commercial/contracts` | `commercial.contract, approval.lifecycle` | Version/review/approve/send/view/sign/activate/void/terminate | Create/send R01/R02/R03/R15; signed version immutable |
| 46 | Contract Detail / Editor | `/app/commercial/contracts/[contractId]` | `commercial.contract, approval.lifecycle` | Version/review/approve/send/view/sign/activate/void/terminate | Create/send R01/R02/R03/R15; signed version immutable |
| 47 | Signature Tracking | `/app/commercial/contracts/[contractId]/signatures` | `commercial.contract, approval.lifecycle` | Version/review/approve/send/view/sign/activate/void/terminate | Create/send R01/R02/R03/R15; signed version immutable |
| 48 | Invoices | `/app/commercial/invoices` | `finance.invoice, finance.payment` | Approve/send/open invoice; record/verify payment; retry/refund/void through finance command | Finance mutation R01/R02/R15; provider evidence append-only |
| 49 | Invoice Detail | `/app/commercial/invoices/[invoiceId]` | `finance.invoice, finance.payment` | Approve/send/open invoice; record/verify payment; retry/refund/void through finance command | Finance mutation R01/R02/R15; provider evidence append-only |
| 50 | Payments | `/app/commercial/payments` | `finance.invoice, finance.payment` | Approve/send/open invoice; record/verify payment; retry/refund/void through finance command | Finance mutation R01/R02/R15; provider evidence append-only |
| 51 | Payment Detail | `/app/commercial/payments/[paymentId]` | `finance.invoice, finance.payment` | Approve/send/open invoice; record/verify payment; retry/refund/void through finance command | Finance mutation R01/R02/R15; provider evidence append-only |
| 52 | Products & Packages | `/app/commercial/packages` | `package policy configuration` | Create/version/archive package and commercial/production gates | Authorized Admin/Finance/Ops; no lifecycle status invented |
| 53 | Projects | `/app/projects` | `project.lifecycle, workflow.instance, stage.run, task.lifecycle` | Create/plan/activate; advance/reopen/block/skip stage; assign/complete task | Project/team scope; skips and reopen require policy/reason |
| 54 | Project Creation / Setup | `/app/projects/new` | `project.lifecycle, workflow.instance, stage.run, task.lifecycle` | Create/plan/activate; advance/reopen/block/skip stage; assign/complete task | Project/team scope; skips and reopen require policy/reason |
| 55 | Project Detail | `/app/projects/[projectId]` | `project.lifecycle, workflow.instance, stage.run, task.lifecycle` | Create/plan/activate; advance/reopen/block/skip stage; assign/complete task | Project/team scope; skips and reopen require policy/reason |
| 56 | Project Workflow Board | `/app/projects/[projectId]/workflow` | `project.lifecycle, workflow.instance, stage.run, task.lifecycle` | Create/plan/activate; advance/reopen/block/skip stage; assign/complete task | Project/team scope; skips and reopen require policy/reason |
| 57 | Project Timeline / Activity | `/app/projects/[projectId]/activity` | `project.lifecycle, workflow.instance, stage.run, task.lifecycle` | Create/plan/activate; advance/reopen/block/skip stage; assign/complete task | Project/team scope; skips and reopen require policy/reason |
| 58 | Project Tasks | `/app/projects/[projectId]/tasks` | `project.lifecycle, workflow.instance, stage.run, task.lifecycle` | Create/plan/activate; advance/reopen/block/skip stage; assign/complete task | Project/team scope; skips and reopen require policy/reason |
| 59 | Project Files | `/app/projects/[projectId]/files` | `project.lifecycle, workflow.instance, stage.run, task.lifecycle` | Create/plan/activate; advance/reopen/block/skip stage; assign/complete task | Project/team scope; skips and reopen require policy/reason |
| 60 | Workflow Template Library | `/app/workflows` | `project.lifecycle, workflow.instance, stage.run, task.lifecycle` | Create/plan/activate; advance/reopen/block/skip stage; assign/complete task | Project/team scope; skips and reopen require policy/reason |
| 61 | Editorial Dashboard | `/app/editorial` | `editorial.production, questionnaire.lifecycle, draft.review, approval.lifecycle` | Advance editorial stages; send questionnaire; version/revise draft; request/decide review | Writer cannot self-publish; Editor/EIC approval separation |
| 62 | Editorial Pipeline | `/app/editorial/pipeline` | `editorial.production, questionnaire.lifecycle, draft.review, approval.lifecycle` | Advance editorial stages; send questionnaire; version/revise draft; request/decide review | Writer cannot self-publish; Editor/EIC approval separation |
| 63 | Questionnaires | `/app/editorial/questionnaires` | `editorial.production, questionnaire.lifecycle, draft.review, approval.lifecycle` | Advance editorial stages; send questionnaire; version/revise draft; request/decide review | Writer cannot self-publish; Editor/EIC approval separation |
| 64 | Questionnaire Builder & Responses | `/app/editorial/questionnaires/[questionnaireId]` | `editorial.production, questionnaire.lifecycle, draft.review, approval.lifecycle` | Advance editorial stages; send questionnaire; version/revise draft; request/decide review | Writer cannot self-publish; Editor/EIC approval separation |
| 65 | Drafts | `/app/editorial/drafts` | `editorial.production, questionnaire.lifecycle, draft.review, approval.lifecycle` | Advance editorial stages; send questionnaire; version/revise draft; request/decide review | Writer cannot self-publish; Editor/EIC approval separation |
| 66 | Draft Workspace | `/app/editorial/drafts/[draftId]` | `editorial.production, questionnaire.lifecycle, draft.review, approval.lifecycle` | Advance editorial stages; send questionnaire; version/revise draft; request/decide review | Writer cannot self-publish; Editor/EIC approval separation |
| 67 | Internal Editorial Review | `/app/editorial/reviews/[reviewId]` | `editorial.production, questionnaire.lifecycle, draft.review, approval.lifecycle` | Advance editorial stages; send questionnaire; version/revise draft; request/decide review | Writer cannot self-publish; Editor/EIC approval separation |
| 68 | Editorial Approval Queue | `/app/editorial/approvals` | `editorial.production, questionnaire.lifecycle, draft.review, approval.lifecycle` | Advance editorial stages; send questionnaire; version/revise draft; request/decide review | Writer cannot self-publish; Editor/EIC approval separation |
| 69 | Magazine Studio Dashboard | `/app/magazine` | `magazine.production, approval.lifecycle, asset.lifecycle, publication.lifecycle` | Advance cover/layout/proof/reader stages; version/approve assets and designs; prepare publication | Designer cannot self-approve; client review explicit |
| 70 | Magazine Projects / Issues | `/app/magazine/projects` | `magazine.production, approval.lifecycle, asset.lifecycle, publication.lifecycle` | Advance cover/layout/proof/reader stages; version/approve assets and designs; prepare publication | Designer cannot self-approve; client review explicit |
| 71 | Cover Pipeline | `/app/magazine/covers` | `magazine.production, approval.lifecycle, asset.lifecycle, publication.lifecycle` | Advance cover/layout/proof/reader stages; version/approve assets and designs; prepare publication | Designer cannot self-approve; client review explicit |
| 72 | Cover Workspace | `/app/magazine/covers/[coverId]` | `magazine.production, approval.lifecycle, asset.lifecycle, publication.lifecycle` | Advance cover/layout/proof/reader stages; version/approve assets and designs; prepare publication | Designer cannot self-approve; client review explicit |
| 73 | Magazine Page Design Workspace | `/app/magazine/projects/[projectId]/layout` | `magazine.production, approval.lifecycle, asset.lifecycle, publication.lifecycle` | Advance cover/layout/proof/reader stages; version/approve assets and designs; prepare publication | Designer cannot self-approve; client review explicit |
| 74 | Magazine Proofing & Final Review | `/app/magazine/projects/[projectId]/proof` | `magazine.production, approval.lifecycle, asset.lifecycle, publication.lifecycle` | Advance cover/layout/proof/reader stages; version/approve assets and designs; prepare publication | Designer cannot self-approve; client review explicit |
| 75 | Digital Reader Build & Preview | `/app/magazine/projects/[projectId]/reader-build` | `magazine.production, approval.lifecycle, asset.lifecycle, publication.lifecycle` | Advance cover/layout/proof/reader stages; version/approve assets and designs; prepare publication | Designer cannot self-approve; client review explicit |
| 76 | Podcast Studio Dashboard | `/app/podcasts` | `podcast.production, meeting.lifecycle, asset.lifecycle, approval.lifecycle` | Invite/onboard/schedule/record/edit/review/approve guest episode | Producer assignment; guest/client sees shared versions only |
| 77 | Podcast Guest Pipeline | `/app/podcasts/guests` | `podcast.production, meeting.lifecycle, asset.lifecycle, approval.lifecycle` | Invite/onboard/schedule/record/edit/review/approve guest episode | Producer assignment; guest/client sees shared versions only |
| 78 | Podcast Episodes | `/app/podcasts/episodes` | `podcast.production, meeting.lifecycle, asset.lifecycle, approval.lifecycle` | Invite/onboard/schedule/record/edit/review/approve guest episode | Producer assignment; guest/client sees shared versions only |
| 79 | Podcast Episode Production | `/app/podcasts/episodes/[episodeId]` | `podcast.production, meeting.lifecycle, asset.lifecycle, approval.lifecycle` | Invite/onboard/schedule/record/edit/review/approve guest episode | Producer assignment; guest/client sees shared versions only |
| 80 | Podcast Recording Schedule | `/app/podcasts/recordings` | `podcast.production, meeting.lifecycle, asset.lifecycle, approval.lifecycle` | Invite/onboard/schedule/record/edit/review/approve guest episode | Producer assignment; guest/client sees shared versions only |
| 81 | Podcast Audio Review | `/app/podcasts/episodes/[episodeId]/review` | `podcast.production, meeting.lifecycle, asset.lifecycle, approval.lifecycle` | Invite/onboard/schedule/record/edit/review/approve guest episode | Producer assignment; guest/client sees shared versions only |
| 82 | Video Studio Dashboard | `/app/videos` | `video.production, meeting.lifecycle, asset.lifecycle, approval.lifecycle` | Brief/script/schedule shoot/edit/review/approve/prepare metadata | Producer assignment; exact approved media version |
| 83 | Video Projects | `/app/videos/projects` | `video.production, meeting.lifecycle, asset.lifecycle, approval.lifecycle` | Brief/script/schedule shoot/edit/review/approve/prepare metadata | Producer assignment; exact approved media version |
| 84 | Video Production Workspace | `/app/videos/projects/[videoId]` | `video.production, meeting.lifecycle, asset.lifecycle, approval.lifecycle` | Brief/script/schedule shoot/edit/review/approve/prepare metadata | Producer assignment; exact approved media version |
| 85 | Video Shoot Schedule | `/app/videos/shoots` | `video.production, meeting.lifecycle, asset.lifecycle, approval.lifecycle` | Brief/script/schedule shoot/edit/review/approve/prepare metadata | Producer assignment; exact approved media version |
| 86 | Video Review | `/app/videos/projects/[videoId]/review` | `video.production, meeting.lifecycle, asset.lifecycle, approval.lifecycle` | Brief/script/schedule shoot/edit/review/approve/prepare metadata | Producer assignment; exact approved media version |
| 87 | Video Publish Prep | `/app/videos/projects/[videoId]/publish-prep` | `video.production, meeting.lifecycle, asset.lifecycle, approval.lifecycle` | Brief/script/schedule shoot/edit/review/approve/prepare metadata | Producer assignment; exact approved media version |
| 88 | Events Operations Dashboard | `/app/events` | `event.lifecycle, event.speaker, event.registration, project.lifecycle` | Plan event; progress speakers/agenda; open registration; check in/complete | Events scope; cancellations/refunds via governed commands |
| 89 | Events | `/app/events/list` | `event.lifecycle, event.speaker, event.registration, project.lifecycle` | Plan event; progress speakers/agenda; open registration; check in/complete | Events scope; cancellations/refunds via governed commands |
| 90 | Event Operations Detail | `/app/events/[eventId]` | `event.lifecycle, event.speaker, event.registration, project.lifecycle` | Plan event; progress speakers/agenda; open registration; check in/complete | Events scope; cancellations/refunds via governed commands |
| 91 | Speaker / Partner Pipeline | `/app/events/[eventId]/participants` | `event.lifecycle, event.speaker, event.registration, project.lifecycle` | Plan event; progress speakers/agenda; open registration; check in/complete | Events scope; cancellations/refunds via governed commands |
| 92 | Agenda Builder | `/app/events/[eventId]/agenda` | `event.lifecycle, event.speaker, event.registration, project.lifecycle` | Plan event; progress speakers/agenda; open registration; check in/complete | Events scope; cancellations/refunds via governed commands |
| 93 | Event Registrations | `/app/events/[eventId]/registrations` | `event.lifecycle, event.speaker, event.registration, project.lifecycle` | Plan event; progress speakers/agenda; open registration; check in/complete | Events scope; cancellations/refunds via governed commands |
| 94 | Publishing Dashboard | `/app/publishing` | `publication.lifecycle, publication.job, approval.lifecycle` | Validate/approve/schedule/publish/retry/unpublish/correct | Publish R01/R02/R07/R14; approved manifest required |
| 95 | Publication Queue | `/app/publishing/queue` | `publication.lifecycle, publication.job, approval.lifecycle` | Validate/approve/schedule/publish/retry/unpublish/correct | Publish R01/R02/R07/R14; approved manifest required |
| 96 | Publication Detail | `/app/publishing/[publicationId]` | `publication.lifecycle, publication.job, approval.lifecycle` | Validate/approve/schedule/publish/retry/unpublish/correct | Publish R01/R02/R07/R14; approved manifest required |
| 97 | Publishing Schedule | `/app/publishing/schedule` | `publication.lifecycle, publication.job, approval.lifecycle` | Validate/approve/schedule/publish/retry/unpublish/correct | Publish R01/R02/R07/R14; approved manifest required |
| 98 | Distribution Dashboard | `/app/distribution` | `distribution.campaign, distribution.item, report.metric` | Prepare/approve/schedule/run/retry channel item; inspect verified performance | Launch R01/R02/R14; provider evidence retained |
| 99 | Distribution Campaigns | `/app/distribution/campaigns` | `distribution.campaign, distribution.item, report.metric` | Prepare/approve/schedule/run/retry channel item; inspect verified performance | Launch R01/R02/R14; provider evidence retained |
| 100 | Distribution Campaign Detail | `/app/distribution/campaigns/[campaignId]` | `distribution.campaign, distribution.item, report.metric` | Prepare/approve/schedule/run/retry channel item; inspect verified performance | Launch R01/R02/R14; provider evidence retained |
| 101 | Channel Performance | `/app/distribution/performance` | `distribution.campaign, distribution.item, report.metric` | Prepare/approve/schedule/run/retry channel item; inspect verified performance | Launch R01/R02/R14; provider evidence retained |
| 102 | Reports | `/app/reports` | `report.lifecycle, delivery.pack, report.metric` | Collect/freeze/review/approve/deliver/supersede report | Verified cutoff/source; client-safe version only |
| 103 | Client Report Builder | `/app/reports/new?client={id}` | `report.lifecycle, delivery.pack, report.metric` | Collect/freeze/review/approve/deliver/supersede report | Verified cutoff/source; client-safe version only |
| 104 | Client Report Detail | `/app/reports/[reportId]` | `report.lifecycle, delivery.pack, report.metric` | Collect/freeze/review/approve/deliver/supersede report | Verified cutoff/source; client-safe version only |
| 105 | Renewal Pipeline | `/app/renewals` | `renewal.lifecycle, sales.deal` | Review due renewal; create opportunity; outreach/propose/negotiate/renew/defer/lose | AM/Sales scope; renewal links successor deal/project |
| 106 | Renewal Opportunity Detail | `/app/renewals/[renewalId]` | `renewal.lifecycle, sales.deal` | Review due renewal; create opportunity; outreach/propose/negotiate/renew/defer/lose | AM/Sales scope; renewal links successor deal/project |
| 107 | Approval Center | `/app/approvals` | `approval.lifecycle` | Request/open/approve/request changes/reject/cancel/supersede | Assigned approver + scope + SoD; immutable decision |
| 108 | Approval Detail | `/app/approvals/[approvalId]` | `approval.lifecycle` | Request/open/approve/request changes/reject/cancel/supersede | Assigned approver + scope + SoD; immutable decision |
| 109 | Tasks | `/app/tasks` | `task.lifecycle` | Create/assign/start/block/review/complete/reopen/cancel | Assignment/manager scope |
| 110 | Task Detail | `/app/tasks/[taskId]` | `task.lifecycle` | Create/assign/start/block/review/complete/reopen/cancel | Assignment/manager scope |
| 111 | Calendar | `/app/calendar` | `meeting, task, project, event, recording, shoot, publication schedule projections` | Create/open/reschedule through owning aggregate | Calendar is projection, not state authority |
| 112 | Files & Assets | `/app/files` | `asset.lifecycle, asset.rights, approval.lifecycle` | Upload/process/review/approve/reject/replace/archive; request approval | Version and rights history immutable |
| 113 | File Detail / Versions | `/app/files/[fileId]` | `asset.lifecycle, asset.rights, approval.lifecycle` | Upload/process/review/approve/reject/replace/archive; request approval | Version and rights history immutable |
| 114 | Team Directory | `/app/admin/team` | `identity.access, policy/configuration, audit projection` | Invite/deactivate/assign role or department; configure; inspect audit/integration health | R01/R02/R16 as applicable; roles R01/R02; hard delete R01 |
| 115 | Employee Detail | `/app/admin/team/[userId]` | `identity.access, policy/configuration, audit projection` | Invite/deactivate/assign role or department; configure; inspect audit/integration health | R01/R02/R16 as applicable; roles R01/R02; hard delete R01 |
| 116 | Departments & Capacity | `/app/admin/departments` | `identity.access, policy/configuration, audit projection` | Invite/deactivate/assign role or department; configure; inspect audit/integration health | R01/R02/R16 as applicable; roles R01/R02; hard delete R01 |
| 117 | Roles & Permission Matrix | `/app/admin/roles` | `identity.access, policy/configuration, audit projection` | Invite/deactivate/assign role or department; configure; inspect audit/integration health | R01/R02/R16 as applicable; roles R01/R02; hard delete R01 |
| 118 | Audit Logs | `/app/admin/audit-logs` | `identity.access, policy/configuration, audit projection` | Invite/deactivate/assign role or department; configure; inspect audit/integration health | R01/R02/R16 as applicable; roles R01/R02; hard delete R01 |
| 119 | Integrations | `/app/admin/integrations` | `identity.access, policy/configuration, audit projection` | Invite/deactivate/assign role or department; configure; inspect audit/integration health | R01/R02/R16 as applicable; roles R01/R02; hard delete R01 |
| 120 | Organization & System Settings | `/app/admin/settings` | `identity.access, policy/configuration, audit projection` | Invite/deactivate/assign role or department; configure; inspect audit/integration health | R01/R02/R16 as applicable; roles R01/R02; hard delete R01 |
| 121 | Client Sign In | `/client/login` | `identity.access, portal.invitation` | Client sign-in/activate/recover | Own invitation/session only |
| 122 | Client Portal Activation | `/client/activate/[token]` | `identity.access, portal.invitation` | Client sign-in/activate/recover | Own invitation/session only |
| 123 | Client Access Recovery | `/client/recover-access` | `identity.access, portal.invitation` | Client sign-in/activate/recover | Own invitation/session only |
| 124 | Client Dashboard | `/client` | `client-safe project, task, approval, contract, invoice, publication, report projections` | Open or execute eligible client action on destination aggregate | R17 own client organization only |
| 125 | My Projects | `/client/projects` | `project.lifecycle, stage.run, activity projection` | View client-safe progress; open/complete allowed action | R17 own project + CLIENT_SHARED only |
| 126 | Client Project Detail | `/client/projects/[projectId]` | `project.lifecycle, stage.run, activity projection` | View client-safe progress; open/complete allowed action | R17 own project + CLIENT_SHARED only |
| 127 | Project Timeline / Activity | `/client/projects/[projectId]/timeline` | `project.lifecycle, stage.run, activity projection` | View client-safe progress; open/complete allowed action | R17 own project + CLIENT_SHARED only |
| 128 | Messages | `/client/messages` | `conversation.lifecycle` | Start/reply/attach on shared thread | R17 own organization/thread; internal notes excluded |
| 129 | Message Thread | `/client/messages/[threadId]` | `conversation.lifecycle` | Start/reply/attach on shared thread | R17 own organization/thread; internal notes excluded |
| 130 | Tasks & Requests | `/client/tasks` | `task.lifecycle` | Start/complete/reopen permitted client task; upload requested item | Client assignee + CLIENT_SHARED |
| 131 | Questionnaires | `/client/questionnaires` | `questionnaire.lifecycle` | Save draft; submit; resubmit after requested changes | Exact submission snapshots preserved |
| 132 | Questionnaire Detail | `/client/questionnaires/[questionnaireId]` | `questionnaire.lifecycle` | Save draft; submit; resubmit after requested changes | Exact submission snapshots preserved |
| 133 | Drafts | `/client/drafts` | `draft.review, approval.lifecycle` | Comment; request changes; approve exact shared draft version | Authorized client approver; no internal comments |
| 134 | Draft Review | `/client/drafts/[draftId]` | `draft.review, approval.lifecycle` | Comment; request changes; approve exact shared draft version | Authorized client approver; no internal comments |
| 135 | Designs | `/client/designs` | `asset/design version, approval.lifecycle` | Compare/comment; request changes; approve exact proof | Authorized client approver; superseded version blocked |
| 136 | Design Review | `/client/designs/[designId]` | `asset/design version, approval.lifecycle` | Compare/comment; request changes; approve exact proof | Authorized client approver; superseded version blocked |
| 137 | Assets | `/client/assets` | `asset.lifecycle, asset.rights` | Upload/replace/label/confirm rights | Own project + CLIENT_SHARED; prior versions retained |
| 138 | Approvals | `/client/approvals` | `approval.lifecycle` | Approve/request changes/comment on active request | R17 own client/project; exact version and active request |
| 139 | Media Projects | `/client/media` | `podcast/video/event production, approval.lifecycle, meeting.lifecycle` | Confirm details/schedule; upload; review/approve shared media | Client-safe stages only |
| 140 | Media Project Detail | `/client/media/[projectId]` | `podcast/video/event production, approval.lifecycle, meeting.lifecycle` | Confirm details/schedule; upload; review/approve shared media | Client-safe stages only |
| 141 | Contracts | `/client/contracts` | `commercial.contract` | View/sign/decline/download exact contract version | Authorized signer only; provider evidence immutable |
| 142 | Contract Detail & Sign | `/client/contracts/[contractId]` | `commercial.contract` | View/sign/decline/download exact contract version | Authorized signer only; provider evidence immutable |
| 143 | Invoices & Payments | `/client/billing` | `finance.invoice, finance.payment` | View/pay/retry/download receipt; open support | Authorized billing user; no internal margin/ledger fields |
| 144 | Invoice / Payment Detail | `/client/billing/[invoiceId]` | `finance.invoice, finance.payment` | View/pay/retry/download receipt; open support | Authorized billing user; no internal margin/ledger fields |
| 145 | Publishing & Live Links | `/client/publishing` | `publication.lifecycle` | View/open/copy verified published URL | Client-safe published records only |
| 146 | Distribution | `/client/distribution` | `distribution.campaign, distribution.item` | View verified client-safe channel status and URLs | No internal campaign configuration |
| 147 | Reports & Downloads | `/client/reports` | `report.lifecycle, delivery.pack` | View/acknowledge/download delivered artifacts | Exact client-ready/delivered versions |
| 148 | Renewals & New Opportunities | `/client/renewals` | `renewal.lifecycle` | Request renewal/proposal/discussion | Client request emits event; staff owns commercial transition |
| 149 | Client Notifications | `/client/notifications` | `notification.delivery` | Mark read/open/update own subset | Own notifications only |
| 150 | Support Requests | `/client/support` | `support.ticket` | Create/triage-by-system/reply/resolve/reopen/close own ticket | Own client organization; internal notes excluded |
| 151 | Profile & Organization Settings | `/client/settings` | `identity.access, portal membership/preferences` | Update own profile/password/preferences; limited org membership action | Own identity; client admin subset only |

## 3. Coverage by shell

| Shell | Screen range | Coverage | Workflow rule |
|---|---:|---:|---|
| Staff access + Team workspace | 1–120 | 120/120 | Phase 2B role, scope, assignment, workflow stage, field visibility and approval authority all apply. |
| Client portal | 121–151 | 31/31 | Client organization, project membership and `CLIENT_SHARED` visibility all apply. |
| **Total** | **1–151** | **151/151** | No route-local status enum is permitted. |

## 4. Shared component/state requirements

1. `StateBadge` accepts only canonical machine keys and states from the master registry.
2. `TransitionAction` is returned from the command-capability API; hiding a button is not authorization.
3. `ApprovalPanel` always renders target version, request status, decision history, due/SLA and client visibility.
4. `ActivityTimeline` combines domain history and safe activity projection; Client Portal serializers exclude internal evidence.
5. `FailureBanner` distinguishes validation, authorization, stale version, policy gate, dependency, provider and retryable failures.
6. `SlaIndicator` uses stored policy/version/due time and business calendar, never a client-side hard-coded duration.
7. `VersionPicker` identifies approved, superseded, signed, published and current working versions without mutation.

## 5. Freeze assertion

The screen numbers, names and exact routes above are derived from the frozen Phase 2A route map. All 151 are mapped exactly once. Any future screen must reference an existing machine or introduce a separately reviewed Phase 2D change; it may not add a status locally.

