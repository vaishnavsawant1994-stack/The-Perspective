const base = process.env.PERSPECTIVE_AUTH_TEST_BASE_URL ?? "http://127.0.0.1:3100";
const paths = ["/", "/login", "/latest", "/magazine", "/api/health/live", "/api/health/ready"];

await fetch(new URL("/", base));

const measurements = [];
for (const path of paths) {
  const started = Date.now();
  const response = await fetch(new URL(path, base));
  const elapsedMs = Date.now() - started;
  if (response.status !== 200) throw new Error(`${path} returned ${response.status}`);
  if (elapsedMs >= 5000) throw new Error(`${path} took ${elapsedMs}ms`);
  measurements.push({ path, elapsedMs, status: response.status });
}

const burstStarted = Date.now();
const burst = await Promise.all(Array.from({ length: 10 }, async () => {
  const started = Date.now();
  const response = await fetch(new URL("/", base));
  return { status: response.status, elapsedMs: Date.now() - started };
}));
if (burst.some((item) => item.status !== 200)) throw new Error("concurrent read failed");
const slowest = Math.max(...burst.map((item) => item.elapsedMs));
if (slowest >= 8000) throw new Error(`concurrent read took ${slowest}ms`);

process.stdout.write(`${JSON.stringify({
  measurements,
  concurrentReads: burst.length,
  slowestConcurrentMs: slowest,
  concurrentElapsedMs: Date.now() - burstStarted,
  ceiling: "qualification-only",
})}\n`);
