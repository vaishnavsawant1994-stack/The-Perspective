import { TeamShell } from "@/components/workspace/workspace-shell";

export default function AppWorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <TeamShell>{children}</TeamShell>;
}
