import { NextRequest, NextResponse } from "next/server";
import {
  eachDayOfInterval,
  endOfDay,
  format,
  startOfDay,
  subDays,
} from "date-fns";
import { db } from "@/lib/db";
import { authenticate } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const userId = await authenticate(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    const from = startOfDay(subDays(today, 6));
    const to = endOfDay(today);

    const [user, balanceResult, incomeResult, expenseResult, trendTransactions] =
      await Promise.all([
        db.users.findUnique({
          where: { user_id: userId },
          select: {
            user_id: true,
            name: true,
            email: true,
          },
        }),
        db.accounts.aggregate({
          where: {
            userId,
            deletedAt: null,
          },
          _sum: {
            balance: true,
          },
        }),
        db.transactions.aggregate({
          where: {
            userId,
            category: {
              type: "INCOME",
            },
          },
          _sum: {
            amount: true,
          },
        }),
        db.transactions.aggregate({
          where: {
            userId,
            category: {
              type: "EXPENSE",
            },
          },
          _sum: {
            amount: true,
          },
        }),
        db.transactions.findMany({
          where: {
            userId,
            date: {
              gte: from,
              lte: to,
            },
          },
          include: {
            category: {
              select: {
                type: true,
              },
            },
          },
          orderBy: {
            date: "asc",
          },
        }),
      ]);

    const trendMap = new Map<string, { income: number; expense: number }>();

    for (const day of eachDayOfInterval({ start: from, end: to })) {
      trendMap.set(format(day, "yyyy-MM-dd"), { income: 0, expense: 0 });
    }

    for (const item of trendTransactions) {
      const key = format(item.date, "yyyy-MM-dd");
      const current = trendMap.get(key);

      if (!current) {
        continue;
      }

      if (item.category.type === "INCOME") {
        current.income += item.amount;
      } else {
        current.expense += item.amount;
      }
    }

    const trend = Array.from(trendMap.entries()).map(([date, values]) => ({
      date,
      label: format(new Date(date), "EEE"),
      income: values.income,
      expense: values.expense,
      net: values.income - values.expense,
    }));

    const totalIncome = incomeResult._sum.amount || 0;
    const totalExpense = expenseResult._sum.amount || 0;

    return NextResponse.json({
      user: {
        id: user?.user_id ?? userId,
        name: user?.name ?? "Family Flow User",
        email: user?.email ?? "",
      },
      summary: {
        totalBalance: balanceResult._sum.balance || 0,
        totalIncome,
        totalExpense,
        netIncome: totalIncome - totalExpense,
        currency: "THB",
      },
      trend,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
