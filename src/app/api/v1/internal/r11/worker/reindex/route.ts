import { reindexWorker } from "@/modules/r11/http";

export function POST(request: Request) {
  return reindexWorker(request);
}
