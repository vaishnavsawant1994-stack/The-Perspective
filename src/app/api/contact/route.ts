import { NextResponse } from "next/server";

const enquiryTypes = new Set(["editorial", "pitch", "personal-magazine", "partnerships", "events", "press", "careers", "support", "other"]);

export async function POST(request: Request) {
  const form = await request.formData();
  const enquiryType = String(form.get("enquiryType") ?? "");
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const subject = String(form.get("subject") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();
  const accepted = form.get("accepted") === "on";
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!enquiryTypes.has(enquiryType) || name.length < 2 || !emailPattern.test(email) || subject.length < 3 || message.length < 20 || !accepted) {
    return NextResponse.json({ ok: false, message: "Please complete every required field and accept the terms." }, { status: 400 });
  }

  const attachment = form.get("attachment");
  if (attachment instanceof File && attachment.size > 10 * 1024 * 1024) {
    return NextResponse.json({ ok: false, message: "Attachments must be 10 MB or smaller." }, { status: 400 });
  }

  return NextResponse.json(
    {
      ok: false,
      message: "Enquiry delivery is not configured. Nothing was stored or sent. Email hello@theperspective.com instead.",
    },
    { status: 503 },
  );
}
