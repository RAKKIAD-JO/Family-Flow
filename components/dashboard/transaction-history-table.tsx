import { formatCurrency, formatDate } from "@/lib/dashboard-formatters";
import type { TransactionItem } from "@/types/dashboard";

type TransactionHistoryTableProps = {
  transactions: TransactionItem[];
};

export function TransactionHistoryTable({
  transactions,
}: TransactionHistoryTableProps) {
  return (
    <article
      id="history"
      className="mt-8 rounded-[1.8rem] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
    >
      <h2 className="text-3xl font-semibold">History Transaction</h2>

      <div className="mt-8 overflow-hidden rounded-[1.4rem] border border-slate-100">
        <div className="grid grid-cols-[1.1fr_0.7fr_0.7fr_0.9fr] gap-4 bg-slate-200/90 px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">
          <span>Detail</span>
          <span>Category</span>
          <span>Account</span>
          <span className="text-right">Amount</span>
        </div>

        <div className="divide-y divide-slate-100">
          {transactions.length === 0 ? (
            <div className="px-5 py-10 text-center text-slate-500">
              No transactions yet.
            </div>
          ) : (
            transactions.map((item) => (
              <div
                key={item.transaction_id}
                className="grid grid-cols-1 gap-3 px-5 py-4 text-sm text-slate-600 md:grid-cols-[1.1fr_0.7fr_0.7fr_0.9fr]"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {item.description?.trim() || "Transaction"}
                  </p>
                  <p>{formatDate(item.date)}</p>
                </div>

                <div className="flex items-center">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.category.type === "INCOME"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {item.category.name}
                  </span>
                </div>

                <div className="flex items-center">{item.account.name}</div>

                <div
                  className={`flex items-center justify-start font-semibold md:justify-end ${
                    item.category.type === "INCOME"
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {item.category.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(item.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </article>
  );
}
