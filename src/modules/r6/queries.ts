import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type { AuthorizedRequestContext } from "@/modules/foundation/request-context";
import { evaluateAuthorization } from "@/modules/authorization/policy";
import type { AuthorizationResourceContext } from "@/modules/authorization/types";
import { getPrismaClient } from "@/modules/persistence/client";

const OVERFETCH_FACTOR = 4;

export function projectR6ReadableFields<T extends Readonly<Record<string, unknown>>>(
  value: T,
  readableFields: readonly string[],
) {
  const allowed = new Set(readableFields);
  return Object.fromEntries(
    Object.entries(value).filter(([field]) => allowed.has(field)),
  ) as Partial<T>;
}
