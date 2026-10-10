import assert from "node:assert/strict";

const origin = (process.env.PERSPECTIVE_PRODUCTION_ORIGIN ?? "").replace(/\/$/u, "");
const token = process.env.PERSPECTIVE_R9_WORKER_TOKEN ?? "";

assert.match(origin, /^https:\/\/[^/\s]+$/u, "PERSPECTIVE_PRODUCTION_ORIGIN must be an HTTPS origin");
assert.ok(token.length >= 32, "PERSPECTIVE_R9_WORKER_TOKEN must be at least 32 characters");

const response = await fetch(`${origin}/api/v1/internal/r9/worker/publish-due`, {
  method: "POST",
  headers: {
    authorization: `Bearer ${token}`,
    accept: "application/json",
  },
  signal: AbortSignal.timeout(30_000),
});
const text = await response.text();
if (!response.ok) {
  throw new Error(`R9 publish-due worker returned ${response.status}: ${text.slice(0, 500)}`);
}

let body = null;
try {
  body = JSON.parse(text);
} catch {
  throw new Error("R9 publish-due worker returned non-JSON output");
}

process.stdout.write(`${JSON.stringify({
  r9_publish_due: "success",
  status: response.status,
  result: body?.result ?? null,
})}\n`);
