# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 103 — Payment Transactions / Reconciliation Workspace

Design 103 should become the **canonical Team Workspace financial transaction evidence, settlement verification, payment-allocation reconciliation, discrepancy investigation, and reconciliation-resolution surface** over the Invoice/Payment foundation established by Design 020 and refined through Designs 101–102.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary should be:

> **Payment ≠ PaymentAllocation ≠ PaymentAttempt ≠ Transaction ≠ ProviderEvent ≠ Settlement ≠ Refund ≠ Reversal ≠ ReconciliationRecord/Case ≠ ReconciliationMatch ≠ Adjustment ≠ Invoice ≠ OutstandingBalance.**

The central implementation rule is:

> **Design 103 does not become a second Payment, Invoice, or accounting backend. Canonical Payments remain the business receipt identities; PaymentAttempts represent collection execution; Transactions represent normalized financial movements/evidence; ProviderEvents are immutable external observations; Settlement describes external funds finality where applicable; and Reconciliation independently proves whether internal financial expectations match trustworthy external evidence. Resolving a mismatch must never rewrite provider history, issued Invoice terms, or prior Payment evidence.**

---

# 1. Classification

| Audit field                       | Classification                                                                                                                                                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                     | **103**                                                                                                                                                                                                                   |
| **Canonical name**                | **Payment Transactions / Reconciliation Workspace**                                                                                                                                                                       |
| **Product area**                  | Team Workspace / Finance / Payments / Reconciliation                                                                                                                                                                      |
| **User surface**                  | **Authenticated Team Workspace**                                                                                                                                                                                          |
| **Screen class**                  | Financial Operations / Transaction Investigation / Reconciliation Workspace                                                                                                                                               |
| **Classification**                | **Canonical Payment Transaction Evidence, Settlement & Reconciliation Operations Anchor**                                                                                                                                 |
| **Primary purpose**               | Inspect canonical payment-related Transactions, compare internal expected financial state with provider/bank evidence, identify mismatches, and record governed reconciliation decisions without rewriting source history |
| **Business receipt entity**       | **Payment** — Design 020                                                                                                                                                                                                  |
| **Application relation**          | **PaymentAllocation**                                                                                                                                                                                                     |
| **Execution entity**              | **PaymentAttempt**                                                                                                                                                                                                        |
| **Financial movement/evidence**   | **Transaction**                                                                                                                                                                                                           |
| **External integration evidence** | **ProviderEvent**                                                                                                                                                                                                         |
| **Settlement concept**            | **Settlement / SettlementState** where supported                                                                                                                                                                          |
| **Refund entity**                 | **Refund**                                                                                                                                                                                                                |
| **Reversal concept**              | **TransactionReversal / Reversal evidence** where applicable                                                                                                                                                              |
| **Reconciliation entity**         | **ReconciliationRecord / ReconciliationCase**                                                                                                                                                                             |
| **Matching relation**             | **ReconciliationMatch**                                                                                                                                                                                                   |
| **Controlled correction**         | **Adjustment / ReconciliationAdjustment** where finance policy permits                                                                                                                                                    |
| **Invoice dependency**            | Designs 020 / 101–102                                                                                                                                                                                                     |
| **Client Portal dependency**      | Designs 054 / 071                                                                                                                                                                                                         |
| **Finance Dashboard dependency**  | Design 007                                                                                                                                                                                                                |
| **Contract lineage dependency**   | Designs 099–100 where relevant                                                                                                                                                                                            |
| **Provider abstraction**          | `PaymentProviderAdapter`                                                                                                                                                                                                  |
| **Primary query service**         | `TransactionReconciliationQueryService`                                                                                                                                                                                   |
| **Transaction service**           | `TransactionService`                                                                                                                                                                                                      |
| **Reconciliation service**        | `ReconciliationService`                                                                                                                                                                                                   |
| **Matching engine**               | `ReconciliationMatchingService`                                                                                                                                                                                           |
| **Settlement resolver**           | `SettlementResolver`                                                                                                                                                                                                      |
| **Adjustment service**            | governed finance adjustment service, if supported                                                                                                                                                                         |
| **Parent shell**                  | `InternalAppShell` — Design 001                                                                                                                                                                                           |
| **Auth**                          | Required                                                                                                                                                                                                                  |
| **Authorization**                 | Active OrganizationMembership + transaction/reconciliation/finance permissions                                                                                                                                            |
| **Implementation priority**       | **Critical Financial Integrity / Accounting Verification / Duplicate-Charge & Evidence Safety**                                                                                                                           |
| **Reuse level**                   | **Extremely High across Invoices, Payments, Refunds, Finance Dashboard, Client Portal and Reporting**                                                                                                                     |

Design 103 should answer:

> **“What financial movements actually occurred, which Payment/Attempt/Invoice they belong to, what the provider or trusted external source reported, whether internal and external records agree, what discrepancy remains, and which authorized reconciliation action resolved it without altering historical evidence?”**

Canonical structure:

```text
Invoice
   │
   ↓
Payment
   │
   ├── PaymentAllocation[]
   │
   └── PaymentAttempt[]
            │
            ↓
        Transaction[]
            │
            ├── ProviderEvent[]
            ├── Settlement evidence
            ├── Reversal / Refund evidence
            │
            ↓
      ReconciliationRecord
            │
      ┌─────┴────────┐
      ↓              ↓
Expected state   Observed state
      │              │
      └──────┬───────┘
             ↓
     ReconciliationMatch
             │
        ┌────┴─────┐
        ↓          ↓
   Reconciled    Mismatch
                    │
                    ↓
         Governed correction /
         investigation / adjustment
```

---

# 2. Reuse

## Design 020 remains canonical for Invoice and Payment

Design 103 must not create another:

```text
ReconciledPayment
ProcessorPayment
FinancePayment
TransactionPayment
```

as a parallel business receipt identity.

Correct:

```text
Payment P-100
    ↓
PaymentAttempt A-1
    ↓
Transaction T-1
    ↓
Reconciliation R-1
```

---

## Design 102 remains canonical Invoice payment tracking

Design 102 explains one Invoice's payment history.

Design 103 specializes:

* processor/bank transaction evidence,
* settlement,
* mismatch investigation,
* reconciliation.

Both must read the same `Payment`, `Allocation`, `Transaction`, `Refund`, and balance lineage.

---

## Design 101 remains canonical Invoice collection summary

Any reconciliation badge/count shown in the Invoice Library must be a projection of Design 103's canonical reconciliation records.

Never:

```text
invoice.reconciled = true
```

as a second independently managed truth.

---

## Design 071 remains Client-safe payment detail

Client Portal may show:

> Payment received.

It generally should not receive internal reconciliation diagnostics such as:

* provider mismatch,
* processor reference anomalies,
* internal manual-adjustment rationale.

Same canonical financial records, different safe projections.

---

## Design 007 Finance Dashboard must consume reconciled finance semantics

Dashboard totals should not count money differently from Design 103.

Where management reporting distinguishes:

* received,
* settled,
* reconciled,

those definitions should come from one canonical metric/resolver layer.

---

## PaymentAttempt reuse

Design 103 investigates attempts created by Design 020/102.

It does not create a second provider-attempt entity.

---

## Refund reuse

Refund remains the same canonical Refund introduced in Designs 020/102.

Reconciliation may verify it.

It does not turn Refund into a negative Transaction shortcut.

---

# 3. Entities

## Payment

Payment remains the canonical business receipt/payment identity.

It answers:

> **What payment did the business receive/intend to receive from the payer?**

It does not answer:

> Which processor webhook fired?

or:

> Has accounting reconciliation completed?

---

## Payment ≠ Transaction

Permanent.

Example:

```text
Payment P-100
$10,000

Transactions:
AUTHORIZATION T1
CAPTURE T2
SETTLEMENT T3
```

depending on provider semantics.

One business Payment can produce multiple financial movements.

---

## Payment ≠ Reconciliation

Permanent.

A Payment can be:

```text
Received
but
Reconciliation = Pending
```

---

## PaymentAllocation

PaymentAllocation answers:

> **How much of the Payment is applied to which Invoice?**

It remains independently auditable.

---

## Allocation ≠ reconciliation

Permanent.

An allocation can be internally correct but external funds may not yet be settled/reconciled.

---

## Allocation mismatch

Example:

```text
Payment received:        $10,000
Internal allocation:     $10,000
Processor settled:        $9,700
```

The discrepancy does **not** mean:

> rewrite allocation to $9,700.

It may represent:

* fee handling,
* partial settlement,
* processor issue,
* incorrect mapping,

depending on policy.

Reconciliation determines the meaning.

---

## PaymentAttempt

PaymentAttempt remains one collection execution attempt.

Conceptually:

```text
Payment P1
├── Attempt A1 — timeout
├── Attempt A2 — declined
└── Attempt A3 — succeeded
```

---

## PaymentAttempt ≠ Transaction

Permanent.

An attempt is an execution operation.

A Transaction is a financial movement/evidence record.

---

## Attempt failure ≠ no Transaction always

A provider can return a timeout while later reporting a successful Transaction.

Therefore:

> **Attempt outcome and financial evidence must be reconciled rather than blindly equated.**

---

## Transaction

`Transaction` should be the canonical normalized record of a financial movement/evidence event relevant to the platform.

Conceptually:

```text
Transaction
├── id
├── organizationId
├── provider / source
├── provider account
├── providerTransactionId
├── payment/paymentAttempt context
├── transactionType
├── amount
├── currency
├── occurredAt
├── normalized state
├── settlement context
└── revision/evidence lineage
```

Exact schema belongs to Phase 3D.

---

## Transaction ≠ ProviderEvent

Critical.

ProviderEvent says:

> The external provider reported something.

Transaction says:

> This normalized financial movement is represented canonically in our finance domain.

---

## One Transaction can have multiple ProviderEvents

Example:

```text
Transaction T1
├── ProviderEvent E1 — pending
├── ProviderEvent E2 — completed
└── ProviderEvent E3 — settlement update
```

---

## ProviderEvent is append-oriented

Never overwrite old provider evidence just because a newer callback arrives.

---

## Provider event retry ≠ new Transaction

Absolute.

Webhook at-least-once delivery must deduplicate.

---

## Provider event ordering

Example:

```text
SETTLED occurred 10:00
AUTHORIZED callback received 10:05
```

Canonical Transaction state must not regress to AUTHORIZED.

---

## Transaction types

Potential normalized types may conceptually include:

```text
Authorization
Capture
Charge
Settlement
Refund
Reversal
Fee
Adjustment
```

depending on providers and finance model.

Exact taxonomy belongs to Phase 3D.

Do not expose raw provider enums as core finance semantics.

---

## Provider transaction IDs are namespace-scoped

Identity should conceptually include:

```text
provider
+
merchant/provider account
+
providerTransactionId
```

not provider ID alone.

---

## Transaction amount ≠ Payment amount necessarily

Example:

```text
Payment amount:     $10,000
Settlement amount:   $9,700
Processor fee:         $300
```

Whether fee is represented separately depends on the finance model.

The important invariant is:

> Do not assume every provider transaction amount must equal the business Payment amount.

---

## Settlement

Settlement describes external funds finality/movement where applicable.

Conceptually:

```text
Settlement
├── transaction context
├── provider/bank batch context
├── gross amount
├── net amount
├── currency
├── settlement date
├── settlement status
└── external evidence
```

A dedicated entity is justified only if provider/finance semantics require it; otherwise settlement can be normalized Transaction state/evidence.

The conceptual boundary remains mandatory.

---

## Provider success ≠ settled

Permanent.

---

## Settled ≠ reconciled

Permanent.

---

## Settlement batch ≠ Payment

Permanent.

One settlement batch can represent multiple business Payments.

---

## Settlement date ≠ Payment received date

Permanent.

---

## Refund

Refund remains an explicit return-of-funds entity.

Reconciliation must verify:

* requested amount,
* processor amount,
* transaction linkage,
* finality.

---

## Refund ≠ Reversal

Critical.

### Refund

Business action intentionally returning money.

### Reversal

Processor/bank reversal of a prior financial movement.

These can have similar numeric effect but different business meaning/evidence.

---

## Refund success ≠ reconciliation complete

Permanent.

---

## Reversal ≠ original Transaction deletion

Absolute.

Original transaction remains historical.

Reversal is linked evidence.

---

## ProviderEvent

ProviderEvent should preserve external facts such as conceptually:

```text
ProviderEvent
├── providerEventId
├── provider account
├── event type
├── providerTransaction reference
├── occurredAt
├── receivedAt
├── verification status
└── raw/safe evidence reference
```

---

## Invalid ProviderEvent ≠ Transaction evidence

Permanent.

Unverified callback cannot affect reconciliation.

---

## Unknown ProviderEvent

Unknown/unlinked events should be quarantined or investigated.

Do not attach based solely on:

* same amount,
* customer email,
* timestamp proximity.

---

## ReconciliationRecord / ReconciliationCase

Design 103 requires a first-class reconciliation concept.

Conceptually:

```text
ReconciliationRecord
├── id
├── organizationId
├── subjectType / context
├── expected financial state
├── observed external state
├── discrepancy state
├── reconciliation policy/version
├── openedAt
├── resolvedAt
├── resolvedBy
├── resolution type
└── revision
```

Exact physical model Phase 3D.

---

## Reconciliation ≠ Transaction

Permanent.

Transaction is financial evidence.

Reconciliation compares evidence against expectations.

---

## Reconciliation ≠ Payment

Permanent.

---

## Reconciliation ≠ Invoice

Permanent.

---

## Reconciliation subject

A reconciliation may concern, depending on final finance model:

* Payment,
* Transaction,
* Refund,
* settlement batch,
* PaymentAllocation,
* Invoice balance.

Do not force every reconciliation into `invoiceId`.

---

## Expected state

Expected values should derive from canonical internal records.

Examples:

```text
Expected payment = $10,000
Expected settlement = $10,000
Expected refund = $2,000
Expected provider currency = USD
```

---

## Observed state

Observed values come from trusted external/provider/ledger evidence.

Examples:

```text
Observed settlement = $9,700
Observed currency = USD
Observed processor fee = $300
```

---

## Expected state ≠ observed state

Permanent.

This distinction is the entire purpose of reconciliation.

---

## ReconciliationMatch

Where automated/manual matching is required:

```text
ReconciliationMatch
├── reconciliationId
├── internal subject
├── external transaction/evidence
├── match basis
├── confidence/exactness
├── matchedBy system/user
└── matchedAt
```

---

## Match ≠ reconciliation completion automatically

Critical.

A Transaction can be matched to a Payment but still have:

* amount mismatch,
* currency mismatch,
* settlement mismatch.

---

## Automated match ≠ human resolution

Permanent.

---

## Fuzzy match ≠ identity

Matching is evidence.

Do not merge financial records solely because amounts/dates look similar.

---

## Reconciliation state

Conceptually:

```text
PENDING
MATCHED
RECONCILED
MISMATCH
NEEDS_REVIEW
RESOLVED_WITH_ADJUSTMENT
UNAVAILABLE
```

Exact enum Phase 3D.

---

## Reconciled ≠ Payment received

Permanent.

---

## Reconciled ≠ Invoice paid

Permanent.

---

## Reconciled ≠ Transaction settled universally

Reconciliation could concern another state.

---

## Reconciliation resolution

A discrepancy can be resolved through different mechanisms, for example:

```text
Correct linkage
Correct allocation
Recognize fee
Record missing Payment
Record reversal
Record permitted adjustment
Mark external evidence erroneous
```

according to final finance policy.

The resolution must be explicit.

---

## Adjustment

If manual financial adjustments are supported:

`Adjustment` must be a first-class governed financial correction.

Conceptually:

```text
Adjustment
├── id
├── finance context
├── amount
├── currency
├── reason code
├── evidence
├── createdBy
├── approvedBy where required
└── createdAt
```

Do not implement adjustment as:

```text
outstandingBalance = 0
```

---

## Adjustment ≠ Provider Transaction

Permanent.

Internal accounting correction must not masquerade as external money movement.

---

## Adjustment ≠ Refund

Permanent.

---

## Adjustment ≠ Invoice edit

Permanent.

---

## Reconciliation resolution must preserve prior mismatch

Critical.

Correct:

```text
Mismatch detected
        ↓
Adjustment / correction
        ↓
Reconciliation resolved
```

Historical mismatch remains visible.

Not:

```text
delete mismatch
```

---

## OutstandingBalance

Balance remains Design 102's derived financial projection.

Reconciliation may influence valid source records feeding balance.

Reconciliation itself must not simply write the final balance number.

---

## Balance after reconciliation

Correct:

```text
Reconciliation determines
missing/incorrect source relation
        ↓
canonical correction made
        ↓
BalanceResolver recomputes
```

Not:

```text
Reconciliation
→ set balance = $0
```

---

# 4. Permissions

Design 103 should conceptually distinguish:

```text
transaction.read
transaction.providerEvidence.read

reconciliation.read
reconciliation.match
reconciliation.resolve

reconciliation.adjustment.create
reconciliation.adjustment.approve

payment.read
payment.record

paymentAllocation.read
paymentAllocation.manage

refund.read
refund.manage

finance.sensitiveEvidence.read
finance.export
```

Exact keys belong to Phase 3D.

---

## Transaction read ≠ provider raw evidence read

Permanent.

Provider evidence may contain sensitive:

* merchant information,
* processor metadata,
* customer/payment identifiers.

---

## Reconciliation read ≠ resolve

Critical.

An auditor may inspect discrepancies without authority to change financial mappings.

---

## Match ≠ resolve

Permanent.

A user may suggest/link a match while final reconciliation requires higher authority.

---

## Reconciliation resolve ≠ adjustment authority

Permanent.

---

## Adjustment creation ≠ adjustment approval

Where segregation of duties is required, preserve:

```text
creator ≠ approver
```

as a policy possibility.

Do not assume one user can self-authorize material corrections.

---

## Invoice read ≠ reconciliation access

Permanent.

---

## Payment read ≠ reconciliation write

Permanent.

---

## Deal/Client ownership ≠ finance authority

Absolute.

---

## Manual reconciliation identity derives from authenticated membership

Never trust:

```text
resolvedBy = arbitraryUserId
```

from browser payload.

---

## Direct Transaction ID reauthorizes

Permanent.

---

## Direct Reconciliation ID reauthorizes

Permanent.

---

## Provider ID grants no access

Absolute.

---

## Cross-tenant matching prohibited

A Payment in Organization A cannot be reconciled against Transaction from Organization B.

---

## Merchant/provider account scope validated

Same provider transaction ID on two merchant accounts must not collide.

---

## Export permission separate

Transaction/reconciliation exports can contain sensitive finance information.

---

## Client Portal never gains reconciliation permission implicitly

Design 071 payment access remains client-safe.

---

# 5. States

Design 103 must keep **Payment state, PaymentAttempt state, Transaction state, Settlement state, Refund/Reversal state, Reconciliation state, Match state, Adjustment state, and Invoice/Balance state** separate.

### Payment

Canonical Design 020/102 state.

### PaymentAttempt

```text
Created
Processing
Provider Accepted
Succeeded
Declined
Failed
Outcome Unknown
Cancelled
```

### Transaction

Conceptually:

```text
Pending
Authorized
Captured
Completed
Settled
Failed
Reversed
Unknown
```

depending on normalized transaction type.

### Settlement

```text
Not Settled
Settlement Pending
Settled
Partially Settled
Settlement Failed
Settlement Unknown
```

where applicable.

### Refund/Reversal

```text
Refund Pending
Refund Completed
Refund Failed
Reversal Observed
```

### Match

```text
Unmatched
Suggested Match
Matched
Ambiguous
Rejected Match
```

### Reconciliation

```text
Not Started
Pending
Matched
Reconciled
Mismatch
Needs Review
Resolved With Correction
Unavailable
```

### Adjustment

```text
Not Required
Draft
Pending Approval
Approved
Applied
Rejected
Cancelled
```

where adjustments exist.

These must never collapse into one `transaction.status`.

---

## Payment succeeded ≠ Transaction settled

Permanent.

---

## Transaction settled ≠ reconciled

Permanent.

---

## Reconciled ≠ Invoice paid universally

Permanent.

---

## Matched ≠ reconciled

Critical.

---

## Suggested match ≠ matched

Permanent.

---

## Ambiguous match ≠ reconciliation failure

Permanent.

It means human review is required.

---

## Refund completed ≠ original Transaction deleted

Permanent.

---

## Reversal observed ≠ Refund completed

Permanent.

---

## Settlement mismatch ≠ Payment failed

Permanent.

---

## Adjustment applied ≠ provider evidence changed

Permanent.

---

## Reconciliation resolved ≠ historical mismatch erased

Permanent.

---

## Provider unavailable ≠ Transaction failed

Critical.

---

## External evidence unavailable ≠ reconciled

Critical.

---

## Reconciliation service unavailable ≠ no mismatch

Critical.

---

## Match engine unavailable ≠ unmatched

Critical.

Use:

> Matching unavailable.

---

## State Coverage

Design 103 inherits Design 150 plus:

```text
Transaction Workspace Loading
Transaction Workspace Available
Transaction Workspace Empty
Transaction Workspace Restricted
Transaction Workspace Partial

Transaction Pending
Transaction Authorized
Transaction Captured
Transaction Completed
Transaction Settled
Transaction Failed
Transaction Reversed
Transaction State Unknown

Settlement Pending
Settlement Partial
Settlement Complete
Settlement Failed
Settlement Unknown

Transaction Unmatched
Suggested Match
Transaction Matched
Match Ambiguous
Match Rejected
Match Service Unavailable

Reconciliation Not Started
Reconciliation Pending
Reconciliation Matched
Reconciled
Reconciliation Mismatch
Reconciliation Needs Review
Reconciliation Resolved
Reconciliation Unavailable

No Adjustment Required
Adjustment Draft
Adjustment Pending Approval
Adjustment Approved
Adjustment Applied
Adjustment Rejected

Refund Context Available
Refund Pending
Refund Completed
Refund Failed

Provider Evidence Available
Provider Evidence Restricted
Provider Evidence Unavailable

Payment Context Available
Payment Context Restricted
Payment Service Unavailable

Invoice Context Available
Invoice Context Restricted
Invoice Service Unavailable

Reconciliation Updated Elsewhere
Transaction Updated Elsewhere
Partial Transaction Detail Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize **financial evidence comparison and discrepancy resolution**, not merely Transaction listing.

Conceptually:

```text
Transactions / Reconciliation
↓
Transaction rows
   ├── canonical transaction identity
   ├── provider/source
   ├── amount + currency
   ├── Payment / Invoice context
   ├── transaction state
   ├── settlement state
   └── reconciliation state

Selected transaction / case
   ├── internal expected state
   ├── external observed evidence
   ├── matches
   ├── discrepancy
   ├── refund/reversal context
   ├── resolution history
   └── governed action
```

Only frozen Design 103 elements should render.

---

## Transaction and reconciliation status need separate indicators

Correct:

> Transaction: Settled
> Reconciliation: Needs review

Not:

> Status: Needs review

if that obscures the financial transaction state.

---

## Expected vs observed amounts should be explicit

Example:

```text
Expected: $10,000
Observed:  $9,700
Difference:   $300
```

where canonical data and permissions support it.

---

## Currency must remain visible

Never reconcile numeric amounts without currency context.

---

## Provider state remains secondary to canonical finance state

Correct hierarchy:

```text
Canonical Transaction
Reconciliation
Provider evidence
```

not a provider dashboard transplanted into the product.

---

## Tablet

Following Design 152:

* transaction rows compact into cards,
* amount/currency and reconciliation state remain primary,
* selected reconciliation comparison stacks,
* evidence/diagnostics stay secondary.

---

## Mobile

Priority:

```text
Transaction
↓
Amount + currency
↓
Payment / Invoice context
↓
Transaction state
↓
Settlement state
↓
Reconciliation state
↓
Mismatch summary
↓
Authorized resolution
```

Do not compress a wide finance-comparison table horizontally.

---

## Mobile mismatch semantics

Use explicit text:

> Expected $10,000
> Observed $9,700
> Difference $300
> Needs review

rather than relying on color.

---

## Accessibility

A reconciliation item could communicate:

> Transaction T-104 for Payment P-82. Expected amount 10,000 US dollars. Provider settlement observed at 9,700 dollars. Difference 300 dollars. Transaction settled. Reconciliation requires review.

where canonical authorized data supports it.

---

# 7. Backend Requirements

## Canonical transaction/reconciliation architecture

```text
Design 103
    ↓
Authenticated Workspace Context
    ↓
TransactionReconciliationQueryService
    │
    ├── PaymentAdapter
    ├── PaymentAllocationAdapter
    ├── PaymentAttemptAdapter
    ├── TransactionAdapter
    ├── ProviderEvidenceAdapter
    ├── SettlementAdapter
    ├── Refund/ReversalAdapter
    ├── ReconciliationAdapter
    ├── MatchAdapter
    └── AdjustmentAdapter
    ↓
TransactionReconciliationView
```

---

## No duplicated transaction backend

Provider adapters must normalize into one canonical Transaction model.

Do not create:

```text
StripeTransaction
PayPalTransaction
BankTransaction
```

as business-domain sources of truth.

Provider-specific records can exist as raw/integration evidence.

---

## Transaction ingestion

Canonical flow:

```text
ProviderEvent / external feed
        ↓
verify source
        ↓
deduplicate
        ↓
persist immutable external evidence
        ↓
normalize
        ↓
resolve PaymentAttempt / Payment context
        ↓
create/update canonical Transaction state
        ↓
trigger reconciliation
```

---

## Provider verification

Where provider supports it, validate:

* webhook signature,
* timestamp,
* merchant account,
* event ID,
* request authenticity.

Invalid evidence cannot update Transaction state.

---

## Provider event idempotency

At-least-once delivery must resolve to one provider evidence event.

---

## Transaction idempotency

Repeated provider callbacks describing the same financial movement must not create multiple canonical Transactions.

Use provider/account/transaction identity plus normalized movement semantics.

---

## Out-of-order provider events

Transaction state projector must use:

* provider occurrence time,
* normalized lifecycle precedence,
* transaction type,

rather than arrival order.

---

## Raw evidence retention

Where legally/security appropriate, preserve raw or safe hashed/reference evidence separately.

Do not place full sensitive payloads in ordinary application tables/logs.

---

## PaymentAttempt linkage

Transaction resolver should use strong references:

```text
provider payment intent
merchant account
idempotency identity
provider transaction ID
```

rather than weak heuristics.

---

## Unknown transaction linkage

If reliable linkage fails:

create/retain:

> unmatched financial evidence

for reconciliation.

Do not discard it.

---

## Reconciliation trigger

Reconciliation can be triggered by:

* new Transaction,
* settlement update,
* Refund,
* allocation change,
* imported bank evidence,
* manual financial record,

according to architecture.

---

## Reconciliation engine

Conceptually:

```text
ReconciliationService.reconcile(subject)
```

should:

1. load canonical internal expected state;
2. load trustworthy external evidence;
3. normalize currency/amount semantics;
4. resolve candidate matches;
5. compare expected vs observed;
6. classify exact match/mismatch/ambiguous/unavailable;
7. persist ReconciliationRecord;
8. emit event if state changes.

---

## Reconciliation must be reproducible

Record enough context to explain:

* what was expected,
* what was observed,
* which source/evidence,
* policy/version,
* when evaluated.

---

## Reconciliation policy version

If matching/tolerance rules evolve:

pin a `ReconciliationPolicyVersion` or equivalent.

Historical reconciliations must remain explainable.

---

## Matching engine

Conceptually:

```text
ReconciliationMatchingService.findCandidates(...)
```

can use controlled factors such as:

* provider transaction IDs,
* Payment intent IDs,
* amount/currency,
* payer/account,
* timestamps,
* references.

Strong identifiers outrank fuzzy heuristics.

---

## Fuzzy matching must not auto-merge identity recklessly

A $10,000 Transaction on the same date is not automatically the same Payment.

---

## Match confidence

If automated matching uses confidence:

confidence ≠ reconciliation result.

---

## Human match decision

If an operator confirms a match:

record actor/time/basis.

Do not overwrite what the matching engine originally suggested.

---

## Match correction

If the wrong Transaction was matched:

use explicit unlink/correct-match history.

Never silently replace the previous match.

---

## Reconciliation concurrency

Two Finance users must not resolve the same mismatch differently without conflict detection.

Use expected revision/locking semantics.

---

## Reconciliation command

Conceptually:

```text
resolveReconciliation(
    reconciliationId,
    expectedRevision,
    resolution,
    idempotencyKey
)
```

should:

1. authorize;
2. validate current reconciliation state;
3. validate selected evidence/match;
4. validate proposed resolution;
5. invoke canonical financial correction service if required;
6. preserve prior mismatch/history;
7. recalculate relevant balance/payment projections;
8. append resolution;
9. emit Audit/outbox.

---

## Never directly edit provider Transaction

Absolute.

Provider evidence is historical observation.

If the provider reported $9,700, reconciliation cannot change it to $10,000 merely to make records agree.

---

## Never directly edit issued Invoice to reconcile

Absolute.

Issued billing terms remain immutable.

---

## Never directly edit OutstandingBalance

Absolute.

Correct canonical source records and recompute.

---

## Adjustments

If discrepancy is legitimately resolved via an internal Adjustment:

```text
AdjustmentService.createAdjustment(...)
```

must:

* authorize,
* record amount/currency,
* require reason,
* preserve evidence,
* observe approval policy if applicable,
* remain distinct from external Transaction,
* trigger balance/reconciliation recomputation.

---

## Adjustment idempotency

Retry cannot apply an adjustment twice.

---

## Adjustment reversal

If allowed, create explicit reversing adjustment.

Do not delete historical adjustment.

---

## Segregation of duties

For material manual adjustments, architecture should support policy such as:

```text
creator ≠ approver
```

where required.

Exact threshold/policy belongs to Phase 3D.

---

## Settlement reconciliation

Where settlement batches exist:

```text
Provider transactions
       ↓
Settlement batch
       ↓
bank/merchant settlement evidence
       ↓
Reconciliation
```

Do not assume each payment settles individually.

---

## Fees

If provider fees are modeled:

they should be explicit normalized financial components/transactions or governed reconciliation differences.

Never silently reduce Payment amount to net settlement.

Example:

```text
Customer paid:   $10,000
Provider fee:       $300
Net settlement:   $9,700
```

The business Payment may still be $10,000.

---

## Refund reconciliation

A Refund is not complete for accounting purposes merely because the application created the Refund intent.

Reconcile provider evidence where required.

---

## Reversal handling

Processor reversal should:

* preserve original Transaction,
* create/link reversal evidence,
* update Payment/settlement projection under policy,
* invalidate/recompute relevant Invoice balance.

---

## Payment allocation impact

A reconciliation discrepancy may identify incorrect allocation.

Correct flow:

```text
Mismatch
   ↓
reverse incorrect allocation
   ↓
create correct allocation
   ↓
BalanceResolver recomputes
```

not manual balance edit.

---

## Balance recomputation

Canonical finance events should invalidate/recalculate:

* Invoice balance,
* Payment condition,
* Finance Dashboard aggregates,
* Client Portal projections.

---

## Eventual consistency

Some list/dashboard projections can update asynchronously.

But canonical transaction/reconciliation records must remain authoritative.

---

## Reconciliation after provider outage

Provider unavailability should result in:

```text
Reconciliation = UNAVAILABLE / PENDING
```

not `RECONCILED`.

---

## Provider reconnect ≠ reconciliation rewrite

When provider returns:

resume/re-run reconciliation and append/update current resolution appropriately while preserving previous unavailable evidence.

---

## Manual external evidence import

If the final platform permits importing bank/processor statements:

imported evidence must have:

* provenance,
* file/source reference,
* import batch,
* deduplication,
* tenant scope.

Do not treat uploaded CSV row as trusted canonical Payment automatically.

This audit does not create another Import screen; Design 148 later handles import/export administration.

---

## Reconciliation export

Exports must represent:

* canonical transaction IDs,
* Payment/Invoice context,
* reconciliation state,
* discrepancy,

with authorization and export auditing.

---

## Audit

Material actions should include:

```text
TransactionManuallyLinked
ReconciliationResolved
ReconciliationReopened
AdjustmentCreated
AdjustmentApproved
AdjustmentApplied
AllocationCorrected
```

where applicable.

Provider callbacks themselves remain provider evidence rather than human Audit actions.

---

## Activity

Human-readable finance Activity can summarize:

* transaction settled,
* mismatch detected,
* reconciliation resolved.

Activity does not replace structured financial evidence.

---

## Notifications

Design 080 may notify:

* reconciliation mismatch,
* settlement failure,
* large unresolved transaction,

if policies exist.

Notification read does not resolve reconciliation.

---

## Search

Design 079 may index safe:

* Payment reference,
* Transaction reference,
* Invoice number,
* reconciliation state,

where permitted.

Do not broadly index sensitive processor payloads/account identifiers.

---

## Reporting/Analytics

Finance metrics must distinguish:

```text
received
settled
reconciled
refunded
outstanding
```

according to centralized metric definitions.

Do not count `provider accepted` as recognized revenue/payment unless canonical finance policy says so.

---

## Caching

Transaction/Reconciliation caches must vary by:

```text
organizationMembershipId
authorizationRevision
transactionRevision
paymentRevision
allocationRevision
settlementRevision
reconciliationRevision
adjustmentRevision
```

and provider-account scope where applicable.

---

## Performance

Use:

* indexed provider/account transaction identifiers,
* paginated transaction queries,
* precomputed safe reconciliation summaries,
* lazy raw evidence,
* batched Payment/Invoice context.

Do not load every raw provider webhook into the initial workspace.

---

## Partial failure contract

Example:

```text
Transaction core        ✓
Payment context         ✓
Invoice context         ✓
Provider live API       ✕
Stored provider evidence✓
Settlement evidence     ✓
Reconciliation          ✓
```

Design 103 can still display stored canonical evidence and reconciliation.

Conversely:

```text
Transaction core        ✓
Payment service         ✕
Reconciliation service  ✕
```

should show:

> Transaction available
> Payment context unavailable
> Reconciliation unavailable

not:

> Transaction reconciled.

---

## Backend Requirement Matrix

| Requirement                                  | Status                                        |
| -------------------------------------------- | --------------------------------------------- |
| Canonical Payment reuse from 020             | **Critical**                                  |
| Payment/PaymentAllocation separation         | **Critical**                                  |
| Payment/PaymentAttempt separation            | **Critical**                                  |
| PaymentAttempt/Transaction separation        | **Critical**                                  |
| Transaction/ProviderEvent separation         | **Critical**                                  |
| Transaction/Settlement separation            | **Critical where settlement exists**          |
| Refund/Reversal separation                   | **Critical**                                  |
| Transaction/Reconciliation separation        | **Critical**                                  |
| Match/Reconciliation separation              | **Critical**                                  |
| Reconciliation/Adjustment separation         | **Critical**                                  |
| Invoice/Reconciliation separation            | **Critical**                                  |
| Balance/Reconciliation separation            | **Critical**                                  |
| Provider/account-scoped transaction IDs      | **Critical**                                  |
| Verified provider-event ingestion            | **Critical**                                  |
| Provider callback idempotency                | **Critical**                                  |
| Canonical transaction deduplication          | **Critical**                                  |
| Out-of-order event handling                  | **Critical**                                  |
| Invalid callback cannot mutate finance state | **Critical**                                  |
| Unmatched external evidence retained         | **Critical**                                  |
| Strong identifier matching preferred         | **Critical**                                  |
| Fuzzy match ≠ canonical identity             | **Critical**                                  |
| Automated match/human resolution separation  | **Critical**                                  |
| Match correction history                     | **Critical**                                  |
| Expected/observed state separation           | **Critical**                                  |
| Reconciliation policy/versioning             | **Critical**                                  |
| Reconciliation reproducibility               | **Critical**                                  |
| Reconciliation idempotency                   | **Critical**                                  |
| Reconciliation concurrency protection        | **Critical**                                  |
| Historical mismatch preservation             | **Critical**                                  |
| Provider Transaction mutation prohibited     | **Critical**                                  |
| Issued Invoice mutation prohibited           | **Critical**                                  |
| Direct Balance mutation prohibited           | **Critical**                                  |
| Controlled Adjustment entity                 | **Critical if adjustments exist**             |
| Adjustment/provider Transaction separation   | **Critical**                                  |
| Adjustment idempotency                       | **Critical**                                  |
| Adjustment reversal history                  | **Critical**                                  |
| Segregation-of-duties support                | **Required for governed finance corrections** |
| Settlement/Payment received separation       | **Critical**                                  |
| Settlement/Reconciliation separation         | **Critical**                                  |
| Gross Payment/net settlement separation      | **Critical where fees apply**                 |
| Refund reconciliation                        | **Critical**                                  |
| Reversal evidence preservation               | **Critical**                                  |
| Allocation correction via reversal/history   | **Critical**                                  |
| Balance recomputation after correction       | **Critical**                                  |
| Designs 101–102 shared finance truth         | **Critical**                                  |
| Design 071 Portal projection reuse           | **Critical**                                  |
| Design 007 Dashboard metric reuse            | **Critical**                                  |
| Permission-safe evidence access              | **Critical**                                  |
| Export permission/auditing                   | **Required if export exists**                 |
| Cursor pagination/indexing                   | **Required at scale**                         |
| Audit/outbox integration                     | **Critical**                                  |
| Partial dependency failure handling          | **Critical**                                  |

---

# 8. Consolidation

Design 103 exposes the most dangerous finance-state conflations in the billing/payment family.

**Payment / Transaction conflation**
Business receipt becomes processor movement.

**Payment / PaymentAttempt conflation**
Retry creates duplicate receipt.

**PaymentAttempt / Transaction conflation**
Execution request becomes financial movement.

**Transaction / ProviderEvent conflation**
Webhook becomes canonical money record directly.

**ProviderEvent / Payment conflation**
Callback creates duplicate business receipt.

**Provider callback retry / new Transaction conflation**
At-least-once delivery doubles financial movements.

**Provider transaction ID / global identity conflation**
Merchant-account collisions corrupt matching.

**Provider accepted / Transaction completed conflation**
Acknowledgement becomes financial finality.

**Transaction completed / settled conflation**
Processor state is treated as bank settlement.

**Settled / reconciled conflation**
External movement is treated as internally verified automatically.

**Payment received / settlement conflation**
Customer payment time and provider settlement time become one.

**Gross Payment / net settlement conflation**
Processor fees reduce customer payment incorrectly.

**Processor fee / Payment shortfall conflation**
Correct $10k Payment appears as $9.7k partial payment.

**Settlement batch / individual Payment conflation**
Batch payout cannot be reconciled correctly.

**Transaction / Invoice conflation**
Processor movement becomes receivable identity.

**Transaction / Allocation conflation**
External money movement automatically chooses invoice application.

**PaymentAllocation / Reconciliation conflation**
Internal application appears externally verified.

**Allocation reversal / Refund conflation**
Accounting correction returns actual money.

**Refund / Reversal conflation**
Intentional customer refund and processor reversal become indistinguishable.

**Refund / negative Payment conflation**
Historical payment lineage is lost.

**Refund completed / reconciled conflation**
Processor refund is assumed ledger-verified.

**Reversal / original Transaction deletion conflation**
Financial evidence disappears.

**Transaction / ReconciliationRecord conflation**
External fact and verification decision collapse.

**Matched / reconciled conflation**
Correct identity match hides amount/currency mismatch.

**Suggested match / confirmed match conflation**
Automated heuristic gains accounting authority.

**Match confidence / financial identity conflation**
Two $10k records get merged accidentally.

**Fuzzy match / exact provider identity conflation**
Heuristic overrides strong identifiers.

**Expected state / observed state conflation**
System changes one side to make numbers agree.

**Provider amount / expected amount conflation**
External discrepancy becomes internal mutation.

**Mismatch / Payment failure conflation**
Accounting difference becomes payment lifecycle failure.

**Mismatch / Invoice error conflation**
Issued billing terms are rewritten to fit provider records.

**Reconciliation / OutstandingBalance conflation**
Resolving mismatch directly sets balance.

**Reconciliation / Invoice status conflation**
Finance verification changes billing-document lifecycle.

**Reconciliation / Payment lifecycle conflation**
Accounting decision rewrites provider/business receipt history.

**Reconciliation resolved / historical mismatch deletion conflation**
Investigation trail disappears.

**Manual reconciliation / provider evidence rewrite conflation**
Finance user can alter external history.

**Adjustment / Provider Transaction conflation**
Internal correction masquerades as money movement.

**Adjustment / Invoice edit conflation**
Correction rewrites issued receivable.

**Adjustment / Refund conflation**
Accounting fix moves customer funds.

**Adjustment applied / reconciliation evidence deletion conflation**
Original discrepancy vanishes.

**Adjustment creator / approver conflation**
Material finance correction lacks segregation of duties.

**Balance zero / reconciled conflation**
Matching numbers hide missing evidence.

**Balance unavailable / zero conflation**
Outage appears paid.

**Reconciliation unavailable / no mismatch conflation**
System fails open.

**Provider unavailable / Transaction failed conflation**
Integration outage alters financial history.

**Match engine unavailable / unmatched conflation**
Technical failure becomes business result.

**Payment service unavailable / no Payment conflation**
Valid provider transaction is treated as orphan permanently.

**Unknown provider event / arbitrary matching conflation**
Same amount/email links to wrong Payment.

**Out-of-order provider event / state regression conflation**
Settled record returns to pending.

**Manual “reconciled” toggle / evidence-based reconciliation conflation**
User bypasses expected/observed comparison.

**Manual `balance = 0` / financial correction conflation**
Accounting lineage is destroyed.

**Invoice correction / reconciliation correction conflation**
Legal receivable terms change to hide bookkeeping issue.

**Portal payment state / reconciliation detail conflation**
Client sees internal discrepancy diagnostics.

**Finance Dashboard received/settled/reconciled conflation**
Executive metrics become misleading.

**Activity event / Transaction conflation**
Timeline string replaces monetary evidence.

**Audit event / ReconciliationRecord conflation**
Compliance log substitutes finance workflow.

**Provider raw payload / normal application log conflation**
Sensitive payment data leaks.

**Reconciliation export / ordinary read permission conflation**
Sensitive finance data exported by unauthorized users.

**Cross-tenant Transaction matching**
Payment in one organization reconciles against another organization's processor event.

**Cross-merchant provider ID collision**
Same provider ID attaches to wrong account.

**Generic finance mega-PATCH**
One endpoint edits Payment, Transaction, Invoice, balance and reconciliation.

**Cache by Transaction ID only**
Privileged provider/reconciliation evidence leaks.

**103/020 duplicate Payment model**
Finance transaction workspace creates another receipt identity.

**103/071 duplicate client finance state**
Portal and Team disagree.

**103/101 duplicate reconciliation summary**
Invoice Library owns separate accounting state.

**103/102 duplicate Transaction/balance backend**
Payment Detail and Reconciliation calculate different finance truth.

**103/007 duplicate finance metric definitions**
Dashboard reports provider success while reconciliation reports mismatch.

No additional screen is required.

These are **financial-movement identity, provider evidence, settlement, matching, reconciliation, adjustments, refunds/reversals, balance recomputation, segregation of duties, authorization, auditability and partial-failure requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL PAYMENT TRANSACTION, SETTLEMENT EVIDENCE & RECONCILIATION OPERATIONS ANCHOR**

**Domain directive:**
**Payment ≠ PaymentAllocation ≠ PaymentAttempt ≠ Transaction ≠ ProviderEvent ≠ Settlement ≠ Refund ≠ Reversal ≠ ReconciliationRecord/Case ≠ ReconciliationMatch ≠ Adjustment ≠ Invoice ≠ OutstandingBalance.**

**Payment directive:**
Design 020 remains authoritative for canonical Payment identity. Design 103 investigates financial movements and verifies them without creating processor-specific Payment records.

**Allocation directive:**
PaymentAllocation remains internal application of received funds to Invoice obligations. Allocation status never proves external settlement/reconciliation.

**Attempt directive:**
PaymentAttempt remains provider execution intent/history. Attempt timeout/decline/success must never be equated blindly with Transaction or Payment finality.

**Transaction directive:**
Transaction is the canonical normalized financial-movement/evidence record and remains independent from Payment, PaymentAttempt and raw ProviderEvent.

**Provider directive:**
provider-specific callbacks are verified, tenant/provider-account bound, append-oriented, deduplicated and normalized before affecting canonical Transaction projections.

**Idempotency directive:**
provider webhook retries and transaction ingestion must be replay-safe so one processor movement cannot create multiple canonical Transactions or Payments.

**Ordering directive:**
out-of-order provider events are resolved through financial state semantics and provider occurrence time rather than arrival-order last-write-wins.

**Identity directive:**
provider transaction identities are namespaced by provider/account context. External IDs are never assumed globally unique.

**Unmatched-evidence directive:**
valid external financial evidence that cannot yet be linked to a Payment is retained as unmatched evidence for investigation rather than discarded or guessed.

**Settlement directive:**
Payment/provider success and settlement remain separate. Settlement can occur later or in aggregated batches and cannot be inferred solely from payment authorization/capture state.

**Gross/net directive:**
customer Payment amount and provider net settlement remain distinct where fees/withholding exist. Processor fees must never silently reduce the business Payment amount.

**Refund directive:**
Refund remains an explicit return-of-funds entity and is not modeled as a negative Payment or ordinary Transaction reversal.

**Reversal directive:**
provider reversals preserve the original Transaction and create linked reversing evidence. Historical financial movement is never deleted.

**Reconciliation directive:**
`ReconciliationRecord` is the canonical verification process comparing internal expected financial state with trustworthy observed external evidence. It does not become a Transaction, Payment, Invoice or Balance field.

**Expected/observed directive:**
reconciliation always preserves the distinction between what the system expected and what the provider/bank/ledger actually reported. Neither side may be silently rewritten simply to achieve agreement.

**Matching directive:**
`ReconciliationMatch` links candidate internal/external records with explicit match basis and provenance. Strong provider/payment identifiers outrank fuzzy amount/date matching.

**Automated/human boundary directive:**
automated match suggestions/confidence are not accounting decisions. Human confirmation/resolution remains separately attributable where manual review is required.

**Match-history directive:**
incorrect matches are corrected through explicit unlink/relink lineage. Prior match history is never silently overwritten.

**Policy directive:**
material matching/reconciliation rules should be version-aware so historical reconciliations remain explainable after tolerances or provider semantics evolve.

**Mismatch directive:**
a reconciliation mismatch is a first-class investigation state. It does not imply Payment failed, Invoice incorrect, Refund required, or Balance should be edited.

**Resolution directive:**
resolving a mismatch invokes the proper canonical correction—allocation reversal/reallocation, missing Payment recording, Refund/Reversal recognition, permitted Adjustment, or evidence correction—rather than patching final numbers.

**Adjustment directive:**
where internal finance Adjustments are supported, they are explicit actor/reason/evidence records, independently authorized and never represented as fake provider Transactions or silent Invoice edits.

**Segregation directive:**
the architecture must support maker/checker separation for material manual corrections where finance policy requires it. Operational ownership or Invoice access never automatically grants adjustment approval.

**Immutability directive:**
provider Transaction history, issued Invoice terms and previously recorded Payment evidence cannot be altered to force reconciliation.

**Balance directive:**
reconciliation affects OutstandingBalance only indirectly by correcting canonical source records and then invoking the shared `InvoiceBalanceResolver`. Direct balance writes are prohibited.

**Zero/verified directive:**
zero OutstandingBalance and successful reconciliation remain separate facts. Numerical equality alone never proves accounting completeness.

**Concurrency directive:**
match, reconciliation-resolution and adjustment commands use expected revision/transactional locking so competing finance users cannot silently apply contradictory resolutions.

**Reconciliation-idempotency directive:**
resolution, matching, adjustment and correction commands are replay-safe. Double-click/network retries cannot apply the same financial correction twice.

**Provider-outage directive:**
when live provider evidence cannot be queried, reconciliation becomes pending/unavailable/stale according to policy. Provider outage can never be interpreted as `Reconciled`.

**Invoice directive:**
Designs 101–102 remain canonical for Invoice and balance presentation. Design 103 verifies underlying financial truth without introducing another Invoice/payment-condition engine.

**Portal directive:**
Design 071 consumes safe canonical payment/balance results only. Internal reconciliation mismatches, provider diagnostics and adjustment rationale remain strictly permission-filtered.

**Dashboard directive:**
Design 007 metrics must use the same centralized definitions for received, settled, reconciled, refunded and outstanding amounts. Provider “success” alone cannot silently become collected/reconciled revenue.

**Authorization directive:**
Transaction evidence, provider diagnostics, matching, reconciliation resolution, Adjustments, Refunds and exports remain independently server-authorized. Deal/Client ownership conveys no finance authority.

**Tenant directive:**
Payment, Transaction, provider account, Invoice, matching and reconciliation references are strictly tenant-scoped. Cross-tenant matching is prohibited even when amounts/references coincide.

**Evidence-security directive:**
sensitive processor/bank payloads, credentials, authentication headers and full payment identifiers must not leak through ordinary frontend DTOs, logs, Search, Activity or Audit.

**Export directive:**
if reconciliation/transaction export exists, it is separately authorized, field-filtered and audited.

**Partial-failure directive:**
Transaction, stored provider evidence, Payment context, Invoice context, live provider state, settlement state and reconciliation can become unavailable independently. `Unavailable` must never silently become `Matched`, `Reconciled`, `Failed`, or `No Payment`.

**Performance directive:**
use provider/account transaction indexes, paginated Transaction queries, rebuildable reconciliation summaries, batched Payment/Invoice context and lazy sensitive provider evidence rather than loading complete webhook histories by default.

**Caching directive:**
Transaction/Reconciliation caches vary by membership, authorization revision, Transaction, Payment, Allocation, Settlement, Reconciliation and Adjustment revisions, plus provider-account scope when relevant.

**Activity directive:**
human-readable finance Activity remains a projection over canonical Transactions/Reconciliation actions and never replaces financial evidence.

**Audit directive:**
manual matching, reconciliation resolution, reopening, allocation correction and financial Adjustment actions require strong actor/evidence-aware Audit records. Provider callbacks remain immutable integration evidence rather than human actions.

**Future-reuse directive:**
Design 104 and later commercial configuration screens must never be allowed to alter historical Invoice/Payment/Transaction evidence merely because current Product/Package definitions change.

**Overlap directive:**
Designs **007, 020, 054, 071, 101–103** must share one continuous **Invoice → Payment → Allocation → PaymentAttempt → Transaction → Provider/Settlement Evidence → Refund/Reversal → Reconciliation → Corrected Canonical Source Records → Recomputed Balance** lineage while keeping receivable, payment, processor, settlement and accounting-verification states independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE PAYMENT TRANSACTION & RECONCILIATION FOUNDATION — CANONICAL PAYMENT/PAYMENTALLOCATION IDENTITY + IDEMPOTENT PAYMENTATTEMPT EXECUTION + PROVIDER-NEUTRAL NORMALIZED TRANSACTIONS + VERIFIED/REPLAY-SAFE PROVIDEREVENT EVIDENCE + DISTINCT SETTLEMENT/REFUND/REVERSAL SEMANTICS + EXPLICIT EXPECTED-VS-OBSERVED RECONCILIATION RECORDS + CONTROLLED MATCHING + VERSION-AWARE RESOLUTION + GOVERNED ADJUSTMENTS + IMMUTABLE MISMATCH HISTORY + BALANCE RECOMPUTATION FROM CORRECTED SOURCE RECORDS — AND NEVER ALLOW PROVIDER CALLBACKS, MATCH CONFIDENCE, MANUAL “RECONCILED” FLAGS, ADJUSTMENTS, NET SETTLEMENT AMOUNTS OR ZERO BALANCE TO SUBSTITUTE FOR OR REWRITE CANONICAL FINANCIAL EVIDENCE.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **103 / 153** |
| **PASS**                                   |                        **103** |
| **STANDARDIZE decisions**                  |                        **101** |
| **Potential implementation-overlap flags** |                         **94** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**103 / 153 = 67.3% audited.**

### Canonical payment/reconciliation architecture after Design 103

```text
                      INVOICE
                         │
                         ↓
                       PAYMENT
                         │
              ┌──────────┴───────────┐
              ↓                      ↓
        PaymentAllocation       PaymentAttempt
                                      │
                                      ↓
                                  Transaction
                                      │
                    ┌─────────────────┼──────────────────┐
                    ↓                 ↓                  ↓
              ProviderEvent       Settlement       Refund/Reversal
                    │                 │                  │
                    └─────────────────┼──────────────────┘
                                      ↓
                             ReconciliationRecord
                                      │
                         ┌────────────┴────────────┐
                         ↓                         ↓
                   Expected state            Observed state
                         │                         │
                         └────────────┬────────────┘
                                      ↓
                            ReconciliationMatch
                                      │
                              ┌───────┴────────┐
                              ↓                ↓
                         RECONCILED         MISMATCH
                                               │
                                               ↓
                                      governed correction
                                               │
                                               ↓
                                   canonical source records
                                               │
                                               ↓
                                       BalanceResolver
```

The strongest accounting boundary is now:

```text
Customer Payment       = $10,000
Provider gross charge  = $10,000
Provider fee           =    $300
Net settlement         =  $9,700

Payment remains $10,000.

Net settlement does NOT mean
the customer only paid $9,700.
```

Likewise:

```text
Transaction matched
        ≠
Transaction reconciled

because:

Identity may match
while
amount / currency / settlement
still does not.
```

A reconciliation correction must follow:

```text
Mismatch detected
        ↓
Investigate
        ↓
Correct canonical source relation
or apply governed adjustment
        ↓
Preserve original mismatch/evidence
        ↓
Re-run reconciliation
        ↓
BalanceResolver recomputes
```

Never:

```text
Mismatch
   ↓
set balance = 0
   ↓
mark reconciled
```

And the finance hierarchy is now strict:

```text
Provider Accepted
      ≠
Payment Received
      ≠
Transaction Settled
      ≠
Reconciled
      ≠
Invoice Outstanding = 0
```

Each remains a separately provable canonical fact.

## Next Sequential Audit Target

### **Design 104 — Products & Packages Library**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
