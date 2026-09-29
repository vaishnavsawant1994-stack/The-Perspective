# P4-R7 — Contract Signing Trust Boundary Addendum

STATUS: OWNER DECISION RECORDED — R7 ARCHITECTURE CLARIFICATION  
Decision date: 29 September 2026  
Base contract: owner-accepted R7 G0 SHA `f720f22f2500a89ae48819c715eb0e72f21e532e`  
Base implementation checkpoint: `e029d7bae5e935ac0e3ed4b382323e661e36b925`, qualification #90 SUCCESS  
R8–R14: EXCLUDED

This addendum clarifies the frozen R7 Contract/signature trust boundary. It does not select or configure a production signature vendor, activate contract permissions before implementation qualification, authorize Invoice mutation routes, or unlock R8.

## 1. Provider-neutral Contract domain

The canonical Contract domain is provider-neutral. Contract and immutable ContractVersion records do not encode a vendor-specific API or provider status vocabulary.

External signing is available only through an explicitly configured and trusted `SignatureProviderAdapter`. The adapter boundary must support provider identity, outbound signature-request submission, webhook authentication/signature verification, trusted secret/key handling, timestamp and replay validation, external event identity, request/envelope correlation, signer correlation, event-type mapping, and normalization into the canonical signature-event contract.

No configured trusted adapter means signature request and provider reconciliation fail closed. No provider is implicitly trusted. Production configuration must not register a deterministic test adapter.

The production provider is intentionally not selected by this addendum. That selection remains a separate deployment/business decision. Until a real provider adapter is selected, configured, and qualified, production signing is unavailable; this does not prevent provider-neutral domain implementation and testing.

## 2. Canonical SIGNED authority

The frozen lifecycle remains:

`DRAFT → READY_FOR_SIGNATURE → OUT_FOR_SIGNATURE → SIGNED | VOID | EXPIRED`.

A browser, TEAM member, ordinary application command, or caller-supplied status cannot set `SIGNED`. Only the server-owned signature reconciliation service may establish `SIGNED`, and only after a configured adapter has cryptographically/provider-authenticated the completion event and the service has durably recorded, correlated, deduplicated, validated, and reconciled it.

The verified event must bind to the exact tenant, Contract, immutable ContractVersion, signature request/envelope, and required signer set. A version becomes `SIGNED` only when every signer required by that version's frozen signing policy has completed. A single signer event cannot complete a multi-signer set.

Unknown providers, invalid signatures, unknown event types, invalid timestamps, uncorrelated or mismatched tenant/resource/version/request/signer data, and impossible lifecycle transitions fail closed. Provider-reported completion is evidence to verify, not canonical business state by itself.

## 3. Version immutability and evidence

Contract is the mutable aggregate. ContractVersion is an immutable snapshot of the exact contract content submitted for signing. Signature requests pin one exact version and its content digest. Once a version is submitted for signature, changing contract content requires a new ContractVersion; it cannot alter the requested or signed version.

Persist immutable normalized signature evidence sufficient to explain why a specific ContractVersion became `SIGNED`, including provider identity, external event identity, request/envelope correlation, signer identity/correlation, normalized event type, verified provider timestamp, server receipt/reconciliation timestamps, and content/version binding. Raw provider material is retained only as required by the existing security and data-retention architecture; it is never browser authority and must not expose provider secrets.

Idempotency and ordering are mandatory:

- An exact verified provider-event replay returns the existing reconciliation result and causes no second lifecycle transition or business effect.
- Reuse of the same provider/event identity with changed security-relevant evidence is a conflict and security/operational signal; it cannot overwrite the first evidence.
- Duplicate delivery, out-of-order events, and events received after terminal state cannot regress or duplicate canonical state.
- State transition, durable normalized evidence, idempotency record, and required audit evidence are transactionally consistent. Failure leaves no false successful transition or misleading success audit.

The deterministic test adapter may generate authenticated test events only inside isolated test configuration to exercise the same adapter/reconciliation boundary. It must not be available through production composition or provide a production fallback.

## 4. Permission mapping

G0 terminology maps to existing R7 registry vocabulary at the operation-contract level; these aliases do not add permission keys:

| Frozen G0 term | Existing R7 permission | Authorized meaning |
|---|---|---|
| `contract.manage` | `contract.edit` | Prepare Contract and create/edit eligible draft data or immutable ContractVersion through explicit commands. |
| `contract.sign.request` | `contract.send` | Request external signature for the exact eligible immutable ContractVersion. |
| `contract.view` | `contract.view` | Authorized tenant/resource-scoped Contract, version, and signature-status reads. |

`contract.manage` and `contract.sign.request` are not new registry entries. `contract.sign.reconcile` is not a human permission: reconciliation is server/provider-owned and is reachable only after provider verification. No browser route may invoke reconciliation or supply verified-event claims.

The registry's existing R7 `contract.edit`, `contract.send`, and `contract.view` entries remain dormant in the R7 authorization policy until their corresponding implementation and hostile qualification pass. Existing R12 `client.contract.sign` and `client.contract.view` capabilities remain dormant and are not used to establish R7 provider completion.

## 5. Invoice source dependency

Invoice creation may reference only the exact ContractVersion whose canonical server state is `SIGNED` through the qualified reconciliation path above. A submitted `contractVersionId` is only a requested identifier. The server must load and validate tenant ownership, Contract relationship, immutable version, current eligibility, signer completion, signature evidence, and the source financial snapshot. Neither table existence nor caller-provided state is authority.

## 6. Schema and qualification rule

When Contract persistence is introduced, replace the existing negative parity assertion that Contract is absent with positive structural assertions for the authorized Contract, ContractVersion, ContractSigner, signature-request/event, evidence, tenant constraints, and permitted database functions. Retain negative assertions for capabilities still outside R7 authorization, including Package until its separately frozen implementation is authorized.

The implementation sequence is:

1. Contract/ContractVersion persistence and immutable versioning.
2. Signature-request persistence and provider-neutral adapter contract.
3. Verified provider-event ingestion, replay protection, signer correlation, and server-owned reconciliation.
4. Canonical `SIGNED` transition and hostile real-PostgreSQL qualification.
5. Only after that qualification, Invoice source/InvoiceLine persistence and commands; Invoice mutation HTTP remains locked until the Invoice domain/database gate passes.

Required falsification includes cross-tenant ContractVersion IDs, version/Contract mismatch, unsigned or superseded/ineligible versions, forged browser SIGNED state, invalid/unconfigured provider, bad signature, unknown event/provider, signer-set incompleteness, stale/concurrent signing attempts, event replay with changed evidence, out-of-order events, immutable-version mutation, malformed identifiers, audit/evidence failure, transaction rollback, and no misleading durable residue.

This addendum freezes the trust boundary and permission aliases. It does not claim Contract signing or Invoice mutations are implemented or qualified, does not select a production provider, and does not accept or merge R7.
