"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./auth-pages.module.css";

type InvitationDetails = {
  organizationName: string;
  roleName?: string | null;
  expiresAt: string;
  surface: "TEAM" | "CLIENT";
  requiresMfaActivation?: boolean;
};

export function InvitationAcceptance({ token }: { token: string }) {
  const router = useRouter();
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [message, setMessage] = useState("Loading invitation…");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/v1/auth/invitations/${encodeURIComponent(token)}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("This invitation is unavailable or expired.");
        return (await response.json()) as InvitationDetails;
      })
      .then((details) => {
        if (!active) return;
        setInvitation(details);
        setMessage("");
      })
      .catch((error: unknown) => {
        if (active) setMessage(error instanceof Error ? error.message : "This invitation is unavailable.");
      });
    return () => {
      active = false;
    };
  }, [token]);

  async function accept(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (password.length < 12) {
      setMessage("Use a password with at least 12 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/auth/invitations/${encodeURIComponent(token)}`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          displayName: name,
          password,
          confirmPassword,
          termsAccepted,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        code?: string;
        requiresMfaActivation?: boolean;
        mfaEnrollmentRequired?: boolean;
      };
      if (response.status === 409 && body.code === "AUTH_INVITATION_SIGN_IN_REQUIRED") {
        setMessage("This invitation is for an existing account. Sign in, then return here to accept it.");
        return;
      }
      if (!response.ok) throw new Error("We could not accept this invitation. Check your details and try again.");
      if (body.requiresMfaActivation) {
        if (body.mfaEnrollmentRequired) {
          router.push("/security/mfa/setup");
          router.refresh();
          return;
        }
        await fetch("/api/v1/auth/logout", { method: "POST", credentials: "same-origin" });
        router.push("/login?next=%2Fapp");
        router.refresh();
        return;
      }
      router.push(invitation?.surface === "CLIENT" ? "/client" : "/app");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not accept this invitation.");
    } finally {
      setBusy(false);
    }
  }

  const loginPath = `/login?next=${encodeURIComponent(`/invitation/${token}`)}`;
  return (
    <main className={styles.page}>
      <div className={styles.authShell}>
        <section className={styles.editorial}>
          <div className={styles.editorialCopy}>
            <p>The Perspective account access</p>
            <h1>Accept your invitation.</h1>
            <i />
            {invitation ? (
              <>
                <span>You have been invited to join {invitation.organizationName}.</span>
                {invitation.roleName ? <span>Role: {invitation.roleName}</span> : null}
                {invitation.requiresMfaActivation ? <span>Privileged access activates only after a password sign-in and verified authenticator code.</span> : null}
              </>
            ) : <span>{message}</span>}
          </div>
        </section>
        <section className={styles.formSide}>
          <form className={styles.authForm} onSubmit={accept}>
            <h2>Complete your account</h2>
            <p>Set up access for this invitation. Your account will be added only to the named organization.</p>
            <label>
              <span>Your name</span>
              <div className={styles.inputWrap}>
                <input autoComplete="name" minLength={2} maxLength={200} required value={name} onChange={(event) => setName(event.target.value)} />
              </div>
            </label>
            <label>
              <span>Password</span>
              <div className={styles.inputWrap}>
                <input type="password" autoComplete="new-password" minLength={12} maxLength={1024} required value={password} onChange={(event) => setPassword(event.target.value)} />
              </div>
            </label>
            <label>
              <span>Confirm password</span>
              <div className={styles.inputWrap}>
                <input type="password" autoComplete="new-password" minLength={12} maxLength={1024} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
              </div>
            </label>
            <label className={styles.formOptions}>
              <input type="checkbox" required checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
              <span>I accept the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.</span>
            </label>
            {message ? <p role="status" aria-live="polite">{message}</p> : null}
            <button className={styles.primary} disabled={!invitation || busy} type="submit">
              {busy ? "Accepting invitation…" : "Accept invitation"}
            </button>
            <p className={styles.helpLine}>Already have an account? <Link href={loginPath}>Sign in first</Link>, then return to this invitation.</p>
          </form>
        </section>
      </div>
    </main>
  );
}
