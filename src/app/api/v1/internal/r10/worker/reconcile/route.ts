import { runWorker } from "@/modules/r10/http";

export function POST(request: Request) {
  return runWorker(request);
}
