"use client";

import { useState } from "react";
import Link from "next/link";
import { Paperclip, Send } from "lucide-react";
import styles from "./contact-perspective-page.module.css";

type SubmitState = { status: "idle" | "sending" | "success" | "error"; message?: string; reference?: string };

export function ContactEnquiryForm() {
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  async function submit(formData: FormData) {
    setState({ status: "sending" });
    try {
      const response = await fetch("/api/contact", { method: "POST", body: formData });
      const result = await response.json() as { ok: boolean; message: string; reference?: string };
      setState({ status: response.ok ? "success" : "error", message: result.message, reference: result.reference });
    } catch {
      setState({ status: "error", message: "We could not submit your enquiry. Please email hello@theperspective.com." });
    }
  }

  return <form action={submit} className={styles.form}>
    <div className={styles.formGrid}>
      <label><span>Enquiry Type <b>*</b></span><select defaultValue="" name="enquiryType" required><option disabled value="">Select enquiry type</option><option value="editorial">Editorial enquiry</option><option value="pitch">Story or article pitch</option><option value="personal-magazine">Personal Magazine</option><option value="partnerships">Advertising & partnerships</option><option value="events">Events & speaker enquiry</option><option value="press">Press & media</option><option value="careers">Careers</option><option value="support">Support & subscriptions</option><option value="other">Other</option></select></label>
      <label><span>Your Name <b>*</b></span><input autoComplete="name" minLength={2} name="name" placeholder="Full name" required /></label>
      <label><span>Email Address <b>*</b></span><input autoComplete="email" name="email" placeholder="name@example.com" required type="email" /></label>
      <label className={styles.subject}><span>Subject <b>*</b></span><input minLength={3} name="subject" placeholder="Enter a short subject" required /></label>
      <label><span>Phone (Optional)</span><input autoComplete="tel" name="phone" placeholder="+91 98765 43210" type="tel" /></label>
      <label className={styles.message}><span>Your Message <b>*</b></span><textarea minLength={20} name="message" placeholder="Tell us how we can help you…" required rows={6} /></label>
    </div>
    <div className={styles.formFooter}>
      <label className={styles.file}><Paperclip/><span><b>Attach Files (Optional)</b><small>Documents, images or PDFs up to 10 MB</small></span><input accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" name="attachment" type="file" /></label>
      <div className={styles.consent}><label><input name="accepted" required type="checkbox"/><span>I agree to the <Link href="/privacy">Privacy Policy</Link> and <Link href="/terms">Terms of Use</Link>.</span></label><button disabled={state.status === "sending"} type="submit">{state.status === "sending" ? "Sending…" : "Send Message"}<Send/></button><p>This form does not deliver an enquiry until email delivery is configured.</p></div>
    </div>
    <div aria-live="polite" className={`${styles.formStatus} ${state.status === "error" ? styles.error : ""}`} hidden={state.status === "idle" || state.status === "sending"}>{state.message}{state.reference ? <> Reference: <b>{state.reference}</b>.</> : null}</div>
  </form>;
}
