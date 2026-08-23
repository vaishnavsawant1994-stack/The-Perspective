import { allowedSeedOrganizationIds } from "./stable-ids";

export interface ExistingOrganizationIdentifier {
  readonly id: string;
  readonly slug: string;
}

export function findUnknownSeedOrganizations(
  organizations: readonly ExistingOrganizationIdentifier[],
) {
  return organizations.filter(
    ({ id }) => !allowedSeedOrganizationIds.has(id),
  );
}

export function assertKnownSeedOrganizations(
  organizations: readonly ExistingOrganizationIdentifier[],
) {
  const unknown = findUnknownSeedOrganizations(organizations);

  if (unknown.length > 0) {
    throw new Error(
      `Refusing deterministic demo seed because the database contains unknown organizations: ${unknown.map(({ slug }) => slug).join(", ")}`,
    );
  }
}
