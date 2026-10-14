import assert from "node:assert/strict";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

const baseUrl = process.env.PERSPECTIVE_AUTH_TEST_BASE_URL ?? "http://127.0.0.1:3100";
const teamEmail = process.env.PERSPECTIVE_BROWSER_TEAM_EMAIL;
const teamPassword = process.env.PERSPECTIVE_BROWSER_TEAM_PASSWORD;
const clientEmail = process.env.PERSPECTIVE_BROWSER_CLIENT_EMAIL;
const clientPassword = process.env.PERSPECTIVE_BROWSER_CLIENT_PASSWORD;
const [, memberToken] = (process.env.R12_DESK_TOKENS ?? "").split("\n");

for (const [name, value] of Object.entries({ teamEmail, teamPassword, clientEmail, clientPassword, memberToken })) {
  if (!value) throw new Error(`${name} is required.`);
}

const evidenceDir = "artifacts/v1-ui-controls";
await mkdir(evidenceDir, { recursive: true });

function absolute(route) {
  return new URL(route, baseUrl).toString();
}

function normalizeRoute(prefix, segments) {
  const routeSegments = segments.filter((segment) => {
    if (segment.startsWith("(") && segment.endsWith(")")) return false;
    if (segment.startsWith("@")) return false;
    return true;
  });
  return [prefix, ...routeSegments].join("/").replace(/\/+/gu, "/");
}

async function discoverStaticRoutes(root, prefix) {
  const routes = new Set();

  async function walk(directory, segments) {
    const entries = await readdir(directory, { withFileTypes: true });
    if (entries.some((entry) => entry.isFile() && entry.name === "page.tsx")) {
      routes.add(normalizeRoute(prefix, segments));
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith("_") || entry.name.includes("[")) continue;
      await walk(path.join(directory, entry.name), [...segments, entry.name]);
    }
  }

  await walk(root, []);
  return [...routes].sort();
}

const teamRoutes = await discoverStaticRoutes("src/app/app", "/app");
const clientPublicRoots = [
  "/client/activate",
  "/client/login",
  "/client/recover-access",
  "/client/reset-password",
];
const clientRoutes = (await discoverStaticRoutes("src/app/client", "/client")).filter(
  (route) => !clientPublicRoots.some((publicRoot) => route === publicRoot || route.startsWith(`${publicRoot}/`)),
);
const memberRoutes = await discoverStaticRoutes("src/app/my-perspective", "/my-perspective");

assert.ok(teamRoutes.length > 20, `expected broad Team Workspace inventory, found ${teamRoutes.length}`);
assert.ok(clientRoutes.length > 10, `expected broad Client Portal inventory, found ${clientRoutes.length}`);
assert.ok(memberRoutes.length > 0, "expected My Perspective routes");

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  surfaces: {},
  totals: { routes: 0, controls: 0, focusedControls: 0, failures: 0 },
};

const controlSelector = [
  "a[href]",
  "button",
  "input:not([type='hidden'])",
  "select",
  "textarea",
  "summary",
  "[role='button']",
  "[role='link']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

async function inspectControl(locator, route, index) {
  return locator.evaluate((element, context) => {
    const tag = element.tagName.toLowerCase();
    const ariaLabel = element.getAttribute("aria-label")?.trim() ?? "";
    const labelledBy = (element.getAttribute("aria-labelledby") ?? "")
      .split(/\s+/u)
      .filter(Boolean)
      .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
      .filter(Boolean)
      .join(" ");
    const labels = "labels" in element && element.labels
      ? [...element.labels].map((label) => label.textContent?.trim() ?? "").filter(Boolean).join(" ")
      : "";
    const text = element.textContent?.replace(/\s+/gu, " ").trim() ?? "";
    const title = element.getAttribute("title")?.trim() ?? "";
    const placeholder = element.getAttribute("placeholder")?.trim() ?? "";
    const value = (tag === "input" && ["button", "submit", "reset"].includes(element.getAttribute("type") ?? ""))
      ? element.getAttribute("value")?.trim() ?? ""
      : "";
    const imageAlt = tag === "input" && element.getAttribute("type") === "image"
      ? element.getAttribute("alt")?.trim() ?? ""
      : "";
    const name = ariaLabel || labelledBy || labels || text || title || value || imageAlt || placeholder;
    const disabled = Boolean(element.disabled) || element.getAttribute("aria-disabled") === "true";
    const href = tag === "a" ? element.getAttribute("href") ?? "" : null;
    let deadHref = null;
    if (href !== null) {
      if (!href || href === "#" || /^javascript:/iu.test(href)) deadHref = href || "<empty>";
      else if (href.startsWith("#") && !document.getElementById(decodeURIComponent(href.slice(1)))) deadHref = href;
    }

    let focusable = true;
    if (!disabled) {
      element.focus();
      focusable = document.activeElement === element || element.contains(document.activeElement);
    }

    return {
      route: context.route,
      index: context.index,
      tag,
      name,
      href,
      disabled,
      deadHref,
      focusable,
      html: element.outerHTML.slice(0, 320),
    };
  }, { route, index });
}

async function auditRoute(page, surface, route) {
  const routeFailures = [];
  const serverFailures = [];
  const consoleErrors = [];

  const responseListener = (response) => {
    if (response.status() >= 500) {
      serverFailures.push(`${response.status()} ${new URL(response.url()).pathname}`);
    }
  };
  const consoleListener = (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (/Failed to load resource: the server responded with a status of 404 \(Not Found\)/u.test(text)) return;
    consoleErrors.push(text);
  };
  page.on("response", responseListener);
  page.on("console", consoleListener);

  try {
    const response = await page.goto(absolute(route), { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
    const status = response?.status() ?? 0;
    if (status !== 200) routeFailures.push(`navigation status ${status}`);

    const finalPath = new URL(page.url()).pathname;
    if (surface === "team" && !finalPath.startsWith("/app")) routeFailures.push(`unexpected redirect to ${finalPath}`);
    if (surface === "client" && !finalPath.startsWith("/client")) routeFailures.push(`unexpected redirect to ${finalPath}`);
    if (surface === "member" && !finalPath.startsWith("/my-perspective")) routeFailures.push(`unexpected redirect to ${finalPath}`);

    const bodyText = (await page.locator("body").innerText()).trim();
    if (bodyText.length < 20) routeFailures.push("rendered body is unexpectedly empty");

    const overlayCount = await page.locator("[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay").count();
    if (overlayCount > 0) routeFailures.push("framework error overlay is visible");

    const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (desktopOverflow > 2) routeFailures.push(`desktop horizontal overflow ${desktopOverflow}px`);

    const controls = page.locator(controlSelector);
    const controlCount = await controls.count();
    const controlResults = [];
    let focusedControls = 0;
    for (let index = 0; index < controlCount; index += 1) {
      const locator = controls.nth(index);
      if (!(await locator.isVisible().catch(() => false))) continue;
      const result = await inspectControl(locator, route, index);
      controlResults.push(result);
      if (!result.name) routeFailures.push(`control ${index} <${result.tag}> has no usable accessible name`);
      if (result.deadHref !== null) routeFailures.push(`control ${index} has dead href ${result.deadHref}`);
      if (!result.disabled) {
        if (result.focusable) focusedControls += 1;
        else routeFailures.push(`control ${index} <${result.tag}> cannot receive focus`);
      }
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(40);
    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (mobileOverflow > 2) routeFailures.push(`mobile horizontal overflow ${mobileOverflow}px`);
    await page.setViewportSize({ width: 1280, height: 900 });

    if (serverFailures.length > 0) routeFailures.push(`5xx responses: ${[...new Set(serverFailures)].join(", ")}`);
    if (consoleErrors.length > 0) routeFailures.push(`console errors: ${[...new Set(consoleErrors)].join(" | ")}`);

    if (routeFailures.length > 0) {
      const screenshotName = `${surface}-${route.replace(/^\//u, "").replace(/[^a-z0-9]+/giu, "-") || "root"}.png`;
      await page.screenshot({ path: path.join(evidenceDir, screenshotName), fullPage: true }).catch(() => {});
    }

    return {
      route,
      finalPath,
      status,
      bodyLength: bodyText.length,
      controls: controlResults.length,
      focusedControls,
      desktopOverflow,
      mobileOverflow,
      failures: routeFailures,
    };
  } finally {
    page.off("response", responseListener);
    page.off("console", consoleListener);
  }
}

async function loginTeam(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(absolute("/login?next=%2Fapp%2Fsettings"), { waitUntil: "domcontentloaded" });
  await page.getByPlaceholder("Enter your work email address").fill(teamEmail);
  await page.getByPlaceholder("Enter your password").fill(teamPassword);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL((url) => url.pathname === "/app/settings");
  return { context, page };
}

async function loginClient(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(absolute("/client/login?next=%2Fclient%2Fprojects"), { waitUntil: "domcontentloaded" });
  await page.getByPlaceholder("name@company.com").fill(clientEmail);
  await page.getByPlaceholder("Enter your password").fill(clientPassword);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await page.waitForURL((url) => url.pathname === "/client/projects");
  return { context, page };
}

async function memberSession(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.setExtraHTTPHeaders({ cookie: `__Host-perspective-session=${memberToken}` });
  return { context, page: await context.newPage() };
}

const browser = await chromium.launch({ headless: true });
try {
  const surfaces = [
    ["team", teamRoutes, loginTeam],
    ["client", clientRoutes, loginClient],
    ["member", memberRoutes, memberSession],
  ];

  for (const [surface, routes, openSession] of surfaces) {
    const { context, page } = await openSession(browser);
    const results = [];
    try {
      for (const route of routes) {
        const result = await auditRoute(page, surface, route);
        results.push(result);
        report.totals.routes += 1;
        report.totals.controls += result.controls;
        report.totals.focusedControls += result.focusedControls;
        report.totals.failures += result.failures.length;
      }
    } finally {
      await context.close();
    }
    report.surfaces[surface] = { routes: routes.length, results };
  }
} finally {
  await browser.close();
}

await writeFile(path.join(evidenceDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");

const failures = Object.entries(report.surfaces).flatMap(([surface, details]) =>
  details.results.flatMap((result) => result.failures.map((failure) => `${surface} ${result.route}: ${failure}`)),
);

process.stdout.write(`${JSON.stringify({
  v1_ui_control_qualification: failures.length === 0 ? "pass" : "fail",
  routes: report.totals.routes,
  controls: report.totals.controls,
  focusedControls: report.totals.focusedControls,
  failures: failures.length,
})}\n`);

assert.deepEqual(failures, [], `V1 UI control qualification failures:\n${failures.join("\n")}`);
