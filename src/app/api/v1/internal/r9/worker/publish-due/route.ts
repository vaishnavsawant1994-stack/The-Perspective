import { publishDue } from "@/modules/r9/routes";

export function POST(request: Request) {
  return publishDue(request);
}
