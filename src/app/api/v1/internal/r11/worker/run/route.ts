import { runWorker } from "@/modules/r11/http";

export function POST(request: Request) {
  return runWorker(request);
}
