import { z } from "zod";

// Only source-backed editorial projections may be sent to public pages.
// CRM/contact/client data cannot be projected by these strict schemas.
const httpsUrl = z.string().url().refine((value) => {
  const url = new URL(value);
  return url.protocol === "https:" && !url.username && !url.password;
}, "A public link must use HTTPS without embedded credentials.");

export const companySlug = z.string().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u);
export const companyQuery = z.string().trim().max(80);

const companyBase = z.object({
  slug: companySlug,
  name: z.string().min(2).max(180),
  summary: z.string().min(12).max(800),
  industry: z.string().max(120).nullable(),
  headquarters: z.string().max(160).nullable(),
  disclosureKind: z.enum(["NONE", "SPONSORED", "COMMISSIONED"]),
}).strict();

export const publicCompanySummary = companyBase;

export const publicCompanyProfile = companyBase.extend({
  websiteUrl: httpsUrl.nullable(),
  overview: z.string().max(6000).nullable(),
  disclosureText: z.string().max(1000).nullable(),
  sources: z.array(z.object({
    label: z.string().min(2).max(180),
    url: httpsUrl,
    capturedAt: z.string().datetime({ offset: true }),
  }).strict()).min(1).max(40),
  approvedAt: z.string().datetime({ offset: true }),
}).strict().superRefine((value, context) => {
  if (value.disclosureKind !== "NONE" && (!value.disclosureText || value.disclosureText.trim().length < 10)) {
    context.addIssue({ code: "custom", path: ["disclosureText"], message: "Commercial profiles must display a disclosure." });
  }
});

export type PublicCompanySummary = z.infer<typeof publicCompanySummary>;
export type PublicCompanyProfile = z.infer<typeof publicCompanyProfile>;
