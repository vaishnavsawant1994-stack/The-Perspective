import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("public controls do not claim unavailable success", () => {
  it("does not enroll a newsletter address locally", () => {
    const form = source("src/components/layout/newsletter-form.tsx");
    expect(form).not.toContain("You’re on the list");
    expect(form).toContain("Email delivery is not configured");
  });

  it("does not create a public account in browser storage", () => {
    const form = source("src/components/auth/auth-forms.tsx");
    expect(form).not.toContain("perspective-pending-member");
    expect(form).not.toContain("Account created");
    expect(form).toContain("Public account creation is not available");
  });

  it("does not describe contact delivery as routed", () => {
    const route = source("src/app/api/contact/route.ts");
    expect(route).not.toContain("routed to the appropriate");
    expect(route).toContain("Enquiry delivery is not configured");
  });
});
