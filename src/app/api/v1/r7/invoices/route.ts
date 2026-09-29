import {
  invalidR7Request,
  parseR7ListRequest,
  r7Json,
  resolveR7TeamRequest,
  unavailableR7Request,
} from "@/modules/r7/http";
import { listAuthorizedInvoices } from "@/modules/r7/queries";

export async function GET(request: Request) {
  const query = parseR7ListRequest(request);
  if (!query) return invalidR7Request();
  const resolved = await resolveR7TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;
  try {
    const invoices = await listAuthorizedInvoices(resolved.context, query.limit);
    return r7Json({ invoices });
  } catch {
    return unavailableR7Request();
  }
}
