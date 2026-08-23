Phase 3A.1 — Master 153-Design Inventory Audit
Design 009 — Data Extraction
Audit field	Classification
Design ID	009
Canonical name	Data Extraction
Product area	Sales / Data Acquisition / Prospect Intelligence
User surface	Team Workspace
Screen class	Acquisition / Extraction Workspace
Classification	Unique Anchor — Data Acquisition Family
Primary purpose	Turn external or supplied prospect sources into structured candidate records that can later be reviewed, enriched, deduplicated and admitted into the canonical CRM
Primary entities	Extraction Job, Raw Extraction Record, Normalized Candidate
Supporting entities	Source, Prospect Candidate, Company Candidate, Contact Candidate, Import Batch, File, User
Parent shell	InternalAppShell — Design 001
Related template family	DataAcquisitionWorkspaceTemplate
Auth	Required
Permissions	Data-acquisition / sales-data scoped
Implementation priority	Core / High
Reuse level	High across later extraction/import/admin workflows
1. Functional responsibility

Design 009 should answer:

“How do we acquire prospect data from an approved source and convert it into structured records safely?”

This screen sits between discovery/source input and CRM admission.

The canonical flow should conceptually be:

Source / Input
      ↓
Extraction
      ↓
Raw Records
      ↓
Normalization
      ↓
Validation
      ↓
Deduplication
      ↓
Candidate Records
      ↓
Enrichment / Review
      ↓
CRM Admission

The critical principle is:

Extraction does not equal CRM creation.

Raw extracted information must not automatically become authoritative Company, Contact or Lead data.

2. Relationship to Design 008 — Lead Finder

These screens are closely related but distinct.

Design 008 — Lead Finder

Answers:

“Who might be worth approaching?”

It is primarily interactive discovery.

Design 009 — Data Extraction

Answers:

“How do we retrieve and structure records from the chosen source/input?”

It is primarily data acquisition and processing.

A typical relationship can be:

Lead Finder
    ↓
Candidate source / discovery request
    ↓
Data Extraction
    ↓
Normalized candidate records

However, Design 009 should also be capable of handling extraction initiated from approved sources other than an interactive Lead Finder session.

Consolidation result

SHARE ACQUISITION INFRASTRUCTURE — KEEP SCREENS SEPARATE.

3. Canonical extraction workspace regions

Without redesigning the approved screen, its implementation should normalize into these responsibilities.

Extraction input

Defines what is being processed:

source
URL/source reference where supported
uploaded file where supported
search/result set
extraction configuration
target record type
Extraction configuration

Examples could include:

People
Companies
People + Companies

and approved data attributes.

Configuration must be constrained by actual source capabilities.

Processing progress

Should expose meaningful stages rather than one vague spinner:

Queued → Fetching → Parsing → Normalizing → Validating → Deduplicating → Completed

where those stages genuinely exist.

Record preview

Shows acquired records prior to final CRM admission.

Quality / failure summary

Examples:

Extracted
Valid
Incomplete
Duplicates
Rejected
Failed

Next action

Typical handoffs:

Review Records
Send to Enrichment
Import Approved Records

The exact destination depends on the canonical workflow.

4. Extraction Job as a first-class entity

Extraction should not be treated as an invisible frontend request.

A canonical job model is required.

Conceptually:

ExtractionJob
├── id
├── organizationId
├── requestedBy
├── source
├── input
├── configuration
├── status
├── createdAt
├── startedAt
├── completedAt
├── progress
├── rawRecordCount
├── validRecordCount
├── duplicateCount
├── rejectedCount
├── failedCount
└── errorSummary

Why this matters:

large jobs may take time,
users can leave and return,
jobs may partially fail,
processing should be recoverable,
the system needs auditability,
later screens need historical job information.
5. Extraction job lifecycle

The extraction lifecycle should remain separate from the CRM lifecycle.

A reasonable conceptual state model is:

DRAFT / CONFIGURING
        ↓
QUEUED
        ↓
RUNNING
        ↓
COMPLETED

with exception branches such as:

FAILED
PARTIALLY_COMPLETED
CANCELLED

Potential internal processing stages can be tracked independently:

FETCHING
PARSING
NORMALIZING
VALIDATING
DEDUPLICATING

This avoids creating dozens of top-level statuses merely to describe internal processing.

6. Raw data must be preserved separately

This is one of the most important architectural findings for Design 009.

The pipeline should conceptually distinguish:

RawExtractionRecord
        ↓
NormalizedCandidate
        ↓
Canonical CRM Record

These are three different things.

Raw record

What the source actually returned.

Normalized candidate

Data transformed into the platform's common schema.

Canonical CRM record

A validated, deduplicated business entity accepted into operational use.

The system should avoid mutating the raw source payload into the final CRM record and thereby losing provenance.

7. Normalization requirement

Different sources may call the same concept differently.

For example:

Source A: job_title
Source B: position
Source C: currentRole

The extraction layer should normalize them into a canonical field such as:

title

Likewise:

company_name
organization
employer

can normalize toward:

company.name

The UI should consume normalized records instead of embedding provider-specific field names throughout the application.

8. Source adapter boundary

Design 009 should not know implementation details of every external source.

Correct conceptual architecture:

Data Extraction UI
       ↓
Extraction Service
       ↓
Source Adapter Interface
       ↓
┌────────────┬────────────┬────────────┐
Source A     Source B     File Input
└────────────┴────────────┴────────────┘
       ↓
Normalized Output

Not:

React page
 ├── Provider A logic
 ├── Provider B logic
 ├── Provider C logic
 └── CSV parsing logic

This abstraction becomes essential as sources change.

9. Source capability awareness

Each source may expose different capabilities.

A conceptual capability model might describe:

supportsPeople
supportsCompanies
supportsPagination
supportsDateFilter
supportsLocationFilter
supportsTitleFilter
supportsBulkFetch
rateLimit

Design 009 should only expose valid extraction options for the selected source.

The UI should not promise data a source cannot provide.

10. Provenance requirement

Every extracted record must retain enough metadata to answer:

Where did this information come from?

Conceptually:

RawExtractionRecord
├── sourceId
├── sourceRecordId
├── extractionJobId
├── sourceReference
├── extractedAt
├── rawPayloadReference
└── acquisitionMethod

This is required for:

auditing
debugging
data refresh
deduplication
quality analysis
compliance

11. Extraction vs enrichment

This distinction becomes particularly important because Design 010 is Contact / Data Enrichment.

Extraction

Obtain available source data.

Enrichment

Add, improve, validate or complete attributes using additional sources/processes.

Example:

Extracted Candidate
Name: Sarah Jones
Company: Nova Labs
Title: CEO
Email: missing

After enrichment:

Name: Sarah Jones
Company: Nova Labs
Title: CEO
Email: validated
Company domain: available
Industry: Technology
Location: Berlin

Therefore:

Design 009 extracts. Design 010 enriches.

They must not be merged into one giant data-processing screen even if they share infrastructure.

12. Data completeness vs validity

These concepts must remain separate.

A record may be:

valid but incomplete

Example:

Name ✓
Company ✓
Title ✓
Email —

Or:

complete but invalid

Example:

Name ✓
Company ✓
Title ✓
Email present but malformed ✕

Therefore the system should distinguish:

Completeness
Validity
Confidence / Source Quality

rather than create one generic “Data Quality Score.”

13. Deduplication integration

Design 009 should invoke the same canonical identity-resolution capability identified during Design 008.

The pipeline should look like:

Normalized Candidate
        ↓
Identity Matching
        ↓
Existing?
 ┌──────────────┐
 Yes            No
 ↓              ↓
Match/Link      New Candidate

But at this stage, matching does not necessarily mean updating CRM automatically.

The output can say:

Existing Contact Found

and allow the next workflow to determine whether data should:

be ignored,
enrich the existing record,
be reviewed,
create a new record.
14. Idempotency requirement

Extraction retry behavior must be safe.

Example:

Job starts
   ↓
Source returns 5,000 records
   ↓
network interruption
   ↓
system retries

The retry should not result in:

10,000 duplicated records

The job/service layer needs appropriate:

source record identity
job identity
page/cursor tracking
deduplication
idempotent processing

15. Pagination / cursor recovery

For large external datasets, extraction may occur over multiple pages/cursors.

Conceptually:

Page/Cursor 1 ✓
Page/Cursor 2 ✓
Page/Cursor 3 ✓
Page/Cursor 4 ✕

The system should ideally be able to resume rather than start the entire job from zero when the source supports it.

That becomes a backend capability—not a UI workaround.

16. Rate-limit handling

External acquisition sources commonly impose limits.

The extraction system should understand conditions such as:

RUNNING
↓
RATE_LIMITED
↓
WAIT / RETRY
↓
RUNNING

This should not necessarily be classified as a permanent job failure.

The UI may display:

Paused by source limit — retry scheduled

rather than:

Extraction failed

when that is the actual condition.

17. Partial completion

A major job might process:

10,000 requested

8,740 successful
   610 duplicates
   420 invalid
   230 failed

That is not accurately represented by either:

Success
or
Failure

alone.

Design 009 should support a meaningful:

PARTIALLY_COMPLETED

condition where the backend workflow requires it.

Valid records should remain usable while problematic subsets are reviewable/retryable.

18. Reusable component mapping

Design 009 reuses standard components:

PageHeader
StatusBadge
ProgressBar
DataTable
FilterBar
SearchInput
Checkbox
Pagination
Alert
Drawer
Modal
EmptyState
LoadingState
ErrorState

It also establishes acquisition-specific composites:

ExtractionSourceSelector
ExtractionConfigPanel
ExtractionJobProgress
ProcessingStageIndicator
ExtractionRecordPreview
ExtractionQualitySummary
ExtractionErrorSummary
SourceCapabilityNotice
ImportHandoffAction

This extends the architecture discovered from Design 008:

Data Acquisition Family
│
├── Discovery Workspace
│   └── 008 Lead Finder
│
└── Extraction Workspace
    └── 009 Data Extraction
19. Bulk-processing architecture

Large extraction must happen through backend jobs/queues.

Not:

Browser
→ fetch record 1
→ fetch record 2
→ ...
→ fetch record 10,000

Instead:

Browser creates ExtractionJob
            ↓
        Job Queue
            ↓
     Acquisition Worker
            ↓
   Source / Input Adapter
            ↓
       Raw Records
            ↓
   Processing Pipeline

The browser monitors job state rather than owning execution.

20. Permission architecture

Possible permission dimensions later include:

data_extraction.read
data_extraction.create
data_extraction.run
data_extraction.cancel
data_extraction.retry
data_extraction.export
data_extraction.import

Exact permission names will be defined in Phase 3D.

But the audit establishes that:

Viewing extraction results must not automatically grant extraction, export, import, cancellation or retry privileges.

21. Source credential security

If extraction sources require credentials or API tokens:

credentials must never be exposed in page source, browser state, logs or raw result exports.

Correct architecture:

UI
↓
Backend Extraction Service
↓
Secure credential store
↓
External provider

The frontend requests use of a configured source; it should not receive the secret credential itself.

22. Export boundary

Extraction results may be sensitive.

Therefore:

VIEW ≠ EXPORT

Bulk extraction export should have:

explicit permission,
tenant scope,
audit event,
potentially size/record limits,
sensitive-field controls where required.

This mirrors the requirement found in Design 008.

23. Audit history

Important events include:

Extraction job created
Job started
Source contacted
Processing completed
Partial failure occurred
Job retried
Job cancelled
Records exported
Records sent to enrichment/import

Relevant events should later surface in:

Design 138 — System Audit Logs / Compliance Activity

without putting raw secrets or unnecessary personal data into audit logs.

24. Relationship to Designs 082–083

This needs explicit audit treatment because later screens have similar names.

Design 009 — Data Extraction

This is the core business-user extraction experience in the earlier sales/acquisition workflow.

Design 082 — Data Extraction Jobs / Extraction Runs

This later design provides a deeper dedicated job/run management workspace.

Design 083 — Extraction Review / Imported Records

This is the downstream review and record-quality workspace.

Therefore, we should not implement three independent extraction engines.

Correct architecture:

Canonical Extraction Service
        │
        ├── Design 009
        │   Guided/business-user extraction experience
        │
        ├── Design 082
        │   Job/run management
        │
        └── Design 083
            Result review/import management
Important consolidation finding

Design 009 and 082 are strong implementation-overlap candidates, but not yet screen-merge candidates.

We preserve both approved screens until the later Design 082 audit lets us compare their exact responsibilities.

This is precisely the kind of duplication Phase 3A is intended to expose.

25. Relationship to Design 148 — Data Import / Export Administration

Design 148 later operates at platform administration scale.

Design 009 is domain-specific:

prospect/data acquisition for the sales pipeline.

They can share:

job infrastructure
parsing
validation
progress
error handling
downloadable result/error files

But Design 009 should not become generic system-wide data administration.

26. Responsive contract
Desktop

The approved workspace can preserve:

configuration + job state + record table + processing summary

with relatively dense information.

Tablet — Design 152

Adapt to:

collapsible extraction configuration,
1–2-column structure,
responsive progress summary,
priority record columns,
touch-safe job controls,
detail drawer/overlay.
Mobile — Design 151

Prioritize:

Job status
→ Progress
→ Success / failure counts
→ Important errors
→ Record preview cards
→ Next action

Complex desktop record tables should transform into cards or simplified record rows rather than shrink.

Running extraction should continue server-side even when the mobile screen is closed.

27. State coverage

Design 009 needs strong reuse of Design 150 plus acquisition-specific states:

No Extraction Created
Configuration Incomplete
Queued
Starting
Running
Processing
Rate Limited
Partial Source Failure
Partially Completed
Completed
Failed
Cancelled
Retrying
No Valid Records
Permission Restricted
Source Authentication Expired
Network Failure

These conditions must not be collapsed into one loading/error system.

28. Partial failure contract

Suppose:

People extraction       ✓
Company details         ✓
Email acquisition       ✕

The system should preserve successful fields/records and communicate that a subset is incomplete.

A provider failure should not necessarily destroy the full extraction output.

29. Backend requirements

Recommended architecture:

DataExtraction UI
        ↓
Extraction API / Service
        ↓
Permission + Tenant Scope
        ↓
Extraction Job Manager
        ↓
Queue / Workers
        ↓
Source Adapters
        ↓
Raw Record Store
        ↓
Normalization
        ↓
Validation
        ↓
Identity Resolution
        ↓
Normalized Candidate Store
Requirement	Status
Authentication	Required
Tenant isolation	Required
Extraction RBAC	Required
Source abstraction	Critical
Background jobs	Critical
Retry handling	Required
Rate-limit handling	Required
Idempotency	Critical
Raw-data preservation	Required
Normalization	Critical
Validation	Required
Deduplication	Critical
Provenance	Critical
Audit events	Required
Secure credentials	Critical
Partial-result support	Required
30. Main implementation risks

The audit flags:

Browser-owned extraction
Long-running acquisition logic executed directly by the frontend.

Provider coupling
Page components tied to one extraction source.

CRM contamination
Raw source records immediately becoming Contacts/Leads.

Lost provenance
Normalized records without original source lineage.

Duplicate processing
Retries creating duplicate records.

Raw data destruction
Transformation overwriting the original acquired representation.

Secrets exposure
External source credentials reaching frontend code.

Poor partial-failure handling
One bad page/provider causing the entire extraction to vanish.

Extraction/enrichment confusion
Design 009 and Design 010 implementing the same responsibilities.

Duplicate extraction engines
Designs 009 and 082 being built separately without shared backend infrastructure.

These are architecture issues—not reasons to create or redesign screens.

Design 009 Audit Verdict
PASS — DATA ACQUISITION WORKSPACE ANCHOR

Template directive: Design 009 establishes an extraction-oriented composition within the broader DataAcquisitionWorkspace family.

Processing directive: Extraction must run through canonical backend jobs/workers rather than browser-owned long-running processing.

Data directive: Preserve Raw Extraction Record → Normalized Candidate → Canonical CRM Record as separate layers.

Source directive: All providers and input methods operate behind canonical source/adaptor interfaces.

Identity directive: Normalization, validation and deduplication precede CRM admission.

Reliability directive: Jobs require retry, idempotency, partial-result and rate-limit behavior.

Security directive: Source secrets remain server-side and bulk export requires explicit authorization.

Consolidation directive: SHARE ONE EXTRACTION ENGINE WITH DESIGNS 082–083; DO NOT MERGE THE APPROVED SCREENS YET.

Phase 3A.1 — Running Audit
Result	Count
Audited	9 / 153
PASS	9
STANDARDIZE decisions	7
Potential implementation-overlap flags	1
MERGE screen candidates	0 pending later comparison
FIX BEFORE CODE	0
New designs	0
Architecture discovered so far
Authenticated Presentation
│
├── 001 InternalAppShell
│   │
│   ├── Dashboard Family
│   │   ├── 003 Executive / Admin
│   │   ├── 004 Sales
│   │   ├── 005 Editorial
│   │   ├── 006 Operations
│   │   └── 007 Finance
│   │
│   └── Data Acquisition Family
│       ├── 008 Lead Finder
│       └── 009 Data Extraction
│
└── 002 ClientPortalShell

We have now identified an important future consolidation checkpoint:

Design 009 and later Designs 082–083 must share one canonical extraction/import processing engine, even though their approved UX surfaces remain distinct unless the later audit proves one screen genuinely duplicates another.

