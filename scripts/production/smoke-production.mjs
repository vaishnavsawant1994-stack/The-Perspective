import assert from "node:assert/strict";

const origin = (process.env.PERSPECTIVE_PRODUCTION_ORIGIN ?? "").replace(/\/$/u, "");
const expectedSiteUrl = (process.env.NEXT_PUBLIC_PERSPECTIVE_SITE_URL ?? origin).replace(/\/$/u, "");

assert.match(origin, /^https:\/\/[^/\s]+$/u, "PERSPECTIVE_PRODUCTION_ORIGIN must be an HTTPS origin");
assert.match(expectedSiteUrl, /^https:\/\/[^/\s]+$/u, "NEXT_PUBLIC_PERSPECTIVE_SITE_URL must be an HTTPS origin");

async function request(path, expectedStatus) {
  const response = await fetch(`${origin}${path}`, {
    redirect: "manual",
    signal: AbortSignal.timeout(20_000),
  });
  assert.equal(response.status, expectedStatus, `${path} returned ${response.status}, expected ${expectedStatus}`);
  return response;
}

const home = await request("/", 200);
assert.equal(home.headers.get("x-content-type-options"), "nosniff");
assert.equal(home.headers.get("x-frame-options"), "SAMEORIGIN");
assert.match(home.headers.get("strict-transport-security") ?? "", /max-age=/u);
const homeHtml = await home.text();
assert.ok(!homeHtml.includes("theperspective.example"), "production HTML still contains the placeholder site domain");
assert.ok(homeHtml.includes(expectedSiteUrl), "production HTML does not expose the configured canonical site URL");

const live = await request("/api/health/live", 200);
const liveBody = await live.json();
assert.equal(liveBody.status, "live");

const ready = await request("/api/health/ready", 200);
const readyBody = await ready.json();
assert.equal(readyBody.status, "ready");

await request("/login", 200);
await request("/article/v1-production-missing-article", 404);
await request("/author/v1-production-missing-author", 404);
await request("/personal-magazines/v1-production-missing-magazine", 404);
await request("/magazine/category/v1-production-missing-category", 404);

process.stdout.write(`${JSON.stringify({
  production_smoke: "pass",
  origin,
  canonical: expectedSiteUrl,
  health_live: "pass",
  health_ready: "pass",
  security_headers: "pass",
  real_404s: "pass",
})}\n`);
