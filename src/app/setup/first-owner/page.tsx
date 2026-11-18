import type { Metadata } from "next";
import { FirstOwnerSetup } from "@/components/auth/first-owner-setup";

export const metadata: Metadata = {
  title: "Create the first owner",
  description: "Secure one-time setup for The Perspective owner account.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function FirstOwnerSetupPage() {
  return (
    <section className="mx-auto w-full max-w-2xl px-5 py-16 sm:px-8">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">One-time setup</p>
        <h1 className="mt-3 font-serif text-4xl text-foreground">Create the first owner</h1>
        <p className="mt-4 leading-7 text-muted">
          This creates the first-owner invitation for the empty production account. Enter the one-time setup key from Hostinger and the owner email address. The invitation link will appear here once.
        </p>
        <div className="mt-8">
          <FirstOwnerSetup />
        </div>
      </div>
    </section>
  );
}

