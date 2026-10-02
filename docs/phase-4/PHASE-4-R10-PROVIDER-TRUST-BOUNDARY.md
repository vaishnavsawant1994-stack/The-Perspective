# R10 provider trust boundary

STATUS: **PART OF THE R10 G0 FREEZE — NOT AN IMPLEMENTATION**

R10 has one trusted verifier and no external provider.

## Trusted verifier

The SITE channel is not a third party. It is The Perspective's own public issue route. Launch may mark an item delivered only when all of the following are true inside one transaction:

- the campaign target was stored as channel `SITE` by the server, not by a browser `trusted` flag
- the item source is an issue owned by the same organization
- that issue is `ISSUE_PUBLISHED` or `ISSUE_ARCHIVED`
- a publication snapshot exists for that edition
- the URL written as evidence is exactly `/magazine/read/{slug}`
- the digest is computed by the server from the snapshot identity
- the actor is the membership that launched, not a browser string

## External channels

A target may be recorded as `EXTERNAL`. That record means "a destination was named." It does not mean a provider exists.

Launch of a campaign that contains any `EXTERNAL` target returns `PROVIDER_UNCONFIGURED` and writes no delivery evidence and no launched state.

The reconcile worker has no argument that can mark an item delivered. It must not call a provider and it must not invent success.

## What is not configured

No API key, webhook secret, signing provider, podcast host, video host, newsletter, or partner network is part of this release. A missing provider is a closed gate, not a stub that returns delivered.

Browser fields `url`, `delivered`, `verifier`, `trusted`, `digest`, `actor`, `organizationId`, `status`, and `state` are rejected.
