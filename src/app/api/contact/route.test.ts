import { describe, expect, it } from "vitest";

import { POST } from "./route";

function enquiry(overrides: Record<string, string> = {}) {
  const form = new FormData();
  form.set("enquiryType", "editorial");
  form.set("name", "Qualification Reader");
  form.set("email", "reader@example.com");
  form.set("subject", "A real question");
  form.set("message", "This is a qualification enquiry that must not be treated as delivered.");
  form.set("accepted", "on");
  for (const [key, value] of Object.entries(overrides)) form.set(key, value);
  return form;
}

describe("contact enquiry delivery", () => {
  it("rejects an incomplete enquiry", async () => {
    const response = await POST(new Request("http://127.0.0.1/api/contact", { method: "POST", body: enquiry({ message: "too short" }) }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
  });

  it("does not claim a complete enquiry was routed or stored", async () => {
    const response = await POST(new Request("http://127.0.0.1/api/contact", { method: "POST", body: enquiry() }));
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.reference).toBeUndefined();
    expect(String(body.message)).toMatch(/not configured/i);
    expect(String(body.message)).not.toMatch(/routed/i);
  });
});
