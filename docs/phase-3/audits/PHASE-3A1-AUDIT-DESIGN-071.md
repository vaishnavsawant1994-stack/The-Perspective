# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 071 — Client Invoice / Payment Detail

Its frozen identity and supplied route annotation **`/client/billing/[invoiceId]`** are locked. Exact route connections remain a **Phase 3B** concern and are not being redesigned here.

Design 071 should become the **canonical Client Portal invoice-detail and payment-execution surface** for one authorized Invoice, its immutable issued artifact, current balance, payment attempts, successful Payments, refunds, and safe transaction history.

Its governing boundary is:

> **Invoice ≠ InvoiceVersion/Artifact ≠ InvoiceLine ≠ Payment ≠ PaymentAttempt ≠ Transaction ≠ ProviderEvent ≠ Refund ≠ Reconciliation ≠ OutstandingBalance ≠ ClientAction.**

The central implementation rule is:

> **Design 071 must distinguish what the Invoice originally billed from what remains payable now. Payment execution must be idempotent and provider-aware, and no uncertain payment outcome may be blindly retried until the provider/canonical Finance state has been reconciled.**

---

# 1. Classification

| Audit field                              | Classification                                                                                                                                                                                 |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                            | **071**                                                                                                                                                                                        |
| **Canonical name**                       | **Client Invoice / Payment Detail**                                                                                                                                                            |
| **Product area**                         | Client Portal / Billing / Payments                                                                                                                                                             |
| **User surface**                         | **Client Portal**                                                                                                                                                                              |
| **Screen class**                         | Invoice Entity Detail + Payment Execution Workspace                                                                                                                                            |
| **Classification**                       | **Portal Entity Detail Variant — Client Invoice, Balance & Payment Family**                                                                                                                    |
| **Primary purpose**                      | Let an authorized Client inspect one issued Invoice, its original billing snapshot and lines, current outstanding balance, payment status/history, and safely initiate payment where permitted |
| **Canonical Finance foundation**         | Design 020                                                                                                                                                                                     |
| **Client Billing collection foundation** | Design 054                                                                                                                                                                                     |
| **Primary canonical entity**             | **Invoice**                                                                                                                                                                                    |
| **Issued document entity**               | **InvoiceVersion / InvoiceArtifact**                                                                                                                                                           |
| **Line-item entity**                     | **InvoiceLine**                                                                                                                                                                                |
| **Canonical payment entity**             | **Payment**                                                                                                                                                                                    |
| **Execution-attempt entity**             | **PaymentAttempt**                                                                                                                                                                             |
| **Money-movement entity**                | **Transaction**                                                                                                                                                                                |
| **Provider integration event**           | **ProviderEvent**                                                                                                                                                                              |
| **Refund entity**                        | **Refund**                                                                                                                                                                                     |
| **Settlement/accounting entity**         | **Reconciliation**                                                                                                                                                                             |
| **Computed/current financial state**     | **OutstandingBalance**                                                                                                                                                                         |
| **Client Action dependency**             | Design 047                                                                                                                                                                                     |
| **Organization/profile dependency**      | Designs 059 / 060                                                                                                                                                                              |
| **Notification dependency**              | Designs 061 / 064                                                                                                                                                                              |
| **Activity dependency**                  | Design 063                                                                                                                                                                                     |
| **Asset/File dependency**                | Design 030                                                                                                                                                                                     |
| **Future internal overlap**              | Designs 101–103                                                                                                                                                                                |
| **Parent shell**                         | `ClientPortalShell` — Design 002                                                                                                                                                               |
| **Primary read model**                   | `ClientInvoicePaymentDetailView`                                                                                                                                                               |
| **Template family**                      | `ClientBillingDetailTemplate`                                                                                                                                                                  |
| **Auth**                                 | Required                                                                                                                                                                                       |
| **Authorization**                        | Active Portal membership + Invoice visibility + payment-initiation authority where applicable                                                                                                  |
| **Implementation priority**              | **Critical Financial / Transactional / Reconciliation Integrity**                                                                                                                              |
| **Reuse level**                          | **Extremely High with Designs 020 and 054**                                                                                                                                                    |

Design 071 should answer:

> **“What exactly was invoiced, what amount/currency was issued, what has already been paid or refunded, what remains outstanding now, whether payment is currently allowed, what happened with prior payment attempts, and what immutable invoice artifact represents the original billing record?”**

Canonical architecture:

```text
Invoice
   │
   ├── InvoiceLine(s)
   │
   ├── issued billing snapshot
   │
   └── InvoiceVersion / Artifact
   │
   ↓
Outstanding Balance Resolver
   │
   ├── successful Payment(s)
   ├── Refund(s)
   ├── adjustments where canonical
   └── reconciliation state
   │
   ↓
PaymentAttempt
   │
   ↓
Provider
   │
   ↓
ProviderEvent
   │
   ↓
Canonical Payment / Transaction
   │
   ↓
Reconciliation
   │
   ↓
Design 071
```

---

# 2. Reuse

## Design 020 remains the canonical Finance foundation

Design 020 already established:

> **Invoice ≠ Payment ≠ Transaction ≠ ProviderEvent ≠ Reconciliation.**

Design 071 must reuse that same Finance engine directly.

Do **not** create:

```text
ClientInvoice
PortalPayment
BillingPayment
PaidInvoiceRecord
```

as separate financial truth.

Correct:

```text
Design 020
Canonical Finance domain
      │
      ├── Design 054
      │   Client Invoice/Payment collection
      │
      └── Design 071
          Client Invoice/payment detail
```

---

## Design 054 remains the Client Billing collection

Design 054 answers:

> Which invoices and payment obligations can I access?

Design 071 answers:

> What is the exact state of this Invoice, what remains due, and can I safely pay it?

Collection and detail must share:

* Invoice ID,
* issued amount,
* currency,
* balance,
* due state,
* payment status.

No duplicate status calculations.

---

## Reuse Design 030 for Invoice artifacts

An issued Invoice PDF/document should use:

```text
InvoiceVersion
     ↓
InvoiceArtifact
     ↓
Asset / FileVersion
```

No billing-specific unversioned blob storage.

---

## Reuse Design 059 / 060 historical identity boundary

Current:

* personal profile,
* company profile,
* billing address,
* company name,

must not rewrite already issued Invoice evidence.

At issuance, the Invoice should preserve the relevant billing snapshot.

---

## Reuse Design 047 ClientAction

Potential actions:

* Pay Invoice,
* Complete remaining balance,
* Resolve failed payment,
* View payment status.

The action is derived from canonical Invoice/Payment state.

Do not maintain:

```text
invoice.requiresAction = true
```

as a separate Client-only business flag.

---

## Reuse Notifications and Activity separately

Finance events may produce:

```text
InvoiceIssued
PaymentInitiated
PaymentSucceeded
PaymentFailed
PaymentRefunded
InvoicePaid
```

which can feed:

* Design 064 Notifications,
* Design 063 Activity,
* Design 039 Audit.

None become financial source truth.

---

## Future Designs 101–103 must share the same backend

Later:

* **101 — Invoice Library / Invoice List**
* **102 — Invoice Detail / Payment Tracking**
* **103 — Payment Transactions / Reconciliation Workspace**

must consume the same:

```text
Invoice
Payment
PaymentAttempt
Transaction
Refund
Reconciliation
```

entities used here.

Client and internal Finance surfaces differ in depth and permissions, not financial identity.

---

# 3. Entities

## Invoice ≠ InvoiceVersion / Artifact

`Invoice` is the stable billing obligation/record.

`InvoiceVersion` or issued Invoice snapshot represents the exact issued billing document.

Conceptually:

```text
Invoice INV-101
├── issued InvoiceVersion v1
└── corrected/reissued version where policy allows
```

Once issued, historical financial values must not silently change.

---

## Issued Invoice snapshot ≠ current Client data

At issuance, preserve relevant fields such as:

```text
billing party name
billing address
tax identifiers
invoice number
currency
line descriptions
amounts
taxes
issue date
due date
```

as historical Invoice data.

Later edits to Design 060 Organization Settings must not rewrite them.

---

## Invoice ≠ current Organization profile

Permanent:

```text
Current Company Name
≠
Issued Invoice Recipient Name
```

Even if both happen to match today.

---

## Invoice total ≠ OutstandingBalance

This distinction is critical.

Example:

```text
Invoice total:       $1,500
Payments received:     $500
Outstanding balance: $1,000
```

The Invoice total remains $1,500.

Do not mutate Invoice total downward after payment.

---

## OutstandingBalance should be derived from canonical Finance events

Conceptually:

```text
issued payable amount
- settled applicable Payments
+ valid charge adjustments
+/- canonical credits
+ refund effects according to accounting model
= current OutstandingBalance
```

Exact formula belongs to Phase 3D.

It must never be stored as an independently editable frontend field.

---

## Zero outstanding ≠ no payment history

A fully paid Invoice still retains every Payment/Transaction.

---

## OutstandingBalance ≠ overdue amount necessarily

An Invoice can have:

```text
OutstandingBalance > 0
```

without being overdue if due date is in the future.

Likewise:

```text
OverdueAmount
```

is a time-policy-derived concept.

Keep separate.

---

## InvoiceLine ≠ Product

An InvoiceLine may reference a Product/Package but should preserve issued description, quantity, unit amount, tax treatment, etc.

Later Product changes must not rewrite historical Invoice lines.

---

## InvoiceLine should be immutable after issuance

Material correction should follow governed:

* credit note,
* adjustment,
* void/reissue,
* replacement version,

according to Finance policy.

Do not edit old issued line amounts silently.

---

## Currency belongs to the historical Invoice

An Invoice issued in USD remains USD.

Changing Design 060 organization default currency later does not convert the Invoice.

---

## Display conversion ≠ Invoice currency

If the product ever displays reference FX amounts, those are presentation/derived context.

The canonical payable currency remains the issued Invoice currency unless a governed payment policy explicitly supports another settlement currency.

No FX feature is added here.

---

## Payment ≠ PaymentAttempt

`PaymentAttempt` represents one effort to collect/pay.

`Payment` represents canonical recognized payment outcome/value.

Example:

```text
PaymentAttempt PA-1
→ provider timeout

PaymentAttempt PA-2
→ provider confirms settlement
→ Payment P-1
```

Do not create a new canonical Payment merely because a checkout session was opened.

---

## One Payment may have one or several operational attempts depending provider model

The conceptual distinction matters even if cardinality differs by provider.

Do not force:

```text
PaymentAttempt == Payment
```

as universal identity.

---

## PaymentAttempt ≠ Transaction

A PaymentAttempt is workflow/execution.

A Transaction represents actual money-movement/accounting/provider transaction evidence.

Example:

```text
PaymentAttempt
    ↓
Provider charge intent
    ↓
Transaction
    ↓
Canonical Payment
```

Exact order/model can vary.

The concepts remain separate.

---

## Transaction ≠ ProviderEvent

ProviderEvent is an incoming integration notification.

Transaction is normalized Finance/money-movement data.

Never use raw webhook payload as Transaction truth.

---

## ProviderEvent ≠ Payment

Provider may emit:

```text
payment_intent.created
payment_intent.processing
charge.succeeded
charge.refunded
```

These require normalization and idempotent handling.

Raw events must not directly become user-visible Finance state.

---

## Provider acceptance ≠ settled payment

Critical.

A provider can say:

> payment initiated/authorized/accepted

without final settlement.

Therefore:

```text
PROVIDER_ACCEPTED
≠
SETTLED
≠
RECONCILED
```

---

## Authorized ≠ captured

Where card/payment rails distinguish them:

```text
Authorized
≠
Captured
```

Do not mark Invoice paid on authorization alone.

---

## Captured ≠ reconciled

Money capture may precede settlement/accounting reconciliation.

---

## Settled ≠ reconciled

Depending on system design:

* settlement indicates provider/bank money state,
* reconciliation links the money movement correctly to the intended Invoice/accounting record.

Keep distinct.

---

## Payment success ≠ Invoice paid in full

Example:

```text
Invoice total: $1,500
Payment:         $500
```

Payment succeeded.

Invoice remains partially paid.

---

## Partial payment is first-class

Permanent:

```text
PARTIALLY_PAID
≠
PAID
```

Do not use a boolean:

```text
invoice.paid = true/false
```

as the only financial model.

---

## Multiple Payments may apply to one Invoice

Conceptually:

```text
Invoice INV-101
├── Payment P1 — $500
├── Payment P2 — $500
└── Payment P3 — $500
```

This is normal architecture.

---

## One Payment allocation ≠ one Invoice universally

Depending on future Finance requirements, a Payment may potentially be allocated across obligations.

Design 071 should not hard-code a data model that makes future reconciliation impossible.

For this screen, the Invoice-focused projection can show the portion allocated to this Invoice.

---

## PaymentAttempt state

Possible operational states:

```text
CREATED
AWAITING_USER
PROCESSING
SUCCEEDED
FAILED
CANCELLED
OUTCOME_UNKNOWN
EXPIRED
```

or equivalent.

Exact enum Phase 3D.

---

## Failed ≠ outcome unknown

This distinction is critical.

### Failed

The system/provider confirms no payment succeeded.

### Outcome unknown

Network/provider state is inconclusive.

A retry can be dangerous in the second case.

---

## Outcome unknown must be reconciled before retry

Example:

```text
Client submits $1,000 payment
↓
provider processes it
↓
network timeout before response
```

The system must **not** immediately say:

> Payment failed. Try again.

Instead:

```text
PAYMENT_CONFIRMATION_PENDING
```

or equivalent.

Backend verifies provider state first.

This prevents double charge.

---

## Cancelled ≠ failed

User cancellation and technical/provider failure are different operational outcomes.

---

## Payment declined ≠ system failure

A bank/provider decline should be represented distinctly from:

* provider outage,
* network timeout,
* application error.

---

## Payment ≠ Transaction receipt artifact

A receipt can be generated from canonical Payment/Transaction data.

It is an artifact, not the Payment itself.

---

## Refund ≠ deleting Payment

Permanent:

```text
Payment $1,000
+
Refund $200
```

means historical Payment still occurred.

Do not rewrite:

```text
Payment amount = $800
```

and erase the refund event.

---

## Full refund ≠ Payment never happened

Even a full refund preserves:

* original Payment,
* Refund,
* Transaction history.

---

## Refund ≠ Invoice cancellation automatically

A Refund may affect outstanding balance/business state depending reason.

It does not inherently void the Invoice.

---

## Refund may reopen balance depending business/accounting policy

Example:

Invoice $1,000, Payment $1,000, Refund $1,000.

Possible result could be:

```text
OutstandingBalance = $1,000
```

if the refund reverses settlement against the Invoice.

But exact behavior belongs to Finance policy.

The key invariant:

> **Refund effects must be resolved by canonical accounting/reconciliation logic, not frontend subtraction guesses.**

---

## Chargeback/dispute ≠ Refund

If future payment providers support disputes/chargebacks, keep them distinct.

No new dispute screen is introduced here.

---

## Reconciliation ≠ Payment

Payment says:

> money was recognized.

Reconciliation says:

> that money movement has been verified/matched/accounted correctly.

---

## Reconciliation state should not be visible as raw accounting detail by default

Client-safe Design 071 may show:

* Payment received,
* Processing,
* Refunded.

Internal Design 103 can expose deeper reconciliation state.

---

## Reconciliation failure ≠ Payment failed automatically

A valid payment can have a later reconciliation issue requiring internal resolution.

Do not tell the Client they need to repay without canonical verification.

---

## Invoice artifact must be immutable

The PDF/document shown for an issued Invoice must correspond to the historical issued snapshot.

Do not regenerate it from current:

* Organization name,
* address,
* Product pricing,
* tax defaults.

---

## Corrected Invoice ≠ overwriting original artifact

If a correction is legally/accountingly permitted:

preserve the original and explicit corrected/reissued lineage.

Do not replace the old PDF invisibly.

---

## ClientAction ≠ financial state

A ClientAction:

> Pay remaining $1,000

is derived from:

* Invoice balance,
* due/payment eligibility,
* current permission,
* active payment attempt state.

The action never becomes Finance truth.

---

## Notification ≠ Payment evidence

A Notification:

> Payment successful

must originate from canonical Payment state.

It does not prove settlement itself.

---

## Activity ≠ Payment evidence

Design 063:

> Payment received.

is a safe projection.

Canonical Payment/Transaction/Reconciliation remain authoritative.

---

# 4. Permissions

Authorization should evaluate:

```text
Portal membership
+
Client/account scope
+
Invoice visibility
+
billing permission
+
payment-initiation permission
+
current Invoice/payment eligibility
```

---

## Invoice read ≠ payment authority

Permanent:

```text
billing.read
≠
payments.initiate
```

A user may be allowed to inspect invoices without making payments.

---

## Same Client ≠ same billing access

Different Portal members may have different Finance visibility.

Example:

```text
CEO
→ Invoice visibility

Finance Manager
→ Invoice visibility + payment

Marketing user
→ no billing access
```

---

## Portal Admin ≠ Finance authority

Design 062 Portal administration does not automatically grant:

* Invoice visibility,
* payment initiation,
* refund authority.

---

## Payment authority ≠ refund authority

A Client user permitted to pay does not gain Refund capabilities.

Refund operations should generally remain internal Finance operations unless frozen product explicitly provides otherwise.

---

## Invoice read ≠ raw provider transaction access

Do not expose:

* provider account IDs,
* internal settlement identifiers,
* fraud scores,
* raw webhook payloads,
* internal reconciliation notes.

---

## Payment detail can expose safe transaction references

A Client-safe reference may be shown:

> Payment reference ABC123

without exposing internal provider secrets.

---

## Payment action must bind current Invoice

The browser cannot submit:

```text
amount = arbitrary
currency = arbitrary
invoiceId = other tenant
```

without server validation.

Backend derives the allowable payable amount/currency from canonical Invoice state and payment policy.

---

## Partial-payment permissions/policy

If partial payments are allowed, the server determines:

* minimum/maximum,
* allowed amount,
* currency,
* remaining balance.

Do not trust arbitrary frontend amount.

If frozen design does not support custom partial amounts, do not add them.

---

## Overpayment prevention

A stale page must not allow:

```text
pay $1,000
```

if another payment already reduced balance to $200.

Server revalidates current balance immediately before payment initiation.

---

## Concurrent payment protection

Two authorized Client users may open the same Invoice.

Backend must prevent accidental double payment through:

* current balance checks,
* active attempt awareness,
* idempotency,
* provider reconciliation.

---

## Direct Payment ID access

Knowing a Payment ID does not grant access.

Payment history must be scoped through authorized Client/Invoice context.

---

## Direct InvoiceArtifact/FileVersion access

Design 030 secure download authorization still applies.

---

## Refund visibility

If a Refund applies to an Invoice the user can see, a safe refund summary can be displayed according to Finance permission.

Internal refund reason/notes may remain hidden.

---

## Payment method privacy

If a saved/used payment method summary is shown:

only return masked safe information such as:

```text
Visa •••• 4242
```

Never expose full card/bank credentials.

---

## Strong customer authentication / provider auth

Where payment rails require additional authentication:

Design 071 must defer to the provider/payment policy.

A Portal session alone may not be enough to finalize a regulated payment.

---

## Payment return URL ≠ payment truth

A browser returning with:

```text
?payment=success
```

must not mark the Invoice paid.

Backend verifies provider/canonical state.

---

# 5. States

Design 071 must keep Invoice lifecycle, due condition, balance state, PaymentAttempt state, Payment state, Refund state, reconciliation state, and ClientAction separate.

### Invoice lifecycle

```text
Draft
Issued
Void
Cancelled
Corrected / Superseded where applicable
```

### Balance/payment condition

```text
Unpaid
Partially Paid
Paid in Full
Credit / Overpaid where supported
```

### Due condition

```text
Not Due
Due Today
Overdue
```

### PaymentAttempt state

```text
Ready
Awaiting User
Processing
Authentication Required
Confirmation Pending
Succeeded
Failed
Declined
Cancelled
Expired
Outcome Unknown
```

### Payment state

```text
Pending Recognition
Successful
Settled
Refunded Partially
Refunded Fully
```

### Reconciliation state

```text
Pending
Matched
Reconciled
Exception
```

mostly internal unless Client-safe projection requires limited messaging.

### Current-user action

```text
No Payment Required
Pay Now
Pay Remaining Balance
Payment Processing
Awaiting Confirmation
Payment Restricted
Action State Unavailable
```

These must not become one `invoice.status`.

---

## Issued ≠ unpaid

An Invoice can be issued and partially/fully paid.

---

## Outstanding ≠ overdue

Permanent.

---

## Partially paid ≠ unpaid

Permanent.

---

## Zero balance ≠ Invoice deleted

Permanent.

---

## Payment processing ≠ paid

Permanent.

---

## Provider accepted ≠ settled

Permanent.

---

## Settled ≠ reconciled

Permanent.

---

## Failed ≠ declined

Technical failure and issuer/bank decline remain distinct.

---

## Failed ≠ outcome unknown

Critical.

---

## Confirmation pending ≠ failed

Never offer immediate retry merely because the browser did not receive final response.

---

## Refund pending ≠ refunded

Refund can itself have asynchronous provider state.

---

## Partially refunded ≠ unpaid automatically

Finance resolver determines resulting balance.

---

## Reconciliation exception ≠ Client owes again automatically

Internal Finance must resolve the exception before exposing a new payment obligation.

---

## Artifact unavailable ≠ Invoice missing

Invoice metadata can remain visible while PDF generation/storage is temporarily unavailable.

---

## Balance unavailable ≠ zero

Critical:

```text
Balance resolver unavailable
≠
$0 outstanding
```

---

## Payment history unavailable ≠ no payments

Critical.

---

## Payment action unavailable ≠ Invoice paid

Critical.

---

## Updated elsewhere

While the page is open:

* another user pays,
* provider confirms delayed success,
* internal Finance records a payment,
* Refund occurs.

Design 071 must reconcile before presenting another payment CTA.

---

## State Coverage

Design 071 inherits Design 150 plus:

```text
Invoice Detail Loading
Invoice Detail Available
Invoice Restricted
Invoice Unavailable

Issued Invoice
Invoice Void / Cancelled
Invoice Corrected / Superseded

Balance Loading
Balance Available
Balance Unavailable

Unpaid
Partially Paid
Paid in Full

Not Due
Due Today
Overdue

Payment Ready
Payment Starting
Payment Authentication Required
Payment Processing
Payment Confirmation Pending
Payment Outcome Unknown

Payment Confirmed
Payment Failed
Payment Declined
Payment Cancelled
Payment Attempt Expired

Partial Refund
Full Refund
Refund Processing
Refund State Unavailable

Payment History Available
Payment History Unavailable

Invoice Artifact Available
Invoice Artifact Unavailable

Payment Action Restricted
Payment Action State Unavailable

Partial Billing Service Failure
```

---

# 6. Responsive Behavior

## Desktop

Desktop should preserve financial clarity:

```text
Invoice Detail
↓
Invoice Identity
├── invoice number
├── issued date
├── due date
├── currency
└── current due condition
↓
Amounts
├── original total
├── amount paid
├── refunds/credits where applicable
└── outstanding balance
↓
Invoice Lines
↓
Payment Action
↓
Payment History
↓
Invoice Artifact / Download
```

Only sections present in the frozen design should render.

---

## Original total and outstanding balance must be visually distinct

Do not put:

```text
$1,000
```

on screen without clarifying whether it is:

* Invoice total,
* paid amount,
* remaining balance.

Financial labels must be explicit.

---

## Currency must remain visible

Do not rely only on locale symbol where ambiguity exists.

For example:

> USD 1,500.00

where required by the frozen UI/financial presentation policy.

---

## Desktop should not expose internal reconciliation tooling

No:

* ledger mapping controls,
* webhook replay buttons,
* provider debugging,
* internal settlement exceptions,
* Finance notes.

Those belong to later internal Finance screens.

---

## Tablet

Following Design 152:

* Invoice summary cards stack,
* line items remain legible,
* amount labels remain attached to their values,
* payment CTA remains prominent,
* payment history can become stacked rows/cards.

---

## Mobile

Priority:

```text
Invoice
↓
Invoice Number / Date
↓
Outstanding Balance
↓
Due State
↓
Pay / Payment Processing Status
↓
Original Invoice Total
↓
Invoice Lines
↓
Payment History
↓
Download Invoice
```

The user should immediately understand:

1. what remains due;
2. whether payment can be made;
3. whether a previous payment is still processing.

---

## Mobile payment safety

Before starting payment, clearly communicate:

* Invoice reference,
* exact amount,
* currency,
* remaining balance,
* payment state.

Avoid an ambiguous CTA such as:

> Continue

when:

> Pay USD 1,000

is materially safer.

---

## Confirmation-pending state

On mobile especially, if payment outcome is uncertain:

do not show a second active **Pay** button.

Show:

> Confirming your payment. Do not retry yet.

or equivalent frozen-style messaging.

---

## Partial-payment clarity

If the Client has paid some amount:

```text
Invoice total       USD 1,500
Paid                  USD 500
Remaining           USD 1,000
```

must remain visually unambiguous.

---

## Accessibility

Amount groups should be semantically labeled.

Screen-reader output should distinguish:

> Invoice total, 1,500 US dollars. Amount paid, 500 US dollars. Remaining balance, 1,000 US dollars.

---

## Payment-state accessibility

Do not use only:

* green,
* red,
* spinner.

Use explicit labels:

* Payment processing
* Payment successful
* Payment failed
* Payment confirmation pending

---

# 7. Backend Requirements

## Read architecture

```text
Design 071
    ↓
ClientPortalSessionContext
    ↓
Invoice Authorization
    ↓
ClientInvoicePaymentDetailQueryService
    │
    ├── Invoice
    ├── issued InvoiceVersion / billing snapshot
    ├── InvoiceLines
    ├── InvoiceArtifact
    ├── canonical Payments
    ├── PaymentAttempts
    ├── safe Transactions
    ├── Refunds
    ├── Reconciliation summary
    ├── OutstandingBalance
    └── current ClientAction
    ↓
ClientInvoicePaymentDetailView
```

---

## Issued Invoice creation

When Invoice is issued:

```text
issueInvoice()
```

should freeze the historically relevant billing snapshot:

* Client/legal billing identity,
* address,
* Invoice number,
* lines,
* taxes,
* currency,
* total,
* issue date,
* due date.

Later profile/settings changes never rewrite this snapshot.

---

## InvoiceArtifact generation

Conceptually:

```text
issued InvoiceVersion
      ↓
document renderer
      ↓
InvoiceArtifact
      ↓
Asset / FileVersion
```

The artifact should correspond exactly to the issued Invoice snapshot.

---

## Artifact integrity

Store sufficient linkage such as:

```text
invoiceId
invoiceVersionId
fileVersionId
content checksum
generatedAt
```

so the platform can prove the PDF corresponds to the issued Invoice.

---

## Outstanding balance resolver

Central service:

```text
resolveOutstandingBalance(invoiceId)
```

should consume canonical:

* issued amount,
* applied Payments,
* Refunds,
* credits/adjustments,
* reconciliation/allocation state,

according to Finance policy.

No frontend arithmetic as authoritative truth.

---

## Decimal-safe money

Use:

* decimal-safe database numeric types,
* or integer minor units where appropriate,

with explicit currency.

Never IEEE floating-point arithmetic for financial state.

---

## Multi-currency integrity

Each monetary amount carries currency explicitly.

Do not sum:

```text
USD 500 + EUR 500
```

without a governed FX/accounting layer.

---

## Payment initiation architecture

Conceptually:

```text
Client clicks Pay
      ↓
authenticate actor
      ↓
authorize payment initiation
      ↓
reload current Invoice/balance
      ↓
check active/uncertain attempts
      ↓
determine allowed amount + currency
      ↓
create canonical PaymentAttempt
      ↓
idempotent provider request
      ↓
provider checkout/authentication
```

---

## Payment idempotency key

Payment initiation must have a stable idempotency strategy.

Conceptually tied to:

```text
invoice
actor
amount
currency
payment-intent generation/request token
```

Exact design Phase 3D.

Repeated button taps or network retries must not create duplicate charges.

---

## Active-attempt detection

Before starting a new attempt:

check whether a previous attempt is:

```text
PROCESSING
CONFIRMATION_PENDING
OUTCOME_UNKNOWN
```

If so, reconcile first.

---

## Outcome reconciliation

Conceptually:

```text
PaymentAttempt
    ↓
provider status lookup / verified webhook
    ↓
normalize ProviderEvent
    ↓
Transaction state
    ↓
canonical Payment state
```

---

## Provider adapter

Use:

```text
PaymentProviderAdapter
├── createPaymentIntent()
├── createCheckoutSession()
├── confirmStatus()
├── verifyWebhook()
├── capture() where applicable
├── refund() where applicable
└── fetchTransaction()
```

The Finance domain should not be hard-coded to one processor.

---

## Provider webhook verification

Require:

* provider signature verification,
* replay protection,
* known account,
* known transaction/payment-intent ID,
* amount/currency consistency,
* Invoice/PaymentAttempt mapping.

---

## Amount mismatch protection

If provider callback says:

```text
paid = USD 500
```

while expected canonical attempt was:

```text
USD 1,000
```

do not blindly mark the intended amount paid.

Record/flag canonical actual transaction and reconcile.

---

## Currency mismatch protection

Same principle.

A provider event in an unexpected currency must not silently settle the Invoice.

---

## Provider-event idempotency

The same webhook may be delivered multiple times.

Use stable provider event IDs/idempotency.

---

## Browser return is non-authoritative

After provider redirect:

```text
Client browser return
      ↓
Portal asks backend for canonical status
```

Never:

```text
browser says success
→ invoice PAID
```

---

## PaymentAttempt → Payment transition

A canonical `Payment` should be created/recognized only when provider/internal Finance evidence satisfies the Finance policy.

---

## Payment → Invoice allocation

A Payment becomes relevant to Design 071 through explicit allocation/application to this Invoice.

Do not assume every Payment from the same Client applies automatically.

---

## Partial payment handling

After a settled $500 payment against $1,500 Invoice:

```text
Payment P1 = $500
OutstandingBalance = $1,000
Invoice payment condition = PARTIALLY_PAID
```

No Invoice total mutation.

---

## Concurrent payment protection

Before final provider initiation and again during reconciliation:

reload relevant balance/attempt state.

This is necessary when multiple users/tabs operate simultaneously.

---

## Overpayment policy

If payment would exceed allowed balance:

backend rejects or follows governed overpayment/credit logic.

The Client UI must not define policy.

---

## Refund architecture

Conceptually:

```text
Payment
   ↓
RefundRequest / Refund
   ↓
provider refund
   ↓
ProviderEvent
   ↓
Refund Transaction
   ↓
Reconciliation
   ↓
OutstandingBalance recalculation
```

Exact model Phase 3D.

---

## Refund idempotency

Repeated refund requests/provider callbacks must not duplicate refunds.

---

## Historical Payment preservation

Refund changes neither the original Payment amount nor its historical transaction evidence.

---

## Reconciliation service

Internal Finance service should determine whether:

* provider money movement,
* Payment,
* Invoice allocation,
* Refund,

are correctly matched.

Design 071 receives only the safe Client projection.

---

## Reconciliation exception handling

If internal reconciliation has a discrepancy:

do not automatically ask the Client to pay again.

The system should distinguish:

```text
payment outcome unresolved internally
```

from:

```text
payment definitely failed
```

---

## ClientAction resolver

Conceptually:

```text
Invoice
+
OutstandingBalance
+
due/payment eligibility
+
active PaymentAttempt
+
current user permission
       ↓
ClientActionResolver
```

Possible results:

* Pay Invoice,
* Pay Remaining Balance,
* Wait for Confirmation,
* No Action,
* Restricted,
* Unavailable.

---

## Notification integration

Potential events:

```text
InvoiceIssued
InvoiceDueSoon
InvoiceOverdue
PaymentSucceeded
PaymentFailed
PaymentRefunded
InvoicePaidInFull
```

can feed Designs 061/064.

Mandatory transactional notices remain governed by notification policy.

---

## Activity integration

Safe events may feed Design 063:

> Invoice issued.

> Payment received.

> Invoice paid in full.

Activity does not replace Finance records.

---

## Audit integration

Material financial events should create audit records such as:

```text
InvoiceIssued
PaymentAttemptCreated
PaymentProviderEventAccepted
PaymentRecorded
RefundRecorded
InvoiceBalanceResolved
```

without storing sensitive card/bank data.

---

## PCI/payment-data minimization

The application should avoid storing raw sensitive payment credentials.

Use provider tokenization/hosted payment controls as appropriate.

Exact compliance implementation Phase 3D/production-hardening.

---

## Never log sensitive payment data

No:

* full PAN,
* CVV,
* private bank credentials,
* full provider secrets.

---

## Permission-safe caching

Cache dimensions should include:

```text
invoiceId
membershipId
balance revision
payment revision
permission revision
```

Do not reuse a Pay-enabled Finance Manager payload for a read-only Client member.

---

## Partial failure handling

Example:

```text
Invoice metadata   ✓
Invoice artifact   ✓
Balance resolver   ✓
Payment provider   ✕
Payment history    ✓
```

Design 071 can remain readable while showing:

> Payment service temporarily unavailable.

Do not alter the Invoice to Paid/Failed.

---

## Backend Requirement Matrix

| Requirement                                             | Status                    |
| ------------------------------------------------------- | ------------------------- |
| Client Portal authentication                            | **Critical**              |
| Active Portal membership                                | **Critical**              |
| Canonical Invoice reuse                                 | **Critical**              |
| Invoice/InvoiceVersion separation                       | **Critical**              |
| Immutable issued Invoice snapshot                       | **Critical**              |
| Current Organization/issued billing snapshot separation | **Critical**              |
| InvoiceLine historical immutability                     | **Critical**              |
| Historical currency immutability                        | **Critical**              |
| Decimal-safe money model                                | **Critical**              |
| Invoice total/outstanding balance separation            | **Critical**              |
| Central OutstandingBalance resolver                     | **Critical**              |
| Partial-payment support                                 | **Critical**              |
| Multiple Payments per Invoice                           | **Critical**              |
| Payment/PaymentAttempt separation                       | **Critical**              |
| PaymentAttempt/Transaction separation                   | **Critical**              |
| ProviderEvent/Transaction separation                    | **Critical**              |
| Provider acceptance/settlement separation               | **Critical**              |
| Settlement/Reconciliation separation                    | **Critical**              |
| Failed/Outcome-Unknown separation                       | **Critical**              |
| Outcome verification before retry                       | **Critical**              |
| Payment initiation idempotency                          | **Critical**              |
| Provider request idempotency                            | **Critical**              |
| Provider webhook verification                           | **Critical**              |
| Provider webhook replay protection                      | **Critical**              |
| Provider-event normalization                            | **Critical**              |
| Amount/currency mismatch validation                     | **Critical**              |
| Browser-return/provider-truth separation                | **Critical**              |
| Active PaymentAttempt detection                         | **Critical**              |
| Concurrent payment protection                           | **Critical**              |
| Overpayment protection                                  | **Critical**              |
| Refund entity/history                                   | **Critical**              |
| Refund/Payment separation                               | **Critical**              |
| Refund idempotency                                      | **Critical**              |
| Reconciliation service                                  | **Critical**              |
| Reconciliation exception safety                         | **Critical**              |
| Payment allocation to Invoice                           | **Critical**              |
| Invoice artifact via Asset/FileVersion                  | **Critical**              |
| Invoice artifact integrity/checksum                     | **Critical**              |
| Secure Invoice download                                 | **Critical**              |
| Design 047 ClientAction reuse                           | **Critical**              |
| Finance read/payment permission separation              | **Critical**              |
| Portal Admin/Finance authority separation               | **Critical**              |
| Payment-data minimization                               | **Critical**              |
| Notification integration                                | **Required**              |
| Activity integration                                    | **Required**              |
| Audit integration                                       | **Critical**              |
| Permission-safe caching                                 | **Critical**              |
| Partial provider failure handling                       | **Critical**              |
| Designs 101–103 future Finance reuse                    | **Critical architecture** |

---

# 8. Consolidation

Design 071 exposes several especially serious financial implementation risks.

**Invoice / InvoiceVersion conflation**
Historical issued billing document changes in place.

**Invoice / current Organization conflation**
Current company data rewrites old billing evidence.

**InvoiceLine / current Product conflation**
Product price/description changes rewrite issued line items.

**Invoice total / OutstandingBalance conflation**
Original billed amount is reduced when payments arrive.

**OutstandingBalance / overdue amount conflation**
Any unpaid amount is shown as overdue.

**Invoice currency / workspace currency conflation**
Changing company defaults converts historical invoices.

**Floating-point money calculations**
Financial totals develop rounding errors.

**Payment / PaymentAttempt conflation**
Opening checkout creates a Payment.

**PaymentAttempt / Transaction conflation**
Operational workflow and actual money movement merge.

**Transaction / ProviderEvent conflation**
Raw webhook becomes canonical financial record.

**Provider intent created / Payment succeeded conflation**
Checkout creation marks Invoice paid.

**Authorization / capture conflation**
Reserved funds are treated as collected.

**Capture / settlement conflation**
Provider processing is shown as settled money.

**Settlement / reconciliation conflation**
Finance/accounting matching is skipped.

**Payment success / Invoice paid-in-full conflation**
One partial payment closes the Invoice.

**Boolean paid model**
Architecture cannot support partial/multiple payments.

**One Payment / one Invoice assumption**
Future allocation/reconciliation model becomes too rigid.

**Failed / declined conflation**
Bank decline looks like technical outage.

**Failed / outcome-unknown conflation**
Uncertain result immediately activates Retry.

**Outcome-unknown / retry**
Client is charged twice after timeout.

**Browser redirect / Payment truth conflation**
`?success=true` marks Invoice paid.

**Provider webhook / trusted event conflation**
Unauthenticated or replayed callback changes Finance state.

**Provider status / canonical state conflation**
Vendor-specific strings leak into business logic.

**Webhook replay / duplicate Payment**
Repeated provider event records duplicate money.

**Amount mismatch ignored**
A $500 provider transaction marks a $1,000 attempt fully paid.

**Currency mismatch ignored**
Wrong-currency transaction settles Invoice.

**Payment / Refund conflation**
Refund edits the original Payment amount.

**Full refund / Payment never happened conflation**
Audit/history loses original transaction.

**Refund / Invoice void conflation**
Refund automatically cancels Invoice.

**Refund arithmetic in frontend**
Balance becomes inconsistent with accounting rules.

**Reconciliation exception / payment failure conflation**
Client is asked to pay again despite existing money movement.

**Payment history / Activity feed conflation**
Account Activity becomes Finance ledger.

**Notification / payment evidence conflation**
Notification success message becomes proof of settlement.

**ClientAction / Finance truth conflation**
Dismissing Pay action clears balance.

**Portal Admin / Finance authority conflation**
Access administrator can pay/refund invoices.

**Invoice read / payment authority conflation**
Any viewer can initiate payment.

**Payment authority / refund authority conflation**
Client payer can issue refunds.

**Stale page / stale balance**
Client pays original amount after another payment already posted.

**Concurrent users / duplicate payment**
Two Client users pay same Invoice simultaneously.

**No active-attempt detection**
A processing payment is followed by a second checkout.

**Overpayment not checked**
Frontend-supplied amount exceeds canonical balance.

**Payment method detail leakage**
Full card/bank data reaches Portal.

**Direct Payment ID bypass**
User guesses another transaction.

**Direct InvoiceArtifact bypass**
Invoice PDF becomes publicly accessible.

**Invoice artifact / current render conflation**
Historical PDF is regenerated from current company data.

**Corrected invoice / overwrite artifact conflation**
Original billing evidence disappears.

**Balance service unavailable / zero balance conflation**
Client sees falsely paid Invoice.

**Payment history unavailable / no payments conflation**
Existing payments disappear visually.

**Provider unavailable / Payment failed conflation**
Infrastructure outage becomes a financial failure state.

**071/020 duplicate Finance engine**
Portal creates its own payment/balance logic.

**071/054 duplicate billing state**
Collection/detail disagree on outstanding balance.

**071/101–103 duplicate internal Finance models**
Client and internal systems use incompatible Payment/Transaction/Reconciliation identities.

No additional screen is required.

These are **issued-invoice immutability, monetary arithmetic, payment execution, provider verification, partial-payment, refund, reconciliation, authorization, and transactional-integrity requirements**.

---

# 9. Implementation Verdict

## **PASS — CLIENT INVOICE BALANCE, PAYMENT EXECUTION & FINANCIAL TRANSACTION DETAIL ANCHOR**

**Domain directive:**
**Invoice ≠ InvoiceVersion/Artifact ≠ InvoiceLine ≠ Payment ≠ PaymentAttempt ≠ Transaction ≠ ProviderEvent ≠ Refund ≠ Reconciliation ≠ OutstandingBalance ≠ ClientAction.**

**Reuse directive:**
Design 020 remains the single canonical Finance engine, Design 054 remains the Client Invoice/Payment collection, and Design 071 is the Client-safe detail/payment-execution surface over those same Finance entities.

**Issuance directive:**
issuing an Invoice freezes the relevant billing identity, line items, taxes, dates, currency, totals, and document snapshot. Later Profile/Organization/Product changes never rewrite issued financial evidence.

**Artifact directive:**
the issued Invoice document is an immutable/versioned artifact backed by Design 030 Asset/FileVersion and remains linked to the exact issued Invoice snapshot.

**Currency directive:**
historical Invoice currency and monetary values remain immutable. Workspace/organization default currency changes never reinterpret previously issued amounts.

**Money directive:**
all monetary calculations use currency-aware decimal/minor-unit-safe arithmetic. Floating-point financial truth is prohibited.

**Balance directive:**
Invoice total and current OutstandingBalance remain separate. Balance is resolved from canonical Payments, allocations, Refunds/credits and Finance policy rather than manually overwritten.

**Partial-payment directive:**
partial/multiple Payments are first-class. A successful Payment does not imply the Invoice is paid in full unless the canonical OutstandingBalance resolves to zero under Finance policy.

**Attempt directive:**
PaymentAttempt represents one execution effort, while Payment represents canonical recognized payment. Opening checkout or creating a provider intent never creates a successful Payment by itself.

**Transaction directive:**
Transaction represents normalized money movement and remains distinct from both PaymentAttempt and raw ProviderEvent.

**Provider directive:**
payment providers remain behind a normalized adapter. Provider acceptance, authorization, capture, settlement and reconciliation remain separate states where applicable.

**Webhook directive:**
provider callbacks are authenticated, replay-safe and idempotent, with amount, currency, provider account and PaymentAttempt mapping verified before canonical Finance state changes.

**Browser-return directive:**
payment-provider redirect/query parameters are never financial evidence. The Client UI always reloads canonical backend/provider-verified state.

**Uncertain-outcome directive:**
a timeout or ambiguous provider response enters `confirmation pending/outcome unknown`; the system reconciles provider state before enabling another attempt. Blind retry is prohibited.

**Idempotency directive:**
payment initiation, provider request creation, webhook handling, Payment recognition, and Refund processing must all be idempotent so double clicks/retries cannot create duplicate money movement.

**Concurrency directive:**
before payment initiation, the backend rechecks current balance, existing processing/uncertain attempts, and Invoice eligibility to protect against stale tabs and simultaneous payers.

**Refund directive:**
Refund remains a new historical financial record tied to the original Payment. It never deletes or edits the original Payment evidence.

**Reconciliation directive:**
Reconciliation remains the canonical Finance/accounting matching layer. Internal reconciliation uncertainty must never be converted into a new Client payment demand without verification.

**Permission directive:**
Invoice read, Payment initiation, Refund operations, artifact download, and internal reconciliation access remain separate permissions. Portal administration never implies Finance authority.

**ClientAction directive:**
Design 047 only projects whether the current member should Pay, Pay Remaining Balance, or Wait for Confirmation; ClientAction never becomes balance or Payment truth.

**Notification directive:**
Designs 061/064 may deliver Invoice/payment transactional communications, including mandatory notices where policy requires, while notification read/dismissal never changes Finance state.

**Activity directive:**
Design 063 may project Invoice/payment milestones but never acts as ledger, settlement, or Payment evidence.

**Failure directive:**
Invoice availability, balance availability, payment-provider availability, Payment history availability, outcome confirmation, Refund state and reconciliation remain independently representable. Unknown state must never become `$0`, `Failed`, `No Payments`, or `Paid`.

**Responsive directive:**
desktop prioritizes issued Invoice facts, original amount, paid amount, remaining balance, line items and payment history; mobile prioritizes current outstanding balance → due condition → current payment state/action → original Invoice detail.

**Internal reuse directive:**
Designs 101–103 must use the same Invoice, PaymentAttempt, Payment, Transaction, Refund and Reconciliation entities, with Client surfaces receiving only safe projections.

**Overlap directive:**
Designs **020, 030, 039, 047, 054, 059–064, 071 and later 101–103** must ultimately consume one canonical Finance foundation rather than parallel Client/internal billing engines.

**Consolidation directive:**
**STANDARDIZE ONE FINANCE EXECUTION FOUNDATION — IMMUTABLE ISSUED INVOICE SNAPSHOT + INVOICELINES + CURRENCY-SAFE MONEY + DERIVED OUTSTANDING BALANCE + IDEMPOTENT PAYMENTATTEMPTS + PROVIDER-VERIFIED TRANSACTIONS + CANONICAL PAYMENTS + HISTORICAL REFUNDS + RECONCILIATION + IMMUTABLE INVOICE ARTIFACTS + CLIENT ACTION PROJECTION — AND NEVER ALLOW FRONTEND ARITHMETIC, CURRENT ORGANIZATION DATA, PROVIDER REDIRECTS, RAW WEBHOOKS, OR GENERIC INVOICE PATCHES TO BECOME FINANCIAL TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **71 / 153** |
| **PASS**                                   |                         **71** |
| **STANDARDIZE decisions**                  |                         **69** |
| **Potential implementation-overlap flags** |                         **62** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**71 / 153 = 46.4% audited.**

### Canonical billing architecture after Design 071

```text
                      INVOICE
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
     InvoiceLines   Issued Snapshot   Invoice Artifact
                         │
                         ↓
               OutstandingBalance
                         │
                    PaymentAttempt
                         │
                         ↓
                 Payment Provider
                         │
                         ↓
                  ProviderEvent
                         │
                         ↓
                    Transaction
                         │
                         ↓
                      Payment
                         │
             ┌───────────┴───────────┐
             ↓                       ↓
          Refund                Reconciliation
             │                       │
             └───────────┬───────────┘
                         ↓
               OutstandingBalance
                         ↓
                     Design 071
```

The critical amount boundary remains:

```text
Invoice Total
   = historical issued amount

Amount Paid
   = canonical applied Payments

Refunded / credited
   = separate historical Finance events

Outstanding Balance
   = current Finance-derived obligation
```

And the critical retry boundary remains:

```text
PAYMENT ATTEMPT TIMES OUT
          │
          ↓
   Outcome Unknown
          │
          ↓
 Provider Verification
    ┌─────┴──────┐
    ↓            ↓
Succeeded      Failed
    │            │
    ↓            ↓
record        retry may
Payment       become safe

Never retry while outcome is unknown.
```

# Next Sequential Audit Target

## **Design 072 — Client Publishing / Live Links Detail**

Its frozen identity and supplied route annotation **`/client/publishing`** are already locked.

The next audit must preserve the publishing-detail boundary:

> **Publication ≠ PublicationVersion/Artifact ≠ PublicationTarget ≠ Schedule ≠ PublicationAttempt ≠ ProviderAcceptance ≠ Placement ≠ Verification ≠ LiveLink ≠ Distribution ≠ ClientAction.**

It will need to reconcile the canonical Publishing foundation from **Design 031**, the Client publishing overview from **Design 055**, and the specialized media/Project context from **Designs 065–066**, while preserving:

* production-ready ≠ scheduled,
* scheduled ≠ published,
* provider accepted ≠ verified live,
* Publication ≠ Distribution,
* live link must belong to an exact verified placement/version,
* one Publication may target multiple destinations,
* stale/broken links must not remain “verified” forever,
* Client-visible publishing state remains a safe projection over canonical release truth.

After Design 072 we continue strictly:

**073 Client Distribution Detail → 074 Client Message Thread Detail → 075 Client Sign In → 076 Client Portal Activation / Accept Invite → 077 Client Access Recovery**

with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**
