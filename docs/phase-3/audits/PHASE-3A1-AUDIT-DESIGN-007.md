We continue strictly with Design 007 — Finance Dashboard, using the frozen identity and the same Phase 3A.1 audit contract. No redesign, no Design 154, and no sequence changes.

Phase 3A.1 — Master 153-Design Inventory Audit
Design 007 — Finance Dashboard
Audit field	Classification
Design ID	007
Canonical name	Finance Dashboard
Product area	Finance / Billing / Revenue Operations
User surface	Team Workspace
Screen class	Department Dashboard / Financial Operational Overview
Classification	Template Variant — Dashboard Family
Primary purpose	Give authorized Finance and executive users a consolidated view of invoicing, collections, outstanding receivables, overdue payments, payment activity, contract-linked revenue and financial exceptions
Primary entities	Invoice, Payment, PaymentTransaction
Supporting entities	Client, Company, Contract, Deal, Product/Package, Project, Proposal, User, Refund/Credit record where supported
Parent shell	InternalAppShell — Design 001
Parent page family	Canonical Dashboard Architecture
Suggested composition	FinanceDashboardComposition
Auth	Required
Permissions	Finance-specific + organization/client/data-scope permissions
Implementation priority	Core / High
Reuse level	Very High
1. Functional Responsibility

Design 007 should answer:

“What money has been invoiced, what has been collected, what remains outstanding, what is overdue, and which financial items require action?”

It is a financial monitoring, prioritization and navigation layer.

It should not become a duplicate implementation of:

Invoice Library
Invoice Detail
Payment Transactions / Reconciliation
Contracts
Deal Detail
Reporting
Accounting software
Payment-provider administration

For example:

26 overdue invoices
→ opens the canonical Invoice Library with the corresponding filter.

Payment failed
→ opens the canonical Invoice/Transaction record.

$184K outstanding
→ opens the underlying receivables records.

Contract awaiting invoice
→ opens the appropriate contract/client/project context.

The underlying financial records remain owned by their canonical modules.

2. Canonical Finance Dashboard Regions

The primary financial KPI layer should contain approved business metrics such as:

Total Invoiced
Total Collected
Outstanding Receivables
Overdue Amount
Invoices Due Soon
Payments Received
Failed / Unresolved Payments
Collection Rate

Depending on the final data model, secondary metrics may include:

Average Invoice Value
Average Days to Payment
Partially Paid Invoices
Refunded Amount
Revenue by Package
Revenue by Client
Upcoming Expected Collections

The main dashboard composition should normalize into:

Revenue / Collections Overview
Invoice Status Summary
Receivables Aging
Overdue Invoices
Recent Payments
Payment Exceptions
Expected Collections
Revenue by Client / Package
Contract-to-Invoice Attention Items
Finance Activity

3. Canonical Financial Status Model

This design must reuse the approved financial statuses rather than inventing local dashboard terminology.

Invoice lifecycle

Conceptually:

DRAFT
SENT
PAID
PARTIALLY_PAID
OVERDUE
REFUNDED

Where applicable, additional lifecycle conditions can be represented by separate fields rather than corrupting the canonical status.

For example:

Invoice Status: SENT
Payment Due Condition: DUE_SOON

or:

Invoice Status: PARTIALLY_PAID
Payment Condition: OVERDUE

This is preferable to creating combinations such as:

PARTIALLY_PAID_AND_LATE_WITH_WARNING

as arbitrary UI statuses.

4. Invoice Status vs Payment Status vs Transaction Status

This separation is critical.

An invoice, a payment obligation, and a payment-processor transaction are not the same record.

Conceptually:

Invoice
│
├── Amount Due
├── Amount Paid
├── Balance
├── Due Date
│
└── Payments
      │
      ├── Transaction A — succeeded
      ├── Transaction B — failed
      └── Transaction C — succeeded

Therefore:

Invoice Status      ≠ Payment Status
Payment Status      ≠ Transaction Status
Transaction Status  ≠ Reconciliation Status

For example, an invoice could be:

PARTIALLY_PAID

while one transaction is:

SUCCEEDED

and another is:

FAILED

The Finance Dashboard must aggregate these correctly rather than flatten everything into one “Payment Status.”

5. Reusable Component Mapping

Design 007 should reuse the canonical dashboard infrastructure identified from Designs 003–006:

PageHeader
DateRangeSelector
KpiCard
KpiTrend
ChartCard
StatusSummary
AttentionCard
ActivityFeed
EntityMiniList
ProgressCard
WidgetSkeleton
WidgetErrorState

Finance-specific composites can sit above those primitives:

RevenueSummaryWidget
CollectionSummaryWidget
ReceivablesAgingWidget
InvoiceStatusWidget
OverdueInvoicesWidget
RecentPaymentsWidget
PaymentExceptionWidget
ExpectedCollectionsWidget
RevenueByClientWidget
RevenueByPackageWidget

The architecture remains:

Design Tokens
      ↓
Shared Components
      ↓
Dashboard Components
      ↓
Finance-specific Widgets
      ↓
FinanceDashboardComposition

There should be no independent Finance dashboard design system.

6. Consolidation Decision

Design 007 completes the first major set of departmental dashboard variants:

Canonical Dashboard Family
│
├── 003 Executive / Admin Dashboard
├── 004 Sales Dashboard
├── 005 Editorial Dashboard
├── 006 Operations Dashboard
└── 007 Finance Dashboard

Later specialized analytical screens may reuse the same primitives, but do not replace these operational dashboards.

Audit classification

STANDARDIZE — REUSE DASHBOARD FAMILY

Merge Finance Dashboard with another screen?

NO.

Finance has its own security boundary, aggregation requirements, actions and user purpose.

7. Required Finance Read Model

Design 007 should consume a dedicated permission-aware financial read model such as:

FinanceDashboardSummary
│
├── InvoiceSummary
├── CollectionSummary
├── ReceivableSummary
├── AgingSummary
├── PaymentSummary
├── TransactionExceptionSummary
├── ExpectedCollectionSummary
├── ClientRevenueSummary
├── PackageRevenueSummary
└── FinanceActivitySummary

This is preferable to loading every Invoice and Payment into the browser and calculating totals client-side.

8. Canonical Metric Definitions

Financial metrics must have one definition throughout the platform.

For example:

Total Invoiced

Should have a documented rule about:

draft invoices
cancelled invoices if introduced
taxes
refunds
date period
currency conversion
Collected

Should mean actual qualifying settled/received payment—not merely an invoice marked Sent.

Outstanding

Conceptually:

Outstanding =
Valid Invoice Amount
− Qualifying Payments
− Applicable Credits / Refund Adjustments

The precise formula should eventually be frozen in the backend/data specification.

Overdue

Should derive from:

remaining balance > 0
AND
due date has passed

rather than being manually inferred by a React component.

9. Time and Reporting Period Requirements

Finance metrics require explicit period semantics.

A filter such as:

This Month

must specify whether it means:

invoice issue date,
payment receipt date,
due date,
recognized revenue period,

depending on the metric.

For example:

Invoices issued this month
and
cash collected this month

may contain completely different records.

The backend query definitions must preserve this distinction.

10. Currency Architecture

If the platform eventually supports more than one transaction currency, the dashboard must not blindly add:

$10,000
+
€8,000
+
£6,000

into one meaningless total.

Each financial record should preserve:

Original Amount
Original Currency

and, where consolidated reporting requires it:

Reporting Amount
Reporting Currency
FX Rate
FX Effective Date

If the V1 product supports only one organization currency, the architecture can remain simpler—but the finance UI should still obtain formatting from the canonical organization/regional settings rather than hard-code $.

11. Tax and Commercial-Value Boundary

The Finance Dashboard should display exactly the financial concepts supported by the actual backend.

It should not silently transform the platform into a full accounting ERP.

There is an important difference between:

CRM billing / invoicing / payments / revenue operations

and:

general ledger / journal entries / balance sheet / taxation / depreciation / statutory accounting

Unless those latter capabilities exist elsewhere in the approved product scope, Design 007 should not cause Codex to invent them.

This is an important scope-control decision.

12. Permission Architecture

Finance is one of the most sensitive areas in the entire Team Workspace.

Finance Manager

May typically receive:

organization financial overview
invoices
payment status
receivables
payment exceptions
collection information
Finance Staff

May receive appropriate operational access without necessarily having all administration privileges.

Sales Manager

May potentially see:

deal value
proposal amount
relevant client invoice status

but not necessarily:

organization-wide collections
complete payment history
sensitive transaction details
Project / Editorial User

Generally should receive only financial information necessary for their workflows, if any.

Executive/Admin

May receive broader aggregated visibility depending on effective permissions.

Permissions need to operate at three levels:

Widget Visibility
        +
Data Scope
        +
Action Permission

Being allowed to view an Outstanding Invoice amount does not automatically mean the same user can:

refund it, alter it, reconcile it, or change its payment state.

13. Financial Action Permissions

Actions should have separate authorization.

Examples:

invoice.read
invoice.create
invoice.edit
invoice.send
invoice.cancel
payment.read
payment.record
payment.reconcile
refund.create
finance.analytics.read

Exact permission names will be finalized later in Phase 3D, but the audit must preserve the distinction now.

View permission must never automatically imply financial mutation permission.

14. Quick-Action Architecture

Suitable dashboard shortcuts may include:

Create Invoice
Send Invoice
Record Payment
Open Reconciliation
Review Overdue Invoices
Open Payment Exceptions
Export Finance Report

But they must call canonical workflows.

For example:

Create Invoice
      ↓
Canonical Invoice Creation Flow

not:

Finance Dashboard
      ↓
Second independent invoice implementation

Similarly, a payment failure should navigate to the exact invoice/transaction record for investigation.

15. Payment Provider Boundary

If Stripe or another payment provider is connected, the external provider should not become the source of truth for unrelated CRM data.

A useful architectural pattern is:

Payment Provider
       ↓
Provider Event / Webhook
       ↓
Payment Service
       ↓
Canonical Transaction
       ↓
Invoice Balance Recalculation
       ↓
Finance Dashboard Aggregate

Not:

Dashboard → Directly infer invoice state from Stripe UI

This provides auditability and allows payment integrations to change later.

16. Idempotency Requirement

Financial operations require stronger guarantees than normal UI actions.

A repeated provider webhook or user retry must not accidentally create duplicate payments.

Conceptually:

Same external transaction ID
        ↓
Recognized as same operation
        ↓
No duplicate financial record

This becomes especially important for:

payment recording, refunds, webhook processing, invoice sending and reconciliation.

The dashboard itself consumes the resulting canonical state.

17. Audit Trail Requirement

Financial mutations must create meaningful activity/audit events.

Examples:

Invoice created
Invoice sent
Invoice edited
Payment recorded
Payment failed
Payment reconciled
Refund initiated
Invoice marked overdue
Invoice paid

Each important event should preserve, where applicable:

actor
timestamp
record
previous state
new state
source
external provider/reference

This later integrates with Design 138 — System Audit Logs / Compliance Activity.

18. Relationship to Designs 101–103

This distinction is important.

Design 007 — Finance Dashboard

Cross-record financial overview and prioritization.

Design 101 — Invoice Library / Invoice List

Canonical invoice search/list/filter workspace.

Design 102 — Invoice Detail / Payment Tracking

One invoice's complete operational record.

Design 103 — Payment Transactions / Reconciliation

Detailed payment/transaction reconciliation environment.

The relationship is:

Design 007
Finance Overview
      ↓
101 Invoice Library
      ↓
102 Invoice Detail
      ↓
103 Payment / Transaction Detail when needed

These screens share components and data definitions.

They must not be merged.

19. Relationship to Contracts and Deals

Financial records should maintain provenance.

Conceptually:

Lead
 ↓
Deal
 ↓
Proposal
 ↓
Contract
 ↓
Client / Project
 ↓
Invoice
 ↓
Payment

Not every invoice must necessarily originate from every preceding object, but when relationships exist they should be preserved.

A Finance user should be able to understand:

Why was this client invoiced for this amount?

without relying on manually duplicated text.

20. Relationship to Design 003 — Executive Dashboard

Design 003 may show headline metrics such as:

Revenue
Outstanding Invoices
Collections

But Design 007 is the deeper operational finance surface.

Therefore:

Design 003
Executive Summary
      ↓
Design 007
Finance Operational Dashboard
      ↓
101/102/103
Canonical Records

All should consume the same financial definitions.

If Design 003 shows $1.24M collected, Design 007 must not show $1.19M for the identical scope and period simply because two frontend components used different formulas.

21. Relationship to Design 135 — Analytics Executive Dashboard

Design 007 is primarily:

financial operations and current actionability

while Design 135 is primarily:

cross-business analytical interpretation and trend analysis.

They may share:

KPI components
charts
date-range controls
metric definitions

But Design 135 should not replace Design 007's:

overdue invoice queue
payment exceptions
operational collections workflow
Consolidation

SHARE ANALYTICS PRIMITIVES — KEEP SCREENS SEPARATE.

22. Responsive Contract
Desktop

Use the full Finance dashboard composition:

financial KPIs → revenue/collection trends → receivables → overdue invoices → payment exceptions → recent payments → secondary breakdowns

Tablet

Following Design 152:

KPI cards reflow to 2 columns
financial charts preserve readable labels
invoice tables reduce nonessential columns
secondary details use drawers/overlays
finance actions remain touch-friendly
Mobile

Following Design 151, priority should become:

Critical payment exceptions
→ Overdue amount
→ Collections / Outstanding headline
→ Invoices requiring action
→ Recent payments
→ Expected collections
→ Revenue breakdowns
→ Finance activity

Desktop tables should transform into compact financial record cards where appropriate rather than becoming unreadable compressed tables.

23. Financial Privacy on Small Screens

Mobile/tablet behavior introduces an additional concern:

sensitive amounts should not accidentally appear through unrelated global surfaces.

Permission behavior must remain identical across desktop, tablet and mobile.

Responsive transformations change layout—not authorization.

24. State Coverage

Design 007 inherits Design 150 for:

Initial Loading
Widget Loading
Refreshing
No Invoices Yet
No Payments Yet
No Overdue Invoices
No Results After Filtering
Permission Restricted
Payment Provider Unavailable
Partial API Failure
Stale Financial Data

A positive empty state should distinguish:

No overdue invoices — everything is current.

from:

Invoice data unavailable.

Those have completely different meanings.

25. Partial Failure Behavior

Financial integrations can fail independently.

Example:

Invoice Summary        ✓
Receivables            ✓
Revenue Trend          ✓
Payment Provider       ✕
Package Breakdown      ✓

The page should communicate:

payment provider data currently unavailable

without pretending that:

there are zero failed payments.

This distinction is essential for financial accuracy.

26. Backend Requirements

Recommended architecture:

FinanceDashboard
       ↓
FinanceDashboardQueryService
       ↓
Effective Permission Scope
       ↓
Finance Domain Services
       │
       ├── InvoiceService
       ├── PaymentService
       ├── TransactionService
       └── Commercial Context
       ↓
Canonical Aggregates
Backend requirement	Status
Authentication	Required
Organization isolation	Required
Finance RBAC	Required
Record/action permissions	Required
Server-side aggregates	Required
Canonical financial formulas	Critical
Decimal-safe money handling	Critical
Currency awareness	Required architecture
Idempotent payment processing	Critical
Audit trail	Critical
Payment integration abstraction	Required if provider connected
Caching	Recommended for aggregates
Data freshness metadata	Recommended
Heavy mutations from widgets	Avoid
27. Monetary Data Precision

Finance calculations must not use binary floating-point money arithmetic such as casually representing currency with frontend JavaScript floats.

Canonical amounts should use an appropriate money representation, for example:

amountMinor = 150000
currency = USD

representing:

$1,500.00

or a database decimal/money strategy with clearly defined precision.

The exact storage decision belongs to Phase 3D, but Design 007 establishes the requirement.

28. Metric Consistency Contract

The following concepts should eventually receive canonical definitions reused everywhere:

Revenue
Invoiced
Collected
Outstanding
Overdue
Collection Rate
Average Invoice Value
Payment Failure
Refunded Amount
Expected Collection

These definitions must be shared across:

Design 003 Executive Dashboard
Design 007 Finance Dashboard
Invoice screens
Payment screens
Design 130 Client Performance Report where relevant
Design 131–134 Reporting
Design 135 Analytics

29. Main Implementation Risks

The Finance Dashboard audit flags several high-priority implementation risks:

Money calculation drift
Different screens calculating financial metrics differently.

Permission leakage
Sensitive financial information appearing through generic dashboard queries.

Float precision errors
Using unsuitable numeric representation for money.

Invoice/payment conflation
Treating Invoice, Payment and Transaction as one entity.

Double processing
Webhook/retry creating duplicate payments.

Provider coupling
Embedding Stripe/provider logic directly into page components.

False zero states
Displaying $0 when an upstream service actually failed.

Missing auditability
Financial changes without actor and state history.

Scope creep
Accidentally building an entire accounting ERP from a billing/revenue dashboard requirement.

None require a new visual screen.

They require correct architecture.

Design 007 Audit Verdict
PASS — DASHBOARD TEMPLATE VARIANT

Implementation directive: Build Design 007 as a Finance-specific composition of the canonical Dashboard framework.

Financial-data directive: Invoice, Payment and Transaction remain distinct canonical entities with centralized calculations and decimal-safe monetary handling.

Permission directive: Financial visibility, data scope and mutation authority must be independently enforced server-side.

Integration directive: External payment providers feed canonical financial services; dashboard components must not depend directly on provider-specific state.

Audit directive: Material financial mutations require immutable or append-oriented audit history.

Navigation directive: Dashboard summaries deep-link into canonical Invoice, Payment, Contract, Client and related records.

Consolidation directive: STANDARDIZE COMPONENTS — DO NOT MERGE WITH INVOICE, PAYMENT OR EXECUTIVE ANALYTICS SCREENS.

Phase 3A.1 — Running Audit
Result	Count
Audited	7 / 153
PASS	7
STANDARDIZE decisions	5
MERGE screen candidates	0
FIX BEFORE CODE	0
New designs	0
Canonical architecture discovered so far
Authenticated Presentation Roots
│
├── 001 InternalAppShell
│   │
│   └── Canonical Dashboard Family
│       ├── 003 Executive / Admin Dashboard
│       ├── 004 Sales Dashboard
│       ├── 005 Editorial Dashboard
│       ├── 006 Operations Dashboard
│       └── 007 Finance Dashboard
│
└── 002 ClientPortalShell

This is already a major consolidation result:

Five visually different operational dashboards do not require five independently engineered dashboard systems. They require one reusable dashboard framework with five domain-specific compositions, queries and permission scopes.

