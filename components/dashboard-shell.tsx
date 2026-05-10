"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardSummaryCards } from "@/components/dashboard/dashboard-summary-cards";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { TransactionHistoryTable } from "@/components/dashboard/transaction-history-table";
import { useDashboardData } from "@/components/dashboard/use-dashboard-data";

export default function DashboardShell() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { dashboard, transactions, isLoading } = useDashboardData();

  async function logout() {
    try {
      const response = await fetch("/api/auth/users/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      toast.success("Logged out successfully.");
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("Unable to log out right now.");
    }
  }

  function handleLogout() {
    startTransition(() => {
      void logout();
    });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(15,159,110,0.18),transparent_30%),linear-gradient(135deg,#f8f7f4_0%,#efeeea_48%,#edf8f2_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-360 flex-col gap-6 p-4 lg:flex-row lg:p-6">
        <DashboardSidebar
          user={dashboard?.user ?? null}
          isLoggingOut={isPending}
          onLogout={handleLogout}
        />

        <section className="flex-1 rounded-[2rem] bg-white/45 p-4 sm:p-6 lg:p-8">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-emerald-600">
              Overview
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Dashboard Overview
            </h1>
            <p className="text-sm text-slate-500">
              Track family cash flow, balances, and recent activity in one
              place.
            </p>
          </div>

          <DashboardSummaryCards
            summary={dashboard?.summary}
            isLoading={isLoading}
          />

          <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_320px]">
            <CashFlowChart trend={dashboard?.trend ?? []} />
            <IncomeExpenseChart summary={dashboard?.summary} />
          </div>

          <TransactionHistoryTable transactions={transactions} />
        </section>
      </div>
    </main>
  );
}
