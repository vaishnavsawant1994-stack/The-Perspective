# Phase 2C — 151-Screen Entity Read/Write Map

**Source:** Phase 2A route matrix  
**Rule:** “Writes” means the entities whose commands may be invoked from the screen. Authorization still comes from Phase 2B. Derived KPIs and search documents are read models, never independent business truth.

## Mapping conventions

- `R` = canonical reads or authorized projections.
- `W` = aggregate roots/events mutated through commands.
- Cross-cutting writes such as audit and outbox are shown when central to the screen; all sensitive mutations write them regardless.
- Client screens read `CLIENT_SHARED` projections filtered by authenticated `client_organization_id` and project membership.
- Names below omit logical schema prefixes for readability; they are defined in the Entity Catalog.

## 1–10 — Staff identity and workspace core

| # | Screen / route | Reads | Writes |
|---:|---|---|---|
| 1 | Staff Sign In `/app/login` | `UserAccount`, `UserIdentity`, `OrganizationMembership` | `Session`, `AuditEvent` |
| 2 | MFA `/app/mfa` | `Session`, `MfaMethod` | `Session`, `AuditEvent` |
| 3 | Accept Staff Invite `/app/invite/[token]` | `Invitation`, `Organization`, `Role` | `UserAccount`, `Person`, `OrganizationMembership`, `MembershipRole`, `Invitation`, `AuditEvent` |
| 4 | Staff Profile Setup `/app/onboarding/profile` | `Person`, `OrganizationMembership`, `Department`, `NotificationPreference` | `Person`, `EmployeeProfile`, `OrganizationMembership`, `Asset`, `NotificationPreference` |
| 5 | Staff Access Recovery `/app/recover-access` | `UserAccount`, recovery token projection | `UserIdentity`, `Session`, `AuditEvent` |
| 6 | Access Denied `/app/access-denied` | `MembershipRole`, `RolePermission`, `RecordAssignment`, requested `Resource` | Optional `SupportTicket` or access-request `Task` |
| 7 | Executive Dashboard `/app` | `Deal`, `Invoice`, `Payment`, `Project`, `Task`, `WorkflowInstance`, `EmployeeProfile`, `Report`, `MetricObservation`, `Notification` | Dashboard preference only |
| 8 | My Work `/app/my-work` | `RecordAssignment`, `Task`, `ApprovalRequest`, `Meeting`, `Deal`, `Project`, `Conversation`, `Notification` | `Task`, `Notification`, personal view preference |
| 9 | Global Search `/app/search?q={query}` | permission-filtered projections of `Resource`, CRM, commercial, delivery, content, assets, reports | Search history/preference only |
| 10 | Staff Notifications `/app/notifications` | `Notification`, linked `Resource` | `Notification` read/dismiss state, `NotificationPreference` |

## 11–22 — Lead discovery, extraction, and CRM

| # | Screen / route | Reads | Writes |
|---:|---|---|---|
| 11 | Lead Finder `/app/sales/lead-finder` | `LeadSource`, `Company`, `Contact`, `Lead`, `SuppressionEntry` | `ExtractionJob`, saved search/filter, `AuditEvent` for export |
| 12 | Data Sources `/app/sales/data-sources` | `LeadSource`, `IntegrationConnection`, `AuditEvent` | `LeadSource`, `IntegrationConnection` |
| 13 | Extraction Jobs `/app/sales/extractions` | `ExtractionJob`, `LeadSource`, `StagedRecord` counts | `ExtractionJob`, `AutomationRun` retry/cancel |
| 14 | Extraction Review `/app/sales/extractions/[jobId]` | `ExtractionJob`, `StagedRecord`, `DuplicateCandidate`, `Company`, `Contact`, `Lead` | `StagedRecord`, `Company`, `Contact`, `Lead`, merge decision, `AuditEvent` |
| 15 | Enrichment Queue `/app/sales/enrichment` | `EnrichmentJob`, `EnrichmentFact`, target `Resource` | `EnrichmentJob`, accepted `EnrichmentFact`, target `Company`/`Contact`/`Lead` |
| 16 | Leads `/app/sales/leads` | `Lead`, `Company`, `Contact`, `LeadScore`, `ActivityEvent`, `RecordAssignment` | `Lead`, `RecordAssignment`, `LeadListMember` |
| 17 | Lead Detail `/app/sales/leads/[leadId]` | `Lead`, `Company`, `Contact`, `LeadScore`, `Qualification`, `Conversation`, `Meeting`, `Task`, `ActivityEvent` | `Lead`, `Qualification`, `RecordAssignment`, `Task`, `Comment`, `Deal` conversion |
| 18 | Companies `/app/sales/companies` | `Company`, `Contact`, `Lead`, `Deal`, `ClientAccount` | `Company`, merge/assignment records |
| 19 | Company Detail `/app/sales/companies/[companyId]` | `Company`, `Contact`, `Lead`, `Deal`, `ClientAccount`, `Project`, `ActivityEvent` | `Company`, `Contact`, `Comment`, `RecordAssignment`, merge decision |
| 20 | Contacts `/app/sales/contacts` | `Contact`, `Person`, `Company`, `Conversation`, `RecordAssignment` | `Person`, `Contact`, `RecordAssignment`, merge decision |
| 21 | Contact Detail `/app/sales/contacts/[contactId]` | `Person`, `Contact`, `Company`, `Conversation`, `Message`, `Meeting`, `Deal`, `Project`, `ActivityEvent` | `Contact`, `Person`, `Meeting`, `Task`, `Comment`, consent/suppression records |
| 22 | Lead Lists & Segments `/app/sales/lists` | `LeadList`, `LeadListMember`, `Lead`, `LeadScore` | `LeadList`, `LeadListMember` |

## 23–34 — Outreach, inbox, and communication

| # | Screen / route | Reads | Writes |
|---:|---|---|---|
| 23 | Outreach Dashboard `/app/outreach` | `OutreachCampaign`, `CampaignRecipient`, `MessageDelivery`, `SendingAccount`, reply metrics | Dashboard filter/preference only |
| 24 | Campaigns `/app/outreach/campaigns` | `OutreachCampaign`, `LeadList`, `Sequence`, `SendingAccount`, metrics | `OutreachCampaign` draft/archive, assignment |
| 25 | Campaign Detail `/app/outreach/campaigns/[campaignId]` | `OutreachCampaign`, `CampaignRecipient`, `SequenceStep`, `MessageDelivery`, `Conversation`, `SuppressionEntry` | `OutreachCampaign`, `CampaignRecipient`, launch/pause `ActivityEvent`/`AuditEvent` |
| 26 | Sequence Builder `/app/outreach/sequences/[sequenceId]` | `Sequence`, `SequenceStep`, `MessageTemplateVersion` | new `Sequence` version, `SequenceStep` |
| 27 | Email Templates `/app/outreach/templates` | `MessageTemplate`, `MessageTemplateVersion`, performance projection | `MessageTemplate`, immutable `MessageTemplateVersion` |
| 28 | Sending Accounts `/app/outreach/sending-accounts` | `SendingAccount`, `IntegrationConnection`, health/sync state | `SendingAccount`, `IntegrationConnection`, `AuditEvent` |
| 29 | Replies Queue `/app/outreach/replies` | `Message`, `Conversation`, `Lead`, `Company`, `OutreachCampaign`, assignment | `Conversation`, `RecordAssignment`, classification, `Task` |
| 30 | Reply Detail `/app/outreach/replies/[replyId]` | `Conversation`, `Message`, `Lead`, `Company`, `CampaignRecipient`, `Task`, `Deal` | `Message`, `Conversation`, `Task`, `Comment`, `Qualification`, `Deal` |
| 31 | Inbox `/app/inbox` | `Conversation`, `ConversationParticipant`, latest `Message`, labels/assignments | `Conversation`, `RecordAssignment`, read/archive state |
| 32 | Conversation Detail `/app/inbox/thread/[threadId]` | `Conversation`, `Message`, `ConversationParticipant`, `Asset`, linked lead/deal/client/project, `Task` | `Message`, `Asset`, `Task`, `Comment`, `RecordAssignment` |
| 33 | Meetings & Calls `/app/communications/meetings` | `Meeting`, `Call`, participants, linked CRM/client/project records | `Meeting`, participants, `CalendarItem` |
| 34 | Meeting Detail `/app/communications/meetings/[meetingId]` | `Meeting`, participants, `MeetingNote`, transcript/recording `Asset`, linked records, `Task` | `Meeting`, `MeetingNote`, `Task`, `AssetLink`, `ActivityEvent` |

## 35–44 — Deals and Client CRM

| # | Screen / route | Reads | Writes |
|---:|---|---|---|
| 35 | Deal Pipeline `/app/deals/pipeline` | `DealPipeline`, `DealStage`, `Deal`, `Company`, `Contact`, `ActivityEvent` | `Deal`, `DealStageHistory`, `Task` |
| 36 | Deal Detail `/app/deals/[dealId]` | `Deal`, `DealProduct`, company/contact, meetings, conversations, proposal, contract, invoice, activity | `Deal`, `DealProduct`, `DealStageHistory`, `Task`, `Comment` |
| 37 | Deals List `/app/deals` | `Deal`, `DealStage`, `Company`, owner/assignment | `Deal`, `RecordAssignment` |
| 38 | Proposals `/app/deals/proposals` | `Proposal`, `ProposalVersion`, `Deal`, `ClientAccount`, approval state | `Proposal`, archive/assignment |
| 39 | Proposal Builder `/app/deals/proposals/[proposalId]` | `Proposal`, `ProposalVersion`, `Deal`, `DealProduct`, `Package`, `ClientAccount`, `ApprovalRequest` | `Proposal`, immutable `ProposalVersion`, `Asset`, `ApprovalRequest` |
| 40 | Proposal Review `/app/deals/proposals/[proposalId]/review` | exact `ProposalVersion`, margin-restricted deal lines, `ApprovalRequest`, decisions | `ApprovalDecision`, `ApprovalOverride`, proposal status, `AuditEvent` |
| 41 | Clients `/app/clients` | `ClientAccount`, `Organization`, relationships, projects, invoices/payments, health/renewal aggregates | `ClientAccount`, assignment/health |
| 42 | Client 360 `/app/clients/[clientId]` | `Organization`, `ClientAccount`, `ClientRelationship`, `Deal`, `Contract`, `Invoice`, `Payment`, `Project`, `Conversation`, `Meeting`, `Asset`, `ApprovalRequest`, `Report`, `RenewalOpportunity`, `ActivityEvent` | `ClientAccount`, `ClientRelationship`, `Comment`, `Task`, `RecordAssignment` |
| 43 | Client Contacts `/app/clients/[clientId]/contacts` | `ClientRelationship`, `Person`, `Contact`, portal membership/preferences | `Person`, `Contact`, `ClientRelationship`, communication preference |
| 44 | Client Portal Access `/app/clients/[clientId]/portal-access` | `OrganizationMembership`, `Invitation`, `ProjectMember`, `MembershipRole`, last session | `Invitation`, `OrganizationMembership`, `MembershipRole`, `ProjectMember`, revoke `Session`, `AuditEvent` |

## 45–52 — Commercial, contracts, and finance

| # | Screen / route | Reads | Writes |
|---:|---|---|---|
| 45 | Contracts `/app/commercial/contracts` | `Contract`, `ContractVersion`, `ClientAccount`, `Deal`, signature status | `Contract`, assignment/archive controls |
| 46 | Contract Editor `/app/commercial/contracts/[contractId]` | `Contract`, versions, signers, signature events, assets, activity | `Contract`, immutable `ContractVersion`, `ContractSigner`, `Asset`, `ApprovalRequest`, `AuditEvent` |
| 47 | Signature Tracking `/app/commercial/contracts/[contractId]/signatures` | `ContractVersion`, `ContractSigner`, `SignatureEvent`, webhook status | resend/void command, `Notification`, `AuditEvent`; provider events write `SignatureEvent` |
| 48 | Invoices `/app/commercial/invoices` | `Invoice`, derived balance, `ClientAccount`, `PaymentAllocation` | `Invoice` draft/archive before issue |
| 49 | Invoice Detail `/app/commercial/invoices/[invoiceId]` | `Invoice`, `InvoiceLine`, `PaymentAllocation`, `Payment`, delivery events/assets | `Invoice`, `InvoiceLine` before issue; issue/send commands, `LedgerTransaction`, `AuditEvent` |
| 50 | Payments `/app/commercial/payments` | `Payment`, allocations, client/invoice, ledger projection | controlled manual `Payment`/allocation under Finance authority |
| 51 | Payment Detail `/app/commercial/payments/[paymentId]` | `Payment`, `PaymentAllocation`, `Refund`, `LedgerEntry`, `WebhookEvent`, invoice/client | `Refund`, `PaymentAllocation`, `LedgerTransaction`, `AuditEvent` |
| 52 | Products & Packages `/app/commercial/packages` | `Product`, `Package` versions | `Product`, immutable/new `Package` version, archive status |

## 53–60 — Projects and workflow engine

| # | Screen / route | Reads | Writes |
|---:|---|---|---|
| 53 | Projects `/app/projects` | `Project`, `ClientAccount`, `WorkflowInstance`, `WorkflowStageRun`, `ProjectMember`, `Task`, health | `Project`, assignment/archive |
| 54 | Project Setup `/app/projects/new` | `ClientAccount`, `Deal`, `Contract`, `Package`, `WorkflowTemplate`, staff capacity | `Project`, `ProjectMember`, `WorkflowInstance`, initial stages/tasks/milestones, `ActivityEvent` |
| 55 | Project Detail `/app/projects/[projectId]` | `Project`, client, members, workflow, milestones, deliverables, tasks, assets, approvals, activity | `Project`, `ProjectMember`, `Milestone`, `Task`, `Comment` |
| 56 | Workflow Board `/app/projects/[projectId]/workflow` | `WorkflowInstance`, stage templates/runs, transition rules, tasks, blockers, automations | `StageTransition`, `WorkflowStageRun`, generated `Task`, `AutomationRun`, `AuditEvent` when override |
| 57 | Project Activity `/app/projects/[projectId]/activity` | `ActivityEvent` and linked `Resource` | visibility correction only under authority; no event overwrite |
| 58 | Project Tasks `/app/projects/[projectId]/tasks` | `Task`, dependency/checklist, assignee, stage/project | `Task`, `TaskDependency`, checklist item, comment |
| 59 | Project Files `/app/projects/[projectId]/files` | `Folder`, `Asset`, `AssetVersion`, rights, links/usages, approvals | `Folder`, `Asset`, immutable `AssetVersion`, `AssetRights`, `AssetLink` |
| 60 | Workflow Templates `/app/workflows` | `WorkflowTemplate`, stage templates, transition rules, automation rules | new template version, stages/rules/automations; archive prior version |

## 61–68 — Editorial Studio

| # | Screen / route | Reads | Writes |
|---:|---|---|---|
| 61 | Editorial Dashboard `/app/editorial` | editorial `Project`, `Deliverable`, `EditorialWork`, drafts/reviews, workflows, deadlines/approvals | preference/filter only |
| 62 | Editorial Pipeline `/app/editorial/pipeline` | `EditorialWork`, `Deliverable`, `WorkflowStageRun`, owner, client, task/blocker | `RecordAssignment`, valid workflow transition |
| 63 | Questionnaires `/app/editorial/questionnaires` | `QuestionnaireInstance`, template, project/client, submission state | `QuestionnaireInstance`, send/remind/cancel, `Notification` |
| 64 | Questionnaire Builder `/app/editorial/questionnaires/[questionnaireId]` | template/schema, instance, draft response, submissions, attachments | new `QuestionnaireTemplate` version, instance, response; never overwrite submission |
| 65 | Drafts `/app/editorial/drafts` | `Draft`, current version, `EditorialWork`, project, owner, review state | `Draft`, assignment/archive |
| 66 | Draft Workspace `/app/editorial/drafts/[draftId]` | `Draft`, versions, research, citations, comments, assets, reviews | immutable `DraftVersion`, `ResearchItem`, `Citation`, `Comment`, current draft pointer |
| 67 | Internal Review `/app/editorial/reviews/[reviewId]` | exact `DraftVersion`, citations, checklist, comments, prior review | `EditorialReview`, `Comment`, `ApprovalDecision`, revision request, `AuditEvent` |
| 68 | Editorial Approval Queue `/app/editorial/approvals` | `ApprovalRequest`, steps, exact target versions, project/client/due state | `ApprovalDecision`, assignment, reminder; override only authorized |

## 69–75 — Magazine Studio

| # | Screen / route | Reads | Writes |
|---:|---|---|---|
| 69 | Magazine Dashboard `/app/magazine` | `MagazineIssue`, project/workflow, covers, pages, proofs, reader builds, assets, approvals | preference/filter only |
| 70 | Magazine Projects `/app/magazine/projects` | `MagazinePublication`, `MagazineIssue`, `Project`, page/cover/proof state | `MagazineIssue`, assignment/archive |
| 71 | Cover Pipeline `/app/magazine/covers` | `CoverConcept`, `DesignVersion`, issue/project, designer, approvals/comments | `CoverConcept`, assignment/status |
| 72 | Cover Workspace `/app/magazine/covers/[coverId]` | concept, immutable design versions, source assets/rights, comments, approvals | `DesignVersion`, `AssetLink`, `Comment`, `ApprovalRequest` |
| 73 | Page Layout `/app/magazine/projects/[projectId]/layout` | `MagazineIssue`, pages, issue stories, design versions, assets/rights, assignments | `MagazinePage`, immutable `DesignVersion`, `IssueStory`, `AssetLink` |
| 74 | Proofing `/app/magazine/projects/[projectId]/proof` | exact `Proof`, included design/content versions, annotations/comments, approvals | immutable `Proof`, `Comment`, `ApprovalRequest`, decisions |
| 75 | Reader Build `/app/magazine/projects/[projectId]/reader-build` | issue/pages, approved versions, text views, assets/rights, navigation, validation | immutable `ReaderBuild`, publication candidate/validation job |

## 76–81 — Podcast Studio

| # | Screen / route | Reads | Writes |
|---:|---|---|---|
| 76 | Podcast Dashboard `/app/podcasts` | `PodcastEpisode`, guests, recording sessions, audio/transcript versions, approvals, schedule | preference/filter only |
| 77 | Guest Pipeline `/app/podcasts/guests` | `PodcastGuest`, `Person`, `Contact`, `Company`, episode/project, conversations/meetings | `PodcastGuest`, invitation `Message`, `Meeting`, task/assignment |
| 78 | Podcast Episodes `/app/podcasts/episodes` | `PodcastShow`, `PodcastEpisode`, guest/producer, workflow and dates | `PodcastEpisode`, assignment/archive |
| 79 | Episode Production `/app/podcasts/episodes/[episodeId]` | episode/show, guest, project/workflow, brief, assets, recording, audio/transcript/artwork, approvals/publication | `PodcastEpisode`, `Task`, `AssetLink`, `RecordingSession`, approval/publication request |
| 80 | Recording Schedule `/app/podcasts/recordings` | `RecordingSession`, episode/guest/producer, calendar/meeting, checklist | `RecordingSession`, `Meeting`, `CalendarItem`, `Task` |
| 81 | Audio Review `/app/podcasts/episodes/[episodeId]/review` | exact `AudioVersion`, waveform asset, transcript, comments, approval request | immutable `AudioVersion`/`TranscriptVersion`, `Comment`, `ApprovalDecision` |

## 82–87 — Video Studio

| # | Screen / route | Reads | Writes |
|---:|---|---|---|
| 82 | Video Dashboard `/app/videos` | `VideoProject`, project/workflow, shoots, versions, assignees, blockers | preference/filter only |
| 83 | Video Projects `/app/videos/projects` | `VideoProject`, client/project, speaker, stage/owner/dates | `VideoProject`, assignment/archive |
| 84 | Video Workspace `/app/videos/projects/[videoId]` | video project, script versions, speakers, shoots, footage/assets, video/thumbnail/caption versions, approvals | `VideoProject`, `ScriptVersion`, `Shoot`, `AssetLink`, `Task`, approval request |
| 85 | Shoot Schedule `/app/videos/shoots` | `Shoot`, video/speakers/crew, calendar/meeting, equipment tasks | `Shoot`, `Meeting`, `CalendarItem`, `Task` |
| 86 | Video Review `/app/videos/projects/[videoId]/review` | exact `VideoVersion`, transcript/captions, comments, approval | immutable `VideoVersion`/`Caption`, `Comment`, `ApprovalDecision` |
| 87 | Publish Prep `/app/videos/projects/[videoId]/publish-prep` | approved final video, thumbnail, captions, metadata, assets/rights, target validation | `ThumbnailVersion`, `Caption`, `Publication`, immutable `PublicationVersion`, validation job |

## 88–93 — Events operations

| # | Screen / route | Reads | Writes |
|---:|---|---|---|
| 88 | Events Dashboard `/app/events` | `Event`, registrations, speakers, partners, tasks, invoices/payments, deadlines | preference/filter only |
| 89 | Events List `/app/events/list` | `Event`, venue, owner, registrations, partners, publication | `Event`, assignment/archive |
| 90 | Event Detail `/app/events/[eventId]` | `Event`, days, venue, agenda, speakers, partners, registrations, tasks, assets, project | `Event`, `Venue`, `EventDay`, `Task`, `AssetLink`, comment |
| 91 | Speaker/Partner Pipeline `/app/events/[eventId]/participants` | `Speaker`, `EventPartner`, people/companies, deals/packages, agreements/assets | `Speaker`, `EventPartner`, message/meeting/task, agreement link |
| 92 | Agenda Builder `/app/events/[eventId]/agenda` | `EventDay`, `AgendaItem`, participants, speakers, rooms, publication state | `AgendaItem`, `AgendaParticipant`, schedule conflict override audit |
| 93 | Registrations `/app/events/[eventId]/registrations` | `Registration`, `Ticket`, `CheckIn`, person/user, payment allocation, consent | `Registration`, `Ticket`, `CheckIn`, refund/payment-link command, notification |

## 94–101 — Publishing and distribution

| # | Screen / route | Reads | Writes |
|---:|---|---|---|
| 94 | Publishing Dashboard `/app/publishing` | `Publication`, versions/jobs/targets/URLs, validation state | preference/filter only |
| 95 | Publication Queue `/app/publishing/queue` | publication candidate, approved deliverable version, target, blockers, schedule, approver | `Publication`, `PublicationVersion`, `Schedule`, queue assignment |
| 96 | Publication Detail `/app/publishing/[publicationId]` | exact publication snapshot, metadata, assets/rights, SEO/route, target, job/history | immutable `PublicationVersion`, `PublishedURL`, publish/unpublish job, `AuditEvent` |
| 97 | Publishing Schedule `/app/publishing/schedule` | `Schedule`, `Publication`, dependencies, owners, `CalendarItem` | `Schedule`, `CalendarItem` |
| 98 | Distribution Dashboard `/app/distribution` | campaigns/items/channels/URLs, verified metrics, client/project | preference/filter only |
| 99 | Distribution Campaigns `/app/distribution/campaigns` | `DistributionCampaign`, publication/project/client, channels, status/performance | `DistributionCampaign`, assignment/archive |
| 100 | Distribution Detail `/app/distribution/campaigns/[campaignId]` | campaign, items, copy/assets, schedules, approvals, URLs, metric observations | `DistributionItem`, `AssetLink`, approval request, schedule/launch job |
| 101 | Channel Performance `/app/distribution/performance` | `MetricDefinition`, `MetricSource`, verified `MetricObservation`, rollup/snapshot, distribution URL/item | report/export request with audit; no raw metric edit |

## 102–106 — Reporting and renewals

| # | Screen / route | Reads | Writes |
|---:|---|---|---|
| 102 | Reports `/app/reports` | `Report`, versions, client/project/period, delivery state | `Report`, assignment/archive |
| 103 | Report Builder `/app/reports/new?client={id}` | client/project, publications/URLs, verified metrics/snapshots, deliverables/assets | `Report`, immutable `ReportVersion`, `AnalyticsSnapshot`, `Asset`, approval request |
| 104 | Report Detail `/app/reports/[reportId]` | report/version, provenance/snapshot, delivery/view/comment state | new `ReportVersion`, `DeliveryPack`, share `ActivityEvent`, client-visible comment |
| 105 | Renewal Pipeline `/app/renewals` | `RenewalOpportunity`, client, completed projects, reports, health, package suggestions | `RenewalOpportunity`, assignment/status/task |
| 106 | Renewal Detail `/app/renewals/[renewalId]` | renewal, client/prior projects/deliveries/reports, packages, notes, deal/proposal | `RenewalOpportunity`, `Comment`, `Task`, new `Deal`/`Proposal` |

## 107–120 — Approvals, tasks, team, and administration

| # | Screen / route | Reads | Writes |
|---:|---|---|---|
| 107 | Approval Center `/app/approvals` | `ApprovalRequest`, step, exact target resource/version, project/client/requester/assignee | assignment/reminder only |
| 108 | Approval Detail `/app/approvals/[approvalId]` | request/policy/steps/decisions, exact target/version, comments/prior versions | immutable `ApprovalDecision`/`ApprovalOverride`, `Comment`, `AuditEvent` |
| 109 | Tasks `/app/tasks` | `Task`, dependency/checklist, project/client/stage, assignment | `Task`, `TaskDependency`, bulk assignment/status |
| 110 | Task Detail `/app/tasks/[taskId]` | task/checklist/dependencies, comments/files, linked resources, history | `Task`, checklist, dependency, `Comment`, `AssetLink` |
| 111 | Calendar `/app/calendar` | `CalendarItem`, `Meeting`, recording/shoot, task deadlines, publications, events, renewals | `CalendarItem`, linked `Meeting`/schedule under source authority |
| 112 | Files & Assets `/app/files` | `Folder`, `Asset`, versions/rights/links/usages, client/project/uploader | `Folder`, `Asset`, `AssetVersion`, `AssetRights`, archive/export audit |
| 113 | File Detail `/app/files/[fileId]` | asset metadata, versions/renditions/rights/usages/comments/approvals | new `AssetVersion`, rights, rendition request, comment, archive |
| 114 | Team Directory `/app/admin/team` | `OrganizationMembership`, `Person`, `EmployeeProfile`, departments/roles/workload | `Invitation`, membership/profile status, assignment under authority |
| 115 | Employee Detail `/app/admin/team/[userId]` | person/membership/profile, roles, department/manager, capacity, tasks/projects/activity | `EmployeeProfile`, membership, `MembershipRole`, manager/department, `AuditEvent` |
| 116 | Departments & Capacity `/app/admin/departments` | `Department`, membership/profile, assignments/tasks/projects, capacity aggregates | `Department`, manager/membership placement, capacity configuration |
| 117 | Roles & Permissions `/app/admin/roles` | `Role`, `Permission`, `RolePermission`, `MembershipRole` | `Role`, `RolePermission`, `MembershipRole`, `AuditEvent` |
| 118 | Audit Logs `/app/admin/audit-logs` | append-only `AuditEvent`, actor/resource/request metadata | export request/audit only; no audit mutation |
| 119 | Integrations `/app/admin/integrations` | `IntegrationConnection`, `WebhookEvent`, sync/health/error projection | `IntegrationConnection`, rotate credential reference, sync command, `AuditEvent` |
| 120 | Organization Settings `/app/admin/settings` | `Organization`, workflow/approval/notification/security settings, integrations | `Organization`, versioned policy/settings, `AuditEvent` |

## 121–151 — Client Portal

| # | Screen / route | Client-safe reads | Writes |
|---:|---|---|---|
| 121 | Client Sign In `/client/login` | `UserAccount`, client `OrganizationMembership` | `Session`, `AuditEvent` |
| 122 | Portal Activation `/client/activate/[token]` | `Invitation`, client `Organization`, allowed `Project` summary | `UserAccount`, `Person`, client `OrganizationMembership`, `Invitation`, terms consent, `AuditEvent` |
| 123 | Client Recovery `/client/recover-access` | `UserAccount`, recovery state | identity credential/reset event, `Session`, `AuditEvent` |
| 124 | Client Dashboard `/client` | own `ClientAccount`, `Project`, milestones/workflow summaries, pending approvals/tasks, shared invoices/messages/meetings/reports/notifications | dashboard preference, notification read state |
| 125 | My Projects `/client/projects` | own client-visible `Project`, workflow/milestone/progress/owner summaries | project filter/preference only |
| 126 | Client Project Detail `/client/projects/[projectId]` | project/milestones, client-visible members/deliverables/tasks/approvals/assets/activity | client task/comment/message commands only |
| 127 | Project Timeline `/client/projects/[projectId]/timeline` | `ActivityEvent` where same client/project and `CLIENT_SHARED` | none |
| 128 | Messages `/client/messages` | own client-visible `Conversation`, participants, latest `Message`, assets/unread | read/archive state, new `Conversation` when allowed |
| 129 | Message Thread `/client/messages/[threadId]` | authorized conversation/messages/participants/shared attachments/project | `Message`, `AssetVersion`, `AssetLink`, notification state |
| 130 | Tasks & Requests `/client/tasks` | client-shared assigned `Task`, checklist, project/resource | `Task` completion/status within allowed transitions, comment/asset response |
| 131 | Questionnaires `/client/questionnaires` | own `QuestionnaireInstance`, template summary, draft/submission progress | response draft initialization/status |
| 132 | Questionnaire Detail `/client/questionnaires/[questionnaireId]` | authorized questions, own response draft, submissions, shared attachments | `QuestionnaireResponse`, immutable `QuestionnaireSubmission`, `AssetVersion` |
| 133 | Drafts `/client/drafts` | client-shared `Draft` review packages and decisions, never internal working versions/comments | none/filter only |
| 134 | Draft Review `/client/drafts/[draftId]` | exact shared `DraftVersion`/deliverable version, client comments, approval request/decision | `Comment` as `CLIENT_SHARED`, immutable `ApprovalDecision` |
| 135 | Designs `/client/designs` | client-shared cover/layout/proof design resources and approval state | none/filter only |
| 136 | Design Review `/client/designs/[designId]` | exact shared `DesignVersion`/`Proof`, approved preview assets, client comments/approval | `Comment`, annotation asset if any, immutable `ApprovalDecision` |
| 137 | Assets `/client/assets` | own client/project assets/versions/rights/usages allowed for client | `Folder`, `Asset`, immutable `AssetVersion`, client rights confirmation |
| 138 | Approvals `/client/approvals` | own client pending/history `ApprovalRequest`, exact shared target, decisions | immutable `ApprovalDecision` for own org |
| 139 | Media Projects `/client/media` | client-visible podcast/video/event project summaries, schedules/actions/assets | filter only |
| 140 | Media Detail `/client/media/[projectId]` | project, brief/talking points/script/agenda shared version, schedule, uploads, preview, approvals/publication | client `Comment`, `AssetVersion`, `ApprovalDecision`, task response |
| 141 | Contracts `/client/contracts` | own client-shared `Contract`, exact sent/signed versions and signature state | none/filter only |
| 142 | Contract Sign `/client/contracts/[contractId]` | authorized exact `ContractVersion`, signer/evidence status, shared attachments | provider signing command; webhook creates immutable `SignatureEvent` |
| 143 | Billing `/client/billing` | own `Invoice`, lines/totals/balance, `Payment`/allocation/receipt projection | payment-intent command only |
| 144 | Billing Detail `/client/billing/[invoiceId]` | authorized invoice/lines/payment history/receipts | payment-intent command, receipt download activity |
| 145 | Publishing & Live Links `/client/publishing` | own `Publication`, versions summary, verified `PublishedURL`, thumbnail/assets | none |
| 146 | Distribution `/client/distribution` | own campaigns/items, verified URLs/basic verified metric observations | none |
| 147 | Reports & Downloads `/client/reports` | own shared `ReportVersion`, snapshot/provenance summary, `DeliveryPack`, assets/links | `DeliveryReceipt`, report comment when enabled |
| 148 | Renewals `/client/renewals` | own `RenewalOpportunity`, eligible `Package`, prior delivery/report summary | client interest/message command; internal deal creation remains staff-authorized |
| 149 | Notifications `/client/notifications` | own `Notification`, linked client-safe resource | read/dismiss state, limited preferences |
| 150 | Support `/client/support` | own-org `SupportTicket`, shared `SupportMessage`, attachments, linked project/invoice | `SupportTicket`, `SupportMessage`, `AssetVersion`, close/reopen under policy |
| 151 | Client Settings `/client/settings` | own `Person`, `UserAccount`, client membership/organization subset, notification preferences, sessions | `Person`, `NotificationPreference`, credential/session command; limited invite/membership writes for client admin |

## Coverage check

| Range | Screens | Rows mapped |
|---|---:|---:|
| Team Workspace | 1–120 | 120 |
| Client Portal | 121–151 | 31 |
| **Total** | **1–151** | **151** |

No operational screen owns a private duplicate of Client, Project, Asset, Approval, Message, Publication, or Report data. Each reads or commands the canonical aggregate listed here.
