import { clientAccept, clientDecide, memberCancel, memberCheckout, memberRename, r12Invalid, teamInvite, teamRevoke } from "@/modules/r12/http";
import {
  clientApprovals,
  clientContracts,
  clientDashboard,
  clientInvoices,
  clientProject,
  clientProjects,
  memberIssue,
  memberLibrary,
} from "@/modules/r12/routes";

type Context = { params: Promise<{ path: string[] }> };

async function dispatch(request: Request, path: string[]) {
  const [a, b, c, d] = path;
  if (request.method === "POST" && a === "access" && b === "invitations" && !c) return teamInvite(request);
  if (request.method === "POST" && a === "access" && b === "invitations" && d === "revoke") return teamRevoke(request, c ?? "");
  if (request.method === "POST" && a === "access" && b === "accept" && !c) return clientAccept(request);
  if (request.method === "GET" && a === "client" && b === "dashboard" && !c) return clientDashboard(request);
  if (request.method === "GET" && a === "client" && b === "projects" && !c) return clientProjects(request);
  if (request.method === "GET" && a === "client" && b === "projects" && c && !d) return clientProject(request, c);
  if (request.method === "GET" && a === "client" && b === "approvals" && !c) return clientApprovals(request);
  if (request.method === "POST" && a === "client" && b === "approvals" && c && !d) return clientDecide(request, c);
  if (request.method === "GET" && a === "client" && b === "invoices" && !c) return clientInvoices(request);
  if (request.method === "GET" && a === "client" && b === "contracts" && !c) return clientContracts(request);
  if (request.method === "GET" && a === "member" && b === "library" && !c) return memberLibrary(request);
  if (request.method === "GET" && a === "member" && b === "issues" && c && !d) return memberIssue(request, c);
  if (request.method === "POST" && a === "member" && b === "profile" && !c) return memberRename(request);
  if (request.method === "POST" && a === "member" && b === "checkout" && !c) return memberCheckout(request);
  if (request.method === "POST" && a === "member" && b === "entitlements" && d === "cancel") return memberCancel(request, c ?? "");
  return r12Invalid();
}

export function GET(request: Request, context: Context) {
  return context.params.then((params) => dispatch(request, params.path));
}

export function POST(request: Request, context: Context) {
  return context.params.then((params) => dispatch(request, params.path));
}
