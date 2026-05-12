"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import {
  AccountOption,
  CategoryOption,
  CurrentUser,
  TransactionForm,
} from "@/types/sidebar";
import { toast } from "sonner";

const initialForm: TransactionForm = {
  amount: 0,
  description: "",
  date: new Date().toISOString().split("T")[0],
  isPersonal: true,
  accountId: 0,
  categoryId: 0,
  tags: [],
};

function Slidebar() {
  const router = useRouter();
  const [userName, setUserName] = useState<CurrentUser | null>(null);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [form, setForm] = useState<TransactionForm>(initialForm);
  const [tagsInput, setTagsInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  async function getUser() {
    try {
      const res = await fetch("/api/auth/users/get_user", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        setUserName(null);
        return;
      }

      const result = await res.json();
      setUserName(result.data);
    } catch {
      setUserName(null);
    }
  }

  const openModal = async () => {
    setIsOpen(true);

    if (accounts.length > 0 && categories.length > 0) {
      return;
    }

    setIsLoadingOptions(true);

    try {
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

      if (!accountsRes.ok || !categoriesRes.ok) {
        throw new Error("Failed to load form options");
      }

      const accountsResult = await accountsRes.json();
      const categoriesResult = await categoriesRes.json();
      const nextAccounts: AccountOption[] = accountsResult.data ?? [];
      const nextCategories: CategoryOption[] = categoriesResult.data ?? [];

      setAccounts(nextAccounts);
      setCategories(nextCategories);

      setForm((prev) => ({
        ...prev,
        accountId:
          prev.accountId || nextAccounts[0]?.account_id || initialForm.accountId,
        categoryId:
          prev.categoryId ||
          nextCategories[0]?.category_id ||
          initialForm.categoryId,
      }));
    } catch {
      toast.error("Cannot load accounts or categories");
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsOpen(false);
  };

  const resetForm = () => {
    setForm({
      ...initialForm,
      accountId: accounts[0]?.account_id || 0,
      categoryId: categories[0]?.category_id || 0,
    });
    setTagsInput("");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (name === "amount" || name === "accountId" || name === "categoryId") {
      setForm((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setTagsInput(nextValue);
    setForm((prev) => ({
      ...prev,
      tags: nextValue
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.amount <= 0) {
      toast.error("Please enter an amount greater than 0");
      return;
    }

    if (!form.accountId || !form.categoryId) {
      toast.error("Please select both an account and a category");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/transactions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          date: new Date(form.date).toISOString(),
        }),
      });

      if (res.ok) {
        toast.success("Transaction saved");
        resetForm();
        setIsOpen(false);
        return;
      }

      const errorData = await res.json();
      toast.error(`Save failed: ${errorData.message}`);
    } catch {
      toast.error("Cannot connect to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/users/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        toast.error("Logout failed");
        return;
      }

      toast.success("Logged out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Cannot connect to server");
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void getUser();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isSubmitting]);

  return (
    <div className="h-full rounded-md shadow-md bg-white p-4 ">
      <div className="flex items-center gap-4 p-4">
        <div>
          <img src="/Logo.png" alt="logo" className="w-10 rounded-full " />
        </div>
        <div>
          <h1 className=" font-bold">My App</h1>
          <p className="text-sm text-gray-500">{userName?.name}</p>
        </div>
      </div>

      <div className="mt-4 rounded bg-green-500 px-4 py-2 text-white transition hover:bg-green-600">
        <button
          type="button"
          onClick={openModal}
          className="flex w-full cursor-pointer items-center gap-2"
        >
          <Icon icon="lucide:plus" width="20" height="20" />
          <p>Add transaction</p>
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-transaction-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-green-600">
                  Family flow
                </p>
                <h2
                  id="add-transaction-title"
                  className="text-2xl font-semibold text-slate-900"
                >
                  Add transaction
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Fill in the basics and save in one step.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close modal"
              >
                <Icon icon="lucide:x" width="20" height="20" />
              </button>
            </div>

            {isLoadingOptions ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Loading form options...
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    Amount
                    <input
                      name="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.amount || ""}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                      required
                    />
                  </label>

                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    Date
                    <input
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                      required
                    />
                  </label>
                </div>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Description
                  <input
                    name="description"
                    type="text"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Groceries, salary, electric bill..."
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  />
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    Account
                    <select
                      name="accountId"
                      value={form.accountId || ""}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                      required
                    >
                      <option value="" disabled>
                        Select account
                      </option>
                      {accounts.map((account) => (
                        <option
                          key={account.account_id}
                          value={account.account_id}
                        >
                          {account.name} ({account.currency})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    Category
                    <select
                      name="categoryId"
                      value={form.categoryId || ""}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                      required
                    >
                      <option value="" disabled>
                        Select category
                      </option>
                      {categories.map((category) => (
                        <option
                          key={category.category_id}
                          value={category.category_id}
                        >
                          {category.name} ({category.type})
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Tags
                  <input
                    name="tags"
                    type="text"
                    value={tagsInput}
                    onChange={handleTagsChange}
                    placeholder="home, food, urgent"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  />
                  <span className="block text-xs font-normal text-slate-500">
                    Separate tags with commas.
                  </span>
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                  <input
                    name="isPersonal"
                    type="checkbox"
                    checked={form.isPersonal}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                  />
                  Mark this as a personal transaction
                </label>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoadingOptions}
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "Saving..." : "Save transaction"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div>
        <ul className="mt-4 space-y-2">
          <div className="flex items-center gap-2 rounded px-4 py-2 text-gray-700 hover:bg-gray-200">
            <Icon icon="material-symbols:dashboard" width="24" height="24" />
            <a
              href="/dashboard"
              className="block rounded px-4 py-2 text-gray-700 hover:bg-gray-200"
            >
              Dashboard
            </a>
          </div>
          <div className="flex items-center gap-2 rounded px-4 py-2 text-gray-700 hover:bg-gray-200">
            <Icon
              icon="material-symbols:account-balance"
              width="24"
              height="24"
            />
            <a
              href="/transactions"
              className="block rounded px-4 py-2 text-gray-700 hover:bg-gray-200"
            >
              Transactions
            </a>
          </div>
          <div className="flex items-center gap-2 rounded px-4 py-2 text-gray-700 hover:bg-gray-200">
            <Icon icon="material-symbols:credit-card" width="24" height="24" />
            <a
              href="/accounts"
              className="block rounded px-4 py-2 text-gray-700 hover:bg-gray-200"
            >
              Accounts
            </a>
          </div>
        </ul>
      </div>

      <div className="mt-6 border-t border-stone-200 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded px-4 py-3 text-left text-red-600 transition hover:bg-red-50"
        >
          <Icon icon="material-symbols:logout-rounded" width="24" height="24" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Slidebar;
