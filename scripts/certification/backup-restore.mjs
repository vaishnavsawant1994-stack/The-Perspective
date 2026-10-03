import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import pg from "pg";

const source = process.env.DATABASE_URL;
const restoreName = process.env.R14_RESTORE_DATABASE ?? "perspective_r14_restore";
if (!source) throw new Error("DATABASE_URL is required");
if (!/^[a-z0-9_]+$/u.test(restoreName)) throw new Error("restore database name is not allowed");

const bin = (name) => process.env.R14_PG_BIN ? join(process.env.R14_PG_BIN, name) : name;
const dumpPath = process.env.R14_DUMP_PATH ?? "/tmp/r14-qualification.dump";
const started = Date.now();
execFileSync(bin("pg_dump"), ["--format=custom", "--no-owner", "--no-acl", "--file", dumpPath, source], { stdio: ["ignore", "ignore", "inherit"] });
const sha256 = createHash("sha256").update(readFileSync(dumpPath)).digest("hex");

const admin = new URL(source);
admin.pathname = "/postgres";
const client = new pg.Client({ connectionString: admin.toString() });
await client.connect();
await client.query("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()", [restoreName]);
await client.query(`DROP DATABASE IF EXISTS ${restoreName}`);
await client.query(`CREATE DATABASE ${restoreName}`);
await client.end();

const restored = new URL(source);
restored.pathname = `/${restoreName}`;
execFileSync(bin("pg_restore"), ["--no-owner", "--exit-on-error", "--dbname", restored.toString(), dumpPath], { stdio: ["ignore", "ignore", "inherit"] });

async function migrationCount(connectionString) {
  const probe = new pg.Client({ connectionString });
  await probe.connect();
  const result = await probe.query("SELECT count(*)::int AS count FROM public._prisma_migrations WHERE finished_at IS NOT NULL");
  await probe.end();
  return result.rows[0].count;
}

const sourceCount = await migrationCount(source);
const restoreCount = await migrationCount(restored.toString());
if (sourceCount !== restoreCount || sourceCount < 1) {
  throw new Error(`migration count mismatch source=${sourceCount} restore=${restoreCount}`);
}

process.stdout.write(`${JSON.stringify({
  backup: "restored",
  sha256,
  migrations: restoreCount,
  elapsedMs: Date.now() - started,
})}\n`);
