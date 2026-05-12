"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  formatCurrency,
  formatDate,
} from "@/lib/dashboard-formatters";
import {
  DashboardPayload,
  TransactionItem,
  TransactionsPayload,
} from "@/types/dashboard";

type SummaryCardItem = {
  title: string;
  value: number;
  subtext: string;
  icon: string;
  iconClassName: string;
  panelClassName: string;
  textClassName: string;
};

function CardData() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const [summaryRes, transactionsRes] = await Promise.all([
          fetch("/api/financial-summary/dashborad", {
            method: "GET",
            credentials: "include",
          }),
          fetch("/api/transactions/list?pageSize=5", {
            method: "GET",
            credentials: "include",
          }),
        ]);

        if (!summaryRes.ok) {
          const message =
            summaryRes.status === 401
              ? "Please log in to view your dashboard"
              : "Failed to load dashboard";

          if (isMounted) {
            setError(message);
          }

          toast.error(message);
          return;
        }

        const dashboardResult: DashboardPayload = await summaryRes.json();
        const transactionsResult: TransactionsPayload | null =
          transactionsRes.ok ? await transactionsRes.json() : null;

        if (!isMounted) {
          return;
        }

        setData(dashboardResult);
        setTransactions(transactionsResult?.data ?? []);

        if (!transactionsRes.ok) {
          toast.error("Recent transactions could not be loaded");
        }
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }

        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "Something went wrong";

        setError(message);
        toast.error(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="min-h-40 animate-pulse rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="h-3 w-24 rounded-full bg-stone-200" />
                  <div className="h-8 w-40 rounded-full bg-stone-300" />
                  <div className="h-3 w-28 rounded-full bg-stone-200" />
                </div>
                <div className="h-12 w-12 rounded-2xl bg-stone-200" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="min-h-85 animate-pulse rounded-3xl border border-stone-200 bg-white p-6 shadow-sm" />
          <div className="min-h-85 animate-pulse rounded-3xl border border-stone-200 bg-white p-6 shadow-sm" />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="min-h-80 animate-pulse rounded-3xl border border-stone-200 bg-white p-6 shadow-sm" />
          <div className="min-h-80 animate-pulse rounded-3xl border border-stone-200 bg-white p-6 shadow-sm" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-white p-5 text-sm text-stone-500">
        No dashboard data available.
      </div>
    );
  }

  const summaryCards: SummaryCardItem[] = [
    {
      title: "Total Balance",
      value: data.summary.totalBalance,
      subtext: "Across all family accounts",
      icon: "material-symbols:account-balance-wallet-outline-rounded",
      iconClassName: "bg-gray-100 text-[#00a63e]",
      panelClassName: "bg-white",
      textClassName: "text-green-600",
    },
    {
      title: "Total Income",
      value: data.summary.totalIncome,
      subtext: "All recorded income",
      icon: "material-symbols:trending-up-rounded",
      iconClassName: "bg-gray-100 text-[#00a63e]",
      panelClassName: "bg-white",
      textClassName: "text-green-600",
    },
    {
      title: "Total Expense",
      value: data.summary.totalExpense,
      subtext: "All recorded expenses",
      icon: "material-symbols:trending-down-rounded",
      iconClassName: "bg-gray-100 text-[#ec003f]",
      panelClassName: "bg-white",
      textClassName: "text-rose-600",
    },
  ];

  const maxTrendValue = Math.max(
    ...data.trend.map((item) => item.income + item.expense),
    1,
  );
  const totalFlow = data.summary.totalIncome + data.summary.totalExpense;
  const incomeShare =
    totalFlow > 0
      ? Math.round((data.summary.totalIncome / totalFlow) * 100)
      : 0;
  const expenseShare = totalFlow > 0 ? 100 - incomeShare : 0;
  const expenseDays = data.trend.filter((item) => item.expense > 0);
  const highestExpenseDay = expenseDays.reduce(
    (current, item) => (item.expense > current.expense ? item : current),
    expenseDays[0] ?? data.trend[0],
  );
  const positiveDays = data.trend.filter((item) => item.net >= 0).length;
  const topExpenseTransaction = transactions
    .filter((item) => item.category.type === "EXPENSE")
    .sort((a, b) => b.amount - a.amount)[0];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
            Family Flow
          </p>
          <h2 className="text-3xl font-semibold text-stone-900">
            Welcome back, {data.user.name}
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Here&apos;s your family cash flow snapshot for this week.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-stone-500 shadow-sm">
          <Icon icon="material-symbols:payments-outline-rounded" width="18" height="18" />
          Currency: {data.summary.currency}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <article
            key={card.title}
            className={`min-h-40 rounded-3xl p-6 shadow-md ${card.panelClassName}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-stone-500">
                  {card.title}
                </p>
                <p className={`text-3xl font-semibold ${card.textClassName}`}>
                  {formatCurrency(card.value)}
                </p>
                <p className="text-sm text-stone-400">{card.subtext}</p>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconClassName}`}
              >
                <Icon icon={card.icon} width="24" height="24" />
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="rounded-[28px] bg-white p-6 shadow-md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-[32px] leading-none font-semibold text-stone-900">
                7-Day Cash Flow Trend
              </h3>
              <p className="mt-2 text-sm text-stone-500">
                Compare income and expenses across the last 7 days.
              </p>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-stone-500">
                <span className="h-3 w-3 rounded-full bg-[#bfe4d6]" />
                Income
              </div>
              <div className="flex items-center gap-2 text-stone-500">
                <span className="h-3 w-3 rounded-full bg-[#dfc9c6]" />
                Expenses
              </div>
              <div className="rounded-full bg-stone-100 px-3 py-1.5 text-stone-600">
                This week
              </div>
            </div>
          </div>

          <div className="mt-8 grid h-65 grid-cols-7 items-end gap-3">
            {data.trend.map((item) => {
              const incomeHeight = `${(item.income / maxTrendValue) * 100}%`;
              const expenseHeight = `${(item.expense / maxTrendValue) * 100}%`;

              return (
                <div key={item.date} className="flex h-full flex-col items-center gap-3">
                  <div className="flex h-full w-full items-end justify-center gap-2 rounded-3xl bg-[#f8f9ff] px-2 py-4">
                    <div
                      className="w-5 rounded-full bg-[#dfc9c6] transition-all"
                      style={{ height: expenseHeight }}
                    />
                    <div
                      className="w-5 rounded-full bg-[#bfe4d6] transition-all"
                      style={{ height: incomeHeight }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-stone-700">{item.label}</p>
                    <p className="text-xs text-stone-400">
                      {formatCurrency(item.net)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-3xl bg-[#f8f9ff] px-4 py-3 text-sm text-stone-600">
            Highest spending day:{" "}
            <span className="font-semibold text-stone-900">
              {highestExpenseDay?.label ?? "-"}
            </span>
            {" • "}
            Positive cash flow on{" "}
            <span className="font-semibold text-stone-900">
              {positiveDays} of 7 days
            </span>
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-md">
          <div>
            <h3 className="text-[32px] leading-none font-semibold text-stone-900">
              Income vs Expenses
            </h3>
            <p className="mt-2 text-sm text-stone-500">
              Snapshot of how your money is split right now.
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <div
              className="relative flex h-56 w-56 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#068f5c 0% ${incomeShare}%, #f1f5f9 ${incomeShare}% ${incomeShare}%, #e4476b ${incomeShare}% 100%)`,
              }}
            >
              <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white text-center">
                <p className="text-4xl font-semibold text-stone-900">
                  {incomeShare}%
                </p>
                <p className="text-sm font-medium text-stone-500">Income share</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-[#f5fbf8] px-4 py-4 text-center">
              <p className="text-sm text-stone-500">Income</p>
              <p className="mt-1 text-3xl font-semibold text-green-600">
                {incomeShare}%
              </p>
            </div>
            <div className="rounded-3xl bg-[#fff6f7] px-4 py-4 text-center">
              <p className="text-sm text-stone-500">Expenses</p>
              <p className="mt-1 text-3xl font-semibold text-rose-600">
                {expenseShare}%
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-[28px] bg-white p-6 shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-stone-900">
                Recent Transactions
              </h3>
              <p className="mt-1 text-sm text-stone-500">
                Keep an eye on the latest family activity.
              </p>
            </div>

            <a
              href="/transactions"
              className="rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-200"
            >
              View all
            </a>
          </div>

          <div className="mt-6 space-y-3">
            {transactions.length === 0 ? (
              <div className="rounded-3xl bg-[#f8f9ff] px-4 py-10 text-center text-sm text-stone-500">
                No recent transactions
              </div>
            ) : (
              transactions.map((item) => (
                <article
                  key={item.transaction_id}
                  className="flex flex-col gap-3 rounded-3xl bg-[#f8f9ff] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 flex h-11 w-11 items-center justify-center rounded-2xl ${
                        item.category.type === "INCOME"
                          ? "bg-[#eaf7f1] text-green-600"
                          : "bg-[#fff1f4] text-rose-600"
                      }`}
                    >
                      <Icon
                        icon={
                          item.category.type === "INCOME"
                            ? "material-symbols:trending-up-rounded"
                            : "material-symbols:trending-down-rounded"
                        }
                        width="22"
                        height="22"
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-stone-900">
                        {item.category.name}
                      </p>
                      <p className="text-sm text-stone-500">
                        {item.description || "No description"}
                      </p>
                      <p className="mt-1 text-xs text-stone-400">
                        {item.account.name} • {formatDate(item.date)}
                      </p>
                    </div>
                  </div>

                  <p
                    className={`text-lg font-semibold ${
                      item.category.type === "INCOME"
                        ? "text-green-600"
                        : "text-rose-600"
                    }`}
                  >
                    {item.category.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(item.amount)}
                  </p>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-md">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
              This Week Insight
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-stone-900">
              Your family spending story
            </h3>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-[#f5fbf8] p-4">
              <p className="text-sm leading-6 text-stone-600">
                You kept more money than you spent on{" "}
                <span className="font-semibold text-stone-900">
                  {positiveDays} of the last 7 days
                </span>
                .
              </p>
            </div>

            <div className="rounded-3xl bg-[#fff7ef] p-4">
              <p className="text-sm leading-6 text-stone-600">
                Highest spending happened on{" "}
                <span className="font-semibold text-stone-900">
                  {highestExpenseDay?.label ?? "-"}
                </span>
                , so that may be a good day to review recurring costs.
              </p>
            </div>

            <div className="rounded-3xl bg-[#f8f9ff] p-4">
              <p className="text-sm leading-6 text-stone-600">
                {topExpenseTransaction
                  ? `Largest recent expense was ${topExpenseTransaction.category.name} for ${formatCurrency(topExpenseTransaction.amount)}.`
                  : "Add more transactions to unlock smarter spending insights."}
              </p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

export default CardData;
