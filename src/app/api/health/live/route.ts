import { NextResponse } from "next/server";

import { assertProductionConfiguration } from "@/modules/foundation/config/production-boundary";
import { liveStatus } from "@/modules/r14/health";

export function GET() {
  assertProductionConfiguration(process.env);
  return NextResponse.json(liveStatus());
}
