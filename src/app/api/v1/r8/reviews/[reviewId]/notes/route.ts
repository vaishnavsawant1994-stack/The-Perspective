import { addNote } from "@/modules/r8/routes";

export function POST(request: Request, context: { params: Promise<{ reviewId: string }> }) {
  return addNote(request, context);
}
