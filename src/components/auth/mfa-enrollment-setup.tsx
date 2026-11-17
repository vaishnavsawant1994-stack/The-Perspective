"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./auth-pages.module.css";

type Enrollment = {
  challengeToken: string;
  secret: string;
  uri: string;
  expiresAt: string;
};

export function MfaEnrollmentSetup() {
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function begin() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/v1/auth/mfa/enroll", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ accountName: "The Perspective" }),
      });
      const body = (await response.json().catch(() => ({}))) as Enrollment & { title?: string };
      if (!response.ok) throw new Error(body.title ?? "Sign in again to start MFA setup.");
      setEnrollment(body);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "MFA setup is unavailable.");
    } finally {
      setBusy(false);
    }
  }

  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enrollment) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/v1/auth/mfa/confirm", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ challengeToken: enrollment.challengeToken, code }),
      });
      const body = (await response.json().catch(() => ({}))) as { title?: string };
      if (!response.ok) throw new Error(body.title ?? "That authenticator code could not be verified.");
      setConfirmed(true);
      setMessage("Authenticator verified. Sign in again with your password and authenticator code to finish activation.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "MFA confirmation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function signOutAndContinue() {
    setBusy(true);
    await fetch("/api/v1/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => undefined);
    router.push("/login?next=%2Fapp");
    router.refresh();
  }

  return (
    <main className={styles.page}>
      <div className={styles.authShell}>
        <section className={styles.editorial}>
          <div className={styles.editorialCopy}>
            <p>Account security</p>
            <h1>Set up your authenticator.</h1>
            <i />
            <span>Privileged access stays inactive until you confirm an authenticator code and sign in again with both factors.</span>
          </div>
        </section>
        <section className={styles.formSide}>
          <div className={styles.authForm}>
            <h2>Multi-factor authentication</h2>
            <p>Use an authenticator app that supports time-based one-time passwords (TOTP).</p>
            {!enrollment ? (
              <button className={styles.primary} disabled={busy} onClick={begin} type="button">
                {busy ? "Starting setup…" : "Start authenticator setup"}
              </button>
            ) : confirmed ? (
              <button className={styles.primary} disabled={busy} onClick={signOutAndContinue} type="button">
                Sign out and continue to sign in
              </button>
            ) : (
              <form onSubmit={confirm}>
                <p>Enter this setup key in your authenticator app:</p>
                <p><strong>{enrollment.secret}</strong></p>
                <details>
                  <summary>Show authenticator setup URI</summary>
                  <code>{enrollment.uri}</code>
                </details>
                <label>
                  <span>Six-digit authenticator code</span>
                  <div className={styles.inputWrap}>
                    <input
                      aria-label="Six-digit authenticator code"
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      minLength={6}
                      required
                      value={code}
                      onChange={(event) => setCode(event.target.value.replace(/\D/gu, "").slice(0, 6))}
                    />
                  </div>
                </label>
                <button className={styles.primary} disabled={busy} type="submit">
                  {busy ? "Verifying…" : "Verify authenticator"}
                </button>
              </form>
            )}
            {message ? <p role="status" aria-live="polite">{message}</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
