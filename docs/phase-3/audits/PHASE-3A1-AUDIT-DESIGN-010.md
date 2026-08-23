We continue strictly with Design 010 — Contact / Data Enrichment. Its responsibility remains separate from Design 009 — Data Extraction: extraction acquires data; enrichment improves, verifies, completes, or refreshes already-known candidate/contact/company data.

Phase 3A.1 — Master 153-Design Inventory Audit
Design 010 — Contact / Data Enrichment
Audit field	Classification
Design ID	010
Canonical name	Contact / Data Enrichment
Product area	Sales / CRM Data Intelligence
User surface	Team Workspace
Screen class	Data Enrichment / Data Quality Workspace
Classification	Unique Anchor — Enrichment Workspace Family
Primary purpose	Improve incomplete or stale prospect/contact/company information through controlled enrichment, verification and review
Primary entities	Enrichment Job, Enrichment Result, Field Candidate
Supporting entities	ProspectCandidate, Contact, Company, Lead, Source, DataProvider, User, Import/Extraction Job
Parent shell	InternalAppShell — Design 001
Related family	DataQualityWorkspaceTemplate
Auth	Required
Permissions	CRM-data / enrichment / field-update scoped
Implementation priority	Core / High
Reuse level	High across CRM, import and data-quality workflows
1. Functional responsibility

Design 010 answers:

“What information is missing, stale, uncertain or potentially incorrect, and how can we safely improve it?”

A typical flow is:

Extracted / Existing Record
          ↓
Identify missing/stale fields
          ↓
Enrichment request
          ↓
Provider/source results
          ↓
Normalize + validate
          ↓
Compare with existing data
          ↓
Accept / reject / auto-apply by policy
          ↓
Updated canonical record + provenance

The critical rule is:

Enrichment must not blindly overwrite canonical CRM information.

2. Extraction vs Enrichment

This boundary is now formally frozen.

Design 009 — Data Extraction

Obtains records from a source.

Source → Raw Record → Normalized Candidate
Design 010 — Contact / Data Enrichment

Improves a known record.

Known Candidate / Contact / Company
            ↓
Additional evidence
            ↓
Improved canonical data

Example:

After extraction

Name: Maria Keller
Company: Vector Labs
Title: Founder
Email: —
Industry: —
Location: Germany

After enrichment

Name: Maria Keller
Company: Vector Labs
Title: Founder & CEO
Email: validated
Industry: AI Infrastructure
Location: Berlin, Germany
Company Domain: vectorlabs.example

They share source/provider infrastructure but remain different workflows.

Consolidation decision

SHARED CONNECTOR + NORMALIZATION INFRASTRUCTURE — DO NOT MERGE DESIGNS 009 AND 010.

3. Canonical enrichment workspace regions

Design 010 should normalize into these responsibilities without redesigning the approved UI.

Record Selection

Enrich:

one Contact,
one Company,
one Lead/candidate,
or an authorized batch.
Current Data

Shows what the canonical system already knows.

Missing / Stale Fields

Examples:

Email missing
Phone missing
Company domain missing
Title possibly stale
Industry unknown
Location incomplete

Enrichment Sources

Show the provider/source used where appropriate, without exposing secrets.

Proposed Changes

The user needs to understand:

Current value → Proposed value

not merely “Record enriched.”

Verification / Confidence

Show the evidence quality or verification state associated with proposed values.

Apply / Reject / Review

Depending on policy:

Accept field
Reject field
Accept selected
Apply safe changes
Send for review

4. Enrichment Job must be first-class

Like extraction, enrichment should support canonical jobs.

Conceptually:

EnrichmentJob
├── id
├── organizationId
├── requestedBy
├── targetType
├── targetIds
├── requestedFields
├── providers
├── status
├── startedAt
├── completedAt
├── recordsProcessed
├── fieldsDiscovered
├── fieldsVerified
├── conflicts
├── failures
└── cost/usage metadata where relevant

This matters because enrichment can be:

asynchronous,
bulk,
provider-dependent,
rate-limited,
partially successful,
costly,
retryable.
5. Field-level enrichment model

A major architectural finding is that enrichment cannot be represented only at record level.

The system needs field-level information.

Conceptually:

FieldCandidate
├── entityId
├── field
├── currentValue
├── proposedValue
├── source
├── confidence
├── verificationState
├── discoveredAt
└── decision

For example:

Field: jobTitle
Current: VP Marketing
Proposed: Chief Marketing Officer
Source: Provider B
Confidence: High
Decision: Pending Review

This enables safe reconciliation.

6. Field provenance

Every externally enriched value should preserve provenance.

Conceptually:

FieldValue
├── value
├── source
├── observedAt
├── verifiedAt
├── confidence
└── method

This allows the system to answer:

“Why does the CRM say this person is now CMO?”

instead of storing only the final string.

7. Source truth hierarchy

Different sources may disagree.

Example:

Current CRM:       VP Marketing
Provider A:        VP Marketing
Provider B:        Chief Marketing Officer
Provider C:        CMO

The platform requires a canonical conflict-resolution policy rather than:

latest API response always wins.

Possible decision factors include:

source trust
freshness
verification
manual confirmation
existing protected fields

Exact scoring belongs to Phase 3D.

Design 010 establishes the requirement.

8. Human-entered data protection

This is especially important.

Suppose an account manager manually verified:

Preferred Email: maria@company.com

A provider later returns:

m.keller@oldcompany.com

The external result must not automatically overwrite a trusted manual value.

We therefore need field origin concepts such as:

MANUAL
CLIENT_CONFIRMED
SYSTEM_DERIVED
PROVIDER_ENRICHED
IMPORTED

Potentially with trust/protection policy attached.

9. Missing vs stale vs conflicting

These should remain different conditions.

Missing

No value exists.

Stale

A value exists but may be outdated.

Conflicting

Multiple credible values disagree.

Example:

Email: MISSING
Title: STALE
Company: VERIFIED
Location: CONFLICT

One generic NEEDS_ENRICHMENT status is insufficient for detailed data-quality workflows.

10. Verification is not the same as confidence

Like Design 008's distinction between data confidence and sales qualification, Design 010 requires another separation.

Confidence

How likely a value appears correct.

Verification

Whether an explicit validation process confirmed it.

Example:

Email Confidence: HIGH
Email Verification: UNVERIFIED

or:

Email Confidence: HIGH
Email Verification: VERIFIED

These should not be collapsed into one badge.

11. Canonical enrichment lifecycle

A simple job lifecycle can be:

QUEUED
  ↓
RUNNING
  ↓
REVIEW_REQUIRED
  ↓
COMPLETED

with exception states:

PARTIALLY_COMPLETED
FAILED
CANCELLED

Internal provider processing stages should not necessarily become public top-level statuses.

At individual field level:

PROPOSED
ACCEPTED
REJECTED
AUTO_APPLIED
CONFLICT
12. Auto-enrichment policy

Not every result needs manual review.

Some fields may be safe to auto-apply under controlled rules.

Conceptually:

EnrichmentPolicy
├── field
├── minimumConfidence
├── allowedSources
├── overwriteExisting
├── requireVerification
└── requireHumanApproval

For example:

Company industry
may permit high-confidence auto-enrichment.

But:

primary contact email
may require verification before automatic use.

And:

client-confirmed legal company name
may never be automatically overwritten.

13. Record-level vs batch enrichment

Design 010 should support shared infrastructure for both.

Single-record enrichment

Useful from:

Contact Detail
Company Detail
Lead Detail

Batch enrichment

Useful for:

Lead Lists
Imported records
Data-quality cleanup

Architecture:

Single / Bulk Request
        ↓
Canonical Enrichment Service
        ↓
Job + Providers
        ↓
Normalized field candidates

There should not be separate enrichment engines for single and batch operations.

14. Reusable component mapping

Shared primitives:

PageHeader
DataTable
StatusBadge
ProgressBar
Checkbox
Drawer
Modal
Alert
Tabs
FilterBar
EmptyState
LoadingState
ErrorState

Enrichment-specific composites:

DataQualitySummary
MissingFieldIndicator
StaleFieldIndicator
FieldComparisonRow
EnrichmentSourceBadge
ConfidenceIndicator
VerificationBadge
ConflictResolver
FieldDecisionControl
BulkEnrichmentBar
EnrichmentJobProgress

The reusable hierarchy becomes:

Design Tokens
      ↓
Data/Table/Form primitives
      ↓
Data Quality Components
      ↓
DataQualityWorkspaceTemplate
      ↓
Design 010
15. New implementation-family finding

The architecture identified so far now becomes:

InternalAppShell
│
├── Dashboard Family
│   └── Designs 003–007
│
├── Data Acquisition Family
│   ├── 008 Lead Finder
│   └── 009 Data Extraction
│
└── Data Quality / Enrichment Family
    └── 010 Contact / Data Enrichment

Design 010 may eventually share some page-template infrastructure with other data-review screens, especially Design 083 and portions of Design 148, but its business purpose remains distinct.

16. Relationship to CRM records

Enrichment may operate before or after CRM admission.

Pre-CRM
ProspectCandidate
       ↓
Enrichment
       ↓
Better Candidate
       ↓
CRM Admission
Post-CRM
Canonical Contact / Company
       ↓
Enrichment
       ↓
Proposed Changes
       ↓
Approved Update

Both should use the same canonical enrichment service.

17. Contact and Company enrichment

Design 010's name includes Contact/Data Enrichment, but implementation should avoid assuming all enrichment is person-only.

Contact fields

Potential examples:

role/title
department
professional email
location
professional profile reference
Company fields

Potential examples:

canonical name
domain
industry
company size
headquarters
website
description

The exact supported fields depend on approved source capabilities and business requirements.

18. Enrichment must not mutate Lead qualification

A critical boundary:

Better data does not automatically mean a more qualified lead.

For example:

Before enrichment:
Qualification: HIGH
Data completeness: 55%

After enrichment:
Qualification: HIGH
Data completeness: 92%

Enrichment improves information quality.

Lead qualification belongs to the Sales/CRM decision system.

19. Suppression and communication safety

An enrichment provider discovering a new email address should not automatically make the contact outreach-eligible.

Communication eligibility may depend on separate concepts such as:

suppression state,
unsubscribe history,
legal/business rules,
user decisions.

Thus:

Email discovered
      ≠
Email approved for outreach

This separation protects downstream Outreach architecture.

20. Duplicate resolution

Enrichment may reveal that two existing records are actually the same person/company.

For example:

Contact A
John Smith @ Acme

Contact B
John A. Smith @ acme.com

Enrichment can supply evidence for duplicate detection.

However:

Enrichment should flag possible identity collisions; it should not silently merge canonical CRM records.

Canonical record merging should be a separate controlled operation with audit history.

21. Permission architecture

Potential permission dimensions include:

enrichment.read
enrichment.run
enrichment.bulk_run
enrichment.review
enrichment.apply
enrichment.override
enrichment.export

Exact naming waits for Phase 3D.

Important distinction:

VIEW RESULTS
    ≠
APPLY CHANGES
    ≠
OVERRIDE TRUSTED DATA

A Sales Rep might be able to request enrichment but not overwrite protected company information.

22. Provider credentials and secrets

As with Design 009:

Provider API keys must remain server-side.

Correct flow:

UI
 ↓
Enrichment Service
 ↓
Secure Integration / Credential Store
 ↓
Provider

Never:

Browser → provider using exposed API key
23. Provider abstraction

Correct architecture:

Enrichment Service
        ↓
Provider Router
        ↓
┌────────────┬────────────┬────────────┐
Provider A   Provider B   Internal Source
└────────────┴────────────┴────────────┘
        ↓
Normalized Enrichment Result

The UI should consume the canonical enrichment schema rather than provider-specific payloads.

24. Multi-provider conflicts

If two providers return different values:

Provider A:
Company size = 201–500

Provider B:
Company size = 501–1,000

The system should preserve both observations sufficiently for conflict resolution instead of losing one immediately.

That does not mean the CRM needs to expose every provider payload forever in normal UI.

It means canonical reconciliation must be possible.

25. Provider usage / cost controls

Some enrichment services may have usage or financial limits.

Therefore the service architecture should be capable of supporting:

usage limits
provider quotas
rate limits
workspace quotas
bulk-job safeguards

The design does not need a new billing screen for this.

Those controls can later connect to Integration/Admin surfaces.

26. Background job architecture

Bulk enrichment must not rely on the browser remaining open.

Correct:

User submits enrichment job
          ↓
Queue
          ↓
Workers
          ↓
Provider calls
          ↓
Normalized results
          ↓
Review / auto-apply

The browser can disconnect and later return to the job state.

27. Idempotency

Repeated enrichment requests must be controlled.

For example:

Enrich Contact #123
       ↓
provider returns result
       ↓
network timeout before UI confirms
       ↓
user retries

The system should avoid unnecessary duplicate mutations, usage charges or conflicting field updates where possible.

28. Freshness architecture

Enriched values age.

A value such as:

Job Title: CEO

observed two years ago is not equivalent to the same information verified yesterday.

Relevant values therefore need timestamps such as:

observedAt
verifiedAt
updatedAt

This enables the system to classify some information as stale.

29. Refresh policy

Later architecture may support policies such as:

Refresh stale contact roles after X days
Refresh company data after Y days
Revalidate email before outreach

But Design 010 should consume these policies rather than embedding arbitrary timers in the UI.

30. Relationship to Designs 083, 084–089

Design 010 will integrate heavily with later screens.

Design 083 — Extraction Review

May send incomplete extracted candidates to enrichment.

Design 084/085 — Company CRM / Company Detail

Can trigger company enrichment and show enrichment history.

Design 086/087 — Contact CRM / Contact Detail

Can trigger contact enrichment and show data provenance.

Design 088/089 — Lead Lists / Lead Detail

Can request enrichment for selected sales records.

Correct architecture:

Many CRM surfaces
       ↓
One Enrichment Service
       ↓
Design 010 for deeper enrichment/review operations
31. Relationship to Design 139–140 Integrations

Provider connection and authentication should belong to:

Integration Center / Integration Detail

not Design 010.

Design 010 can display:

Provider unavailable
Authentication expired

and route an authorized administrator toward the appropriate Integration screen.

But it should not contain a second provider-credential management system.

32. Responsive contract
Desktop

Best for:

record list + field comparisons + source/confidence information + review actions

Tablet — Design 152

Adapt through:

priority columns,
collapsible review panels,
touch-friendly accept/reject controls,
drawers for detailed provenance.
Mobile — Design 151

Prioritize each enrichment candidate as:

Record identity
→ Fields needing attention
→ Current vs Proposed value
→ Confidence / verification
→ Accept / Reject

Complex comparison tables should become stacked field cards.

33. State coverage

Design 010 needs Design 150 plus enrichment-specific states:

No Records Need Enrichment
No Missing Fields
Job Queued
Enrichment Running
Review Required
Provider Rate Limited
Provider Unavailable
Authentication Expired
No New Data Found
Conflict Detected
Partial Enrichment
Completed
Failed
Cancelled
Permission Restricted

An important distinction:

No new enrichment found is not an error.

And:

provider unavailable is not the same as “no new data.”

34. Partial completion contract

Example:

250 Contacts

Email enrichment       231 ✓
Job title enrichment   247 ✓
Company industry       250 ✓
Phone enrichment       118 ✓
Provider timeout        19 records

The successful results should remain usable.

The entire job should not be thrown away because one enrichment dimension failed.

35. Audit trail

Important events include:

Enrichment requested
Provider queried
Result received
Field proposed
Field accepted
Field rejected
Field automatically applied
Trusted value overridden
Bulk enrichment executed

The most sensitive action is likely:

Overriding a verified/manual value

which should retain particularly strong audit context.

These events later integrate with Design 138.

36. Backend requirements

Recommended conceptual architecture:

Contact / Data Enrichment UI
           ↓
Enrichment Service
           ↓
Permission + Tenant Scope
           ↓
Enrichment Job Manager
           ↓
Provider Router
           ↓
Provider Adapters
           ↓
Normalized Field Candidates
           ↓
Validation / Confidence / Conflict Logic
           ↓
Policy Engine
           ↓
Review or Auto-Apply
           ↓
Canonical CRM Record
           ↓
Audit + Provenance
Backend requirement	Status
Authentication	Required
Tenant isolation	Required
Enrichment RBAC	Required
Background jobs	Required
Provider abstraction	Critical
Secure credentials	Critical
Field-level provenance	Critical
Validation	Required
Conflict resolution	Critical
Protected-field policy	Critical
Freshness tracking	Required
Batch processing	Required
Idempotency	Required
Partial-result handling	Required
Audit history	Critical
37. Main implementation risks

The Design 010 audit flags several major risks:

Blind overwrite — provider data automatically replacing trusted CRM information.

Extraction/enrichment duplication — Designs 009 and 010 developing separate source frameworks.

Provider coupling — UI understanding individual provider payload formats.

Lost field provenance — storing only the latest value.

Confidence/verification confusion — combining them into one score.

Qualification contamination — enrichment automatically changing Lead qualification.

Communication-risk leakage — discovering an email automatically making it outreach eligible.

Silent record merging — enrichment evidence causing automatic Contact/Company merges.

Browser-owned bulk enrichment — long-running jobs depending on an open tab.

Secret exposure — provider credentials in frontend state.

These are architecture controls, not missing-screen problems.

Design 010 Audit Verdict
PASS — ENRICHMENT / DATA QUALITY WORKSPACE ANCHOR

Template directive: Design 010 establishes the DataQualityWorkspaceTemplate / enrichment family.

Boundary directive: Extraction ≠ Enrichment ≠ CRM Admission ≠ Lead Qualification.

Field directive: Enrichment must work at field level with current value, proposed value, source, freshness, confidence, verification and decision where applicable.

Protection directive: Trusted/manual/client-confirmed values must not be blindly overwritten.

Provider directive: Design 009 and Design 010 share canonical provider/adapter infrastructure while maintaining different business services.

Processing directive: Bulk enrichment runs through backend jobs/workers.

Permission directive: Viewing, running enrichment, applying results, overriding trusted values and exporting require independently enforceable permissions.

Audit directive: Applied enrichment changes retain provenance and audit history.

Consolidation directive: STANDARDIZE SHARED DATA-SOURCE INFRASTRUCTURE WITH DESIGN 009; DO NOT MERGE THEIR APPROVED WORKSPACES.

Phase 3A.1 — Running Audit
Result	Count
Audited	10 / 153
PASS	10
STANDARDIZE decisions	8
Potential implementation-overlap flags	2
MERGE screen candidates	0 pending later comparisons
FIX BEFORE CODE	0
New designs	0
Current reusable architecture
Authenticated Presentation
│
├── 001 InternalAppShell
│   │
│   ├── Dashboard Family
│   │   └── 003–007
│   │
│   ├── Data Acquisition Family
│   │   ├── 008 Lead Finder
│   │   └── 009 Data Extraction
│   │
│   └── Data Quality / Enrichment Family
│       └── 010 Contact / Data Enrichment
│
└── 002 ClientPortalShell

The deeper shared data pipeline is now becoming clear:

SOURCE
  ↓
DISCOVERY
Design 008
  ↓
EXTRACTION
Design 009
  ↓
NORMALIZATION / VALIDATION
  ↓
ENRICHMENT
Design 010
  ↓
DEDUPLICATION / REVIEW
  ↓
CANONICAL CRM

