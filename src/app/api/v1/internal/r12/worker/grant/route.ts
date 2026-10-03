import { workerCommand } from "@/modules/r12/http";

export function POST(request: Request) {
  return workerCommand(request, "grant");
}
