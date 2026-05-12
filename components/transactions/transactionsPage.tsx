"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/dashboard-formatters";
import { AccountOption, CategoryOption } from "@/types/sidebar";

type TransactionRecord = {
  transaction_id: number;
  amount: number;
  description: string | null;
  date: string;
  category: {
    category_id: number;
    name: string;
    type: "INCOME" | "EXPENSE";
  };
  account: {
    account_id: number;
    name: string;
    currency: string;
  };
  tags?: Array<{
    tag?: {
      name: string;
    };
  }>;
};

type TransactionsResponse = {
  data: TransactionRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

const initialPagination = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 1,
};

function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState(initialPagination);
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadFilterOptions() {
      try {
        setFiltersLoading(true);

        const [accountsRes, categoriesRes] = await Promise.all([
          fetch("/api/account/list", {
            method: "GET",
            credentials: "include",
          }),
          fetch("/api/categories/list", {
            method: "GET",
            credentials: "include",
          }),
        ]);

        if (!isMounted) {
          return;
        }

        if (accountsRes.ok) {
          const accountsResult = await accountsRes.json();
          setAccounts(accountsResult.data ?? []);
        }

        if (categoriesRes.ok) {
          const categoriesResult = await categoriesRes.json();
          setCategories(categoriesResult.data ?? []);
        }
      } catch {
        if (isMounted) {
          toast.error("Filter options could not be loaded");
        }
      } finally {
        if (isMounted) {
          setFiltersLoading(false);
        }
      }
    }

    void loadFilterOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadTransactions() {
      try {
        setLoading(true);
        setError(null);

        const searchParams = new URLSearchParams({
          page: String(page),
          pageSize: "10",
        });

        if (accountId) {
          searchParams.set("accountId", accountId);
        }

        if (categoryId) {
          searchParams.set("categoryId", categoryId);
        }

        if (from) {
          searchParams.set("from", from);
        }

        if (to) {
          searchParams.set("to", to);
        }

        const res = await fetch(`/api/transactions/list?${searchParams.toString()}`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          const message =
            res.status === 401
              ? "Please log in to view your transactions"
              : "Failed to load transactions";

          if (isMounted) {
            setError(message);
          }

          toast.error(message);
          return;
        }

        const result: TransactionsResponse = await res.json();

        if (!isMounted) {
          return;
        }

        setTransactions(result.data ?? []);
        setPagination(result.pagination ?? initialPagination);
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

    void loadTransactions();

    return () => {
      isMounted = false;
    };
  }, [accountId, categoryId, from, page, to]);

  const totals = useMemo(() => {
    const income = transactions
      .filter((item) => item.category.type === "INCOME")
      .reduce((sum, item) => sum + item.amount, 0);
    const expense = transactions
      .filter((item) => item.category.type === "EXPENSE")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      income,
      expense,
      count: transactions.length,
    };
  }, [transactions]);

  const onResetFilters = () => {
    setAccountId("");
    setCategoryId("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
            Family Flow
          </p>
          <h2 className="text-3xl font-semibold text-stone-900">Transactions</h2>
          <p className="mt-2 text-sm text-stone-500">
            Review family activity, track spending, and filter by account or category.
          </p>
        </div>
        <a
          href="/dashboard"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-stone-600 shadow-sm transition hover:bg-stone-50"
        >
          <Icon icon="material-symbols:arrow-back-rounded" width="18" height="18" />
          Back to dashboard
        </a>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <article className="rounded-3xl bg-white p-6 shadow-md">
          <p className="text-sm font-medium text-stone-500">Visible Transactions</p>
          <p className="mt-2 text-3xl font-semibold text-stone-900">
            {pagination.total}
          </p>
          <p className="mt-2 text-sm text-stone-400">Across your current filters</p>
        </article>
        <article className="rounded-3xl bg-white p-6 shadow-md">
          <p className="text-sm font-medium text-stone-500">Visible Income</p>
          <p className="mt-2 text-3xl font-semibold text-green-600">
            {formatCurrency(totals.income)}
          </p>
          <p className="mt-2 text-sm text-stone-400">From this page of results</p>
        </article>
        <article className="rounded-3xl bg-white p-6 shadow-md">
          <p className="text-sm font-medium text-stone-500">Visible Expense</p>
          <p className="mt-2 text-3xl font-semibold text-rose-600">
            {formatCurrency(totals.expense)}
          </p>
          <p className="mt-2 text-sm text-stone-400">From this page of results</p>
        </article>
      </div>

      <section className="rounded-[28px] bg-white p-6 shadow-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-stone-900">Filters</h3>
            <p className="mt-1 text-sm text-stone-500">
              Narrow the list by account, category, or date range.
            </p>
          </div>

          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-200"
          >
            <Icon icon="material-symbols:restart-alt-rounded" width="18" height="18" />
            Reset filters
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2 text-sm font-medium text-stone-700">
            Account
            <select
              value={accountId}
              onChange={(event) => {
                setAccountId(event.target.value);
                setPage(1);
              }}
              disabled={filtersLoading}
              className="w-full rounded-2xl border border-stone-200 bg-[#f8f9ff] px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-green-500"
            >
              <option value="">All accounts</option>
              {accounts.map((account) => (
                <option key={account.account_id} value={account.account_id}>
                  {account.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-stone-700">
            Category
            <select
              value={categoryId}
              onChange={(event) => {
                setCategoryId(event.target.value);
                setPage(1);
              }}
              disabled={filtersLoading}
              className="w-full rounded-2xl border border-stone-200 bg-[#f8f9ff] px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-green-500"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.name} ({category.type})
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-stone-700">
            From
            <input
              type="date"
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-2xl border border-stone-200 bg-[#f8f9ff] px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-green-500"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-stone-700">
            To
            <input
              type="date"
              value={to}
              onChange={(event) => {
                setTo(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-2xl border border-stone-200 bg-[#f8f9ff] px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-green-500"
            />
          </label>
        </div>
      </section>

      <section className="rounded-[28px] bg-white p-6 shadow-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-stone-900">All Transactions</h3>
            <p className="mt-1 text-sm text-stone-500">
              Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
            </p>
          </div>
          <div className="rounded-full bg-[#f8f9ff] px-4 py-2 text-sm text-stone-500">
            Showing {totals.count} items on this page
          </div>
        </div>

        {loading ? (
          <div className="mt-6 space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-3xl bg-[#f8f9ff]"
              />
            ))}
          </div>
        ) : error ? (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-4 py-10 text-center text-sm text-red-700">
            {error}
          </div>
        ) : transactions.length === 0 ? (
          <div className="mt-6 rounded-3xl bg-[#f8f9ff] px-4 py-10 text-center text-sm text-stone-500">
            No transactions found for the selected filters.
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-3xl border border-stone-100">
            <div className="hidden grid-cols-[1.4fr_1fr_1fr_0.8fr_0.8fr] gap-4 bg-[#f8f9ff] px-6 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-stone-500 lg:grid">
              <p>Details</p>
              <p>Account</p>
              <p>Date</p>
              <p>Type</p>
              <p className="text-right">Amount</p>
            </div>

            <div className="divide-y divide-stone-100">
              {transactions.map((item) => (
                <article
                  key={item.transaction_id}
                  className="grid gap-4 px-6 py-5 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr_0.8fr] lg:items-center"
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
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-stone-800">
                      {item.account.name}
                    </p>
                    <p className="text-xs text-stone-400">{item.account.currency}</p>
                  </div>

                  <p className="text-sm text-stone-600">{formatDate(item.date)}</p>

                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        item.category.type === "INCOME"
                          ? "bg-[#eaf7f1] text-green-700"
                          : "bg-[#fff1f4] text-rose-700"
                      }`}
                    >
                      {item.category.type}
                    </span>
                  </div>

                  <p
                    className={`text-right text-lg font-semibold ${
                      item.category.type === "INCOME"
                        ? "text-green-600"
                        : "text-rose-600"
                    }`}
                  >
                    {item.category.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(item.amount)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-500">
            Total records: {pagination.total}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              className="rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-stone-600">
              {pagination.page} / {Math.max(pagination.totalPages, 1)}
            </span>
            <button
              type="button"
              disabled={page >= pagination.totalPages || loading}
              onClick={() =>
                setPage((current) =>
                  Math.min(current + 1, Math.max(pagination.totalPages, 1)),
                )
              }
              className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </section>
  );
}

export default TransactionsPage;
