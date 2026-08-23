import "server-only";

import { getSecurityBoundaryConfiguration } from "./security-boundary";

export type SecretName = string & { readonly __brand: "SecretName" };

/** Implementations must resolve secrets only inside the server runtime. */
export interface ServerSecretResolver {
  resolveSecret(name: SecretName): Promise<string | undefined>;
}

/** Server-only configuration; never serialize this object into client props. */
export const serverSecurityBoundary = getSecurityBoundaryConfiguration(process.env);
