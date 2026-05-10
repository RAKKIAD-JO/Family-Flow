import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticate } from "@/lib/auth";

type SummaryBucket = {
  label: string;
  income: number;
  expense: number;
  count: number;
};

export async function GET(req: NextRequest) {
  try {
    const userId = await authenticate(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const sp = req.nextUrl.searchParams;
    const groupBy = sp.get("groupBy") || "daily";
    
    // --- เริ่มส่วน Logic ตั้งค่า Default ---
    let from = sp.get("from");
    let to = sp.get("to");

    const now = new Date();
    const currentYear = now.getFullYear();

    if (!from) {
      if (groupBy === "daily") {
        // รายวัน: ย้อนหลัง 30 วันจากวันนี้
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        from = thirtyDaysAgo.toISOString().split("T")[0];
      } else if (groupBy === "monthly") {
        // รายเดือน: มกราคม - ธันวาคม ของปีปัจจุบัน
        from = `${currentYear}-01-01`;
        to = `${currentYear}-12-31`;
      }
      // ถ้าเป็น yearly ไม่ต้องใส่ from/to เพื่อให้เห็นประวัติทั้งหมด
    }
    // --- จบส่วน Logic ตั้งค่า Default ---

    const transactions = await db.transactions.findMany({
      where: {
        userId,
        ...(from || to ? {
          date: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        } : {}),
      },
      include: { category: { select: { type: true } } },
      orderBy: { date: "asc" },
    });

    const summaryMap = new Map<string, SummaryBucket>();

    transactions.forEach((t) => {
      const date = t.date;
      let groupKey = "";

      if (groupBy === "yearly") {
        groupKey = `${date.getFullYear()}`;
      } else if (groupBy === "monthly") {
        groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        groupKey = date.toISOString().split("T")[0];
      }

      if (!summaryMap.has(groupKey)) {
        summaryMap.set(groupKey, { 
          label: groupKey, 
          income: 0, 
          expense: 0, 
          count: 0 
        });
      }

      const data = summaryMap.get(groupKey);
      if (!data) {
        return;
      }

      if (t.category.type === "INCOME") {
        data.income += t.amount;
      } else {
        data.expense += t.amount;
      }
      data.count += 1;
    });

    const result = Array.from(summaryMap.values()).map(item => ({
      ...item,
      net: item.income - item.expense
    }));

    return NextResponse.json(result);

  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
