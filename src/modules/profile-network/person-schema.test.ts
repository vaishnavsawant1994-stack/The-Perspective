import { describe, expect, it } from "vitest";
import { publicPersonProfile, publicPersonSummary, publicPersonRelationship } from "./person-schema";

const valid = {
  slug: "sample-editor",
  kind: "EDITOR",
  name: "Sample Editor",
  headline: "Editor of independent reporting",
  summary: "A unit-test-only source-backed editor biography for V1.1.",
  organizationName: "Editorial team",
  biography: "This is not a public editorial profile.",
  websiteUrl: "https://example.org",
  disclosureKind: "NONE",
  disclosureText: null,
  sources: [{ label: "Editorial bio", url: "https://example.org/bio", capturedAt: "2026-11-18T13:00:00Z" }],
  coverage: [{ title: "An independently published example story", href: "/article/example-story", kind: "ARTICLE" }],
  approvedAt: "2026-11-18T13:00:00Z",
};

describe("V1.1 PN-02 public editorial person projection", () => {
  it("allows explicit sourced editorial projection", () => {
    expect(publicPersonProfile.safeParse(valid).success).toBe(true);
  });
  it("fails closed for private account, CRM and unreviewed content", () => {
    expect(publicPersonProfile.safeParse({ ...valid, phone: "private" }).success).toBe(false);
    expect(publicPersonSummary.safeParse({ ...valid, accountId: "hidden" }).success).toBe(false);
    expect(publicPersonProfile.safeParse({ ...valid, sources: [] }).success).toBe(false);
  });
  it("blocks unsafe links and sponsorship without disclosure", () => {
    expect(publicPersonProfile.safeParse({ ...valid, websiteUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(publicPersonProfile.safeParse({ ...valid, coverage: [{ title: "Malicious", href: "//unsafe.test", kind: "ARTICLE" }] }).success).toBe(false);
    expect(publicPersonProfile.safeParse({ ...valid, coverage: [{ title: "Malicious", href: "/client/billing", kind: "ARTICLE" }] }).success).toBe(false);
    expect(publicPersonProfile.safeParse({ ...valid, disclosureKind: "SPONSORED" }).success).toBe(false);
    expect(publicPersonProfile.safeParse({ ...valid, disclosureKind: "SPONSORED", disclosureText: "This published profile was commissioned." }).success).toBe(true);
  });
  it("accepts only reviewed company relationship projections", () => {
    const safe = { companySlug: "example-company", companyName: "Example Company", role: "Former employee", sourceUrl: "https://example.org/history", reviewedAt: "2026-11-18T13:00:00Z" };
    expect(publicPersonRelationship.safeParse(safe).success).toBe(true);
    expect(publicPersonRelationship.safeParse({ ...safe, contactEmail: "private@example.org" }).success).toBe(false);
    expect(publicPersonRelationship.safeParse({ ...safe, sourceUrl: "http://example.org" }).success).toBe(false);
  });
});
