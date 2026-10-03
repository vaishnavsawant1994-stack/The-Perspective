import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const registry = readFileSync("src/modules/authorization/registry.ts", "utf8");
const keys = [...registry.matchAll(/^\s+key:\s+"([^"]+)"/gmu)].map((match) => match[1]);
const stages = [...registry.matchAll(/activationStage:\s+"([^"]+)"/gu)].map((match) => match[1]);
const frozenBlock = readFileSync("src/modules/authorization/launch-roles.ts", "utf8")
  .split("FROZEN_TEAM_ROLE_PERMISSION_KEYS = [")[1]
  ?.split("];")[0] ?? "";
const frozen = [...frozenBlock.matchAll(/"([^"]+)"/gu)].map((match) => match[1]);
const onlyHits = [];

function walk(directory) {
  for (const name of readdirSync(directory)) {
    if (name === "node_modules" || name === ".git" || name === "artifacts") continue;
    const path = join(directory, name);
    if (statSync(path).isDirectory()) {
      walk(path);
      continue;
    }
    if (!/\.(?:ts|tsx|js|mjs)$/u.test(name)) continue;
    if (/\b(?:it|test|describe)\.only\(/u.test(readFileSync(path, "utf8"))) onlyHits.push(path);
  }
}

walk("src");
walk("scripts");

function countFiles(directory, fileName) {
  let count = 0;
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) count += countFiles(path, fileName);
    else if (name === fileName) count += 1;
  }
  return count;
}

if (new Set(keys).size !== keys.length) throw new Error("duplicate permission keys");
if (frozen.length !== 131) throw new Error(`frozen registry length ${frozen.length}`);
if (stages.includes("R14")) throw new Error("R14 permission stage is not allowed");
if (onlyHits.length > 0) throw new Error(`focused tests: ${onlyHits.join(", ")}`);

const report = {
  permissionDefinitions: keys.length,
  frozenTeamRolePermissionKeys: frozen.length,
  r14ActivationStage: stages.filter((stage) => stage === "R14").length,
  pages: countFiles("src/app", "page.tsx"),
  routeModules: countFiles("src/app", "route.ts"),
  focusedTests: onlyHits.length,
};
process.stdout.write(`${JSON.stringify(report)}\n`);
