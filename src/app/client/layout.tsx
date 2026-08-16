import { ClientShell } from "@/components/workspace/workspace-shell";

export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  return <ClientShell>{children}</ClientShell>;
}
