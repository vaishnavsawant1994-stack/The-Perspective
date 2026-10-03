# R13 integrations trust boundary

STATUS: **G0**
DATE: 3 October 2026

## Registry

A declaration is a typed tenant row, not an executable plugin.

| Field | Rule |
|---|---|
| type | `EMAIL`, `STORAGE`, or `PAYMENT` |
| tenant | server organization only |
| state | `DECLARED` or `DISABLED` |
| verification | an attempt row, never a verified flag |
| secret | no column, no log, no response |

`UNCONFIGURED` is the read projection when no row exists. It is not stored.

## What is not claimed

No adapter is configured. Verify must not say connected, verified, delivered, uploaded, or paid. The only attempt result is `PROVIDER_UNAVAILABLE`.

There is no browser callback and no provider webhook in R13. A forged callback has no route.

One declaration per organization and type. Disable keeps the row. A later declare returns it to `DECLARED` and clears `disabled_at`.
