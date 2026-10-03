import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { publicAliases } from "./public-aliases";

describe("public navigation aliases", () => {
  it("points every alias at a page that exists", () => {
    expect(new Set(publicAliases.map((alias) => alias.source)).size).toBe(publicAliases.length);
    for (const alias of publicAliases) {
      expect(alias.source).not.toBe(alias.destination);
      const page = join(process.cwd(), "src/app", alias.destination.replace(/^\//u, ""), "page.tsx");
      expect(existsSync(page), alias.destination).toBe(true);
    }
  });
});
