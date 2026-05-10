import { formatCurrency } from "@/lib/dashboard-formatters";
import type { DashboardSummary } from "@/types/dashboard";

type IncomeExpenseChartProps = {
  summary: DashboardSummary | undefined;
};

export function IncomeExpenseChart({ summary }: IncomeExpenseChartProps) {
  const incomeShare = summary?.totalIncome ?? 0;
  const expenseShare = summary?.totalExpense ?? 0;
  const totalShare = incomeShare + expenseShare;
  const incomeRatio = totalShare === 0 ? 0.5 : incomeShare / totalShare;
  const donutStyle = {
    background: `conic-gradient(#0f9f6e 0deg ${incomeRatio * 360}deg, #9fe3c5 ${incomeRatio * 360}deg 360deg)`,
  };

  return (
    <article className="rounded-[1.8rem] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <h2 className="text-2xl font-semibold">Income vs Expenses</h2>

      <div className="mt-10 flex flex-col items-center justify-center gap-6">
        <div className="relative h-44 w-44 rounded-full" style={donutStyle}>
          <div className="absolute inset-5 rounded-full bg-white" />
        </div>

        <div className="w-full space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-600" />
              <span>Income</span>
            </div>
            <span>{formatCurrency(summary?.totalIncome ?? 0)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-200" />
              <span>Expenses</span>
            </div>
            <span>{formatCurrency(summary?.totalExpense ?? 0)}</span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3 font-medium">
            <span>Net change</span>
            <span
              className={
                (summary?.netIncome ?? 0) >= 0
                  ? "text-emerald-600"
                  : "text-rose-600"
              }
            >
              {formatCurrency(summary?.netIncome ?? 0)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
