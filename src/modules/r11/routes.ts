import "server-only";

import { z } from "zod";

import { withCommercialTenantTransaction } from "@/modules/commercial/persistence";
import type { AuthorizedRequestContext } from "@/modules/foundation/request-context";

import { r11Invalid, teamCommand, teamRead } from "./http";

const uuid = z.string().uuid();
const row = z.number().int().positive();
const span = z.object({
  family: z.enum(["CONTENT", "DISTRIBUTION", "GROWTH"]),
  from: z.string().datetime(),
  to: z.string().datetime(),
}).strict();

function rows(context: AuthorizedRequestContext, sql: string) {
  return withCommercialTenantTransaction(context, (transaction) =>
    transaction.$queryRawUnsafe<Array<Record<string, unknown>>>(sql),
  );
}

function id(value: string) {
  return z.string().uuid().safeParse(value).success;
}

export function analyticsList(request: Request) {
  return teamRead(request, "analytics.distribution.view", "growth-observation", (context) =>
    rows(context, `SELECT
      (SELECT count(*)::int FROM growth.observations) AS observations,
      (SELECT count(*)::int FROM distribution.delivery_evidence) AS deliveries,
      (SELECT count(*)::int FROM growth.search_documents) AS "indexedDocuments"`));
}

export function reportList(request: Request) {
  return teamRead(request, "report.view", "growth-report", (context) =>
    rows(context, `SELECT id, family, state, snapshot, row_version AS "rowVersion" FROM growth.report_runs ORDER BY created_at DESC LIMIT 50`));
}

export function createReport(request: Request) {
  return teamCommand(request, "report.create", "growth-report", "create", "create-report", span);
}

export function approveReport(request: Request, reportId: string) {
  if (!id(reportId)) return r11Invalid();
  return teamCommand(
    request,
    "report.approve",
    "growth-report",
    "approve",
    "approve-report",
    z.object({ expectedRowVersion: row }).strict().transform((value) => ({ ...value, reportId })),
    { sod: true },
  );
}

export function signalList(request: Request) {
  return teamRead(request, "renewal.view", "growth-signal", (context) =>
    rows(context, `SELECT id, kind, state, reason, row_version AS "rowVersion" FROM growth.signals ORDER BY created_at DESC LIMIT 50`));
}

export function openRenewal(request: Request) {
  return teamCommand(request, "renewal.edit", "growth-signal", "open", "open-renewal", z.object({ contractId: uuid }).strict());
}

export function openUpsell(request: Request) {
  return teamCommand(request, "renewal.edit", "growth-signal", "open", "open-upsell", z.object({ clientAccountId: uuid }).strict());
}

export function reviewSignal(request: Request, signalId: string) {
  if (!id(signalId)) return r11Invalid();
  return teamCommand(request, "renewal.manage", "growth-signal", "review", "review-signal", z.object({ expectedRowVersion: row }).strict().transform((value) => ({ ...value, signalId })));
}

export function actSignal(request: Request, signalId: string) {
  if (!id(signalId)) return r11Invalid();
  return teamCommand(request, "renewal.manage", "growth-signal", "act", "act-signal", z.object({ expectedRowVersion: row }).strict().transform((value) => ({ ...value, signalId })));
}

export function ruleList(request: Request) {
  return teamRead(request, "renewal.view", "automation-rule", (context) =>
    rows(context, `SELECT id, name, state, action_name AS action, row_version AS "rowVersion" FROM growth.automation_rules ORDER BY created_at DESC LIMIT 50`));
}

export function createRule(request: Request) {
  return teamCommand(request, "renewal.manage", "automation-rule", "create", "create-rule", z.object({
    name: z.string().trim().min(1).max(200),
    trigger: z.enum(["DISTRIBUTION_RECORDED", "SIGNAL_OPEN"]),
    field: z.enum(["delivery_count", "open_signal_count"]),
    operator: z.enum(["GT", "EQ"]),
    threshold: z.number().int().min(0).max(1_000_000),
  }).strict());
}

export function setRule(request: Request, ruleId: string) {
  if (!id(ruleId)) return r11Invalid();
  return teamCommand(request, "renewal.manage", "automation-rule", "enable", "set-rule", z.object({
    enabled: z.boolean(),
    expectedRowVersion: row,
  }).strict().transform((value) => ({ ...value, ruleId })));
}
