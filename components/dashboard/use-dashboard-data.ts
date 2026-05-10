"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type {
  DashboardPayload,
  TransactionItem,
  TransactionsPayload,
} from "@/types/dashboard";

type UseDashboardDataResult = {
  dashboard: DashboardPayload | null;
  transactions: TransactionItem[];
  isLoading: boolean;
};

export function useDashboardData(): UseDashboardDataResult {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const [dashboardRes, transactionsRes] = await Promise.all([
          fetch("/api/financial-summary/dashborad", {
            credentials: "include",
            cache: "no-store",
          }),
          fetch("/api/transactions/list?pageSize=5", {
            credentials: "include",
            cache: "no-store",
          }),
        ]);

        if (dashboardRes.status === 401 || transactionsRes.status === 401) {
          router.replace("/");
          return;
        }

        if (!dashboardRes.ok || !transactionsRes.ok) {
          throw new Error("Failed to load dashboard");
        }

        const dashboardData = (await dashboardRes.json()) as DashboardPayload;
        const transactionsData =
          (await transactionsRes.json()) as TransactionsPayload;

        if (!isMounted) {
          return;
        }

        setDashboard(dashboardData);
        setTransactions(transactionsData.data ?? []);
      } catch {
        toast.error("Unable to load dashboard data.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return { dashboard, transactions, isLoading };
}
