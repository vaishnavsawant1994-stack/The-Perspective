# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 102 — Invoice Detail / Payment Tracking

Design 102 should become the **canonical Team Workspace Invoice 360, receivable-detail, payment-allocation, payment-attempt, balance, refund-summary, and payment-tracking surface** built directly on the Invoice/Payment foundation established by Design 020 and the Invoice Library standardized in Design 101.

It must also remain the internal counterpart to the client-safe billing detail established by Design 071 without introducing a second finance backend.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Invoice ≠ InvoiceVersion/IssuedSnapshot ≠ InvoiceLine ≠ Payment ≠ PaymentAllocation ≠ PaymentAttempt ≠ Transaction ≠ ProviderEvent ≠ Refund ≠ Reconciliation ≠ OutstandingBalance ≠ PaymentCondition ≠ DueCondition ≠ IssuedArtifact ≠ Contract/CommercialSource.**

The central implementation rule is:

> **Invoice Detail must compose one canonical Invoice and its exact issued financial snapshot. Payments, allocations, collection attempts, provider Transactions, Refunds and Reconciliation remain independently traceable financial entities. The screen may explain how an Invoice moved from unpaid → partially paid → paid, but it must never achieve that by directly editing a mutable balance/status field. Every balance and payment condition must resolve from canonical financial evidence.**

---

# 1. Classification

| Audit field                         | Classification                                                                                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                       | **102**                                                                                                                                                 |
| **Canonical name**                  | **Invoice Detail / Payment Tracking**                                                                                                                   |
| **Product area**                    | Team Workspace / Finance / Billing / Receivables                                                                                                        |
| **User surface**                    | **Authenticated Team Workspace**                                                                                                                        |
| **Screen class**                    | Entity Detail / Receivables & Payment Tracking Workspace                                                                                                |
| **Classification**                  | **Canonical Invoice 360, Payment Allocation & Receivables Tracking Anchor**                                                                             |
| **Primary purpose**                 | Inspect one exact Invoice, its immutable issued terms, payment history, allocations, outstanding balance, due state, refunds and reconciliation context |
| **Primary entity**                  | **Invoice** — Design 020                                                                                                                                |
| **Issued financial representation** | **InvoiceVersion / IssuedSnapshot**                                                                                                                     |
| **Line entity**                     | **InvoiceLine**                                                                                                                                         |
| **Payment entity**                  | **Payment**                                                                                                                                             |
| **Allocation relation**             | **PaymentAllocation** where required                                                                                                                    |
| **Collection execution**            | **PaymentAttempt**                                                                                                                                      |
| **Processor/bank movement**         | **Transaction**                                                                                                                                         |
| **External evidence**               | **ProviderEvent**                                                                                                                                       |
| **Refund entity**                   | **Refund**                                                                                                                                              |
| **Accounting state**                | **Reconciliation**                                                                                                                                      |
| **Derived receivable projection**   | **OutstandingBalance**                                                                                                                                  |
| **Client Portal reuse**             | Design 071                                                                                                                                              |
| **Library reuse**                   | Design 101                                                                                                                                              |
| **Contract lineage**                | Designs 099–100                                                                                                                                         |
| **Finance Dashboard reuse**         | Design 007                                                                                                                                              |
| **Upcoming transaction workspace**  | Design 103                                                                                                                                              |
| **Artifact dependency**             | Design 030                                                                                                                                              |
| **Primary query service**           | `InvoiceDetailQueryService`                                                                                                                             |
| **Invoice service**                 | `InvoiceService`                                                                                                                                        |
| **Payment service**                 | `PaymentService`                                                                                                                                        |
| **Allocation service**              | `PaymentAllocationService`                                                                                                                              |
| **Balance resolver**                | `InvoiceBalanceResolver`                                                                                                                                |
| **Due resolver**                    | `InvoiceDueResolver`                                                                                                                                    |
| **Refund service**                  | `RefundService`                                                                                                                                         |
| **Reconciliation query**            | `ReconciliationQueryService`                                                                                                                            |
| **Parent shell**                    | `InternalAppShell` — Design 001                                                                                                                         |
| **Auth**                            | Required                                                                                                                                                |
| **Authorization**                   | Active OrganizationMembership + Invoice/payment/refund/reconciliation permissions                                                                       |
| **Implementation priority**         | **Critical Financial Integrity / Payment Evidence / Receivables Accuracy**                                                                              |
| **Reuse level**                     | **Extremely High across Client Portal, Finance Dashboard, Transactions and Reporting**                                                                  |

Design 102 should answer:

> **“What exactly was billed, what financial snapshot was issued, how much money has actually been received and applied, which payment attempts/transactions produced that result, what was refunded, what remains outstanding, whether it is overdue, and whether those financial records have been reconciled?”**

Canonical composition:

```text
Invoice I-100
      │
      ├── IssuedSnapshot
      │      ├── InvoiceLine[]
      │      ├── amount / currency
      │      ├── billing-party snapshot
      │      ├── due terms
      │      └── IssuedArtifact
      │
      ├── Payment[]
      │      │
      │      ├── PaymentAllocation[]
      │      │
      │      └── PaymentAttempt[]
      │               │
      │               └── Transaction[]
      │                        │
      │                        └── ProviderEvent[]
      │
      ├── Refund[]
      ├── Reconciliation
      │
      └── Balance / Due resolvers
                 │
                 ↓
          InvoiceDetailView
```

---

# 2. Reuse

## Design 020 remains the canonical finance foundation

Design 102 must consume the exact same:

```text
Invoice
Payment
PaymentAttempt
Transaction
Refund
```

identities established by Design 020.

Do not create:

```text
InvoiceDetailInvoice
TrackedPayment
InvoicePaymentRecord
PaidInvoice
PaymentHistoryItem
```

as independent business entities.

---

## Design 101 remains Invoice collection/discovery

Correct:

```text
Design 101
InvoiceListEntry
      ↓
invoiceId
      ↓
Design 102
InvoiceDetailView
```

Both must use the same balance/payment/due resolvers.

---

## Design 071 remains Client-safe Invoice/Payment detail

Team Design 102 and Client Design 071 should share:

```text
Invoice I-100
Payment P-10
OutstandingBalance
```

while exposing different fields/actions according to authorization.

There must never be:

```text
InternalInvoice
ClientInvoice
```

for the same receivable.

---

## Team detail ≠ Portal detail

Team Workspace may legitimately expose internal:

* reconciliation information,
* processor tracking,
* allocation context,
* finance notes,

where frozen design allows.

Those must not leak automatically into Design 071.

---

## Design 007 Finance Dashboard reuses the same calculations

The detailed balance shown here and aggregate receivable totals shown in Finance Dashboard must use identical canonical financial semantics.

---

## Design 103 remains Transaction/Reconciliation authority

Design 102 may summarize:

> Reconciliation pending.

It should not create a second transaction investigation/reconciliation engine.

Design 103 specializes those records later.

---

## Contract lineage remains source context

Where Invoice was generated from Contract terms:

```text
ContractVersion CV3
      ↓
Invoice I-100
```

Design 102 can expose that exact lineage.

It must not dynamically rebuild Invoice terms from current Contract data.

---

# 3. Entities

## Invoice

`Invoice` is the stable receivable identity.

Conceptually:

```text
Invoice
├── id
├── organizationId
├── invoiceNumber
├── billingParty/client context
├── commercialSource
├── lifecycle
├── issuedSnapshot reference
├── currency
├── issue date
├── due terms
├── createdAt
└── revision
```

---

## Invoice ≠ InvoiceDetailView

`InvoiceDetailView` is a rebuildable composition.

It can contain:

```text
InvoiceDetailView
├── invoice
├── issuedSnapshot
├── lines
├── payment summaries
├── allocations
├── payment attempts
├── transaction summaries
├── refunds
├── balance
├── due condition
├── reconciliation
├── source Contract
└── activity
```

but cannot become canonical financial storage.

---

## InvoiceVersion / IssuedSnapshot

The issued billing representation must preserve the exact financial obligation.

Once formally issued:

* line items,
* amount,
* currency,
* due terms,
* billing-party identity,
* taxes/discounts where applicable,

must be protected from silent mutation.

---

## Draft Invoice ≠ issued Invoice snapshot

Permanent.

---

## Issued snapshot ≠ current editable draft

If correction/version semantics permit a later internal draft:

the issued financial obligation must remain identifiable independently.

---

## IssuedArtifact

Invoice PDF/document represents the issued snapshot.

```text
Invoice issued snapshot
        ↓
Invoice artifact
        ↓
Asset / FileVersion
```

Artifact is not the financial source of truth.

---

## InvoiceLine

Each InvoiceLine represents the exact billed item in the issued billing context.

Current Product/Package changes must not alter it.

---

## Invoice total ≠ amount paid

Permanent.

---

## Invoice total ≠ current outstanding balance

Permanent.

---

## Invoice total ≠ refunded amount

Permanent.

Example:

```text
Issued total     $10,000
Paid              $7,000
Refunded          $1,000
Current applied
financial state   determined by policy/resolver
```

Do not mutate:

```text
invoice.total = $4,000
```

simply to represent payment/refund activity.

---

## Payment

`Payment` represents a canonical receipt/payment business event.

Conceptually:

```text
Payment
├── id
├── organizationId
├── payer
├── amount
├── currency
├── lifecycle
├── method/provider context
├── receivedAt
└── revision
```

Exact schema Phase 3D.

---

## Payment ≠ Invoice

Permanent.

---

## Payment may exist before final allocation

Important where bank/manual/bulk remittance workflows exist.

A Payment can conceptually be:

```text
Payment P1
amount = $10,000
allocation state = UNALLOCATED/PARTIAL/COMPLETE
```

independently of its receipt state.

---

## PaymentAllocation

Where required, model Invoice application explicitly:

```text
PaymentAllocation
├── paymentId
├── invoiceId
├── amount
├── currency
├── allocatedAt
├── actor/system
└── lifecycle/reversal lineage
```

---

## PaymentAllocation ≠ Payment

Permanent.

---

## PaymentAllocation ≠ InvoiceLine

Permanent.

It answers:

> How much of this Payment is applied to this Invoice?

Not:

> What was billed?

---

## One Payment → multiple allocations

Where supported:

```text
Payment P1 $10,000
├── Invoice I1 allocation $6,000
└── Invoice I2 allocation $4,000
```

---

## One Invoice → multiple Payments

Likewise:

```text
Invoice I1 $10,000
├── Payment P1 $4,000
├── Payment P2 $3,000
└── Payment P3 $3,000
```

No one-payment assumption.

---

## Allocation amount ≠ Payment amount necessarily

Permanent.

---

## Allocation reversal ≠ refund necessarily

Important.

Correcting an incorrect allocation can move accounting application without sending money back to the payer.

Refund means actual money reversal.

---

## PaymentAttempt

`PaymentAttempt` represents a collection/provider execution attempt.

Conceptually:

```text
PaymentAttempt
├── id
├── payment/payment-intent context
├── provider
├── idempotency key
├── amount/currency
├── attempt state
├── startedAt
└── completedAt
```

---

## PaymentAttempt ≠ Payment

Permanent.

A retry of the same intended payment need not create another business Payment.

---

## One Payment may have multiple attempts

Example:

```text
Payment P1
├── Attempt A1 — network failure
├── Attempt A2 — provider declined
└── Attempt A3 — success
```

subject to provider/payment-intent semantics.

---

## Attempt retry ≠ duplicate charge

Critical.

The payment infrastructure must determine whether a retry represents:

* the same provider intent,
* a safe new attempt,

before charging again.

---

## Transaction

`Transaction` represents processor/bank/ledger movement/evidence.

Conceptually:

```text
Transaction
├── id
├── paymentAttempt/payment context
├── provider
├── providerTransactionId
├── transaction type
├── amount
├── currency
├── occurredAt
└── state
```

---

## Payment ≠ Transaction

Permanent.

Business-level receipt and provider financial movement remain distinguishable.

---

## One Payment may have multiple Transactions

Examples may include:

* authorization,
* capture,
* settlement,
* reversal,

depending on provider semantics.

---

## ProviderEvent

Provider callback is external evidence around the financial transaction.

It is not Transaction itself.

---

## ProviderEvent ≠ Payment

Permanent.

---

## ProviderEvent ≠ Invoice

Absolute.

---

## Provider success ≠ Payment settled

Permanent.

---

## Provider settled ≠ Payment reconciled

Permanent.

---

## Provider callback retry ≠ another Transaction

Critical.

Use provider event IDs/fingerprints and transaction references.

---

## Provider identifiers need namespace

Conceptually:

```text
provider
+
merchant/provider account
+
providerTransactionId
```

rather than treating IDs as globally unique.

---

## Refund

Refund represents an actual return of funds.

Conceptually:

```text
Refund
├── id
├── paymentId
├── transaction reference
├── amount
├── currency
├── reason
├── lifecycle
├── provider reference
└── timestamps
```

---

## Refund ≠ allocation reversal

Permanent.

---

## Refund ≠ Invoice correction

Permanent.

---

## Partial Refund

Must be supported conceptually where finance policy permits.

```text
Payment $10,000
Refund $2,000
```

does not mean:

```text
payment = deleted
```

---

## Refund attempt/provider evidence

Where provider operations require it, Refund can have its own execution/evidence lifecycle.

Do not overload PaymentAttempt with refund semantics unless intentionally generalized at a lower transaction layer.

---

## Reconciliation

`Reconciliation` should answer whether canonical internal financial state matches trusted external/ledger evidence.

Conceptually:

```text
Reconciliation
├── subject/context
├── expected values
├── observed values
├── state
├── discrepancies
├── reconciledAt
├── reconciledBy/system
└── evidence
```

Design 103 will specialize this.

---

## Reconciliation ≠ Payment lifecycle

Permanent.

---

## Reconciliation ≠ OutstandingBalance

Permanent.

A balance can appear numerically correct while reconciliation remains incomplete.

---

## OutstandingBalance

One centralized resolver must compute the current receivable state.

Conceptually:

```text
InvoiceBalanceResolver
      ↓
Issued obligation
-
eligible allocations/payments
+
refund/reversal effects
± credits/adjustments
      ↓
OutstandingBalance
```

Exact accounting policy Phase 3D.

---

## OutstandingBalance ≠ stored editable number

Absolute.

Caches/materialized projections are allowed only if reconstructable.

---

## Balance can be negative/credit depending policy

Do not assume:

```text
max(balance, 0)
```

unless accounting policy says so.

An overpayment may need explicit credit representation.

---

## Zero balance ≠ fully reconciled

Permanent.

---

## PaymentCondition

Derived financial condition could include:

```text
UNPAID
PARTIALLY_PAID
PAID
OVERPAID/CREDIT
UNKNOWN
```

It is not Invoice identity/lifecycle.

---

## DueCondition

Derived independently:

```text
NOT_DUE
DUE_TODAY
OVERDUE
NOT_APPLICABLE
UNKNOWN
```

---

## Paid + previously overdue

Historical detail may legitimately show:

> Paid on Aug 25; due Aug 20.

Do not erase previous lateness just because current balance is zero if history/reporting needs it.

---

## Invoice cancellation/void

Voiding an Invoice is not equivalent to deleting it.

Historical billing evidence remains.

---

## Voided + Payment exists

Must be treated carefully.

Voiding an already-paid Invoice does not make received funds disappear.

A separate refund/credit/reallocation workflow is needed.

---

# 4. Permissions

Design 102 should conceptually distinguish:

```text
invoice.read
invoice.commercial.read
invoice.editDraft
invoice.issue
invoice.cancelVoid

payment.read
payment.createOrRecord
payment.allocate

paymentAttempt.read
transaction.read

refund.read
refund.initiate

reconciliation.read
reconciliation.manage

invoiceArtifact.download
```

Exact permission names belong to Phase 3D.

---

## Invoice read ≠ Payment details read

Permanent.

---

## Payment read ≠ Transaction/provider evidence read

Permanent.

Processor/bank metadata may be more sensitive.

---

## Invoice read ≠ Refund authority

Critical.

---

## Payment record authority ≠ allocation authority necessarily

Where financial controls require separation.

---

## Allocation permission ≠ Refund permission

Permanent.

---

## Reconciliation read ≠ reconciliation override/manage

Critical.

---

## Manual financial recording requires explicit authority

If the frozen design permits recording external/offline payments, actor, source and evidence must be captured.

Do not infer receipt from a user toggling:

> Paid.

---

## “Mark Paid” direct boolean action prohibited

Critical architecture rule.

If offline/manual payment is supported, the correct operation is:

```text
recordPayment(...)
```

plus appropriate allocation.

Not:

```text
invoice.status = PAID
```

---

## Invoice edit permission ≠ payment authority

Permanent.

---

## Contract owner ≠ finance authority

Permanent.

---

## Client Portal user ≠ internal transaction access

Design 071 remains safe projection only.

---

## Direct Payment ID reauthorizes

Permanent.

---

## Direct Transaction ID reauthorizes

Permanent.

---

## Direct Refund ID reauthorizes

Permanent.

---

## Payment provider IDs are never authorization tokens

Absolute.

---

## Cross-tenant allocations prohibited

A Payment in Organization A cannot be allocated to Invoice in Organization B.

---

## Currency compatibility validated server-side

User cannot allocate incompatible currencies by request manipulation unless a canonical FX/settlement mechanism explicitly exists.

---

## Sensitive financial notes/evidence require narrower access

Permanent.

---

# 5. States

Design 102 must keep **Invoice lifecycle, payment condition, due condition, Payment lifecycle, allocation state, PaymentAttempt state, Transaction state, Refund state, Reconciliation state, Balance state, and artifact state** independently observable.

### Invoice lifecycle

```text
Draft
Issued
Voided / Cancelled
Archived
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
Unknown
```

### Payment lifecycle

Conceptually:

```text
Pending
Received
Settled
Reversed
Cancelled
Failed
Unknown
```

depending on finance policy.

### Allocation

```text
Unallocated
Partially Allocated
Fully Allocated
Reversed / Adjusted
```

### PaymentAttempt

```text
Created
Processing
Provider Accepted
Succeeded
Failed
Declined
Outcome Unknown
Cancelled
```

### Transaction

Provider/ledger-specific normalized states.

### Refund

```text
Not Requested
Pending
Completed
Partially Refunded
Failed
Outcome Unknown
```

### Reconciliation

```text
Not Started
Pending
Reconciled
Mismatch
Needs Review
Unavailable
```

### Balance

```text
Available
Credit / Overpayment
Unknown / Unavailable
```

These must never collapse into one generic finance status.

---

## Invoice issued ≠ Payment pending

Permanent.

---

## Payment received ≠ Payment allocated

Permanent.

---

## Payment allocated ≠ settled necessarily

Permanent.

---

## Payment settled ≠ reconciled

Permanent.

---

## Payment attempt succeeded ≠ Invoice fully paid

Critical.

The Payment may be:

* partial,
* allocated elsewhere,
* later refunded.

---

## Provider accepted ≠ Payment succeeded

Permanent.

---

## Transaction settled ≠ all Invoice obligations satisfied

Permanent.

---

## Invoice paid ≠ no Refund exists

Permanent.

---

## Refund completed ≠ Invoice voided

Permanent.

---

## Allocation reversed ≠ Refund issued

Permanent.

---

## Reconciliation mismatch ≠ Invoice edited

Permanent.

---

## Balance unavailable ≠ zero balance

Absolute.

---

## Payment service unavailable ≠ unpaid

Absolute.

---

## Reconciliation unavailable ≠ unreconciled necessarily

Use:

> status unavailable

not automatically `NOT_RECONCILED`.

---

## Artifact unavailable ≠ Invoice unissued

Permanent.

---

## Source Contract unavailable ≠ Invoice invalid

Permanent.

---

## State Coverage

Design 102 inherits Design 150 plus:

```text
Invoice Detail Loading
Invoice Detail Available
Invoice Detail Restricted
Invoice No Longer Accessible
Partial Invoice Detail Available

Invoice Draft
Invoice Issued
Invoice Voided / Cancelled
Invoice Archived

Invoice Unpaid
Invoice Partially Paid
Invoice Paid
Invoice Overpaid / Credit
Payment Condition Unknown

Invoice Not Due
Invoice Due Today
Invoice Overdue
Due Condition Unknown

Payment Pending
Payment Received
Payment Settlement Pending
Payment Settled
Payment Failed
Payment Reversed
Payment Outcome Unknown

Payment Unallocated
Payment Partially Allocated
Payment Fully Allocated
Allocation Reversed

Payment Attempt Processing
Payment Attempt Provider Accepted
Payment Attempt Succeeded
Payment Attempt Failed
Payment Attempt Declined
Payment Attempt Outcome Unknown

No Refund
Refund Pending
Partial Refund
Full Refund
Refund Failed
Refund Outcome Unknown

Reconciliation Not Started
Reconciliation Pending
Reconciled
Reconciliation Mismatch
Reconciliation Needs Review
Reconciliation Unavailable

Balance Available
Balance Credit / Overpayment
Balance Unavailable

Invoice Artifact Available
Invoice Artifact Unavailable

Contract Source Available
Contract Source Restricted
Contract Source Unavailable

Invoice Updated Elsewhere
Payment Updated Elsewhere
Balance Changed Elsewhere
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize the **financial truth hierarchy**:

```text
Invoice identity
↓
Issued terms / line items
↓
Invoice total
↓
Paid / allocated / refunded
↓
Outstanding balance
↓
Due condition
↓
Payment history
↓
Payment attempts / transaction summary
↓
Reconciliation
↓
Contract/commercial lineage
```

Only frozen Design 102 sections/actions should be rendered.

---

## Financial summary should never reduce everything to one badge

Correct:

> Invoice: Issued
> Payment: Partially Paid
> Outstanding: $6,000
> Due: Overdue
> Reconciliation: Pending

All are independent.

---

## Payment rows should identify business Payment vs provider state

Avoid making:

> Stripe succeeded

look equivalent to:

> Invoice paid.

Provider context stays secondary.

---

## Amounts require currency everywhere

Especially:

* Invoice total,
* Payment amount,
* allocation,
* refunded amount,
* outstanding balance.

---

## Payment history should preserve chronology

Where frozen design shows history, distinguish:

```text
Payment received
→ allocation
→ settlement
→ refund
→ reconciliation
```

rather than one flattened status timeline.

---

## Tablet

Following Design 152:

* finance summary cards stack,
* InvoiceLines become compact rows,
* Payment records stack vertically,
* provider/reconciliation diagnostics remain secondary,
* action controls remain deliberate.

---

## Mobile

Priority:

```text
Invoice number
↓
Client
↓
Total + currency
↓
Paid
↓
Outstanding
↓
Due condition
↓
Payment condition
↓
Payment history
↓
Refund / reconciliation summary
```

No wide finance grid compressed horizontally.

---

## Mobile payment entry

If a manual payment-recording action exists in the frozen design, show exact:

* amount,
* currency,
* intended Invoice/allocation,
* consequence

before confirmation.

Never provide a generic:

> Mark as paid.

---

## Accessibility

A detail view could communicate:

> Invoice INV-104 for Globex. Issued for 10,000 US dollars. Three payments totaling 7,000 dollars have been allocated. One 1,000-dollar refund was completed. Current outstanding balance is 4,000 dollars according to the billing resolver. Invoice is overdue. Reconciliation remains pending.

where canonical authorized data supports it.

---

# 7. Backend Requirements

## Canonical detail architecture

```text
Design 102
    ↓
Authenticated Workspace Context
    ↓
InvoiceDetailQueryService
    │
    ├── InvoiceAdapter
    ├── IssuedSnapshotAdapter
    ├── InvoiceLineAdapter
    ├── Client/CompanyAdapter
    ├── ContractSourceAdapter
    ├── PaymentAdapter
    ├── AllocationAdapter
    ├── PaymentAttemptAdapter
    ├── TransactionSummaryAdapter
    ├── RefundAdapter
    ├── BalanceResolver
    ├── DueResolver
    ├── ReconciliationAdapter
    └── ArtifactAdapter
    ↓
InvoiceDetailView
```

---

## Query anchors on canonical Invoice ID

Conceptually:

```text
getInvoiceDetail(
    invoiceId,
    currentMembership
)
```

All sections reauthorize independently.

---

## No giant InvoiceDetail mutable record

Prohibit canonical storage like:

```text
InvoiceDetail {
  invoice,
  totalPaid,
  outstanding,
  paymentStatus,
  transactionStatus,
  reconciliationStatus
}
```

if those fields are duplicated mutable truth.

A read projection/cache is acceptable only if reconstructable from canonical financial entities.

---

## Payment creation/recording

Where a Payment is created manually or through provider collection:

```text
createPayment(...)
```

must record:

* amount,
* currency,
* payer/context,
* source,
* external/provider evidence where available,
* actor/system,
* idempotency identity.

---

## Offline/manual Payment

If supported, it must never mean:

```text
set invoice paid = true
```

Instead:

```text
recordManualPayment(...)
      ↓
Payment
      ↓
PaymentAllocation
      ↓
Balance recalculation
```

---

## Manual Payment evidence

Where appropriate, preserve:

* method,
* reference,
* received date,
* actor,
* supporting file/evidence.

Do not invent frozen UI fields if absent; backend must still preserve integrity appropriate to the method.

---

## Payment idempotency

A repeated payment-recording request cannot create duplicate receipt records.

---

## Payment allocation service

Conceptually:

```text
allocatePayment(
    paymentId,
    invoiceId,
    amount,
    expectedPaymentRevision,
    expectedInvoiceRevision,
    idempotencyKey
)
```

should:

1. authorize;
2. validate tenant;
3. validate currencies;
4. validate allocatable/unallocated amount;
5. validate Invoice eligibility;
6. prevent over-allocation unless explicitly allowed;
7. create allocation;
8. trigger balance recalculation/projection;
9. emit Audit/outbox.

---

## Allocation idempotency

Double click/retry must not apply the same Payment twice.

---

## Allocation concurrency

Critical.

Two Finance users cannot simultaneously allocate the same remaining $5,000 to different invoices and both succeed.

Use transactional/optimistic/locking semantics.

---

## Allocation reversal

If correcting an application:

use an explicit reversal/adjustment record.

Do not delete the historical allocation silently.

---

## Reversal idempotency

Required.

---

## Balance resolver

One canonical:

```text
InvoiceBalanceResolver.resolve(invoiceId)
```

used by:

* Design 007,
* Design 071,
* Design 101,
* Design 102,
* Reports/Analytics.

No separate portal/finance formulas.

---

## Balance version/freshness

If materialized:

preserve:

```text
calculatedAt
sourceRevision / ledgerRevision
```

so stale results are detectable.

---

## Balance write protection

Clients cannot submit:

```text
outstandingBalance = 0
```

as authoritative mutation.

Absolute.

---

## PaymentCondition resolver

Centralized:

```text
resolvePaymentCondition(invoiceId)
```

using canonical issued total and recognized allocations.

---

## DueCondition resolver

Centralized:

```text
resolveDueCondition(invoiceId, currentTimeContext)
```

with exact timezone/date policy.

---

## Payment initiation

Where Design 102 permits initiating payment internally, it must reuse the same provider/payment infrastructure as Design 071.

No Team-only charging engine.

---

## PaymentAttempt creation

Before provider interaction, create/persist execution intent appropriately.

Conceptually:

```text
Payment
    ↓
PaymentAttempt
    ↓
Provider Adapter
```

---

## Provider idempotency

Use processor-supported idempotency keys where available.

---

## Network timeout

Critical:

```text
provider request sent
response lost
```

must become:

```text
PAYMENT_OUTCOME_UNKNOWN
```

then reconciliation/query-provider before retry.

---

## Never retry unknown charge blindly

Absolute duplicate-charge prevention rule.

---

## Provider adapter

Conceptually:

```text
PaymentProviderAdapter
├── initiatePayment
├── queryPayment
├── capture where applicable
├── refund
├── verifyWebhook
├── normalizeEvent
└── reconcileTransaction
```

Do not create provider-specific Invoice/Payment business domains.

---

## Webhook ingestion

Canonical:

```text
Provider webhook
      ↓
verify
      ↓
dedupe/replay protect
      ↓
store provider event evidence
      ↓
resolve PaymentAttempt / Transaction
      ↓
normalize transaction state
      ↓
Payment resolver
      ↓
allocation/balance projection
```

Provider webhook does not directly edit Invoice status.

---

## Provider event verification

Use provider-specific:

* signature,
* timestamp,
* merchant account binding,
* replay prevention.

---

## Unknown provider transaction

Do not link merely by:

* amount,
* payer email.

Use robust provider/payment-intent references.

---

## Transaction ingestion idempotency

Repeated callbacks map to the same normalized Transaction/evidence.

---

## Out-of-order provider events

Do not regress:

```text
SETTLED
→
AUTHORIZED
```

because an older callback arrived later.

---

## Refund command

Conceptually:

```text
initiateRefund(
    paymentId,
    amount,
    reason,
    expectedPaymentRevision,
    idempotencyKey
)
```

should:

1. authorize;
2. validate refundable amount;
3. validate currency;
4. prevent duplicate/excess refund;
5. create Refund intent;
6. invoke provider where needed;
7. preserve provider evidence;
8. update refund projection;
9. feed balance/reconciliation logic;
10. emit Audit/outbox.

---

## Refund retry

Unknown provider refund outcome requires reconciliation before another refund attempt.

Same duplicate-funds-return safety rule.

---

## Refund amount constraints

Cumulative completed/pending refunds cannot exceed the refundable amount under policy unless an exceptional finance workflow explicitly permits it.

---

## Refund ≠ allocation reversal

Backend commands remain separate.

---

## Reconciliation summary

Design 102 may query:

```text
getReconciliationSummary(invoiceId)
```

from Design 103's domain.

It must not permit generic reconciliation mutation from Invoice Detail unless present and explicitly governed in frozen design.

---

## Reconciliation mismatch handling

Mismatch should expose:

* expected state,
* observed state summary,
* investigation required,

without changing issued Invoice terms.

---

## Reconciliation correction ≠ Invoice edit

Permanent.

---

## Invoice source Contract

Read exact source:

```text
contractId
contractVersionId
```

where applicable.

Do not resolve source as:

> latest ContractVersion.

---

## Payment due after Contract changes

Contract amendment does not silently change due/amount terms of existing Invoice.

---

## Client Portal

Design 071 must see the same canonical:

```text
issued total
paid amount
refund effects
outstanding balance
```

after client-safe projection.

Internal and Portal numbers cannot diverge.

---

## Finance Dashboard

Design 007 aggregates from the same payment/balance projections.

---

## Activity

Useful events may include:

```text
InvoiceIssued
PaymentRecorded
PaymentAllocated
PaymentAllocationReversed
PaymentAttemptStarted
PaymentReceived
PaymentSettled
RefundInitiated
RefundCompleted
ReconciliationMismatchDetected
InvoiceBalanceChanged
InvoicePaid
```

Activity remains a projection.

---

## Audit

Human/material finance actions should capture:

* manual Payment recording,
* allocation/reallocation,
* Invoice void/cancel,
* refund initiation,
* reconciliation override/correction,
* material finance configuration used.

Automated provider callbacks belong primarily to immutable provider/transaction evidence rather than flooding human Audit history.

---

## Search

Design 079 can index safe Invoice metadata.

Do not index:

* provider transaction secrets,
* restricted payment data,
* sensitive reconciliation evidence.

---

## Caching

InvoiceDetail caching varies by:

```text
organizationMembershipId
invoiceId
authorizationRevision
invoiceRevision
paymentRevision
allocationRevision
refundRevision
balanceRevision
reconciliationRevision
```

Invoice ID alone is insufficient.

---

## Payment/balance cache invalidation

Events such as:

```text
PaymentAllocated
PaymentReversed
RefundCompleted
ReconciliationAdjusted
```

must invalidate/recompute balance projections.

---

## Performance

Use:

* exact Invoice load,
* paginated Payment/transaction history,
* aggregate allocation/payment summaries,
* lazy provider/reconciliation diagnostics,
* indexed payment/invoice relations.

Do not load every raw ProviderEvent into the initial detail view.

---

## Partial failure contract

Example:

```text
Invoice core           ✓
Issued snapshot        ✓
Invoice lines          ✓
Payments               ✓
Allocations            ✓
Balance resolver       ✓
Provider live status   ✕
Transaction diagnostics✕
Reconciliation         ✕
Artifact               ✓
```

Design 102 still renders the financial Invoice and current internally resolvable balance.

Provider/reconciliation sections show explicit unavailability.

Conversely:

```text
Payments service       ✕
Balance service        ✕
```

must result in:

> Payment state unavailable
> Balance unavailable

not:

> Unpaid
> full invoice amount outstanding.

---

## Backend Requirement Matrix

| Requirement                                           | Status                    |
| ----------------------------------------------------- | ------------------------- |
| Canonical Invoice reuse from 020                      | **Critical**              |
| InvoiceDetailView as composition only                 | **Critical**              |
| Invoice/issued snapshot separation                    | **Critical**              |
| Invoice/InvoiceLine separation                        | **Critical**              |
| Invoice/artifact separation                           | **Critical**              |
| Immutable issued terms                                | **Critical**              |
| Current Contract/issued Invoice separation            | **Critical**              |
| Current Client/historical billing snapshot separation | **Critical**              |
| Invoice total/paid amount separation                  | **Critical**              |
| Invoice total/OutstandingBalance separation           | **Critical**              |
| Payment/Invoice separation                            | **Critical**              |
| Multiple Payments per Invoice                         | **Critical**              |
| PaymentAllocation first-class where needed            | **Critical**              |
| Payment/PaymentAllocation separation                  | **Critical**              |
| Multi-Invoice allocation capability preserved         | **Required architecture** |
| Allocation/reversal distinction                       | **Critical**              |
| Allocation/refund distinction                         | **Critical**              |
| Allocation idempotency                                | **Critical**              |
| Allocation concurrency protection                     | **Critical**              |
| Payment/PaymentAttempt separation                     | **Critical**              |
| Multiple attempts without duplicate Payment           | **Critical**              |
| PaymentAttempt/Transaction separation                 | **Critical**              |
| Transaction/ProviderEvent separation                  | **Critical**              |
| Provider/account-scoped transaction IDs               | **Critical**              |
| Provider callback verification                        | **Critical**              |
| Callback idempotency/replay protection                | **Critical**              |
| Out-of-order transaction event handling               | **Critical**              |
| Unknown payment outcome reconciliation                | **Critical**              |
| Duplicate-charge prevention                           | **Critical**              |
| Provider success/settlement separation                | **Critical**              |
| Settlement/reconciliation separation                  | **Critical**              |
| Refund first-class                                    | **Critical**              |
| Refund/payment-allocation reversal separation         | **Critical**              |
| Refund idempotency                                    | **Critical**              |
| Unknown refund outcome reconciliation                 | **Critical**              |
| OutstandingBalance rebuildable                        | **Critical**              |
| Balance write protection                              | **Critical**              |
| PaymentCondition derived centrally                    | **Critical**              |
| DueCondition derived centrally                        | **Critical**              |
| Balance unavailable/zero separation                   | **Critical**              |
| Manual payment/`Mark Paid` separation                 | **Critical**              |
| Manual payment actor/evidence                         | **Critical if supported** |
| Client Portal Design 071 reuse                        | **Critical**              |
| Invoice Library Design 101 reuse                      | **Critical**              |
| Finance Dashboard Design 007 reuse                    | **Critical**              |
| Transaction workspace Design 103 reuse                | **Critical architecture** |
| Section-level authorization                           | **Critical**              |
| Sensitive finance evidence permissions                | **Critical**              |
| Optimistic/transactional concurrency                  | **Critical**              |
| Permission-safe caching                               | **Critical**              |
| Audit/outbox integration                              | **Required**              |
| Partial dependency failure handling                   | **Critical**              |

---

# 8. Consolidation

Design 102 exposes the deepest Invoice/payment-boundary risks because it combines billing truth with payment execution context.

**Invoice / InvoiceDetailView conflation**
Composition becomes another finance backend.

**Invoice / issued snapshot conflation**
Stable receivable and exact billed terms collapse.

**Invoice / artifact conflation**
PDF determines finance truth.

**Invoice / Payment conflation**
Receivable and cash receipt become one record.

**Invoice total / paid amount conflation**
Payment rewrites original billed amount.

**Invoice total / outstanding balance conflation**
Partial payment reduces historical Invoice total.

**OutstandingBalance / manually editable value conflation**
Finance staff can force arbitrary receivable truth.

**Balance unavailable / zero conflation**
Service outage appears fully paid.

**Zero balance / reconciled conflation**
Ledger mismatch disappears.

**Payment / PaymentAllocation conflation**
Receiving money is treated as applying it to one Invoice automatically.

**Payment / one-Invoice ownership conflation**
Bulk remittance cannot allocate correctly.

**Allocation amount / Payment amount conflation**
Partial allocations become impossible.

**Allocation reversal / Refund conflation**
Accounting correction sends money back unnecessarily.

**Allocation delete / historical reversal conflation**
Finance history disappears.

**Payment / PaymentAttempt conflation**
Provider retry creates another receipt.

**PaymentAttempt / Transaction conflation**
Collection intent and financial movement collapse.

**Transaction / ProviderEvent conflation**
Webhook becomes money movement itself.

**Provider Event / Invoice state conflation**
Webhook directly sets Invoice paid.

**Provider accepted / Payment successful conflation**
Processor acknowledgment becomes receipt.

**Payment successful / settled conflation**
Unsettled funds appear final.

**Settled / reconciled conflation**
External movement appears ledger-confirmed.

**Payment attempt succeeded / Invoice paid conflation**
Partial payment becomes full payment.

**Provider timeout / Payment failed conflation**
Unknown outcome gets retried and charges twice.

**Payment retry / duplicate Payment conflation**
One customer payment becomes multiple business receipts.

**Webhook retry / duplicate Transaction conflation**
Provider replay duplicates financial movement.

**Out-of-order provider event / transaction regression conflation**
Settled transaction returns to pending.

**Provider transaction ID / global identity conflation**
Multiple merchant accounts collide.

**Manual “Mark Paid” / Payment evidence conflation**
User bypasses receipt records entirely.

**Manual Payment / anonymous state toggle conflation**
No actor/reference/evidence exists.

**Payment received / Payment allocated conflation**
Unallocated funds appear as Invoice settlement.

**Payment allocated / Payment settled conflation**
Accounting application happens before financial certainty.

**Partial payment / full settlement conflation**
Outstanding balance becomes wrong.

**Refund / negative Payment conflation**
Returned funds lose explicit lineage.

**Refund / Invoice correction conflation**
Billed obligation is rewritten.

**Refund / allocation reversal conflation**
Money movement and bookkeeping adjustment collapse.

**Refund initiated / completed conflation**
Pending processor action appears complete.

**Refund retry / duplicate refund conflation**
Customer receives money twice.

**Unknown refund outcome / failed refund conflation**
Retry causes double refund.

**Full refund / Invoice void conflation**
Financial return and billing-document lifecycle merge.

**Voided Invoice / Payment disappearance conflation**
Received money vanishes historically.

**Invoice lifecycle / PaymentCondition conflation**
Issued/void and unpaid/paid cannot coexist correctly.

**PaymentCondition / DueCondition conflation**
Partially paid and overdue become one status.

**Overdue / failed payment conflation**
No payment attempt is needed to be overdue.

**Paid / no historical overdue conflation**
Late-payment history disappears.

**Reconciliation / balance conflation**
Numerically correct amount appears accounting-verified.

**Reconciliation mismatch / Invoice correction conflation**
Accounting discrepancy alters legal bill.

**Reconciliation unavailable / no mismatch conflation**
System fails open.

**Current Contract / issued Invoice conflation**
Contract amendment changes historic receivable.

**Current Client / billing snapshot conflation**
CRM edits rewrite issued evidence.

**Invoice read / Transaction evidence permission conflation**
Processor-sensitive data leaks.

**Invoice read / Refund authority conflation**
Viewer can reverse funds.

**Invoice owner / finance authority conflation**
Operational responsibility grants payment/refund power.

**Payment allocation / cross-tenant resource conflation**
Funds can be applied across organizations.

**Currency mismatch / valid allocation conflation**
Unsupported FX creates false balance.

**Invoice Detail / Client Portal duplicate financial truth**
Team and client show different amounts.

**Invoice Detail / Finance Dashboard duplicate calculation**
Executive totals disagree with detail.

**Invoice Detail / Reconciliation workspace duplication**
Design 102 becomes accounting investigation system.

**Activity row / Transaction conflation**
Human-readable timeline replaces financial evidence.

**Audit event / Payment evidence conflation**
Audit becomes accounting ledger.

**Cache by Invoice ID only**
Restricted transaction/refund data leaks.

**Generic financial mega-PATCH**
One request updates Invoice, Payment, balance, refund, reconciliation directly.

**102/020 duplicate billing backend**
Original Invoice Workspace and detailed tracking diverge.

**102/071 duplicate Client payment model**
Portal and Team calculate different payment truth.

**102/101 duplicate balance resolver**
List and detail disagree.

**102/103 duplicate transaction/reconciliation backend**
Payment tracking and reconciliation own different transaction truths.

No additional screen is required.

These are **Invoice detail composition, immutable billing snapshots, Payment/Allocation/Attempt/Transaction separation, balance derivation, refund semantics, provider idempotency, duplicate-charge prevention, reconciliation, finance authorization, and partial-failure requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL INVOICE 360, PAYMENT ALLOCATION, BALANCE & RECEIVABLES TRACKING ANCHOR**

**Domain directive:**
**Invoice ≠ InvoiceVersion/IssuedSnapshot ≠ InvoiceLine ≠ Payment ≠ PaymentAllocation ≠ PaymentAttempt ≠ Transaction ≠ ProviderEvent ≠ Refund ≠ Reconciliation ≠ OutstandingBalance ≠ PaymentCondition ≠ DueCondition ≠ IssuedArtifact ≠ Contract/CommercialSource.**

**Identity directive:**
Design 020 remains the sole canonical Invoice/Payment foundation. Design 102 composes detailed tracking around the exact existing Invoice ID and never creates a PaidInvoice/TrackedInvoice entity.

**Projection directive:**
`InvoiceDetailView` is permission-safe and rebuildable from canonical Invoice, Payment, Allocation, Transaction, Refund and Reconciliation records. It can never own independently editable balance/payment truth.

**Issued-snapshot directive:**
all formally issued billing terms remain immutable. Current Client, Contract, Product, Package or organization settings can never rewrite the financial obligation already issued.

**Line-item directive:**
InvoiceLines remain exact billing snapshot components rather than dynamic Product/Package references.

**Money directive:**
Invoice amount, Payment amounts, allocations, refunds and balances use decimal-safe arithmetic with explicit currency.

**Invoice-total directive:**
the original issued Invoice total is never reduced merely because money is paid, refunded or reallocated.

**Payment directive:**
Payment is a first-class receipt/business record independent from Invoice. One Invoice can receive several Payments and one Payment can retain multiple allocations where finance policy requires it.

**Allocation directive:**
PaymentAllocation explicitly records how received money applies to an Invoice. Receiving funds and applying funds are separate events.

**Allocation-history directive:**
allocation correction uses explicit reversal/adjustment lineage rather than deleting or overwriting historical application.

**Concurrency directive:**
allocation commands are transactionally/revision protected so two operators cannot spend the same unallocated Payment amount simultaneously.

**Attempt directive:**
PaymentAttempt represents collection execution around a Payment/payment intent. Retries can produce multiple attempts without automatically producing duplicate Payments.

**Transaction directive:**
Transaction remains processor/bank/ledger movement evidence and is distinct from both Payment and PaymentAttempt.

**Provider directive:**
ProviderEvents are verified, replay-safe, idempotent evidence. They can contribute to normalized Transaction/Payment state but can never directly set Invoice balance or `Paid`.

**Unknown-outcome directive:**
ambiguous provider payment outcomes require reconciliation before another charge attempt when duplication is possible. Blind retry after timeout is prohibited.

**Duplicate-charge directive:**
provider idempotency keys, canonical Payment/payment-intent identity and provider reconciliation must combine to prevent one intended payment from charging the client multiple times.

**Settlement directive:**
provider acceptance, payment success, settlement and reconciliation remain independently modeled and observable.

**Refund directive:**
Refund is its own financial entity with payment/transaction lineage, amount, currency, provider evidence and lifecycle. It is neither a negative Payment nor an Invoice edit.

**Refund-safety directive:**
refund initiation is idempotent and unknown provider refund outcomes require reconciliation before retry to prevent duplicate fund return.

**Reallocation directive:**
PaymentAllocation reversal/correction and actual Refund remain distinct. Accounting application must not accidentally move cash.

**Balance directive:**
`OutstandingBalance` is a deterministic, rebuildable resolver output over the exact issued obligation plus recognized allocations/refunds/credits/adjustments according to canonical finance policy. It is never browser-editable.

**Zero/unknown directive:**
`0 outstanding` and `balance unavailable` are radically different states and must never be interchanged.

**Payment-condition directive:**
Unpaid/Partially Paid/Paid/Overpaid are derived financial conditions—not Invoice lifecycle values.

**Due directive:**
due/overdue state is independently derived using canonical due terms + remaining actionable balance + timezone/date semantics. Overdue never means payment failure.

**Manual-payment directive:**
if offline/manual receipts are supported, Finance users record a real Payment with actor, amount, currency, method/reference/evidence and allocation. A generic “Mark Paid” state toggle is prohibited.

**Reconciliation directive:**
Design 103 remains authoritative for detailed transaction/reconciliation work. Design 102 consumes reconciliation summaries without mutating Invoice totals to force agreement.

**Contract directive:**
Designs 099–100 remain canonical for legal/commercial source terms. Design 102 preserves exact billing-source lineage but never recalculates the issued Invoice from the latest ContractVersion.

**Portal directive:**
Design 071 consumes exactly the same Invoice, Payment and balance truth through client-safe projections. Internal and client-facing paid/outstanding numbers must not diverge.

**Library directive:**
Design 101 and Design 102 use one shared `InvoiceBalanceResolver`, `PaymentConditionResolver`, and `InvoiceDueResolver`, eliminating collection/detail drift.

**Dashboard directive:**
Design 007 Finance Dashboard aggregates the same canonical financial projections rather than maintaining separate receivables calculations.

**Authorization directive:**
Invoice read, commercial values, Payment records, allocation, provider Transactions, Refunds, Reconciliation and artifacts remain independently server-authorized. Financial-detail access cannot be inferred merely from Invoice visibility.

**Tenant directive:**
Payment allocations, Transactions, Refunds and Invoice references are strictly tenant-scoped. Cross-tenant allocation is prohibited regardless of guessed IDs.

**Currency directive:**
allocation/refund operations validate currency compatibility server-side; unsupported currency conversion can never be inferred by simple numeric arithmetic.

**Idempotency directive:**
manual Payment recording, Payment initiation, allocation, allocation reversal, provider callbacks and refunds all require replay-safe execution identities.

**Partial-failure directive:**
Invoice identity and issued financial obligation remain visible even if live provider, Payment, Balance, Reconciliation, Contract or artifact dependencies fail. `Unavailable` can never become false `Unpaid`, `$0`, `Paid`, or `Reconciled`.

**Performance directive:**
use exact Invoice reads, aggregate Payment/allocation summaries, indexed financial relations, paginated histories and lazy provider/reconciliation diagnostics rather than loading complete raw transaction evidence on initial render.

**Caching directive:**
Invoice Detail caches vary by membership, authorization revision, Invoice revision, Payment/allocation/refund/balance/reconciliation revisions. Invoice ID alone is insufficient.

**Activity directive:**
human-readable Invoice/payment Activity remains a projection over canonical finance events and never replaces Payment, Transaction, Refund or Reconciliation evidence.

**Audit directive:**
manual payment recording, allocation/reallocation, refunds, Invoice voiding and reconciliation overrides require strong actor-aware Audit evidence, while automated provider events remain immutable financial-integration evidence with appropriate redaction.

**Future-reuse directive:**
Design 103 must consume the exact PaymentAttempt, Transaction, ProviderEvent, Refund and financial-allocation lineage established here and specialize reconciliation/investigation without introducing another Payment or Invoice balance model.

**Overlap directive:**
Designs **007, 020, 054, 071, 101–103** must share one continuous **Invoice → IssuedSnapshot/Lines → Payment → Allocation → PaymentAttempt → Transaction/ProviderEvent → Refund → Reconciliation → Derived Balance/PaymentCondition** lineage while keeping billing obligation, money receipt, processor execution and accounting verification independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE INVOICE PAYMENT-TRACKING FOUNDATION — CANONICAL INVOICE IDENTITY + IMMUTABLE ISSUED SNAPSHOT/LINES + FIRST-CLASS PAYMENT RECEIPTS + EXPLICIT PAYMENTALLOCATIONS + IDEMPOTENT PAYMENTATTEMPTS + PROVIDER-NEUTRAL TRANSACTIONS/EVENTS + DUPLICATE-CHARGE-SAFE UNKNOWN-OUTCOME RECONCILIATION + EXPLICIT REFUNDS + REBUILDABLE BALANCE/PAYMENT/DUE RESOLVERS + RECONCILIATION SUMMARY + SHARED TEAM/PORTAL/DASHBOARD FINANCIAL PROJECTIONS — AND NEVER ALLOW PROVIDER CALLBACKS, “MARK PAID” FLAGS, PAYMENT ATTEMPTS, REFUNDS, ALLOCATION CORRECTIONS OR UNAVAILABLE BALANCE DATA TO REWRITE THE HISTORICAL ISSUED INVOICE OR SUBSTITUTE FOR VERIFIED FINANCIAL TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **102 / 153** |
| **PASS**                                   |                        **102** |
| **STANDARDIZE decisions**                  |                        **100** |
| **Potential implementation-overlap flags** |                         **93** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**102 / 153 = 66.7% audited.**

### Canonical Invoice/payment architecture after Design 102

```text
                    INVOICE
             stable receivable identity
                      │
                      ↓
                Issued Snapshot
                      │
             ┌────────┴────────┐
             ↓                 ↓
        InvoiceLines       Issued Amount
                               │
                               ↓
                            PAYMENT
                               │
                      PaymentAllocation
                               │
                         ┌─────┴─────┐
                         ↓           ↓
                     Invoice 1    Invoice 2
                              
Payment
   │
   ↓
PaymentAttempt
   │
   ↓
Transaction
   │
   ↓
ProviderEvent

Payment / Transaction
   │
   ├── Refund
   └── Reconciliation
            │
            ↓
      Balance Resolver
            │
            ↓
     OutstandingBalance
```

The payment-vs-allocation boundary is now explicit:

```text
Payment received:      $10,000

Allocated to I-100:     $6,000
Allocated to I-200:     $4,000

Payment             ≠ Allocation
Invoice             ≠ Payment
Invoice total       ≠ Outstanding balance
```

The collection safety rule is equally strict:

```text
PaymentAttempt A1
      ↓
Provider request sent
      ↓
Network timeout
      ↓
OUTCOME UNKNOWN

Correct:
reconcile provider state first

Incorrect:
immediately retry and potentially
charge the client twice
```

And no direct status toggle can replace actual financial evidence:

```text
“Mark Invoice Paid”
        ✕

Correct:

Payment
   ↓
Allocation
   ↓
Balance resolver
   ↓
Outstanding = 0
   ↓
PaymentCondition = PAID
```

Finally:

```text
Invoice total          = $10,000
Payment condition      = PAID
Outstanding balance    = $0
Reconciliation         = PENDING

All are valid together.

Paid ≠ Reconciled.
```

## Next Sequential Audit Target

### **Design 103 — Payment Transactions / Reconciliation Workspace**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
