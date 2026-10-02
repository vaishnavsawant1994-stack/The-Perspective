import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.PERSPECTIVE_AUTH_TEST_BASE_URL ?? "http://127.0.0.1:3100";
const evidenceDir = "artifacts/r9-reader";
await mkdir(evidenceDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const missing = await page.goto(new URL("/magazine/read/not-a-real-unpublished-issue", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(missing?.status(), 404, "an unpublished or unknown issue slug must not render a draft");
  assert.equal((await page.content()).includes("UNPUBLISHED-R9-SECRET"), false);

  const reader = await page.goto(new URL("/magazine/read/august-2026", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(reader?.status(), 200);
  await page.waitForFunction(() => document.documentElement.dataset.readerReady === "august-2026", undefined, { timeout: 20000 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 1, `mobile reader overflowed by ${overflow}px`);
  const progress = page.locator("input[aria-label='Magazine reading progress']").first();
  const before = await progress.inputValue();
  await progress.focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction((start) => {
    const input = document.querySelector("input[aria-label='Magazine reading progress']");
    return input instanceof HTMLInputElement && input.value !== start;
  }, before, { timeout: 5000 });
  await page.keyboard.press("ArrowLeft");
  await page.waitForFunction((start) => {
    const input = document.querySelector("input[aria-label='Magazine reading progress']");
    return input instanceof HTMLInputElement && input.value === start;
  }, before, { timeout: 5000 });
  assert.equal(await progress.inputValue(), before);
  await page.getByRole("button", { name: "Next page" }).first().click();
  await page.waitForFunction((start) => {
    const input = document.querySelector("input[aria-label='Magazine reading progress']");
    return input instanceof HTMLInputElement && input.value !== start;
  }, before, { timeout: 5000 });
  await page.getByRole("button", { name: "Open page thumbnails" }).click();
  await page.getByRole("button", { name: /^Go to page / }).first().click();
  await page.screenshot({ path: `${evidenceDir}/reader-mobile.png`, fullPage: false });

  await page.setViewportSize({ width: 1280, height: 900 });
  const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(desktopOverflow <= 1, `desktop reader overflowed by ${desktopOverflow}px`);
  await page.getByRole("button", { name: "Zoom in" }).first().click();
  await page.getByRole("button", { name: "Zoom out" }).first().click();
  await page.getByRole("button", { name: /full\s*screen/i }).first().click();
  await page.keyboard.press("ArrowRight");
  await page.screenshot({ path: `${evidenceDir}/reader-desktop.png`, fullPage: false });

  const premium = await page.request.get(new URL("/api/v1/r9/public/premium", baseUrl).toString());
  assert.equal(premium.status(), 200);
  const catalogue = await premium.text();
  assert.equal(catalogue.includes("UNPUBLISHED-R9-SECRET"), false);
  const sitemap = await page.request.get(new URL("/sitemap.xml", baseUrl).toString());
  assert.ok(sitemap.ok());
  assert.equal((await sitemap.text()).includes("not-a-real-unpublished-issue"), false);
} finally {
  await browser.close();
}

process.stdout.write("R9 reader qualification passed\n");
