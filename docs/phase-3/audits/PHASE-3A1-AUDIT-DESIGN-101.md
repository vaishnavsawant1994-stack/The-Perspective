# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 101 — Invoice Library / Invoice List

Design 101 should become the **canonical Team Workspace invoice discovery, billing-status summary, receivable visibility, and finance-library surface** over the Invoice/Payment foundation already established by Design 020 and reused through Client Portal Designs 054 and 071.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary should be:

> **Invoice ≠ InvoiceVersion/IssuedArtifact ≠ InvoiceLine ≠ Contract/CommercialSource ≠ Client/Company ≠ Payment ≠ PaymentAttempt ≠ Transaction ≠ ProviderEvent ≠ Refund ≠ Reconciliation ≠ OutstandingBalance ≠ InvoiceListEntry.**

The central implementation rule is:

> **The Invoice Library is a permission-safe collection projection over canonical Invoices. An Invoice is the stable receivable/billing identity; issued commercial terms are immutable snapshots; InvoiceLines preserve exact billed items; Payments and provider Transactions remain separate financial events; OutstandingBalance is derived from canonical invoice/payment/refund state; and payment success, settlement, reconciliation, overdue state, refunds, and provider callbacks must never collapse into one generic mutable invoice status.**

---

# 1. Classification

| Audit field                      | Classification                                                                                                                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Design ID**                    | **101**                                                                                                                                                                                                |
| **Canonical name**               | **Invoice Library / Invoice List**                                                                                                                                                                     |
| **Product area**                 | Team Workspace / Finance / Billing / Receivables                                                                                                                                                       |
| **User surface**                 | **Authenticated Team Workspace**                                                                                                                                                                       |
| **Screen class**                 | Finance Library / Receivables Collection Workspace                                                                                                                                                     |
| **Classification**               | **Canonical Invoice Discovery, Billing Summary & Receivables Library Anchor**                                                                                                                          |
| **Primary purpose**              | Discover canonical Invoices across Clients/Deals/Contracts, inspect their exact issued amount/currency/due context, and understand derived payment/outstanding state without duplicating finance truth |
| **Primary entity**               | **Invoice** — Design 020                                                                                                                                                                               |
| **Issued representation**        | **InvoiceVersion / InvoiceArtifact** where canonical model requires versioned issued documents                                                                                                         |
| **Commercial line entity**       | **InvoiceLine**                                                                                                                                                                                        |
| **Library projection**           | **InvoiceListEntry / InvoiceSummaryView**                                                                                                                                                              |
| **Commercial-source dependency** | Contract/Proposal/Package lineage                                                                                                                                                                      |
| **Contract dependency**          | Designs 019 / 099–100                                                                                                                                                                                  |
| **Client dependency**            | Design 021                                                                                                                                                                                             |
| **Company dependency**           | Designs 084–085                                                                                                                                                                                        |
| **Payment dependency**           | **Payment** — Design 020                                                                                                                                                                               |
| **Payment-attempt dependency**   | **PaymentAttempt**                                                                                                                                                                                     |
| **Transaction dependency**       | **Transaction / ProviderTransaction**                                                                                                                                                                  |
| **Provider-event dependency**    | **ProviderEvent**                                                                                                                                                                                      |
| **Refund dependency**            | **Refund**                                                                                                                                                                                             |
| **Reconciliation dependency**    | upcoming Designs 102–103                                                                                                                                                                               |
| **Client Portal dependency**     | Designs 054 / 071                                                                                                                                                                                      |
| **Asset/File dependency**        | Design 030 for immutable issued invoice artifacts                                                                                                                                                      |
| **Primary query service**        | `InvoiceLibraryQueryService`                                                                                                                                                                           |
| **Invoice service**              | `InvoiceService`                                                                                                                                                                                       |
| **Billing calculation service**  | `InvoiceCalculationService`                                                                                                                                                                            |
| **Balance resolver**             | `InvoiceBalanceResolver`                                                                                                                                                                               |
| **Payment projection service**   | `InvoicePaymentSummaryService`                                                                                                                                                                         |
| **Parent shell**                 | `InternalAppShell` — Design 001                                                                                                                                                                        |
| **Auth**                         | Required                                                                                                                                                                                               |
| **Authorization**                | Active OrganizationMembership + invoice/finance/client/payment permissions                                                                                                                             |
| **Implementation priority**      | **Critical Financial Integrity / Receivables Accuracy / Payment Reconciliation Boundary**                                                                                                              |
| **Reuse level**                  | **Extremely High across Contracts, Client Portal, Finance Dashboard, Payments and Reporting**                                                                                                          |

Design 101 should answer:

> **“Which canonical Invoices exist, for which Client/Company and commercial source, what exact amount and currency were issued, when each invoice is due, how much has actually been paid/refunded, what balance remains outstanding, and which Invoice should I open—without confusing payment-provider state or aggregate counters with the Invoice itself?”**

Canonical structure:

```text
Contract / Commercial Source
             │
             ↓
          Invoice
             │
      ┌──────┼───────────┐
      ↓      ↓           ↓
 InvoiceLine[]    Issued Artifact
                    │
                    ↓
              Invoice snapshot
                    │
             ┌──────┴───────────┐
             ↓                  ↓
          Payment[]          Refund[]
             │
       PaymentAttempt[]
             │
         Transaction[]
             │
        ProviderEvent[]
             │
             ↓
       Balance Resolver
             │
             ↓
      InvoiceListEntry
             │
             ↓
        Design 101
```

---

# 2. Reuse

## Design 020 remains the canonical Invoice/Payment foundation

Design 101 must operate on the exact same:

```text
Invoice.id
```

established in Design 020.

Do not create:

```text
InvoiceListInvoice
BillingInvoice
PaidInvoiceRecord
ReceivableRecord
```

as parallel mutable entities.

`InvoiceListEntry` remains a read projection only.

---

## Design 054 remains Client Portal Invoice collection reuse

Team Workspace and Client Portal must reference the **same Invoice identity**.

Correct:

```text
Invoice I-100
   ├── Team Workspace → Design 101
   └── Client Portal → Design 054
```

No parallel `ClientInvoice`.

---

## Design 071 remains Client Invoice detail/payment projection

Design 071 already established the boundary:

> **Invoice ≠ InvoiceVersion/Artifact ≠ InvoiceLine ≠ Payment ≠ PaymentAttempt ≠ Transaction ≠ ProviderEvent ≠ Refund ≠ Reconciliation ≠ OutstandingBalance ≠ ClientAction.**

Design 101 must reuse that exact financial model at collection level.

---

## Design 007 Finance Dashboard consumes this domain

Finance Dashboard totals such as:

* outstanding,
* overdue,
* collected,

must derive from the same canonical invoices/payments/balance resolver.

Design 101 must not create independent finance math.

---

## Contract lineage reuse

Where invoicing is contract-driven:

```text
Contract C1
    ↓
ContractVersion / commercial terms
    ↓
Invoice I1
```

Invoice should retain exact billing-source lineage.

It must not dynamically recalculate historical billed terms from the Contract's current/latest draft.

---

## Executed Contract ≠ Invoice

Permanent.

A Contract can authorize or contextualize billing.

Invoice remains a separate financial receivable entity.

---

## Contract execution ≠ Invoice issuance automatically

Unless an explicit billing policy/workflow issues an Invoice, verified Contract execution alone does not create one by hidden side effect.

---

## Proposal ≠ Invoice

Permanent.

Proposal amount is an offer.

Invoice amount is a formally billed receivable.

---

## Client ≠ Invoice

A Client may have many Invoices.

Invoice lifecycle never becomes Client lifecycle.

---

## Payment domain reuse

One Invoice may have:

* zero Payments,
* one Payment,
* several partial Payments.

Do not store one mutable:

```text
invoice.payment
```

field as the finance model.

---

## Design 103 will own detailed transaction/reconciliation operations

Design 101 should show summarized reconciled/settled context where authorized.

It must not implement a second Transaction/Reconciliation backend.

---

# 3. Entities

## Invoice

`Invoice` is the stable billing/receivable identity.

Conceptually:

```text
Invoice
├── id
├── organizationId
├── client/company context
├── contract/commercial-source lineage
├── invoice number/reference
├── currency
├── issue context
├── due terms
├── lifecycle
├── issued snapshot/version reference
├── createdAt
└── revision
```

Exact physical schema belongs to Phase 3D.

---

## Invoice ≠ InvoiceListEntry

Critical.

`InvoiceListEntry` can safely compose:

```text
InvoiceListEntry
├── invoiceId
├── invoice number
├── Client / Company summary
├── source Contract summary
├── issued amount
├── currency
├── issue date
├── due date
├── lifecycle
├── paid amount
├── refunded amount
├── outstanding balance
├── overdue condition
├── reconciliation summary
└── updatedAt
```

but remains rebuildable.

---

## Invoice ≠ InvoiceVersion / IssuedArtifact

If billing architecture supports drafts/revisions before issuance, distinguish:

```text
Invoice
   ↓
InvoiceVersion / issued billing snapshot
```

The stable Invoice identity can survive drafting/correction workflows.

---

## Issued financial terms must be immutable

Once formally issued to the Client, the exact:

* billed items,
* quantity,
* unit amounts,
* discounts where applicable,
* tax values where applicable,
* currency,
* payment terms,
* due date,
* recipient/legal billing details,

must not be silently rewritten.

Corrections require a governed new version/credit/cancellation/reissue model according to finance policy.

---

## Current Client profile ≠ issued billing-party snapshot

Critical.

If the Client later changes:

* billing address,
* legal name,
* contact person,

the historical issued Invoice remains reconstructable exactly as issued.

---

## Current Contract values ≠ issued Invoice values

Permanent.

Example:

```text
Contract later amended to $15,000

Invoice I-100 was already issued for $10,000
```

I-100 remains $10,000 unless explicitly corrected through billing rules.

---

## InvoiceLine

InvoiceLines are version/snapshot-bound billed items.

Conceptually:

```text
InvoiceLine
├── invoice / issued version
├── description
├── quantity
├── unit amount
├── tax/discount inputs where applicable
├── line total
├── source commercial reference
└── snapshot metadata
```

---

## InvoiceLine ≠ Product/Package current catalog item

Permanent.

Product/package changes must never rewrite issued billing lines.

---

## Invoice total

Canonical totals must come from one `InvoiceCalculationService`.

Do not have:

* frontend,
* API,
* PDF renderer,
* Client Portal

calculate totals independently.

---

## Money handling

All finance values require:

```text
amount + currency
```

with decimal-safe arithmetic.

Never binary floating-point business calculations.

---

## Currency ≠ display preference

Invoice currency is legal/commercial billing data.

A user's preferred display currency cannot alter the original Invoice currency.

---

## Invoice amount ≠ OutstandingBalance

Critical.

Example:

```text
Invoice total = $10,000
Paid          = $4,000
Outstanding   = $6,000
```

The Invoice amount remains $10,000.

---

## OutstandingBalance

`OutstandingBalance` should normally be a derived/read model from:

```text
issued Invoice amount
-
eligible settled/applied Payments
+
reversed/refunded effects
± governed adjustments
```

according to finance policy.

It is not an independently editable field.

---

## OutstandingBalance ≠ Payment status

Permanent.

---

## Balance zero ≠ reconciled automatically

Critical.

Two numbers may net to zero while transaction allocation/reconciliation is incomplete.

---

## Balance zero ≠ no refund risk

Permanent.

---

## Payment

`Payment` is the canonical business receipt/payment entity.

Conceptually:

```text
Payment
├── id
├── organizationId
├── payer/context
├── amount
├── currency
├── received/initiated context
├── lifecycle
└── allocation references
```

Exact schema remains Design 020/Phase 3D.

---

## Invoice ≠ Payment

Permanent.

---

## One Invoice → many Payments

Critical for:

* deposits,
* installments,
* partial payments,
* retries where actual distinct receipts occur.

---

## One Payment may potentially allocate across invoices

If supported by finance policy, do not assume Payment belongs structurally to exactly one Invoice.

At minimum, preserve a possible `PaymentAllocation` relation in Phase 3D.

Do not invent UI beyond frozen Design 101.

---

## PaymentAttempt

PaymentAttempt is a provider/collection execution attempt.

It is not the Payment itself.

---

## PaymentAttempt ≠ Transaction

Permanent.

A provider attempt may create one or more provider transaction/evidence records depending on processor semantics.

---

## Transaction

Transaction represents financial/provider movement/evidence.

It remains distinct from business-level Payment allocation.

---

## ProviderEvent

Provider webhook/callback is external evidence.

It never directly becomes:

* Invoice,
* Payment,
* settlement,
* reconciliation.

---

## Provider success ≠ settled

Critical.

Provider may say:

> payment succeeded

before funds are fully:

* settled,
* reconciled,
* allocated.

---

## Payment received ≠ reconciled

Permanent.

---

## Reconciliation

Reconciliation answers:

> Does the platform's expected financial state match trusted processor/bank/ledger evidence?

It remains separate from:

* Payment creation,
* Invoice balance.

---

## Reconciliation pending ≠ Payment failed

Permanent.

---

## Refund

Refund remains its own financial entity/event.

Conceptually:

```text
Refund
├── paymentId / transaction linkage
├── amount
├── currency
├── reason
├── provider context
├── lifecycle
└── occurredAt
```

---

## Refund ≠ negative Payment

Critical.

Keep explicit lineage.

---

## Refunded amount ≠ Invoice amount changed

Permanent.

An Invoice issued for $10,000 remains an Invoice for $10,000 even if $2,000 later refunded, unless a separate credit/reissue policy alters the receivable.

---

## Partial refund ≠ full refund

Permanent.

---

## Refund initiated ≠ refund settled

Permanent.

---

## Invoice lifecycle

Conceptually, canonical semantics may include:

```text
Draft
Issued
Cancelled / Voided
```

while receivable/payment conditions remain separate.

Do not overload:

```text
Paid
Partially Paid
Overdue
Refunded
```

into the same foundational lifecycle if they are derived financial conditions.

If the canonical Design 020 model uses user-facing statuses containing those labels, backend architecture should still preserve the underlying dimensions separately.

---

## Payment condition

Conceptually:

```text
Unpaid
Partially Paid
Paid
Overpaid / Credit Exists
```

depending on finance rules.

This is derived from allocations/settled amounts.

---

## Due condition

Conceptually:

```text
Not Due
Due Today
Overdue
```

derived from:

* due date,
* current time/date semantics,
* open balance,
* Invoice lifecycle.

---

## Overdue ≠ Invoice lifecycle

Critical.

Valid:

```text
Invoice lifecycle = ISSUED
Payment condition = PARTIALLY_PAID
Due condition     = OVERDUE
```

---

## Paid ≠ settled/reconciled necessarily

If user-facing UI says Paid based on trusted receipt rules, reconciliation still remains a separate finance state.

---

## Invoice artifact

The client-facing invoice PDF/document should be:

```text
Invoice issued snapshot
      ↓
Generated artifact
      ↓
Asset / FileVersion
```

---

## Invoice artifact ≠ Invoice

Permanent.

---

## Regenerating identical layout ≠ changing Invoice terms

Permanent.

---

## Corrected commercial terms ≠ simple PDF regeneration

Critical.

If billed data changes, that requires governed billing revision—not just regenerating a file.

---

# 4. Permissions

Design 101 should conceptually distinguish:

```text
invoice.read
invoice.create
invoice.editDraft
invoice.issue
invoice.cancel / void

invoice.commercial.read
invoice.downloadArtifact

payment.read
payment.record / initiate
payment.refund

reconciliation.read

finance.aggregate.read
```

Exact permission names belong to Phase 3D.

---

## Invoice list access ≠ financial-value access

A user might see:

> Invoice exists for Globex

without seeing confidential amount/balance details.

List projection must therefore be field-safe.

---

## Invoice read ≠ edit

Permanent.

---

## Invoice editDraft ≠ issue

Critical.

---

## Issue ≠ payment authority

Permanent.

---

## Invoice owner/creator ≠ refund authority

Permanent.

---

## Deal owner ≠ Invoice edit/refund authority

Permanent.

---

## Contract access ≠ Invoice financial access

Permanent.

---

## Invoice read ≠ Payment details access

Payment processor/transaction evidence can be separately sensitive.

---

## Invoice read ≠ reconciliation details

Permanent.

---

## Refund authority should be separately protected

Critical financial action.

---

## Outstanding balance access can be sensitive

Aggregate/sort/filter semantics must obey finance permissions.

---

## Client Portal permissions remain separate

Designs 054/071 expose client-safe billing data only.

Internal:

* reconciliation notes,
* internal payment errors,
* provider diagnostics,

must not leak automatically.

---

## Direct Invoice ID reauthorizes

Permanent.

---

## Direct Payment/Transaction ID reauthorizes

Permanent.

---

## Artifact ID grants no access

Permanent.

---

## Cross-tenant Client/Contract/Invoice relationships prohibited

Absolute.

---

## Library counts are permission-aware

Restricted Invoices must not leak through:

* total counts,
* overdue counts,
* paid counts.

---

## Amount-based filtering/sorting is permission-sensitive

A user without invoice-value access must not infer values through:

* sort order,
* range filters,
* hidden aggregates.

---

# 5. States

Design 101 must keep **Invoice lifecycle, issue/artifact state, payment condition, due condition, settlement state, refund state, reconciliation state, and source-context availability** separate.

### Invoice lifecycle

Conceptually:

```text
Draft
Issued
Cancelled / Voided
Archived
```

### Issued artifact

```text
Not Generated
Generating
Available
Generation Failed
Unavailable
```

### Payment condition

```text
Unpaid
Partially Paid
Paid
Overpaid / Credit
Unknown
```

### Due condition

```text
Not Due
Due Today
Overdue
Not Applicable
```

### Payment execution/settlement

```text
No Payment
Payment Pending
Payment Received
Settlement Pending
Settled
Payment Failed
Outcome Unknown
```

### Refund

```text
No Refund
Refund Pending
Partially Refunded
Fully Refunded
Refund Failed
```

### Reconciliation

```text
Not Reconciled
Pending
Reconciled
Mismatch / Needs Review
Unavailable
```

These must never collapse into one generic `invoice.status`.

---

## Draft ≠ unpaid

Permanent.

A draft is not yet an issued receivable.

---

## Issued ≠ unpaid forever

Permanent.

Payment condition changes independently.

---

## Paid ≠ Invoice lifecycle completed/deleted

Permanent.

---

## Partially paid ≠ Invoice edited

Permanent.

---

## Overdue ≠ failed payment

Critical.

An Invoice can be overdue without any payment attempt.

---

## Payment failed ≠ Invoice overdue necessarily

Permanent.

Payment can fail before due date.

---

## Provider payment success ≠ settled

Permanent.

---

## Settled ≠ reconciled

Permanent.

---

## Reconciled ≠ non-refundable

Permanent.

---

## Refund pending ≠ refund completed

Permanent.

---

## Refunded ≠ Invoice deleted

Permanent.

---

## Fully refunded ≠ original Invoice amount zero

Permanent.

---

## Invoice cancelled ≠ refund automatically

If money had already been received, cancellation/void and refund must be handled explicitly according to accounting rules.

---

## Artifact unavailable ≠ Invoice unissued

Critical.

---

## Contract service unavailable ≠ no source Contract

Critical.

---

## Payment service unavailable ≠ unpaid

Critical.

---

## Reconciliation service unavailable ≠ reconciled

Critical.

---

## Balance service failure ≠ zero outstanding

Absolute.

---

## Zero outstanding ≠ balance unavailable

Permanent distinction.

---

## Library empty ≠ query failure

Permanent.

---

## State Coverage

Design 101 inherits Design 150 plus:

```text
Invoice Library Loading
Invoice Library Available
Invoice Library Empty
Invoice Library Restricted
Invoice Library Partial

Invoice Draft
Invoice Issued
Invoice Cancelled / Voided
Invoice Archived

Invoice Artifact Generating
Invoice Artifact Available
Invoice Artifact Failed
Invoice Artifact Unavailable

Invoice Unpaid
Invoice Partially Paid
Invoice Paid
Invoice Overpaid / Credit
Payment Condition Unknown

Invoice Not Due
Invoice Due Today
Invoice Overdue

Payment Pending
Payment Received
Settlement Pending
Payment Settled
Payment Failed
Payment Outcome Unknown

No Refund
Refund Pending
Invoice Partially Refunded
Invoice Fully Refunded
Refund Failed

Reconciliation Not Started
Reconciliation Pending
Reconciled
Reconciliation Mismatch
Reconciliation Unavailable

Contract Source Available
Contract Source Restricted
Contract Service Unavailable

Balance Available
Balance Unknown / Unavailable

Invoice Updated Elsewhere
Partial Invoice Summary Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should optimize receivables discovery while keeping financial dimensions distinct.

Conceptually:

```text
Invoice Library
↓
Invoice rows
   ├── Invoice number
   ├── Client / Company
   ├── Contract / commercial source
   ├── issued amount + currency
   ├── due date
   ├── payment condition
   ├── outstanding balance
   ├── due condition
   ├── reconciliation summary
   └── frozen primary action
```

Only frozen Design 101 fields/actions should render.

---

## Amount, balance and payment condition must remain distinct

Correct:

```text
Invoice total:      $10,000
Paid:                $4,000
Outstanding:         $6,000
Payment:             Partially Paid
Due:                 Overdue
```

Do not display simply:

> Status: $6,000 due.

---

## Overdue and payment state must use different semantics

Correct:

> Partially Paid · Overdue

Not:

> Status: Overdue

as a substitute for finance state.

---

## Reconciliation should remain secondary but visible where frozen

Example:

> Paid · Reconciliation pending

is valid.

Payment visibility and accounting certainty are different.

---

## Currency must always accompany monetary values

Never rely solely on locale formatting.

---

## Tablet

Following Design 152:

* Invoice rows can compact into cards,
* Invoice number + Client remain primary,
* amount/balance/due information stacks,
* reconciliation/provider detail remains secondary,
* actions stay touch-safe.

---

## Mobile

Priority:

```text
Invoice
↓
Client / Company
↓
Invoice amount + currency
↓
Outstanding balance
↓
Payment condition
↓
Due date / overdue condition
↓
Source Contract
↓
Primary frozen action
```

Do not squeeze wide finance tables horizontally.

---

## Mobile payment semantics

A card should be able to show:

> $10,000 invoice
> $6,000 outstanding
> Partially paid
> Overdue by 4 days

as distinct concepts.

---

## Partial failure

If Payment service is unavailable:

the Invoice's own:

* identity,
* issued amount,
* due date,

should remain visible.

Payment/balance sections become unavailable rather than defaulting to:

> Unpaid / $10,000 outstanding.

---

## Accessibility

An Invoice row could communicate:

> Invoice INV-104 for Globex. Issued for 10,000 US dollars. 4,000 dollars paid. 6,000 dollars outstanding. Payment condition partially paid. Invoice overdue by four days. Reconciliation pending.

where current canonical authorized data supports it.

---

# 7. Backend Requirements

## Canonical Invoice Library architecture

```text
Design 101
    ↓
Authenticated Workspace Context
    ↓
InvoiceLibraryQueryService
    │
    ├── Invoice summary
    ├── issued version/artifact summary
    ├── InvoiceLine total projection
    ├── Client / Company summary
    ├── Contract/commercial-source summary
    ├── Payment summary
    ├── Refund summary
    ├── BalanceResolver
    ├── due-condition resolver
    └── reconciliation summary
    ↓
InvoiceListEntry[]
```

This is a read-composition layer.

---

## Query anchors on canonical Invoice records

Conceptually:

```text
getInvoices(
    currentMembership,
    filters,
    sort,
    cursor
)
```

Always scoped by tenant and current permissions.

---

## No giant invoice-summary source table

Avoid canonical storage such as:

```text
InvoiceListRecord {
  invoiceJson,
  contractJson,
  paymentJson,
  reconciliationJson
}
```

Materialized projection/cache is acceptable only if rebuildable and source-revision aware.

---

## Invoice issuance workflow

Conceptually:

```text
issueInvoice(
    invoiceId,
    exactDraftRevision,
    expectedInvoiceRevision,
    idempotencyKey
)
```

should:

1. authorize issuer;
2. validate Invoice draft;
3. validate Client/billing-party context;
4. validate currency;
5. validate InvoiceLines;
6. calculate canonical totals;
7. freeze exact issued billing snapshot;
8. assign/preserve immutable Invoice reference/number;
9. derive exact due terms;
10. generate/queue issued artifact;
11. update Invoice lifecycle;
12. emit Audit/outbox.

---

## Invoice issuance idempotency

Network retry/double-click must not:

* issue twice,
* create two invoice numbers,
* create duplicate billing artifacts,
* send duplicate client notifications.

---

## Invoice number uniqueness

Invoice references/numbers require appropriate tenant/legal scope uniqueness.

Do not generate solely client-side.

---

## Invoice numbering ≠ database ID

Permanent.

Invoice number can be human/legal sequence.

Internal UUID/ID remains system identity.

---

## Issued snapshot immutability

After issuance, service layer must prevent mutation of protected commercial fields.

Do not rely only on disabled frontend controls.

---

## Correction workflow

If issued Invoice terms require correction:

use governed:

* void/cancel + reissue,
* credit adjustment,
* version/correction model,

according to the final finance policy.

Never simply mutate old lines.

Phase 3A.1 does not add a new correction screen.

---

## Canonical calculation service

Use one:

```text
InvoiceCalculationService
```

for:

* line totals,
* subtotal,
* discounts/taxes where supported,
* final issued total.

The same calculation result feeds:

* UI,
* PDF/artifact,
* Portal,
* backend validation.

---

## Decimal arithmetic

Use decimal/fixed precision types.

Never JavaScript floating-point as canonical finance arithmetic.

---

## Currency compatibility

Validate that all line components contributing to one Invoice use compatible currency semantics.

---

## Due-date resolver

Centralize:

```text
InvoiceDueResolver
```

to compute:

* dueAt/dueDate,
* due today,
* overdue,

under canonical timezone/date rules.

Do not let:

* Finance Dashboard,
* Design 101,
* Design 071,

compute it differently.

---

## Overdue resolver requires positive open balance

Conceptually:

```text
invoice issued
AND outstandingBalance > 0
AND current date > due date
```

subject to exact finance policy.

A fully paid Invoice should not remain operationally overdue merely because its old due date passed.

---

## Balance resolver

Centralize:

```text
InvoiceBalanceResolver
```

Conceptually:

```text
issuedTotal
-
settled/recognized allocations
+
eligible refund/reversal effects
± governed credits/adjustments
```

The precise accounting formula belongs to Phase 3D.

---

## Outstanding balance must be deterministic/rebuildable

If cached balance projection is lost:

recompute from canonical financial records.

---

## Balance must not derive from frontend counters

Absolute.

---

## Payment allocation

If payments can be partial/multi-invoice, introduce/retain explicit allocation semantics such as:

```text
PaymentAllocation
├── paymentId
├── invoiceId
├── amount
├── currency
├── appliedAt
└── allocation state
```

rather than assuming `payment.invoiceId` is always sufficient.

Exact physical schema Phase 3D.

---

## Payment lifecycle

A Payment can have:

* initiated,
* provider accepted,
* received,
* settled,
* failed/reversed,

according to provider/accounting policy.

Invoice should not copy all of those states.

---

## PaymentAttempt idempotency

Payment retries belong to Designs 020/071/102–103.

Repeated provider initiation must not create duplicate business Payments where the same payment intent is retried.

---

## Provider callback normalization

Provider events must be:

* authenticated,
* replay-safe,
* deduplicated,
* linked to correct PaymentAttempt/Transaction,
* normalized.

They must never directly execute:

```text
invoice.status = PAID
```

without canonical Payment/Balance logic.

---

## Unknown provider outcome

Critical.

If payment initiation times out:

```text
PaymentAttempt = OUTCOME_UNKNOWN
```

then reconcile provider state before repeating where duplicate charging is possible.

---

## Settlement

Provider “successful charge” and settlement remain separate where provider semantics require it.

---

## Reconciliation

Design 103 will later inspect/reconcile provider/ledger truth.

Design 101 should consume a safe summary such as:

```text
RECONCILED
PENDING
MISMATCH
UNAVAILABLE
```

without owning reconciliation records.

---

## Reconciliation mismatch ≠ Invoice amount mutation

Permanent.

A discrepancy triggers investigation, not silent rewriting of the Invoice.

---

## Refund service

Refund actions should reference canonical:

* Payment,
* Transaction,

and preserve amount/currency/evidence.

Refund does not directly edit Invoice total.

---

## Refund idempotency

Retry must not issue duplicate refunds.

---

## Client Portal consistency

Designs 054/071 must consume the same:

```text
Invoice
InvoiceLine
Payment
Refund
OutstandingBalance
```

through client-safe projections.

No parallel Client billing engine.

---

## Contract billing-source lineage

Invoice should preserve:

```text
sourceContractId
sourceContractVersionId
```

or equivalent where billing derives from Contract terms.

Later Contract drafts do not alter the Invoice.

---

## Billing eligibility

If Contract execution/effectiveness is required before invoice issuance:

use a governed billing-readiness rule.

Do not make Design 101 infer readiness from:

> Contract signed badge.

---

## Source-specific mutation

Examples:

```text
issue Invoice
→ InvoiceService

record/initiate Payment
→ PaymentService

refund
→ RefundService

reconcile
→ ReconciliationService
```

Never generic:

```text
PATCH InvoiceFinancialState
```

---

## Events/outbox

Useful events include:

```text
InvoiceCreated
InvoiceIssued
InvoiceCancelled
InvoiceBecameDue
InvoiceBecameOverdue

PaymentReceived
PaymentSettled
PaymentAllocated
PaymentFailed

RefundInitiated
RefundCompleted

InvoicePaid
InvoiceBalanceChanged
```

Some derived events should be generated through controlled projections/resolvers rather than mutable flags.

---

## Notification integration

Design 080 can notify:

* Invoice issued,
* due soon,
* overdue,
* payment received,
* refund completed.

Notification read/dismissal never changes finance state.

---

## Activity

Invoice Activity can show source events.

Activity remains distinct from:

* Transaction,
* Reconciliation,
* Audit.

---

## Audit

Material finance actions should include:

* Invoice creation/issuance,
* cancellation/void,
* manual payment recording,
* refund initiation,
* exceptional reconciliation adjustments.

Never log raw provider credentials or full restricted payment data.

---

## Search

Design 079 may index safe:

* invoice number,
* Client/Company,
* lifecycle,
* due date,

where applicable.

Sensitive payment/transaction information stays separately governed.

---

## Filtering/sorting

Server-side and permission-aware.

Potential filters from frozen Design 101 may include:

* Client,
* Invoice lifecycle,
* payment condition,
* due condition,
* date.

Do not create frontend-only finance filtering over the full dataset.

---

## Financial sort/filter side channels

Without amount permission, user must not infer hidden amounts through:

* sort by balance,
* amount-range filters,
* aggregate totals.

---

## Cursor pagination

Required at scale.

---

## N+1 prevention

Batch:

* Client/Company summaries,
* Contract lineage,
* payment aggregate summaries,
* reconciliation summaries.

Do not fetch all Payment/Transaction rows for every Invoice list entry.

---

## Caching

Invoice Library cache must vary by:

```text
organizationMembershipId
authorization revision
query/filter/sort
Invoice revision
payment/balance revision
reconciliation revision
finance-access level
```

Never cache one privileged finance library for all users.

---

## Partial failure contract

Example:

```text
Invoice core          ✓
Issued amount         ✓
Client context        ✓
Contract context      ✓
Payment service       ✕
Balance projection    ✕
Reconciliation        ✕
Artifact              ✓
```

Design 101 should still show:

> Invoice INV-100 — $10,000 — due August 30.

But financial derived fields become:

> Payment state unavailable
> Outstanding balance unavailable
> Reconciliation unavailable

Not:

> Unpaid
> $10,000 outstanding.

That distinction is mandatory.

---

## Backend Requirement Matrix

| Requirement                                           | Status                    |
| ----------------------------------------------------- | ------------------------- |
| Canonical Invoice reuse from 020                      | **Critical**              |
| Invoice/InvoiceListEntry separation                   | **Critical**              |
| Invoice/InvoiceVersion or issued snapshot separation  | **Critical**              |
| Invoice/issued artifact separation                    | **Critical**              |
| Invoice/Contract separation                           | **Critical**              |
| Exact commercial-source lineage                       | **Critical**              |
| Current Contract/issued Invoice separation            | **Critical**              |
| Current Client/historical billing snapshot separation | **Critical**              |
| InvoiceLine/current Product or Package separation     | **Critical**              |
| Issued financial snapshot immutability                | **Critical**              |
| Canonical Invoice calculation service                 | **Critical**              |
| Decimal-safe monetary arithmetic                      | **Critical**              |
| Currency preservation                                 | **Critical**              |
| Invoice amount/OutstandingBalance separation          | **Critical**              |
| OutstandingBalance derived/rebuildable                | **Critical**              |
| Invoice/Payment separation                            | **Critical**              |
| Multiple/partial payments support                     | **Critical**              |
| Payment/PaymentAttempt separation                     | **Critical**              |
| PaymentAttempt/Transaction separation                 | **Critical**              |
| Transaction/ProviderEvent separation                  | **Critical**              |
| Provider success/settlement separation                | **Critical**              |
| Settlement/reconciliation separation                  | **Critical**              |
| Payment/refund separation                             | **Critical**              |
| Refund/Invoice-total separation                       | **Critical**              |
| Refund idempotency                                    | **Critical**              |
| Payment initiation idempotency                        | **Critical**              |
| Unknown payment outcome reconciliation                | **Critical**              |
| Invoice lifecycle/payment condition separation        | **Critical**              |
| Payment condition/due condition separation            | **Critical**              |
| Overdue as derived condition                          | **Critical**              |
| Balance unavailable/zero separation                   | **Critical**              |
| Invoice issuance idempotency                          | **Critical**              |
| Invoice number uniqueness                             | **Critical**              |
| Issued-version mutation protection                    | **Critical**              |
| Design 030 artifact reuse                             | **Required**              |
| Designs 054/071 Portal reuse                          | **Critical**              |
| Designs 099–100 Contract lineage reuse                | **Critical**              |
| Design 102 invoice-detail reuse                       | **Critical architecture** |
| Design 103 reconciliation reuse                       | **Critical architecture** |
| Permission-safe list projections                      | **Critical**              |
| Finance field-level authorization                     | **Critical**              |
| Permission-aware counts/aggregates                    | **Critical**              |
| Server-side filtering/sorting                         | **Critical**              |
| Cursor pagination                                     | **Required at scale**     |
| N+1 prevention                                        | **Critical**              |
| Audit/outbox integration                              | **Required**              |
| Partial dependency failure handling                   | **Critical**              |

---

# 8. Consolidation

Design 101 exposes substantial financial-integrity risk if billing, receivables and payment execution are flattened into one Invoice status.

**Invoice / InvoiceListEntry conflation**
Library row becomes finance source truth.

**Invoice / InvoiceVersion conflation**
Stable receivable and exact issued billing terms collapse.

**Invoice / artifact conflation**
PDF becomes billing record.

**Artifact regeneration / commercial correction conflation**
Changed billing terms are hidden as file regeneration.

**Invoice / Contract conflation**
Signed agreement becomes receivable automatically.

**Contract execution / Invoice issuance conflation**
Legal event secretly creates billing record.

**Current Contract / historical Invoice terms conflation**
Amendment rewrites issued amount.

**Proposal / Invoice conflation**
Offer amount becomes billed amount.

**Invoice / Client conflation**
Billing lifecycle mutates Client relationship.

**Current Client profile / billing snapshot conflation**
Address/name edits rewrite issued Invoice evidence.

**InvoiceLine / Product conflation**
Catalog changes rewrite billed items.

**Current Package price / InvoiceLine amount conflation**
Historical bill changes after package edit.

**Invoice total / OutstandingBalance conflation**
Partial payment appears to reduce original Invoice amount.

**Invoice amount / paid amount conflation**
Receivable and cash receipt merge.

**OutstandingBalance / editable field conflation**
User manually overrides derived finance truth.

**Balance zero / reconciled conflation**
Accounting mismatches are hidden.

**Balance unavailable / zero conflation**
Service outage displays fully paid.

**Invoice / Payment conflation**
One Invoice assumes one payment object.

**Payment / PaymentAttempt conflation**
Retry becomes new business receipt.

**PaymentAttempt / Transaction conflation**
Processor operation and money movement collapse.

**Transaction / ProviderEvent conflation**
Webhook becomes financial source truth.

**Provider accepted / payment received conflation**
Processor acknowledgment is shown as cash received.

**Payment success / settlement conflation**
Unsettled charge appears final.

**Settlement / reconciliation conflation**
Cash receipt appears ledger-verified automatically.

**Payment received / Invoice reconciled conflation**
Accounting verification disappears.

**Payment failed / Invoice overdue conflation**
A failed early attempt makes Invoice overdue.

**Invoice overdue / failed payment conflation**
No payment attempt is required for overdue state.

**Overdue / Invoice lifecycle conflation**
Time condition becomes business identity state.

**Paid / Invoice deleted/closed-away conflation**
Historical Invoice disappears when balance hits zero.

**Partially paid / Invoice version edit conflation**
Payment changes commercial document.

**Payment / Refund conflation**
Refund modeled as negative receipt.

**Refund / Invoice amount conflation**
Original bill is rewritten downward.

**Refund initiated / refund completed conflation**
Pending reversal appears settled.

**Full refund / Invoice void conflation**
Money reversal and invoice cancellation collapse.

**Invoice cancelled / refund automatic conflation**
Received funds disappear without explicit refund.

**Invoice paid / Contract effective conflation**
Financial receipt alters legal agreement state.

**Contract signed / Invoice paid conflation**
Legal execution appears cash collection.

**Invoice lifecycle / payment condition conflation**
One generic status cannot represent Draft/Issued + Paid/Partially Paid + Overdue simultaneously.

**Paid / reconciled conflation**
Payment summary hides accounting uncertainty.

**Invoice number / database identity conflation**
Human/legal sequence becomes primary internal key.

**Client-generated Invoice number**
Duplicate/legal numbering errors become possible.

**Invoice issuance retry / duplicate Invoice conflation**
Double-click sends multiple bills.

**Invoice issuance retry / duplicate invoice number**
Legal numbering corrupts.

**Payment retry / duplicate charge conflation**
Unknown provider outcome causes customer double-charge.

**Provider callback retry / duplicate Payment conflation**
At-least-once webhook creates multiple receipts.

**Provider callback / invoice `PAID` patch**
Processor bypasses canonical Payment/Balance layer.

**Refund retry / duplicate refund conflation**
Customer receives multiple reversals.

**Payment allocation / one-Invoice assumption conflation**
Partial/bulk remittance cannot be represented correctly.

**Due date / created date conflation**
Invoice overdue math becomes wrong.

**Due date / reminder date conflation**
Notification timing changes financial terms.

**Timezone / local date conflation**
Invoice flips overdue at inconsistent times across surfaces.

**Finance Dashboard math / Invoice Library math divergence**
Design 007 and 101 show different outstanding totals.

**Portal balance / Team balance divergence**
Designs 071 and 101 disagree.

**Invoice read / Payment evidence access conflation**
Financial-provider data leaks.

**Invoice read / refund authority conflation**
Viewer can reverse funds.

**Deal owner / finance authority conflation**
Sales owner can issue/refund without permission.

**Contract viewer / invoice-value access conflation**
Legal-document access leaks finance values.

**List count / harmless metadata conflation**
Restricted billing activity leaks.

**Amount sort/filter / display permission conflation**
Hidden values can be inferred.

**Reconciliation unavailable / reconciled conflation**
System fails open.

**Payment service unavailable / unpaid conflation**
Customer may actually have paid.

**Artifact unavailable / Invoice unissued conflation**
Storage outage changes finance meaning.

**Contract unavailable / no commercial source conflation**
Dependency outage erases lineage.

**Invoice Library mega-record**
Payment, Client, Contract, provider and balance data become stale copied JSON.

**Generic Invoice financial PATCH**
One endpoint edits Invoice, Payment, balance and reconciliation directly.

**Cache by Invoice ID/tenant only**
Privileged finance fields leak.

**101/020 duplicate Invoice backend**
Workspace and library disagree.

**101/054 duplicate Client billing list**
Team and Portal Invoices diverge.

**101/071 duplicate balance/payment model**
Portal Detail and Team list compute different balances.

**101/100 duplicate Contract-billing lineage**
Invoice references current Contract instead of exact source terms.

**101/102 duplicate Invoice detail state**
List and Detail calculate different payment conditions.

**101/103 duplicate reconciliation backend**
Invoice list starts owning transaction truth.

No additional screen is required.

These are **Invoice identity, immutable billing snapshots, Client/Contract lineage, line-item integrity, due semantics, partial/multiple payment support, balance derivation, refund/reconciliation separation, permission-safe finance queries, and historical billing-evidence requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL INVOICE LIBRARY, RECEIVABLES SUMMARY & FINANCIAL-STATE DISCOVERY ANCHOR**

**Domain directive:**
**Invoice ≠ InvoiceVersion/IssuedArtifact ≠ InvoiceLine ≠ Contract/CommercialSource ≠ Client/Company ≠ Payment ≠ PaymentAttempt ≠ Transaction ≠ ProviderEvent ≠ Refund ≠ Reconciliation ≠ OutstandingBalance ≠ InvoiceListEntry.**

**Identity directive:**
Design 020 remains the sole canonical Invoice/Payment foundation. Design 101 is a permission-safe collection projection over those exact Invoice IDs and never introduces a second receivable or ClientInvoice entity.

**Projection directive:**
`InvoiceListEntry` is rebuildable from canonical Invoice, Client, Contract, Payment, Refund and Reconciliation sources. It cannot own editable financial truth.

**Snapshot directive:**
issued Invoice terms are immutable billing snapshots. Client profile changes, Contract amendments, Product/Package price changes and later commercial edits never rewrite an already-issued Invoice.

**Line-item directive:**
InvoiceLines preserve exact billed items/amounts and remain distinct from current Product/Package definitions.

**Calculation directive:**
one canonical `InvoiceCalculationService` computes monetary totals for backend, UI, issued artifact and Portal. Independent frontend/PDF arithmetic is prohibited.

**Money directive:**
all finance amounts use decimal-safe arithmetic plus explicit currency. User locale/display settings never modify original Invoice currency.

**Amount directive:**
original Invoice total, paid amount, refunded amount and OutstandingBalance remain separate financial facts. Partial Payment never rewrites original issued total.

**Balance directive:**
OutstandingBalance is a deterministic/rebuildable projection from canonical issued amount plus valid Payment allocations/refunds/adjustments. It is never an independently editable source field.

**Payment directive:**
Payment is a first-class receipt/business entity independent from Invoice. One Invoice may have many partial Payments; finance architecture must not assume one Invoice = one Payment.

**Allocation directive:**
where needed, payment allocation remains explicit so one payment can be correctly applied to one or several receivables without duplicating Payment identity.

**Attempt directive:**
PaymentAttempt is execution infrastructure around a Payment and remains distinct from Transaction/provider evidence.

**Provider directive:**
ProviderEvents are verified/idempotent external evidence and cannot directly mark an Invoice paid. Canonical Payment/settlement/balance logic resolves the business result.

**Unknown-outcome directive:**
ambiguous payment-provider outcomes require reconciliation before retrying when duplicate charges are possible. `Unknown` must never be silently interpreted as `Failed`.

**Settlement directive:**
provider success, payment receipt, settlement and reconciliation remain independently modeled. A successful charge does not necessarily mean fully settled/reconciled finance truth.

**Refund directive:**
Refund is a distinct financial entity linked to Payment/Transaction evidence. Refunds never rewrite original Invoice amount and retries must be idempotent.

**Lifecycle directive:**
Invoice lifecycle, payment condition, due condition, settlement, refund and reconciliation remain separate dimensions. The system must support states such as:

> **Issued + Partially Paid + Overdue + Reconciliation Pending**

without forcing them into one ambiguous enum.

**Due directive:**
overdue is a centralized derived condition based on due terms + remaining actionable balance + time/date semantics. It is not an editable Invoice lifecycle value.

**Timezone directive:**
Invoice due/overdue calculations use one canonical date/time policy shared by Design 007, Design 101 and Portal Design 071.

**Issuance directive:**
Invoice issuance is an authorized, revision-safe, idempotent command that freezes commercial/billing snapshots, generates a unique invoice reference, derives due terms, and emits durable Audit/events.

**Correction directive:**
issued billing terms cannot be edited in place. Any correction uses governed accounting semantics such as void/reissue, credit/adjustment, or versioning according to the final finance model.

**Artifact directive:**
the rendered Invoice PDF/document is a Design 030 Asset/FileVersion representing the exact issued snapshot. File regeneration never substitutes for a commercial correction.

**Contract directive:**
Designs 099–100 remain authoritative for Contract terms/execution. Invoice may preserve exact Contract/ContractVersion billing lineage, but Contract execution itself never silently creates or pays an Invoice.

**Portal directive:**
Designs 054/071 must consume this same canonical Invoice, InvoiceLine, Payment, Refund and Balance foundation through client-safe projections. Portal and Team billing truth can never diverge.

**Authorization directive:**
Invoice list visibility, commercial amounts, issuing, Payment details, refunds, reconciliation and artifact downloads remain independently server-authorized. Client-side hiding is never permission enforcement.

**Finance-side-channel directive:**
counts, totals, sorting and filters over restricted monetary fields must not leak confidential Invoice values or existence.

**Reconciliation directive:**
Design 103 remains the canonical detailed Transaction/Reconciliation workspace. Design 101 consumes only safe summary state and never creates a second accounting reconciliation engine.

**Idempotency directive:**
Invoice issuance, payment initiation/provider handling, allocation and refund execution must be replay-safe. UI retries/webhook redelivery cannot create duplicate bills, charges, receipts or refunds.

**Partial-failure directive:**
Invoice identity and issued billing terms remain available when Contract, Payment, Balance, Reconciliation or artifact dependencies fail. `Unavailable` must never become `Unpaid`, `$0`, `Reconciled`, or Invoice-not-found.

**Caching directive:**
Invoice Library caches vary by membership, authorization revision, query/filter/sort, Invoice revision, Payment/Balance revision, Reconciliation revision and finance-access level.

**Performance directive:**
use server-side cursor pagination, indexed Invoice queries, batched Client/Contract summaries, aggregate payment/balance projections and lazy transaction detail rather than loading every Payment/Transaction for each list row.

**Activity directive:**
Invoice/payment events can project into operational Activity but Activity never replaces Payment, Transaction, Refund or Reconciliation records.

**Audit directive:**
Invoice issuance/cancellation, manual financial adjustments, Payment recording, refund execution and reconciliation overrides generate strong actor-aware Audit evidence while sensitive provider data remains appropriately redacted.

**Future-reuse directive:**
Design 102 must consume these exact canonical Invoice/payment/balance records for detailed payment tracking. Design 103 must consume canonical PaymentAttempt/Transaction/provider evidence for reconciliation rather than introducing another Invoice balance model.

**Overlap directive:**
Designs **007, 020, 030, 054, 071, 099–103** must share one continuous **Contract/Commercial Source → Invoice → Issued Snapshot/Lines → Payment → PaymentAttempt → Transaction/Provider Evidence → Refund/Reconciliation → Derived OutstandingBalance** lineage while preserving legal, billing, processor and accounting states independently.

**Consolidation directive:**
**STANDARDIZE ONE INVOICE/RECEIVABLES FOUNDATION — CANONICAL INVOICE IDENTITY + IMMUTABLE ISSUED BILLING SNAPSHOTS + EXACT INVOICELINES + CONTRACT/CLIENT LINEAGE + DECIMAL/CURRENCY-SAFE CALCULATIONS + FIRST-CLASS PAYMENTS/ALLOCATIONS + DISTINCT PAYMENTATTEMPT/TRANSACTION/PROVIDEREVENT EVIDENCE + EXPLICIT REFUNDS + RECONCILIATION-AWARE BALANCE RESOLUTION + DERIVED DUE/OVERDUE STATE + PERMISSION-SAFE PAGINATED LIBRARY PROJECTIONS — AND NEVER ALLOW CURRENT CONTRACT/CRM VALUES, PROVIDER CALLBACKS, PAYMENT BADGES, ZERO/UNKNOWN BALANCE, REFUNDS OR LIST COUNTERS TO REWRITE THE HISTORICAL ISSUED INVOICE OR SUBSTITUTE FOR VERIFIED PAYMENT/ACCOUNTING TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **101 / 153** |
| **PASS**                                   |                        **101** |
| **STANDARDIZE decisions**                  |                         **99** |
| **Potential implementation-overlap flags** |                         **92** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**101 / 153 = 66.0% audited.**

### Canonical Invoice architecture after Design 101

```text
               CONTRACT / COMMERCIAL SOURCE
                           │
                           ↓
                        INVOICE
                  stable receivable identity
                           │
             ┌─────────────┼─────────────┐
             ↓             ↓             ↓
        InvoiceLines   Issued Snapshot   Artifact
                           │
                           ↓
                      Issued Amount
                           │
             ┌─────────────┴─────────────┐
             ↓                           ↓
          Payments                    Refunds
             │
       PaymentAttempts
             │
         Transactions
             │
       Provider Events
             │
             ↓
        Reconciliation
             │
             ↓
     OutstandingBalance
```

The core financial distinction is now strict:

```text
Invoice total       = $10,000
Paid                =  $4,000
Outstanding         =  $6,000
Payment condition   = PARTIALLY PAID
Due condition       = OVERDUE
Reconciliation      = PENDING
```

All can coexist.

No single `invoice.status` can safely replace them.

Likewise:

```text
Provider says payment successful
             ≠
Payment settled
             ≠
Payment reconciled
             ≠
Invoice balance confirmed zero
```

And historical billing remains immutable:

```text
Contract amended later to $15,000

Invoice I-100 already issued:
$10,000

I-100 remains $10,000.

The Contract amendment cannot rewrite
the historical receivable.
```

## Next Sequential Audit Target

### **Design 102 — Invoice Detail / Payment Tracking**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
