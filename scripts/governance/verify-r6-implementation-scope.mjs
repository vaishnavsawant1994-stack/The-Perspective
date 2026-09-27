import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const BASELINE = "2372418d80fa07f633a0e4adc99a21b1f7d8300a";
const FROZEN = "730d2280fafe29c756ba7e0b09ff7e8e5c9496a6";
const PROPOSAL_KEYS = [
  "proposal.approve",
  "proposal.edit",
  "proposal.send",
  "proposal.view",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

const auth = readFileSync(
  "docs/phase-4/PHASE-4-R6-IMPLEMENTATION-AUTHORIZATION.md",
  "utf8",
);
const schema = readFileSync("prisma/schema.prisma", "utf8");
const migration = readFileSync(
  "prisma/migrations/20260927103000_r6_crm_commercial_foundation/migration.sql",
  "utf8",
);
const registry = readFileSync("src/modules/authorization/registry.ts", "utf8");
const frozenContract = git([
  "show",
  `${FROZEN}:docs/phase-4/PHASE-4-R6-IMPLEMENTATION-CONTRACT.md`,
]);

execFileSync("git", ["merge-base", "--is-ancestor", BASELINE, "HEAD"]);

assert(auth.includes(BASELINE), "R6 implementation authorization lost the exact baseline");
assert(auth.includes(FROZEN), "R6 implementation authorization lost the exact frozen contract");
assert(auth.includes("P4-R6-C1:** NOT ACCEPTED"), "P4-R6-C1 was prematurely accepted");
assert(auth.includes("Merge:** NOT AUTHORIZED"), "R6 merge was prematurely authorized");
assert(auth.includes("R7+:** NOT AUTHORIZED"), "R7+ was prematurely authorized");
assert(auth.includes("Design 154:** NOT AUTHORIZED"), "Design 154 was prematurely authorized");
assert(auth.includes("V1.0 certification:** NOT AUTHORIZED"), "V1.0 certification was prematurely authorized");

for (const marker of [
  "DRAFT G0 CANDIDATE — PRODUCTION IMPLEMENTATION NOT AUTHORIZED",
  "approved 37-key active-permission allowlist",
  "PROPOSAL_PREPARATION",
  "template.manage",
  "A01–A120",
]) {
  assert(frozenContract.includes(marker), `Frozen R6 contract missing marker: ${marker}`);
}

assert(
  /schemas\s*=\s*\["iam",\s*"platform",\s*"audit",\s*"crm",\s*"comms",\s*"commercial"\]/.test(schema),
  "R6 Prisma schema does not contain the exact approved schema set",
);

const r6Models = [...schema.matchAll(/^model\s+(Crm\w+|Comms\w+|Commercial\w+)\s*\{/gm)]
  .map((match) => match[1]);
assert(r6Models.length === 35, `Expected 35 R6 Prisma models, found ${r6Models.length}`);

const prohibitedModelNames = [
  "CommercialProduct",
  "CommercialPackage",
  "CommercialProposal",
  "CommercialProposalVersion",
  "CommercialProposalAcceptance",
  "CommercialContract",
  "CommercialInvoice",
  "CommercialPayment",
  "CommercialSubscription",
  "CommercialEntitlement",
];
for (const model of prohibitedModelNames) {
  assert(!schema.includes(`model ${model} {`), `Prohibited R7 model present: ${model}`);
}

const createTables = [
  ...migration.matchAll(/CREATE TABLE\s+"([^"]+)"\."([^"]+)"/g),
].map((match) => `${match[1]}.${match[2]}`);
assert(createTables.length === 35, `Expected 35 R6 CREATE TABLE statements, found ${createTables.length}`);

const prohibitedTables = [
  "commercial.products",
  "commercial.packages",
  "commercial.proposals",
  "commercial.proposal_versions",
  "commercial.proposal_acceptances",
  "commercial.contracts",
  "commercial.contract_versions",
  "commercial.contract_signers",
  "commercial.signature_events",
  "commercial.invoices",
  "commercial.invoice_lines",
  "commercial.credit_notes",
  "commercial.credit_note_lines",
  "commercial.payments",
  "commercial.payment_allocations",
  "commercial.refunds",
  "commercial.ledger_transactions",
  "commercial.ledger_entries",
];
for (const table of prohibitedTables) {
  assert(!createTables.includes(table), `Prohibited R7 table created: ${table}`);
}

for (const marker of [
  "ENABLE ROW LEVEL SECURITY",
  "FORCE ROW LEVEL SECURITY",
  "perspective_runtime",
  "r6_assert_resource_envelope",
  "r6_assert_same_tenant_reference",
  "r6_reject_template_runtime_mutation",
  "deal_stages_r6_canonical_class",
]) {
  assert(migration.includes(marker), `R6 migration missing security marker: ${marker}`);
}

const historicalR6Keys = [];
for (const block of registry.split(/\n  \{\n/)) {
  const key = block.match(/key:\s*"([^"]+)"/)?.[1];
  const stage = block.match(/activationStage:\s*"([^"]+)"/)?.[1];
  if (key && stage === "R6") historicalR6Keys.push(key);
}
historicalR6Keys.sort();
assert(
  historicalR6Keys.length === 41,
  `Expected 41 historical exact-R6 permission keys, found ${historicalR6Keys.length}`,
);
const active = historicalR6Keys.filter((key) => !PROPOSAL_KEYS.includes(key));
assert(active.length === 37, `Expected 37 active R6 permission keys, found ${active.length}`);

const templateBlock = registry
  .split(/\n  \{\n/)
  .find((block) => block.includes('key: "template.manage"'));
assert(templateBlock?.includes('activationStage: "R6+"'), "template.manage is no longer dormant at R6+");

const changed = git(["diff", "--name-only", `${BASELINE}...HEAD`])
  .split("\n")
  .filter(Boolean);
assert(
  !changed.some((path) => path.startsWith("docs/design-154/")),
  "Design 154 changed during R6 implementation",
);

process.stdout.write(JSON.stringify({
  verified: true,
  baseline: BASELINE,
  frozenContract: FROZEN,
  r6Models: r6Models.length,
  r6Tables: createTables.length,
  historicalR6PermissionCount: historicalR6Keys.length,
  activeR6PermissionCount: active.length,
  proposalKeysDormant: PROPOSAL_KEYS.length,
  templateManageStage: "R6+",
  p4R6C1Accepted: false,
  mergeAuthorized: false,
}, null, 2) + "\n");
