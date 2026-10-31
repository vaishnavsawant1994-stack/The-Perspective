# Dependabot alert reconciliation - 31 October 2026

**Repository:** `vaishnavsawant1994-stack/The-Perspective`
**Default-branch snapshot:** `main@28d5cc69c7534e401b03d8aa2c18a8a65f41bc3a`
**Method:** Authenticated GitHub Dependabot alerts API, `state=open`, `per_page=100`. The response contained 18 records (fewer than one page), so no additional pages were available. Alert records are preserved as open; none were dismissed or suppressed.

## Summary

| Open alert records | Critical | High | Moderate | Low |
| ---: | ---: | ---: | ---: | ---: |
| 18 | 4 | 4 | 9 | 1 |

The 18 records represent 14 unique GHSA advisories; three Next.js advisories each appear against both `package.json` and `package-lock.json`. All are currently open in GitHub, but the exact current default-branch dependency tree resolves each listed package to a version at or above its patched version. GitHub's own dependency-graph SBOM, created at 2026-10-31T16:31:46Z for the default branch, independently lists these patched versions. The alert records and the current SBOM therefore disagree; do not dismiss alerts until GitHub reconciles that inconsistency.

## Alert-by-alert comparison

?Resolved version? is read from the `main` lockfile install (`npm ls`) rather than inferred from the alert. For each row, GitHub reports the listed vulnerable range and patched version; current source resolution is outside that range.

| Alert | Severity | Advisory | Package | Manifest | Scope | Vulnerable range | Patched version | Resolved version at main | Assessment |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 26 | Critical | GHSA-673q-mjm6-r5xr | next | package-lock.json | runtime | `>=16.0.0 <=16.4.0` | 16.4.1 | 16.4.3 | Resolved in main; alert remains open |
| 25 | Critical | GHSA-673q-mjm6-r5xr | next | package.json | runtime | `>=16.0.0 <=16.4.0` | 16.4.1 | 16.4.3 | Resolved in main; alert remains open |
| 24 | High | GHSA-p3m5-59mp-jv5r (CVE-2026-94482) | next | package-lock.json | runtime | `>=16.0.0 <=16.4.0` | 16.4.1 | 16.4.3 | Resolved in main; alert remains open |
| 23 | High | GHSA-p3m5-59mp-jv5r (CVE-2026-94482) | next | package.json | runtime | `>=16.0.0 <=16.4.0` | 16.4.1 | 16.4.3 | Resolved in main; alert remains open |
| 22 | Critical | GHSA-2464-fhr4-w9xw | next | package-lock.json | runtime | `>=16.0.0 <=16.4.0` | 16.4.1 | 16.4.3 | Resolved in main; alert remains open |
| 21 | Critical | GHSA-2464-fhr4-w9xw | next | package.json | runtime | `>=16.0.0 <=16.4.0` | 16.4.1 | 16.4.3 | Resolved in main; alert remains open |
| 20 | Moderate | GHSA-wjr9-j795-jxcr (CVE-2026-110180) | fast-uri | package-lock.json | development | `>=3.1.3 <3.1.9` | 3.1.9 | 3.1.9 | Resolved in main; alert remains open |
| 19 | Moderate | GHSA-qxg6-89mg-rqv8 (CVE-2026-112949) | @vitest/mocker | package-lock.json | development | `>=2.1.0-beta.7 <4.1.12` | 4.1.12 | 4.1.12 | Resolved in main; alert remains open |
| 18 | Moderate | GHSA-xp26-3454-mjgp (CVE-2026-112950) | @vitest/mocker | package-lock.json | development | `>=4.1.11 <4.1.12` | 4.1.12 | 4.1.12 | Resolved in main; alert remains open |
| 17 | Low | GHSA-9jrq-w75r-8gcw (CVE-2026-112945) | vite | package-lock.json | development | `>=8.2.0 <=8.2.3` | 8.2.4 | 8.3.5 | Resolved in main; alert remains open |
| 16 | Moderate | GHSA-rq7h-c2jc-7f22 (CVE-2026-112946) | vite | package-lock.json | development | `>=8.2.0 <=8.2.3` | 8.2.4 | 8.3.5 | Resolved in main; alert remains open |
| 15 | Moderate | GHSA-vfpm-58rq-9qcg (CVE-2026-112947) | vite | package-lock.json | development | `>=8.2.0 <=8.2.3` | 8.2.4 | 8.3.5 | Resolved in main; alert remains open |
| 14 | Moderate | GHSA-r825-w8mm-5pxw (CVE-2026-112944) | vite | package-lock.json | development | `>=8.2.0 <=8.2.3` | 8.2.4 | 8.3.5 | Resolved in main; alert remains open |
| 13 | High | GHSA-587h-7wmj-h5pm (CVE-2026-112942) | vite | package-lock.json | development | `>=8.2.0 <=8.2.3` | 8.2.4 | 8.3.5 | Resolved in main; alert remains open |
| 12 | Moderate | GHSA-698v-4r3x-3vcv (CVE-2026-112943) | vite | package-lock.json | development | `>=8.2.0 <=8.2.3` | 8.2.4 | 8.3.5 | Resolved in main; alert remains open |
| 9 | Moderate | GHSA-q2hr-2g5m-vwhr (CVE-2026-102277) | brace-expansion | package-lock.json | development | `<1.1.21` | 1.1.21 | 5.0.12 | Resolved in main; alert remains open |
| 8 | Moderate | GHSA-q2hr-2g5m-vwhr (CVE-2026-102277) | brace-expansion | package-lock.json | development | `>=4.0.0 <5.0.12` | 5.0.12 | 5.0.12 | Resolved in main; alert remains open |
| 1 | High | GHSA-2883-xcg3-v3hh (CVE-2026-84375) | js-yaml | package-lock.json | development | `>=4.0.0 <4.3.2` | 4.3.2 | 4.3.2 | Resolved in main; alert remains open |

## Audit evidence and graph synchronization

Against the rebased tree whose package manifests and lockfile match current `main`:

- `npm ci` completed and reported zero vulnerabilities.
- `npm audit --json` reported 0 info, 0 low, 0 moderate, 0 high, 0 critical (0 total).
- `npm audit --omit=dev --json` reported the same zero counts for the production dependency tree.
- `npm ls next fast-uri @vitest/mocker vite brace-expansion js-yaml --all` resolved to next 16.4.3, fast-uri 3.1.9, @vitest/mocker 4.1.12, vite 8.3.5, brace-expansion 5.0.12, and js-yaml 4.3.2.

Conclusion: no listed alert corresponds to a currently vulnerable package version in either the current lockfile or the GitHub-generated default-branch SBOM. GitHub still returns 18 open alert records even though its 16:31Z SBOM lists the patched versions. This is an alert-state synchronization inconsistency rather than an outdated SBOM. Keep the alerts open, do not dismiss them, and re-query the alerts after GitHub processes the current dependency graph. If the records persist, report the exact alert IDs and SBOM timestamp to GitHub Support or use an authorized dependency-submission refresh; do not use alert dismissal as remediation.

**Remaining GitHub open counts at this snapshot:** 4 critical, 4 high, 9 moderate, 1 low (18 records). **Remaining npm audit findings in this lockfile:** 0 production, 0 full tree.
