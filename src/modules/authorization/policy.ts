import "server-only";

import type {
  AuthorizedRequestContext,
  EffectiveAuthorizationGrant,
  PermissionKey,
} from "@/modules/foundation/request-context";

import { parseRolePermissionConstraints } from "./constraints";
import {
  getPermissionDefinition,
  isCanonicalPermissionKey,
  type CanonicalPermissionKey,
} from "./registry";
import {
  getR6FieldPolicy,
  getR6PermissionBinding,
  isR6ActivePermissionKey,
} from "./r6-policy";
import {
  getR7FieldPolicy,
  getR7PermissionBinding,
  isR7ActivePermissionKey,
} from "./r7-policy";
import type {
  AuthorizationCommandContext,
  AuthorizationDecision,
  AuthorizationObligation,
  AuthorizationResourceContext,
  AuthorizationScope,
  RolePermissionConstraints,
  SensitivityLevel,
} from "./types";

const DEFAULT_ACTIVE_STAGES = new Set(["R5", "R6", "R7"]);
