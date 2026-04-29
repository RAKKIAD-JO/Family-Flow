import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticate } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const userId = await authenticate(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // รวมรายรับทั้งหมด (INCOME)
    const incomeResult = await db.transactions.aggregate({
      where: {
        userId,
        category: {
          type: "INCOME",
        },
      },
      _sum: {
        amount: true,
      },
    });

    // รวมรายจ่ายทั้งหมด (EXPENSE)
    const expenseResult = await db.transactions.aggregate({
      where: {
        userId,
        category: {
          type: "EXPENSE",
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalIncome = incomeResult._sum.amount || 0;
    const totalExpense = expenseResult._sum.amount || 0;
    const netIncome = totalIncome - totalExpense;

    return NextResponse.json({
      totalIncome,
      totalExpense,
      netIncome,
      currency: "THB",
    });
  } catch (error) {
    console.error("Error fetching totals:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}