import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const affirmative = [
  /^STATUS:.*V1\.0 CERTIFIED/mu,
  /"v1_certified"\s*:\s*true/u,
  /^THE PERSPECTIVE V1\.0 COMPLETE\s*$/mu,
];
const roots = ["docs/release", "README.md"];
const hits = [];

function consider(path) {
  const text = readFileSync(path, "utf8");
  if (affirmative.some((pattern) => pattern.test(text))) hits.push(path);
}

function walk(path) {
  if (!existsSync(path)) return;
  if (statSync(path).isFile()) {
    consider(path);
    return;
  }
  for (const name of readdirSync(path)) {
    walk(join(path, name));
  }
}

for (const root of roots) walk(root);
const review = existsSync("docs/release/INDEPENDENT-REVIEW.md")
  ? readFileSync("docs/release/INDEPENDENT-REVIEW.md", "utf8")
  : "";
const reviewPresent = /^Reviewer:\s+\S+/mu.test(review) && /^Reviewed-SHA:\s+[0-9a-f]{40}/mu.test(review);

// GOV-REVIEW-02 (2026-11-17) replaces the compulsory independent-review
// dependency with an explicit owner waiver. Neither route constitutes
// certification on its own: a separate exact-SHA release acceptance is required.
const waiverPath = "docs/release/OWNER-REVIEW-WAIVER-2026-11-17.md";
const waiver = existsSync(waiverPath) ? readFileSync(waiverPath, "utf8") : "";
const ownerWaiverPresent =
  /^Owner: vaishnavsawant1994-stack\s*$/mu.test(waiver) &&
  /^Waived-Review: R14\/V1\.0 independent external human review, including PR #49\s*$/mu.test(waiver) &&
  /^Independent-Review-Performed: NO\s*$/mu.test(waiver);

const releasePath = "docs/release/V1-RELEASE-ACCEPTANCE.md";
const acceptance = existsSync(releasePath) ? readFileSync(releasePath, "utf8") : "";
const ownerReleaseAcceptancePresent =
  /^Owner-Release-Authorization: APPROVED\s*$/mu.test(acceptance) &&
  /^Release-SHA: [0-9a-f]{40}\s*$/mu.test(acceptance) &&
  /^Mandatory-Gate-Result: ALL-PASS\s*$/mu.test(acceptance);

if (hits.length > 0 && (!reviewPresent && !ownerWaiverPresent)) {
  process.stderr.write(`certification claim lacks independent review or owner waiver: ${hits.join(", ")}\n`);
  process.exit(1);
}
if (hits.length > 0 && !ownerReleaseAcceptancePresent) {
  process.stderr.write(`certification claim lacks owner-accepted exact-head gate evidence: ${hits.join(", ")}\n`);
  process.exit(1);
}

process.stdout.write(`${JSON.stringify({
  r14_claim_scan: "pass",
  certification_claims: hits.length,
  independent_review_record: reviewPresent ? "present" : "absent",
  owner_review_waiver_record: ownerWaiverPresent ? "present" : "absent",
  owner_release_acceptance_record: ownerReleaseAcceptancePresent ? "present" : "absent",
  v1_certified: false,
})}\n`);
