"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/dashboard-formatters";
import { AccountOption } from "@/types/sidebar";

type CreateAccountForm = {
  name: string;
  balance: string;
  currency: string;
};

const initialForm: CreateAccountForm = {
  name: "",
  balance: "",
  currency: "THB",
};

function AccountsPage() {
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateAccountForm>(initialForm);

  async function loadAccounts() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/account/list", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        const message =
          res.status === 401
            ? "Please log in to view your accounts"
            : "Failed to load accounts";

        setError(message);
        return;
      }

      const result = await res.json();
      setAccounts(result.data ?? []);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAccounts();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const totals = useMemo(() => {
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

    return {
      totalBalance,
      accountCount: accounts.length,
    };
  }, [accounts]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const fillCreditCardTemplate = () => {
    setForm({
      name: "KBank Platinum Credit Card",
      balance: "50000",
      currency: "THB",
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Please enter an account name");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/account/create_account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: form.name.trim(),
          balance: form.balance ? Number(form.balance) : 0,
          currency: form.currency.trim().toUpperCase(),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Failed to create account");
        return;
      }

      toast.success("Account created successfully");
      setForm(initialForm);
      await loadAccounts();
    } catch {
      toast.error("Cannot connect to server");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
            Family Flow
          </p>
          <h2 className="text-3xl font-semibold text-stone-900">Accounts</h2>
          <p className="mt-2 max-w-2xl text-sm text-stone-500">
            Create an account for a bank, wallet, or credit card. For credit cards
            in the current system, use the opening balance as your available limit.
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
          <p className="text-sm font-medium text-stone-500">Total Accounts</p>
          <p className="mt-2 text-3xl font-semibold text-stone-900">
            {totals.accountCount}
          </p>
          <p className="mt-2 text-sm text-stone-400">Tracked in your family flow</p>
        </article>
        <article className="rounded-3xl bg-white p-6 shadow-md">
          <p className="text-sm font-medium text-stone-500">Combined Balance</p>
          <p className="mt-2 text-3xl font-semibold text-green-600">
            {formatCurrency(totals.totalBalance)}
          </p>
          <p className="mt-2 text-sm text-stone-400">Across every account</p>
        </article>
        <article className="rounded-3xl bg-white p-6 shadow-md">
          <p className="text-sm font-medium text-stone-500">Credit Card Tip</p>
          <p className="mt-2 text-lg font-semibold text-stone-900">
            Start with available credit
          </p>
          <p className="mt-2 text-sm text-stone-400">
            Example: enter `50000` if the card has THB 50,000 available.
          </p>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1.4fr]">
        <section className="rounded-[28px] bg-white p-6 shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
                Create Account
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-stone-900">
                Add a credit card account
              </h3>
              <p className="mt-2 text-sm text-stone-500">
                Set up a card account so expenses can reduce the available balance.
              </p>
            </div>

            <button
              type="button"
              onClick={fillCreditCardTemplate}
              className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-200"
            >
              <Icon icon="material-symbols:credit-card-rounded" width="18" height="18" />
              Use template
            </button>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <label className="space-y-2 text-sm font-medium text-stone-700">
              Account name
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="SCB Family Credit Card"
                className="w-full rounded-2xl border border-stone-200 bg-[#f8f9ff] px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-green-500"
                required
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-stone-700">
              Opening balance / available limit
              <input
                name="balance"
                type="number"
                min="0"
                step="0.01"
                value={form.balance}
                onChange={handleChange}
                placeholder="50000"
                className="w-full rounded-2xl border border-stone-200 bg-[#f8f9ff] px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-green-500"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-stone-700">
              Currency
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="w-full rounded-2xl border border-stone-200 bg-[#f8f9ff] px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-green-500"
              >
                <option value="THB">THB</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </label>

            <div className="rounded-3xl bg-[#f8f9ff] p-4 text-sm text-stone-600">
              For credit cards in this version, the balance acts like available
              spending room. Expense transactions reduce it, and income transactions
              increase it.
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Icon icon="material-symbols:add-card-rounded" width="18" height="18" />
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-md">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
              Account List
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-stone-900">
              Your current accounts
            </h3>
            <p className="mt-2 text-sm text-stone-500">
              Review balances and confirm the accounts you want to track.
            </p>
          </div>

          {loading ? (
            <div className="mt-6 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-3xl bg-[#f8f9ff]"
                />
              ))}
            </div>
          ) : error ? (
            <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-4 py-10 text-center text-sm text-red-700">
              {error}
            </div>
          ) : accounts.length === 0 ? (
            <div className="mt-6 rounded-3xl bg-[#f8f9ff] px-4 py-10 text-center text-sm text-stone-500">
              No accounts yet. Create your first account to start tracking money.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {accounts.map((account) => (
                <article
                  key={account.account_id}
                  className="flex flex-col gap-4 rounded-3xl bg-[#f8f9ff] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-stone-700">
                      <Icon
                        icon={
                          account.name.toLowerCase().includes("card")
                            ? "material-symbols:credit-card-rounded"
                            : "material-symbols:account-balance-wallet-outline-rounded"
                        }
                        width="22"
                        height="22"
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-stone-900">{account.name}</p>
                      <p className="text-sm text-stone-500">
                        Currency: {account.currency}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-sm text-stone-500">Current balance</p>
                    <p className="text-xl font-semibold text-stone-900">
                      {formatCurrency(account.balance)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default AccountsPage;
