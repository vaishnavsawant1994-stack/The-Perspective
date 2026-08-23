Correct. We continue strictly with the frozen **Design 020 — Invoice / Payment Workspace**. No redesign, no additional screen, and no sequence change.

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 020 — Invoice / Payment Workspace

| Audit field                     | Classification                                                                                                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                   | **020**                                                                                                                                                               |
| **Canonical name**              | **Invoice / Payment Workspace**                                                                                                                                       |
| **Product area**                | Finance / Billing / Collections                                                                                                                                       |
| **User surface**                | Team Workspace                                                                                                                                                        |
| **Screen class**                | Financial Record Detail + Payment Operations Workspace                                                                                                                |
| **Classification**              | **Unique Anchor — Billing & Payment Workspace Family**                                                                                                                |
| **Primary purpose**             | Create, issue, track and reconcile client invoices while maintaining accurate payment, balance, overdue and transaction history tied back to the commercial agreement |
| **Primary entities**            | **Invoice, Payment**                                                                                                                                                  |
| **Core child/support entities** | InvoiceLineItem, PaymentTransaction, PaymentAllocation, BillingContact, DocumentArtifact                                                                              |
| **Supporting entities**         | Contract, ContractVersion, ProposalVersion, Deal, Client, Company, Product/Package, Project, User, Activity                                                           |
| **Parent shell**                | `InternalAppShell` — Design 001                                                                                                                                       |
| **Template family**             | `BillingPaymentWorkspaceTemplate`                                                                                                                                     |
| **Auth**                        | Required                                                                                                                                                              |
| **Permissions**                 | Finance/billing read/create/edit/send/payment/reconciliation/refund operations with organization/client scope                                                         |
| **Implementation priority**     | **Core / Critical**                                                                                                                                                   |
| **Reuse level**                 | **Extremely High**                                                                                                                                                    |

---

# 1. Functional responsibility

Design 020 answers:

> **“What amount does this client owe, why do they owe it, when is it due, what has actually been paid, which transactions produced those payments, and what remains outstanding?”**

The commercial chain now becomes:

```text
Deal
 ↓
Accepted Proposal Version
 ↓
Executed Contract
 ↓
Billing obligation
 ↓
Invoice
 ↓
Payment
 ↓
Payment Transaction(s)
 ↓
Reconciliation
 ↓
Paid / Partially Paid / Outstanding
```

The critical rule is:

> **Invoice ≠ Payment ≠ PaymentTransaction ≠ Payment Provider Event.**

They may be tightly related, but they represent different business concepts.

---

# 2. Invoice as the canonical receivable record

An Invoice represents:

> **A formal request for payment from a client.**

Conceptually:

```text
Invoice
├── invoiceNumber
├── client/company
├── issueDate
├── dueDate
├── currency
├── lineItems
├── subtotal
├── adjustments/tax where supported
├── total
├── amountPaid
├── balanceDue
├── billing contact
├── commercial lineage
└── lifecycle
```

It should not be represented merely by a PDF file.

The PDF/document is an artifact generated from the canonical Invoice record.

---

# 3. Invoice ≠ Payment

An Invoice says:

> **“$1,500 is owed.”**

A Payment says:

> **“$500 was actually received/applied.”**

Example:

```text
Invoice
Total: $1,500
        ↓
Payment A: $500
Payment B: $1,000
        ↓
Balance: $0
```

Therefore one Invoice may have:

```text
0..N Payments
```

and one payment event must not simply overwrite a single `invoice.paymentStatus` field without preserving the underlying history.

---

# 4. Payment ≠ PaymentTransaction

This distinction is even more important.

### Payment

The canonical business representation of money received/applied.

### PaymentTransaction

The technical/provider-level attempt or transfer event.

Example:

```text
Invoice INV-1045
      ↓
Payment attempt
      ↓
Transaction 1 — FAILED
      ↓
Retry
      ↓
Transaction 2 — SUCCEEDED
      ↓
Canonical Payment created/applied
```

Thus:

```text
Invoice
≠
Payment
≠
PaymentTransaction
```

This matches the financial separation established earlier in Design 007.

---

# 5. Payment provider event ≠ Transaction either

Stripe, bank, or another provider may emit multiple events concerning one transaction.

Conceptually:

```text
Provider Event
      ↓
Payment Integration Service
      ↓
Canonical PaymentTransaction
      ↓
Payment / Allocation
      ↓
Invoice balance
```

A webhook should not directly toggle:

```text
invoice.status = PAID
```

without canonical reconciliation.

---

# 6. Invoice lifecycle

The previously approved invoice states should remain canonical:

```text
DRAFT
SENT
PAID
PARTIALLY_PAID
OVERDUE
REFUNDED
```

But the architecture should still distinguish **stored lifecycle** from **derived due condition** where appropriate.

For example:

```text
Invoice:
PARTIALLY_PAID

Due Condition:
OVERDUE
```

may be preferable to inventing:

```text
PARTIALLY_PAID_OVERDUE
```

as another enum.

Exact normalization belongs to Phase 3D.

---

# 7. Due condition should generally be derived

Conceptually:

```text
balanceDue > 0
AND
dueDate < now
```

produces:

```text
OVERDUE
```

This should be calculated through canonical billing logic.

Do not rely on a nightly frontend-style status mutation simply to make an Invoice overdue.

---

# 8. Invoice line items

Commercial obligations should remain structured.

Conceptually:

```text
InvoiceLineItem
├── description
├── quantity
├── unitAmount
├── amount
├── product/package reference where appropriate
├── project/milestone reference where appropriate
└── display order
```

This permits:

* reliable totals,
* reporting,
* reconciliation,
* invoice regeneration,
* revenue analysis.

Do not bury all billing detail inside one rich-text field.

---

# 9. Commercial lineage

An Invoice should be able to answer:

> **Why was this amount billed?**

Potential lineage:

```text
Deal
 ↓
Accepted Proposal Version
 ↓
Executed Contract Version
 ↓
Invoice
```

Depending on the workflow, an Invoice can additionally reference:

```text
Client
Project
Milestone
Product / Package
```

This avoids manually retyping commercial terms with no provenance.

---

# 10. Contract snapshot vs Invoice obligation

Invoice generation should use the applicable executed commercial terms.

Correct:

```text
Executed Contract / Billing Schedule
            ↓
Invoice creation
```

Not:

```text
latest editable Proposal Draft
            ↓
Invoice
```

The Invoice should preserve its own billing snapshot once issued.

---

# 11. Issued Invoice immutability

A Draft Invoice may be editable.

Once issued to the client, material fields should not be freely rewritten.

For example, changing:

**$1,500 → $2,000**

after sending should generally require controlled correction/version/credit/replacement behavior depending on the business rules.

At minimum:

> **Issued invoice history must remain reconstructable.**

The exact adjustment model is finalized later.

---

# 12. Invoice artifact

A useful architecture is:

```text
Invoice
  ↓
InvoiceDocumentArtifact
```

The Invoice contains canonical structured billing data.

The artifact contains:

* PDF,
* client-viewable representation,
* printable/downloadable snapshot.

Historical artifacts should correspond to the relevant issued Invoice state.

---

# 13. Invoice number generation

Invoice numbers require controlled uniqueness.

Conceptually:

```text
Organization
   ↓
InvoiceNumberSequence
   ↓
INV-2026-001024
```

Generation belongs server-side.

The browser must never determine authoritative sequential invoice numbers.

Potential numbering rules belong to Workspace/Finance settings later.

---

# 14. Money precision

The rules from Designs 007 and 018 remain mandatory.

Canonical monetary values should use:

* minor-unit integers, or
* an appropriate decimal strategy,

with explicit currency.

Never rely on floating-point arithmetic for authoritative totals.

---

# 15. Invoice total

Conceptually:

```text
Subtotal
± Adjustments
+ Applicable Tax
= Invoice Total
```

where taxes/adjustments actually exist in scope.

Server-side calculations remain authoritative.

The audit does not expand this into full tax/accounting software.

---

# 16. Invoice total ≠ balance due

Example:

```text
Invoice Total: $1,500
Payments: $500
Balance Due: $1,000
```

Therefore:

```text
total
amountPaid
balanceDue
```

must remain conceptually separate.

A payment should not rewrite the original Invoice Total.

---

# 17. Partial payment

Partial payment is a first-class scenario.

Example:

```text
Invoice: $1,500

Payment A:
$500
        ↓
Invoice:
PARTIALLY_PAID
Balance:
$1,000
```

Then:

```text
Payment B:
$1,000
        ↓
Invoice:
PAID
Balance:
$0
```

All payments remain historically visible.

---

# 18. Payment allocation

The architecture should support explicit allocation.

Conceptually:

```text
Payment
      ↓
PaymentAllocation
├── Invoice A: $500
└── Invoice B: $300
```

if the business later allows one payment to cover multiple invoices.

Even if V1 initially uses one Payment → one Invoice, avoiding a hard-coded assumption keeps the model extensible.

Phase 3D decides the actual scope.

---

# 19. Manual payment vs provider payment

Payments may potentially originate from:

**online provider**
**bank transfer**
**manual recording**

where supported.

These should share a canonical Payment model with different:

```text
paymentMethod
source
reference
```

The Invoice UI should not assume all money comes through one payment provider.

---

# 20. Payment transaction lifecycle

Provider transactions may conceptually contain states such as:

```text
PENDING
SUCCEEDED
FAILED
CANCELLED
REFUNDED
```

Exact provider-normalized enums belong later.

Transaction state must not be confused with Invoice lifecycle.

For example:

```text
Transaction:
FAILED

Invoice:
SENT
```

is perfectly valid.

---

# 21. Payment processing must be idempotent

This is critical.

Example:

```text
Provider payment succeeds
       ↓
webhook delivered
       ↓
same webhook delivered again
```

The correct result is:

> **one canonical transaction/payment**

not:

> **two payments applied to the same Invoice.**

Provider IDs and idempotency keys must be enforced.

---

# 22. Payment recording must be atomic

A successful canonical payment application may involve:

```text
Create/confirm Payment
      ↓
Create allocation
      ↓
Update derived Invoice balance
      ↓
Emit payment event
      ↓
Activity/audit
```

These operations need transactional consistency.

The application must not end up with:

```text
Payment exists
Invoice still shows old balance indefinitely
```

because half the mutation failed.

---

# 23. Invoice state should derive from financial truth

Whenever possible:

```text
Invoice state
      ↓
derived from
      ↓
Invoice amount
Payment allocations
Refund/credit adjustments
Due date
```

rather than arbitrary manual status toggling.

For example, Finance staff should not casually click:

> Mark Paid

without a corresponding canonical Payment or authorized adjustment record.

---

# 24. Manual “mark paid” boundary

If the workflow supports manually recording offline payment, the action should be:

```text
Record Payment
```

with:

* amount,
* date,
* method/reference,
* actor,
* supporting note where needed.

Then the Invoice becomes Paid through canonical financial calculation.

This is safer than a bare:

```text
invoice.status = PAID
```

---

# 25. Overpayment

Architecture should not make overpayment impossible.

Example:

```text
Invoice total: $1,500
Payment received: $1,600
```

The system must eventually know whether the excess is:

* unapplied credit,
* error,
* refundable balance,

according to business scope.

We do not add an overpayment UI now.

We simply avoid a data model that silently discards the extra $100.

---

# 26. Refund ≠ Invoice deletion

If a Payment is refunded:

```text
Payment
   ↓
Refund / reversal
```

the historical Payment remains.

The Invoice's resulting financial state is recalculated appropriately.

Do not delete the Payment row or rewrite history as though the payment never happened.

---

# 27. Refund ≠ Contract cancellation

Similarly:

```text
Payment refunded
≠
Contract cancelled
```

These are independent business lifecycles.

Any cross-domain consequence must be governed by explicit workflow rules.

---

# 28. Payment failure

A failed transaction should preserve:

```text
provider reference
failure type
failure timestamp
retry context
```

where appropriate.

But sensitive card/payment details should not be stored outside the secure provider model.

The platform should avoid retaining prohibited payment credentials.

---

# 29. PCI/payment-data boundary

If card payments are supported, the application should rely on compliant provider-hosted/tokenized flows.

The product should not store raw:

**card number**
**CVV**

inside its database.

Design 020 manages the billing business workflow, not raw payment credentials.

---

# 30. Payment provider abstraction

Correct:

```text
Invoice / Payment Workspace
          ↓
Payment Service
          ↓
Provider Adapter
          ↓
Stripe / other provider
```

Not:

```text
React component
   ↓
provider-specific business logic
```

This also lets offline/manual payments coexist with provider payments.

---

# 31. Reconciliation

Payment success at a provider and internal accounting/business application of that payment are related but distinguishable.

Conceptually:

```text
Provider Transaction
       ↓
Canonical Payment
       ↓
Allocation
       ↓
Reconciliation
```

A transaction may be received but require review if:

* amount differs,
* invoice cannot be identified,
* currency mismatches,
* duplicate references exist.

---

# 32. Reconciliation state ≠ payment status

For example:

```text
Transaction:
SUCCEEDED

Reconciliation:
NEEDS_REVIEW
```

can be valid.

The money arrived, but the platform does not yet know which Invoice should receive it.

This distinction becomes essential later in Design 103 — Payment Transactions / Reconciliation Workspace.

---

# 33. Relationship to Design 103

Later:

**Design 103 — Payment Transactions / Reconciliation Workspace**

will provide a much deeper transaction-management surface.

Correct architecture:

```text
Canonical Payment Domain
      │
      ├── Design 020
      │   Invoice-context payment workspace
      │
      └── Design 103
          Global transaction/reconciliation operations
```

### Audit decision

**SHARED FINANCIAL DOMAIN — DO NOT MERGE SCREENS YET.**

---

# 34. Relationship to Designs 101–102

Later:

**Design 101 — Invoice Library / Invoice List**
**Design 102 — Invoice Detail / Payment Tracking**

This creates another major overlap checkpoint.

Expected:

```text
Canonical Invoice Domain
       │
       ├── Design 020
       │   commercial-flow Invoice/Payment workspace
       │
       ├── Design 101
       │   invoice library
       │
       └── Design 102
           deeper invoice/payment tracking detail
```

Design 020 and Design 102 may have significant implementation overlap.

We do **not** merge now.

We compare them when Design 102 receives its audit.

---

# 35. Client-facing invoice boundary

The Team Workspace can contain internal finance information such as:

* internal notes,
* reconciliation state,
* provider errors,
* staff actions.

Client-facing Invoice screens should receive only appropriate billing information.

Therefore:

```text
Internal Invoice Workspace
≠
Client Invoice Detail
```

even when both reference the same canonical Invoice.

---

# 36. Client payment action

If Client Portal allows payment:

```text
Client Invoice
      ↓
Pay
      ↓
Canonical Payment Service
      ↓
Provider
      ↓
Payment / Transaction
      ↓
Invoice updated
```

There must not be a separate client-side payment database.

---

# 37. Contract payment terms

Design 019 may define payment terms.

Design 020 should consume them when generating billing obligations.

For example:

```text
Contract
$1,500 total
50% upfront
50% on publication
```

might conceptually produce multiple billing obligations/invoices if that workflow exists.

The Invoice should preserve the related term/milestone provenance.

---

# 38. Billing schedule ≠ Invoice

A Contract can describe:

> payment due in three stages.

Those are obligations/schedule terms.

Actual issued Invoices remain separate records.

This distinction should remain available architecturally.

---

# 39. Invoice due date history

Changing due date after issuance is financially meaningful.

Such changes should preserve:

**old due date**
**new due date**
**actor**
**timestamp**

rather than silently rewriting history.

---

# 40. Payment reminder boundary

Invoice reminders can be generated based on:

**due soon**
**overdue**

but the Reminder/Notification system owns delivery scheduling.

Design 020 should not build a second general notification engine.

Later alert/rule systems can consume financial conditions.

---

# 41. Billing contact ≠ arbitrary Contact

The Company may have many Contacts.

An Invoice should identify the intended billing recipient(s) where appropriate.

This can reference canonical Contact records while preserving issued recipient details if needed.

A later Contact email change should not make historical delivery context impossible to reconstruct.

---

# 42. Invoice delivery state

Sending an Invoice should preserve delivery events separately from payment state.

Conceptually:

```text
Invoice:
SENT

Delivery:
DELIVERED

Payment:
NONE
```

and later:

```text
Invoice:
PARTIALLY_PAID
```

Do not treat invoice email delivery as payment progress.

---

# 43. Invoice view state

If client view tracking is supported:

```text
SENT
DELIVERED
VIEWED
```

remain separate interaction states.

A viewed Invoice is not a paid Invoice.

---

# 44. Invoice cancellation / void boundary

If the business needs cancelled/void invoices later, that should be a controlled financial action.

The current frozen approved status set already contains Draft/Sent/Paid/Partially Paid/Overdue/Refunded.

We should **not invent a new visual status now**.

Phase 3D can determine whether cancellation/void needs a separate canonical condition based on actual workflow requirements.

This keeps the audit faithful to the approved design.

---

# 45. Reusable component mapping

Design 020 introduces/reuses:

`FinancialRecordHeader`
`InvoiceSummaryCard`
`InvoiceLineItemsTable`
`InvoiceStatusBadge`
`DueConditionBadge`
`PaymentSummary`
`BalanceSummary`
`PaymentHistoryTable`
`PaymentTransactionRow`
`PaymentMethodBadge`
`RecordPaymentDialog`
`SendInvoiceAction`
`PaymentProviderState`
`ReconciliationIndicator`
`InvoiceActivityTimeline`
`InvoiceDocumentViewer`

Shared lower-level infrastructure comes from:

**Entity Detail Workspace**
**Versioned Commercial Documents**
**Finance Dashboard components**

---

# 46. New reusable family

We now formally add:

```text
Billing & Payment Workspace Family
        │
        └── 020 Invoice / Payment Workspace
```

This family will later underpin:

```text
101 Invoice Library
102 Invoice Detail / Payment Tracking
103 Payment Transactions / Reconciliation
```

with different compositions.

---

# 47. Entity Detail reuse

Design 020 is another composition rather than a completely new page shell:

```text
EntityDetailWorkspace
      +
FinancialRecord Components
      +
Payment Operations
      =
Invoice / Payment Workspace
```

Therefore components such as:

`RecordHeader`
`RecordTabs`
`ActivityTimeline`
`RelatedEntityCard`

should remain shared.

---

# 48. Permission architecture

Potential future capabilities include:

```text
invoice.read
invoice.create
invoice.edit
invoice.send
invoice.record_payment
invoice.export

payment.read
payment.record
payment.reconcile
payment.refund
```

Exact names wait for Phase 3D.

The important distinction is:

```text
READ
≠
CREATE
≠
SEND
≠
RECORD PAYMENT
≠
REFUND
```

Financial mutation authority must remain granular.

---

# 49. Finance vs Sales permission

A Sales user might legitimately see:

**Invoice: Sent**
**Payment: Paid**

for their Deal/client.

But that does not mean they can:

**change amount**
**record payment**
**refund**
**reconcile transaction**

The workspace and underlying queries need field/action-level permission boundaries where appropriate.

---

# 50. Client scope

Finance users may have organization-wide access.

Other users may only see Invoices associated with:

* their Deals,
* managed Clients,
* assigned Projects.

Tenant isolation and business scope must be applied server-side.

---

# 51. Export/download permission

Viewing an Invoice does not automatically imply unrestricted download/export rights, especially for bulk financial information.

At minimum:

```text
READ ≠ BULK EXPORT
```

Exact single-document download behavior is handled through the approved permission model.

---

# 52. Activity history

Important events include:

**Invoice created**
**Invoice edited**
**Invoice issued**
**Invoice sent**
**Invoice viewed**
**Due date changed**
**Payment received**
**Payment applied**
**Partial payment recorded**
**Payment failed**
**Payment reconciled**
**Refund recorded**
**Invoice fully paid**

These should link back to the canonical source records.

---

# 53. Audit history

Higher-assurance audit events are particularly important for:

**amount changes**
**manual payment recording**
**reconciliation**
**refunds**
**billing recipient changes**
**due-date changes**

Audit should preserve actor and before/after context where appropriate.

---

# 54. Concurrency

Example:

```text
Finance User A records $500 payment
Finance User B records $1,000 payment
```

Both should be applied correctly through transactional financial services.

Another:

```text
User A edits Draft Invoice
User B issues it
```

The backend must prevent stale Draft edits from silently modifying the already-issued Invoice.

---

# 55. Payment race conditions

Suppose:

```text
Client pays online
        ↓
Provider event still processing
```

while:

```text
Finance staff manually records payment
```

The system needs duplicate detection/reconciliation controls.

Provider reference, amount, date, account and other safe identifiers can help.

Financial correctness cannot rely on UI freshness alone.

---

# 56. Partial failure

Example:

```text
Invoice core                  ✓
Payment history               ✓
PDF artifact                  ✓
Payment provider live status  ✕
```

The workspace should remain usable.

It should show:

> **Provider status temporarily unavailable**

rather than:

> **No payments.**

---

# 57. Client payment failure

If a provider charge/payment attempt fails:

```text
PaymentTransaction:
FAILED
```

the Invoice can remain:

```text
SENT / OVERDUE
```

with unchanged balance.

The UI should show failure context without falsely treating the Invoice itself as corrupted.

---

# 58. Responsive contract — Desktop

Desktop should preserve the approved high-productivity financial workspace:

**Invoice summary → client/commercial context → line items → balance/payment status → payment history → document/activity/actions**

Desktop remains best for reconciliation and detailed finance operations.

---

# 59. Responsive contract — Tablet

Following Design 152:

* summary cards become two-column,
* line items preserve essential columns,
* secondary commercial details collapse,
* payment history becomes touch friendly,
* dialogs become adaptive drawers where appropriate.

---

# 60. Responsive contract — Mobile

Following Design 151, prioritize:

```text
Invoice Number / Client
↓
Total / Paid / Balance
↓
Status / Due Date
↓
Primary Payment Action
↓
Line Items
↓
Payment History
↓
Commercial Context
↓
Activity
```

Dense transaction tables become cards/stacked rows.

Internal reconciliation complexity can move behind focused detail screens/drawers.

---

# 61. Mobile client invoice

Client-facing mobile presentation should prioritize:

**Amount Due**
**Due Date**
**Invoice Items**
**Payment Status**
**Pay / Download where permitted**

and omit internal reconciliation/provider details.

---

# 62. State coverage

Design 020 inherits Design 150 plus financial states:

**New Draft Invoice**
**Invoice Saving**
**Invoice Ready to Send**
**Sending**
**Delivery Failed**
**Sent**
**Viewed**
**Payment Pending**
**Partially Paid**
**Paid**
**Overdue**
**Payment Failed**
**Payment Provider Unavailable**
**Payment Needs Reconciliation**
**Refunded**
**Record Updated Elsewhere**
**Permission Restricted**
**Related Contract Unavailable**
**Partial Service Failure**

These states must remain distinct.

---

# 63. Empty-state semantics

Important distinctions:

> **No Payments Yet**

means the Invoice exists and nothing has been received.

> **Payment History Unavailable**

means the system cannot currently retrieve it.

> **Balance $0**

means financial obligations have been satisfied or otherwise adjusted according to canonical calculations.

Never collapse these into one “empty” component with ambiguous meaning.

---

# 64. Backend architecture

Recommended conceptual structure:

```text
Invoice / Payment Workspace
          ↓
Invoice Query / Command Layer
          ↓
Tenant + Permission Scope
          │
          ├── Invoice Domain
          │     ├── Invoice
          │     ├── Line Items
          │     ├── Billing snapshot
          │     └── Document artifact
          │
          ├── Payment Domain
          │     ├── Payment
          │     ├── Allocation
          │     └── Reconciliation
          │
          └── Transaction Service
                └── Provider Adapter
          ↓
Contract / Proposal / Deal lineage
```

---

# 65. Read model vs financial commands

Design 020 can consume a composed:

```text
InvoicePaymentWorkspaceView
```

containing:

* Invoice
* client
* commercial lineage
* line items
* totals
* payments
* transaction summaries
* activity.

But commands remain domain-specific:

```text
createInvoice()
updateDraftInvoice()
issueInvoice()
sendInvoice()
recordPayment()
allocatePayment()
reconcileTransaction()
refundPayment()
```

Avoid a generic:

```text
PATCH /invoice-workspace
```

that modifies unrelated financial concerns simultaneously.

---

# 66. Backend requirements

| Requirement                       | Status                       |
| --------------------------------- | ---------------------------- |
| Authentication                    | **Required**                 |
| Tenant isolation                  | **Critical**                 |
| Finance/billing RBAC              | **Critical**                 |
| Canonical Invoice entity          | **Critical**                 |
| Structured Invoice Line Items     | **Critical**                 |
| Commercial lineage                | **Critical**                 |
| Currency-safe monetary handling   | **Critical**                 |
| Server-side total calculation     | **Critical**                 |
| Canonical Payment entity          | **Critical**                 |
| PaymentTransaction separation     | **Critical**                 |
| Payment allocation                | **Required architecture**    |
| Partial-payment support           | **Critical**                 |
| Derived balance/due logic         | **Critical**                 |
| Provider abstraction              | **Critical**                 |
| Provider secrets isolation        | **Critical**                 |
| Webhook/event idempotency         | **Critical**                 |
| Transactional payment application | **Critical**                 |
| Reconciliation model              | **Critical**                 |
| Refund/history preservation       | **Required where supported** |
| Invoice artifact generation       | **Required**                 |
| Concurrency protection            | **Required**                 |
| Activity history                  | **Required**                 |
| Audit history                     | **Critical**                 |
| Partial service failure handling  | **Required**                 |

---

# 67. Canonical metric contract

The following financial metrics need one shared definition:

**Total Invoiced**
**Collected**
**Outstanding**
**Overdue Amount**
**Partially Paid**
**Invoices Paid**
**Collection Rate**
**Average Days to Payment**
**Payment Failures**
**Refunded Amount**

They must stay consistent across:

**Design 003 Executive Dashboard**
**Design 007 Finance Dashboard**
**Design 020 Invoice / Payment Workspace**
**Designs 101–103**
**Reports / Analytics**

No frontend-specific formulas.

---

# 68. Relationship to Client conversion

Invoice/payment may be required before particular onboarding or production stages depending on business policy.

But Design 020 should emit authoritative financial events such as:

```text
InvoicePaid
```

or:

```text
DepositReceived
```

where supported.

Downstream onboarding/project workflow decides what those events enable.

The Invoice page should not directly mutate arbitrary Project stages.

---

# 69. Relationship to Design 106

Later:

**Design 106 — Client Conversion / Won Deal Handoff**

will coordinate commercial-to-client transition.

The handoff may consume:

**Deal Won**
**Contract Signed**
**Payment state**

according to the final business rules.

Those prerequisites must come from their canonical domains rather than duplicate checkbox fields inside the handoff screen.

---

# 70. Main implementation risks

The Design 020 audit flags several critical risks:

**Invoice/Payment conflation**
Treating billing obligation and money received as the same object.

**Payment/Transaction conflation**
Provider attempts being mistaken for canonical payments.

**Manual “mark paid” shortcuts**
Changing Invoice state without financial evidence.

**Float arithmetic**
Unsafe money calculations.

**Provider coupling**
Billing UI hard-coded around Stripe or another provider.

**Duplicate webhook processing**
One payment applied multiple times.

**Partial-payment loss**
One `paid=true` field unable to represent installment payments.

**Balance mutation errors**
Original Invoice total overwritten as payments arrive.

**Commercial-lineage loss**
Finance unable to determine which Contract/Proposal created the Invoice.

**Issued Invoice mutation**
Changing already-sent billing terms with no historical trace.

**False zero states**
Provider outage represented as zero payments.

**Permission leakage**
Sales/client users gaining reconciliation or refund authority.

**Financial side effects scattered across pages**
Client/project progression triggered directly from UI callbacks.

No additional screen is needed.

# Design 020 Audit Verdict

## **PASS — BILLING & PAYMENT WORKSPACE ANCHOR**

**Template directive:** Design 020 establishes the reusable `BillingPaymentWorkspaceTemplate`, combining Entity Detail, financial record and payment-operation patterns.

**Domain directive:** **Invoice ≠ Payment ≠ PaymentTransaction ≠ Provider Event.**

**Commercial-lineage directive:** Invoice creation preserves its authoritative Deal / accepted Proposal / executed Contract source where applicable.

**Line-item directive:** Invoice obligations remain structured, machine-readable financial data rather than only document text.

**Money directive:** Currency-safe amounts and server-authoritative calculations are mandatory.

**Payment directive:** Partial and multiple payments remain first-class records; payment application derives the Invoice balance rather than overwriting its original amount.

**Transaction directive:** Provider transaction state remains separate from canonical Payment and Invoice lifecycle.

**Reconciliation directive:** Successful provider transactions may still require canonical payment allocation/reconciliation; reconciliation is its own business concern.

**Provider directive:** External payment services operate behind one Payment Service/provider abstraction with server-side secrets.

**Reliability directive:** Payment creation/application and provider webhook processing require idempotency, transactional consistency and duplicate protection.

**History directive:** Payment, refund, amount, due-date and reconciliation events preserve financial activity/audit history.

**Permission directive:** Read, issue, payment recording, reconciliation, refund and export rights remain independently enforceable.

**Reuse directive:** Designs **020, 101, 102 and 103** must share one canonical Invoice/Payment/Transaction domain.

**Consolidation directive:** **STANDARDIZE FINANCIAL RECORD + PAYMENT INFRASTRUCTURE — DO NOT MERGE DESIGN 020 WITH INVOICE LIBRARY, DEEP INVOICE DETAIL OR TRANSACTION RECONCILIATION UNTIL DESIGNS 101–103 ARE AUDITED.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **20 / 153** |
| **PASS**                                   |                         **20** |
| **STANDARDIZE decisions**                  |                         **18** |
| **Potential implementation-overlap flags** |                         **11** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

### Reusable page families discovered

```text
InternalAppShell
│
├── Dashboard Family                         003–007
├── Data Acquisition Family                  008–009
├── Data Quality / Enrichment                010
├── CRM List Workspace                       011
├── Campaign Operations                      012
├── Versioned Workflow Builder               013
├── Unified Communication                    014
├── Action & Scheduling                      015
├── Pipeline Board                           016
├── Entity Detail / 360                      017
├── Versioned Commercial Document            018
├── Contract Execution Workspace             019
└── Billing & Payment Workspace
    └── 020 Invoice / Payment Workspace
```

The first complete commercial chain is now mapped:

```text
LEAD
 ↓
OUTREACH
 ↓
REPLY
 ↓
MEETING
 ↓
DEAL
 ↓
PROPOSAL
 ↓
CONTRACT
 ↓
INVOICE
 ↓
PAYMENT / RECONCILIATION
 ↓
CLIENT
```

# Next Sequential Audit Target

The frozen next identity is:

## **Phase 3A.1 — Design 021: Client 360 / Client Detail Workspace Audit**

That audit will formally establish the transition from **prospect/commercial records into the canonical Client relationship**, including the separation between **Client, Company, Contact, Deal, Contract, Invoice, Project, Client Portal organization/access, account ownership, commercial history and ongoing relationship status**.

After that, the frozen sequence continues to:

**Design 022 — Client Onboarding Workspace.**

We continue with exactly the same audit discipline—**no redesign, no new page and no sequence changes.**

