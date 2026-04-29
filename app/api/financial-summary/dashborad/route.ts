import { db } from "@/lib/db";
import { startOfMonth, endOfMonth, format } from "date-fns";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = parseInt(searchParams.get("userId") || "0");

  // กำหนดช่วงเวลา (เช่น เดือนปัจจุบัน)
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  // 1. ดึงข้อมูล Transactions ทั้งหมดของเดือนนี้ พร้อม Join Category
  const transactions = await db.transactions.findMany({
    // where: {
    //   userId: userId,
    // //   date: { gte: start, lte: end },
    // },
    include: {
      category: true, // Join เพื่อดูว่าเป็น INCOME หรือ EXPENSE
    },
  });

  // 2. Logic การคำนวณ (Programmer Logic)
  let totalIncome = 0;
  let totalExpense = 0;
  const dailyStats: Record<string, { income: number; expense: number }> = {};

  transactions.forEach((t) => {
    const day = format(t.date, "yyyy-MM-dd"); // จัดกลุ่มตามวัน
    const amount = t.amount;

    // เริ่มต้น object ของวันนั้นๆ ถ้ายังไม่มี
    if (!dailyStats[day]) {
      dailyStats[day] = { income: 0, expense: 0 };
    }

    if (t.category.type === "INCOME") {
      totalIncome += amount;
      dailyStats[day].income += amount;
    } else {
      totalExpense += amount;
      dailyStats[day].expense += amount;
    }
  });

  // 3. ดึงยอดเงินรวมจากทุกบัญชี (Total Balance)
  const accounts = await db.accounts.aggregate({
    where: { userId: userId },
    _sum: { balance: true },
  });

  return Response.json({
    summary: {
      totalBalance: accounts._sum.balance || 0,
      monthlyIncome: totalIncome,
      monthlyExpense: totalExpense,
      netChange: totalIncome - totalExpense,
    },
    dailyTrends: dailyStats, // ข้อมูลสำหรับวาดกราฟรายวัน
  });
}