# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 054 — Client Invoices & Payments

Design 054 should become the **canonical Client Portal billing workspace** for invoices, balances, payment obligations, payment history, and authorized payment actions associated with the authenticated Client.

It must reuse the Finance foundation established by **Design 020** rather than creating a separate Client billing system.

The non-negotiable domain boundary is:

> **Invoice ≠ InvoiceVersion/Artifact ≠ InvoiceLine ≠ Payment ≠ PaymentAttempt ≠ Transaction ≠ ProviderEvent ≠ Refund ≠ Reconciliation ≠ Outstanding Balance.**

| Audit field                      | Classification                                                                                                               |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                    | **054**                                                                                                                      |
| **Canonical name**               | **Client Invoices & Payments**                                                                                               |
| **Product area**                 | Client Portal / Finance / Billing / Payments                                                                                 |
| **User surface**                 | **Client Portal**                                                                                                            |
| **Screen class**                 | Client Billing Library + Payment Status Workspace                                                                            |
| **Classification**               | **Portal Workspace Variant — Client Billing & Payment Operations Family**                                                    |
| **Primary purpose**              | Let authorized Client users inspect invoices, balances, due dates and payment history, and perform permitted payment actions |
| **Primary canonical entity**     | **Invoice**                                                                                                                  |
| **Line item entity**             | **InvoiceLine**                                                                                                              |
| **Payment entity**               | **Payment**                                                                                                                  |
| **Execution entity**             | **PaymentAttempt**                                                                                                           |
| **Financial movement**           | **Transaction**                                                                                                              |
| **Provider evidence**            | **ProviderEvent**                                                                                                            |
| **Adjustment entity**            | **Refund / Credit where supported**                                                                                          |
| **Accounting process**           | **Reconciliation**                                                                                                           |
| **Canonical Finance foundation** | Design 020 — Invoice / Payment Workspace                                                                                     |
| **Contract dependency**          | Designs 019 / 053                                                                                                            |
| **Client Action dependency**     | Design 047                                                                                                                   |
| **Asset dependency**             | Designs 030 / 051                                                                                                            |
| **Future Client detail**         | Design 071 — Client Invoice / Payment Detail                                                                                 |
| **Future internal list/detail**  | Designs 101–103                                                                                                              |
| **Finance analytics dependency** | Designs 007 / 038 / 135                                                                                                      |
| **Parent shell**                 | `ClientPortalShell` — Design 002                                                                                             |
| **Primary read model**           | `ClientBillingView`                                                                                                          |
| **Template family**              | `ClientBillingWorkspaceTemplate`                                                                                             |
| **Auth**                         | Required                                                                                                                     |
| **Authorization**                | Portal membership + Client billing scope + invoice/payment capability                                                        |
| **Implementation priority**      | **Critical Commercial / Finance**                                                                                            |
| **Reuse level**                  | **Extremely High with Design 020**                                                                                           |

The core rule is:

> **An Invoice tells the Client what is owed. A Payment records money received or applied. Neither is the same thing as the provider operation used to collect that money.**

---

# 1. Classification

Design 054 should answer:

> **“Which invoices am I authorized to see, how much was originally invoiced, how much has actually been paid, what balance remains, what is overdue, which payments or refunds have occurred, and whether I personally have authority to make a payment?”**

Canonical architecture:

```text
Contract / Commercial Terms
            ↓
          Invoice
            │
            ├── InvoiceLines
            ├── Invoice Artifact
            └── Balance calculation
                    ↓
                 Payment
                    ↓
              PaymentAttempt
                    ↓
            Payment Provider
                    ↓
               ProviderEvent
                    ↓
               Transaction
                    ↓
             Reconciliation
```

Design 054 presents a **Client-safe financial projection** over these canonical records.

It should not own provider-specific payment truth.

---

# 2. Reuse — Design 020 remains canonical

Design 020 already established the Finance domain.

Design 054 must reuse:

* Invoice identity,
* Invoice lines,
* due dates,
* money/currency handling,
* Payment records,
* payment attempts,
* provider abstraction,
* reconciliation,
* partial-payment semantics,
* refund semantics,
* financial audit/history.

Correct:

```text
Canonical Finance Domain — Design 020
              │
       ┌──────┴──────┐
       ↓             ↓
Internal Finance   Client-safe Billing
Workspace          Workspace
Design 020         Design 054
```

There must be no separate:

```text
ClientInvoice
PortalPayment
ClientTransaction
```

financial truth system.

---

# 3. Entities — Invoice ≠ InvoiceVersion / Artifact

`Invoice` is the canonical financial obligation.

A generated PDF is merely one document representation of that obligation.

Correct:

```text
Invoice
   ↓
Invoice Artifact / FileVersion
```

The financial state cannot depend on whether the PDF rendered successfully.

---

# 4. Invoice artifact should use Design 030

Invoice PDFs/downloads should reuse:

```text
Invoice
   ↓
generated artifact
   ↓
Asset / FileVersion
```

Design 054 does not need invoice-specific file storage.

---

# 5. Invoice artifact ≠ financial source of truth

Do not parse the generated PDF later to determine:

* amount,
* due date,
* balance,
* currency,
* payment state.

Structured Invoice data remains authoritative.

---

# 6. InvoiceLine ≠ Invoice

One Invoice can contain multiple line items:

```text
Invoice
├── Magazine package
├── Premium distribution
└── Podcast production
```

Line amounts contribute to the Invoice total.

They are not separate Invoices unless business rules create them separately.

---

# 7. InvoiceLine should preserve commercial meaning

Useful conceptual fields may include:

```text
description
quantity
unit amount
tax
discount
line total
```

according to actual billing requirements.

Exact schema belongs to Phase 3D.

---

# 8. Contract ≠ Invoice

Design 053 may define the commercial agreement.

Design 054 operationalizes billing.

Correct:

```text
Executed Contract / Commercial Terms
               ↓
         Billing obligation
               ↓
             Invoice
```

But:

> **Contract amount ≠ Invoice amount automatically.**

There may be:

* installments,
* taxes,
* credits,
* separate add-ons,
* partial billing.

---

# 9. Proposal ≠ Invoice

Likewise, Proposal pricing may inform billing but is not Finance truth once the Contract/billing workflow advances.

---

# 10. Invoice total ≠ outstanding balance

Example:

```text
Invoice total:       $1,500
Paid:                $500
Outstanding balance: $1,000
```

Do not replace `invoice.total` with `$1,000`.

Original invoice amount must remain stable.

---

# 11. Outstanding Balance should be derived

Conceptually:

```text
Outstanding Balance
=
Invoice obligation
- successfully applied payments
- applicable credits
+ valid adjustments
```

Exact accounting formula belongs to Phase 3D.

Avoid storing an independently mutable:

```text
invoice.outstanding = ...
```

without reconciliation/derivation rules.

---

# 12. Outstanding ≠ overdue

Permanent distinction:

```text
Outstanding:
money still owed

Overdue:
money still owed after due threshold
```

An Invoice can have an outstanding balance while still being within its payment period.

---

# 13. Due ≠ overdue

An invoice due today should follow explicit date/time policy.

Do not mark it overdue merely because the browser's local clock passed midnight incorrectly.

---

# 14. Due date needs canonical date semantics

Reuse Designs 035/040 rules.

If due:

> September 30

as a business date, preserve date-only semantics where appropriate.

Do not accidentally shift it through UTC conversions.

---

# 15. Invoice lifecycle ≠ balance condition

Possible invoice lifecycle concepts such as:

```text
DRAFT
ISSUED
VOID
```

remain distinct from:

```text
UNPAID
PARTIALLY_PAID
PAID
OVERDUE
```

depending on final Finance model.

Do not create one giant mixed status enum.

---

# 16. Issued ≠ Sent/Delivered necessarily

An Invoice can be finalized/issued before delivery succeeds.

Document lifecycle and notification/delivery state should remain separate.

---

# 17. Sent ≠ Viewed

Delivery/read tracking, if supported, remains separate from financial payment state.

---

# 18. Viewed ≠ Paid

Opening an Invoice PDF does not alter the financial obligation.

---

# 19. Payment ≠ Invoice

A Payment is a separate financial record.

One Invoice may have:

```text
Payment A — $500
Payment B — $500
Payment C — $500
```

All applying to one $1,500 Invoice.

---

# 20. Multiple payments per invoice are mandatory

Do not implement:

```text
invoice.paymentId
```

as a one-to-one assumption.

Correct:

```text
Invoice
   ↓
Payment allocations / relationships
   ↓
Payment A
Payment B
Payment C
```

Exact model depends on whether Payments can span multiple Invoices.

---

# 21. Partial payment is first-class

Example:

```text
Invoice = $1,500
Payment = $500
```

must produce:

```text
Invoice financial condition:
PARTIALLY_PAID

Outstanding:
$1,000
```

not:

```text
PAID
```

or:

```text
UNPAID
```

---

# 22. Payment ≠ PaymentAttempt

A `Payment` represents a canonical financial payment/result or collection intent according to Finance design.

A `PaymentAttempt` records one execution attempt with a payment provider.

Example:

```text
Payment
├── Attempt 1 — declined
├── Attempt 2 — network unknown
└── Attempt 3 — succeeded
```

Do not create three business Payments for one intended payment if they are retries of the same payment operation.

---

# 23. PaymentAttempt ≠ Transaction

An attempt describes interaction with the provider.

A Transaction represents actual financial movement/settlement record according to the Finance model.

Correct separation:

```text
Payment
  ↓
PaymentAttempt
  ↓
provider processing
  ↓
Transaction
```

---

# 24. ProviderEvent ≠ PaymentAttempt

Providers may emit several events around one attempt:

```text
payment_created
requires_action
authorized
captured
failed
refunded
```

or provider-specific equivalents.

These events are evidence/input.

They are not themselves canonical Payments.

---

# 25. ProviderEvent ≠ Transaction

A webhook saying:

> payment succeeded

must be validated and reconciled before creating/finalizing canonical financial state.

Do not treat arbitrary provider payload as Finance truth.

---

# 26. Provider abstraction is mandatory

Design 020 already requires provider-neutral payment infrastructure.

Conceptually:

```text
Payment Provider Adapter
├── initiate
├── confirm
├── refund
├── retrieve status
└── webhook normalization
```

Finance domain remains independent from Stripe or any other specific provider.

---

# 27. Provider ID ≠ canonical Payment ID

Store provider references separately.

Do not use external provider IDs as the application's primary financial identity.

---

# 28. Payment initiation must be idempotent

This is critical.

Example:

```text
Client clicks Pay
network times out
Client clicks Pay again
```

The system must not accidentally charge twice.

Conceptually:

```text
initiatePayment(
  invoiceId,
  amount,
  currency,
  idempotencyKey
)
```

must resolve safely.

---

# 29. UI button disabling is not enough

Preventing double-click client-side is helpful but not sufficient.

Server/provider idempotency is mandatory.

---

# 30. Payment amount must be validated server-side

Never trust:

```text
amount = value sent by browser
```

alone.

Backend must validate:

* Invoice,
* allowed payment amount,
* outstanding balance,
* currency,
* partial-payment policy,
* current Invoice state.

---

# 31. Client must not alter currency

If Invoice is:

```text
USD 1,500
```

the Client cannot submit:

```text
INR 1,500
```

through request manipulation.

Currency comes from canonical billing rules.

---

# 32. Currency precision must be exact

Financial amounts must not use ordinary binary floating-point arithmetic.

Do not calculate:

```text
0.1 + 0.2
```

style money with JavaScript floats.

Use:

* integer minor units where appropriate, or
* decimal-safe database/application types.

---

# 33. Currency minor units vary

Architecture should not assume every currency has two decimals.

Money representation needs currency-aware precision semantics.

---

# 34. Multi-currency values must not be added blindly

Example:

```text
USD 500
+
EUR 500
```

cannot become:

```text
1,000 revenue
```

without an explicit conversion/reporting policy.

Design 038/007 Analytics must respect this later.

---

# 35. Payment succeeded ≠ settled necessarily

Depending on provider/payment method:

```text
authorized
captured
settled
```

may be distinct.

The Client-facing state should use appropriately normalized semantics without inventing certainty.

---

# 36. Authorized ≠ paid

If a payment is only authorized but not captured/settled according to the payment method:

do not mark Invoice fully paid prematurely.

---

# 37. Provider accepted ≠ locally reconciled

A provider can report success while internal reconciliation is still pending.

Correct:

```text
provider success
↓
transaction/payment confirmation
↓
reconciliation
↓
Invoice application/balance
```

---

# 38. Payment status ≠ Reconciliation status

Example:

```text
Payment:
SUCCEEDED

Reconciliation:
PENDING
```

can legitimately coexist.

Do not collapse them.

---

# 39. Reconciliation is a separate financial process

Reconciliation answers:

> Does internal financial state match provider/bank/accounting evidence?

It is not merely:

> payment.status === succeeded.

Design 103 later specializes reconciliation.

---

# 40. Design 103 relationship

Later:

**Design 103 — Payment Transactions / Reconciliation Workspace**

Expected architecture:

```text
Canonical Finance Domain
       │
       ├── Design 054
       │   Client-safe billing/payment view
       │
       └── Design 103
           Internal transaction/reconciliation operations
```

One Payment/Transaction foundation.

---

# 41. Reconciliation errors remain internal

Client Portal should not expose:

* settlement batch IDs,
* accounting mismatch diagnostics,
* internal ledger errors.

A safe Client state may be:

> Payment confirmation is processing.

---

# 42. Refund ≠ negative Payment

Refund should remain a separate financial concept linked to original Payment/Transaction.

Conceptually:

```text
Payment
   ↓
Refund
```

Do not create a fake payment with:

```text
amount = -500
```

as the only refund model.

---

# 43. Full Refund ≠ original Payment deleted

The original successful Payment remains historical evidence.

Refund adds another financial event.

---

# 44. Partial Refund

Architecture must not assume refunds are always full.

Example:

```text
Payment $1,500
Refund $200
```

Both remain visible in appropriate Finance history.

---

# 45. Refund status ≠ Invoice balance automatically without accounting rules

A refund may affect:

* amount paid,
* outstanding balance,
* credit balance,

depending on billing context.

Use canonical Finance logic.

Do not let Design 054 recalculate independently.

---

# 46. Refund ≠ credit note necessarily

If the Finance model includes Credit Notes later, those remain separate accounting documents.

This audit does not introduce additional finance pages or features.

---

# 47. Failed Payment ≠ unpaid Invoice created again

Payment failure should preserve the same Invoice.

Do not generate duplicate Invoices after failed attempts.

---

# 48. Retry ≠ new Invoice

Permanent:

```text
payment retry
≠
invoice regeneration
```

---

# 49. Invoice revisions/corrections

Once an Invoice is formally issued, changing:

* amount,
* line items,
* tax,
* Client legal identity,

should follow controlled billing correction/version/void/reissue semantics.

Do not casually mutate historical issued financial documents.

Exact mechanism belongs to Phase 3D.

---

# 50. Invoice Artifact exactness

If an issued Invoice PDF is:

```text
Invoice INV-101
version/artifact A
```

historical downloads should reproduce that issued representation.

Later corrections must not silently change old artifacts.

---

# 51. Invoice number should be stable

Invoice reference/number is business identity/display information.

Do not use database row sequence assumptions without explicit numbering policy.

---

# 52. Invoice number ≠ database ID

Keep external/client-facing invoice reference separate from internal primary key.

---

# 53. Invoice numbering should be server-controlled

Clients must not generate or choose invoice numbers.

---

# 54. Taxes

Where taxes exist, Invoice calculations must preserve:

* tax basis,
* rate,
* amount,
* jurisdiction/context as required.

Do not calculate tax exclusively in frontend.

---

# 55. Discount ≠ Payment

A discount changes the billing obligation.

A Payment satisfies the obligation.

Do not represent discount as money received.

---

# 56. Credit ≠ Payment

Similarly, a credit applied to an Invoice is not necessarily a Payment transaction.

Accounting semantics must remain explicit.

---

# 57. Outstanding Balance ≠ amount due today necessarily

For installment or scheduled billing scenarios:

```text
total outstanding
```

and:

```text
currently due
```

may differ.

The architecture should not force one amount field to represent both if the billing model requires distinction.

---

# 58. Design 054 is collection/status first

Its principal responsibilities are likely:

* Invoice list,
* amount,
* paid amount,
* outstanding amount,
* due date,
* financial state,
* payment action,
* recent payment history,
* open Invoice detail.

Design 071 later owns exact invoice/payment detail.

---

# 59. Design 071 relationship

Later frozen:

**Design 071 — Client Invoice / Payment Detail**

Expected architecture:

```text
Canonical Finance Domain
       │
       ├── Design 054
       │   Client billing collection
       │
       └── Design 071
           Client invoice/payment detail
```

One Invoice/Payment backend.

No screen merge decision now.

---

# 60. Design 101 relationship

Later:

**Design 101 — Invoice Library / Invoice List**

Internal Invoice library should use the same canonical Invoice model.

---

# 61. Design 102 relationship

**Design 102 — Invoice Detail / Payment Tracking**

Internal operational detail can expose:

* payment attempts,
* provider diagnostics,
* collection notes,
* internal history.

Design 071 is Client-safe detail.

---

# 62. Designs 020/054/101/102

Canonical relationship:

```text
ONE FINANCE DOMAIN
       │
       ├── 020 Finance Workspace
       ├── 054 Client Billing
       ├── 071 Client Invoice Detail
       ├── 101 Invoice Library
       └── 102 Invoice Detail
```

No duplicate Invoice models.

---

# 63. Design 103 specializes transaction/reconciliation

One shared Transaction/Reconciliation infrastructure.

Do not store reconciliation directly on Client Invoice DTOs as editable data.

---

# 64. Contract relationship

Design 053 can show executed Contract terms.

Design 054 can show resulting Invoice obligations.

But:

> **Contract read permission ≠ Invoice read permission.**

---

# 65. Billing contact

A Client organization may designate Finance users.

Portal member/account relationships from Design 062 should support scoped Finance visibility.

Do not expose billing to all Client Portal users automatically.

---

# 66. Same Client ≠ same Finance visibility

Example:

```text
CEO
→ billing overview

Finance Director
→ invoices + payment

Marketing Manager
→ no billing access
```

This is legitimate.

---

# 67. Invoice read ≠ payment authority

A Client user may inspect:

> Invoice INV-101 — $1,500 due.

without authorization to initiate payment.

```text
invoice.read
≠
payment.perform
```

---

# 68. Payment authority ≠ refund authority

Client users should not normally be able to trigger refunds merely because they can pay.

Refund management is a distinct capability, generally internal unless explicitly designed.

---

# 69. Portal Admin ≠ payment authority

Design 062 Client team-management authority must not automatically grant authority to initiate financial payment.

---

# 70. Client Action Resolver

Design 047 can surface:

> Invoice payment required.

Its source should be the canonical Invoice/payment-obligation state.

No parallel:

```text
ClientRequest(type=PAYMENT)
```

is necessary merely to represent Finance action.

---

# 71. Client Action eligibility

An Invoice can be outstanding, but the logged-in user may not be authorized to pay.

Therefore:

```text
Invoice requires payment
≠
this user has payment action
```

The resolver evaluates both financial state and permission.

---

# 72. Dashboard consistency

Design 041 may show:

* outstanding balance,
* unpaid invoices,
* payment action.

Those numbers must come from the same Finance definitions as Design 054.

---

# 73. Outstanding amount across invoices

Dashboard totals should derive from authorized Invoice balances.

Never use raw invoice totals without subtracting applied payments/credits.

---

# 74. Overdue total ≠ outstanding total

Example:

```text
Outstanding = $3,000
Overdue     = $1,000
```

Both can be true.

Do not label all outstanding money as overdue.

---

# 75. Design 007 Finance Dashboard consistency

Internal Finance Dashboard and Client billing must share:

* invoice definitions,
* payment definitions,
* outstanding calculation,
* currency handling.

But internal Finance has broader visibility and operational detail.

---

# 76. Analytics consistency

Designs 038/135 must not equate:

```text
Invoice issued amount
=
cash revenue received
```

Invoice, payment, recognized revenue and transaction metrics require explicit definitions.

Design 054 strengthens that foundation.

---

# 77. Client payment history

Client-visible history should show safe records such as:

```text
Payment date
Amount
Currency
Invoice
Status
Reference where appropriate
```

Do not expose:

* provider fraud scoring,
* processor debugging,
* internal reconciliation notes.

---

# 78. Payment method privacy

If displaying saved/used payment method details:

only safe masked representations should be returned.

Never store/expose raw card data in the application.

Exact PCI/payment-provider handling belongs to Phase 3D/security implementation.

---

# 79. Sensitive payment credentials remain provider-side

The application should rely on tokenized/provider-hosted flows where appropriate rather than processing raw payment credentials unnecessarily.

---

# 80. Payment provider metadata stays internal

Client does not need:

* provider secret IDs,
* webhook signatures,
* internal account IDs.

Expose only safe references.

---

# 81. Payment URL/session security

If provider checkout sessions are used:

they should be generated for:

* authenticated user,
* exact Invoice,
* validated amount,
* validated currency.

Do not create generic reusable payment links from arbitrary Client-supplied numbers unless intentionally designed.

---

# 82. Payment session expiry

A payment session may expire while the Invoice remains payable.

Correct:

```text
Checkout session expired
≠
Invoice expired
```

A new authorized PaymentAttempt/session can be created.

---

# 83. Payment cancellation ≠ Invoice cancellation

User cancelling checkout leaves the Invoice outstanding.

---

# 84. Provider timeout ≠ Payment failed certainly

If provider outcome is uncertain:

do not immediately mark:

> Payment failed

and encourage duplicate payment.

Use a verification/pending state and query provider truth.

---

# 85. Unknown payment outcome requires verification

Example:

```text
Client submits payment
connection drops
```

Backend must determine whether the provider actually processed the payment before retrying.

This is one of the most important double-charge protections.

---

# 86. Webhook verification

Provider events must be:

* authenticated,
* signature-verified,
* idempotent,
* correlated to known attempts/payments.

Never trust unverified webhook payloads to mark Invoice paid.

---

# 87. Duplicate provider events

Provider retries must not generate duplicate:

* Payments,
* Transactions,
* Invoice allocations,
* Notifications,
* Audit events.

---

# 88. Out-of-order provider events

Late events must not regress canonical state.

Example:

```text
settled
then delayed processing event
```

should not move payment back to Processing.

---

# 89. Reconciliation catches mismatches

Examples:

```text
Provider says $1,000 settled
Internal allocation says $500
```

or:

```text
Payment exists internally
Provider transaction missing
```

These are reconciliation issues.

They should not be solved by arbitrary Client Portal state changes.

---

# 90. Invoice allocation

A Payment may be applied to an Invoice.

If future Finance allows one Payment across multiple Invoices, use explicit allocation.

Do not encode the model in a way that makes that impossible unnecessarily.

Exact V1 capability belongs to Phase 3D.

---

# 91. Payment reference

Client-visible payment references should use stable safe identifiers.

Do not expose secret provider internals.

---

# 92. Receipts

If payment receipts are represented, they should reuse canonical Finance + Asset infrastructure.

A receipt document is not the Payment itself.

No new screen is introduced here.

---

# 93. Payment notification

Successful, failed, pending or refunded payment events can generate Notifications.

But:

```text
Notification read
≠
Payment confirmed
```

Finance remains source truth.

---

# 94. Activity

Design 063 may show:

> Payment of $500 received for INV-101.

This references canonical Payment/Transaction information.

Activity is not a ledger.

---

# 95. Audit

Material financial actions should strongly integrate with Design 039:

```text
InvoiceIssued
InvoiceVoided
PaymentInitiated
PaymentConfirmed
PaymentFailed
RefundInitiated
RefundConfirmed
```

with actor, amount, currency, entity references, correlation IDs and safe metadata.

---

# 96. Audit ≠ financial ledger

Audit records accountability.

Payment/Transaction/Reconciliation records remain financial truth.

Do not use Audit logs as the accounting ledger.

---

# 97. Access revocation

If Finance permission is removed:

the Client should immediately lose:

* Invoice visibility,
* payment history,
* payment action.

Canonical Finance records remain preserved.

---

# 98. Historical payments survive Portal-user removal

If a Finance user who paid an Invoice is later deactivated:

historical actor/payment attribution remains understandable.

---

# 99. Invoice deletion

Issued financial records should not be casually hard-deleted.

Use:

* void/cancel/correction semantics

according to Finance policy.

Exact legal/accounting behavior Phase 3D.

---

# 100. Void ≠ Paid

A void Invoice did not become paid.

Keep distinct outcomes.

---

# 101. Void ≠ deleted

Historical reference remains.

---

# 102. State Coverage

Design 054 inherits Design 150 plus Finance-specific states:

```text
Billing Loading
Billing Available

No Invoices
No Invoices Matching Filters

Invoice Issued
Invoice Outstanding
Invoice Partially Paid
Invoice Paid
Invoice Overdue
Invoice Void / Cancelled where applicable

Payment Required
Payment Not Authorized for Current User

Payment Initiating
Payment Awaiting Provider Action
Payment Processing
Payment Outcome Verifying
Payment Confirmed
Payment Failed
Payment Cancelled

Multiple Payments Applied

Refund Pending
Refund Completed
Partial Refund

Reconciliation Pending
Payment Confirmation Syncing

Invoice Artifact Available
Invoice Artifact Processing
Invoice Download Restricted

Provider Temporarily Unavailable
Billing Restricted
Access Revoked

Financial Data Partially Available
Partial Service Failure
```

These are not one mega Finance status enum.

---

# 103. No Invoices ≠ Finance unavailable

Successful empty query:

> No invoices are currently available.

Finance service failure:

> Billing information is temporarily unavailable.

These are separate states.

---

# 104. Outstanding ≠ payment required from this user

A balance may exist while this user's payment capability is absent.

Do not show an unauthorized Pay CTA.

---

# 105. Paid ≠ reconciled

Client may safely be shown Paid once canonical Finance confirmation permits it, while internal reconciliation remains a separate operational concern.

Do not expose raw reconciliation state unless specifically useful and safe.

---

# 106. Payment Failed ≠ Invoice overdue

A failed payment attempt does not immediately mean the Invoice is overdue.

Due-date logic remains independent.

---

# 107. Payment Processing ≠ unpaid certainty

While outcome is unresolved, do not encourage duplicate payment without provider verification.

---

# 108. Refund completed ≠ Invoice state guessed in UI

The backend recomputes Finance consequences.

Frontend does not decide new outstanding balance itself.

---

# 109. Permissions

Potential Phase 3D Client capabilities may conceptually include:

```text
portal.billing.read
portal.invoices.read
portal.invoices.download
portal.payments.read
portal.payments.initiate
```

Exact names later.

Internal capabilities remain separate:

```text
invoice.issue
invoice.void
payment.reconcile
refund.manage
```

---

# 110. Read ≠ download

A Client can potentially inspect billing data without downloading invoice artifacts.

---

# 111. Invoice read ≠ payment-history read necessarily

Financial history can be permissioned more finely if business requirements demand it.

No unnecessary permission complexity should be invented, but the architecture must not force the concepts together.

---

# 112. Payment initiation ≠ Invoice editing

A payer cannot modify:

* Invoice amount,
* currency,
* due date,
* line items.

---

# 113. Payment initiation ≠ refund

Client payment capability must not imply refund authority.

---

# 114. Finance permission ≠ Contract permission

Design 053 and 054 remain independent security scopes even when commercially related.

---

# 115. Responsive Behavior — Desktop

Desktop should preserve a clear billing overview:

```text
Invoices & Payments
↓
Billing Summary
├── Outstanding
├── Overdue
└── Paid / recent payment context
↓
Search / Filters
↓
Invoice List
    ├── Invoice reference
    ├── Project / Contract context
    ├── issued/due date
    ├── total
    ├── paid
    ├── outstanding
    ├── state
    └── View / Pay
↓
Payment History
```

Exact frozen composition remains unchanged.

---

# 116. Responsive — Tablet

Following Design 152:

* financial table can convert to stacked rows/cards,
* money values remain aligned/readable,
* due date and outstanding balance remain prominent,
* Pay/View actions remain touch-safe,
* history/details can open in focused pane.

---

# 117. Responsive — Mobile

Priority:

```text
Invoices & Payments
↓
Outstanding Summary
↓
Needs Payment
↓
Invoice Card
   ├── Invoice #
   ├── Project
   ├── Total
   ├── Paid
   ├── Outstanding
   ├── Due date
   └── View / Pay
↓
Other Invoices
↓
Payment History
```

Do not horizontally compress a dense Finance table.

---

# 118. Mobile payment safety

Before payment initiation, clearly identify:

* Invoice reference,
* amount being paid,
* currency,
* outstanding balance,
* Client/account,
* action being initiated.

High-impact payment actions should not rely on ambiguous icon-only controls.

---

# 119. Currency accessibility

Money should be presented with clear currency context.

Avoid using `$` alone where multiple dollar-denominated currencies could be ambiguous.

---

# 120. Accessibility

States require semantic text:

> Partially paid — $1,000 remaining
> Payment processing
> Overdue since September 5
> Paid in full

Do not communicate Finance state solely by green/red badges.

---

# 121. Backend Query Model

Conceptually:

```text
ClientBillingView
├── current Portal membership
├── authorized Invoices
├── Invoice lines/summary as permitted
├── original amount
├── paid amount
├── outstanding balance
├── due condition
├── payment history
├── refund effects where permitted
├── Invoice artifact availability
├── current-user payment capability
├── filters/pagination
└── partial/provider state
```

This is a Client-safe Finance projection.

---

# 122. ClientInvoiceSummary

A compact DTO can conceptually contain:

```text
ClientInvoiceSummary
├── invoiceId
├── invoiceReference
├── Project / Contract context
├── currency
├── original total
├── amount applied
├── outstanding balance
├── issued date
├── due date
├── invoice financial condition
├── current payment action
└── artifact availability
```

No processor secrets or reconciliation diagnostics.

---

# 123. Backend Mutation Architecture

Client writes should remain narrow.

Conceptually:

```text
initiateInvoicePayment()
confirmRequiredPaymentStep()   // provider-dependent
```

Internal Finance operations may include:

```text
issueInvoice()
voidInvoice()
recordOfflinePayment()
initiateRefund()
applyPayment()
reconcileTransaction()
```

according to final Finance scope.

---

# 124. Prohibited mega mutation

Do not expose:

```text
PATCH /client/invoices/:id
{
  paid: true,
  amountPaid: 1500,
  currency: "USD",
  paymentId: "...",
  status: "paid"
}
```

The Client never directly declares financial success.

---

# 125. Backend Architecture

```text
Design 054
    ↓
ClientPortalSessionContext
    ↓
Billing Authorization
    ↓
Invoice Query Service
    ↓
Invoice + InvoiceLines
    ↓
Payment Allocation / Balance Resolver
    ↓
ClientBillingView
```

Payment path:

```text
Client selects Pay
      ↓
initiateInvoicePayment()
      ↓
validate Invoice + outstanding + currency + actor
      ↓
Payment
      ↓
PaymentAttempt
      ↓
Provider Adapter
      ↓
Verified Provider Events
      ↓
Transaction / Payment confirmation
      ↓
Payment application
      ↓
Invoice balance recomputation
      ↓
Reconciliation
      ↓
Notifications / Activity / Audit
```

---

# 126. Backend Requirements

| Requirement                                | Status                               |
| ------------------------------------------ | ------------------------------------ |
| Client Portal authentication               | **Critical**                         |
| Active Portal membership                   | **Critical**                         |
| Client/account Finance isolation           | **Critical**                         |
| Invoice-level authorization                | **Critical**                         |
| Canonical Invoice reuse                    | **Critical**                         |
| InvoiceLine model                          | **Critical**                         |
| Exact issued Invoice artifact              | **Critical**                         |
| Design 030 FileVersion integration         | **Critical**                         |
| Payment entity                             | **Critical**                         |
| Multiple payments per Invoice              | **Critical**                         |
| Partial payment support                    | **Critical**                         |
| PaymentAttempt separation                  | **Critical**                         |
| Transaction separation                     | **Critical**                         |
| ProviderEvent separation                   | **Critical**                         |
| Refund model                               | **Critical where refunds supported** |
| Reconciliation model/process               | **Critical**                         |
| Outstanding-balance resolver               | **Critical**                         |
| Outstanding vs overdue separation          | **Critical**                         |
| Money decimal/minor-unit safety            | **Critical**                         |
| Currency-aware precision                   | **Critical**                         |
| Multi-currency isolation                   | **Critical**                         |
| Due-date/timezone correctness              | **Critical**                         |
| Provider abstraction                       | **Critical**                         |
| Server/provider idempotency                | **Critical**                         |
| Payment outcome verification               | **Critical**                         |
| Webhook authentication                     | **Critical**                         |
| Duplicate/out-of-order event handling      | **Critical**                         |
| Payment allocation                         | **Critical**                         |
| Authorization before payment initiation    | **Critical**                         |
| Contract/commercial linkage                | **Required**                         |
| Client Action Resolver integration         | **Critical**                         |
| Dashboard/Analytics definition consistency | **Critical**                         |
| Secure Invoice download                    | **Critical**                         |
| Safe payment-method projection             | **Critical**                         |
| Notification integration                   | **Required**                         |
| Activity integration                       | **Required**                         |
| Audit integration                          | **Critical**                         |
| Access revocation handling                 | **Critical**                         |
| Historical payment preservation            | **Critical**                         |
| Partial provider/Finance failure handling  | **Critical**                         |
| Design 020 backend reuse                   | **Critical**                         |
| Designs 071/101–103 reuse                  | **Critical architecture**            |

---

# 127. Consolidation — Main Implementation Risks

Design 054 exposes several high-risk Finance errors.

**Invoice/Payment conflation**
Invoice becomes “the payment record.”

**Invoice/InvoiceArtifact conflation**
PDF becomes Finance source of truth.

**Invoice total/outstanding conflation**
Original amount is overwritten after partial payment.

**Outstanding/overdue conflation**
Every unpaid balance is labelled overdue.

**InvoiceLine/Invoice conflation**
Line items become separate obligations accidentally.

**Contract/Invoice conflation**
Contract amount becomes invoice state.

**Payment/PaymentAttempt conflation**
Every retry creates a duplicate payment.

**PaymentAttempt/Transaction conflation**
Provider execution and actual money movement become one record.

**ProviderEvent/Payment conflation**
Webhook payload directly becomes canonical payment truth.

**Payment/reconciliation conflation**
Provider success automatically means books reconciled.

**Refund/negative-payment conflation**
Refund history is represented as fake negative payment.

**Partial payment failure**
System supports only Paid/Unpaid.

**Multiple payment failure**
Invoice allows only one payment ID.

**Authorized/paid conflation**
Card authorization marks Invoice paid prematurely.

**Provider accepted/reconciled conflation**
External status becomes final financial truth without reconciliation.

**Float-based money**
Currency values accumulate rounding errors.

**Currency-assumption bug**
All currencies assumed to use two decimal places.

**Multi-currency aggregation error**
USD/EUR values added directly.

**Client amount tampering**
Browser-provided amount/currency accepted without canonical validation.

**Duplicate-charge risk**
Network retry creates multiple provider charges.

**Provider timeout/failed conflation**
Uncertain result shown as failed and user pays twice.

**Unsigned webhook acceptance**
Forged provider event marks Invoice paid.

**Duplicate webhook processing**
One payment counted multiple times.

**Out-of-order event regression**
Late provider event moves Payment backward.

**Discount/Payment conflation**
Commercial adjustment appears as cash received.

**Credit/Payment conflation**
Applied credit treated as external payment.

**Payment session/Invoice lifecycle conflation**
Expired checkout marks Invoice expired.

**Payment cancellation/Invoice cancellation conflation**
Closing checkout voids Invoice.

**Invoice read/payment authority conflation**
Any billing viewer can charge/pay.

**Portal Admin/payment authority conflation**
Client user administrator gets Finance authority.

**Finance/Contract permission conflation**
Legal-document access opens billing automatically.

**Asset/Finance permission bypass**
Generic file library exposes Invoice artifacts.

**Paid/reconciled conflation**
Internal operational Finance state leaked or misunderstood.

**Invoice deletion/void conflation**
Historical issued financial record disappears.

**Audit/ledger conflation**
Audit logs become accounting truth.

**Dashboard metric drift**
Designs 007, 041, 054 and 038 calculate balances differently.

**054/071 duplicate Client Billing engines**
Collection/detail get different Invoice logic.

**054/101–103 duplicate Finance domains**
Internal Finance creates another Payment/Transaction model.

No new screen is required.

These are **financial identity, money precision, payment execution, provider safety, reconciliation, authorization and audit requirements**.

# Design 054 Audit Verdict

## **PASS — CLIENT BILLING, INVOICE BALANCE & PAYMENT OPERATIONS ANCHOR**

**Domain directive:** **Invoice ≠ InvoiceArtifact ≠ InvoiceLine ≠ Payment ≠ PaymentAttempt ≠ Transaction ≠ ProviderEvent ≠ Refund ≠ Reconciliation ≠ Outstanding Balance.**

**Reuse directive:** Design 020 remains the single canonical Invoice/Payment foundation. Designs 054, 071 and 101–103 must consume the same Finance domain through Client/internal projections.

**Invoice directive:** Invoice preserves the original financial obligation and line items; generated Invoice PDFs are versioned artifacts, not Finance truth.

**Balance directive:** outstanding balance is derived from canonical financial obligations, applied payments/credits/adjustments and never replaces the original Invoice total.

**Due directive:** outstanding and overdue remain separate. Due-state calculations use governed date/timezone semantics.

**Payment directive:** one Invoice can receive multiple Payments and partial payments; the model must never assume a one-to-one Invoice/Payment relationship.

**Execution directive:** Payment and PaymentAttempt remain separate so retries/provider operations do not create duplicate financial records.

**Transaction directive:** canonical financial movement and provider execution metadata remain distinguishable.

**Provider directive:** payment providers are adapters. Verified provider events feed canonical state but never become Finance truth by themselves.

**Idempotency directive:** payment initiation and provider handling are replay-safe at both application/provider boundaries to prevent duplicate charges.

**Uncertain-outcome directive:** provider/network uncertainty triggers verification before retry; it is never treated as definitive failure.

**Money directive:** all calculations use decimal/minor-unit-safe currency-aware arithmetic rather than binary floating point.

**Currency directive:** currency is canonical Invoice data and cannot be changed by Client request manipulation; cross-currency totals require explicit reporting/conversion policy.

**Refund directive:** Refunds preserve their own history and never erase the original Payment.

**Reconciliation directive:** Payment success and Reconciliation are distinct processes. Design 103 owns deeper internal reconciliation operations.

**Authorization directive:** Invoice read, download, payment history and payment initiation are separately authorizable; Client Portal administration never implies Finance authority.

**Action directive:** Design 047 surfaces payment obligations from canonical Invoice state and current-user eligibility rather than duplicating Finance obligations as generic Client tasks.

**Contract directive:** Contracts can drive billing terms, but Contract, Invoice and Payment remain independent canonical domains.

**Asset directive:** Invoice/receipt artifacts reuse Design 030's Asset/FileVersion infrastructure while Finance structured records remain authoritative.

**Analytics directive:** Designs 007, 038, 041, 054 and 135 must share governed Invoice/Payment/outstanding/revenue metric definitions rather than computing their own financial truth.

**Audit directive:** Invoice issuance, payment initiation/confirmation, refund and high-value financial actions feed Design 039 while Payment/Transaction/Reconciliation remain canonical Finance records.

**Reliability directive:** unpaid, partially paid, paid, outstanding, overdue, payment-processing, payment-unknown, refunded, provider-unavailable and Finance-unavailable remain distinct states.

**Responsive directive:** desktop emphasizes billing totals and invoice/payment scanning; mobile prioritizes invoice identity → amount → paid → outstanding → due date → authorized action with explicit currency context.

**Overlap directive:** Designs **007, 020, 038, 041, 047, 053–054, 071 and 101–103** must ultimately consume one Invoice + Payment + Attempt + Transaction + Refund + Balance + Reconciliation + provider abstraction foundation.

**Consolidation directive:** **STANDARDIZE ONE PLATFORM-WIDE FINANCE ENGINE — INVOICE + INVOICELINE + ISSUED ARTIFACT + PAYMENT + PAYMENTATTEMPT + TRANSACTION + PROVIDER EVENT + REFUND + PAYMENT ALLOCATION + OUTSTANDING-BALANCE RESOLVER + RECONCILIATION + CURRENCY-SAFE MONEY — WITH STRICT CLIENT/INTERNAL PROJECTIONS AND NO SECOND BILLING OR PAYMENT ENGINE IN THE CLIENT PORTAL.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **54 / 153** |
| **PASS**                                   |                         **54** |
| **STANDARDIZE decisions**                  |                         **52** |
| **Potential implementation-overlap flags** |                         **45** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**54 / 153 = 35.3% audited.**

### Canonical Finance architecture after Design 054

```text
             COMMERCIAL / CONTRACT
                      │
                      ↓
                   INVOICE
                      │
                InvoiceLines
                      │
                      ↓
              Billing Obligation
                      │
              ┌───────┴────────┐
              ↓                ↓
       Invoice Artifact    Balance Resolver
              │                │
        Asset/FileVersion      ↓
                           Payment(s)
                               │
                               ↓
                         PaymentAttempt(s)
                               │
                               ↓
                         Provider Adapter
                               │
                               ↓
                         Provider Events
                               │
                               ↓
                           Transaction
                               │
                               ↓
                         Reconciliation
```

And the audience model remains:

```text
                   ONE FINANCE DOMAIN
                           │
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
    Design 020         Design 054        Designs 101–103
 Internal Finance     Client Billing     Internal Invoice /
 Workspace                               Payment / Reconciliation

                           │
                           ↓
                     Design 071
                Client Invoice Detail
```

# Next Sequential Audit Target

## **Design 055 — Client Publishing & Distribution**

Its frozen identity is already locked.

The next audit must preserve the delivery boundary established by Designs 031–032:

> **Publication ≠ PublicationVersion/Artifact ≠ PublicationTarget ≠ PublicationAttempt ≠ DistributionCampaign ≠ DistributionItem ≠ ChannelExecution ≠ Placement ≠ Verification ≠ Performance Metric.**

It must also preserve:

* production-ready ≠ published,
* scheduled ≠ published,
* provider accepted ≠ verified live,
* publication ≠ distribution,
* exact approved artifact/version pinning,
* verified vs estimated performance provenance.

After Design 055 we continue strictly:

**056 Client Reports & Downloads → 057 Client Renewal / Continuation Workspace → … → 077 Client Access Recovery**

with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**
