"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const emailSchema = z.string().trim().email("Enter a valid email address.");
export function NewsletterForm() {
  const [email, setEmail] = useState(""); const [message, setMessage] = useState(""); const [success, setSuccess] = useState(false);
  function subscribe(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const result = emailSchema.safeParse(email); if (!result.success) { setSuccess(false); setMessage(result.error.issues[0]?.message ?? "Enter a valid email address."); return; } setSuccess(true); setMessage("You’re on the list. Look for the next edition in your inbox."); setEmail(""); }
  return <form noValidate onSubmit={subscribe}><label className="type-label mb-3 block text-white/60" htmlFor="newsletter-email">The weekly perspective</label><div className="flex flex-col gap-2 sm:flex-row"><input aria-describedby="newsletter-message" className="h-12 min-w-0 flex-1 border border-white/30 bg-transparent px-4 text-sm text-white placeholder:text-white/45 focus:border-white focus:outline-none" id="newsletter-email" inputMode="email" onChange={(event) => { setEmail(event.target.value); setMessage(""); }} placeholder="Email address" type="email" value={email} /><Button className="h-12 shrink-0" variant="premium" type="submit">Subscribe</Button></div><p aria-live="polite" className={`mt-3 min-h-5 text-xs ${success ? "text-[#d5ba82]" : "text-[#efaaa4]"}`} id="newsletter-message">{message}</p></form>;
}
