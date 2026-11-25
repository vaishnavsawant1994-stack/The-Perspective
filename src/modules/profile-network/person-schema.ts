import { z } from "zod";
import { companyQuery, companySlug } from "./schema";

export const personKind = z.enum(["PROFESSIONAL", "EDITOR"]);
const httpsUrl = z.string().url().refine((raw) => {
  const value = new URL(raw);
  return value.protocol === "https:" && !value.username && !value.password;
}, "Only HTTPS links without embedded credentials are public.");

const personSummaryBase = z.object({
  slug: companySlug,
  kind: personKind,
  name: z.string().min(2).max(180),
  headline: z.string().max(200).nullable(),
  summary: z.string().min(12).max(800),
  organizationName: z.string().max(180).nullable(),
  disclosureKind: z.enum(["NONE", "SPONSORED", "COMMISSIONED"]),
}).strict();

export const publicPersonSummary = personSummaryBase;

export const publicPersonProfile = personSummaryBase.extend({
  biography: z.string().max(8000).nullable(),
  websiteUrl: httpsUrl.nullable(),
  disclosureText: z.string().max(1000).nullable(),
  sources: z.array(z.object({
    label: z.string().min(2).max(180),
    url: httpsUrl,
    capturedAt: z.string().datetime({ offset: true }),
  }).strict()).min(1).max(40),
  coverage: z.array(z.object({
    title: z.string().min(2).max(200),
    href: z.string().regex(/^\/(?:article|magazine\/read|podcasts|videos)\/[a-z0-9]+(?:-[a-z0-9]+)*$/u),
    kind: z.enum(["ARTICLE","INTERVIEW","MAGAZINE","PODCAST","VIDEO"]),
  }).strict()).max(50),
  approvedAt: z.string().datetime({ offset: true }),
}).strict().superRefine((value, context) => {
  if (value.disclosureKind !== "NONE" && (!value.disclosureText || value.disclosureText.trim().length < 10)) {
    context.addIssue({ code: "custom", path: ["disclosureText"], message: "A commercial relationship needs a public explanation." });
  }
});

export const publicPersonRelationship = z.object({
  companySlug: companySlug,
  companyName: z.string().min(2).max(180),
  role: z.string().min(2).max(160),
  sourceUrl: httpsUrl,
  reviewedAt: z.string().datetime({ offset: true }),
}).strict();

export { companyQuery };
export type PublicPersonKind = z.infer<typeof personKind>;
export type PublicPersonProfile = z.infer<typeof publicPersonProfile>;
export type PublicPersonSummary = z.infer<typeof publicPersonSummary>;
export type PublicPersonRelationship = z.infer<typeof publicPersonRelationship>;
