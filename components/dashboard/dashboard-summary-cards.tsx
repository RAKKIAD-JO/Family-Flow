import {
  BalanceIcon,
  ExpenseIcon,
  IncomeIcon,
} from "@/components/dashboard/dashboard-icons";
import { formatCurrency } from "@/lib/dashboard-formatters";
import type { DashboardSummary } from "@/types/dashboard";

type DashboardSummaryCardsProps = {
  summary: DashboardSummary | undefined;
  isLoading: boolean;
};

const summaryCards = [
  {
    key: "totalBalance",
    label: "Total balance",
    accent: "bg-slate-100 text-slate-600",
    icon: <BalanceIcon />,
  },
  {
    key: "totalIncome",
    label: "Total income",
    accent: "bg-emerald-100 text-emerald-700",
    icon: <IncomeIcon />,
  },
  {
    key: "totalExpense",
    label: "Total expenses",
    accent: "bg-rose-100 text-rose-700",
    icon: <ExpenseIcon />,
  },
] as const;

export function DashboardSummaryCards({
  summary,
  isLoading,
}: DashboardSummaryCardsProps) {
  return (
    <div className="mt-8 grid gap-4 xl:grid-cols-3">
      {summaryCards.map((item) => {
        const value = summary?.[item.key] ?? 0;

        return (
          <article
            key={item.label}
            className="rounded-[1.6rem] bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
          >
            <div className="flex items-center gap-4">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.accent}`}
              >
                {item.icon}
              </span>
              <p className="text-lg text-slate-600">{item.label}</p>
            </div>
            <p className="mt-5 text-3xl font-semibold text-slate-900">
              {isLoading ? "..." : formatCurrency(value)}
            </p>
          </article>
        );
      })}
    </div>
  );
}
