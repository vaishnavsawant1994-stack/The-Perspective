# R7 signature reconciliation recovery

Status: reconstructed candidate. Not a qualified checkpoint. Not Contract/Signing completion.

## Lost local candidate

`3971bf1fedc72330d73f9f3cab331eae788e19e1` was reported as a local reconciliation candidate that had passed local static and unit checks. It was never pushed. It never received hosted PostgreSQL qualification. The Git object and `R7_signature_reconciliation.patch` are unavailable in the current environment and on GitHub.

That commit is not a qualified project checkpoint and must not appear in ancestry. Nothing in this recovery claims to be that SHA.

## Recovery base

Reconstruction starts from qualified remote authority:

`0ce505e6f83b390ffc6d20aa4803f23d4cbcaa7a`

`fix(r7): reject malformed signature adapter events safely`

The reconstructed implementation has its own commit SHA and must qualify independently. Hosted exact-head qualification, including the real PostgreSQL reconciliation attacks, is still required before this slice is evidence.

## What this slice is

Server-owned reconciliation of an adapter-verified signature event:

- canonical event hash and immutable `signature_events` evidence
- exact SignatureRequest, ContractVersion, tenant and document-digest correlation
- known-signer correlation and multi-signer completion
- exact replay versus same external id with changed evidence
- no regression of terminal `SIGNED`
- `SIGNED` only from `OUT_FOR_SIGNATURE` inside `platform.reconcile_r7_signature_event`
- `perspective_runtime` can execute that function and still cannot write the contract tables

Outbound `contract.send` is not implemented. Invoice mutation stays closed. This document does not accept R7.
