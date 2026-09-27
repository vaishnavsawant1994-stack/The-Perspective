import "server-only";

import { createHash } from "node:crypto";

import {
  PERMISSION_DEFINITIONS,
  type CanonicalPermissionKey,
} from "./registry";
import type { AuthorizationScope } from "./types";

export const R5_FROZEN_CONTRACT_SHA =
  "2914e76b22468137630a4d444adb5431209fb5aa" as const;
export const R5_PERMISSION_REGISTRY_VERSION =
  "p4-r5-g0-2914e76b-170" as const;

export interface PermissionBundle {
  readonly key: string;
  readonly name: string;
  readonly permissions: readonly CanonicalPermissionKey[];
}

export const PERMISSION_BUNDLES = {
  B01: {
    key: "B01",
    name: "Staff Core",
    permissions: ["workspace.mywork.view", "workspace.search", "notification.read.own", "calendar.view", "task.view", "file.view"],
  },
  B02: {
    key: "B02",
    name: "Project Contributor",
    permissions: ["project.view", "project.activity.view", "task.edit", "file.version", "message.read", "message.send", "meeting.view"],
  },
  B03: {
    key: "B03",
    name: "Research / Lead Intelligence",
    permissions: ["lead.discover", "lead.view", "lead.edit", "lead.enrich", "lead.extract.run", "lead.import.review", "lead.list.manage", "lead.review", "lead.qualify", "company.view", "contact.view"],
  },
  B04: {
    key: "B04",
    name: "Sales Execution",
    permissions: ["company.edit", "contact.edit", "outreach.dashboard.view", "outreach.prepare", "campaign.view", "campaign.manage", "sequence.manage", "template.manage", "emailaccount.manage", "reply.view", "reply.handle", "inbox.view", "meeting.edit", "deal.view", "deal.edit", "deal.move", "deal.manage", "proposal.view", "proposal.edit", "proposal.send"],
  },
  B05: {
    key: "B05",
    name: "Sales Management",
    permissions: ["dashboard.executive.view", "outreach.launch", "reply.assign", "proposal.approve", "commercial.exception.approve", "contract.view", "contract.edit", "contract.send"],
  },
  B06: {
    key: "B06",
    name: "Account / Client Management",
    permissions: ["company.view", "company.edit", "contact.view", "contact.edit", "deal.view", "deal.edit", "deal.move", "deal.manage", "proposal.view", "proposal.edit", "proposal.send", "meeting.edit", "client.view", "client.contact.manage", "client.portal.manage", "client.portal.provision", "project.create", "project.manage", "project.assign", "workflow.move", "approval.view", "approval.decide", "report.create", "report.view", "report.approve", "renewal.view", "renewal.edit", "renewal.manage"],
  },
  B07: {
    key: "B07",
    name: "Editorial Writer",
    permissions: ["editorial.view", "draft.view", "draft.edit", "questionnaire.view", "questionnaire.edit"],
  },
  B08: {
    key: "B08",
    name: "Editorial Editor",
    permissions: ["editorial.dashboard.view", "editorial.review", "approval.view", "approval.decide", "magazine.view", "magazine.proof.review", "design.cover.view"],
  },
  B09: {
    key: "B09",
    name: "Editorial Executive",
    permissions: ["editorial.approve", "approval.override", "design.approve", "magazine.dashboard.view", "magazine.reader.publish", "publish.dashboard.view", "publish.queue.view", "publish.schedule", "publish.execute", "publication.publish"],
  },
  B10: {
    key: "B10",
    name: "Design Production",
    permissions: ["magazine.dashboard.view", "magazine.view", "design.cover.view", "design.cover.edit", "design.layout.manage", "magazine.proof.review"],
  },
  B11: {
    key: "B11",
    name: "Podcast Production",
    permissions: ["podcast.dashboard.view", "podcast.guest.manage", "podcast.episode.view", "podcast.episode.edit", "podcast.schedule.manage", "podcast.review"],
  },
  B12: {
    key: "B12",
    name: "Video Production",
    permissions: ["video.dashboard.view", "video.view", "video.edit", "video.schedule.manage", "video.review", "video.publish.prepare"],
  },
  B13: {
    key: "B13",
    name: "Events Operations",
    permissions: ["event.dashboard.view", "event.view", "event.manage", "event.participant.manage", "event.agenda.manage", "event.registration.manage"],
  },
  B14: {
    key: "B14",
    name: "Publishing & Distribution",
    permissions: ["publish.dashboard.view", "publish.queue.view", "publish.schedule", "publish.execute", "publication.publish", "distribution.dashboard.view", "distribution.campaign.view", "distribution.campaign.manage", "distribution.launch", "analytics.distribution.view", "report.view"],
  },
  B15: {
    key: "B15",
    name: "Finance",
    permissions: ["commercial.exception.approve", "package.manage", "proposal.view", "proposal.approve", "contract.view", "contract.edit", "contract.send", "invoice.view", "invoice.edit", "invoice.send", "invoice.issue", "payment.view", "payment.reconcile", "payment.refund", "report.view"],
  },
  B16: {
    key: "B16",
    name: "Operations",
    permissions: ["dashboard.executive.view", "team.view", "team.manage", "department.manage", "client.portal.provision", "project.view", "project.manage", "project.assign", "workflow.template.manage", "report.create", "report.view", "report.approve", "audit.view", "settings.manage"],
  },
  B17: {
    key: "B17",
    name: "Client User Base",
    permissions: ["client.dashboard.view", "client.project.view", "client.project.activity.view", "client.message.view", "client.message.send", "client.notification.view", "client.task.view", "client.task.complete", "client.support.manage", "client.questionnaire.view", "client.questionnaire.edit", "client.draft.view", "client.design.view", "client.asset.upload", "client.asset.view", "client.approval.view", "client.media.view", "client.contract.view", "client.billing.view", "client.publication.view", "client.distribution.view", "client.report.view", "client.renewal.view", "approval.client.decide", "client.draft.review", "client.design.review", "client.media.review", "client.contract.sign", "client.billing.pay", "client.org.manage"],
  }
} as const satisfies Record<string, PermissionBundle>;

export type PermissionBundleKey = keyof typeof PERMISSION_BUNDLES;

export const FROZEN_TEAM_ROLE_PERMISSION_KEYS = [
  "analytics.distribution.view",
  "approval.decide",
  "approval.override",
  "approval.view",
  "audit.view",
  "calendar.view",
  "campaign.manage",
  "campaign.view",
  "client.contact.manage",
  "client.portal.manage",
  "client.portal.provision",
  "client.view",
  "commercial.exception.approve",
  "company.edit",
  "company.view",
  "contact.edit",
  "contact.view",
  "contract.edit",
  "contract.send",
  "contract.view",
  "dashboard.executive.view",
  "deal.edit",
  "deal.manage",
  "deal.move",
  "deal.view",
  "department.manage",
  "design.approve",
  "design.cover.edit",
  "design.cover.view",
  "design.layout.manage",
  "distribution.campaign.manage",
  "distribution.campaign.view",
  "distribution.dashboard.view",
  "distribution.launch",
  "draft.edit",
  "draft.view",
  "editorial.approve",
  "editorial.dashboard.view",
  "editorial.review",
  "editorial.view",
  "emailaccount.manage",
  "event.agenda.manage",
  "event.dashboard.view",
  "event.manage",
  "event.participant.manage",
  "event.registration.manage",
  "event.view",
  "file.version",
  "file.view",
  "inbox.view",
  "integration.manage",
  "invoice.edit",
  "invoice.issue",
  "invoice.send",
  "invoice.view",
  "lead.discover",
  "lead.edit",
  "lead.enrich",
  "lead.extract.run",
  "lead.import.review",
  "lead.list.manage",
  "lead.qualify",
  "lead.review",
  "lead.view",
  "magazine.dashboard.view",
  "magazine.proof.review",
  "magazine.reader.publish",
  "magazine.view",
  "meeting.edit",
  "meeting.view",
  "message.read",
  "message.send",
  "notification.read.own",
  "outreach.dashboard.view",
  "outreach.launch",
  "outreach.prepare",
  "package.manage",
  "payment.reconcile",
  "payment.refund",
  "payment.view",
  "permission.manage",
  "podcast.dashboard.view",
  "podcast.episode.edit",
  "podcast.episode.view",
  "podcast.guest.manage",
  "podcast.review",
  "podcast.schedule.manage",
  "project.activity.view",
  "project.assign",
  "project.create",
  "project.manage",
  "project.view",
  "proposal.approve",
  "proposal.edit",
  "proposal.send",
  "proposal.view",
  "publication.publish",
  "publish.dashboard.view",
  "publish.execute",
  "publish.queue.view",
  "publish.schedule",
  "questionnaire.edit",
  "questionnaire.view",
  "renewal.edit",
  "renewal.manage",
  "renewal.view",
  "reply.assign",
  "reply.handle",
  "reply.view",
  "report.approve",
  "report.create",
  "report.view",
  "role.manage",
  "sequence.manage",
  "settings.manage",
  "source.manage",
  "task.edit",
  "task.view",
  "team.manage",
  "team.view",
  "template.manage",
  "video.dashboard.view",
  "video.edit",
  "video.publish.prepare",
  "video.review",
  "video.schedule.manage",
  "video.view",
  "workflow.move",
  "workflow.template.manage",
  "workspace.mywork.view",
  "workspace.search"
] as const satisfies readonly CanonicalPermissionKey[];

export interface LaunchRoleDefinition {
  readonly code: `R${string}`;
  readonly name: string;
  readonly scopes: readonly AuthorizationScope[];
  readonly permissions: readonly CanonicalPermissionKey[];
}

export const LAUNCH_ROLES = [
  {
    code: "R01",
    name: "Super Admin",
    scopes: ["ORG"],
    permissions: ["analytics.distribution.view", "approval.decide", "approval.override", "approval.view", "audit.view", "calendar.view", "campaign.manage", "campaign.view", "client.contact.manage", "client.portal.manage", "client.portal.provision", "client.view", "commercial.exception.approve", "company.edit", "company.view", "contact.edit", "contact.view", "contract.edit", "contract.send", "contract.view", "dashboard.executive.view", "deal.edit", "deal.manage", "deal.move", "deal.view", "department.manage", "design.approve", "design.cover.edit", "design.cover.view", "design.layout.manage", "distribution.campaign.manage", "distribution.campaign.view", "distribution.dashboard.view", "distribution.launch", "draft.edit", "draft.view", "editorial.approve", "editorial.dashboard.view", "editorial.review", "editorial.view", "emailaccount.manage", "event.agenda.manage", "event.dashboard.view", "event.manage", "event.participant.manage", "event.registration.manage", "event.view", "file.version", "file.view", "inbox.view", "integration.manage", "invoice.edit", "invoice.issue", "invoice.send", "invoice.view", "lead.discover", "lead.edit", "lead.enrich", "lead.extract.run", "lead.import.review", "lead.list.manage", "lead.qualify", "lead.review", "lead.view", "magazine.dashboard.view", "magazine.proof.review", "magazine.reader.publish", "magazine.view", "meeting.edit", "meeting.view", "message.read", "message.send", "notification.read.own", "outreach.dashboard.view", "outreach.launch", "outreach.prepare", "package.manage", "payment.reconcile", "payment.refund", "payment.view", "permission.manage", "podcast.dashboard.view", "podcast.episode.edit", "podcast.episode.view", "podcast.guest.manage", "podcast.review", "podcast.schedule.manage", "project.activity.view", "project.assign", "project.create", "project.manage", "project.view", "proposal.approve", "proposal.edit", "proposal.send", "proposal.view", "publication.publish", "publish.dashboard.view", "publish.execute", "publish.queue.view", "publish.schedule", "questionnaire.edit", "questionnaire.view", "renewal.edit", "renewal.manage", "renewal.view", "reply.assign", "reply.handle", "reply.view", "report.approve", "report.create", "report.view", "role.manage", "sequence.manage", "settings.manage", "source.manage", "task.edit", "task.view", "team.manage", "team.view", "template.manage", "video.dashboard.view", "video.edit", "video.publish.prepare", "video.review", "video.schedule.manage", "video.view", "workflow.move", "workflow.template.manage", "workspace.mywork.view", "workspace.search"],
  },
  {
    code: "R02",
    name: "Admin",
    scopes: ["ORG"],
    permissions: ["analytics.distribution.view", "approval.decide", "approval.override", "approval.view", "audit.view", "calendar.view", "campaign.manage", "campaign.view", "client.contact.manage", "client.portal.manage", "client.portal.provision", "client.view", "commercial.exception.approve", "company.edit", "company.view", "contact.edit", "contact.view", "contract.edit", "contract.send", "contract.view", "dashboard.executive.view", "deal.edit", "deal.manage", "deal.move", "deal.view", "department.manage", "design.approve", "design.cover.edit", "design.cover.view", "design.layout.manage", "distribution.campaign.manage", "distribution.campaign.view", "distribution.dashboard.view", "distribution.launch", "draft.edit", "draft.view", "editorial.approve", "editorial.dashboard.view", "editorial.review", "editorial.view", "emailaccount.manage", "event.agenda.manage", "event.dashboard.view", "event.manage", "event.participant.manage", "event.registration.manage", "event.view", "file.version", "file.view", "inbox.view", "integration.manage", "invoice.edit", "invoice.issue", "invoice.send", "invoice.view", "lead.discover", "lead.edit", "lead.enrich", "lead.extract.run", "lead.import.review", "lead.list.manage", "lead.qualify", "lead.review", "lead.view", "magazine.dashboard.view", "magazine.proof.review", "magazine.reader.publish", "magazine.view", "meeting.edit", "meeting.view", "message.read", "message.send", "notification.read.own", "outreach.dashboard.view", "outreach.launch", "outreach.prepare", "package.manage", "payment.reconcile", "payment.refund", "payment.view", "permission.manage", "podcast.dashboard.view", "podcast.episode.edit", "podcast.episode.view", "podcast.guest.manage", "podcast.review", "podcast.schedule.manage", "project.activity.view", "project.assign", "project.create", "project.manage", "project.view", "proposal.approve", "proposal.edit", "proposal.send", "proposal.view", "publication.publish", "publish.dashboard.view", "publish.execute", "publish.queue.view", "publish.schedule", "questionnaire.edit", "questionnaire.view", "renewal.edit", "renewal.manage", "renewal.view", "reply.assign", "reply.handle", "reply.view", "report.approve", "report.create", "report.view", "role.manage", "sequence.manage", "settings.manage", "source.manage", "task.edit", "task.view", "team.manage", "team.view", "template.manage", "video.dashboard.view", "video.edit", "video.publish.prepare", "video.review", "video.schedule.manage", "video.view", "workflow.move", "workflow.template.manage", "workspace.mywork.view", "workspace.search"],
  },
  {
    code: "R03",
    name: "Sales Manager",
    scopes: ["ORG", "DEPT"],
    permissions: ["calendar.view", "campaign.manage", "campaign.view", "commercial.exception.approve", "company.edit", "company.view", "contact.edit", "contact.view", "contract.edit", "contract.send", "contract.view", "dashboard.executive.view", "deal.edit", "deal.manage", "deal.move", "deal.view", "emailaccount.manage", "file.version", "file.view", "inbox.view", "lead.discover", "lead.edit", "lead.enrich", "lead.extract.run", "lead.import.review", "lead.list.manage", "lead.qualify", "lead.review", "lead.view", "meeting.edit", "meeting.view", "message.read", "message.send", "notification.read.own", "outreach.dashboard.view", "outreach.launch", "outreach.prepare", "project.activity.view", "project.view", "proposal.approve", "proposal.edit", "proposal.send", "proposal.view", "reply.assign", "reply.handle", "reply.view", "sequence.manage", "task.edit", "task.view", "template.manage", "workspace.mywork.view", "workspace.search"],
  },
  {
    code: "R04",
    name: "Sales Executive",
    scopes: ["DEPT", "ASN", "OWN"],
    permissions: ["calendar.view", "campaign.manage", "campaign.view", "company.edit", "company.view", "contact.edit", "contact.view", "deal.edit", "deal.manage", "deal.move", "deal.view", "emailaccount.manage", "file.version", "file.view", "inbox.view", "lead.discover", "lead.edit", "lead.enrich", "lead.extract.run", "lead.import.review", "lead.list.manage", "lead.qualify", "lead.review", "lead.view", "meeting.edit", "meeting.view", "message.read", "message.send", "notification.read.own", "outreach.dashboard.view", "outreach.prepare", "project.activity.view", "project.view", "proposal.edit", "proposal.send", "proposal.view", "reply.handle", "reply.view", "sequence.manage", "task.edit", "task.view", "template.manage", "workspace.mywork.view", "workspace.search"],
  },
  {
    code: "R05",
    name: "Researcher",
    scopes: ["DEPT", "ASN", "OWN"],
    permissions: ["calendar.view", "company.view", "contact.view", "file.version", "file.view", "lead.discover", "lead.edit", "lead.enrich", "lead.extract.run", "lead.import.review", "lead.list.manage", "lead.qualify", "lead.review", "lead.view", "meeting.view", "message.read", "message.send", "notification.read.own", "project.activity.view", "project.view", "task.edit", "task.view", "workspace.mywork.view", "workspace.search"],
  },
  {
    code: "R06",
    name: "Account Manager",
    scopes: ["DEPT", "ASN", "OWN"],
    permissions: ["approval.decide", "approval.view", "calendar.view", "client.contact.manage", "client.portal.manage", "client.portal.provision", "client.view", "company.edit", "company.view", "contact.edit", "contact.view", "dashboard.executive.view", "deal.edit", "deal.manage", "deal.move", "deal.view", "file.version", "file.view", "meeting.edit", "meeting.view", "message.read", "message.send", "notification.read.own", "project.activity.view", "project.assign", "project.create", "project.manage", "project.view", "proposal.edit", "proposal.send", "proposal.view", "renewal.edit", "renewal.manage", "renewal.view", "report.approve", "report.create", "report.view", "task.edit", "task.view", "workflow.move", "workspace.mywork.view", "workspace.search"],
  },
  {
    code: "R07",
    name: "Editor-in-Chief",
    scopes: ["ORG", "DEPT"],
    permissions: ["approval.decide", "approval.override", "approval.view", "calendar.view", "design.approve", "design.cover.view", "draft.edit", "draft.view", "editorial.approve", "editorial.dashboard.view", "editorial.review", "editorial.view", "file.version", "file.view", "magazine.dashboard.view", "magazine.proof.review", "magazine.reader.publish", "magazine.view", "meeting.view", "message.read", "message.send", "notification.read.own", "project.activity.view", "project.assign", "project.manage", "project.view", "publication.publish", "publish.dashboard.view", "publish.execute", "publish.queue.view", "publish.schedule", "questionnaire.edit", "questionnaire.view", "report.view", "task.edit", "task.view", "workspace.mywork.view", "workspace.search"],
  },
  {
    code: "R08",
    name: "Editor",
    scopes: ["DEPT", "ASN", "OWN"],
    permissions: ["approval.decide", "approval.view", "calendar.view", "design.cover.view", "draft.edit", "draft.view", "editorial.dashboard.view", "editorial.review", "editorial.view", "file.version", "file.view", "magazine.proof.review", "magazine.view", "meeting.view", "message.read", "message.send", "notification.read.own", "project.activity.view", "project.view", "questionnaire.edit", "questionnaire.view", "task.edit", "task.view", "workspace.mywork.view", "workspace.search"],
  },
  {
    code: "R09",
    name: "Writer",
    scopes: ["ASN", "OWN"],
    permissions: ["calendar.view", "draft.edit", "draft.view", "editorial.view", "file.version", "file.view", "meeting.view", "message.read", "message.send", "notification.read.own", "project.activity.view", "project.view", "questionnaire.edit", "questionnaire.view", "task.edit", "task.view", "workspace.mywork.view", "workspace.search"],
  },
  {
    code: "R10",
    name: "Designer",
    scopes: ["ASN", "OWN"],
    permissions: ["calendar.view", "design.cover.edit", "design.cover.view", "design.layout.manage", "file.version", "file.view", "magazine.dashboard.view", "magazine.proof.review", "magazine.view", "meeting.view", "message.read", "message.send", "notification.read.own", "project.activity.view", "project.view", "task.edit", "task.view", "workspace.mywork.view", "workspace.search"],
  },
  {
    code: "R11",
    name: "Podcast Producer",
    scopes: ["DEPT", "ASN", "OWN"],
    permissions: ["approval.view", "calendar.view", "file.version", "file.view", "meeting.view", "message.read", "message.send", "notification.read.own", "podcast.dashboard.view", "podcast.episode.edit", "podcast.episode.view", "podcast.guest.manage", "podcast.review", "podcast.schedule.manage", "project.activity.view", "project.view", "task.edit", "task.view", "workspace.mywork.view", "workspace.search"],
  },
  {
    code: "R12",
    name: "Video Producer",
    scopes: ["DEPT", "ASN", "OWN"],
    permissions: ["approval.view", "calendar.view", "file.version", "file.view", "meeting.view", "message.read", "message.send", "notification.read.own", "project.activity.view", "project.view", "task.edit", "task.view", "video.dashboard.view", "video.edit", "video.publish.prepare", "video.review", "video.schedule.manage", "video.view", "workspace.mywork.view", "workspace.search"],
  },
  {
    code: "R13",
    name: "Events Manager",
    scopes: ["ORG", "DEPT"],
    permissions: ["calendar.view", "event.agenda.manage", "event.dashboard.view", "event.manage", "event.participant.manage", "event.registration.manage", "event.view", "file.version", "file.view", "meeting.view", "message.read", "message.send", "notification.read.own", "project.activity.view", "project.assign", "project.manage", "project.view", "report.view", "task.edit", "task.view", "workspace.mywork.view", "workspace.search"],
  },
  {
    code: "R14",
    name: "Marketing & Distribution",
    scopes: ["ORG", "DEPT"],
    permissions: ["analytics.distribution.view", "calendar.view", "distribution.campaign.manage", "distribution.campaign.view", "distribution.dashboard.view", "distribution.launch", "file.version", "file.view", "meeting.view", "message.read", "message.send", "notification.read.own", "project.activity.view", "project.view", "publication.publish", "publish.dashboard.view", "publish.execute", "publish.queue.view", "publish.schedule", "report.view", "task.edit", "task.view", "workspace.mywork.view", "workspace.search"],
  },
  {
    code: "R15",
    name: "Finance Manager",
    scopes: ["ORG"],
    permissions: ["calendar.view", "commercial.exception.approve", "contract.edit", "contract.send", "contract.view", "dashboard.executive.view", "file.version", "file.view", "invoice.edit", "invoice.issue", "invoice.send", "invoice.view", "meeting.view", "message.read", "message.send", "notification.read.own", "package.manage", "payment.reconcile", "payment.refund", "payment.view", "project.activity.view", "project.view", "proposal.approve", "proposal.view", "report.view", "task.edit", "task.view", "workspace.mywork.view", "workspace.search"],
  },
  {
    code: "R16",
    name: "Operations Manager",
    scopes: ["ORG"],
    permissions: ["audit.view", "calendar.view", "client.portal.provision", "dashboard.executive.view", "department.manage", "file.version", "file.view", "meeting.view", "message.read", "message.send", "notification.read.own", "project.activity.view", "project.assign", "project.manage", "project.view", "report.approve", "report.create", "report.view", "settings.manage", "task.edit", "task.view", "team.manage", "team.view", "workflow.template.manage", "workspace.mywork.view", "workspace.search"],
  },
  {
    code: "R17",
    name: "Client User",
    scopes: ["CLIENT"],
    permissions: ["approval.client.decide", "client.approval.view", "client.asset.upload", "client.asset.view", "client.billing.pay", "client.billing.view", "client.contract.sign", "client.contract.view", "client.dashboard.view", "client.design.review", "client.design.view", "client.distribution.view", "client.draft.review", "client.draft.view", "client.media.review", "client.media.view", "client.message.send", "client.message.view", "client.notification.view", "client.org.manage", "client.project.activity.view", "client.project.view", "client.publication.view", "client.questionnaire.edit", "client.questionnaire.view", "client.renewal.view", "client.report.view", "client.support.manage", "client.task.complete", "client.task.view"],
  }
] as const satisfies readonly LaunchRoleDefinition[];

export type LaunchRoleCode = (typeof LAUNCH_ROLES)[number]["code"];

export interface ClientCapabilityRoleDefinition {
  readonly key: string;
  readonly name: string;
  readonly scope: "CLIENT";
  readonly permissions: readonly CanonicalPermissionKey[];
}

export const CLIENT_CAPABILITY_ROLES = [
  {
    key: "client-approver",
    name: "Client Approver",
    scope: "CLIENT",
    permissions: ["client.draft.review", "client.design.review", "client.media.review", "approval.client.decide"],
  },
  {
    key: "client-signer",
    name: "Client Signer",
    scope: "CLIENT",
    permissions: ["client.contract.sign"],
  },
  {
    key: "client-billing",
    name: "Client Billing",
    scope: "CLIENT",
    permissions: ["client.billing.pay"],
  },
  {
    key: "client-admin",
    name: "Client Admin",
    scope: "CLIENT",
    permissions: ["client.org.manage"],
  }
] as const satisfies readonly ClientCapabilityRoleDefinition[];

export const PROTECTED_PERMISSION_KEYS = [
  "role.manage",
  "permission.manage",
  "settings.manage",
  "integration.manage",
  "audit.view",
  "approval.override",
  "commercial.exception.approve",
  "invoice.issue",
  "payment.reconcile",
  "payment.refund",
  "publication.publish",
  "publish.execute",
  "distribution.launch",
  "outreach.launch"
] as const satisfies readonly CanonicalPermissionKey[];

export const ROLE_DELEGATION_CEILINGS = {
  R01: {
    assignableLaunchRoles: LAUNCH_ROLES.map((role) => role.code),
    mayCreateCustomTeamRoles: true,
    mayCreateClientCapabilityRoles: true,
    mayMutateRolePermissions: true,
    mayGrantR01EquivalentAuthority: true,
  },
  R02: {
    assignableLaunchRoles: LAUNCH_ROLES
      .filter((role) => role.code !== "R01")
      .map((role) => role.code),
    mayCreateCustomTeamRoles: true,
    mayCreateClientCapabilityRoles: true,
    mayMutateRolePermissions: true,
    mayGrantR01EquivalentAuthority: false,
  },
} as const;

export function getLaunchRoleDefinition(
  code: LaunchRoleCode,
): LaunchRoleDefinition {
  const role = LAUNCH_ROLES.find((candidate) => candidate.code === code);
  if (!role) throw new Error(`Unknown R5 launch role: ${code}`);
  return role;
}

export function isLaunchRoleCode(value: string): value is LaunchRoleCode {
  return LAUNCH_ROLES.some((role) => role.code === value);
}

export function getClientCapabilityRoleDefinition(key: string) {
  return CLIENT_CAPABILITY_ROLES.find((role) => role.key === key);
}

export function permissionRegistryFingerprint() {
  const canonical = PERMISSION_DEFINITIONS.map((definition) => ({
    key: definition.key,
    surface: definition.surface,
    risk: definition.risk,
    assignability: definition.assignability,
    permittedScopes: [...definition.permittedScopes],
    requiresFieldPolicy: definition.requiresFieldPolicy,
    requiresWorkflowPolicy: definition.requiresWorkflowPolicy,
    obligations: [...definition.obligations],
    activationStage: definition.activationStage,
  }));

  return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}
