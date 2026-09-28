import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function pages(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return pages(path);
    return name === "page.tsx" ? [path] : [];
  });
}

describe("R6 Team Workspace UUID inventory", () => {
  const appPages = pages(join(process.cwd(), "src/app/app"));

  it("has no dynamic UUID detail routes under the Team Workspace", () => {
    const dynamic = appPages.filter((path) => path.includes("["));
    expect(dynamic).toEqual([]);
  });

  it("does not invent deal or client UUID pages", () => {
    expect(
      appPages.some((path) => path.includes("[dealId]") || path.includes("[clientAccountId]")),
    ).toBe(false);
  });
});
