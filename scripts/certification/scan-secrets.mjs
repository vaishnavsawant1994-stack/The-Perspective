import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const patterns = [
  { name: "private-key", expression: /-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/u },
  { name: "aws-access-key", expression: /AKIA[0-9A-Z]{16}/u },
  { name: "stripe-live", expression: /sk_live_[0-9A-Za-z]{8,}/u },
  { name: "github-token", expression: /ghp_[A-Za-z0-9]{20,}/u },
  { name: "github-pat", expression: /github_pat_[A-Za-z0-9_]{20,}/u },
];
const skip = new Set(["node_modules", ".git", "artifacts", ".next"]);
const findings = [];

function walk(directory) {
  for (const name of readdirSync(directory)) {
    if (skip.has(name)) continue;
    const path = join(directory, name);
    const info = statSync(path);
    if (info.isDirectory()) {
      walk(path);
      continue;
    }
    if (info.size > 1_000_000 || !/\.(?:ts|tsx|js|mjs|yml|yaml|md|json|env|example)$/u.test(name)) continue;
    const text = readFileSync(path, "utf8");
    for (const pattern of patterns) {
      if (pattern.expression.test(text)) findings.push(`${pattern.name}: ${path}`);
    }
  }
}

walk(".");
if (findings.length > 0) {
  process.stderr.write(`${findings.join("\n")}\n`);
  process.exit(1);
}
process.stdout.write("secret scan: no production-key patterns\n");
