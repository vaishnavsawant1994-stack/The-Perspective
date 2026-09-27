import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const BASELINE = "2372418d80fa07f633a0e4adc99a21b1f7d8300a";

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

const requiredDocs = [
  "docs/phase-4/PHASE-4-R6-PLANNING-AUTHORIZATION.md",
  "docs/phase-4/PHASE-4-R6-PREDESIGN-AUDIT.md",
  "docs/phase-4/PHASE-4-R6-GATE-A-DECISIONS.md",
  "docs/phase-4/PHASE-4-R6-GATE-A-READINESS.md",
  "docs/phase-4/PHASE-4-R6-THREAT-MODEL.md",
  "docs/phase-4/PHASE-4-R6-AUTHORITY-ACTION-MATRIX.md",
  "docs/phase-4/PHASE-4-R6-RESOURCE-FIELD-POLICY.md",
  "docs/phase-4/PHASE-4-R6-DATABASE-TENANCY-MATRIX.md",
  "docs/phase-4/PHASE-4-R6-LIFECYCLE-GUARD-MATRIX.md",
  "docs/phase-4/PHASE-4-R6-THREAT-QUALIFICATION-MATRIX.md",
  "docs/phase-4/PHASE-4-R6-R7-EXCLUSION-MANIFEST.md",
  "docs/phase-4/PHASE-4-R6-G0-ADVERSARIAL-AUDIT.md",
  "docs/phase-4/PHASE-4-R6-IMPLEMENTATION-CONTRACT.md",
];

const docs = new Map(requiredDocs.map((path) => [path, read(path)]));
const authText = docs.get(requiredDocs[0]);
const auditText = docs.get(requiredDocs[1]);
const gateText = docs.get(requiredDocs[2]);
const readinessText = docs.get(requiredDocs[3]);
const threatText = docs.get(requiredDocs[4]);
const actionText = docs.get(requiredDocs[5]);
const resourceText = docs.get(requiredDocs[6]);
const tenancyText = docs.get(requiredDocs[7]);
const lifecycleText = docs.get(requiredDocs[8]);
const threatQualificationText = docs.get(requiredDocs[9]);
const exclusionText = docs.get(requiredDocs[10]);
const adversarialText = docs.get(requiredDocs[11]);
const contractText = docs.get(requiredDocs[12]);

// Planning authority and hard locks.
assert(authText.includes(BASELINE), "R6 planning authorization does not pin the exact authorized baseline");
assert(authText.includes("R6 production implementation:** NOT AUTHORIZED"), "R6 production implementation is not locked");
for (const marker of [
  "R7+:** NOT AUTHORIZED",
  "Design 154:** NOT AUTHORIZED",
  "V1.0 production certification:** NOT AUTHORIZED",
]) {
  assert(authText.includes(marker), `Planning authorization missing lock marker: ${marker}`);
}

// Gate A must be explicitly owner-approved, but G0/implementation remain separate.
assert(gateText.includes("GATE-A OWNER-APPROVED"), "Gate A is not recorded as owner-approved");
assert(gateText.includes("The owner explicitly approved D01–D15"), "Gate-A owner approval scope is missing");
assert(gateText.includes("### D01 approved resolution"), "D01 approved Resolution A is missing");
assert(gateText.includes("### D15 approved resolution"), "D15 approved Resolution A is missing");
assert(gateText.includes("## Post-Gate security prerequisite — R6 action-family enforcement"), "Post-Gate R6 action-binding prerequisite is missing");
assert(gateText.includes("REQUIRED G0 SECURITY CONTROL — NOT A GATE-A SCOPE DECISION"), "Action binding must remain a technical G0 control, not inferred owner scope approval");
assert(!gateText.includes("OPEN — BLOCKS P4-R6-G0 FREEZE"), "Gate A still contains an open blocking decision");
assert(readinessText.includes("GATE-A OWNER-APPROVED"), "Gate-A readiness does not reflect owner approval");
assert(readinessText.includes("P4-R6-G0"), "Gate-A readiness does not track the G0 gate");
assert(readinessText.includes("R6 production implementation:** NOT AUTHORIZED"), "Readiness document unlocks R6 implementation");

// Threat model and one-to-one qualification map must both contain exactly A01-A120.
const expectedThreatIds = Array.from(
  { length: 120 },
  (_, index) => `A${String(index + 1).padStart(2, "0")}`,
);
function threatIds(text) {
  return [...new Set([...text.matchAll(/^\| (A\d{2,3}) \|/gm)].map((match) => match[1]))];
}
const modelThreatIds = threatIds(threatText);
const mappedThreatIds = threatIds(threatQualificationText);
assert(modelThreatIds.length === 120, `Expected 120 threat cases, found ${modelThreatIds.length}`);
assert(mappedThreatIds.length === 120, `Expected 120 mapped threat cases, found ${mappedThreatIds.length}`);
for (const id of expectedThreatIds) {
  assert(modelThreatIds.includes(id), `Threat model missing ${id}`);
  assert(mappedThreatIds.includes(id), `Threat qualification matrix missing ${id}`);
}
assert(threatText.includes("DEFERRED TO R7 under approved Gate-A D01"), "A86-A95 are not explicitly deferred to R7");
assert(threatQualificationText.includes("A86–A95 are R7 behavioral threats"), "R7 deferred threat disposition is missing");
for (const id of Array.from({ length: 10 }, (_, index) => `A${86 + index}`)) {
  const row = threatQualificationText
    .split("\n")
    .find((line) => line.startsWith(`| ${id} |`));
  assert(row?.includes("G0 SCOPE EXCLUSION + R7 FUTURE"), `${id} is not mapped to R7 exclusion proof`);
  assert(!/\b(WAIVED|PASS)\b/i.test(row ?? ""), `${id} is incorrectly waived or pre-passed`);
}

// Accepted permission registry: 41 historical R6-stage keys, 37 active subset after D01.
const registryText = read("src/modules/authorization/registry.ts");
const blocks = registryText.split(/\n  \{\n/);
const r6Permissions = [];
for (const block of blocks) {
  const key = block.match(/key:\s*"([^"]+)"/)?.[1];
  const stage = block.match(/activationStage:\s*"([^"]+)"/)?.[1];
  if (key && stage === "R6") r6Permissions.push(key);
}
r6Permissions.sort();
assert(r6Permissions.length === 41, `Expected exactly 41 historical R6 permission keys, found ${r6Permissions.length}`);
const proposalKeys = new Set(["proposal.view", "proposal.edit", "proposal.send", "proposal.approve"]);
const activeR6Permissions = r6Permissions.filter((key) => !proposalKeys.has(key));
assert(activeR6Permissions.length === 37, `Expected exactly 37 active R6 keys after D01, found ${activeR6Permissions.length}`);
for (const key of r6Permissions) {
  assert(actionText.includes("| `" + key + "` |"), `R6 action matrix is missing permission ${key}`);
}
for (const key of ["proposal.view", "proposal.edit", "proposal.send", "proposal.approve"]) {
  assert(
    actionText.includes("| `" + key + "` | R7 proposal (inactive) | **NONE IN R6** |"),
    `Proposal permission ${key} is not explicitly dormant in R6`,
  );
}
assert(actionText.includes("Expected active subset size: **37**"), "R6 37-key active subset is not pinned");
assert(exclusionText.includes("Expected active permission count:"), "R7 exclusion manifest lacks active permission count");
assert(exclusionText.includes("**37**"), "R7 exclusion manifest does not pin the 37-key active subset");

const templateBlock = blocks.find((block) => block.includes('key: "template.manage"'));
assert(templateBlock, "template.manage is missing from the accepted permission registry");
assert(templateBlock.includes('activationStage: "R6+"'), "template.manage stage changed from accepted R6+");
assert(actionText.includes("owner-approved D15 Resolution A"), "Action matrix does not record D15 Resolution A");
assert(exclusionText.includes("template.manage"), "R7/R6+ exclusion manifest does not protect template.manage");

// Planning must preserve R5 default activation.
const policyText = read("src/modules/authorization/policy.ts");
assert(
  /DEFAULT_ACTIVE_STAGES\s*=\s*new Set\(\["R5"\]\)/.test(policyText),
  "R6 planning changed the accepted default active stage",
);
assert(policyText.includes('definition.activationStage === "R5"'), "Expected R5-only action-binding guard is missing");
assert(actionText.includes("37-key active-permission allowlist"), "R6 action-family activation precondition is missing");

// Resource and field policy.
for (const resourceType of [
  "lead", "company", "contact", "lead-list", "outreach-campaign",
  "conversation", "message", "meeting", "deal", "client-account",
]) {
  assert(resourceText.includes("`" + resourceType + "`"), `Resource/field policy missing ${resourceType}`);
}
assert(resourceText.includes("not an active R6 resource type"), "Proposal is not excluded from active R6 resources");
assert(!resourceText.includes("Proposal field policy remains conditional"), "Proposal field policy remains conditional after D01 approval");

// Database tenancy/RLS inventory.
for (const table of [
  "crm.lead_sources", "crm.leads", "crm.companies", "crm.contacts",
  "crm.suppression_entries", "comms.outreach_campaigns", "comms.conversations",
  "comms.messages", "comms.meetings", "commercial.deal_pipelines",
  "commercial.deals", "commercial.client_accounts",
]) {
  assert(tenancyText.includes("`" + table + "`"), `Database tenancy matrix missing ${table}`);
}
for (const marker of ["DIRECT RLS", "PARENT RLS + FK", "ENABLE + FORCE", "read-only reference/catalog storage"]) {
  assert(tenancyText.includes(marker), `Database tenancy matrix missing marker: ${marker}`);
}
for (const excluded of ["commercial.proposals", "commercial.contracts", "commercial.invoices", "commercial.payments"]) {
  assert(tenancyText.includes(excluded), `Database tenancy matrix does not record excluded surface ${excluded}`);
}

// Lifecycle and release ceiling.
for (const marker of [
  "PROPOSAL_PREPARATION",
  "Generic `PATCH status=...` is prohibited",
  "positive reply",
  "DO_NOT_CONTACT",
  "template.manage",
  "idempotent conversion",
]) {
  assert(lifecycleText.toLowerCase().includes(marker.toLowerCase()), `Lifecycle matrix missing marker: ${marker}`);
}

// Exclusion manifest must pin R7/R11/R12 boundaries.
for (const marker of [
  "commercial.proposals", "commercial.contracts", "commercial.invoices",
  "commercial.payments", "subscriptions/entitlements", "R11 exclusions",
  "R12 exclusions", "37",
]) {
  assert(exclusionText.includes(marker), `R7+ exclusion manifest missing marker: ${marker}`);
}

// Pre-design audit and implementation contract dispositions.
for (const marker of ["R6-G01", "R6-G02", "R6-G03", "R6-G04", "R6-A01", "R6-A10"]) {
  assert(auditText.includes(marker), `R6 pre-design audit missing finding ${marker}`);
}
for (const marker of [
  "DRAFT G0 CANDIDATE — PRODUCTION IMPLEMENTATION NOT AUTHORIZED",
  "Mandatory action-family binding",
  "37-key",
  "## 16. R7 boundary",
  "R6-G01 Proposal scope: CLOSED",
  "R6-G02 Template permission stage ownership: CLOSED",
  "R6 production implementation: NOT AUTHORIZED",
  "Until item 13: **production R6 implementation is prohibited**.",
  "immutable seed/import manifest",
]) {
  assert(contractText.includes(marker), `R6 implementation contract missing marker: ${marker}`);
}

// Adversarial audit must close planning findings without claiming external review.
assert(adversarialText.includes("not independent external review"), "Adversarial audit must not imply independent review");
assert(adversarialText.includes("BLOCKING G0 contract findings open: 0") && adversarialText.includes("HIGH G0 contract findings open: 0"), "Adversarial audit has unresolved BLOCKING/HIGH findings");
assert(adversarialText.includes("R6 implementation: NOT AUTHORIZED"), "Adversarial audit unlocks production implementation");

// Planning must not modify production schema/code.
const schemaText = read("prisma/schema.prisma");
assert(/schemas\s*=\s*\["iam",\s*"platform",\s*"audit"\]/.test(schemaText), "R6 planning changed Prisma datasource schemas");
for (const forbiddenSchema of ["crm", "comms", "commercial"]) {
  assert(
    !schemaText.includes('@@schema("' + forbiddenSchema + '")'),
    `R6 planning unexpectedly contains production ${forbiddenSchema} models`,
  );
}

const masterText = read("docs/THE-PERSPECTIVE-V1-MASTER-COMPLETION-BIBLE.md");
assert(masterText.includes("## R6 — CRM & Commercial Domain Engine"), "Master Bible R6 definition missing");
assert(masterText.includes("## R7 — Contracts, Invoices, Payments, Subscriptions & Entitlements"), "Master Bible R7 definition missing");

// Exact baseline ancestry + planning-only branch scope.
execFileSync("git", ["merge-base", "--is-ancestor", BASELINE, "HEAD"]);
const changedFiles = git(["diff", "--name-only", `${BASELINE}...HEAD`]).split("\n").filter(Boolean);
const allowed = [
  /^docs\/phase-4\/PHASE-4-R6-.*\.md$/,
  /^scripts\/governance\/verify-r6-contract\.mjs$/,
  /^\.github\/workflows\/r6-contract-enhanced-qualification\.yml$/,
];
const unexpected = changedFiles.filter((path) => !allowed.some((pattern) => pattern.test(path)));
assert(unexpected.length === 0, `R6 G0 branch contains out-of-scope files: ${unexpected.join(", ")}`);

const productionChanges = changedFiles.filter(
  (path) =>
    path.startsWith("src/") ||
    path.startsWith("prisma/") ||
    path.startsWith("public/") ||
    path === "package.json" ||
    path === "package-lock.json",
);
assert(productionChanges.length === 0, `R6 planning branch contains production changes: ${productionChanges.join(", ")}`);

process.stdout.write(JSON.stringify({
  verified: true,
  planningBaseline: BASELINE,
  requiredPlanningDocuments: requiredDocs.length,
  historicalR6PermissionCount: r6Permissions.length,
  activeR6PermissionSubset: activeR6Permissions.length,
  threatCaseCount: modelThreatIds.length,
  mappedThreatCaseCount: mappedThreatIds.length,
  gateAOwnerApproved: true,
  defaultActiveStagePreserved: "R5",
  proposalProductionOwner: "R7",
  templateManageStagePreserved: "R6+",
  blockingHighFindingsOpen: 0,
  productionChanges: productionChanges.length,
  changedFiles: changedFiles.length,
  unexpectedFiles: unexpected.length,
}, null, 2) + "\n");
