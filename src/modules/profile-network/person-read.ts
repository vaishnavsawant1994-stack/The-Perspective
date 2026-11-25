import "server-only";

import { getPrismaClient } from "@/modules/persistence/client";
import { companySlug } from "./schema";
import {
  companyQuery, publicPersonProfile, publicPersonRelationship,
  publicPersonSummary, type PublicPersonKind, type PublicPersonProfile,
  type PublicPersonRelationship, type PublicPersonSummary,
} from "./person-schema";

async function read(fn: "pn02_public_person" | "pn02_public_person_directory" | "pn02_public_relationships", kind: PublicPersonKind, input: string) {
  const database = getPrismaClient();
  const rows = await database.$transaction(async (tx) => {
    await tx.$executeRawUnsafe("SET LOCAL ROLE perspective_public");
    await tx.$queryRaw`SELECT set_config('app.organization_id', '', true)`;
    return tx.$queryRawUnsafe<Array<{ result: unknown }>>(
      `SELECT profiles.${fn}($1::text,$2::text) AS result`,
      kind, input,
    );
  });
  return rows[0]?.result ?? null;
}

export async function publicPersonExists(kind: PublicPersonKind, slug: string): Promise<boolean> {
  if (!companySlug.safeParse(slug).success) return false;
  const database = getPrismaClient();
  const rows = await database.$transaction(async (tx) => {
    await tx.$executeRawUnsafe("SET LOCAL ROLE perspective_public");
    await tx.$queryRaw`SELECT set_config('app.organization_id', '', true)`;
    return tx.$queryRawUnsafe<Array<{ exists: boolean }>>(
      "SELECT profiles.pn02_public_person($1::text,$2::text) IS NOT NULL AS exists",
      kind,
      slug,
    );
  });
  return rows[0]?.exists === true;
}

export async function getPublicPerson(kind: PublicPersonKind, slug: string): Promise<PublicPersonProfile | null> {
  if (!companySlug.safeParse(slug).success) return null;
  const value = await read("pn02_public_person", kind, slug);
  const parsed = publicPersonProfile.safeParse(value);
  return parsed.success && parsed.data.kind === kind && parsed.data.slug === slug ? parsed.data : null;
}

export async function searchPublicPeople(kind: PublicPersonKind, query = ""): Promise<PublicPersonSummary[]> {
  const q = companyQuery.safeParse(query);
  if (!q.success) return [];
  const rows = await read("pn02_public_person_directory", kind, q.data);
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row) => {
    const parsed = publicPersonSummary.safeParse(row);
    return parsed.success && parsed.data.kind === kind ? [parsed.data] : [];
  });
}

export async function getPublicPersonRelationships(kind: PublicPersonKind, slug: string): Promise<PublicPersonRelationship[]> {
  if (!companySlug.safeParse(slug).success) return [];
  const value = await read("pn02_public_relationships", kind, slug);
  if (!Array.isArray(value)) return [];
  return value.flatMap((row) => {
    const parsed = publicPersonRelationship.safeParse(row);
    return parsed.success ? [parsed.data] : [];
  });
}
