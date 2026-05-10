import type { DashboardTrend } from "@/types/dashboard";

type CashFlowChartProps = {
  trend: DashboardTrend[];
};

export function CashFlowChart({ trend }: CashFlowChartProps) {
  const maxTrendValue = Math.max(
    ...trend.flatMap((item) => [item.income, item.expense]),
    1,
  );
  const hasTrendData = trend.some(
    (item) => item.income > 0 || item.expense > 0,
  );

  return (
    <article className="rounded-[1.8rem] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <h2 className="text-2xl font-semibold">7-Day Cash Flow Trend</h2>

      <div className="mt-3 flex items-center gap-5 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-slate-300" />
          <span>Income</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-slate-500" />
          <span>Expense</span>
        </div>
      </div>

      <div className="mt-6 grid min-h-[260px] grid-cols-7 items-end gap-4 border-b border-l border-slate-300 px-4 pb-4 pt-2">
        {trend.map((item) => {
          const incomeHeight = hasTrendData
            ? `${Math.max((item.income / maxTrendValue) * 160, item.income > 0 ? 18 : 6)}px`
            : "12px";
          const expenseHeight = hasTrendData
            ? `${Math.max((item.expense / maxTrendValue) * 160, item.expense > 0 ? 18 : 6)}px`
            : "12px";

          return (
            <div key={item.date} className="flex flex-col items-center gap-4">
              <div className="flex h-[170px] items-end gap-1 rounded-xl bg-slate-50/80 px-1.5 pb-1">
                <span
                  className="w-8 rounded-t-md bg-slate-300"
                  style={{ height: incomeHeight }}
                />
                <span
                  className="w-8 rounded-t-md bg-slate-500"
                  style={{ height: expenseHeight }}
                />
              </div>
              <span className="text-lg text-slate-700">{item.label}</span>
            </div>
          );
        })}
      </div>

      {!hasTrendData ? (
        <p className="mt-4 text-sm text-slate-500">
          No transaction data for the last 7 days yet. Add a transaction to see
          the graph move.
        </p>
      ) : null}
    </article>
  );
}
