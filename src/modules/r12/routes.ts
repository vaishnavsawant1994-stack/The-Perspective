import "server-only";

import { clientDecide, clientRead, memberCancel, memberCheckout, memberRead, memberRename } from "./http";

export function clientDashboard(request: Request) {
  return clientRead(request, "client.dashboard.view", "client-dashboard", "view", "dashboard");
}

export function clientProjects(request: Request) {
  return clientRead(request, "client.project.view", "client-project", "list", "projects");
}

export function clientProject(request: Request, projectId: string) {
  return clientRead(request, "client.project.view", "client-project", "view", "project", { projectId });
}

export function clientApprovals(request: Request) {
  return clientRead(request, "client.approval.view", "client-approval-view", "list", "approvals");
}

export function clientInvoices(request: Request) {
  return clientRead(request, "client.billing.view", "client-invoice", "list", "invoices");
}

export function clientContracts(request: Request) {
  return clientRead(request, "client.contract.view", "client-contract", "list", "contracts");
}

export function memberLibrary(request: Request) {
  return memberRead(request, "library");
}

export function memberIssue(request: Request, issueId: string) {
  return memberRead(request, "issue", { issueId });
}

export { clientDecide, memberCancel, memberCheckout, memberRename };
