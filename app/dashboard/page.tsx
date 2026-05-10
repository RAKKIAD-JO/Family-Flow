import DashboardShell from "@/components/dashboard-shell";
import { verifySession } from "@/lib/session";

export default async function DashboardPage() {
  await verifySession();

  return <DashboardShell />;
}
