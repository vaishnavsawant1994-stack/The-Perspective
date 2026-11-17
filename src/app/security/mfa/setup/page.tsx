import type { Metadata } from "next";
import { MfaEnrollmentSetup } from "@/components/auth/mfa-enrollment-setup";

export const metadata: Metadata = {
  title: "Set Up Multi-Factor Authentication",
  robots: { index: false, follow: false },
};

export default function MfaSetupPage() {
  return <MfaEnrollmentSetup />;
}
