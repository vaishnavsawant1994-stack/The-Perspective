import assert from "node:assert/strict";
import { access, mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

const baseUrl = process.env.PERSPECTIVE_AUTH_TEST_BASE_URL ?? "http://127.0.0.1:3100";
const teamEmail = process.env.PERSPECTIVE_BROWSER_TEAM_EMAIL;
const teamPassword = process.env.PERSPECTIVE_BROWSER_TEAM_PASSWORD;
const editorialEmail = process.env.PERSPECTIVE_BROWSER_EDITORIAL_EMAIL;
const editorialPassword = process.env.PERSPECTIVE_BROWSER_EDITORIAL_PASSWORD;
const clientEmail = process.env.PERSPECTIVE_BROWSER_CLIENT_EMAIL;
const clientPassword = process.env.PERSPECTIVE_BROWSER_CLIENT_PASSWORD;
for (const [name, value] of Object.entries({ teamEmail, teamPassword, editorialEmail, editorialPassword, clientEmail, clientPassword })) {
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

const editorialRoute = "/app/editorial/profile-network";
const editorialApi = "/api/v1/profile-network/editorial/submissions";
const discoveredTeamRoutes = await discoverStaticRoutes("src/app/app", "/app");
assert.ok(discoveredTeamRoutes.includes(editorialRoute), "expected the Profile Network editorial route");
const teamRoutes = discoveredTeamRoutes.filter((route) => route !== editorialRoute);
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
  totals: { routes: 0, controls: 0, focusedControls: 0, authorizationChecks: 0, failures: 0 },
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
  const forbiddenApiResponses = [];
  const consoleErrors = [];

  const responseListener = (response) => {
    const responseUrl = new URL(response.url());
    if (response.status() === 403 && responseUrl.pathname.startsWith("/api/")) {
      forbiddenApiResponses.push(`${response.status()} ${responseUrl.pathname}`);
    }
    if (response.status() >= 500) {
      serverFailures.push(`${response.status()} ${responseUrl.pathname}`);
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
    if (surface === "member") {
      const expectedCanonicalPath = route.replace(/^\/my-perspective(?=\/|$)/u, "/my");
      if (finalPath !== expectedCanonicalPath) routeFailures.push(`unexpected redirect to ${finalPath}; expected canonical path ${expectedCanonicalPath}`);
    }

    const bodyText = (await page.locator("body").innerText()).trim();
    if (bodyText.length < 20) routeFailures.push("rendered body is unexpectedly empty");

    const overlayCount = await page.locator("[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay").count();
    if (overlayCount > 0) routeFailures.push("framework error overlay is visible");

    const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (desktopOverflow > 2) routeFailures.push(`desktop horizontal overflow ${desktopOverflow}px`);

    const controls = page.locator(controlSelector);
    const controlCount = await controls.count();
    const controlResults = [];
    const controlFailures = [];
    let focusedControls = 0;
    for (let index = 0; index < controlCount; index += 1) {
      const locator = controls.nth(index);
      if (!(await locator.isVisible().catch(() => false))) continue;
      const result = await inspectControl(locator, route, index);
      controlResults.push(result);
      if (!result.name) {
        routeFailures.push(`control ${index} <${result.tag}> has no usable accessible name`);
        controlFailures.push({ ...result, issue: "missing-accessible-name" });
      }
      if (result.deadHref !== null) {
        routeFailures.push(`control ${index} has dead href ${result.deadHref}`);
        controlFailures.push({ ...result, issue: "dead-href" });
      }
      if (!result.disabled) {
        if (result.focusable) focusedControls += 1;
        else {
          routeFailures.push(`control ${index} <${result.tag}> cannot receive focus`);
          controlFailures.push({ ...result, issue: "not-focusable" });
        }
      }
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(40);
    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (mobileOverflow > 2) routeFailures.push(`mobile horizontal overflow ${mobileOverflow}px`);
    await page.setViewportSize({ width: 1280, height: 900 });

    if (serverFailures.length > 0) routeFailures.push(`5xx responses: ${[...new Set(serverFailures)].join(", ")}`);
    if (forbiddenApiResponses.length > 0) routeFailures.push(`403 API responses: ${[...new Set(forbiddenApiResponses)].join(", ")}`);
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
      controlFailures,
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

async function loginEditorial(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(absolute("/login?next=%2Fapp%2Feditorial%2Fprofile-network"), { waitUntil: "domcontentloaded" });
  await page.getByPlaceholder("Enter your work email address").fill(editorialEmail);
  await page.getByPlaceholder("Enter your password").fill(editorialPassword);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL((url) => url.pathname === editorialRoute);
  return { context, page };
}

async function verifyRestrictedEditorialAccess(browser) {
  const { context, page } = await loginTeam(browser);
  const failures = [];
  try {
    const apiResponsePromise = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return url.pathname === editorialApi && response.request().method() === "GET";
    });
    const navigation = await page.goto(absolute(editorialRoute), { waitUntil: "domcontentloaded" });
    const apiResponse = await apiResponsePromise;
    await page.getByRole("heading", { name: "Editorial Team access required" }).waitFor();
    if (navigation?.status() !== 200) failures.push(`restricted page navigation returned ${navigation?.status() ?? 0}`);
    if (apiResponse.status() !== 403) failures.push(`restricted editorial API returned ${apiResponse.status()}, expected 403`);
    if (await page.getByRole("heading", { name: "Submit editorial research" }).count() !== 0) {
      failures.push("restricted Team user can see the editorial submission form");
    }
    return { route: editorialRoute, persona: "restricted Team", expectedApiStatus: 403, failures };
  } catch (error) {
    failures.push(error instanceof Error ? error.message : "restricted access assertion failed");
    return { route: editorialRoute, persona: "restricted Team", expectedApiStatus: 403, failures };
  } finally {
    await context.close();
  }
}

async function auditPublicProfileDirectories(browser) {
  const expected = [
    ["/companies", "Company profiles", "#company-search"],
    ["/professionals", "Professional profiles", "#profile-search"],
    ["/editors", "Editor profiles", "#profile-search"],
  ];
  const sourcePaths = expected.map(([route]) => path.join("src", "app", route.slice(1), "page.tsx"));
  const present = await Promise.all(sourcePaths.map(async (sourcePath) => {
    try {
      await access(sourcePath);
      return true;
    } catch {
      return false;
    }
  }));
  if (!present.some(Boolean)) return { skipped: true, routes: 0, results: [] };

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const results = [];
  try {
    for (let index = 0; index < expected.length; index += 1) {
      const [route, expectedHeading, expectedResultsControl] = expected[index];
      const result = { route, expectedHeading, failures: [] };
      if (!present[index]) {
        result.failures.push("Profile Network directory page source is missing");
        results.push(result);
        continue;
      }

      const page = await context.newPage();
      try {
        const audit = await auditRoute(page, "public-profile", route);
        Object.assign(result, audit);
        const title = await page.title();
        if (!title.includes(expectedHeading)) result.failures.push(`document title did not include ${JSON.stringify(expectedHeading)}: ${JSON.stringify(title)}`);
        const heading = page.getByRole("heading", { level: 1, name: expectedHeading, exact: true });
        await heading.waitFor({ state: "visible", timeout: 20_000 }).catch(() => {
          result.failures.push(`expected visible h1 ${JSON.stringify(expectedHeading)} was not rendered`);
        });
        await page.locator(expectedResultsControl).waitFor({ state: "visible", timeout: 20_000 }).catch(() => {
          result.failures.push("published profile results did not finish loading");
        });
        const loadingFallback = page.locator('#main-content [aria-label="Loading content"][aria-busy="true"]');
        if (await loadingFallback.count() > 0) result.failures.push("profile directory is still showing the loading fallback");
        if (result.failures.length > 0) {
          const screenshotName = `public-profile-${route.slice(1)}.png`;
          await page.screenshot({ path: path.join(evidenceDir, screenshotName), fullPage: true }).catch(() => {});
        }
      } catch (error) {
        result.failures.push(error instanceof Error ? error.message : "public profile route audit failed");
      } finally {
        await page.close();
      }
      results.push(result);
    }
  } finally {
    await context.close();
  }
  return { skipped: false, routes: results.length, results };
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

const browser = await chromium.launch({ headless: true });
try {
  const publicProfileResults = await auditPublicProfileDirectories(browser);
  report.surfaces.publicProfileDirectories = publicProfileResults;
  for (const result of publicProfileResults.results) {
    report.totals.routes += 1;
    report.totals.controls += result.controls ?? 0;
    report.totals.focusedControls += result.focusedControls ?? 0;
    report.totals.failures += result.failures.length;
  }

  const surfaces = [
    ["team", teamRoutes, loginTeam],
    ["client", clientRoutes, loginClient],
    ["member", memberRoutes, loginTeam],
  ];

  for (const [surface, routes, openSession] of surfaces) {
    const { context, page } = await openSession(browser);
    const results = [];
    const authorizationResults = [];
    try {
      for (const route of routes) {
        const result = await auditRoute(page, surface, route);
        results.push(result);
        report.totals.routes += 1;
        report.totals.controls += result.controls;
        report.totals.focusedControls += result.focusedControls;
        report.totals.failures += result.failures.length;
      }
      if (surface === "team") {
        const restricted = await verifyRestrictedEditorialAccess(browser);
        authorizationResults.push(restricted);
        report.totals.authorizationChecks += 1;
        report.totals.failures += restricted.failures.length;

        const { context: editorialContext, page: editorialPage } = await loginEditorial(browser);
        try {
          const editorialResult = await auditRoute(editorialPage, surface, editorialRoute);
          if (await editorialPage.getByRole("heading", { name: "Submit editorial research" }).count() === 0) {
            editorialResult.failures.push("authorized editorial fixture cannot see the submission workspace");
          }
          results.push(editorialResult);
          report.totals.routes += 1;
          report.totals.controls += editorialResult.controls;
          report.totals.focusedControls += editorialResult.focusedControls;
          report.totals.failures += editorialResult.failures.length;
        } finally {
          await editorialContext.close();
        }
      }
    } finally {
      await context.close();
    }
    report.surfaces[surface] = { routes: results.length, results, authorizationResults };
  }
} finally {
  await browser.close();
}

await writeFile(path.join(evidenceDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");

const failures = Object.entries(report.surfaces).flatMap(([surface, details]) =>
  [
    ...details.results.map((result) => ({ ...result, identity: surface })),
    ...(details.authorizationResults ?? []).map((result) => ({ ...result, identity: `${surface} ${result.persona}` })),
  ].flatMap((result) => result.failures.map((failure) => `${result.identity} ${result.route}: ${failure}`)),
);

process.stdout.write(`${JSON.stringify({
  v1_ui_control_qualification: failures.length === 0 ? "pass" : "fail",
  routes: report.totals.routes,
  controls: report.totals.controls,
  focusedControls: report.totals.focusedControls,
  failures: failures.length,
})}\n`);

assert.deepEqual(failures, [], `V1 UI control qualification failures:\n${failures.join("\n")}`);
