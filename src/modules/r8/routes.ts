import "server-only";

import { z } from "zod";

import { authorizationProblem } from "@/modules/authorization/http";
import { withCommercialTenantTransaction } from "@/modules/commercial/persistence";
import type { AuthorizedRequestContext } from "@/modules/foundation/request-context";

import { clientDecision, teamCommand, teamRead } from "./http";

const uuid = z.string().uuid();
const title = z.string().trim().min(1).max(200);
const row = z.number().int().positive();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/u);

const workflowOk = { workflowSatisfied: true };
const versioned = {
  workflowSatisfied: true,
  exactVersionMatches: true,
  separationOfDutySatisfied: true,
};

async function rows(context: AuthorizedRequestContext, sql: string, values: readonly unknown[] = []) {
  return withCommercialTenantTransaction(context, async (transaction) => {
    return transaction.$queryRawUnsafe<Array<Record<string, unknown>>>(sql, ...values);
  });
}

function missing() {
  return authorizationProblem(404, "AUTHZ_NOT_FOUND");
}

async function projectExists(context: AuthorizedRequestContext, projectId: string) {
  const found = await rows(context, `SELECT id FROM production.projects WHERE id = $1::uuid`, [projectId]);
  return found.length > 0;
}

export function listProjects(request: Request) {
  return teamRead(request, "project.view", "project", (context) =>
    rows(
      context,
      `SELECT id, title, state, row_version AS "rowVersion", proposal_id AS "proposalId"
         FROM production.projects
        ORDER BY created_at DESC
        LIMIT 100`,
    ),
  );
}

export function projectDetail(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return bind(context, (projectId) => teamRead(request, "project.view", "project", async (actor) => {
    const found = await rows(
      actor,
      `SELECT id, title, state, row_version AS "rowVersion", proposal_id AS "proposalId"
         FROM production.projects WHERE id = $1::uuid`,
      [projectId],
    );
    return found[0] ?? missing();
  }));
}

export function createProject(request: Request) {
  return teamCommand(
    request,
    "project.create",
    "project",
    "create",
    "create-project",
    z.object({ proposalId: uuid, title }).strict(),
    ["proposalId", "title"],
  );
}

export function editProject(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return bind(context, (projectId) => teamCommand(
    request,
    "project.manage",
    "project",
    "update",
    "edit-project",
    z.object({ title, expectedRowVersion: row }).strict().transform((value) => ({ ...value, projectId })),
    ["title"],
  ));
}

export function cancelProject(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return bind(context, (projectId) => teamCommand(
    request,
    "project.manage",
    "project",
    "cancel",
    "cancel-project",
    z.object({ reason: z.string().trim().min(1).max(500), expectedRowVersion: row }).strict().transform((value) => ({ ...value, projectId })),
  ));
}

export function assignMember(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return bind(context, (projectId) => teamCommand(
    request,
    "project.assign",
    "project",
    "assign",
    "assign-member",
    z.object({ membershipId: uuid, projectRole: z.enum(["LEAD", "EDITOR", "PRODUCER", "CONTRIBUTOR", "CLIENT_CONTACT"]) }).strict().transform((value) => ({ ...value, projectId })),
    [],
    workflowOk,
  ));
}

export function endMember(request: Request, context: { params: Promise<{ projectId: string; membershipId: string }> }) {
  return bindPair(context, (projectId, membershipId) => teamCommand(
    request,
    "project.assign",
    "project",
    "end",
    "end-member",
    z.object({ expectedRowVersion: row }).strict().transform((value) => ({ ...value, projectId, membershipId })),
    [],
    workflowOk,
  ));
}

export function projectActivity(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return bind(context, (projectId) => teamRead(request, "project.activity.view", "project", async (actor) => {
    if (!(await projectExists(actor, projectId))) return missing();
    return rows(
      actor,
      `SELECT to_state AS "state", occurred_at AS "occurredAt"
         FROM production.project_transitions
        WHERE project_id = $1::uuid
        ORDER BY occurred_at`,
      [projectId],
    );
  }));
}

export function transitionProject(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return bind(context, (projectId) => teamCommand(
    request,
    "workflow.move",
    "project",
    "transition",
    "transition",
    z.object({ expectedState: z.string().trim().min(1).max(40), expectedRowVersion: row }).strict().transform((value) => ({ ...value, projectId })),
    [],
    versioned,
  ));
}

export function readQuestionnaire(request: Request, context: { params: Promise<{ projectId: string; questionnaireId: string }> }) {
  return bindPair(context, (projectId, questionnaireId) => teamRead(request, "questionnaire.view", "questionnaire", async (actor) => {
    const found = await rows(
      actor,
      `SELECT id, title, status, row_version AS "rowVersion", current_version_id AS "currentVersionId"
         FROM production.questionnaires
        WHERE id = $1::uuid AND project_id = $2::uuid`,
      [questionnaireId, projectId],
    );
    return found[0] ?? missing();
  }));
}

export function createQuestionnaire(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return bind(context, (projectId) => teamCommand(
    request,
    "questionnaire.edit",
    "questionnaire",
    "create",
    "create-questionnaire",
    z.object({ title }).strict().transform((value) => ({ ...value, projectId })),
    ["title"],
  ));
}

export function generateQuestionnaire(request: Request, context: { params: Promise<{ questionnaireId: string }> }) {
  return bindId(context, "questionnaireId", (questionnaireId) => teamCommand(
    request,
    "questionnaire.edit",
    "questionnaire",
    "generate",
    "generate-questionnaire",
    z.object({ expectedRowVersion: row }).strict().transform((value) => ({ ...value, questionnaireId })),
  ));
}

export function sendQuestionnaire(request: Request, context: { params: Promise<{ questionnaireId: string }> }) {
  return bindId(context, "questionnaireId", (questionnaireId) => teamCommand(
    request,
    "questionnaire.edit",
    "questionnaire",
    "send",
    "send-questionnaire",
    z.object({ versionId: uuid, expectedRowVersion: row }).strict().transform((value) => ({ ...value, questionnaireId })),
  ));
}

export function receiveQuestionnaire(request: Request, context: { params: Promise<{ questionnaireId: string }> }) {
  return bindId(context, "questionnaireId", (questionnaireId) => teamCommand(
    request,
    "questionnaire.edit",
    "questionnaire",
    "receive",
    "receive-questionnaire",
    z.object({ versionId: uuid, body: z.string().trim().min(1).max(8000), expectedRowVersion: row }).strict().transform((value) => ({ ...value, questionnaireId })),
  ));
}

export function lockQuestionnaire(request: Request, context: { params: Promise<{ questionnaireId: string }> }) {
  return bindId(context, "questionnaireId", (questionnaireId) => teamCommand(
    request,
    "questionnaire.edit",
    "questionnaire",
    "lock",
    "lock-questionnaire",
    z.object({ expectedRowVersion: row }).strict().transform((value) => ({ ...value, questionnaireId })),
  ));
}

export function listTasks(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return bind(context, (projectId) => teamRead(request, "task.view", "task", async (actor) => {
    if (!(await projectExists(actor, projectId))) return missing();
    return rows(
      actor,
      `SELECT id, title, status, priority, due_date AS "dueDate", row_version AS "rowVersion"
         FROM production.tasks WHERE project_id = $1::uuid ORDER BY created_at`,
      [projectId],
    );
  }));
}

export function createTask(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return bind(context, (projectId) => teamCommand(
    request,
    "task.edit",
    "task",
    "create",
    "create-task",
    z.object({
      title,
      priority: z.enum(["LOW", "NORMAL", "HIGH"]).default("NORMAL"),
      dueDate: date.optional(),
      blockerTaskId: uuid.optional(),
      milestoneId: uuid.optional(),
    }).strict().transform((value) => ({ ...value, projectId })),
    ["title", "priority", "dueDate"],
  ));
}

export function editTask(request: Request, context: { params: Promise<{ taskId: string }> }) {
  return bindId(context, "taskId", (taskId) => teamCommand(
    request,
    "task.edit",
    "task",
    "update",
    "edit-task",
    z.object({ title, priority: z.enum(["LOW", "NORMAL", "HIGH"]), dueDate: date.optional(), expectedRowVersion: row }).strict().transform((value) => ({ ...value, taskId })),
    ["title", "priority", "dueDate"],
  ));
}

export function assignTask(request: Request, context: { params: Promise<{ taskId: string }> }) {
  return bindId(context, "taskId", (taskId) => teamCommand(
    request,
    "task.edit",
    "task",
    "assign",
    "assign-task",
    z.object({ membershipId: uuid, expectedRowVersion: row }).strict().transform((value) => ({ ...value, taskId })),
  ));
}

export function completeTask(request: Request, context: { params: Promise<{ taskId: string }> }) {
  return bindId(context, "taskId", (taskId) => teamCommand(
    request,
    "task.edit",
    "task",
    "complete",
    "complete-task",
    z.object({ expectedRowVersion: row }).strict().transform((value) => ({ ...value, taskId })),
  ));
}

export function listMilestones(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return bind(context, (projectId) => teamRead(request, "project.view", "milestone", async (actor) => {
    if (!(await projectExists(actor, projectId))) return missing();
    return rows(
      actor,
      `SELECT id, kind, completed_at AS "completedAt", row_version AS "rowVersion"
         FROM production.milestones WHERE project_id = $1::uuid`,
      [projectId],
    );
  }));
}

export function createMilestone(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return bind(context, (projectId) => teamCommand(
    request,
    "project.manage",
    "milestone",
    "create",
    "create-milestone",
    z.object({ kind: z.enum(["INTERVIEW_COMPLETE", "DRAFT_COMPLETE", "EDITORIAL_REVIEW_COMPLETE", "CLIENT_APPROVAL", "ASSETS_COMPLETE", "DESIGN_COMPLETE", "PUBLICATION_READY"]) }).strict().transform((value) => ({ ...value, projectId })),
    ["kind"],
  ));
}

export function completeMilestone(request: Request, context: { params: Promise<{ milestoneId: string }> }) {
  return bindId(context, "milestoneId", (milestoneId) => teamCommand(
    request,
    "project.manage",
    "milestone",
    "complete",
    "complete-milestone",
    z.object({ expectedRowVersion: row }).strict().transform((value) => ({ ...value, milestoneId })),
  ));
}

export function listDeliverables(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return bind(context, (projectId) => teamRead(request, "project.view", "deliverable", async (actor) => {
    if (!(await projectExists(actor, projectId))) return missing();
    return rows(
      actor,
      `SELECT id, kind, target_type AS "targetType", target_id AS "targetId", completed_at AS "completedAt", row_version AS "rowVersion"
         FROM production.deliverables WHERE project_id = $1::uuid`,
      [projectId],
    );
  }));
}

export function createDeliverable(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return bind(context, (projectId) => teamCommand(
    request,
    "project.manage",
    "deliverable",
    "create",
    "create-deliverable",
    z.object({
      kind: z.enum(["QUESTIONNAIRE", "DRAFT", "EDITORIAL_REVIEW", "CLIENT_APPROVAL", "ASSET_SET", "DESIGN", "PUBLICATION_HANDOFF"]),
      targetType: z.string().trim().min(1).max(40),
      targetId: uuid,
    }).strict().transform((value) => ({ ...value, projectId })),
    ["kind", "targetId"],
  ));
}

export function completeDeliverable(request: Request, context: { params: Promise<{ deliverableId: string }> }) {
  return bindId(context, "deliverableId", (deliverableId) => teamCommand(
    request,
    "project.manage",
    "deliverable",
    "complete",
    "complete-deliverable",
    z.object({ expectedRowVersion: row }).strict().transform((value) => ({ ...value, deliverableId })),
  ));
}

export function readDraft(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return bind(context, (projectId) => teamRead(request, "draft.view", "draft", async (actor) => {
    const found = await rows(
      actor,
      `SELECT draft.id, draft.body, draft.row_version AS "rowVersion"
         FROM production.drafts AS draft
         JOIN production.editorial_works AS work ON work.id = draft.work_id
        WHERE work.project_id = $1::uuid`,
      [projectId],
    );
    if (!found[0]) return missing();
    const versions = await rows(
      actor,
      `SELECT version.id, version.version_number AS "version"
         FROM production.draft_versions AS version
         JOIN production.drafts AS draft ON draft.id = version.draft_id
         JOIN production.editorial_works AS work ON work.id = draft.work_id
        WHERE work.project_id = $1::uuid
        ORDER BY version.version_number`,
      [projectId],
    );
    return { draft: found[0], versions };
  }));
}

export function readVersion(request: Request, context: { params: Promise<{ versionId: string }> }) {
  return bindId(context, "versionId", (versionId) => teamRead(request, "draft.view", "draft-version", async (actor) => {
    const found = await rows(
      actor,
      `SELECT id, version_number AS "version", body
         FROM production.draft_versions WHERE id = $1::uuid`,
      [versionId],
    );
    return found[0] ?? missing();
  }));
}

export function createDraft(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return bind(context, (projectId) => teamCommand(
    request,
    "draft.edit",
    "draft",
    "create",
    "create-draft",
    z.object({}).strict().transform(() => ({ projectId })),
  ));
}

export function editDraft(request: Request, context: { params: Promise<{ draftId: string }> }) {
  return bindId(context, "draftId", (draftId) => teamCommand(
    request,
    "draft.edit",
    "draft",
    "update",
    "edit-draft",
    z.object({ body: z.string().min(1).max(20000), expectedRowVersion: row }).strict().transform((value) => ({ ...value, draftId })),
    ["body"],
  ));
}

export function issueDraft(request: Request, context: { params: Promise<{ draftId: string }> }) {
  return bindId(context, "draftId", (draftId) => teamCommand(
    request,
    "draft.edit",
    "draft",
    "issue",
    "issue-draft",
    z.object({ expectedRowVersion: row }).strict().transform((value) => ({ ...value, draftId })),
  ));
}

export function openReview(request: Request, context: { params: Promise<{ versionId: string }> }) {
  return bindId(context, "versionId", (versionId) => teamCommand(
    request,
    "editorial.review",
    "editorial-review",
    "create",
    "open-review",
    z.object({}).strict().transform(() => ({ versionId })),
    [],
    workflowOk,
  ));
}

export function addNote(request: Request, context: { params: Promise<{ reviewId: string }> }) {
  return bindId(context, "reviewId", (reviewId) => teamCommand(
    request,
    "editorial.review",
    "editorial-review",
    "comment",
    "add-note",
    z.object({ body: z.string().trim().min(1).max(4000) }).strict().transform((value) => ({ ...value, reviewId })),
    [],
    workflowOk,
  ));
}

export function requestChanges(request: Request, context: { params: Promise<{ reviewId: string }> }) {
  return bindId(context, "reviewId", (reviewId) => teamCommand(
    request,
    "editorial.review",
    "editorial-review",
    "request-changes",
    "request-changes",
    z.object({ expectedRowVersion: row }).strict().transform((value) => ({ ...value, reviewId })),
    [],
    workflowOk,
  ));
}

export function resolveReview(request: Request, context: { params: Promise<{ reviewId: string }> }) {
  return bindId(context, "reviewId", (reviewId) => teamCommand(
    request,
    "editorial.review",
    "editorial-review",
    "resolve",
    "resolve-review",
    z.object({ expectedRowVersion: row }).strict().transform((value) => ({ ...value, reviewId })),
    [],
    workflowOk,
  ));
}

export function editorialApprove(request: Request, context: { params: Promise<{ versionId: string }> }) {
  return bindId(context, "versionId", (versionId) => teamCommand(
    request,
    "editorial.approve",
    "draft-version",
    "approve",
    "editorial-approve",
    z.object({}).strict().transform(() => ({ versionId })),
    [],
    versioned,
  ));
}

export function readApproval(request: Request, context: { params: Promise<{ versionId: string }> }) {
  return bindId(context, "versionId", (versionId) => teamRead(request, "approval.view", "draft-version", async (actor) => {
    const found = await rows(
      actor,
      `SELECT decision, decided_at AS "decidedAt"
         FROM production.client_approvals
        WHERE draft_version_id = $1::uuid`,
      [versionId],
    );
    return found[0] ?? missing();
  }));
}

export function decideVersion(request: Request, context: { params: Promise<{ versionId: string }> }) {
  return bindId(context, "versionId", (versionId) => clientDecision(request, versionId));
}

export function readAsset(request: Request, context: { params: Promise<{ projectId: string; assetId: string }> }) {
  return bindPair(context, (projectId, assetId) => teamRead(request, "file.view", "asset", async (actor) => {
    const found = await rows(
      actor,
      `SELECT asset.id, asset.visibility, asset.present, asset.approved, asset.licensed, asset.cleared,
              asset.row_version AS "rowVersion", version.digest, version.byte_size AS "byteSize"
         FROM production.assets AS asset
         JOIN production.asset_versions AS version ON version.asset_id = asset.id
        WHERE asset.id = $1::uuid AND asset.project_id = $2::uuid`,
      [assetId, projectId],
    );
    return found[0] ?? missing();
  }));
}

export function uploadAsset(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return bind(context, (projectId) => teamCommand(
    request,
    "file.version",
    "asset",
    "upload",
    "upload-asset",
    z.object({
      filename: z.string().trim().min(1).max(200),
      digest: z.string().regex(/^[0-9a-f]{64}$/u),
      byteSize: z.number().int().nonnegative(),
    }).strict().transform((value) => ({ ...value, projectId })),
  ));
}

export function setRights(request: Request, context: { params: Promise<{ assetId: string }> }) {
  return bindId(context, "assetId", (assetId) => teamCommand(
    request,
    "file.version",
    "asset",
    "rights",
    "set-rights",
    z.object({ flag: z.enum(["approved", "licensed", "cleared"]), value: z.boolean(), expectedRowVersion: row }).strict().transform((value) => ({ ...value, assetId })),
  ));
}

export function setVisibility(request: Request, context: { params: Promise<{ assetId: string }> }) {
  return bindId(context, "assetId", (assetId) => teamCommand(
    request,
    "file.version",
    "asset",
    "visibility",
    "set-visibility",
    z.object({ visibility: z.enum(["INTERNAL", "CLIENT_VISIBLE"]), expectedRowVersion: row }).strict().transform((value) => ({ ...value, assetId })),
    ["visibility"],
  ));
}

export function listCitations(request: Request, context: { params: Promise<{ versionId: string }> }) {
  return bindId(context, "versionId", (versionId) => teamRead(request, "editorial.view", "citation", (actor) =>
    rows(
      actor,
      `SELECT id, source_label AS "sourceLabel", locator
         FROM production.citations WHERE draft_version_id = $1::uuid`,
      [versionId],
    ),
  ));
}

export function addCitation(request: Request, context: { params: Promise<{ versionId: string }> }) {
  return bindId(context, "versionId", (versionId) => teamCommand(
    request,
    "editorial.review",
    "citation",
    "cite",
    "add-citation",
    z.object({ sourceLabel: z.string().trim().min(1).max(300), locator: z.string().trim().min(1).max(300) }).strict().transform((value) => ({ ...value, versionId })),
    ["sourceLabel", "locator"],
    workflowOk,
  ));
}

export function listFactChecks(request: Request, context: { params: Promise<{ versionId: string }> }) {
  return bindId(context, "versionId", (versionId) => teamRead(request, "editorial.view", "fact-check", (actor) =>
    rows(
      actor,
      `SELECT id, status, reviewer_membership_id AS "reviewerMembershipId"
         FROM production.fact_checks WHERE draft_version_id = $1::uuid`,
      [versionId],
    ),
  ));
}

export function recordFactCheck(request: Request, context: { params: Promise<{ versionId: string }> }) {
  return bindId(context, "versionId", (versionId) => teamCommand(
    request,
    "editorial.review",
    "fact-check",
    "fact-check",
    "record-fact-check",
    z.object({ status: z.enum(["UNVERIFIED", "VERIFIED", "DISPUTED"]), note: z.string().max(2000).optional() }).strict().transform((value) => ({ ...value, versionId })),
    ["status", "note"],
    workflowOk,
  ));
}

export function listCredits(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return bind(context, (projectId) => teamRead(request, "project.view", "credit", async (actor) => {
    if (!(await projectExists(actor, projectId))) return missing();
    return rows(
      actor,
      `SELECT id, person_id AS "personId", credit_role AS "creditRole"
         FROM production.credits WHERE project_id = $1::uuid`,
      [projectId],
    );
  }));
}

export function addCredit(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return bind(context, (projectId) => teamCommand(
    request,
    "project.manage",
    "credit",
    "create",
    "add-credit",
    z.object({ personId: uuid, creditRole: z.enum(["AUTHOR", "EDITOR", "PHOTOGRAPHER", "DESIGNER", "CONTRIBUTOR"]) }).strict().transform((value) => ({ ...value, projectId })),
    ["personId", "creditRole"],
  ));
}

async function bind(context: { params: Promise<{ projectId: string }> }, run: (projectId: string) => Promise<Response> | Response) {
  const params = await context.params;
  if (!z.string().uuid().safeParse(params.projectId).success) return missing();
  return run(params.projectId);
}

async function bindId(context: { params: Promise<Record<string, string>> }, key: string, run: (id: string) => Promise<Response> | Response) {
  const params = await context.params;
  const id = params[key] ?? "";
  if (!z.string().uuid().safeParse(id).success) return missing();
  return run(id);
}

async function bindPair(
  context: { params: Promise<Record<string, string>> },
  run: (projectId: string, secondId: string) => Promise<Response> | Response,
) {
  const params = await context.params;
  const projectId = params.projectId ?? "";
  const secondId = params.membershipId ?? params.questionnaireId ?? params.assetId ?? "";
  if (!z.string().uuid().safeParse(projectId).success || !z.string().uuid().safeParse(secondId).success) {
    return missing();
  }
  return run(projectId, secondId);
}
