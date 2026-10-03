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
if (hits.length > 0 && !reviewPresent) {
  process.stderr.write(`certification claim without an independent-review record: ${hits.join(", ")}\n`);
  process.exit(1);
}

process.stdout.write(`${JSON.stringify({
  r14_claim_scan: "pass",
  certification_claims: hits.length,
  independent_review_record: reviewPresent ? "present" : "absent",
  v1_certified: false,
})}\n`);
