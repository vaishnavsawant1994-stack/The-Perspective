"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import styles from "./personal-magazine-create-page.module.css";

export function PersonalMagazineLeadForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return <div aria-live="polite" className={styles.formSuccess} role="status">
      <CheckCircle2 aria-hidden="true" />
      <h3>Thank you for sharing your story.</h3>
      <p>Our editorial team will review your enquiry and contact you within two working days.</p>
      <button onClick={() => setSubmitted(false)} type="button">Send another enquiry</button>
    </div>;
  }

  return <form className={styles.leadForm} onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
    <h2>Start your magazine journey</h2>
    <p>Tell us a little about yourself. Fields marked * are required.</p>
    <label><span>Full name *</span><input autoComplete="name" name="name" placeholder="Full name" required /></label>
    <label><span>Email address *</span><input autoComplete="email" name="email" placeholder="Email address" required type="email" /></label>
    <label><span>Phone number</span><input autoComplete="tel" name="phone" placeholder="Phone number" type="tel" /></label>
    <label><span>Your designation</span><input autoComplete="organization-title" name="designation" placeholder="Your designation" /></label>
    <label><span>Company or organisation</span><input autoComplete="organization" name="company" placeholder="Company / organisation" /></label>
    <label><span>Tell us about your story *</span><textarea name="story" placeholder="The journey, ideas or impact you want to preserve…" required rows={4} /></label>
    <button type="submit">Get started now <ArrowRight aria-hidden="true" /></button>
    <small>We respect your privacy. No spam and no obligation.</small>
  </form>;
}
