import "server-only";

import { getPrismaClient } from "@/modules/persistence/client";

import { companyQuery, companySlug, publicCompanyProfile, publicCompanySummary, type PublicCompanyProfile, type PublicCompanySummary } from "./schema";

async function publicQuery(functionName: "pn01_public_company" | "pn01_public_directory", argument: string): Promise<unknown> {
  const database = getPrismaClient();
  // The role has EXECUTE on the allowlisted functions, but no SELECT on
  // profiles tables or private CRM. Setting tenant context cannot widen it.
  const rows = await database.$transaction(async (transaction) => {
    await transaction.$executeRawUnsafe("SET LOCAL ROLE perspective_public");
    await transaction.$queryRaw`SELECT set_config('app.organization_id', '', true)`;
    return transaction.$queryRawUnsafe<Array<{ result: unknown }>>(
      `SELECT profiles.${functionName}($1::text) AS result`,
      argument,
    );
  });
  return rows[0]?.result ?? null;
}

export async function getPublicCompany(slug: string): Promise<PublicCompanyProfile | null> {
  if (!companySlug.safeParse(slug).success) return null;
  const value = await publicQuery("pn01_public_company", slug);
  const parsed = publicCompanyProfile.safeParse(value);
  return parsed.success && parsed.data.slug === slug ? parsed.data : null;
}

export async function searchPublicCompanies(query = ""): Promise<PublicCompanySummary[]> {
  const parsedQuery = companyQuery.safeParse(query);
  if (!parsedQuery.success) return [];
  const value = await publicQuery("pn01_public_directory", parsedQuery.data);
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    const parsed = publicCompanySummary.safeParse(entry);
    return parsed.success ? [parsed.data] : [];
  });
}
