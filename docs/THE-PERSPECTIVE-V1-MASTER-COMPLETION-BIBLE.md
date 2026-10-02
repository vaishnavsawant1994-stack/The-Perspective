# The Perspective V1.0 Master Completion Bible

**Document ID:** TP-V1-MASTER-001  
**Version:** 1.0-controlled  
**Date:** September 26, 2026  
**Governance status:** PROGRAM SOURCE OF TRUTH  
**Repository:** vaishnavsawant1994-stack/The-Perspective  
**Frozen implementation baseline:** main@e50ac3eb1b131f8e77697c59f0b7ff63c5a489ad  
**Current engineering checkpoint:** P4-R4-C1 ACCEPTED  
**Current authorized next stage:** R5 contract/design only; R5 implementation must be separately authorized  
**Production certification:** NOT READY  
**Design 154:** NOT AUTHORIZED

> **Current-state supersession, 2 October 2026:** The header lines above are the 26 September 2026 control snapshot. They are not the current engineering checkpoint. The newest accepted checkpoint is P4-R9-C1 in `docs/phase-4/PHASE-4-R9-COMPLETION-RECORD.md`, merged by pull request #15 at `a54c0fb5c7ac02be6c5c6225af5529456369c291`. R1–R8 remain accepted. R10 is locked and not started. V1.0 production certification is still not claimed. Design 154 remains unauthorized.

---

# 0. Purpose and authority

This document is the single program-control entry point for The Perspective V1.0.

It defines:

- what The Perspective is;
- what V1.0 must contain;
- how the public editorial product, member experience, Client Portal, Team Workspace and shared platform fit together;
- the canonical completion definition;
- the V1 release sequence;
- stage gates and stop conditions;
- the normative source map for routes, screens, fields, APIs, workflows, designs, security and qualification evidence;
- the final V1.0 certification matrix.

This document does not replace accepted lower-level contracts by copying them into a second drifting specification. It controls precedence and links the authoritative appendices that contain exact field-level, route-level, screen-level and endpoint-level details.

## 0.1 Precedence

When two repository documents conflict, use this order:

1. this Master Completion Bible for V1 scope, stage order, program status and completion policy;
2. the newest accepted Phase-4 checkpoint for implemented security/engineering behavior;
3. the associated Phase-4 implementation contract for that stage;
4. frozen Phase-2C database/entity/field architecture;
5. frozen Phase-2D workflow/state-machine architecture;
6. frozen Phase-2E operational UI sequence and implementation tracker;
7. frozen Phase-2F API/service architecture;
8. Phase-3 153-design audit for visual responsibility mapping;
9. ROUTE-FREEZE.md and the 57-page audit for the approved experience route contract;
10. current Prisma schema, migrations, tests and production code as evidence of what is actually implemented;
11. older README/architecture prose only where it has not been superseded.

Accepted newer checkpoints override older statements such as “database/auth deferred” or “R4 not implemented.”

## 0.2 Non-negotiable distinctions

The following identities must never be collapsed:

- Person is not User Account.
- User Account is not Membership.
- Authentication is not tenant selection.
- Tenant selection is not authorization.
- Organization is the durable tenant boundary.
- Team Workspace is a product/API surface, not a persisted Workspace table.
- Client organization is not a duplicate client-user database.
- Role is not Permission.
- Permission is not action authorization by itself.
- Activity timeline is not audit evidence.
- Mutable aggregate is not immutable version.
- Provider event is not business truth until verified and reconciled.
- AI output is never authority.

---

# 1. Definition of “V1.0 production complete”

The Perspective is not complete merely because all visual pages exist, the build passes or the website opens locally.

V1.0 is complete only when all approved product, engineering, business, security, quality and production gates below are satisfied together.

## 1.1 Product completion

V1 must support:

- public editorial reading and discovery;
- articles, authors, people, categories, topics and search;
- magazine landing, archive, categories, premium catalogue and digital reader;
- Personal Magazines;
- podcasts, videos and events;
- member accounts and entitlements;
- subscriptions and billing;
- Client Portal;
- Team Workspace;
- CRM and commercial operations;
- contracts, invoices and payments;
- editorial production;
- approvals and design review;
- publishing and distribution;
- reporting, delivery, renewals and support.

## 1.2 Engineering completion

V1 must have:

- production frontend;
- server APIs;
- PostgreSQL persistence;
- migrations and verification;
- authentication;
- tenant selection and isolation;
- authorization/RBAC;
- storage/media;
- reliable async jobs/events;
- search;
- payments;
- email/notifications;
- integrations;
- observability.

## 1.3 Security completion

V1 must prove:

- session security;
- brute-force/rate protections;
- origin/CSRF strategy appropriate to each endpoint;
- server-side authorization;
- tenant isolation;
- row-level security where specified;
- least-privilege database roles;
- secret isolation;
- safe file handling;
- audit evidence;
- vulnerability management;
- backup/restore;
- incident response.

## 1.4 Quality completion

V1 must pass:

- unit tests;
- database tests;
- service/integration tests;
- API contract tests;
- browser/E2E tests;
- accessibility tests;
- responsive/visual tests;
- security/authorization tests;
- performance tests;
- production build;
- deployment verification.

## 1.5 Business completion

V1 must support the commercial journey from prospect to renewal, including product/package configuration, proposals, contracts, invoices, payment evidence, client onboarding, production, publishing, distribution, reporting and renewal/upsell.

## 1.6 Production completion

V1 must have controlled development, preview/staging and production environments plus domain, hosting, database, storage, email, monitoring, logging, alerts, backups, CI/CD, rollback and incident procedures.

---

# 2. Master product architecture

~~~text
                         THE PERSPECTIVE
                               |
        +----------------------+----------------------+
        |                      |                      |
 PUBLIC EDITORIAL        MEMBER EXPERIENCE      BUSINESS PLATFORM
        |                      |                      |
 Editorial site          Account/Profile        Team Workspace
 Articles                Saved/Following        CRM
 Authors/People          Entitlements           Clients
 Search                  Subscriptions          Commercial
 Magazines               Billing                Editorial
 Reader                  Notifications          Publishing
 Podcasts/Video          Library                Distribution
 Events                  Support                Reporting
 Personal Magazines                              Administration
        |                      |                      |
        +----------------------+----------------------+
                               |
                         CLIENT PORTAL
                               |
                  Projects / Reviews / Billing
                               |
                        SHARED PLATFORM
                               |
        Identity | Tenancy | Authorization | Database
        APIs | Events | Jobs | Storage | Search | Audit
                               |
                         INFRASTRUCTURE
~~~

The public editorial website, member experience, Client Portal and internal Team Workspace are separate product surfaces sharing one controlled platform.

---

# 3. Product surfaces

## 3.1 Public editorial experience

Visitors can read and discover editorial content, magazines, Personal Magazines, podcasts, videos, events and company/legal content; search the site; view subscription offerings; contact the company; and enter authentication flows.

## 3.2 Member experience

Authenticated readers/members will manage profile, saved content, following, newsletter preferences, magazine/library access, subscription/billing, notifications, event registrations and support.

## 3.3 Client Portal

Client users will access only client-safe projections of canonical records. The portal covers dashboard, projects, questionnaires, tasks, messages, assets, reviews/approvals, contracts, invoices, payments, publications, distribution, reports, downloads, support and profile.

## 3.4 Team Workspace

The Team Workspace is the business operating surface for sales, CRM, outreach, clients, commercial operations, delivery/projects, editorial, magazine, podcast, video, events, publishing, distribution, reporting, approvals, team/access administration, settings, integrations, automation and operations.

## 3.5 Platform administration

Administration covers organizations, memberships, departments, teams, roles, permissions, settings, integrations, audit, incidents, health, data transfer, developer access, feature/configuration governance and security operations.

---

# 4. Approved 57-page experience contract

The 57-page inventory remains the canonical approved experience-page set. Route normalization is governed by ROUTE-FREEZE.md. Backend status notes in the August audit are historical and are superseded by accepted R1–R4 work where applicable.

| # | Approved experience | Canonical route | Surface |
|---:|---|---|---|
| 1 | Home | / | Public |
| 2 | News / Latest News | /latest | Public |
| 3 | Magazine Landing | /magazine | Public |
| 4 | Personal Magazines Landing | /personal-magazines | Public |
| 5 | Podcasts | /podcasts | Public |
| 6 | Videos | /videos | Public |
| 7 | Blogs / Perspective | /perspective | Public |
| 8 | Authors | /authors | Public |
| 9 | Search Results | /search | Public |
| 10 | Events & Summits | /events | Public |
| 11 | Article Detail | /article/[slug] | Public/entitled |
| 12 | News Category | /business, /leadership, /technology and registry-backed category family | Public |
| 13 | Magazine Reader | /magazine/read/[issueSlug] | Public/entitled |
| 14 | Magazine Archive | /magazine/archive | Public |
| 15 | Magazine Category | /magazine/category/[slug] | Public |
| 16 | Premium Magazine Listing | /magazine/premium | Public catalogue |
| 17 | Magazine Subscription / Plans | /subscribe | Public |
| 18 | Personal Magazine Profile | /personal-magazines/[slug] | Public |
| 19 | Personal Magazine Discovery | /personal-magazines/discover | Public |
| 20 | Create Your Personal Magazine | /personal-magazines/create | Public lead |
| 21 | Topic Detail | /topic/[slug] | Public |
| 22 | Author Profile | /author/[slug] | Public |
| 23 | Executive / Person Profile | /people/[slug] | Public |
| 24 | Podcast Show Detail | /podcasts/[showSlug] | Public |
| 25 | Podcast Episode Detail | /podcasts/[showSlug]/[episodeSlug] | Public |
| 26 | Video Detail | /videos/[slug] | Public |
| 27 | Event / Summit Detail | /events/[slug] | Public |
| 28 | About | /about | Public |
| 29 | Contact / Editorial Enquiries | /contact | Public |
| 30 | Advertise / Partner / Media Kit | /advertise | Public lead |
| 31 | Newsletter / Briefings Hub | /newsletters | Public |
| 32 | Help Center | /help | Public |
| 33 | Login | /login | Auth |
| 34 | Sign Up | /signup | Auth |
| 35 | Forgot Password | /forgot-password | Auth |
| 36 | Email Verification | /verify-email | Auth |
| 37 | Member Dashboard | /my | Member |
| 38 | Saved Articles | /my/saved | Member |
| 39 | Following | /my/following | Member |
| 40 | Newsletter Preferences | /my/newsletters | Member |
| 41 | Subscription Management | /my/subscription | Member |
| 42 | Billing & Payment History | /my/billing | Member |
| 43 | Profile & Account Settings | /my/settings | Member |
| 44 | Notifications Center | /my/notifications | Member |
| 45 | Digital Magazine Library | /my/magazines | Member |
| 46 | Event Registrations | /my/events | Member |
| 47 | Help / Support Requests | /my/support | Member |
| 48 | Not Found | framework not-found | System |
| 49 | General Error | framework error/global-error | System |
| 50 | Maintenance | /maintenance | System |
| 51 | Privacy Policy | /privacy | Public/legal |
| 52 | Terms of Use | /terms | Public/legal |
| 53 | Cookie Policy | /cookies | Public/legal |
| 54 | Editorial Standards | /editorial-standards | Public/legal |
| 55 | Accessibility Statement | /accessibility | Public/legal |
| 56 | Community Guidelines | /community-guidelines | Public/legal |
| 57 | Sitemap | /sitemap | Public |

Aliases/legacy paths are redirects, not new approved page templates, unless explicitly promoted by a later accepted contract.

## 4.1 Page Contract

Every approved page must ultimately have:

- canonical route;
- access classification;
- layout/template family;
- component ownership;
- server data source;
- API/service dependency;
- database/domain dependencies;
- authentication/authorization rule;
- primary and secondary CTA;
- incoming/outgoing route graph;
- desktop/tablet/mobile behavior;
- SEO metadata;
- analytics events;
- loading, empty, not-found, unauthorized and error states where applicable;
- accessibility acceptance;
- automated/browser test coverage.

---

# 5. Internal operational screen contract

Phase 2A froze 151 Team Workspace + Client Portal operational screens. Phase 2E maps them to 35 reusable design families. Phase 3 audited 153 / 153 designs: the 151 operational responsibilities plus TeamShell and ClientShell/reference responsibilities.

| Screen range | Operational module | Primary schemas |
|---|---|---|
| 1–10 | Staff Identity & Workspace Core | iam, platform, audit |
| 11–22 | Lead Discovery, Extraction & CRM | crm, platform, assets |
| 23–34 | Outreach, Inbox & Communication | comms, crm, platform |
| 35–44 | Deals & Client CRM | commercial, crm, comms, delivery |
| 45–52 | Commercial, Contracts & Finance | commercial, approvals, audit, assets |
| 53–60 | Projects & Workflow Engine | delivery, platform, assets, approvals |
| 61–68 | Editorial Studio | content, delivery, approvals, assets |
| 69–75 | Magazine Studio | magazine, content, delivery, approvals, assets |
| 76–81 | Podcast Studio | media, delivery, approvals, assets |
| 82–87 | Video Studio | media, delivery, approvals, assets |
| 88–93 | Events Operations | events, delivery, commercial, assets |
| 94–101 | Publishing & Distribution | publishing, content, magazine, media, events |
| 102–106 | Reporting & Renewals | reporting, commercial, publishing |
| 107–120 | Approvals, Tasks, Team & Administration | approvals, delivery, iam, platform, audit |
| 121–151 | Client Portal | authorized client-safe projections |

The standalone Phase-3 “Document 02 — 153-Screen Route & Connection Map” was recorded as deferred. Until it is materialized, the accepted R1 audited route registry plus Phase-2E sequence are the route/visual implementation authority.

No Design 154 may be introduced merely to solve engineering work.

---

# 6. Design system

The frozen design program must converge onto reusable foundations:

- typography;
- color tokens;
- spacing;
- radii;
- shadows;
- borders;
- iconography;
- grids/containers;
- breakpoints;
- motion and reduced-motion behavior.

Required reusable component families include buttons, links, navigation, editorial/media/entity cards, magazine covers/shelves, forms, selects, dialogs/drawers, tabs, tables, badges, alerts, filters, pagination, breadcrumbs, search, media players, reader controls, upload controls, approvals, timelines, progress, empty/error/access/loading states and legal/member/workspace primitives.

Every interactive primitive requires default, hover, focus, active, disabled, loading, success and error behavior where semantically applicable.

Visual design completion does not imply backend or workflow completion.

---

# 7. Identity, roles and permissions

## 7.1 Identity chain

~~~text
Person
  -> UserAccount
  -> UserIdentity / Credential
  -> Session
  -> OrganizationMembership
  -> selected Organization context
  -> Role assignments
  -> Permissions
  -> Resource/action policy
~~~

R1–R4 implement the path through selected Organization context. R5 is responsible for permission/resource/field/action authorization.

## 7.2 Role source gap

Phase 2 records a frozen Phase-2B input of 17 launch roles, 35 visibility modules and client isolation rules. The standalone Phase-2B role matrix is not present in the current docs/phase-2 repository tree.

Therefore:

- demo seed roles are not the launch role matrix;
- no R5 implementation may invent role names from memory;
- R5 must first materialize or reconstruct the 17-role matrix from the authoritative Phase-2B source/evidence and freeze it in-repository;
- every role must map to permissions, scope, sensitive actions and client-safe visibility.

---

# 8. Canonical data architecture

## 8.1 Durable tenant model

Organization is the durable tenant/legal-operating boundary.

There is no persisted Workspace table in the accepted architecture. “Team Workspace” is the staff application/API surface.

Client Portal uses client-type OrganizationMembership records and client-safe projections of canonical business entities. It does not create duplicate client domain tables.

## 8.2 Target logical domains

The frozen Phase-2C target model contains:

### IAM and organization
person, user_account, user_identity, session, mfa_method, organization, organization_membership, department, team, team_membership, employee_profile, role, permission, role_permission, membership_role, record_assignment, invitation.

### Shared platform
resource, comment, activity_event, notification, notification_preference, calendar_item, support_ticket, support_message, automation_rule, automation_run, outbox_event, webhook_subscription, webhook_delivery, integration_connection, webhook_event, custom_field_definition, custom_field_value, audit_event.

### CRM
lead_source, extraction_job, staged_record, enrichment_job, enrichment_fact, company, contact, lead, lead_score, lead_status_history, lead_list, lead_list_member, qualification, duplicate_candidate, suppression_entry.

### Communications
sending_account, message_template, outreach_campaign, sequence, sequence_step, campaign_recipient, message_delivery, conversation, conversation_participant, message, call, meeting, meeting_note.

### Commercial/finance
product, package, deal_pipeline, deal_stage, deal, deal_stage_history, deal_product, proposal, proposal_version, proposal_acceptance, client_account, client_relationship, contract, contract_version, contract_signer, signature_event, invoice, invoice_line, credit_note, payment, payment_allocation, ledger_entry, refund, renewal_opportunity.

### Delivery/workflow
project, project_member, project_milestone, workflow_template, workflow_stage_template, workflow_transition_rule, workflow_instance, workflow_stage_run, workflow_transition, task, task_dependency, task_checklist_item, questionnaire_template, questionnaire_instance, questionnaire_response, questionnaire_submission, deliverable, deliverable_version.

### Editorial
editorial_work, draft, draft_version, revision, citation, fact_check, editorial_review, author_credit, subject_credit, taxonomy_term, work_taxonomy.

### Magazine/Personal Magazine
publication, issue, issue_story, page, design_version, cover, cover_concept, proof, reader_build, print_spec, personal_profile.

### Media
podcast_show, podcast_episode, podcast_guest, recording_session, recording_asset, audio_version, transcript, transcript_version, clip, video_project, shoot, script, script_version, video_version, caption_version, thumbnail_version, media_release.

### Events
event, venue, event_day, agenda_item, agenda_participant, speaker, partner, registration, ticket, check_in, saved_agenda_item.

### Assets/rights
folder, asset, asset_version, asset_rendition, asset_link, asset_rights, asset_usage, upload_session.

### Approvals
approval_policy, approval_request, approval_step, approval_decision, approval_override.

### Publishing/distribution
channel, publication_target, publication, publication_version, publication_job, published_url, distribution_campaign, distribution_item, distribution_event.

### Reporting/delivery
metric_definition, metric_source, metric_observation, metric_rollup, report, report_version, delivery_pack, delivery_receipt.

## 8.3 Field-level authority

Exact target fields, primary keys, foreign keys, uniqueness and lifecycle fields are normative in:

- docs/phase-2/PHASE-2C-FIELD-AND-KEY-SPECIFICATION.md
- docs/phase-2/PHASE-2C-MASTER-DATABASE-ENTITY-ARCHITECTURE.md
- docs/phase-2/PHASE-2C-POSTGRES-PRISMA-SEED-MIGRATION.md

The physical implemented schema is normative in prisma/schema.prisma plus checked-in migrations.

Do not copy exact field lists into new stage prompts. R5+ implementation must cite these canonical sources and migrate only the entities authorized by the current stage.

## 8.4 Implemented persistence baseline after R4

The current physical schema implements the shared spine:

- Organization
- Person
- UserAccount
- UserIdentity
- Department
- OrganizationMembership
- Role
- Permission
- RolePermission
- MembershipRole
- Session
- MfaMethod
- Invitation
- RecoveryChallenge
- PasswordCredential
- AuthenticationAttempt
- AuthenticationSecret
- MfaChallenge
- Resource
- IdempotencyReceipt
- OutboxEvent
- OutboxDeliveryAttempt
- CallbackReceipt
- CallbackAttempt
- AutomationRun
- AutomationStepAttempt
- Incident
- IncidentEvent
- ReconciliationRun
- ReconciliationFinding
- AuditEvent

Later domain entities remain staged work, not implied by this foundation.

---

# 9. Persistence and service rule

Production behavior must follow:

~~~text
UI
 -> HTTP/server boundary
 -> input validation
 -> authenticated identity
 -> selected Organization context
 -> authorization
 -> domain service / command or query
 -> repository/database
 -> immutable event/audit where required
 -> response projection
 -> UI
~~~

No important production workflow may permanently depend on fixture-only or browser-local state.

---

# 10. Authentication

Accepted R3/R4 authentication supports the production security foundation for:

- password identity;
- opaque revocable database sessions;
- Team/Client surfaces;
- TOTP MFA foundations;
- invitation activation;
- recovery;
- session cookies;
- return-path validation;
- identity-only sessions for multi-membership context selection;
- explicit Organization context selection;
- selected tenant session.

Future public/member signup/email-verification/provider additions must preserve the same identity distinctions and security properties.

---

# 11. Authorization — mandatory R5 gate

R5 must implement server-side authorization after identity and tenancy.

The decision model must answer questions such as:

- can membership X view resource Y?
- can membership X update field Z?
- can membership X approve version V?
- can a client membership access this CLIENT_SHARED projection?
- does assignment/team/client scope allow this record?
- is the requested transition valid for this actor?

R5 must cover:

- exact launch roles;
- role-permission evaluation;
- allow/deny semantics;
- scope;
- record assignment;
- organization and client constraints;
- resource visibility/sensitivity;
- field-level restrictions where specified;
- high-risk action requirements;
- central service/repository enforcement;
- negative tests proving unauthorized reads/writes fail closed.

Authentication and tenant selection must never be treated as permission.

---

# 12. Multi-tenancy and database isolation

Accepted R4 establishes:

- exactly one active Organization context per selected session;
- explicit selection when multiple eligible memberships exist;
- no browser-supplied authoritative organization claim;
- restricted perspective_runtime PostgreSQL role;
- NOLOGIN and NOBYPASSRLS;
- forced RLS on the current resource security envelope;
- transaction-local trusted tenant claims;
- live cross-client isolation proof.

As domain tables are added, each tenant-sensitive table must define its ownership chain and RLS/application authorization policy before production use.

Canonical ownership is Organization-led; do not insert a synthetic Workspace persistence layer.

---

# 13. API architecture

The platform remains a modular monolith with explicit domain-service boundaries.

Canonical API surfaces:

| Surface | Namespace | Trust model |
|---|---|---|
| Team Workspace | /api/v1/workspace/* | staff membership + R5 policy |
| Client Portal | /api/v1/client/* | client membership + client projection |
| Public editorial | /api/v1/public/* | published/public/entitled projection |
| Member experience | /api/v1/member/* | member ownership + entitlement |
| Files | /api/v1/files/* | session + asset policy + signed intent |
| Provider webhooks | /api/v1/webhooks/* | verified provider signature + dedupe |
| Health/ops | /api/health/* | operational policy, no business data |
| Authentication | /api/v1/auth/* | public/surface-specific identity boundary |

Phase-2F is the exact endpoint catalog authority.

Every endpoint requires:

- authentication classification;
- organization context rule;
- authorization rule;
- Zod or equivalent schema;
- stable output contract;
- typed error contract;
- pagination/filter/concurrency behavior where relevant;
- idempotency for retried commands;
- audit/event behavior;
- rate/abuse controls where relevant;
- tests.

Commands must not use generic PATCH status mutation for protected lifecycle transitions.

---

# 14. Master business lifecycle

The canonical end-to-end business lifecycle is:

~~~text
Lead discovery
 -> extraction/enrichment
 -> qualification
 -> outreach
 -> conversation/meeting
 -> deal/proposal
 -> contract
 -> invoice/payment
 -> client onboarding
 -> project workflow
 -> production/reviews
 -> client approval
 -> publishing
 -> distribution
 -> verified reporting
 -> delivery
 -> renewal/new deal
~~~

State transitions are commands with actor, permission, guard, immutable evidence and side effects.

The complete transition vocabulary is normative in Phase-2D.

---

# 15. Editorial engine

Target editorial flow:

~~~text
Brief
 -> questionnaire
 -> research
 -> writer assigned
 -> drafting
 -> internal review
 -> revision
 -> client review when contracted
 -> client revision
 -> client approval
 -> SEO review
 -> publication ready
 -> scheduled
 -> published
 -> distributed
 -> completed
~~~

Every approval must target an exact immutable version/hash.

---

# 16. Magazine and Personal Magazine engine

Target Magazine/Personal Magazine lifecycle:

~~~text
Project
 -> editorial brief
 -> questionnaire
 -> interview
 -> assets
 -> article drafting/review/approval
 -> cover concept
 -> cover review/approval
 -> page design
 -> design review/revision
 -> final proof
 -> final client approval
 -> digital reader build
 -> publication ready
 -> published
 -> distribution
 -> client delivery
 -> completed
~~~

The public reader must support canonical issue/page state, text/visual views, entitlement where applicable, responsive behavior, accessibility and persisted progress for entitled users.

Personal Magazine profiles remain a dedicated public product area linked to canonical person, editorial, issue and conversion records.

---

# 17. Podcast, video and events

Podcast, video and event systems use canonical delivery/workflow, approvals, assets and publishing infrastructure rather than isolated status cards.

They require real catalogue/detail data, media assets/transcripts, review/approval, publishing/distribution and reporting.

---

# 18. Search

Production search must cover approved public entities:

- articles;
- authors/contributors;
- people;
- magazines/issues;
- Personal Magazines;
- topics/categories;
- podcasts/videos/events where approved.

Required capabilities:

- normalization;
- indexed retrieval;
- ranking;
- filters;
- pagination/load-more contract;
- typo strategy;
- empty/error/loading states;
- analytics;
- permission/entitlement-aware result projection.

---

# 19. Products, subscriptions and entitlements

Commercial access must follow:

~~~text
Product / Package
 -> Price / Terms
 -> Checkout or invoice
 -> verified Payment
 -> Order/Subscription
 -> Entitlement
 -> server-enforced Access
~~~

Offer types may include issue purchase, premium magazine access, monthly/annual membership, Personal Magazine packages, publication services and authority/growth services.

Catalogue visibility is not entitlement.

---

# 20. Payments and finance

Production payments require:

- provider selection and explicit adapter;
- checkout/payment intents or orders;
- verified webhooks;
- idempotency;
- successful/failed/cancelled payment;
- allocation to invoices;
- partial payment;
- refund/partial refund;
- disputes where supported;
- receipts;
- renewals;
- reconciliation.

Invoice state must derive from verified payment/allocation evidence, not arbitrary UI status changes.

Issued finance evidence is append-only/versioned according to Phase-2C/D rules.

---

# 21. Email and notifications

Transactional email/event coverage includes:

- invitations;
- account verification/recovery;
- contract send/sign;
- invoice and payment events;
- overdue reminders;
- questionnaire events;
- draft/design review requests;
- approval outcomes;
- publication/distribution delivery;
- subscription/renewal events;
- support and operational notifications.

Every production template requires event trigger, variables, preview/test, retry behavior, delivery/error logging and suppression/preference policy.

In-app notifications require unread/read state, deep link, actor/resource context and audit/event provenance.

---

# 22. Files, media and rights

Production storage must support:

- editorial images;
- author/person media;
- magazine covers/pages/PDFs;
- audio/video/transcripts;
- client uploads;
- contracts/invoices;
- designs/proofs;
- final publication/distribution assets.

Controls include:

- upload intent;
- MIME/size validation;
- checksum;
- malware/security strategy where appropriate;
- immutable asset versions;
- renditions;
- rights/consent;
- signed/private access;
- replacement/versioning;
- retention/deletion policy;
- audit.

---

# 23. CRM and commercial engine

Canonical commercial progression:

~~~text
Lead
 -> Qualified
 -> Outreach
 -> Conversation
 -> Proposal
 -> Negotiation
 -> Deal
 -> Contract
 -> Payment
 -> Client
 -> Project/Publication
 -> Renewal/Upsell
~~~

CRM must connect to canonical companies, contacts, lead provenance, suppression, conversations, activities, deals and clients. It must not remain a disconnected dashboard fixture.

---

# 24. Contract engine

Required capabilities:

- templates;
- variables;
- immutable versions;
- internal review/approval;
- PDF/document asset;
- send/view;
- signer model;
- signature integration/evidence;
- expiry/cancel/terminate/supersede;
- audit trail.

Canonical lifecycle is governed by Phase-2D.

---

# 25. Invoice engine

Required:

- controlled numbering;
- client/contract/project relationship;
- currency;
- immutable issued lines;
- tax/discount policy;
- due date;
- payment allocations;
- outstanding balance;
- overdue;
- credit/refund evidence;
- document/receipt;
- client-safe projection.

---

# 26. Client Portal

The portal must become a real data-backed projection of canonical business entities.

Primary journeys:

- invitation/activation/login;
- explicit organization selection when required;
- dashboard;
- project timeline/status;
- questionnaire;
- tasks/requests;
- messages;
- assets/uploads;
- draft/design review;
- approval/request changes;
- meetings;
- contract/invoice/payment;
- publication/distribution/report/download;
- support;
- profile/settings.

No client API may expose internal-only cost, margin, staff-only note, audit detail or non-CLIENT_SHARED resource.

---

# 27. Automation

Automation uses:

~~~text
trusted event
 -> rule/condition
 -> authorized action/command
 -> idempotency
 -> execution evidence
 -> audit/observability
~~~

Examples:

- signed contract -> create/activate onboarding;
- accepted questionnaire -> notify/advance authorized workflow;
- approved draft -> create design task;
- approved design -> publication readiness evaluation;
- published release -> distribution campaign;
- completed distribution -> reporting/delivery;
- renewal window -> renewal opportunity.

Automation never bypasses authorization or immutable lifecycle rules.

---

# 28. AI layer

AI is assistive, not authoritative.

Allowed V1/V1.x uses may include:

- drafting assistance;
- questionnaire suggestions;
- summarization;
- headline/metadata/SEO suggestions;
- content classification;
- lead/enrichment assistance;
- email drafting;
- analytics explanation;
- editorial assistant.

Consequential actions such as publication, contract approval, financial state, permission changes and sensitive distribution must remain governed by authenticated/authorized commands and human/provider evidence as defined by policy.

---

# 29. Analytics

Public analytics:

- visitors;
- page/article/magazine/media views;
- search behavior;
- acquisition;
- conversion;
- subscription/entitlement events.

Business analytics:

- lead throughput;
- outreach response;
- pipeline/conversion;
- revenue/collections;
- deal value;
- renewals;
- publication throughput;
- distribution performance.

Editorial/production analytics:

- turnaround;
- review time;
- revision count;
- approval time;
- publish cycle.

Metrics used in client reports must have source, period, freshness and verification provenance.

---

# 30. SEO

Every public durable entity must define:

- title;
- description;
- canonical URL;
- Open Graph;
- social metadata;
- appropriate structured data;
- sitemap participation;
- robots policy;
- breadcrumbs/internal linking.

Search/utility pages use intentional index policy. HTML and XML sitemaps must derive from authoritative route/content registries.

---

# 31. Accessibility

V1 targets WCAG-oriented production behavior including:

- semantic structure;
- keyboard navigation;
- visible focus;
- form labels/errors;
- dialog/focus management;
- table semantics;
- contrast;
- reduced motion;
- media captions/transcripts where relevant;
- alt text;
- screen-reader names/states.

Automated axe-style checks are necessary but do not replace manual keyboard/screen-reader review.

---

# 32. Performance

Track and gate:

- LCP;
- INP;
- CLS;
- TTFB;
- JS weight;
- image/font behavior;
- API latency;
- database latency;
- slow queries;
- job throughput.

Use appropriate SSR/cache/CDN/image optimization/index/query strategies without weakening freshness, authorization or tenant isolation.

---

# 33. Security architecture

Security release gates cover:

## Application
input validation, safe output, server authorization, session protection, rate/abuse controls, secure recovery, origin/CSRF policy, secure redirects.

## Database
least privilege, RLS where specified, migrations, backups, restore, immutable evidence, query safety.

## Infrastructure
TLS, secret management, environment separation, production access control, deployment identity.

## Files
signed access, MIME/size validation, checksum, rights, scanning policy where required.

## Integrations
scoped credentials, signature verification, idempotency, provider-event retention, reconciliation.

## Monitoring
auth anomalies, privilege changes, suspicious access, dependency findings, errors, failed jobs.

---

# 34. Audit evidence

Sensitive actions generate append-only audit evidence with, as applicable:

- actor type/user/membership;
- organization;
- action;
- target resource;
- request/correlation/causation identifiers;
- before/after hashes or redacted diff;
- reason;
- IP/device hashes;
- occurred time;
- idempotency key.

Audit is not a user-editable activity feed.

---

# 35. Testing strategy

Required layers:

~~~text
             E2E / browser
            /             \
        API/service       visual/a11y
         /                   \
   integration/database   security
          \               /
               unit
~~~

Critical V1 journeys include:

- public home -> article -> author -> related content;
- search -> result -> canonical entity;
- archive -> issue -> reader -> story;
- account signup/verification/login/recovery;
- subscription/payment -> entitlement -> content;
- Client invitation -> identity -> organization -> project/questionnaire/review/approval;
- lead -> outreach -> deal -> contract -> payment -> client;
- project -> questionnaire -> draft -> approval -> design -> publication;
- publication -> distribution -> report -> delivery;
- Tenant A cannot read/write Tenant B;
- unauthorized role cannot perform restricted action.

---

# 36. Infrastructure, environments and CI/CD

Environment chain:

~~~text
Development
 -> Preview / Staging
 -> Production
~~~

Each environment requires controlled variables, database, storage, provider credentials, logging and monitoring.

Every material PR should run the appropriate subset of:

- clean install;
- lint;
- strict TypeScript;
- Prisma validation/generation;
- migration deploy/status;
- database verification;
- drift detection;
- unit tests;
- live database/integration tests;
- authorization/security tests;
- dependency audit;
- production build;
- browser/E2E;
- accessibility/visual checks where relevant;
- preview deployment verification when provider integration exists.

A green build alone is not acceptance.

---

# 37. Backup, restore and disaster recovery

Production readiness requires:

- scheduled PostgreSQL backups;
- retention policy;
- object/media backup/versioning policy;
- secret/config recovery procedure;
- restore runbook;
- tested restore;
- defined RPO;
- defined RTO;
- periodic disaster-recovery exercise.

R2 already demonstrated a PostgreSQL backup/restore proof for the foundation; production certification must repeat restore against the production-class system and run post-restore verification.

---

# 38. Observability and incident operations

Required telemetry:

## Logs
application, HTTP/API, authentication/security, database/query, workers/jobs, provider integrations.

## Metrics
uptime, latency, error rate, database health, queue/job health, payment/email/provider failures.

## Alerts
production errors, deployment failures, failed jobs, payment anomalies, auth/security anomalies, backup failures, database/storage/provider degradation.

Runbooks are required for deployment, rollback, migration failure, security incident, payment/webhook issue, email failure, storage issue, backup restore and account recovery.

---

# 39. Documentation governance

Normative document set:

## Product/route
- this Master Completion Bible;
- 57-PAGE-IMPLEMENTATION-AUDIT.md;
- ROUTE-FREEZE.md;
- COMPONENT-MAPPING.md.

## Operational architecture
- Phase-2C database/entity/field documents;
- Phase-2D workflow/state-machine documents;
- Phase-2E master UI sequence + tracker;
- Phase-2F API/service architecture.

## Visual
- Phase-3 153-design audit.

## Implemented engineering
- Phase-4 contracts/checkpoints;
- Prisma schema/migrations;
- qualification workflows/tests.

## Missing/deferred authoritative inputs to close
- standalone Phase-2B 17-role permission matrix;
- standalone Phase-3 Document 02 route/connection map if still required separately.

Stage prompts must cite this Bible plus only the frozen inputs required for that stage.

---

# 40. Controlled V1 release roadmap

The release sequence below preserves the already-accepted repository history and reconciles the broader V1 roadmap.

## R1 — Repository Foundation, Route Contract & Fail-Closed Security Boundary
**Status:** ACCEPTED — P4-R1-C1.

Delivered route registry, collision resolution, fail-closed protected surfaces, request-context/configuration foundation and qualification harness.

## R2 — PostgreSQL / Prisma Persistence Foundation
**Status:** ACCEPTED — P4-R2-C1.

Delivered shared IAM/platform/audit persistence spine, migrations, constraints, RLS baseline, immutable evidence, seed, drift/backup/restore proof.

## R3 — Authentication, Sessions, MFA, Invitations & Recovery
**Status:** ACCEPTED — P4-R3-C1.

Delivered real identity/session boundary and repaired Team/Client auth, return paths, invitations, recovery and Chromium qualification.

## R4 — Organization Context Selection & Tenant Isolation
**Status:** ACCEPTED — P4-R4-C1.

Delivered identity-only vs tenant-scoped session state, explicit membership selection, restricted runtime role, forced resource RLS and exact-head browser/database proof.

**Merged baseline:** main@e50ac3eb1b131f8e77697c59f0b7ff63c5a489ad.

## R5 — Authorization, RBAC & Domain-Service Security Foundation
**Status:** LOCKED PENDING R5 CONTRACT.

Must materialize the authoritative 17-role matrix, implement permission/scope/record/field/resource-action policy, central authorization services and negative security qualification. May establish domain-service/repository guardrails but must not jump into later business workflows without explicit scope.

## R6 — CRM & Commercial Domain Engine
**Status:** LOCKED.

Implement canonical companies, contacts, leads, provenance/enrichment, suppression, qualification, lists, outreach/conversation foundations, deals/pipeline, client-account conversion and service/API contracts.

## R7 — Contracts, Invoices, Payments, Subscriptions & Entitlements
**Status:** LOCKED.

Implement products/packages, proposals, contracts/signatures, invoices, payment/reconciliation/refunds, member subscriptions and server-enforced entitlements.

## R8 — Editorial & Client Production Workflow
**Status:** LOCKED.

Implement projects, workflow engine, tasks, questionnaires, deliverables, editorial drafts/versions, reviews, approvals, assets and client production interactions.

## R9 — Publishing, Magazine & Personal Magazine Engine
**Status:** LOCKED.

Implement editorial public records, issues/pages/design/proofs, digital reader builds, publication readiness/scheduling/publishing, Personal Magazine canonical data and public binding.

## R10 — Media, Events & Distribution Engine
**Status:** LOCKED.

Implement podcast/video production, event operations, channel/target integrations, distribution campaigns/items, live-URL verification and delivery evidence.

## R11 — Growth, Search, SEO, Analytics, Reporting & Automation
**Status:** LOCKED.

Implement production search/indexing, SEO/sitemaps, public/business analytics, verified metric/reporting, automation rules/workers, renewal/upsell and growth/distribution analytics.

## R12 — Member Platform & Client Portal Production Completion
**Status:** LOCKED.

Replace remaining fixture-only member/client screens with authorized canonical APIs, finish account/subscription/library/support experiences and complete browser journeys across all 57 experience pages and 151 operational responsibilities.

## R13 — Enterprise Operations & Advanced Platform
**Status:** LOCKED.

Complete teams/departments/admin, settings/integrations, notifications/email, storage/media operations, audit/incident/reconciliation tooling, developer/operational controls, controlled AI assistance and enterprise reliability tooling.

## R14 — Production Hardening, Security, Reliability & V1.0.0 Certification
**Status:** LOCKED.

No major new capability.

R14 performs whole-system threat/authorization review, dependency/security audit, failure/retry/recovery tests, performance/load work, accessibility/manual validation, backup/restore/disaster recovery, staging/production deployment, monitoring/alerts, rollback tests, incident runbooks and final regression.

Only after R14 acceptance may the repository state:

~~~text
The Perspective V1.0.0
Production Readiness Certified
~~~

---

# 41. Release acceptance pattern

Every release uses:

~~~text
Master Bible
 -> current release contract
 -> frozen baseline
 -> implementation
 -> unit/service/database tests
 -> browser/real-user tests
 -> security/authorization review
 -> data/migration review
 -> production build
 -> checkpoint
 -> acceptance
 -> merge
 -> merged baseline freeze
 -> next release authorization
~~~

Never implement the next release because the current code “looks done.”

Acceptance requires objective evidence on an exact commit.

## 41.1 Review governance

R1–R13 review gates may use either:

1. a genuine independent review; or
2. an **Owner-Approved Enhanced Qualification Waiver** under `docs/GOVERNANCE-REVIEW-POLICY.md`.

A waiver never counts as an independent review and does not waive exact-head technical qualification, findings closure, checkpoint/freeze requirements, or separate owner authorization.

When the waiver path is used, the stage must record the owner waiver, adversarial review, enhanced negative/security testing, exact-head qualification and final disposition.

**R14/V1.0 production certification is excluded from the waiver path. Genuine external independent review remains mandatory for R14/V1.0.**

---

# 42. V1.0 certification matrix

| Area | V1.0 definition of done |
|---|---|
| Product | All approved V1 capabilities implemented |
| 57-page experience | Canonical routes, real data/services, states and tests complete |
| 151 operational responsibilities | Bound to real services/workflows with access policy |
| 153 frozen designs | No unauthorized design drift; responsive/a11y acceptance |
| Frontend | Production-quality and data-backed |
| Backend | Real modular services and APIs |
| Database | Target V1 schema/migrations/constraints verified |
| Authentication | Production identity/session/recovery/MFA as approved |
| Authorization | Server-enforced RBAC/resource/field/action policy |
| Tenancy | App + DB isolation proven |
| Editorial | End-to-end lifecycle operational |
| Magazine | Issue/reader/publishing lifecycle operational |
| Personal Magazine | End-to-end product and conversion workflow operational |
| CRM | Lead-to-client workflow operational |
| Contracts | Version/send/sign/audit operational |
| Invoices | Issue/balance/payment evidence operational |
| Payments | Provider integration/reconciliation/refund operational |
| Subscriptions | Product/checkout/renewal/entitlement operational |
| Client Portal | Client-safe production workflow operational |
| Member platform | Profile/library/preferences/billing/support operational |
| Distribution | Multi-channel controlled delivery operational |
| Search | Indexed, filtered, entitlement-aware |
| SEO | Metadata/schema/sitemaps/internal links validated |
| Analytics | Public/business/editorial metrics with provenance |
| Email | Transactional templates/triggers/retry/error evidence |
| Notifications | In-app delivery/read/preferences operational |
| Storage | Secure versioned media/file access |
| AI | Controlled assistance only; no authority bypass |
| Security | Threat/authorization/tenant/dependency/secrets review passed |
| Tests | Required unit/API/DB/browser/security coverage green |
| Accessibility | Automated + manual acceptance |
| Performance | Defined budgets and load/latency acceptance |
| CI/CD | Automated gates and controlled deployment |
| Monitoring | Logs/metrics/alerts active |
| Backup | Automated and retained |
| Recovery | Restore/DR tested |
| Documentation | Product/design/engineering/ops/security runbooks current |
| Deployment | Production verified |
| Rollback | Tested |
| Business workflow | Prospect-to-renewal verified end to end |
| V1.0 | R14 certification accepted |

---

# 43. Known current gaps and superseded statements

At the R4 merged baseline:

- R1–R4 are accepted.
- R5–R14 are not implemented merely because target architecture documents exist.
- Phase-2 target entities vastly exceed the currently implemented physical schema.
- The 57-page August audit contains historical backend statements that are superseded by R2–R4 for database/auth/tenancy.
- Older ARCHITECTURE.md prose discussing a future Supabase introduction is superseded by the accepted PostgreSQL/Prisma R2 baseline.
- Phase-2B’s exact 17-role source must be materialized before R5 implementation.
- Phase-3’s standalone 153-screen connection-map document remains a provenance/documentation gap unless the R1 route registry + Phase-2E sequence are explicitly accepted as its replacement.
- Public/member/client/internal visual completion must not be confused with workflow/data/API completion.
- No production provider should be selected silently; payments, email, object storage, search, signing, media and external distribution providers each require an explicit adapter/security decision in their authorized release.

---

# 44. Codex / engineering-agent execution rule

An engineering agent receives:

1. this Master Bible;
2. the current release implementation contract;
3. only the frozen source documents needed for that release;
4. the exact frozen baseline SHA;
5. explicit stop conditions.

It must not:

- start a later release;
- invent a new architecture to bypass an existing contract;
- create Design 154 without authorization;
- introduce a persisted Workspace model contrary to the accepted Organization tenant architecture;
- treat demo/fixture roles as the 17 launch roles;
- treat authentication or tenancy as authorization;
- broaden provider scope silently;
- merge when required exact-head gates are not green.

---

# 45. Immediate next action

R4 is accepted and merged.

The next controlled action is **R5 planning and contract formation only**:

1. freeze main@e50ac3eb1b131f8e77697c59f0b7ff63c5a489ad as the R4 accepted baseline;
2. close the Phase-2B role-matrix provenance gap;
3. reconcile role/permission/scope/resource/field policy with current R2–R4 schema and request context;
4. produce P4-R5-G0 Authorization/RBAC implementation contract;
5. review the R5 contract;
6. only then authorize R5 code implementation.

No CRM, contracts, payments, editorial or later-domain implementation should begin until R5 authorization is accepted.

---

# 46. Post-V1 roadmap

After R14/V1.0 certification:

## V1.1
bug fixes, UX refinement, accessibility/performance improvement, operational tuning.

## V1.2
advanced analytics, automation, provider integrations and measured growth enhancements.

## V2
potential advanced AI, mobile apps, partner/public API, multi-publication platform, broader SaaS capabilities and other separately approved product expansion.

None of these may delay or destabilize V1.0 completion.

---

# 47. Normative appendix registry

The following files are incorporated by reference and are part of this Bible’s controlled source-of-truth set:

- docs/57-PAGE-IMPLEMENTATION-AUDIT.md
- docs/ROUTE-FREEZE.md
- docs/COMPONENT-MAPPING.md
- docs/phase-2/PHASE-2C-MASTER-DATABASE-ENTITY-ARCHITECTURE.md
- docs/phase-2/PHASE-2C-ENTITY-CATALOG.md
- docs/phase-2/PHASE-2C-FIELD-AND-KEY-SPECIFICATION.md
- docs/phase-2/PHASE-2C-SCREEN-ENTITY-MAP.md
- docs/phase-2/PHASE-2C-POSTGRES-PRISMA-SEED-MIGRATION.md
- docs/phase-2/PHASE-2D-MASTER-WORKFLOW-STATE-MACHINES.md
- docs/phase-2/PHASE-2D-TRANSITION-RULES.md
- docs/phase-2/PHASE-2D-AUTOMATION-EVENT-CATALOG.md
- docs/phase-2/PHASE-2D-SLA-ESCALATION-MATRIX.md
- docs/phase-2/PHASE-2D-SCREEN-WORKFLOW-MAP.md
- docs/phase-2/PHASE-2D-WORKFLOW-DIAGRAMS.md
- docs/phase-2/PHASE-2E-MASTER-UI-DESIGN-SEQUENCE.md
- docs/phase-2/PHASE-2E-IMPLEMENTATION-TRACKER.md
- docs/phase-2/PHASE-2F-MASTER-API-AND-SERVICE-ARCHITECTURE.md
- docs/phase-3/PHASE-3A-DOCUMENT-01-MASTER-153-DESIGN-AUDIT-AND-COMPONENT-MAPPING.md
- docs/phase-4/README.md
- all accepted Phase-4 implementation contracts and checkpoints
- prisma/schema.prisma
- prisma/migrations/*
- qualification workflows and test suites

If any incorporated appendix changes, its owning stage must explain why and requalify the affected contract.

---

# 48. Final governing statement

The Perspective V1 is:

**the 57-page editorial/member experience + 151 operational responsibilities + 153 frozen designs + Team Workspace + Client Portal + member platform + shared PostgreSQL/API/security foundation + CRM/commercial engine + editorial/production engine + magazine/publishing/distribution engine + subscriptions/payments + operations/infrastructure.**

The project is not being rebuilt.

It is being completed through controlled, evidence-backed releases:

**R1 → R2 → R3 → R4 → R5 → R6 → R7 → R8 → R9 → R10 → R11 → R12 → R13 → R14 → V1.0.0.**

Current state:

**R1 ✅  R2 ✅  R3 ✅  R4 ✅  |  R5 🔒  R6–R14 🔒**

The immediate objective is to define and authorize R5 correctly, not to skip ahead.
