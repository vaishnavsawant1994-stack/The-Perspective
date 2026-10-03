# R12 G0 freeze

STATUS: **FROZEN — NOT ACCEPTED — IMPLEMENTATION NOT AUTHORIZED**
DATE: 3 October 2026
BASELINE: `c6b928d4b159cc66eb768ad10be4a4ef9b1aea7a`

This freeze is the R12 contract. It is not acceptance and it does not authorize code.

## Package

- `PHASE-4-R12-INVENTORY.md`
- `PHASE-4-R12-CAPABILITY-MATRIX.md`
- `PHASE-4-R12-DOMAIN-AND-WORKFLOW.md`
- `PHASE-4-R12-CLIENT-TRUST-BOUNDARY.md`
- `PHASE-4-R12-MEMBER-ENTITLEMENT-CONTRACT.md`
- `PHASE-4-R12-DATABASE-CONTRACT.md`
- `PHASE-4-R12-API-OPERATION-MATRIX.md`
- `PHASE-4-R12-SECURITY-AND-QUALIFICATION.md`

## Falsification answers

| Question | Answer in this freeze |
|---|---|
| Can a client see another client? | No. Account grant plus not-found. |
| Can two clients in one organization cross? | No. Account id, not only tenant id. |
| Can a member forge entitlement? | No. Worker token and server evaluation. |
| Can checkout change price? | No. Price is the offer row. Checkout cannot go active. |
| Can a webhook forge a subscription? | No webhook is exposed. No provider is configured. |
| Can approval apply to a later version? | No. Latest version and `expectedVersion`. |
| Can internal notes leak? | Allow-listed fields only. |
| Can a draft become visible? | No. Published or archived required. |
| Can a subscription override publication? | No. Entitlement does not publish. |
| Can R12 bypass commercial, finance, or publishing? | No. It reads them and writes approvals only through R8. |
| Can R12 implement R13? | No. The exclusion list is in the domain file. |

## Still refused

Implementation, migration, permission activation, and V1.0 certification. Those require a later acceptance and a separate authorization that names this freeze.
