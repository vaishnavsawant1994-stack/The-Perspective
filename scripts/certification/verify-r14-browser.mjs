import assert from "node:assert/strict";

import { chromium } from "playwright";

const base = process.env.PERSPECTIVE_AUTH_TEST_BASE_URL ?? "http://127.0.0.1:3100";
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const home = await page.goto(new URL("/", base).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(home?.status(), 200);
  assert.equal(home?.headers()["x-content-type-options"], "nosniff");
  assert.equal(home?.headers()["x-frame-options"], "SAMEORIGIN");
  assert.match(home?.headers()["referrer-policy"] ?? "", /strict-origin-when-cross-origin/u);
  assert.match(home?.headers()["permissions-policy"] ?? "", /camera=\(\)/u);
  assert.equal(home?.headers()["strict-transport-security"], undefined);
  await page.locator("h1").first().waitFor();
  await page.keyboard.press("Tab");
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await page.setViewportSize({ width: 1280, height: 900 });
  const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

  const login = await page.goto(new URL("/login", base).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(login?.status(), 200);
  const denied = await page.goto(new URL("/app/operations/desk", base).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(new URL(denied?.url() ?? base).pathname, "/login");

  const createMagazine = await page.goto(new URL("/personal-magazines/create", base).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(createMagazine?.status(), 200, "/personal-magazines/create must remain routable");

  const missingPublicRoutes = [
    "/article/qualification-missing-article",
    "/author/qualification-missing-author",
    "/personal-magazines/qualification-missing-personal-magazine",
    "/magazine/category/qualification-missing-category",
  ];
  for (const path of missingPublicRoutes) {
    const missing = await page.goto(new URL(path, base).toString(), { waitUntil: "domcontentloaded" });
    assert.equal(missing?.status(), 404, `${path} must return HTTP 404`);
  }

  const live = await page.goto(new URL("/api/health/live", base).toString());
  assert.equal(live?.status(), 200);
  const liveText = await page.locator("body").innerText();
  assert.match(liveText, /"status"\s*:\s*"live"/u);
  assert.doesNotMatch(liveText, /DATABASE_URL|PERSPECTIVE_AUTH_DATA_KEY|cookie/iu);

  const ready = await page.goto(new URL("/api/health/ready", base).toString());
  assert.equal(ready?.status(), 200);
  assert.match(await page.locator("body").innerText(), /"status"\s*:\s*"ready"/u);

  process.stdout.write(`${JSON.stringify({
    r14_browser: "pass",
    homeMobileOverflowPx: mobileOverflow,
    homeDesktopOverflowPx: desktopOverflow,
    missingPublicRouteStatus: 404,
    accessibility: "keyboard-and-heading-only",
    browsers: ["chromium"],
  })}\n`);
} finally {
  await browser.close();
}
