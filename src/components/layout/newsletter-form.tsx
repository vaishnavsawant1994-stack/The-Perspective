"use client";

import { useId, useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const emailSchema = z.string().trim().email("Enter a valid email address.");
export function NewsletterForm({ label = "The weekly perspective", buttonLabel = "Subscribe", theme = "dark" }: { label?:string; buttonLabel?:string; theme?:"dark"|"light" }) {
  const instanceId = useId().replaceAll(":", "");
  const [email, setEmail] = useState(""); const [message, setMessage] = useState(""); const [success, setSuccess] = useState(false);
  function subscribe(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const result = emailSchema.safeParse(email); if (!result.success) { setSuccess(false); setMessage(result.error.issues[0]?.message ?? "Enter a valid email address."); return; } setSuccess(true); setMessage("You’re on the list. Look for the next edition in your inbox."); setEmail(""); }
  const fieldId = `newsletter-email-${instanceId}`; const messageId = `${fieldId}-message`;
  return <form noValidate onSubmit={subscribe}><label className={`type-label mb-3 block ${theme === "dark" ? "text-white/60" : "text-muted"}`} htmlFor={fieldId}>{label}</label><div className="flex flex-col gap-2 sm:flex-row"><input aria-describedby={messageId} className={`h-12 min-w-0 flex-1 border bg-transparent px-4 text-sm focus:outline-none ${theme === "dark" ? "border-white/30 text-white placeholder:text-white/45 focus:border-white" : "border-foreground text-foreground placeholder:text-muted focus:border-accent"}`} id={fieldId} inputMode="email" onChange={(event) => { setEmail(event.target.value); setMessage(""); }} placeholder="Email address" type="email" value={email} /><Button className="h-12 shrink-0" variant={theme === "dark" ? "premium" : "primary"} type="submit">{buttonLabel}</Button></div><p aria-live="polite" className={`mt-3 min-h-5 text-xs ${success ? (theme === "dark" ? "text-[#d5ba82]" : "text-[#4d774b]") : (theme === "dark" ? "text-[#efaaa4]" : "text-accent")}`} id={messageId}>{message}</p></form>;
}
