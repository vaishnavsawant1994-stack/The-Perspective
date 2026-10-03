# V1 known limitations

STATUS: **LIMITATIONS — NOT A CERTIFICATION**

- No production host, domain, TLS deployment, or production database.
- No alert vendor and no tested alert.
- No production backup. Qualification backup/restore is the only backup evidence.
- No payment provider. Checkout and integration verify stay `PROVIDER_UNAVAILABLE`.
- No email or notification delivery.
- No AI assistant and no operations object store.
- Dormant permission keys remain dormant.
- Draft pull requests #8 and #10 are not part of this release.
- `npm ci` can still report high findings in the development tree. The production gate is `npm audit --omit=dev --audit-level=high`.
- Dependabot findings on the default branch are outside that gate.
- Homepage overflow is not claimed as a redesign. A local Chromium production-server pass measured 110px horizontal overflow at 390×844 and 0px at 1280×900. The R14 workflow prints the candidate measurement. Accessibility evidence is keyboard, heading, and headers on Chromium only. This is not a WCAG audit and not a multi-browser certification.
- No RPO, RTO, or latency SLO exists in the product contract. Qualification ceilings are hang detectors.
- Independent external review has not been performed. V1.0 is not certified.
