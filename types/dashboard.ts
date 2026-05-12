export type DashboardUser = {
  id: number;
  name: string;
  email: string;
};

export type DashboardSummary = {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  currency: string;
};

export type DashboardTrend = {
  date: string;
  label: string;
  income: number;
  expense: number;
  net: number;
};

export type DashboardPayload = {
  user: DashboardUser;
  summary: DashboardSummary;
  trend: DashboardTrend[];
};

export type TransactionItem = {
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
};

export type TransactionsPayload = {
  data: TransactionItem[];
};

export type SummaryCardItem = {
  title: string;
  value: number;
  icon: string;
  iconClassName: string;
  panelClassName: string;
  textClassName: string;
};
