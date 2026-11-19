import { describe, expect, it } from "vitest";

import { companyQuery, companySlug, publicCompanyProfile, publicCompanySummary } from "./schema";

const approvedCompany = {
  slug: "example-industries",
  name: "Example Industries",
  summary: "A source-backed editorial profile used only in an isolated unit test.",
  industry: "Manufacturing",
  headquarters: "India",
  websiteUrl: "https://example.org",
  overview: "Editorially reviewed background.",
  disclosureKind: "NONE",
  disclosureText: null,
  sources: [{ label: "Public source", url: "https://example.org/about", capturedAt: "2026-11-18T00:00:00Z" }],
  approvedAt: "2026-11-18T00:00:00Z",
} as const;

describe("V1.1 PN-01 public projection boundary", () => {
  it("accepts a source-backed approved profile", () => {
    expect(publicCompanyProfile.safeParse(approvedCompany).success).toBe(true);
  });

  it("rejects private CRM or contact fields even on an otherwise valid profile", () => {
    expect(publicCompanyProfile.safeParse({ ...approvedCompany, leadScore: 99 }).success).toBe(false);
    expect(publicCompanyProfile.safeParse({ ...approvedCompany, contactEmail: "private@example.org" }).success).toBe(false);
    expect(publicCompanySummary.safeParse({ slug: approvedCompany.slug, name: approvedCompany.name, summary: approvedCompany.summary, industry: null, headquarters: null, disclosureKind: "NONE", ownerOrganizationId: "private" }).success).toBe(false);
  });

  it("rejects unsourced, unsafe and sponsored profiles without disclosure", () => {
    expect(publicCompanyProfile.safeParse({ ...approvedCompany, sources: [] }).success).toBe(false);
    expect(publicCompanyProfile.safeParse({ ...approvedCompany, sources: [{ ...approvedCompany.sources[0], url: "javascript:alert(1)" }] }).success).toBe(false);
    expect(publicCompanyProfile.safeParse({ ...approvedCompany, websiteUrl: "https://username:password@example.org" }).success).toBe(false);
    expect(publicCompanyProfile.safeParse({ ...approvedCompany, disclosureKind: "SPONSORED" }).success).toBe(false);
    expect(publicCompanyProfile.safeParse({ ...approvedCompany, disclosureKind: "SPONSORED", disclosureText: "This company profile was commissioned." }).success).toBe(true);
  });

  it("rejects unsafe identifiers and oversized search terms", () => {
    for (const slug of ["../../crm", "UPPER", "x", "with space", "admin%2Fusers"]) {
      expect(companySlug.safeParse(slug).success).toBe(false);
    }
    expect(companySlug.safeParse("example-industries").success).toBe(true);
    expect(companyQuery.safeParse("a".repeat(81)).success).toBe(false);
  });
});
