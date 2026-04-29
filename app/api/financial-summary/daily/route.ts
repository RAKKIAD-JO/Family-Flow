import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticate } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const userId = await authenticate(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const sp = req.nextUrl.searchParams;
    const groupBy = sp.get("groupBy") || "daily"; // รับค่า: daily, monthly, yearly
    const from = sp.get("from");
    const to = sp.get("to");

    // 1. ดึงข้อมูลจาก DB
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

    // 2. Logic การจัดกลุ่ม (Grouping Logic)
    const summaryMap = new Map<string, any>();

    transactions.forEach((t) => {
      const date = t.date;
      let groupKey = "";

      // สร้าง Key ตามเงื่อนไขที่ User เลือก
      if (groupBy === "yearly") {
        groupKey = `${date.getFullYear()}`; // "2026"
      } else if (groupBy === "monthly") {
        groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // "2026-04"
      } else {
        groupKey = date.toISOString().split("T")[0]; // "2026-04-29" (Daily)
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
      if (t.category.type === "INCOME") {
        data.income += t.amount;
      } else {
        data.expense += t.amount;
      }
      data.count += 1;
    });

    // 3. แปลงเป็น Array เพื่อส่งให้ Frontend
    const result = Array.from(summaryMap.values()).map(item => ({
      ...item,
      net: item.income - item.expense
    }));

    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}