"use client";

import Link from "next/link";
import {
  DashboardIcon,
  TransactionIcon,
  WalletIcon,
} from "@/components/dashboard/dashboard-icons";
import type { DashboardUser } from "@/types/dashboard";

type DashboardSidebarProps = {
  user: DashboardUser | null;
  isLoggingOut: boolean;
  onLogout: () => void;
};

export function DashboardSidebar({
  user,
  isLoggingOut,
  onLogout,
}: DashboardSidebarProps) {
  return (
    <aside className="flex w-full flex-col rounded-[2rem] bg-white/85 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur lg:min-h-[calc(100vh-3rem)] lg:w-[290px]">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#caa96d,#8d5d22_70%)] text-lg font-semibold text-white shadow-inner">
          FF
        </div>
        <div>
          <p className="text-3xl font-semibold tracking-tight text-emerald-600">
            Family Flow
          </p>
          <p className="text-sm text-slate-500">{user?.name ?? "Loading..."}</p>
        </div>
      </div>

      <a
        href="#history"
        className="mt-10 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-xl font-medium text-white transition hover:bg-emerald-700"
      >
        + Transaction
      </a>

      <nav className="mt-12 space-y-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-4 text-emerald-600"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
            <DashboardIcon />
          </span>
          <span className="text-base font-medium">Dashboard</span>
        </Link>

        <div className="flex items-center gap-3 px-4 py-3 text-slate-400">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <WalletIcon />
          </span>
          <span className="text-base">Account</span>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 text-slate-400">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <TransactionIcon />
          </span>
          <span className="text-base">Transaction</span>
        </div>
      </nav>

      <button
        type="button"
        onClick={onLogout}
        disabled={isLoggingOut}
        className="mt-auto rounded-xl border border-red-400/80 bg-red-100 px-4 py-3 text-2xl font-medium text-red-600 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoggingOut ? "Logging out..." : "Log out"}
      </button>
    </aside>
  );
}
